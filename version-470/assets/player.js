(function () {
  function createPlayer(container) {
    var video = container.querySelector('video');
    var startButton = container.querySelector('.player-start');
    var source = container.getAttribute('data-video-src');
    var attached = false;
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (attached) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }

      attached = true;
    }

    function play() {
      attachSource();
      if (startButton) {
        startButton.classList.add('is-hidden');
      }
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {
          if (startButton) {
            startButton.classList.remove('is-hidden');
          }
        });
      }
    }

    if (startButton) {
      startButton.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (!attached) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (startButton) {
        startButton.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (!video.currentTime && startButton) {
        startButton.classList.remove('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(createPlayer);
})();
