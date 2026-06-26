/* ─────────────────────────────────────────────────────────────
   American Visa Guide — Shared site chrome (nav + footer)
   Single source of truth for nav and footer markup on every page.
   Styles live in /css/nav.css.

   Mounts into <div id="nav-placeholder"> if present, otherwise
   replaces the page's first <nav> element.
   ───────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  const NAV_HTML = `
<nav class="site-nav" role="navigation" aria-label="Main navigation">
  <div class="nav-container">

    <a href="/index.html" class="nav-brand" aria-label="American Visa Guide — home">
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
    <p class="avg-footer__note"><strong>This is not legal advice.</strong> American Visa Guide is an independent community resource, based on official US government sources and observed London embassy patterns — written by Erin with input from community members, not lawyers or embassy staff.</p>
    <div class="avg-footer__cols">
      <div>
        <p class="avg-footer__hd">Contact</p>
        <a href="mailto:AmericanVisaGuideInfo@gmail.com">AmericanVisaGuideInfo@gmail.com</a>
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
    'index': 'home',
    'data': 'data',
    'tracker': 'data',
    'guide': 'guide',
    'public-charge': 'guide',
    'checklists': 'checklists',
    'checklist-i130': 'checklists',
    'checklist-nvc': 'checklists',
    'checklist-medical': 'checklists',
    'checklist-interview': 'checklists',
    'checklist-binder': 'checklists',
    'workbook': 'checklists',
    'tools': 'checklists',
    'worksheet-ds260': 'checklists',
    'worksheet-i864': 'checklists',
    'life': 'life',
    'about': 'about',
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

    markActive(nav);
    wireToggle(nav);
    mountFooter();
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
    const active = ACTIVE_MAP[file];
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
