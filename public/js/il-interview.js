/* ─────────────────────────────────────────────────────────────
   Single source of truth for the IL → Interview observed-pattern
   table. Rendered on both the homepage (index.html) and the guide
   (guide.html). Edit the rows HERE only — both pages update.

   Any <tbody data-il-interview> on the page is filled automatically.
   ───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const ROWS = [
    { il: 'May 2026',         interview: 'July 2026' },
    { il: 'April 2026',       interview: 'June 2026' },
    { il: 'Late March 2026',  interview: 'May 2026' },
    { il: 'Early March 2026', interview: 'April 2026' },
    { il: 'February 2026',    interview: 'April 2026' },
    { il: 'January 2026',     interview: 'March 2026' },
    { il: 'December 2025',    interview: 'February 2026' },
    { il: 'November 2025',    interview: 'January 2026' },
    { il: 'October 2025',     interview: 'December 2025' },
    { il: 'September 2025',   interview: 'November 2025' },
  ];

  function render(selector) {
    document.querySelectorAll(selector).forEach(tbody => {
      tbody.innerHTML = ROWS.map(r => `<tr><td>${r.il}</td><td>${r.interview}</td></tr>`).join('');
    });
  }

  window.AVG_IL_INTERVIEW = ROWS;
  window.renderILInterview = render;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => render('[data-il-interview]'));
  } else {
    render('[data-il-interview]');
  }
})();
