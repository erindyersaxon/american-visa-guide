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

  const api = { STAT_KEYS, MIN_N, isStat, usable, formatDuration, pickStats, parseCachedStats };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AVGStats = api;
})(typeof window !== 'undefined' ? window : this);
