(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let active = 0;
    let timer = null;

    const show = function (index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === active);
      });
    };

    const restart = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        restart();
      });
    }

    restart();
  }

  const forms = Array.from(document.querySelectorAll('[data-search-form]'));

  forms.forEach(function (form) {
    const section = form.closest('section') || document;
    const cards = Array.from(section.querySelectorAll('[data-card]'));
    const q = form.querySelector('[name="q"]');
    const year = form.querySelector('[name="year"]');
    const category = form.querySelector('[name="category"]');
    const grid = section.querySelector('[data-card-grid]');
    const fixedCategory = grid ? grid.getAttribute('data-category') : '';

    const inYearRange = function (cardYear, value) {
      const num = parseInt(cardYear, 10);

      if (!value || value === '全部年份') {
        return true;
      }

      if (value === '2025+') {
        return num >= 2025;
      }

      if (value === '2020-2024') {
        return num >= 2020 && num <= 2024;
      }

      if (value === '2010-2019') {
        return num >= 2010 && num <= 2019;
      }

      if (value === '2000-2009') {
        return num >= 2000 && num <= 2009;
      }

      return num < 2000;
    };

    const apply = function () {
      const keyword = q ? q.value.trim().toLowerCase() : '';
      const yearValue = year ? year.value : '';
      const categoryValue = category ? category.value : '';

      cards.forEach(function (card) {
        const text = card.getAttribute('data-search') || '';
        const cardYear = card.getAttribute('data-year') || '';
        const matchesText = !keyword || text.indexOf(keyword) !== -1;
        const matchesYear = inYearRange(cardYear, yearValue);
        const cardCategory = card.getAttribute('data-category') || fixedCategory;
        const matchesCategory = !categoryValue || cardCategory === categoryValue;
        card.classList.toggle('is-hidden', !(matchesText && matchesYear && matchesCategory));
      });
    };

    form.addEventListener('input', apply);
    form.addEventListener('change', apply);
  });
})();
