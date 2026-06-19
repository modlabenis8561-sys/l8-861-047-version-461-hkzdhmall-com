(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initHeaderSearch() {
    qsa('[data-site-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = qs('input[name="q"]', form);
        var value = input ? input.value.trim() : '';
        var base = form.closest('.site-header') && location.pathname.indexOf('/movies/') !== -1 ? '../search.html' : './search.html';
        if (value) {
          location.href = base + '?q=' + encodeURIComponent(value);
        } else {
          location.href = base;
        }
      });
    });
  }

  function initHero() {
    var root = qs('[data-hero]');
    if (!root) {
      return;
    }
    var slides = qsa('[data-hero-slide]', root);
    var dots = qsa('[data-hero-dot]', root);
    var prev = qs('[data-hero-prev]', root);
    var next = qs('[data-hero-next]', root);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        var isActive = slideIndex === index;
        slide.classList.toggle('active', isActive);
        slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });
    restart();
  }

  function normalized(text) {
    return String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function initFilters() {
    qsa('[data-filter-root]').forEach(function (root) {
      var input = qs('[data-filter-input]', root);
      var cards = qsa('[data-filter-card]', root);
      var empty = qs('[data-filter-empty]', root);
      var yearButtons = qsa('[data-filter-year]', root);
      var regionButtons = qsa('[data-filter-region]', root);
      var selectedYear = '';
      var selectedRegion = '';

      function apply() {
        var query = normalized(input ? input.value : '');
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalized([
            card.dataset.title,
            card.dataset.year,
            card.dataset.region,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.tags
          ].join(' '));
          var matchText = !query || haystack.indexOf(query) !== -1;
          var matchYear = !selectedYear || card.dataset.year === selectedYear;
          var matchRegion = !selectedRegion || card.dataset.region === selectedRegion;
          var show = matchText && matchYear && matchRegion;
          card.style.display = show ? '' : 'none';
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      yearButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          selectedYear = button.getAttribute('data-filter-year') || '';
          yearButtons.forEach(function (item) {
            item.classList.toggle('active', item === button);
          });
          apply();
        });
      });
      regionButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          selectedRegion = button.getAttribute('data-filter-region') || '';
          regionButtons.forEach(function (item) {
            item.classList.toggle('active', item === button);
          });
          apply();
        });
      });
      apply();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHeaderSearch();
    initHero();
    initFilters();
  });
})();
