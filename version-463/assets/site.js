(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setHero(index, slides) {
        if (!slides.length) {
            return;
        }
        var safeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, current) {
            slide.classList.toggle('is-active', current === safeIndex);
        });
        return safeIndex;
    }

    document.addEventListener('DOMContentLoaded', function () {
        var toggle = document.querySelector('.mobile-toggle');
        var mobileNav = document.querySelector('.mobile-nav');

        if (toggle && mobileNav) {
            toggle.addEventListener('click', function () {
                mobileNav.classList.toggle('is-open');
            });
        }

        var slides = selectAll('.hero-slide');
        var heroIndex = 0;

        if (slides.length) {
            heroIndex = setHero(0, slides);
            selectAll('[data-hero-next]').forEach(function (button) {
                button.addEventListener('click', function () {
                    heroIndex = setHero(heroIndex + 1, slides);
                });
            });
            selectAll('[data-hero-prev]').forEach(function (button) {
                button.addEventListener('click', function () {
                    heroIndex = setHero(heroIndex - 1, slides);
                });
            });
            window.setInterval(function () {
                heroIndex = setHero(heroIndex + 1, slides);
            }, 6200);
        }

        selectAll('.site-search').forEach(function (form) {
            var input = form.querySelector('input[name="q"]');
            var panel = form.querySelector('.search-panel');

            if (!input || !panel || !window.SEARCH_INDEX) {
                return;
            }

            function render() {
                var q = normalize(input.value);
                if (!q) {
                    panel.classList.remove('is-open');
                    panel.innerHTML = '';
                    return;
                }

                var results = window.SEARCH_INDEX.filter(function (item) {
                    var pool = normalize([item.title, item.year, item.genre, item.region, item.category, item.tags].join(' '));
                    return pool.indexOf(q) !== -1;
                }).slice(0, 8);

                panel.innerHTML = results.map(function (item) {
                    return '<a href="' + item.url + '"><strong>' + item.title + '</strong><span>' + [item.year, item.genre, item.category].filter(Boolean).join(' · ') + '</span></a>';
                }).join('');
                panel.classList.toggle('is-open', results.length > 0);
            }

            input.addEventListener('input', render);
            form.addEventListener('submit', function (event) {
                if (!normalize(input.value)) {
                    event.preventDefault();
                }
            });
            document.addEventListener('click', function (event) {
                if (!form.contains(event.target)) {
                    panel.classList.remove('is-open');
                }
            });
        });

        var filterInput = document.querySelector('[data-page-filter]');
        var cards = selectAll('.movie-card[data-search]');
        var emptyState = document.querySelector('[data-empty-state]');
        var filterButtons = selectAll('[data-filter-value]');
        var activeFilter = 'all';

        function applyFilter() {
            if (!cards.length) {
                return;
            }

            var q = normalize(filterInput ? filterInput.value : '');
            var shown = 0;

            cards.forEach(function (card) {
                var textMatch = !q || normalize(card.getAttribute('data-search')).indexOf(q) !== -1;
                var bucketMatch = activeFilter === 'all' || card.getAttribute('data-bucket') === activeFilter;
                var visible = textMatch && bucketMatch;
                card.style.display = visible ? '' : 'none';
                if (visible) {
                    shown += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', shown === 0);
            }
        }

        if (filterInput) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q) {
                filterInput.value = q;
            }
            filterInput.addEventListener('input', applyFilter);
        }

        filterButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeFilter = button.getAttribute('data-filter-value') || 'all';
                filterButtons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                applyFilter();
            });
        });

        applyFilter();
    });
})();
