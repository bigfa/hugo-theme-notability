import { farallonHelper } from "./utils";

interface farallonActionsOptions {
    singleSelector?: string;
    likeButtonSelctor?: string;
    articleSelector?: string;
    viewSelector?: string;
    actionDomain: string;
    text?: string;
}

class farallonActions extends farallonHelper {
    singleSelector: string = ".post--single";
    likeButtonSelctor: string = ".like-btn";
    articleSelector: string = ".post--item";
    viewSelector: string = ".article--views";
    actionDomain: string;
    text: string = "";
    likeButton: HTMLElement | null = null;
    post_id: string;
    is_single: boolean = false;

    constructor(config: farallonActionsOptions) {
        super();
        this.singleSelector = config.singleSelector ?? this.singleSelector;
        this.likeButtonSelctor =
            config.likeButtonSelctor ?? this.likeButtonSelctor;
        this.articleSelector = config.articleSelector ?? this.articleSelector;
        this.viewSelector = config.viewSelector ?? this.viewSelector;
        this.actionDomain = config.actionDomain;
        this.text = config.text ?? this.text;

        this.is_single = document.querySelector(this.singleSelector)
            ? true
            : false;

        if (this.is_single) {
            const postSingle = document.querySelector(
                this.singleSelector
            ) as HTMLElement;
            this.post_id = postSingle.dataset.id ?? "";
            this.initArticleLike();
            this.initArticleView();
        } else {
            this.initArticlesView();
        }
    }

    initArticleView() {
        fetch(this.actionDomain + "post/" + this.post_id + "/view", {
            method: "post",
        }).then((res) => {
            res.json().then((data) => {
                (
                    document.querySelector(this.viewSelector) as HTMLElement
                ).innerText = data.views + this.text;
            });
        });
    }

    initArticlesView() {
        const articles: HTMLElement[] = Array.from(
            document.querySelectorAll(this.articleSelector)
        );

        if (articles.length === 0) return;

        let ids: Array<String> = [];
        articles.forEach((article: HTMLElement) => {
            return ids.push(article.dataset.id!);
        });

        const idsString = ids.join(",");

        fetch(this.actionDomain + "post/views?post_ids=" + idsString).then(
            (res) => {
                res.json().then((data) => {
                    const result = data.results;
                    articles.forEach((article: HTMLElement) => {
                        if (!article.querySelector(this.viewSelector)) return;
                        (
                            article.querySelector(
                                this.viewSelector
                            ) as HTMLElement
                        ).innerText =
                            (result.find(
                                (item: any) =>
                                    item.post_id == article.dataset.id
                            )
                                ? result.find(
                                      (item: any) =>
                                          item.post_id == article.dataset.id
                                  ).views
                                : 0) + this.text;
                    });
                });
            }
        );
    }

    initArticleLike() {
        this.likeButton = document.querySelector(this.likeButtonSelctor);
        if (this.likeButton) {
            fetch(this.actionDomain + "post/" + this.post_id + "/like").then(
                (res) => {
                    res.json().then((data) => {
                        (
                            this.likeButton!.querySelector(
                                ".count"
                            ) as HTMLElement
                        ).innerText = data.likes;
                    });
                }
            );

            this.likeButton.addEventListener("click", () => {
                this.handleLike();
            });
            if (this.getCookie("like_" + this.post_id)) {
                this.likeButton.classList.add("is-active");
            }
        }
    }

    handleLike() {
        if (this.getCookie("like_" + this.post_id)) {
            return this.showNotice("You have already liked this post");
        }
        if (this.likeButton) {
            const url = this.actionDomain + "post/" + this.post_id + "/like";
            fetch(url, {
                method: "post",
            })
                .then((response) => {
                    return response.json();
                })
                .then((data) => {
                    this.showNotice("Thanks for your like");
                    const countElement = this.likeButton?.querySelector(
                        ".count"
                    ) as HTMLElement;
                    if (countElement) {
                        countElement.innerText = data.likes;
                    }
                    this.setCookie("like_" + this.post_id, "1", 1);
                });
            this.likeButton?.classList.add("is-active");
        }
    }
}

export default farallonActions;
