/*
   Single source of truth for the live notice: a one-line link to the
   weekly London roundups on /news. Rendered on the Guide Hub, the stage pages and the interview
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

  // London status now lives in the weekly roundups on /news, so every
  // mount point shows just a one-line link there (and nothing on /news
  // itself). The id keeps old /guide#interview-cancellations links working.
  function notice(opts) {
    if (location.pathname.replace(/\.html$/, '') === '/news') return '';
    const id = opts && opts.withId ? ' id="interview-cancellations"' : '';
    return `
    <p class="live-note"${id}><a href="/news#c21373f918">Latest London update (16–26 November)</a>: rebooked interviews keep getting approved; no first interview letters yet.</p>`;
  }

  const PAGE_CSS = `
    .live-note { margin:0 0 1.25rem; padding:0.5rem 0.85rem; border-left:3px solid #0f172a; background:#f1f5f9; border-radius:4px; color:#0f172a; line-height:1.5; max-width:none; }
    .live-note a { color:#1e293b; font-weight:600; text-decoration:underline; text-underline-offset:2px; }
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
