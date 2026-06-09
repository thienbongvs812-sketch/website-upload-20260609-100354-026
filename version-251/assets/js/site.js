(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = all('[data-hero-slide]', hero);
    var dots = all('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
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
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    all('[data-filter-area]').forEach(function (area) {
      var section = area.closest('section') || document;
      var keywordInput = area.querySelector('[data-filter-keyword]');
      var yearInput = area.querySelector('[data-filter-year]');
      var typeInput = area.querySelector('[data-filter-type]');
      var regionInput = area.querySelector('[data-filter-region]');
      var cards = all('[data-movie-card]', section);
      var empty = area.querySelector('[data-filter-empty]');

      function matches(card) {
        var keyword = (keywordInput && keywordInput.value || '').trim().toLowerCase();
        var year = yearInput && yearInput.value || '';
        var type = typeInput && typeInput.value || '';
        var region = regionInput && regionInput.value || '';
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var genre = (card.getAttribute('data-genre') || '').toLowerCase();
        var cardText = card.textContent.toLowerCase();
        var textMatch = !keyword || title.indexOf(keyword) > -1 || genre.indexOf(keyword) > -1 || cardText.indexOf(keyword) > -1;
        var yearMatch = !year || card.getAttribute('data-year') === year;
        var typeMatch = !type || card.getAttribute('data-type') === type;
        var regionMatch = !region || card.getAttribute('data-region') === region;
        return textMatch && yearMatch && typeMatch && regionMatch;
      }

      function apply() {
        var visible = 0;
        cards.forEach(function (card) {
          var ok = matches(card);
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [keywordInput, yearInput, typeInput, regionInput].forEach(function (input) {
        if (input) {
          input.addEventListener('input', apply);
          input.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
  });
}());
