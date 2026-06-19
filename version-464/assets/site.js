(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("is-missing");
      }, { once: true });
    });

    var navToggle = document.querySelector("[data-nav-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");
    if (navToggle && mobilePanel) {
      navToggle.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
        document.body.classList.toggle("nav-open", mobilePanel.classList.contains("is-open"));
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length > 1) {
      var active = 0;
      var showSlide = function (index) {
        active = index % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === active);
        });
      };
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
        });
      });
      window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    var searchPage = document.querySelector("[data-search-page]");
    if (searchPage) {
      var keywordInput = searchPage.querySelector("[data-search-input]");
      var categorySelect = searchPage.querySelector("[data-category-select]");
      var regionSelect = searchPage.querySelector("[data-region-select]");
      var yearSelect = searchPage.querySelector("[data-year-select]");
      var cards = Array.prototype.slice.call(searchPage.querySelectorAll("[data-movie-card]"));
      var emptyState = searchPage.querySelector("[data-empty-state]");
      if (keywordInput && !keywordInput.value) {
        var params = new URLSearchParams(window.location.search);
        var initialKeyword = params.get("q");
        if (initialKeyword) {
          keywordInput.value = initialKeyword;
        }
      }
      var runFilter = function () {
        var keyword = (keywordInput && keywordInput.value || "").trim().toLowerCase();
        var category = categorySelect && categorySelect.value || "all";
        var region = regionSelect && regionSelect.value || "all";
        var year = yearSelect && yearSelect.value || "all";
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var cardCategories = card.getAttribute("data-category") || "";
          var cardRegion = card.getAttribute("data-region") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var match = (!keyword || text.indexOf(keyword) !== -1) &&
            (category === "all" || cardCategories.indexOf(category) !== -1) &&
            (region === "all" || cardRegion === region) &&
            (year === "all" || cardYear === year);
          card.hidden = !match;
          if (match) {
            visible += 1;
          }
        });
        if (emptyState) {
          emptyState.classList.toggle("is-visible", visible === 0);
        }
      };
      [keywordInput, categorySelect, regionSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", runFilter);
          control.addEventListener("change", runFilter);
        }
      });
      runFilter();
    }

    var playerShell = document.querySelector("[data-player]");
    if (playerShell) {
      var video = playerShell.querySelector("video");
      var overlay = playerShell.querySelector("[data-player-overlay]");
      var source = playerShell.getAttribute("data-src");
      var bound = false;
      var hlsInstance = null;
      var bindSource = function () {
        if (bound || !video || !source) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
        bound = true;
      };
      var startPlayback = function () {
        bindSource();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var playResult = video.play();
        if (playResult && playResult.catch) {
          playResult.catch(function () {});
        }
      };
      if (overlay) {
        overlay.addEventListener("click", startPlayback);
      }
      video.addEventListener("click", function () {
        if (!bound) {
          startPlayback();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  });
})();
