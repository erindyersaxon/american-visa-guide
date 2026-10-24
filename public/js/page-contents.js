/*
   American Visa Guide: floating "Contents" button for long pages.
   Finds the page's "On this page" box (the first div.toc), and once it has
   scrolled out of view shows a small fixed button that jumps back to it.
   Self-styled; no markup needed beyond the existing .toc box.
 */
(function () {
  'use strict';

  const CSS = `
    .contents-fab { position:fixed; right:16px; bottom:16px; z-index:50; display:none;
      font:600 0.82rem/1 'Public Sans', system-ui, sans-serif; color:#fff; background:#1e293b;
      border-radius:var(--radius-md, 0.375rem); padding:0.7rem 1rem; text-decoration:none; border:1px solid var(--color-border, #E2E8F0); box-shadow:var(--shadow-overlay, 0 1px 2px rgba(15,23,42,.08)); }
    .contents-fab.is-on { display:inline-block; }
    .contents-fab:hover, .contents-fab:focus-visible { background:#0f172a; color:#fff; text-decoration:none; }
    .contents-fab:focus-visible { outline:3px solid #ffffff; outline-offset:2px; }
    @media print { .contents-fab { display:none !important; } }`;

  function init() {
    const toc = document.querySelector('div.toc');
    if (!toc || !('IntersectionObserver' in window)) return;
    if (!toc.id) toc.id = 'contents';
    if (!toc.hasAttribute('tabindex')) toc.setAttribute('tabindex', '-1');

    const st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);

    const fab = document.createElement('a');
    fab.className = 'contents-fab';
    fab.href = '#' + toc.id;
    fab.textContent = '↑ Contents';
    fab.addEventListener('click', function () {
      setTimeout(function () { toc.focus({ preventScroll: true }); }, 0);
    });
    document.body.appendChild(fab);

    // Show the button only once the reader is below the contents box.
    new IntersectionObserver(function (entries) {
      const e = entries[0];
      fab.classList.toggle('is-on', !e.isIntersecting && e.boundingClientRect.top < 0);
    }).observe(toc);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
