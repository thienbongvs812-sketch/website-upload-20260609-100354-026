(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    function createCard(movie) {
        var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");

        return "" +
            "<article class=\"movie-card\">" +
                "<a class=\"movie-poster-link\" href=\"" + escapeHtml(movie.url) + "\">" +
                    "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
                    "<span class=\"movie-year\">" + escapeHtml(movie.year) + "</span>" +
                    "<span class=\"movie-card-play\">▶</span>" +
                "</a>" +
                "<div class=\"movie-card-body\">" +
                    "<div class=\"movie-card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
                    "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
                    "<p>" + escapeHtml(movie.oneLine) + "</p>" +
                    "<div class=\"tag-row\">" + tags + "</div>" +
                "</div>" +
            "</article>";
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    ready(function () {
        var form = document.querySelector("[data-search-form]");
        var input = document.querySelector("[data-search-input]");
        var results = document.querySelector("[data-search-results]");
        var title = document.querySelector("[data-search-title]");
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";

        function render(query) {
            var value = normalize(query);
            var items = MOVIES;

            if (value) {
                items = MOVIES.filter(function (movie) {
                    var hay = normalize([
                        movie.title,
                        movie.region,
                        movie.type,
                        movie.year,
                        movie.genre,
                        (movie.tags || []).join(" "),
                        movie.oneLine
                    ].join(" "));

                    return hay.indexOf(value) !== -1;
                });
            }

            var picked = items.slice(0, 80);
            results.innerHTML = picked.map(createCard).join("");
            title.textContent = value ? "搜索：" + query : "热门推荐";
        }

        if (input) {
            input.value = initial;
        }

        render(initial);

        if (form && input) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var query = input.value.trim();
                var url = new URL(window.location.href);

                if (query) {
                    url.searchParams.set("q", query);
                } else {
                    url.searchParams.delete("q");
                }

                window.history.replaceState(null, "", url.toString());
                render(query);
            });

            input.addEventListener("input", function () {
                render(input.value.trim());
            });
        }
    });
})();
