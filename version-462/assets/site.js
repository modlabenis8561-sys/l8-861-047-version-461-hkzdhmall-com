(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function cardText(card) {
    return normalize([
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-year'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags'),
      card.textContent
    ].join(' '));
  }

  function applyLocalFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list]'));

    lists.forEach(function (list) {
      var wrapper = list.closest('.container') || document;
      var searchInput = wrapper.querySelector('[data-local-search]');
      var activeButton = wrapper.querySelector('[data-filter-bar] button.active');
      var empty = wrapper.querySelector('[data-empty-state]');
      var query = normalize(searchInput ? searchInput.value : '');
      var selected = normalize(activeButton ? activeButton.getAttribute('data-filter-value') : 'all');
      var visibleCount = 0;

      Array.prototype.slice.call(list.querySelectorAll('[data-filter-card]')).forEach(function (card) {
        var text = cardText(card);
        var matchesText = query === '' || text.indexOf(query) !== -1;
        var matchesFilter = selected === 'all' || text.indexOf(selected) !== -1;
        var visible = matchesText && matchesFilter;
        card.classList.toggle('hidden-by-filter', !visible);
        if (visible) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visibleCount === 0);
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-bar] button')).forEach(function (button) {
    button.addEventListener('click', function () {
      var bar = button.closest('[data-filter-bar]');
      Array.prototype.slice.call(bar.querySelectorAll('button')).forEach(function (item) {
        item.classList.remove('active');
      });
      button.classList.add('active');
      applyLocalFilters();
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-local-search]')).forEach(function (input) {
    input.addEventListener('input', applyLocalFilters);
  });

  applyLocalFilters();

  var searchInput = document.querySelector('[data-search-input]');
  var searchResults = document.querySelector('[data-search-results]');
  var searchEmpty = document.querySelector('[data-search-empty]');
  var searchNote = document.querySelector('[data-search-note]');

  if (searchInput && searchResults) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    searchInput.value = initialQuery;

    function runSearch() {
      var query = normalize(searchInput.value);
      var visibleCount = 0;

      Array.prototype.slice.call(searchResults.querySelectorAll('[data-search-card]')).forEach(function (card) {
        var visible = query === '' || cardText(card).indexOf(query) !== -1;
        card.classList.toggle('hidden-by-search', !visible);
        if (visible) {
          visibleCount += 1;
        }
      });

      if (searchEmpty) {
        searchEmpty.classList.toggle('show', visibleCount === 0);
      }

      if (searchNote) {
        searchNote.textContent = query ? '与“' + searchInput.value + '”相关的影视内容' : '浏览全部影视内容';
      }
    }

    searchInput.addEventListener('input', runSearch);
    runSearch();
  }

  function setupPlayer(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.play-overlay');
    var stream = player.getAttribute('data-stream');
    var loaded = false;
    var hlsInstance = null;

    if (!video || !button || !stream) {
      return;
    }

    function loadVideo() {
      if (loaded) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }

      loaded = true;
    }

    function startVideo() {
      loadVideo();
      player.classList.add('is-playing');
      var playResult = video.play();

      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
    }

    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      startVideo();
    });

    player.addEventListener('click', function (event) {
      if (event.target === player) {
        startVideo();
      }
    });

    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
})();
