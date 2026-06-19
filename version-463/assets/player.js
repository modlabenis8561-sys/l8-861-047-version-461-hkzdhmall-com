(function () {
    function setupPlayer(root) {
        var video = root.querySelector('video');
        var layer = root.querySelector('.play-layer');
        var source = root.getAttribute('data-play');
        var hls = null;

        if (!video || !source) {
            return;
        }

        function bindMedia() {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (!video.getAttribute('src')) {
                    video.setAttribute('src', source);
                }
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                if (!hls) {
                    hls = new window.Hls({
                        maxBufferLength: 30,
                        capLevelToPlayerSize: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                }
                return;
            }

            if (!video.getAttribute('src')) {
                video.setAttribute('src', source);
            }
        }

        function start() {
            bindMedia();
            if (layer) {
                layer.classList.add('is-hidden');
            }
            var playPromise = video.play();
            if (playPromise && playPromise.catch) {
                playPromise.catch(function () {});
            }
        }

        if (layer) {
            layer.addEventListener('click', start);
            layer.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    start();
                }
            });
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(setupPlayer);
    });
})();
