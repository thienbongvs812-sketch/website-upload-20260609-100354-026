(function () {
  const toggle = document.querySelector('[data-menu-toggle]');
  const panel = document.querySelector('[data-menu-panel]');
  const mobileCategories = document.querySelector('[data-mobile-categories]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
      if (mobileCategories) {
        mobileCategories.classList.toggle('is-open');
      }
    });
  }

  const hero = document.querySelector('[data-hero-slider]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let index = 0;

    const show = function (nextIndex) {
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
    };

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });

    show(0);
    window.setInterval(function () {
      show(index + 1);
    }, 5000);
  }

  const filterRoot = document.querySelector('[data-filter-root]');
  if (filterRoot) {
    const input = filterRoot.querySelector('[data-filter-input]');
    const year = filterRoot.querySelector('[data-filter-year]');
    const category = filterRoot.querySelector('[data-filter-category]');
    const cards = Array.from(filterRoot.querySelectorAll('[data-card]'));
    const count = filterRoot.querySelector('[data-filter-count]');
    const empty = filterRoot.querySelector('[data-empty-state]');

    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q && input) {
      input.value = q;
    }

    const apply = function () {
      const keyword = input ? input.value.trim().toLowerCase() : '';
      const selectedYear = year ? year.value : '';
      const selectedCategory = category ? category.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = card.getAttribute('data-search') || '';
        const cardYear = card.getAttribute('data-year') || '';
        const cardCategory = card.getAttribute('data-category') || '';
        const okKeyword = !keyword || haystack.includes(keyword);
        const okYear = !selectedYear || cardYear === selectedYear;
        const okCategory = !selectedCategory || cardCategory === selectedCategory;
        const showCard = okKeyword && okYear && okCategory;
        card.style.display = showCard ? '' : 'none';
        if (showCard) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }
      if (empty) {
        empty.style.display = visible === 0 ? 'block' : 'none';
      }
    };

    [input, year, category].forEach(function (el) {
      if (el) {
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      }
    });

    apply();
  }
})();
