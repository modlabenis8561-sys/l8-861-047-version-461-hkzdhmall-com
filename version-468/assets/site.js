(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');
    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        menu.classList.toggle('open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) return;
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === current);
        });
      }

      function play() {
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      function restart() {
        if (timer) window.clearInterval(timer);
        play();
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-hero-dot')) || 0);
          restart();
        });
      });

      if (prev) {
        prev.addEventListener('click', function () {
          show(current - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(current + 1);
          restart();
        });
      }

      play();
    }

    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var noResults = document.querySelector('[data-no-results]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = (params.get('q') || '').trim();

    function normalize(value) {
      return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function applySearch(query) {
      var needle = normalize(query);
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-category'),
          card.textContent
        ].join(' '));
        var hit = !needle || text.indexOf(needle) !== -1;
        card.style.display = hit ? '' : 'none';
        if (hit) visible += 1;
      });
      if (noResults) {
        noResults.classList.toggle('show', visible === 0 && cards.length > 0);
      }
    }

    forms.forEach(function (form) {
      var input = form.querySelector('input[name="q"]');
      if (input && initialQuery && cards.length) {
        input.value = initialQuery;
      }
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = input ? input.value.trim() : '';
        if (cards.length) {
          applySearch(query);
        } else {
          var target = './movies.html';
          window.location.href = query ? target + '?q=' + encodeURIComponent(query) : target;
        }
      });
      if (input && cards.length) {
        input.addEventListener('input', function () {
          applySearch(input.value.trim());
        });
      }
    });

    if (cards.length && initialQuery) {
      applySearch(initialQuery);
    }
  });
})();
