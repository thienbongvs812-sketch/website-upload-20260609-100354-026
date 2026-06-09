import { H as Hls } from './hls-vendor-dru42stk.js';

const button = document.querySelector('[data-play-button]');
const overlay = document.querySelector('[data-video-overlay]');
const video = document.querySelector('[data-video-player]');
const status = document.querySelector('[data-player-status]');
let hlsInstance = null;

function setStatus(message) {
  if (status) {
    status.textContent = message;
  }
}

function attachHls(src) {
  if (!video || !src) {
    setStatus('未找到播放源。');
    return;
  }

  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }

  if (Hls && Hls.isSupported()) {
    hlsInstance = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hlsInstance.loadSource(src);
    hlsInstance.attachMedia(video);
    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
      setStatus('播放源已加载，可使用播放器控制栏调节进度、音量与全屏。');
      video.play().catch(function () {
        setStatus('浏览器阻止了自动播放，请再次点击播放按钮。');
      });
    });
    hlsInstance.on(Hls.Events.ERROR, function (_, data) {
      if (data && data.fatal) {
        setStatus('播放源加载异常，请刷新页面后重试。');
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = src;
    video.addEventListener('loadedmetadata', function () {
      setStatus('播放源已加载，可开始播放。');
      video.play().catch(function () {
        setStatus('请点击播放器上的播放按钮开始观看。');
      });
    }, { once: true });
  } else {
    video.src = src;
    setStatus('当前浏览器可能不完整支持 HLS，请尝试使用 Chrome、Edge、Firefox 或 Safari。');
  }
}

if (button && video) {
  button.addEventListener('click', function () {
    const src = button.getAttribute('data-src');
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    video.setAttribute('controls', 'controls');
    attachHls(src);
  });
}
