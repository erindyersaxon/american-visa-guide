/*
   Community stats: the one place the site reads community medians.
   Pure helpers plus a loader for /api/data stage_avgs, cached per visit in
   sessionStorage['avg-stage-stats']. Used by js/stepper.js and js/stat-box.js.
   Browser: window.AVGStats. Node (tests): module.exports.
   Spec: docs/superpowers/specs/2026-10-24-guide-article-components-design.md
 */
(function (root) {
  'use strict';

  // stage_avgs entries built by stageStats() in api/data.js: { avg, median, min, max, n }
  const STAT_KEYS = [
    'pd_to_approval_med', 'approval_to_welcome_med', 'welcome_to_fees_med',
    'fees_to_docs_med', 'docs_to_dq_med', 'approval_to_dq_stats',
    'il_to_medical_med', 'medical_to_interview_med', 'interview_to_passport_med',
  ];

  // Matches MIN_TREND_N in api/data.js: below this a median says too little.
  const MIN_N = 5;

  function isStat(stat) {
    return !!stat && typeof stat.median === 'number' && Number.isFinite(stat.median) &&
      stat.median > 0 && typeof stat.n === 'number' && Number.isFinite(stat.n);
  }

  function usable(stat) {
    return isStat(stat) && stat.n >= MIN_N;
  }

  function formatDuration(days) {
    return days >= 14 ? '~' + Math.round(days / 7) + ' wks' : '~' + days + ' days';
  }

  function pickStats(apiData) {
    const avgs = (apiData && apiData.stage_avgs) || {};
    const stats = {};
    STAT_KEYS.forEach(function (key) {
      const s = avgs[key];
      stats[key] = isStat(s) ? { median: s.median, n: s.n } : null;
    });
    return stats;
  }

  function parseCachedStats(raw) {
    let obj;
    try { obj = JSON.parse(raw); } catch (e) { return null; }
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
    const ok = STAT_KEYS.every(function (key) {
      return key in obj && (obj[key] === null || isStat(obj[key]));
    });
    return ok ? obj : null;
  }

  // What a stat box shows for `key`, or null to keep the author's fallback text.
  function statBoxView(key, stats) {
    if (STAT_KEYS.indexOf(key) === -1 || !stats || !usable(stats[key])) return null;
    return { value: formatDuration(stats[key].median), n: stats[key].n };
  }

  const CACHE_KEY = 'avg-stage-stats';
  let inflight = null;

  function defaultStorage() {
    try { return root.sessionStorage; } catch (e) { return null; } // the getter itself can throw
  }

  // Resolves the stats map, or null when /api/data is unavailable. Never rejects.
  // Callers on the same page share one request; a failure lets a later call retry.
  function load(deps) {
    const fetchFn = (deps && deps.fetch) || (root.fetch && root.fetch.bind(root));
    const storage = deps && deps.storage !== undefined ? deps.storage : defaultStorage();
    if (inflight) return inflight;

    let cached = null;
    try { cached = storage && parseCachedStats(storage.getItem(CACHE_KEY)); } catch (e) { cached = null; }
    if (cached) return (inflight = Promise.resolve(cached));
    if (!fetchFn) return Promise.resolve(null);

    inflight = Promise.resolve()
      .then(function () { return fetchFn('/api/data'); })
      .then(function (r) { return r && r.ok ? r.json() : null; })
      .then(function (json) {
        if (!json) { inflight = null; return null; }
        const stats = pickStats(json);
        try { if (storage) storage.setItem(CACHE_KEY, JSON.stringify(stats)); } catch (e) { /* ignore */ }
        return stats;
      })
      .catch(function () { inflight = null; return null; });
    return inflight;
  }

  // Tests only: forget the shared in-flight promise.
  function _reset() { inflight = null; }

  const api = { STAT_KEYS, MIN_N, isStat, usable, formatDuration, pickStats, parseCachedStats, statBoxView, load, _reset };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AVGStats = api;
})(typeof window !== 'undefined' ? window : this);
