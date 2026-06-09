(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function getQuery(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || '';
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initMobileMenu() {
        var button = document.querySelector('.mobile-toggle');
        var menu = document.getElementById('mobile-menu');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            var open = menu.classList.toggle('is-open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function initHero() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var index = 0;
        var timer;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                play();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                play();
            });
        });
        show(0);
        play();
    }

    function initGridSearch() {
        var grid = document.querySelector('[data-filter-grid]');
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
        var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-grid-search]'));
        var chips = Array.prototype.slice.call(document.querySelectorAll('[data-category-chip]'));
        var emptyState = document.querySelector('[data-empty-state]');
        var summary = document.querySelector('[data-search-summary]');
        var pageInput = document.querySelector('[data-search-page-input]');
        var query = getQuery('q');
        var category = 'all';

        function textForCard(card) {
            return normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-category'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type')
            ].join(' '));
        }

        function apply() {
            var value = normalize(query);
            var visible = 0;
            cards.forEach(function (card) {
                var matchesQuery = !value || textForCard(card).indexOf(value) !== -1;
                var matchesCategory = category === 'all' || card.getAttribute('data-category') === category;
                var show = matchesQuery && matchesCategory;
                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });
            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
            if (summary) {
                summary.textContent = value ? '与“' + query + '”相关的影片与剧集如下。' : '输入关键词即可筛选片名、简介、地区、类型与标签。';
            }
        }

        searchInputs.forEach(function (input) {
            input.value = query;
            input.addEventListener('input', function () {
                query = input.value;
                searchInputs.forEach(function (other) {
                    if (other !== input) {
                        other.value = query;
                    }
                });
                apply();
            });
        });
        if (pageInput) {
            pageInput.value = query;
        }
        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                category = chip.getAttribute('data-category-chip') || 'all';
                chips.forEach(function (item) {
                    item.classList.toggle('is-active', item === chip);
                });
                apply();
            });
        });
        apply();
    }

    function initPlayer() {
        var video = document.querySelector('.video-player[data-stream]');
        if (!video) {
            return;
        }
        var stream = video.getAttribute('data-stream');
        var overlay = document.querySelector('.player-overlay');
        var prepared = false;
        var hls;

        function prepare() {
            if (prepared || !stream) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else {
                video.src = stream;
            }
            prepared = true;
        }

        function start(event) {
            if (event) {
                event.preventDefault();
            }
            prepare();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        prepare();
        if (overlay) {
            overlay.addEventListener('click', start);
        }
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(function () {
        initMobileMenu();
        initHero();
        initGridSearch();
        initPlayer();
    });
})();
