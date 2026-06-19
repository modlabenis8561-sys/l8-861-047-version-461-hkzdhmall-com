import { H as Hls } from './hls.js';

function bindPlayer(shell) {
  var video = shell.querySelector('video');
  var button = shell.querySelector('[data-player-start]');
  var source = shell.getAttribute('data-hls-source');
  var hlsInstance = null;

  if (!video || !source) {
    return;
  }

  function attachSource() {
    if (video.dataset.sourceReady === 'true') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.dataset.sourceReady = 'true';
      return;
    }

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      video.dataset.sourceReady = 'true';
    } else {
      video.src = source;
      video.dataset.sourceReady = 'true';
    }
  }

  function playVideo() {
    attachSource();
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        video.setAttribute('controls', 'controls');
      });
    }
  }

  shell.addEventListener('click', function (event) {
    if (event.target === video || event.target.closest('[data-player-start]')) {
      playVideo();
    }
  });

  video.addEventListener('play', function () {
    if (button) {
      button.classList.add('hide');
    }
  });

  video.addEventListener('pause', function () {
    if (button && video.currentTime === 0) {
      button.classList.remove('hide');
    }
  });

  video.addEventListener('ended', function () {
    if (button) {
      button.classList.remove('hide');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-hls-source]').forEach(bindPlayer);
});
