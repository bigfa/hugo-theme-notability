export class farallonHelper {
    getCookie(t: any) {
        if (0 < document.cookie.length) {
            var e = document.cookie.indexOf(t + "=");
            if (-1 != e) {
                e = e + t.length + 1;
                var n = document.cookie.indexOf(";", e);
                return (
                    -1 == n && (n = document.cookie.length),
                    document.cookie.substring(e, n)
                );
            }
        }
        return "";
    }

    setCookie(t: any, e: any, n: any) {
        var o = new Date();
        o.setTime(o.getTime() + 24 * n * 60 * 60 * 1e3);
        var i = "expires=" + o.toUTCString();
        document.cookie = t + "=" + e + ";" + i + ";path=/";
    }

    showNotice(message: any, type: any = "success") {
        const html = `<div class="notice--wrapper">${message}</div>`;

        document.querySelector("body")!.insertAdjacentHTML("beforeend", html);
        document.querySelector(".notice--wrapper")!.classList.add("is-active");
        setTimeout(() => {
            document.querySelector(".notice--wrapper")!.remove();
        }, 3000);
    }
}
