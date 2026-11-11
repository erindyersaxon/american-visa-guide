/*
   Legacy deep links into the old single-page naturalization guide:
   /naturalization#civics → /naturalization/test#flashcards, and the tax and
   delays sections that moved to their own pages. URL fragments are
   never sent to the server, so no vercel.json redirect can see them; this
   runs on the hub instead (same approach as js/guide-anchors.js).

   Load in <head>, not deferred, so the hop happens before the hub renders.
   Spec: docs/superpowers/specs/2026-11-11-naturalization-section-design.md §7
 */
(function () {
  'use strict';
  var MAP = {
    'timeline': '/naturalization/when-can-i-apply',
    'calc': '/naturalization/when-can-i-apply',
    'prepare': '/checklist-n400',
    'prep': '/checklist-n400',
    'civics': '/naturalization/test#flashcards',
    'flashcards': '/naturalization/test#flashcards',
    'english': '/naturalization/test#english',
    'resources': '/naturalization#help',
    'taxes': '/naturalization/good-moral-character#taxes',
    'delays': '/naturalization/delays-and-denials'
  };
  function go() {
    var target = MAP[decodeURIComponent(location.hash.slice(1))];
    if (target) location.replace(target);
  }
  go();
  window.addEventListener('hashchange', go);
})();
