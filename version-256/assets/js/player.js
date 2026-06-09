(function (global) {
    function initMoviePlayer(videoId, coverId, streamUrl) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);
        var attached = false;
        var hlsInstance = null;

        if (!video || !streamUrl) {
            return;
        }

        function attachStream() {
            if (attached) {
                return;
            }

            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                return;
            }

            if (global.Hls && global.Hls.isSupported()) {
                hlsInstance = new global.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = streamUrl;
        }

        function startPlayback() {
            attachStream();

            if (cover) {
                cover.classList.add("is-hidden");
            }

            var playRequest = video.play();

            if (playRequest && typeof playRequest.catch === "function") {
                playRequest.catch(function () {});
            }
        }

        attachStream();

        if (cover) {
            cover.addEventListener("click", startPlayback);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });

        global.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    global.initMoviePlayer = initMoviePlayer;
})(window);
