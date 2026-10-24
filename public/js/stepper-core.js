/*
   Visa process stepper: pure logic, no DOM.
   Shared by js/stepper.js in the browser (window.AVGStepperCore) and by
   test/stepper-core.test.js under Node (module.exports).
   Spec: docs/superpowers/specs/2026-10-24-visa-process-stepper-design.md
 */
(function (root) {
  'use strict';

  const STEPS = [
    { id: 1, label: 'NVC & Form DS-260', short: 'NVC & DS-260', href: '/guide/nvc', statKey: 'approval_to_dq_stats' },
    { id: 2, label: 'Medical exam (VisaMedicals)', short: 'Medical', href: '/guide/medical', statKey: 'il_to_medical_med' },
    { id: 3, label: 'Interview prep & embassy interview', short: 'Interview', href: '/guide/interview', statKey: 'medical_to_interview_med' },
    { id: 4, label: 'Visa approval & passport courier', short: 'Visa & courier', href: '/guide/after-interview', statKey: 'interview_to_passport_med' },
  ];

  // Matches MIN_TREND_N in api/data.js: below this a median says too little.
  const MIN_N = 5;

  // Visa-process pages, as clean paths. /guide/* and /checklist-* match by prefix.
  const PAGES = [
    '/', '/guide', '/checklists', '/master-checklist', '/tracker', '/tools',
    '/worksheet-ds260', '/worksheet-i864', '/i864-household-decision-tree',
    '/public-charge', '/public-charge-statement', '/domicile', '/interview',
    '/interview-dates', '/interview-questions', '/interview-day-sheet',
    '/interview-templates', '/221g', '/221g-sheet', '/administrative-processing',
    '/reinterview', '/data',
  ];
  const PREFIXES = ['/guide/', '/checklist-'];

  function parseStoredStep(raw) {
    return /^[1-4]$/.test(raw == null ? '' : String(raw)) ? Number(raw) : null;
  }

  function stepStatus(stepId, current) {
    if (current == null) return 'neutral';
    if (stepId < current) return 'completed';
    return stepId === current ? 'in-progress' : 'upcoming';
  }

  function isStat(stat) {
    return !!stat && typeof stat.median === 'number' && Number.isFinite(stat.median) &&
      stat.median > 0 && typeof stat.n === 'number' && Number.isFinite(stat.n);
  }

  function formatTag(stat) {
    if (!isStat(stat) || stat.n < MIN_N) return null;
    const when = stat.median >= 14
      ? '~' + Math.round(stat.median / 7) + ' wks'
      : '~' + stat.median + ' days';
    return when + ' typical · ' + stat.n + ' members';
  }

  function pickTags(apiData) {
    const avgs = (apiData && apiData.stage_avgs) || {};
    const tags = {};
    STEPS.forEach(function (s) {
      const stat = avgs[s.statKey];
      tags[s.id] = stat ? { median: stat.median, n: stat.n } : null;
    });
    return tags;
  }

  function parseCachedTags(raw) {
    let obj;
    try { obj = JSON.parse(raw); } catch (e) { return null; }
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
    const ok = STEPS.every(function (s) {
      return s.id in obj && (obj[s.id] === null || isStat(obj[s.id]));
    });
    return ok ? obj : null;
  }

  function isStepperPage(pathname) {
    let p = String(pathname || '/');
    if (p.length > 1) p = p.replace(/\/+$/, '');
    p = p.replace(/\.html$/, '').replace(/(^|\/)index$/, '$1') || '/';
    if (p.length > 1) p = p.replace(/\/+$/, '');
    return PAGES.indexOf(p) !== -1 || PREFIXES.some(function (pre) { return p.indexOf(pre) === 0; });
  }

  const api = { STEPS, MIN_N, parseStoredStep, stepStatus, formatTag, pickTags, parseCachedTags, isStepperPage };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AVGStepperCore = api;
})(typeof window !== 'undefined' ? window : this);
