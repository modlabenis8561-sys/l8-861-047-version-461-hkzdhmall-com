(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.style.opacity = '0';
        });
    });

    var carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        var show = function (index) {
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
        };

        var start = function () {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5800);
        };

        var stop = function () {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                stop();
                show(index);
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        start();
    }

    var searchPage = document.querySelector('[data-search-page]');

    if (searchPage) {
        var input = searchPage.querySelector('[data-search-input]');
        var select = searchPage.querySelector('[data-filter-select]');
        var list = searchPage.querySelector('[data-movie-list]');
        var cards = Array.prototype.slice.call(searchPage.querySelectorAll('.movie-card'));
        var status = searchPage.querySelector('[data-filter-status]');
        var empty = searchPage.querySelector('[data-empty-state]');
        var buttons = Array.prototype.slice.call(searchPage.querySelectorAll('[data-view]'));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        var filter = function () {
            var query = input ? input.value.trim().toLowerCase() : '';
            var category = select ? select.value : 'all';
            var visible = 0;

            cards.forEach(function (card) {
                var matchesQuery = !query || (card.getAttribute('data-search') || '').indexOf(query) !== -1;
                var matchesCategory = category === 'all' || card.getAttribute('data-category') === category;
                var showCard = matchesQuery && matchesCategory;

                card.style.display = showCard ? '' : 'none';

                if (showCard) {
                    visible += 1;
                }
            });

            if (status) {
                status.textContent = query || category !== 'all' ? '筛选结果已更新' : '精选影片已就绪';
            }

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        };

        if (input) {
            input.addEventListener('input', filter);
        }

        if (select) {
            select.addEventListener('change', filter);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                buttons.forEach(function (item) {
                    item.classList.remove('is-active');
                });

                button.classList.add('is-active');

                if (list) {
                    list.classList.toggle('is-wide', button.getAttribute('data-view') === 'wide');
                }
            });
        });

        filter();
    }

    var hlsScriptPromise = null;

    var loadHls = function () {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        if (hlsScriptPromise) {
            return hlsScriptPromise;
        }

        hlsScriptPromise = new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js';
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });

        return hlsScriptPromise;
    };

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var source = video ? video.querySelector('source') : null;
        var button = player.querySelector('[data-play-button]');
        var hlsInstance = null;

        if (!video || !source || !button) {
            return;
        }

        var streamUrl = source.getAttribute('src');

        var playVideo = function () {
            button.classList.add('is-hidden');
            video.controls = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                video.play().catch(function () {});
                return;
            }

            loadHls().then(function (Hls) {
                if (Hls && Hls.isSupported()) {
                    if (hlsInstance) {
                        hlsInstance.destroy();
                    }

                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: false,
                        backBufferLength: 90
                    });

                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    return;
                }

                video.src = streamUrl;
                video.play().catch(function () {});
            }).catch(function () {
                video.src = streamUrl;
                video.play().catch(function () {});
            });
        };

        button.addEventListener('click', playVideo);

        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });
    });
})();
