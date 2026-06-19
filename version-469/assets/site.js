(function() {
  var body = document.body;
  var root = body ? body.getAttribute('data-root') || './' : './';

  function joinRoot(path) {
    return root + String(path || '').replace(/^\.\//, '');
  }

  var menuButton = document.querySelector('[data-menu-button]');
  var menuPanel = document.querySelector('[data-menu-panel]');
  if (menuButton && menuPanel) {
    menuButton.addEventListener('click', function() {
      menuPanel.classList.toggle('is-open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var active = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    if (prev) {
      prev.addEventListener('click', function() {
        showSlide(active - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function() {
        showSlide(active + 1);
      });
    }
    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener('click', function() {
        showSlide(dotIndex);
      });
    });
    window.setInterval(function() {
      showSlide(active + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('[data-site-search]');
  var searchPanel = document.querySelector('[data-search-panel]');
  var searchForm = document.querySelector('[data-search-form]');
  var movies = window.SiteMovies || [];

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function resultItem(movie) {
    var link = document.createElement('a');
    link.className = 'search-result';
    link.href = joinRoot(movie.url);

    var image = document.createElement('img');
    image.src = joinRoot(movie.cover);
    image.alt = movie.title;
    image.loading = 'lazy';

    var text = document.createElement('div');
    var title = document.createElement('strong');
    title.textContent = movie.title;
    var meta = document.createElement('span');
    meta.textContent = [movie.year, movie.region, movie.genre].filter(Boolean).join(' · ');

    text.appendChild(title);
    text.appendChild(meta);
    link.appendChild(image);
    link.appendChild(text);
    return link;
  }

  function updateSearchPanel() {
    if (!searchInput || !searchPanel) {
      return;
    }
    var query = normalize(searchInput.value);
    searchPanel.innerHTML = '';
    if (!query) {
      searchPanel.classList.remove('is-open');
      return;
    }
    var results = movies.filter(function(movie) {
      return normalize(movie.title + ' ' + movie.year + ' ' + movie.region + ' ' + movie.genre + ' ' + movie.category).indexOf(query) !== -1;
    }).slice(0, 10);

    results.forEach(function(movie) {
      searchPanel.appendChild(resultItem(movie));
    });
    searchPanel.classList.toggle('is-open', results.length > 0);
  }

  if (searchInput) {
    searchInput.addEventListener('input', updateSearchPanel);
    searchInput.addEventListener('focus', updateSearchPanel);
    document.addEventListener('click', function(event) {
      if (searchPanel && !event.target.closest('[data-search-form]')) {
        searchPanel.classList.remove('is-open');
      }
    });
  }

  if (searchForm) {
    searchForm.addEventListener('submit', function(event) {
      var query = searchInput ? normalize(searchInput.value) : '';
      if (!query) {
        return;
      }
      var match = movies.find(function(movie) {
        return normalize(movie.title).indexOf(query) !== -1;
      });
      if (match) {
        event.preventDefault();
        window.location.href = joinRoot(match.url);
      }
    });
  }

  var listSearch = document.querySelector('[data-list-search]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-year]'));
  var activeYear = 'all';

  function filterCards() {
    var query = listSearch ? normalize(listSearch.value) : '';
    cards.forEach(function(card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' '));
      var year = card.getAttribute('data-year') || '';
      var matchesQuery = !query || text.indexOf(query) !== -1;
      var matchesYear = activeYear === 'all' || year === activeYear;
      card.classList.toggle('is-hidden', !(matchesQuery && matchesYear));
    });
  }

  if (listSearch) {
    listSearch.addEventListener('input', filterCards);
  }

  filterButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      activeYear = button.getAttribute('data-filter-year') || 'all';
      filterButtons.forEach(function(item) {
        item.classList.toggle('is-active', item === button);
      });
      filterCards();
    });
  });

  var params = new URLSearchParams(window.location.search);
  var queryFromUrl = params.get('q');
  if (queryFromUrl && listSearch) {
    listSearch.value = queryFromUrl;
    filterCards();
  }
}());
