interface StatusObject {
    name: string;
    value: string;
}

interface DoubanConfig {
    baseAPI: string;
    container: string;
    types?: Array<string>;
    onChange?: (value: string) => void;
}

interface DoubanObject {
    subject_id: string;
    name: string;
    card_subtitle: string;
    create_time: any;
    douban_score: string;
    link: string;
    type: string;
    poster: string;
    pubdate: string;
    year: string;
    status: string;
}

class Douban {
    readonly ver: string;
    type: any;
    finished: boolean;
    paged: number;
    genre_list: Array<StatusObject>;
    subjects: Array<DoubanObject>;
    status: string;
    baseAPI: string;
    types: Array<string>;
    container: string;
    constructor(config: DoubanConfig) {
        this.container = config.container;
        this.types = config.types ?? [
            "movie",
            "book",
            "music",
            "game",
            "drama",
        ];
        this.baseAPI = config.baseAPI;
        this.ver = "1.0.6";
        this.type = "movie";
        this.status = "done";
        this.finished = false;
        this.paged = 1;
        this.genre_list = [
            {
                name: "已看",
                value: "done",
            },
            {
                name: "在看",
                value: "doing",
            },
            {
                name: "想看",
                value: "mark",
            },
        ];
        this.subjects = [];
        this._create();
    }

    on(event: string, element: string, callback: any) {
        const nodeList: NodeList = document.querySelectorAll(element);
        nodeList.forEach((item) => {
            item.addEventListener(event, callback);
        });
    }

    _handleGenreClick(): void {
        this.on("click", ".db--genreItem", (t: MouseEvent) => {
            const self = t.currentTarget as HTMLElement;
            if (self.classList.contains("is-active")) {
                return;
            }
            document.querySelector(".db--list")!.innerHTML = "";
            document.querySelector(".lds-ripple")!.classList.remove("u-hide");

            this.status = self.dataset.status || ""; // Provide a default value of an empty string if self.dataset.status is undefined
            this._renderGenre();
            this.paged = 1;
            this.finished = false;
            this.subjects = [];
            this._fetchData();
        });
    }

    _reanderTypes(): void {
        document.querySelector(".db--nav")!.innerHTML = this.types
            .map((item: string) => {
                return `<span class="db--navItem JiEun${
                    this.type == item ? " current" : ""
                }" data-type="${item}">${item}</span>`;
            })
            .join("");
        this._handleNavClick();
    }

    _renderGenre(): void {
        document.querySelector(".db--genres")!.innerHTML = this.genre_list
            .map((item: StatusObject) => {
                return `<span class="db--genreItem${
                    this.status == item.value ? " is-active" : ""
                }" data-status="${item.value}">${item.name}</span>`;
            })
            .join("");
        this._handleGenreClick();
    }

    _fetchData(): void {
        const params: URLSearchParams = new URLSearchParams({
            paged: this.paged.toString(),
            type: this.type,
            status: this.status,
        });
        fetch(this.baseAPI + "list?" + params.toString())
            .then((response) => response.json())
            .then((t: any) => {
                console.log(t.results);
                if (t.results.length) {
                    if (
                        document
                            .querySelector(".db--list")!
                            .classList.contains("db--list__card")
                    ) {
                        this.subjects = [...this.subjects, ...t.results];
                        this._randerDateTemplate();
                    } else {
                        this.subjects = [...this.subjects, ...t.results];
                        this._randerListTemplate();
                    }
                    document
                        .querySelector(".lds-ripple")!
                        .classList.add("u-hide");
                } else {
                    this.finished = true;
                    document
                        .querySelector(".lds-ripple")!
                        .classList.add("u-hide");
                }
            });
    }

    _randerDateTemplate(): void {
        const result = this.subjects.reduce((result, item) => {
            const date = new Date(item.create_time);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const key = `${year}-${month.toString().padStart(2, "0")}`;
            if (Object.prototype.hasOwnProperty.call(result, key)) {
                result[key].push(item);
            } else {
                result[key] = [item];
            }
            return result;
        }, {});

        let html = ``;
        for (let key in result) {
            const date = key.split("-");
            html += `<div class="db--listBydate"><div class="db--titleDate"><div class="db--titleDate__day">${date[1]}</div><div class="db--titleDate__month">${date[0]}</div></div><div class="db--dateList__card">`;
            html += result[key]
                .map((movie: any) => {
                    return `<div class="db--item${
                        this.type == "music" ? " db--item__music" : ""
                    }"><img src="${
                        movie.poster
                    }" referrerpolicy="no-referrer" class="db--image"><div class="db--score ">${
                        movie.douban_score > 0
                            ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" ><path d="M12 20.1l5.82 3.682c1.066.675 2.37-.322 2.09-1.584l-1.543-6.926 5.146-4.667c.94-.85.435-2.465-.799-2.567l-6.773-.602L13.29.89a1.38 1.38 0 0 0-2.581 0l-2.65 6.53-6.774.602C.052 8.126-.453 9.74.486 10.59l5.147 4.666-1.542 6.926c-.28 1.262 1.023 2.26 2.09 1.585L12 20.099z"></path></svg>' +
                              movie.douban_score
                            : ""
                    }${
                        movie.year > 0 ? " · " + movie.year : ""
                    }</div><div class="db--title"><a href="${
                        movie.link
                    }" target="_blank">${movie.name}</a></div></div>`;
                })
                .join("");
            html += `</div></div>`;
        }
        document.querySelector(".db--list")!.innerHTML = html;
    }

    _randerListTemplate(): void {
        document.querySelector(".db--list")!.innerHTML = this.subjects
            .map((item) => {
                return `<div class="db--item"><img src="${
                    item.poster
                }" referrerpolicy="no-referrer" class="db--image"><div class="ipc-signpost ">${
                    item.create_time
                }</div><div class="db--score ">${
                    item.douban_score
                        ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" ><path d="M12 20.1l5.82 3.682c1.066.675 2.37-.322 2.09-1.584l-1.543-6.926 5.146-4.667c.94-.85.435-2.465-.799-2.567l-6.773-.602L13.29.89a1.38 1.38 0 0 0-2.581 0l-2.65 6.53-6.774.602C.052 8.126-.453 9.74.486 10.59l5.147 4.666-1.542 6.926c-.28 1.262 1.023 2.26 2.09 1.585L12 20.099z"></path></svg>' +
                          item.douban_score
                        : ""
                }${
                    item.year ? " · " + item.year : ""
                }</div><div class="db--title"><a href="${
                    item.link
                }" target="_blank">${item.name}</a></div>
                </div>
                </div>`;
            })
            .join("");
    }

    _handleScroll(): void {
        window.addEventListener("scroll", () => {
            var t = window.scrollY || window.pageYOffset;
            const moreElement = document.querySelector(
                ".block-more"
            ) as HTMLElement;
            if (
                moreElement.offsetTop + -window.innerHeight < t &&
                document
                    .querySelector(".lds-ripple")!
                    .classList.contains("u-hide") &&
                !this.finished
            ) {
                document
                    .querySelector(".lds-ripple")!
                    .classList.remove("u-hide");
                this.paged++;
                this._fetchData();
            }
        });
    }

    _handleNavClick(): void {
        this.on("click", ".db--navItem", (t: MouseEvent) => {
            const self = t.currentTarget as HTMLElement;
            if (self.classList.contains("current")) return;
            this.status = "done";
            this.type = self.dataset.type;
            this._renderGenre();
            document.querySelector(".db--list")!.innerHTML = "";
            document.querySelector(".lds-ripple")!.classList.remove("u-hide");
            document
                .querySelector(".db--navItem.current")!
                .classList.remove("current");
            self.classList.add("current");
            this.paged = 1;
            this.finished = false;
            this.subjects = [];
            this._fetchData();
        });
    }

    _create(): void {
        if (document.querySelector(".db--container")) {
            const container = document.querySelector(
                this.container
            ) as HTMLElement;
            if (!container) return;
            container.innerHTML = `<nav class="db--nav">
            </nav>
            <div class="db--genres">
            </div>
            <div class="db--list db--list__card">
            </div>
            <div class="block-more block-more__centered">
                <div class="lds-ripple">
                </div>
            </div>`;
            this._renderGenre();
            this._reanderTypes();
            this._fetchData();
            this._handleScroll();
        }

        if (document.querySelector(".js-db")) {
            document.querySelectorAll(".js-db").forEach((item: any) => {
                const db = item;
                const id = db.dataset.id;
                const type = db.dataset.type;
                const nodeParent = db.parentNode as HTMLElement;
                fetch(this.baseAPI + `${type}/${id}`).then((response) => {
                    response.json().then((t) => {
                        if (t.data) {
                            const data = t.data;
                            const node = document.createElement("div");
                            node.classList.add("doulist-item");
                            node.innerHTML = `<div class="doulist-subject">
                            <div class="doulist-post"><img decoding="async" referrerpolicy="no-referrer" src="${data.poster}"></div>
                            <div class="doulist-content">
                            <div class="doulist-title"><a href="${data.link}" class="cute" target="_blank" rel="external nofollow">${data.name}</a></div>
                            <div class="rating"><span class="allstardark"><span class="allstarlight" style="width:55%"></span></span><span class="rating_nums"> ${data.douban_score} </span></div>
                            <div class="abstract">${data.card_subtitle}</div>
                            </div>
                            </div>`;
                            nodeParent.replaceWith(node);
                        }
                    });
                });
            });
        }

        if (document.querySelector(".db--collection")) {
            document
                .querySelectorAll(".db--collection")
                .forEach((item: any) => {
                    this._fetchCollection(item);
                });
        }
    }

    _fetchCollection(item: any): void {
        const type = item.dataset.style ? item.dataset.style : "card";
        fetch(
            this.baseAPI +
                "/list?type=" +
                item.dataset.type +
                "&paged=1&start_time=" +
                item.dataset.start +
                "&end_time=" +
                item.dataset.end
        )
            .then((response) => response.json())
            .then((t: any) => {
                if (t.length) {
                    if (type == "card") {
                        item.innerHTML += t
                            .map((movie: DoubanObject) => {
                                return `<div class="doulist-item">
                            <div class="doulist-subject">
                            <div class="db--viewTime ">Marked ${movie.create_time}</div>
                            <div class="doulist-post"><img referrerpolicy="no-referrer" src="${movie.poster}"></div><div class="doulist-content"><div class="doulist-title"><a href="${movie.link}" class="cute" target="_blank" rel="external nofollow">${movie.name}</a></div><div class="rating"><span class="allstardark"><span class="allstarlight" style="width:75%"></span></span><span class="rating_nums">${movie.douban_score}</span></div><div class="abstract">${movie.card_subtitle}</div></div></div></div>`;
                            })
                            .join("");
                    } else {
                        const result = t.reduce(
                            (result: any, item: DoubanObject) => {
                                if (
                                    Object.prototype.hasOwnProperty.call(
                                        result,
                                        item.create_time
                                    )
                                ) {
                                    result[item.create_time].push(item);
                                } else {
                                    result[item.create_time] = [item];
                                }
                                return result;
                            },
                            {}
                        );
                        let html = ``;
                        for (let key in result) {
                            html += `<div class="db--date">${key}</div><div class="db--dateList">`;
                            html += result[key]
                                .map((movie: any) => {
                                    return `<div class="db--card__list"">
                                    <img referrerpolicy="no-referrer" src="${
                                        movie.poster
                                    }">
                                    <div>
                                    <div class="title"><a href="${
                                        movie.link
                                    }" class="cute" target="_blank" rel="external nofollow">${
                                        movie.name
                                    }</a></div>
                                    <div class="rating"><span class="allstardark"><span class="allstarlight" style="width:75%"></span></span><span class="rating_nums">${
                                        movie.douban_score
                                    }</span></div>
                                    ${movie.remark || movie.card_subtitle}
                                    </div>
                                    </div>`;
                                })
                                .join("");
                            html += `</div>`;
                        }
                        item.innerHTML = html;
                    }
                }
            });
    }
}

export default Douban;
