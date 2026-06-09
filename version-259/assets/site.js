(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function initMenu() {
    var button = one('[data-menu-toggle]');
    var panel = one('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initHero() {
    var slider = one('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = all('[data-hero-slide]', slider);
    var dots = all('[data-hero-dot]', slider);
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  function initSearchForms() {
    all('.site-search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = one('input[name="q"]', form);
        if (!input) {
          return;
        }
        var value = input.value.trim();
        if (!value) {
          event.preventDefault();
          window.location.href = './search.html';
        }
      });
    });
  }

  function initSearchPage() {
    var form = one('[data-search-filter]');
    var grid = one('[data-search-results]');
    if (!form || !grid) {
      return;
    }
    var input = one('[data-search-input]', form);
    var year = one('[data-year-filter]', form);
    var region = one('[data-region-filter]', form);
    var type = one('[data-type-filter]', form);
    var empty = one('[data-empty-state]');
    var cards = all('.movie-card', grid);
    var params = new URLSearchParams(window.location.search);

    if (params.get('q') && input) {
      input.value = params.get('q');
    }
    if (params.get('category') && input) {
      input.value = params.get('category');
    }

    function filter() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var y = year ? year.value : '';
      var r = region ? region.value : '';
      var t = type ? type.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        var match = true;
        if (q && text.indexOf(q) === -1) {
          match = false;
        }
        if (y && card.getAttribute('data-year') !== y) {
          match = false;
        }
        if (r && card.getAttribute('data-region') !== r) {
          match = false;
        }
        if (t && card.getAttribute('data-type') !== t) {
          match = false;
        }
        card.hidden = !match;
        if (match) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      filter();
    });
    [input, year, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filter);
        control.addEventListener('change', filter);
      }
    });
    filter();
  }

  function attachPlayer(video) {
    var source = video.getAttribute('data-stream');
    if (!source) {
      return;
    }
    var shell = video.closest('.player-shell');
    var trigger = shell ? one('[data-player-trigger]', shell) : null;
    var ready = false;
    var media = null;

    function setup() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        media = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        media.loadSource(source);
        media.attachMedia(video);
        return;
      }
      video.src = source;
    }

    function play() {
      setup();
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener('click', play);
    }
    video.addEventListener('click', setup);
    video.addEventListener('play', function () {
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
    });
    video.addEventListener('error', function () {
      if (media && media.destroy) {
        media.destroy();
        media = null;
        ready = false;
      }
    });
  }

  function initPlayers() {
    all('[data-video-player]').forEach(attachPlayer);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initSearchForms();
    initSearchPage();
    initPlayers();
  });
})();
