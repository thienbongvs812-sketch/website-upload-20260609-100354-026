(function() {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var button = document.querySelector('.mobile-menu-button');
        var panel = document.querySelector('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function() {
            var isOpen = panel.hasAttribute('hidden');
            if (isOpen) {
                panel.removeAttribute('hidden');
                button.setAttribute('aria-expanded', 'true');
                button.textContent = '×';
            } else {
                panel.setAttribute('hidden', '');
                button.setAttribute('aria-expanded', 'false');
                button.textContent = '☰';
            }
        });
    }

    function setupSearchForms() {
        selectAll('.site-search').forEach(function(form) {
            form.addEventListener('submit', function(event) {
                var input = form.querySelector('input[name="q"]');
                var value = input ? input.value.trim() : '';
                if (!value) {
                    event.preventDefault();
                    window.location.href = './search.html';
                }
            });
        });
    }

    function setupHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = selectAll('.hero-slide', slider);
        var dots = selectAll('.hero-dot', slider);
        var prev = slider.querySelector('.hero-prev');
        var next = slider.querySelector('.hero-next');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function() {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function() {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function() {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                show(parseInt(dot.getAttribute('data-slide'), 10) || 0);
                start();
            });
        });
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var grids = selectAll('.filter-grid');
        if (!grids.length) {
            return;
        }
        var input = document.querySelector('.filter-input');
        var buttons = selectAll('.filter-buttons button');
        var empty = document.querySelector('.empty-state');
        var active = 'all';

        function matches(card, term) {
            var text = [
                card.getAttribute('data-title'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.textContent
            ].join(' ').toLowerCase();
            return !term || text.indexOf(term) !== -1;
        }

        function apply() {
            var term = input ? input.value.trim().toLowerCase() : '';
            var shown = 0;
            grids.forEach(function(grid) {
                selectAll('.movie-card, .rank-row', grid).forEach(function(card) {
                    var text = card.textContent.toLowerCase();
                    var okFilter = active === 'all' || text.indexOf(active.toLowerCase()) !== -1;
                    var okText = matches(card, term);
                    var visible = okFilter && okText;
                    card.hidden = !visible;
                    if (visible) {
                        shown += 1;
                    }
                });
            });
            if (empty) {
                empty.hidden = shown !== 0;
            }
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        buttons.forEach(function(button) {
            button.addEventListener('click', function() {
                buttons.forEach(function(item) {
                    item.classList.remove('active');
                });
                button.classList.add('active');
                active = button.getAttribute('data-filter') || 'all';
                apply();
            });
        });
        apply();
    }

    function cardTemplate(movie) {
        var tags = (movie.tags || '').split(/[，、, /]+/).filter(Boolean).slice(0, 3).map(function(tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '<article class="movie-card">' +
            '<a href="./' + encodeURI(movie.url) + '" aria-label="' + escapeHtml(movie.title) + ' 在线观看">' +
            '<span class="poster-box">' +
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<span class="poster-shade"></span>' +
            '<span class="play-icon">▶</span>' +
            '<span class="corner-tag">' + escapeHtml(movie.type) + '</span>' +
            '</span>' +
            '<span class="card-body">' +
            '<span class="card-title">' + escapeHtml(movie.title) + '</span>' +
            '<span class="card-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.category) + '</span>' +
            '<span class="card-desc">' + escapeHtml(movie.desc) + '</span>' +
            '<span class="card-tags">' + tags + '</span>' +
            '</span>' +
            '</a>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function(char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function setupSearchPage() {
        var results = document.getElementById('search-results');
        if (!results || !window.SiteMovies) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        var input = document.getElementById('search-page-input');
        var title = document.getElementById('search-title');
        var subtitle = document.getElementById('search-subtitle');
        var empty = document.getElementById('search-empty');
        if (input) {
            input.value = query;
        }
        var source = window.SiteMovies;
        var matched;
        if (query) {
            var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
            matched = source.filter(function(movie) {
                var text = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.tags, movie.desc, movie.category].join(' ').toLowerCase();
                return terms.every(function(term) {
                    return text.indexOf(term) !== -1;
                });
            });
            if (title) {
                title.textContent = '搜索结果：' + query;
            }
            if (subtitle) {
                subtitle.textContent = matched.length ? '以下内容与关键词匹配。' : '换一个关键词试试。';
            }
        } else {
            matched = source.slice(0, 36);
        }
        results.innerHTML = matched.slice(0, 120).map(cardTemplate).join('');
        if (empty) {
            empty.hidden = matched.length !== 0;
        }
    }

    setupMobileMenu();
    setupSearchForms();
    setupHero();
    setupFilters();
    setupSearchPage();
})();
