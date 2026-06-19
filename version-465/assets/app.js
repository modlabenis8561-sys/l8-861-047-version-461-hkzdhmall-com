(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-site-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var section = panel.parentElement;
      var list = section ? section.querySelector('[data-filter-list]') : null;
      if (!list) {
        return;
      }

      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
      var searchInput = panel.querySelector('[data-search-input]');
      var categorySelect = panel.querySelector('[data-category-filter]');
      var regionSelect = panel.querySelector('[data-region-filter]');
      var typeSelect = panel.querySelector('[data-type-filter]');
      var sortSelect = panel.querySelector('[data-sort-select]');
      var count = panel.querySelector('[data-filter-count]');
      var chips = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-chip]'));

      function getValue(element) {
        return element ? element.value.trim() : '';
      }

      function apply() {
        var keyword = getValue(searchInput).toLowerCase();
        var category = getValue(categorySelect);
        var region = getValue(regionSelect);
        var type = getValue(typeSelect);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-search') || '').toLowerCase();
          var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesCategory = !category || card.getAttribute('data-category') === category;
          var matchesRegion = !region || card.getAttribute('data-region') === region;
          var matchesType = !type || card.getAttribute('data-type') === type;
          var shouldShow = matchesKeyword && matchesCategory && matchesRegion && matchesType;
          card.classList.toggle('is-hidden', !shouldShow);
          if (shouldShow) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = '当前显示 ' + visible + ' 部影片';
        }
      }

      function sortCards() {
        var mode = getValue(sortSelect);
        var sorted = cards.slice();
        if (mode === 'views') {
          sorted.sort(function (a, b) {
            return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
          });
        } else if (mode === 'year') {
          sorted.sort(function (a, b) {
            return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
          });
        } else if (mode === 'title') {
          sorted.sort(function (a, b) {
            return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
          });
        } else {
          sorted = cards.slice();
        }
        sorted.forEach(function (card) {
          list.appendChild(card);
        });
        apply();
      }

      [searchInput, categorySelect, regionSelect, typeSelect].forEach(function (element) {
        if (element) {
          element.addEventListener('input', apply);
          element.addEventListener('change', apply);
        }
      });

      if (sortSelect) {
        sortSelect.addEventListener('change', sortCards);
      }

      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          chips.forEach(function (button) {
            button.classList.remove('active');
          });
          chip.classList.add('active');
          if (categorySelect) {
            categorySelect.value = chip.getAttribute('data-filter-chip') || '';
          }
          apply();
        });
      });

      apply();
    });
  }

  function attachSourceToVideo(player, url, autoplay) {
    var video = player.querySelector('video');
    if (!video || !url) {
      return;
    }

    if (player._hls) {
      player._hls.destroy();
      player._hls = null;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      player._hls = hls;
      if (autoplay) {
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      if (autoplay) {
        video.play().catch(function () {});
      }
    } else {
      video.src = url;
      if (autoplay) {
        video.play().catch(function () {});
      }
    }
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var playButton = player.querySelector('[data-play-button]');
      var currentUrl = player.getAttribute('data-m3u8');
      var sourceRow = player.parentElement ? player.parentElement.querySelector('.source-row') : null;
      var sourceButtons = sourceRow ? Array.prototype.slice.call(sourceRow.querySelectorAll('[data-source-url]')) : [];

      attachSourceToVideo(player, currentUrl, false);

      function play() {
        attachSourceToVideo(player, currentUrl, true);
        player.classList.add('is-playing');
      }

      if (playButton) {
        playButton.addEventListener('click', play);
      }

      if (video) {
        video.addEventListener('play', function () {
          player.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
          if (video.currentTime === 0) {
            player.classList.remove('is-playing');
          }
        });
      }

      sourceButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          currentUrl = button.getAttribute('data-source-url');
          sourceButtons.forEach(function (item) {
            item.classList.remove('active');
          });
          button.classList.add('active');
          player.setAttribute('data-m3u8', currentUrl);
          attachSourceToVideo(player, currentUrl, true);
          player.classList.add('is-playing');
        });
      });
    });
  }

  function setupPosterFallbacks() {
    var images = Array.prototype.slice.call(document.querySelectorAll('img'));
    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.style.display = 'none';
        if (image.parentElement) {
          image.parentElement.classList.add('poster-missing');
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
    setupPosterFallbacks();
  });
}());
