(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var navMenu = document.querySelector('[data-nav-menu]');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navMenu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-missing');
    });
  });

  document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var nextButton = carousel.querySelector('[data-hero-next]');
    var previousButton = carousel.querySelector('[data-hero-prev]');
    var current = 0;
    var timer;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    if (previousButton) {
      previousButton.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var container = panel.closest('main') || document;
    var list = container.querySelector('[data-filter-list]');
    var searchInput = panel.querySelector('[data-search-input]');
    var typeFilter = panel.querySelector('[data-type-filter]');
    var yearFilter = panel.querySelector('[data-year-filter]');

    if (!list) {
      return;
    }

    var items = Array.prototype.slice.call(list.children);

    function applyFilters() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var type = typeFilter ? typeFilter.value : '';
      var year = yearFilter ? yearFilter.value : '';

      items.forEach(function (item) {
        var searchText = item.getAttribute('data-search') || '';
        var itemType = item.getAttribute('data-type') || '';
        var itemYear = item.getAttribute('data-year') || '';
        var matchesQuery = !query || searchText.indexOf(query) !== -1;
        var matchesType = !type || itemType === type;
        var matchesYear = !year || itemYear === year;
        item.classList.toggle('is-hidden-card', !(matchesQuery && matchesType && matchesYear));
      });
    }

    [searchInput, typeFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  });
})();
