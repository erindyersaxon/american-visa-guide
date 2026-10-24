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

  // Validation and wording of community medians live in js/community-stats.js.
  function stats() {
    return typeof module !== 'undefined' && module.exports
      ? require('./community-stats.js')
      : root.AVGStats;
  }

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

  function formatTag(stat) {
    const S = stats();
    if (!S.usable(stat)) return null;
    return S.formatDuration(stat.median) + ' typical · ' + stat.n + ' members';
  }

  function isStepperPage(pathname) {
    let p = String(pathname || '/');
    if (p.length > 1) p = p.replace(/\/+$/, '');
    p = p.replace(/\.html$/, '').replace(/(^|\/)index$/, '$1') || '/';
    if (p.length > 1) p = p.replace(/\/+$/, '');
    return PAGES.indexOf(p) !== -1 || PREFIXES.some(function (pre) { return p.indexOf(pre) === 0; });
  }

  const api = { STEPS, parseStoredStep, stepStatus, formatTag, isStepperPage };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AVGStepperCore = api;
})(typeof window !== 'undefined' ? window : this);
