import { H as Hls } from './hls-vendor.js';

function initHero() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) {
    return;
  }
  const slides = Array.from(hero.querySelectorAll('.hero-slide'));
  const dots = Array.from(hero.querySelectorAll('.hero-dot'));
  let current = 0;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => show(index));
  });

  if (slides.length > 1) {
    window.setInterval(() => show(current + 1), 5200);
  }
}

function initPlayers() {
  const players = document.querySelectorAll('[data-player]');
  players.forEach((player) => {
    const video = player.querySelector('video');
    const button = player.querySelector('.play-overlay');
    const source = player.getAttribute('data-video-url');
    let loaded = false;
    let hls = null;

    function load() {
      if (!video || !source || loaded) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: false });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      loaded = true;
    }

    function play() {
      load();
      if (button) {
        button.hidden = true;
      }
      if (video) {
        video.controls = true;
        const result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(() => {});
        }
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('click', () => {
        if (!loaded || video.paused) {
          play();
        }
      });
    }
    window.addEventListener('beforeunload', () => {
      if (hls) {
        hls.destroy();
      }
    });
  });
}

function initSearch() {
  const input = document.getElementById('site-search-input');
  const category = document.getElementById('site-search-category');
  const year = document.getElementById('site-search-year');
  const results = document.getElementById('search-results');
  const count = document.getElementById('search-count');
  const data = window.SEARCH_MOVIES || [];

  if (!input || !category || !year || !results || !count || !data.length) {
    return;
  }

  const years = Array.from(new Set(data.map((item) => item.year))).sort((a, b) => b - a);
  years.forEach((value) => {
    const option = document.createElement('option');
    option.value = String(value);
    option.textContent = String(value);
    year.appendChild(option);
  });

  function card(item) {
    const tags = item.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
    return `
<article class="movie-card movie-card-small">
  <a class="movie-poster" href="${item.url}" aria-label="${escapeHtml(item.title)}">
    <img src="./${item.cover}.jpg" alt="${escapeHtml(item.title)}" loading="lazy">
    <span class="poster-type">${escapeHtml(item.type)}</span>
    <span class="poster-year">${item.year}</span>
  </a>
  <div class="movie-card-body">
    <h3><a href="${item.url}">${escapeHtml(item.title)}</a></h3>
    <p>${escapeHtml(item.oneLine)}</p>
    <div class="tag-row">${tags}</div>
  </div>
</article>`;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function render() {
    const query = input.value.trim().toLowerCase();
    const catValue = category.value;
    const yearValue = year.value;
    let filtered = data.filter((item) => {
      const keyword = [item.title, item.oneLine, item.region, item.type, item.genre, item.tags.join(' ')].join(' ').toLowerCase();
      const queryMatch = !query || keyword.includes(query);
      const categoryMatch = !catValue || item.category === catValue;
      const yearMatch = !yearValue || String(item.year) === yearValue;
      return queryMatch && categoryMatch && yearMatch;
    });
    filtered = filtered.slice(0, 120);
    results.innerHTML = filtered.map(card).join('');
    count.textContent = `共找到 ${filtered.length} 条结果`;
  }

  input.addEventListener('input', render);
  category.addEventListener('change', render);
  year.addEventListener('change', render);
  render();
}

document.addEventListener('DOMContentLoaded', () => {
  initHero();
  initPlayers();
  initSearch();
});
