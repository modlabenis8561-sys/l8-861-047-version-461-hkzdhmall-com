(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function normalize(text) {
    return String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getQuery() {
    var params = new URLSearchParams(location.search);
    return params.get('q') || '';
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">',
      '    <img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="score-badge">' + escapeHtml(movie.score) + '</span>',
      '    <span class="play-badge">▶</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine || movie.summary) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function render(query) {
    var allMovies = window.MOVIE_SEARCH_INDEX || [];
    var target = qs('[data-search-results]');
    var empty = qs('[data-search-empty]');
    var title = qs('[data-search-title]');
    var normalizedQuery = normalize(query);
    var results = allMovies;

    if (normalizedQuery) {
      results = allMovies.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.category,
          movie.oneLine,
          movie.summary,
          (movie.tags || []).join(' ')
        ].join(' '));
        return haystack.indexOf(normalizedQuery) !== -1;
      });
    } else {
      results = allMovies.slice(0, 48);
    }

    if (title) {
      title.textContent = normalizedQuery ? '“' + query + '”的搜索结果' : '推荐影片';
    }
    if (target) {
      target.innerHTML = results.slice(0, 240).map(movieCard).join('\n');
    }
    if (empty) {
      empty.classList.toggle('show', results.length === 0);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var form = qs('[data-search-page-form]');
    var input = qs('#search-page-input');
    var initial = getQuery();
    if (input) {
      input.value = initial;
    }
    render(initial);
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = input ? input.value.trim() : '';
        var nextUrl = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
        history.replaceState(null, '', nextUrl);
        render(query);
      });
    }
  });
})();
