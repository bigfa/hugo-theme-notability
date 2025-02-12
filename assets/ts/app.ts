import noteDate from "./date.ts";
import farallonActions from "./action.ts";
import Douban from "./db.ts";
import { farallonComment } from "./comment.ts";
import imgZoom from "./zoom.ts";

declare global {
    interface Window {
        actionDomain: string;
        timeFormat: string;
        dbAPIBase: string;
        viewText: string;
        noComment: string;
        zoom: boolean;
    }
}

new noteDate({
    selector: ".humane--time",
    timeFormat: window.timeFormat,
});

class noteBase {
    constructor() {
        this.initThemeSwitch();
        this.initBack2Top();
        this.initMenu();
    }

    initMenu() {
        if (document.querySelector(".menu--icon")) {
            document
                .querySelector(".menu--icon")!
                .addEventListener("click", () => {
                    document
                        .querySelector(".site--nav")!
                        .classList.add("is-active");
                    document
                        .querySelector("body")!
                        .classList.add("menu--actived");
                });
        }

        if (document.querySelector(".mask")) {
            document
                .querySelector(".mask")!
                .addEventListener("touchstart", () => {
                    document
                        .querySelector(".site--nav")!
                        .classList.remove("is-active");
                    document
                        .querySelector("body")!
                        .classList.remove("menu--actived");
                });
        }
    }

    initThemeSwitch() {
        const theme = localStorage.getItem("theme")
            ? localStorage.getItem("theme")
            : "auto";
        const html = `<div class="fixed--theme">
<span class="${theme == "dark" ? "is-active" : ""}" data-action-value="dark">
<svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round"
    stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"
    style="color: currentcolor; width: 16px; height: 16px;">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
</svg>
</span>
<span class="${theme == "light" ? "is-active" : ""}" data-action-value="light">
<svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round"
    stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"
    style="color: currentcolor; width: 16px; height: 16px;">
    <circle cx="12" cy="12" r="5"></circle>
    <path d="M12 1v2"></path>
    <path d="M12 21v2"></path>
    <path d="M4.22 4.22l1.42 1.42"></path>
    <path d="M18.36 18.36l1.42 1.42"></path>
    <path d="M1 12h2"></path>
    <path d="M21 12h2"></path>
    <path d="M4.22 19.78l1.42-1.42"></path>
    <path d="M18.36 5.64l1.42-1.42"></path>
</svg>
</span>
<span class="${theme == "auto" ? "is-active" : ""}"  data-action-value="auto">
<svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round"
    stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"
    style="color: currentcolor; width: 16px; height: 16px;">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M8 21h8"></path>
    <path d="M12 17v4"></path>
</svg>
</span>
</div>`;

        document.querySelector("body")!.insertAdjacentHTML("beforeend", html);
        document.querySelectorAll(".fixed--theme span").forEach((item) => {
            item.addEventListener("click", () => {
                if (item.classList.contains("is-active")) return;
                document
                    .querySelectorAll(".fixed--theme span")
                    .forEach((item) => {
                        item.classList.remove("is-active");
                    });
                if ((item as HTMLElement).dataset.actionValue == "dark") {
                    localStorage.setItem("theme", "dark");
                    document.querySelector("body")!.classList.remove("auto");
                    document.querySelector("body")!.classList.add("dark");
                    item.classList.add("is-active");
                    //this.showNotice('夜间模式已开启');
                } else if (
                    (item as HTMLElement).dataset.actionValue == "light"
                ) {
                    localStorage.setItem("theme", "light");
                    document.querySelector("body")!.classList.remove("auto");
                    document.querySelector("body")!.classList.remove("dark");
                    item.classList.add("is-active");
                    //this.showNotice('夜间模式已关闭');
                } else if (
                    (item as HTMLElement).dataset.actionValue == "auto"
                ) {
                    localStorage.setItem("theme", "auto");
                    document.querySelector("body")!.classList.remove("dark");
                    document.querySelector("body")!.classList.add("auto");
                    item.classList.add("is-active");
                    //this.showNotice('夜间模式已关闭');
                }
            });
        });
    }

    initBack2Top() {
        if (document.querySelector(".backToTop")) {
            const backToTop = document.querySelector(
                ".backToTop"
            ) as HTMLElement;
            window.addEventListener("scroll", () => {
                const t = window.scrollY || document.documentElement.scrollTop;
                t > 200
                    ? backToTop!.classList.add("is-active")
                    : backToTop!.classList.remove("is-active");
            });

            backToTop.addEventListener("click", () => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }
    }
}

new noteBase();

new farallonActions({
    singleSelector: ".post--single",
    articleSelector: ".articleItem",
    text: window.viewText,
    actionDomain: window.actionDomain,
});

new Douban({
    baseAPI: window.dbAPIBase,
    container: ".db--container",
});

new farallonComment({
    actionDomain: window.actionDomain,
});

if (window.zoom) {
    new imgZoom();
}
