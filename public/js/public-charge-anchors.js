/*
   American Visa Guide: old public charge links.
   Until 15 Nov 2026 public charge was one long page, and many links (forums,
   older pages, bookmarks) point at its sections: /public-charge#i864. Those
   sections now have their own pages. Loaded in the <head> of /public-charge
   only, so the jump happens before the overview draws. Internal links point
   straight at the new pages; this is for links from outside the site.
 */
(function () {
  'use strict';
  var MOVED = {
    'deliverables': '/public-charge/evidence', 'self-employed': '/public-charge/evidence',
    'retirement': '/public-charge/evidence',
    'questions': '/public-charge/questions', 'london-account': '/public-charge/questions',
    'asked': '/public-charge/questions',
    'i864': '/public-charge/sponsors', 'joint-sponsor': '/public-charge/sponsors',
    'credit-check': '/public-charge/sponsors', 'gross-net': '/public-charge/sponsors',
    'ir2': '/public-charge/children-and-parents', 'minor-child': '/public-charge/children-and-parents',
    'adult-child': '/public-charge/children-and-parents', 'ir5': '/public-charge/children-and-parents',
    'template': '/public-charge/template', 'template-text': '/public-charge/template',
    'template-child': '/public-charge/template',
    'refused': '/public-charge/refused',
    'sources': '/public-charge/sources', 'fluid': '/public-charge/sources',
    'timeline': '/public-charge/sources'
  };
  function go() {
    var id = decodeURIComponent((location.hash || '').slice(1));
    if (Object.prototype.hasOwnProperty.call(MOVED, id)) {
      location.replace(MOVED[id] + '#' + id);
    }
  }
  go();
  // Same-page links to an old anchor (e.g. typed into the address bar)
  window.addEventListener('hashchange', go);
})();
