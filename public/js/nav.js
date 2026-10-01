/*
   American Visa Guide: Shared site chrome (nav + footer)
   Single source of truth for nav and footer markup on every page.
   Styles live in /css/nav.css.

   Mounts into <div id="nav-placeholder"> if present, otherwise
   replaces the page's first <nav> element.
 */

(function () {
  'use strict';

  /* Sitewide policy banner. Flip BANNER_ENABLED to true to show it, and
     update BANNER_HTML for the notice of the day. Styles: .site-banner
     in /css/nav.css. */
  const BANNER_ENABLED = true;

  const BANNER_HTML = `
<div class="site-banner" role="region" aria-label="Site policy notice">
  <div class="site-banner-inner">
    <span class="site-banner-label">Interviews rescheduled</span>
    <p>Canceled September interviews are being rescheduled by email, sometimes for the next day. First interview, new date, or called back after a 221(g)? <a href="/interview">Start here &rarr;</a></p>
  </div>
</div>
`;

  const NAV_HTML = `
<nav class="site-nav" role="navigation" aria-label="Main navigation">
  <div class="nav-container">

    <a href="/index.html" class="nav-brand" aria-label="American Visa Guide: home">
      <span class="nav-brand-mark" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 24 24">
          <rect width="24" height="24" rx="5" fill="#ece5d6"/>
          <path d="M4 5 h5.5 L13.5 12 L9.5 19 H4 L8 12 Z" fill="#bf3b3b"/>
          <path d="M11 5 h5.5 L20.5 12 L16.5 19 H11 L15 12 Z" fill="#2e4a7d"/>
        </svg>
      </span>
      <span class="nav-brand-text">American <span>Visa</span> Guide</span>
    </a>

    <button class="nav-toggle" aria-expanded="false" aria-controls="nav-menu" aria-label="Toggle navigation menu">
      <span class="nav-toggle-bar"></span>
      <span class="nav-toggle-bar"></span>
      <span class="nav-toggle-bar"></span>
    </button>

    <ul class="nav-menu" id="nav-menu" role="list">
      <li>
        <a href="/" class="nav-link" data-navpage="home">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Home
        </a>
      </li>
      <li>
        <a href="/data" class="nav-link" data-navpage="data">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          Data
        </a>
      </li>
      <li>
        <a href="/guide.html" class="nav-link" data-navpage="guide">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
          </svg>
          Guide
        </a>
      </li>
      <li>
        <a href="/interview" class="nav-link" data-navpage="interview">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 16 11 18 15 14"/>
          </svg>
          Interview
        </a>
      </li>
      <li>
        <a href="/checklists.html" class="nav-link" data-navpage="checklists">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
          Checklists &amp; Tools
        </a>
      </li>
      <li>
        <a href="/life.html" class="nav-link" data-navpage="life">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Life in the USA
        </a>
      </li>
      <li>
        <a href="/naturalization.html" class="nav-link" data-navpage="naturalization">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 22V4"/><path d="M4 4h13l-2 4 2 4H4"/>
          </svg>
          Naturalization
        </a>
      </li>
      <li>
        <a href="/about.html" class="nav-link" data-navpage="about">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          About
        </a>
      </li>
      <li>
        <a href="https://forms.fillout.com/t/dTRqnkx9uxus" class="nav-link" target="_blank" rel="noopener noreferrer" data-navpage="submit">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
          </svg>
          Submit Timeline
          <svg aria-label="opens in new tab" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.5;">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
      </li>
      <li>
        <a href="https://ko-fi.com/erinsaidwhat" class="nav-link nav-link--support" target="_blank" rel="noopener noreferrer" data-navpage="support">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
          </svg>
          Support
        </a>
      </li>
    </ul>
  </div>
</nav>`;


  const FOOTER_HTML = `
<footer class="avg-footer" role="contentinfo">
  <div class="avg-footer__container">
    <div class="avg-footer__note">
      <p class="avg-footer__note-hd"><strong>Not legal advice</strong></p>
      <p>This page is based on published government sources, court filings and community experience. It is not legal advice, and your situation may differ. If you have complex circumstances, such as prior public benefits use, gaps in employment, or a medical condition, consider consulting an immigration attorney affiliated with the <a href="https://www.aila.org/" target="_blank" rel="noopener noreferrer">American Immigration Lawyers Association</a> before you act.</p>
    </div>
    <div class="avg-footer__cols">
      <div>
        <p class="avg-footer__hd">Contact</p>
        <a href="mailto:AmericanVisaGuideInfo@gmail.com">AmericanVisaGuideInfo<wbr>@gmail.com</a>
      </div>
      <div>
        <p class="avg-footer__hd">Legal</p>
        <a href="/privacy.html">Privacy Policy</a>
      </div>
      <div>
        <p class="avg-footer__hd">Support</p>
        <a href="https://ko-fi.com/erinsaidwhat" class="avg-footer__kofi" target="_blank" rel="noopener noreferrer">&#9749; Buy me a coffee</a>
      </div>
    </div>
    <p class="avg-footer__copyright">&copy; American Visa Guide &middot; Community-powered immigration resource</p>
  </div>
</footer>`;

  /* Which nav item lights up for each page (sub-pages map to their hub) */
  const ACTIVE_MAP = {
    '': 'home',
    'index': 'home',
    'data': 'data',
    'tracker': 'data',
    'guide': 'guide',
    'delayed-i130-remedies': 'guide',
    'mandamus-pro-se': 'guide',
    'glossary': 'guide',
    'interview': 'interview',
    'reinterview': 'interview',
    'public-charge': 'interview',
    'public-charge-statement': 'interview',
    'public-charge-detail': 'interview',
    'visa-pause': 'interview',
    'september-2026-update': 'interview',
    '221g': 'interview',
    '221g-sheet': 'interview',
    'interview-dates': 'interview',
    'interview-templates': 'interview',
    'interview-day-sheet': 'interview',
    'interview-questions': 'interview',
    'history-worksheet': 'interview',
    'checklists': 'checklists',
    'master-checklist': 'checklists',
    'checklist-i130': 'checklists',
    'checklist-nvc': 'checklists',
    'checklist-medical': 'checklists',
    'checklist-interview': 'checklists',
    'checklist-binder': 'checklists',
    'workbook': 'checklists',
    'tools': 'checklists',
    'worksheet-ds260': 'checklists',
    'worksheet-i864': 'checklists',
    'i864-household-decision-tree': 'checklists',
    'english-test': 'checklists',
    'life': 'life',
    'naturalization': 'naturalization',
    'about': 'about',
    'privacy': 'about',
  };

  function mount() {
    const target = document.getElementById('nav-placeholder') || document.querySelector('nav');
    if (!target) return;

    const tpl = document.createElement('template');
    tpl.innerHTML = NAV_HTML.trim();
    const nav = tpl.content.firstElementChild;
    target.replaceWith(nav);

    // Skip link: inject one only if the page doesn't already have its own
    if (!document.querySelector('.skip-link')) {
      const main = document.querySelector('main[id]');
      if (main) {
        const skip = document.createElement('a');
        skip.href = '#' + main.id;
        skip.className = 'skip-link';
        skip.textContent = 'Skip to main content';
        document.body.insertBefore(skip, document.body.firstChild);
      }
    }

    mountBanner(nav);
    markActive(nav);
    wireToggle(nav);
    mountFooter();
  }

  function mountBanner(nav) {
    if (!BANNER_ENABLED) return;
    if (document.querySelector('.site-banner')) return;
    // Pages that carry the live notice already say the same thing.
    if (document.querySelector('[data-live-notice], .page-live-notice, .stage-alert, .alert-banner')) return;
    if (!nav.parentNode) return;
    const tpl = document.createElement('template');
    tpl.innerHTML = BANNER_HTML.trim();
    nav.parentNode.insertBefore(tpl.content.firstElementChild, nav);
  }

  function mountFooter() {
    const target = document.getElementById('footer-placeholder') || document.querySelector('footer');
    if (!target) return;
    const tpl = document.createElement('template');
    tpl.innerHTML = FOOTER_HTML.trim();
    target.replaceWith(tpl.content.firstElementChild);
  }

  function markActive(nav) {
    const file = (window.location.pathname.split('/').pop() || 'index.html')
      .replace(/\.html$/, '') || 'index';
    // Stage pages live under /guide/ and belong to the Guide, even where a
    // stage shares a file name with a hub (guide/interview vs /interview).
    const active = /^\/guide\//.test(window.location.pathname) ? 'guide' : ACTIVE_MAP[file];
    if (!active) return;
    const link = nav.querySelector('.nav-link[data-navpage="' + active + '"]');
    if (link) {
      link.setAttribute('aria-current', 'page');
      link.classList.add('nav-link--active');
    }
  }

  function wireToggle(nav) {
    const toggle = nav.querySelector('.nav-toggle');
    const menu = nav.querySelector('.nav-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      menu.classList.toggle('is-open', !expanded);
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.site-nav') && menu.classList.contains('is-open')) {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
