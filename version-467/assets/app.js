(function () {
  function q(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = q('[data-menu-toggle]');
    var menu = q('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var slider = q('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = qa('[data-hero-slide]', slider);
    var dots = qa('[data-hero-dot]', slider);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    show(0);
    start();
  }

  function initSearch() {
    qa('[data-search-area]').forEach(function (area) {
      var input = q('[data-search-input]', area);
      var cards = qa('[data-search-card]', area);
      var chips = qa('[data-filter-chip]', area);
      var activeFilter = 'all';
      function apply() {
        var term = input ? input.value.trim().toLowerCase() : '';
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search-text') || '').toLowerCase();
          var filter = card.getAttribute('data-filter') || '';
          var okTerm = !term || text.indexOf(term) !== -1;
          var okFilter = activeFilter === 'all' || filter.indexOf(activeFilter) !== -1;
          card.classList.toggle('is-hidden', !(okTerm && okFilter));
        });
      }
      if (input) {
        input.addEventListener('input', apply);
      }
      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          chips.forEach(function (c) {
            c.classList.remove('is-active');
          });
          chip.classList.add('is-active');
          activeFilter = chip.getAttribute('data-filter-chip') || 'all';
          apply();
        });
      });
    });
  }

  window.initMoviePlayer = function (streamUrl) {
    var video = q('[data-player-video]');
    var cover = q('[data-player-cover]');
    var startButton = q('[data-player-start]');
    var ready = false;
    var hls;
    if (!video || !streamUrl) {
      return;
    }
    function attach() {
      if (ready) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      ready = true;
    }
    function play() {
      attach();
      video.controls = true;
      if (cover) {
        cover.hidden = true;
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }
    if (startButton) {
      startButton.addEventListener('click', play);
    }
    if (cover) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initSearch();
  });
})();
