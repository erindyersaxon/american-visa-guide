/*
   Single source of truth for the live notice on where interview letters
   stand. Rendered on the Guide Hub, the stage pages and the interview
   pages. Edit the notice HERE only; every page updates.

   Mount points (each replaced by the same notice):
     data-live-notice="full"       Guide Hub; carries #interview-cancellations
     data-live-notice="medical", "doc-check", "interview", "page"
                                   stage pages and pages outside the guide

   Load as a classic script at the end of <body> (not deferred), so the
   #interview-cancellations anchor exists before the browser scrolls to it.
 */
(function () {
  'use strict';

  // One short notice for every mount point. Interview letters (ILs) come in
  // batches ("drops"); this says where the queue stands and sends readers
  // to the interview hub for the steps. The id keeps old
  // /guide#interview-cancellations links working.
  const UPDATED = '23 October 2026';

  function notice(opts) {
    const hub = location.pathname.replace(/\.html$/, '') === '/interview'
      ? ''
      : '<a href="/interview">Your interview: start here</a> &middot; ';
    const id = opts && opts.withId ? ' id="interview-cancellations"' : '';
    return `
    <div class="live-note"${id} role="note">
      <p class="live-note__head">Rescheduled interviews and interview letters</p>
      <p>On <strong>23 October 2026</strong>, applicants on <a href="https://www.reddit.com/r/NationalVisaCenter/" target="_blank" rel="noopener noreferrer">r/NationalVisaCenter</a> reported that London had emailed new dates for interviews it canceled:</p>
      <ul>
        <li><strong>IR1 and IR5:</strong> 23 September &rarr; 6 November</li>
        <li><strong>Spouse visa, category not given:</strong> 23 September &rarr; 17 November</li>
        <li><strong>K-1:</strong> 22 September &rarr; 13 November, and 20 October &rarr; 10 December</li>
        <li><strong>EB-2:</strong> 20 October &rarr; 1 December</li>
      </ul>
      <p>The K-1 and EB-2 reports are listed for timing only: the steps on this site are written for family immigrant visas.</p>
      <p>London has not sent any interview letters since <strong>14 July 2026</strong>. We are waiting for drops to resume.</p>
      <p>${hub}<a href="/data">See the data</a></p>
      <p class="live-note__meta">Updated ${UPDATED}.</p>
    </div>`;
  }

  const PAGE_CSS = `
    .live-note { background:#edf4f8; border:1px solid #a9cbd9; border-left:4px solid #3e7188; border-radius:8px; padding:0.85rem 1.1rem; margin:0 0 1.5rem; color:#1e1c17; line-height:1.55; }
    .live-note p { margin:0 0 0.4rem; max-width:none; }
    .live-note p:last-child { margin-bottom:0; }
    .live-note ul { margin:0 0 0.4rem; padding-left:1.2rem; }
    .live-note__head { font-weight:700; color:#2f5a6e; }
    .live-note__meta { font-size:14px; color:#56524a; }
    .live-note a { color:#2f5a6e; font-weight:600; text-decoration:underline; text-underline-offset:2px; }
    @media print { .live-note { display:none; } }`;

  function ensurePageCss() {
    if (document.getElementById('page-live-notice-css')) return;
    const st = document.createElement('style');
    st.id = 'page-live-notice-css';
    st.textContent = PAGE_CSS;
    document.head.appendChild(st);
  }

  function html(key) {
    return notice({ withId: key === 'full' });
  }

  function render() {
    const mounts = document.querySelectorAll('[data-live-notice]');
    if (mounts.length) ensurePageCss();
    mounts.forEach(el => {
      el.outerHTML = html(el.getAttribute('data-live-notice')).trim();
    });
  }

  window.AVG_LIVE_NOTICE = { html, render };

  // Render now for mounts already parsed, and again once parsing finishes
  // for any later ones. Idempotent: each mount is replaced as it renders.
  render();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  }
})();
