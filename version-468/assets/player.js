(function () {
  function initMoviePlayer(streamUrl) {
    var video = document.getElementById('movieVideo');
    var overlay = document.getElementById('playOverlay');
    var message = document.getElementById('playerMessage');
    var hls = null;

    if (!video || !streamUrl) return;

    function setMessage(text) {
      if (message) message.textContent = text || '';
    }

    function attachSource() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('视频暂时无法播放，请稍后再试');
          }
        });
        return;
      }

      setMessage('视频暂时无法播放，请稍后再试');
    }

    function hideOverlay() {
      if (overlay) overlay.classList.add('is-hidden');
    }

    function showOverlay() {
      if (overlay && video.paused) overlay.classList.remove('is-hidden');
    }

    function startPlayback() {
      hideOverlay();
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          showOverlay();
        });
      }
    }

    attachSource();

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (video.paused) startPlayback();
    });

    video.addEventListener('play', hideOverlay);
    video.addEventListener('pause', showOverlay);
    video.addEventListener('ended', showOverlay);

    window.addEventListener('pagehide', function () {
      if (hls) hls.destroy();
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
