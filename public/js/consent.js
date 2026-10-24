/*
   American Visa Guide: Cookie consent
   Single source of truth for the cookie banner and for loading
   Microsoft Clarity. Clarity never loads until the visitor accepts.

   Include once in <head> on every page:
     <script src="/js/consent.js?v=20261024" defer></script>

   The choice is kept in localStorage (strictly necessary, not a cookie).
   Anything can reopen the banner with window.avgConsent.open(), for
   example the "Cookie settings" link in the footer.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'avg-consent';
  const CLARITY_ID = 'wlfs757o2n';
  const CLARITY_COOKIES = ['_clck', '_clsk', 'CLID', 'ANONCHK', 'MR', 'MUID', 'SM'];

  /* Bump when the banner wording or the list of tools changes, so
     everyone is asked again. */
  const POLICY_VERSION = 1;

  const BANNER_HTML = `
<div class="avg-consent__inner">
  <p class="avg-consent__hd" id="avg-consent-hd">Can we count visits?</p>
  <p class="avg-consent__body" id="avg-consent-body">
    We'd like to use Microsoft Clarity to see which pages help and where people get stuck.
    It sets cookies and records how pages are scrolled and clicked. Nothing runs unless you say yes,
    and you can change your mind any time from <strong>Cookie settings</strong> at the bottom of every page.
    <a href="/privacy.html#cookies">Privacy policy</a>
  </p>
  <div class="avg-consent__actions">
    <button type="button" class="avg-consent__btn" data-consent="rejected">No thanks</button>
    <button type="button" class="avg-consent__btn" data-consent="accepted">Yes, that's fine</button>
  </div>
</div>`;

  /* Both buttons share one style on purpose: rejecting has to be as
     easy and as visible as accepting (ICO guidance on PECR). */
  const STYLES = `
.avg-consent {
  position: fixed; left: 16px; right: 16px; bottom: 16px; z-index: 10000;
  max-width: 560px; margin: 0 auto;
  background: var(--color-surface, #ffffff); color: var(--color-text, #0f172a);
  border: 1px solid var(--color-border-strong, #64748b); border-radius: var(--radius-md, 0.375rem);
  box-shadow: var(--shadow-overlay, 0 1px 2px rgba(15,23,42,.08));
  font-family: var(--font-body, 'Public Sans', system-ui, sans-serif);
  font-size: 0.9375rem; line-height: 1.5;
}
.avg-consent[hidden] { display: none; }
.avg-consent__inner { padding: 18px 20px; }
.avg-consent__hd {
  margin: 0 0 6px; font-family: var(--font-display, Georgia, serif);
  font-size: 1.125rem; font-weight: 700; color: var(--color-navy, #0f172a);
}
.avg-consent__body { margin: 0 0 14px; }
.avg-consent__body a { color: var(--color-gold, #0f172a); font-weight: 600; }
.avg-consent__actions { display: flex; gap: 10px; flex-wrap: wrap; }
.avg-consent__btn {
  flex: 1 1 140px; min-height: 44px; padding: 10px 16px;
  font: inherit; font-weight: 600; cursor: pointer;
  background: var(--color-navy, #0f172a); color: var(--color-text-inverse, #fff);
  border: 2px solid var(--color-navy, #0f172a); border-radius: 6px;
}
.avg-consent__btn:hover { background: var(--color-navy-light, #334155); border-color: var(--color-navy-light, #334155); }
.avg-consent__btn:focus-visible { outline: 3px solid var(--color-gold, #0f172a); outline-offset: 2px; }
@media print { .avg-consent { display: none !important; } }
`;

  /* ---- Stored choice ------------------------------------------------ */

  function readChoice() {
    try {
      const record = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!record || record.version !== POLICY_VERSION) return null;
      return isChoiceStillValid(record) ? record : null;
    } catch (e) {
      return null;
    }
  }

  function saveChoice(choice) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        choice: choice,
        version: POLICY_VERSION,
        savedAt: new Date().toISOString(),
      }));
    } catch (e) {
      /* Private mode or blocked storage: the choice holds for this page only. */
    }
  }

  /* How long an answer lasts before the banner asks again. A "No" lasts
     half as long as a "Yes": still well clear of nagging, but people
     who said no once get a fair second chance to say yes. */
  const MONTHS_VALID = { accepted: 12, rejected: 6 };

  /* Decide whether a saved choice still counts, or whether to ask again.
     record = { choice: 'accepted' | 'rejected', version, savedAt: ISO string }
     Return true to keep the choice, false to show the banner again. */
  function isChoiceStillValid(record) {
    const months = MONTHS_VALID[record.choice];
    const savedAt = new Date(record.savedAt);
    if (!months || isNaN(savedAt)) return false;
    const expires = new Date(savedAt);
    expires.setMonth(expires.getMonth() + months);
    return new Date() < expires;
  }

  /* ---- Clarity ------------------------------------------------------ */

  function loadClarity() {
    if (window.clarity) return;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_ID);
  }

  function clearClarityCookies() {
    const host = location.hostname;
    const domains = ['', host, '.' + host, '.' + host.replace(/^www\./, '')];
    CLARITY_COOKIES.forEach(function (name) {
      domains.forEach(function (d) {
        document.cookie = name + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
      });
    });
  }

  /* ---- Banner ------------------------------------------------------- */

  let banner = null;

  function buildBanner() {
    const style = document.createElement('style');
    style.textContent = STYLES;
    document.head.appendChild(style);

    banner = document.createElement('section');
    banner.className = 'avg-consent';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-labelledby', 'avg-consent-hd');
    banner.setAttribute('aria-describedby', 'avg-consent-body');
    banner.hidden = true;
    banner.innerHTML = BANNER_HTML.trim();
    banner.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-consent]');
      if (btn) decide(btn.getAttribute('data-consent'));
    });
    document.body.appendChild(banner);
  }

  /* Focus moves only when the visitor asked for the banner; stealing it
     on first page load would pull screen-reader users off the page. */
  function open(moveFocus) {
    if (!banner) buildBanner();
    banner.hidden = false;
    if (moveFocus) banner.querySelector('[data-consent="rejected"]').focus({ preventScroll: true });
  }

  function decide(choice) {
    const wasRunning = !!window.clarity;
    saveChoice(choice);
    banner.hidden = true;
    if (choice === 'accepted') {
      loadClarity();
    } else {
      clearClarityCookies();
      /* Clarity can't be unloaded mid-page; a reload stops it. */
      if (wasRunning) location.reload();
    }
  }

  function init() {
    const record = readChoice();
    if (!record) open(false);
    else if (record.choice === 'accepted') loadClarity();
  }

  window.avgConsent = { open: function () { open(true); } };

  /* Any element with data-consent-open reopens the banner. */
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-consent-open]')) open(true);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
