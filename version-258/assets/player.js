import { H as Hls } from './hls-vendor-dru42stk.js';

function updateStatus(player, message) {
  var status = player.querySelector('[data-player-status]');

  if (status) {
    status.textContent = message;
  }
}

function canUseNativeHls(video) {
  return Boolean(video.canPlayType('application/vnd.apple.mpegurl'));
}

function attachNative(video, src) {
  video.src = src;
}

function attachWithHlsJs(player, video, src, fallbackSrc) {
  var hls = new Hls({
    enableWorker: true,
    lowLatencyMode: false,
    backBufferLength: 90
  });
  var fallbackUsed = false;

  function load(source) {
    hls.loadSource(source);
    hls.attachMedia(video);
  }

  hls.on(Hls.Events.MANIFEST_PARSED, function () {
    video.play().catch(function () {
      updateStatus(player, '播放源已加载，请再次点击播放按钮。');
    });
  });

  hls.on(Hls.Events.ERROR, function (event, data) {
    if (!data || !data.fatal) {
      return;
    }

    if (!fallbackUsed && fallbackSrc) {
      fallbackUsed = true;
      updateStatus(player, '外部播放源暂不可用，正在切换本地 HLS 播放源。');
      hls.stopLoad();
      load(fallbackSrc);
      return;
    }

    updateStatus(player, '当前浏览器无法加载该播放源，请刷新后重试。');
  });

  load(src);
}

function startPlayer(player) {
  var video = player.querySelector('video');
  var src = player.getAttribute('data-hls-src');
  var fallbackSrc = player.getAttribute('data-fallback-src');

  if (!video || !src) {
    updateStatus(player, '播放源未找到。');
    return;
  }

  player.classList.add('is-playing');
  updateStatus(player, '正在加载高清播放源。');

  if (canUseNativeHls(video)) {
    attachNative(video, src);
    video.play().catch(function () {
      updateStatus(player, '播放源已绑定，请点击视频控件继续播放。');
    });
    return;
  }

  if (Hls && Hls.isSupported()) {
    attachWithHlsJs(player, video, src, fallbackSrc);
    return;
  }

  if (fallbackSrc) {
    attachNative(video, fallbackSrc);
    video.play().catch(function () {
      updateStatus(player, '浏览器不支持 HLS 自动播放，请使用支持 HLS 的浏览器访问。');
    });
    return;
  }

  updateStatus(player, '当前浏览器不支持 HLS 播放。');
}

function initPlayers() {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var button = player.querySelector('[data-play]');

    if (!button) {
      return;
    }

    button.addEventListener('click', function () {
      startPlayer(player);
    }, { once: true });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPlayers);
} else {
  initPlayers();
}
