/*
   Legacy deep links into the old single-page guide: /guide#medical →
   /guide/medical. URL fragments are never sent to the server, so no
   vercel.json redirect can see them; this runs on the Guide Hub instead.

   Every id from each moved section is mapped to the page that now holds
   it, keeping the fragment so the reader lands on the same spot. Section
   ids go to the bare page. #i130 and #after-interview never existed on
   the old page but were linked from elsewhere, so they are mapped too.
   #overview, #visa-ir, #visa-f and #interview-cancellations stay here.

   Generated from the Phase 0 baseline of guide.html. Load in <head>,
   not deferred, so the hop happens before the hub renders.
 */
(function () {
  'use strict';
  var MAP = {
    'after-interview': '/guide/after-interview',
    'post': '/guide/after-interview',
    'uk-obligations': '/guide/before-you-leave',
    'crba': '/guide/crba',
    'crba_0': '/guide/crba#crba_0',
    'crba_1': '/guide/crba#crba_1',
    'crba_2': '/guide/crba#crba_2',
    'crba_3': '/guide/crba#crba_3',
    'crba_4': '/guide/crba#crba_4',
    'crba_5': '/guide/crba#crba_5',
    'delayed': '/guide/delayed-i130',
    'i130': '/guide/i130',
    'uscis': '/guide/i130',
    'filing-i130': '/guide/i130#filing-i130',
    'linking-i130': '/guide/i130#linking-i130',
    'interview': '/guide/interview',
    'medical': '/guide/medical',
    'doc-check-cancelled': '/guide/medical#doc-check-cancelled',
    'nvc': '/guide/nvc',
    'dq-notice': '/guide/nvc#dq-notice',
    'nvc-strategic-hold': '/guide/nvc#nvc-strategic-hold',
    'nvc_0': '/guide/nvc#nvc_0',
    'nvc_1': '/guide/nvc#nvc_1',
    'nvc_2': '/guide/nvc#nvc_2',
    'nvc_3': '/guide/nvc#nvc_3',
    'nvc_4': '/guide/nvc#nvc_4',
    'nvc_5': '/guide/nvc#nvc_5',
    'nvc_6': '/guide/nvc#nvc_6',
    'nvc_7': '/guide/nvc#nvc_7',
    'nvc_8': '/guide/nvc#nvc_8',
    'nvc_9': '/guide/nvc#nvc_9',
    'nvc_rfe': '/guide/nvc#nvc_rfe',
    'entry': '/guide/us-entry',
    'waiting': '/guide/waiting',
    'id-me-account': '/guide/waiting#id-me-account',
    'il-drops-paused': '/guide/waiting#il-drops-paused',
    'public-charge-statement': '/guide/waiting#public-charge-statement',
    'life': '/life'
  };
  function go() {
    var target = MAP[decodeURIComponent(location.hash.slice(1))];
    if (target) location.replace(target);
  }
  go();
  window.addEventListener('hashchange', go);
})();
