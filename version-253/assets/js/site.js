(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function escapeText(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupMobileMenu() {
    var button = $("[data-menu-button]");
    var menu = $("[data-mobile-nav]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = $("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = $all("[data-hero-slide]", hero);
    var dots = $all("[data-hero-dot]", hero);
    var prev = $("[data-hero-prev]", hero);
    var next = $("[data-hero-next]", hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var panel = $("[data-filter-panel]");
    var grid = $("[data-filter-grid]");
    if (!panel || !grid) {
      return;
    }
    var input = $("[data-filter-input]", panel);
    var year = $("[data-filter-year]", panel);
    var type = $("[data-filter-type]", panel);
    var category = $("[data-filter-category]", panel);
    var cards = $all(".filter-card", grid);

    function apply() {
      var q = normalize(input && input.value);
      var y = normalize(year && year.value);
      var t = normalize(type && type.value);
      var c = normalize(category && category.value);
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-text"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardType = normalize(card.getAttribute("data-type"));
        var cardCategory = normalize(card.getAttribute("data-category"));
        var visible = true;
        if (q && text.indexOf(q) === -1) {
          visible = false;
        }
        if (y && cardYear.indexOf(y) === -1) {
          visible = false;
        }
        if (t && cardType.indexOf(t) === -1) {
          visible = false;
        }
        if (c && cardCategory !== c) {
          visible = false;
        }
        card.style.display = visible ? "" : "none";
      });
    }

    [input, year, type, category].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  }

  function movieCard(movie) {
    return [
      '<article class="movie-card filter-card">',
      '<a class="poster-link" href="./' + escapeText(movie.url) + '">',
      '<img src="' + escapeText(movie.cover) + '" alt="' + escapeText(movie.title) + ' 海报" loading="lazy">',
      '<span class="poster-glow"></span>',
      '<span class="year-badge">' + escapeText(movie.year) + '</span>',
      '<span class="play-chip">▶</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<a class="movie-title" href="./' + escapeText(movie.url) + '">' + escapeText(movie.title) + '</a>',
      '<p>' + escapeText(movie.oneLine) + '</p>',
      '<div class="movie-meta-line"><span>' + escapeText(movie.region) + '</span><span>' + escapeText(movie.type) + '</span></div>',
      '<div class="tag-row"><span>' + escapeText(movie.category) + '</span><span>' + escapeText(movie.genre) + '</span></div>',
      '</div>',
      '</article>'
    ].join("");
  }

  function setupSearchPage() {
    var form = $("[data-search-form]");
    var input = $("[data-search-input]");
    var results = $("[data-search-results]");
    var data = window.SEARCH_MOVIES || [];
    if (!form || !input || !results || !data.length) {
      return;
    }

    function render(items) {
      if (!items.length) {
        results.innerHTML = '<div class="empty-state">未找到匹配影片，请更换关键词。</div>';
        return;
      }
      results.innerHTML = items.slice(0, 80).map(movieCard).join("");
    }

    function search() {
      var q = normalize(input.value);
      if (!q) {
        render(data.slice(0, 24));
        return;
      }
      var terms = q.split(/\s+/).filter(Boolean);
      var items = data.filter(function (movie) {
        var text = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          movie.oneLine
        ].join(" "));
        return terms.every(function (term) {
          return text.indexOf(term) !== -1;
        });
      });
      render(items);
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      search();
    });
    input.addEventListener("input", search);
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
