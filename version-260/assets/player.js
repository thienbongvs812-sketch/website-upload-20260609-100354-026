(function () {
  const shell = document.querySelector('[data-player]');

  if (!shell) {
    return;
  }

  const video = shell.querySelector('video[data-stream]');
  const trigger = shell.querySelector('[data-play-trigger]');
  let hls = null;
  let loaded = false;

  const load = function () {
    if (!video || loaded) {
      if (video) {
        video.play().catch(function () {});
      }
      return;
    }

    const stream = video.getAttribute('data-stream');

    if (!stream) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
    } else {
      video.src = stream;
    }

    loaded = true;
    video.play().catch(function () {});
  };

  if (trigger) {
    trigger.addEventListener('click', function () {
      trigger.classList.add('is-hidden');
      load();
    });
  }

  if (video) {
    video.addEventListener('play', function () {
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
    });

    video.addEventListener('click', load);
  }

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
