/*
   Old deep links into the single-page /data: /data#calculator ->
   /data/wait-times#calculator. URL fragments are never sent to the server,
   so no vercel.json redirect can see them; this runs on the /data landing
   page instead, modelled on js/guide-anchors.js.

   Every id from each section that moved is mapped to the page that now
   holds it, keeping the fragment so the reader lands on the same spot.
   #contents and #otp-hd (the old "On this page" box) stay here.

   Generated from data.html as it was before the split (26 Nov 2026).
   Load in <head>, not deferred, so the hop happens before the page renders.
 */
(function () {
  'use strict';
  var MAP = {
    'il-banner': '/data/interview-letters#il-banner',
    'm-last-drop': '/data/interview-letters#m-last-drop',
    'm-last-drop-sub': '/data/interview-letters#m-last-drop-sub',
    'm-days-since': '/data/interview-letters#m-days-since',
    'm-days-since-sub': '/data/interview-letters#m-days-since-sub',
    'il-latest-dq': '/data/interview-letters#il-latest-dq',
    'm-interview-range': '/data/interview-letters#m-interview-range',
    'm-interview-range-sub': '/data/interview-letters#m-interview-range-sub',
    'm-members-note': '/data/interview-letters#m-members-note',
    'pipeline-hd': '/data/wait-times#pipeline-hd',
    'p-uscis-badge': '/data/wait-times#p-uscis-badge',
    'p-uscis-summary': '/data/wait-times#p-uscis-summary',
    'p-nvc-badge': '/data/wait-times#p-nvc-badge',
    'p-nvc-summary': '/data/wait-times#p-nvc-summary',
    'p-london-badge': '/data/wait-times#p-london-badge',
    'p-london-summary': '/data/wait-times#p-london-summary',
    'phases-hd': '/data/wait-times#phases-hd',
    'tn-days-since': '/data/wait-times#tn-days-since',
    'phase-cards': '/data/wait-times#phase-cards',
    'drops-hd': '/data/interview-letters#drops-hd',
    'drops-tbody': '/data/interview-letters#drops-tbody',
    'backlog-hd': '/data/interview-letters#backlog-hd',
    'bk-total': '/data/interview-letters#bk-total',
    'bk-total-sub': '/data/interview-letters#bk-total-sub',
    'bk-oldest': '/data/interview-letters#bk-oldest',
    'backlog-tbody': '/data/interview-letters#backlog-tbody',
    'bk-note': '/data/interview-letters#bk-note',
    'outcomes-hd': '/data/interviews#outcomes-hd',
    'o-approved': '/data/interviews#o-approved',
    'o-221g': '/data/interviews#o-221g',
    'o-denied': '/data/interviews#o-denied',
    'passport-hd': '/data/interviews#passport-hd',
    'pp-pickup': '/data/interviews#pp-pickup',
    'pp-mail': '/data/interviews#pp-mail',
    'calculator': '/data/wait-times#calculator',
    'calc-hd': '/data/wait-times#calc-hd',
    'dq-date': '/data/wait-times#dq-date',
    'interview-date': '/data/wait-times#interview-date',
    'delivery-method': '/data/wait-times#delivery-method',
    'passport-result': '/data/wait-times#passport-result',
    'passport-date': '/data/wait-times#passport-date',
    'passport-range': '/data/wait-times#passport-range',
    'passport-confidence': '/data/wait-times#passport-confidence',
    'official-data': '/data/i130-us#official-data',
    'official-hd': '/data/i130-us#official-hd',
    'od-chart-approvals': '/data/i130-us#od-chart-approvals',
    'od-chart-denials': '/data/i130-us#od-chart-denials',
    'od-ir-table': '/data/i130-us#od-ir-table',
    'od-ir-cap': '/data/i130-us#od-ir-cap',
    'od-fp-table': '/data/i130-us#od-fp-table',
    'od-fp-cap': '/data/i130-us#od-fp-cap',
    'od-chart-visas': '/data/family-visas#od-chart-visas',
    'od-iv-table': '/data/family-visas#od-iv-table',
    'od-iv-cap': '/data/family-visas#od-iv-cap',
  };
  function go() {
    var id = decodeURIComponent((window.location.hash || '').slice(1));
    if (id && Object.prototype.hasOwnProperty.call(MAP, id)) window.location.replace(MAP[id]);
  }
  go();
  window.addEventListener('hashchange', go);
})();
