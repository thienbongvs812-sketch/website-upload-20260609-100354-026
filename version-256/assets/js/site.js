(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var menuToggle = document.querySelector("[data-menu-toggle]");
        var mobileMenu = document.querySelector("[data-mobile-menu]");

        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener("click", function () {
                mobileMenu.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");

        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var active = 0;

            function showSlide(index) {
                active = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === active);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === active);
                });
            }

            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    showSlide(i);
                });
            });

            if (slides.length > 1) {
                window.setInterval(function () {
                    showSlide(active + 1);
                }, 5200);
            }
        }

        var filterInputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));

        filterInputs.forEach(function (input) {
            var scope = input.closest(".page-shell") || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));

            input.addEventListener("input", function () {
                var query = input.value.trim().toLowerCase();

                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-filter") || card.textContent || "").toLowerCase();
                    card.classList.toggle("is-hidden", query && text.indexOf(query) === -1);
                });
            });
        });
    });
})();
