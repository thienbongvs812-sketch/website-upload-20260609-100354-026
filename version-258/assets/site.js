(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMobileNav() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;
    var timer = null;

    function setActive(index) {
      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        setActive(activeIndex + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setActive(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    startTimer();
  }

  function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initFilterPanels() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (panel) {
      var container = panel.parentElement;
      var results = container ? container.querySelector('[data-filter-results]') : null;
      var cards = results ? Array.prototype.slice.call(results.querySelectorAll('[data-filter-card], .rank-row')) : [];
      var keywordInput = panel.querySelector('[data-filter-keyword]');
      var yearSelect = panel.querySelector('[data-filter-year]');
      var sortSelect = panel.querySelector('[data-filter-sort]');
      var countOutput = panel.querySelector('[data-filter-count]');

      if (!results || cards.length === 0) {
        return;
      }

      cards.forEach(function (card, index) {
        card.dataset.originalIndex = String(index);
      });

      function getCardText(card) {
        return normalizeText(card.getAttribute('data-title') || card.textContent);
      }

      function update() {
        var keyword = normalizeText(keywordInput ? keywordInput.value : '');
        var year = yearSelect ? yearSelect.value : '';
        var visibleCards = [];

        cards.forEach(function (card) {
          var text = getCardText(card);
          var cardYear = card.getAttribute('data-year') || text;
          var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchesYear = !year || cardYear.indexOf(year) !== -1;
          var visible = matchesKeyword && matchesYear;

          card.classList.toggle('is-hidden', !visible);

          if (visible) {
            visibleCards.push(card);
          }
        });

        if (sortSelect && sortSelect.value !== 'default') {
          visibleCards.sort(function (a, b) {
            if (sortSelect.value === 'title') {
              return getCardText(a).localeCompare(getCardText(b), 'zh-Hans-CN');
            }

            var ay = Number(a.getAttribute('data-year') || 0);
            var by = Number(b.getAttribute('data-year') || 0);
            return sortSelect.value === 'year-asc' ? ay - by : by - ay;
          });

          visibleCards.forEach(function (card) {
            results.appendChild(card);
          });
        }

        if (countOutput) {
          countOutput.textContent = visibleCards.length + ' 部影片';
        }
      }

      if (keywordInput) {
        keywordInput.addEventListener('input', update);
      }

      if (yearSelect) {
        yearSelect.addEventListener('change', update);
      }

      if (sortSelect) {
        sortSelect.addEventListener('change', update);
      }
    });
  }

  function createSearchCard(movie) {
    var card = document.createElement('article');
    card.className = 'movie-card';
    card.innerHTML = [
      '<a class="movie-poster" href="' + movie.url + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
      '  <span class="poster-fallback-title">' + escapeHtml(movie.title.slice(0, 10)) + '</span>',
      '  <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.style.display=\'none\';">',
      '</a>',
      '<div class="movie-card-body">',
      '  <div class="movie-card-meta">',
      '    <a href="' + movie.categoryUrl + '">' + escapeHtml(movie.categoryName) + '</a>',
      '    <span>' + escapeHtml(movie.year) + '</span>',
      '  </div>',
      '  <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '  <p>' + escapeHtml(movie.oneLine) + '</p>',
      '  <div class="tag-row">' + movie.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
      '</div>'
    ].join('');
    return card;
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[character];
    });
  }

  function initSiteSearch() {
    var input = document.getElementById('site-search-input');
    var category = document.getElementById('site-search-category');
    var year = document.getElementById('site-search-year');
    var button = document.getElementById('site-search-button');
    var results = document.getElementById('site-search-results');
    var count = document.getElementById('site-search-count');
    var data = window.MOVIE_SEARCH_INDEX || [];

    if (!input || !results || data.length === 0) {
      return;
    }

    function render() {
      var query = normalizeText(input.value);
      var categoryValue = category ? category.value : '';
      var yearValue = year ? year.value : '';
      var matched = data.filter(function (movie) {
        var text = normalizeText([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.oneLine,
          movie.tags.join(' '),
          movie.categoryName
        ].join(' '));
        var queryOk = !query || text.indexOf(query) !== -1;
        var categoryOk = !categoryValue || movie.categorySlug === categoryValue;
        var yearOk = !yearValue || String(movie.year) === String(yearValue);
        return queryOk && categoryOk && yearOk;
      });

      if (!query && !categoryValue && !yearValue) {
        matched = data.slice(0, 40);
      }

      results.innerHTML = '';

      if (matched.length === 0) {
        results.innerHTML = '<div class="empty-state">没有找到匹配影片，请尝试更换关键词。</div>';
      } else {
        matched.slice(0, 120).forEach(function (movie) {
          results.appendChild(createSearchCard(movie));
        });
      }

      if (count) {
        count.textContent = '找到 ' + matched.length + ' 部影片' + (matched.length > 120 ? '，当前显示前 120 部' : '');
      }
    }

    input.addEventListener('input', render);

    if (category) {
      category.addEventListener('change', render);
    }

    if (year) {
      year.addEventListener('change', render);
    }

    if (button) {
      button.addEventListener('click', render);
    }

    render();
  }

  ready(function () {
    initMobileNav();
    initHero();
    initFilterPanels();
    initSiteSearch();
  });
})();
