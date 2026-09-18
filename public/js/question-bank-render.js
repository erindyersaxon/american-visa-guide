/*
   Static render of the interview question bank for /guide/interview.

   Reads window.AVG_INTERVIEW_QB from /js/interview-questions.js (the single
   source of truth: edit questions THERE, never here) and fills every
   <div data-question-bank> with all questions, grouped under the THEMES
   labels in their declared order, showing each question and its tip.

   Also fills any <span data-question-count> with the current total, so a
   lead line like "All 53 questions" stays correct as the bank grows.

   The category filter and flashcard mode stay on /interview-questions.
   Load after interview-questions.js, at the end of <body>.
 */
(function () {
  'use strict';

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function html(qb) {
    return qb.THEMES.map(function (t) {
      const qs = qb.QUESTIONS.filter(function (q) { return q.theme === t.key; });
      if (!qs.length) return '';
      return '<div class="qb-theme">' +
        '<h3>' + esc(t.label) + ' <span class="qb-count">(' + qs.length + ')</span></h3>' +
        '<ul class="qb-list">' + qs.map(function (q) {
          return '<li><span class="qb-q">' + esc(q.q) + '</span>' +
            (q.tip ? ' <span class="qb-tip">' + esc(q.tip) + '</span>' : '') + '</li>';
        }).join('') + '</ul></div>';
    }).join('');
  }

  function render() {
    const qb = window.AVG_INTERVIEW_QB;
    if (!qb) return;
    document.querySelectorAll('[data-question-bank]').forEach(function (el) {
      el.innerHTML = html(qb);
    });
    document.querySelectorAll('[data-question-count]').forEach(function (el) {
      el.textContent = qb.QUESTIONS.length;
    });
  }

  window.AVG_QB_RENDER = { html: html, render: render };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
