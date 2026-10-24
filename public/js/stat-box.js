/*
   Stat boxes: upgrade author-written fallback text in .stat-box[data-stat]
   with live community medians from js/community-stats.js. The label is never
   touched; if data is missing or too thin, the fallback stays as written.
   Spec: docs/superpowers/specs/2026-10-24-guide-article-components-design.md
 */
(function () {
  'use strict';

  function fill(box, view) {
    const value = box.querySelector('.stat-box__value');
    const source = box.querySelector('.stat-box__source');
    if (value) value.textContent = view.value;
    if (source) {
      const link = document.createElement('a');
      link.href = '/data';
      link.textContent = 'how we count';
      source.replaceChildren('Median of ' + view.n + ' member timelines · ', link);
    }
    box.classList.add('stat-box--live');
  }

  function init() {
    const S = window.AVGStats;
    const boxes = Array.prototype.slice.call(document.querySelectorAll('.stat-box[data-stat]'));
    if (!S || !boxes.length) return;

    const warned = {};
    boxes.forEach(function (box) {
      const key = box.dataset.stat;
      if (S.STAT_KEYS.indexOf(key) === -1 && !warned[key]) {
        warned[key] = true;
        console.warn('stat-box: unknown key', key);
      }
    });

    S.load().then(function (stats) {
      boxes.forEach(function (box) {
        const view = S.statBoxView(box.dataset.stat, stats);
        if (view) fill(box, view);
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
