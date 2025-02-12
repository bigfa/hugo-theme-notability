import { farallonHelper } from "./utils";
interface farallonCommentOptions {
    actionDomain: string;
    postSelector?: string;
}

type Comment = {
    comment_id: string;
    comment_author_name: string;
    comment_author_url: string;
    comment_date: string;
    comment_content: string;
    comment_parent: string;
    avatar: string;
    children: Comment[];
};

export class farallonComment extends farallonHelper {
    loading: boolean = false;
    post_id: string = "";
    total: number = 0;
    total_paged: number = 1;
    paged: number = 1;
    actionDomain: string;
    postSelector: string;
    dateFormater: any;
    constructor(config: farallonCommentOptions) {
        super();
        this.postSelector = config.postSelector || ".post--ingle__comments";
        if (!document.querySelector(this.postSelector)) return;
        this.actionDomain = config.actionDomain;
        this.post_id = (
            document.querySelector(this.postSelector) as HTMLElement
        ).dataset.id as string;
        this.fetchComments();
        this.init();
    }

    renderComment(item: Comment, children: any = "", reply: boolean = true) {
        const replyHtml: string = reply
            ? `<div class="reply"><span class="comment-reply-link u-cursorPointer" onclick="return addComment.moveForm('comment-${
                  item.comment_id
              }', '${item.comment_id}', 'respond', '${
                  (document.querySelector(
                      ".post--ingle__comments"
                  ) as HTMLElement)!.dataset.id
              }')">回复</span></div>                            `
            : "";
        return `<li class="comment parent" itemtype="http://schema.org/Comment" data-id="${item.comment_id}" itemscope="" itemprop="comment" id="comment-${item.comment_id}">
                            <div class="comment-body">
                                <div class="comment-meta">
                                        <img src="${item.avatar}" class="avatar"  width=42 height=42 />
                                    <b class="fn">${item.comment_author_name}</b>
                                    <div class="comment-metadata">                                      
                                            <div class="comment--time" itemprop="datePublished" datetime="${item.comment_date}">${item.comment_date}</div>
                                            </div>
                                    </div>
                                <div class="comment-content" itemprop="description">
                                    ${item.comment_content}
                                </div>
                                ${replyHtml}
                            </div>
                            ${children}
                </li>`;
    }

    async fetchComments() {
        fetch(
            this.actionDomain +
                "comment/list?paged=" +
                this.paged +
                "&post_id=" +
                this.post_id
        ).then((res) => {
            res.json().then((data) => {
                const comments = data.results;
                this.total = data.total;
                this.total_paged = data.total_paged;
                if (this.total_paged > 1) {
                    this.randerNav();
                }
                document.querySelector(".comments-title .count")!.innerHTML =
                    this.total.toString();
                if (this.total == 0) {
                    document.querySelector(
                        ".commentlist"
                    )!.innerHTML = `<div class="no--comment">${window.noComment}</div>`;
                    return;
                } else {
                    const html = comments
                        .map((item: Comment) => {
                            let children = "";
                            if (item.children) {
                                children = `<ol class="children">${item.children
                                    .map((i: Comment) => {
                                        return this.renderComment(i);
                                    })
                                    .join("")}</ol>`;
                            }

                            return this.renderComment(item, children);
                        })
                        .join("");
                    document.querySelector(".commentlist")!.innerHTML = html;
                }
            });
        });
    }

    randerNav() {
        const nextDisabled = this.paged == 1 ? "disabled" : "";
        const preDisabled = this.paged == this.total_paged ? "disabled" : "";
        const html = `<span class="cnav-item ${preDisabled}" data-action="pre">
        <svg class="svgIcon" width="21" height="21" viewBox="0 0 21 21">
        <path d="M13.402 16.957l-6.478-6.479L13.402 4l.799.71-5.768 5.768 5.768 5.77z" fill-rule="evenodd">
        </path></svg> Older Comments</span><span class="chartPage-verticalDivider"></span><span class="cnav-item ${nextDisabled}" data-action="next">Newer Comments
        <svg class="svgIcon" width="21" height="21" viewBox="0 0 21 21">
        <path d="M8.3 4.2l6.4 6.3-6.4 6.3-.8-.8 5.5-5.5L7.5 5" fill-rule="evenodd">
        </path></svg>
        </span>`;
        document.querySelector(".commentnav")!.innerHTML = html;

        document.querySelectorAll(".cnav-item").forEach((item) => {
            item.addEventListener("click", (e) => {
                if (item.classList.contains("disabled")) return;
                const action = item.attributes["data-action"].value;
                if (action == "pre") {
                    this.paged += 1;
                } else {
                    this.paged -= 1;
                }
                this.fetchComments();
            });
        });
    }

    private init() {
        if (document.querySelector(".comment-form")) {
            if (this.getCookie("comment_author") != "") {
                (document.querySelector("#author") as HTMLInputElement).value =
                    this.getCookie("comment_author");
            }

            if (this.getCookie("comment_author_email") != "") {
                (document.querySelector("#email") as HTMLInputElement).value =
                    this.getCookie("comment_author_email");
            }

            if (this.getCookie("comment_author_url") != "") {
                (document.querySelector("#url") as HTMLInputElement).value =
                    this.getCookie("comment_author_url");
            }

            document
                .querySelector(".comment-form")
                ?.addEventListener("submit", (e) => {
                    e.preventDefault();
                    if (this.loading) return;
                    const form = document.querySelector(
                        ".comment-form"
                    ) as HTMLFormElement;
                    // @ts-ignore
                    const formData = new FormData(form);
                    // @ts-ignore
                    const formDataObj: { [index: string]: any } = {};
                    formData.forEach(
                        (value, key: any) => (formDataObj[key] = value)
                    );
                    formDataObj["post_id"] = this.post_id;
                    this.loading = true;
                    fetch(this.actionDomain + "comment/insert", {
                        method: "POST",
                        body: JSON.stringify(formDataObj),
                        headers: {
                            "Content-Type": "application/json",
                        },
                    })
                        .then((response) => {
                            return response.json();
                        })
                        .then((data) => {
                            this.loading = false;
                            if (data.status != 200) {
                                return this.showNotice(data.err, "error");
                            }
                            let cancelBtn = document.getElementById(
                                "cancel-comment-reply-link"
                            );
                            let respondForm =
                                document.getElementById("respond");
                            let tempForm =
                                document.getElementById("wp-temp-form-div");
                            const comment = data.data;
                            const html = this.renderComment(comment, "", false);
                            const parent_id = (
                                document.querySelector(
                                    "#comment_parent"
                                ) as HTMLInputElement
                            )?.value;
                            // @ts-ignore
                            (cancelBtn.style.display = "none"), // @ts-ignore
                                (cancelBtn.onclick = null), // @ts-ignore
                                ((
                                    document.getElementById(
                                        "comment_parent"
                                    ) as HTMLInputElement
                                ).value = ""),
                                tempForm && // @ts-ignore
                                    respondForm && // @ts-ignore
                                    tempForm.parentNode &&
                                    (tempForm.parentNode.insertBefore(
                                        respondForm,
                                        tempForm
                                    ),
                                    tempForm.parentNode.removeChild(tempForm));
                            if (document.querySelector(".comment-body__fresh"))
                                document
                                    .querySelector(".comment-body__fresh")
                                    ?.classList.remove("comment-body__fresh");
                            // @ts-ignore
                            document.getElementById("comment").value = "";
                            // @ts-ignore
                            if (parent_id != "") {
                                document
                                    .querySelector(
                                        // @ts-ignore
                                        "#comment-" + parent_id
                                    )
                                    ?.insertAdjacentHTML(
                                        "beforeend",
                                        '<ol class="children">' + html + "</ol>"
                                    );
                            } else {
                                if (document.querySelector(".no--comment")) {
                                    document
                                        .querySelector(".no--comment")
                                        ?.remove();
                                }
                                document
                                    .querySelector(".commentlist")
                                    ?.insertAdjacentHTML("beforeend", html);
                            }

                            const newComment = document.querySelector(
                                `#comment-${comment.comment_id}`
                            ) as HTMLElement;

                            if (newComment) {
                                newComment.scrollIntoView({
                                    behavior: "smooth",
                                });
                            }

                            this.setCookie(
                                "comment_author",
                                (
                                    document.querySelector(
                                        "#author"
                                    ) as HTMLInputElement
                                ).value,
                                1
                            );

                            this.setCookie(
                                "comment_author_email",
                                (
                                    document.querySelector(
                                        "#email"
                                    ) as HTMLInputElement
                                ).value,
                                1
                            );

                            this.setCookie(
                                "comment_author_url",
                                (
                                    document.querySelector(
                                        "#url"
                                    ) as HTMLInputElement
                                ).value,
                                1
                            );

                            this.showNotice("评论成功");
                        });
                });
        }
    }
}
