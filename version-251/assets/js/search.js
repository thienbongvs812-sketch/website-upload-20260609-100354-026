(function () {
  var index = window.SEARCH_INDEX || [];

  function $(selector) {
    return document.querySelector(selector);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function params() {
    return new URLSearchParams(window.location.search);
  }

  function unique(field) {
    var seen = {};
    return index
      .map(function (item) { return item[field]; })
      .filter(function (value) {
        if (!value || seen[value]) {
          return false;
        }
        seen[value] = true;
        return true;
      })
      .sort(function (a, b) {
        if (field === 'year') {
          return Number(b) - Number(a);
        }
        return String(a).localeCompare(String(b), 'zh-CN');
      });
  }

  function fillSelect(selector, values) {
    var select = $(selector);
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function card(item) {
    return '' +
      '<article class="movie-card" data-movie-card>' +
      '<a class="poster-link" href="' + escapeHtml(item.href) + '" aria-label="' + escapeHtml(item.title) + '">' +
      '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
      '<span class="poster-badge">' + escapeHtml(item.year) + '</span>' +
      '<span class="poster-play">▶</span>' +
      '</a>' +
      '<div class="movie-card-body">' +
      '<div class="movie-meta-line"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.rating) + '</span></div>' +
      '<h3><a href="' + escapeHtml(item.href) + '">' + escapeHtml(item.title) + '</a></h3>' +
      '<p>' + escapeHtml(item.oneLine) + '</p>' +
      '<div class="card-tags">' + item.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>' +
      '</div>' +
      '</article>';
  }

  function run() {
    var input = $('[data-search-input]');
    var yearSelect = $('[data-search-year]');
    var typeSelect = $('[data-search-type]');
    var regionSelect = $('[data-search-region]');
    var results = $('[data-search-results]');
    var empty = $('[data-search-empty]');
    if (!input || !results) {
      return;
    }
    var q = input.value.trim().toLowerCase();
    var year = yearSelect && yearSelect.value || '';
    var type = typeSelect && typeSelect.value || '';
    var region = regionSelect && regionSelect.value || '';
    var matched = index.filter(function (item) {
      var haystack = [item.title, item.region, item.type, item.year, item.genre, item.category, item.oneLine].concat(item.tags || []).join(' ').toLowerCase();
      return (!q || haystack.indexOf(q) > -1) && (!year || item.year === year) && (!type || item.type === type) && (!region || item.region === region);
    }).slice(0, 120);
    results.innerHTML = matched.map(card).join('');
    if (empty) {
      empty.hidden = matched.length !== 0;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var form = $('[data-search-form]');
    var input = $('[data-search-input]');
    fillSelect('[data-search-year]', unique('year'));
    fillSelect('[data-search-type]', unique('type'));
    fillSelect('[data-search-region]', unique('region'));
    if (input) {
      input.value = params().get('q') || '';
      input.addEventListener('input', run);
    }
    ['[data-search-year]', '[data-search-type]', '[data-search-region]'].forEach(function (selector) {
      var el = $(selector);
      if (el) {
        el.addEventListener('change', run);
      }
    });
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        run();
      });
    }
    run();
  });
}());
