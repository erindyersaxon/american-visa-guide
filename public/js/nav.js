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
  const BANNER_ENABLED = false;

  const BANNER_HTML = `
<div class="site-banner" role="region" aria-label="Site policy notice">
  <div class="site-banner-inner">
    <span class="site-banner-label">Interviews rescheduled</span>
    <p>Canceled September interviews are being rescheduled by email, sometimes for the next day. First interview, new date, or called back after a 221(g)? <a href="/interview">Start here &rarr;</a></p>
  </div>
</div>
`;

  /* Top nav: five sections plus one call to action. Labels follow
     docs/site-labels.md. About, Glossary, Privacy and Support live in the
     footer; the brand mark is the home link. */
  const NAV_HTML = `
<nav class="site-nav" role="navigation" aria-label="Main navigation">
  <div class="nav-container">

    <a href="/" class="nav-brand" aria-label="American Visa Guide: home">
      <span class="nav-brand-mark" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 24 24">
          <rect width="24" height="24" rx="5" fill="#f8fafc"/>
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
      <li class="nav-item--group">
        <button type="button" class="nav-link nav-group-toggle" data-navpage="guide" aria-expanded="false" aria-controls="nav-guide-menu">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
          </svg>
          Guide
          <svg class="nav-caret" aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <ul class="nav-submenu" id="nav-guide-menu" role="list">
          <li>
            <a href="/guide" class="nav-sublink" data-navsub="guide">
              <span class="nav-sublink-title">Visa guide</span>
              <span class="nav-sublink-desc">Every stage, from the I-130 to US entry</span>
            </a>
          </li>
          <li>
            <a href="/life" class="nav-sublink" data-navsub="life">
              <span class="nav-sublink-title">Life in the USA</span>
              <span class="nav-sublink-desc">Your first weeks and first year after landing</span>
            </a>
          </li>
          <li>
            <a href="/naturalization" class="nav-sublink" data-navsub="naturalization">
              <span class="nav-sublink-title">Naturalization</span>
              <span class="nav-sublink-desc">Becoming a US citizen, step by step</span>
            </a>
          </li>
        </ul>
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
        <a href="/data" class="nav-link" data-navpage="data">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          Data
        </a>
      </li>
      <li>
        <a href="/news" class="nav-link" data-navpage="news">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9h4"/><line x1="10" y1="7" x2="18" y2="7"/><line x1="10" y1="11" x2="18" y2="11"/><line x1="10" y1="15" x2="15" y2="15"/>
          </svg>
          News
        </a>
      </li>
      <li>
        <a href="/tools" class="nav-link" data-navpage="tools">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
          Tools
        </a>
      </li>
      <li class="nav-item--search">
        <a href="/search" class="nav-link nav-link--search" data-navpage="search">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          Search
        </a>
      </li>
      <li class="nav-item--cta">
        <a href="https://forms.fillout.com/t/dTRqnkx9uxus" class="nav-link nav-link--cta" target="_blank" rel="noopener noreferrer" data-navpage="submit">
          Submit your timeline
          <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          <span class="visually-hidden-nav">(opens in a new tab)</span>
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
        <p class="avg-footer__hd">About</p>
        <a href="/about">About this site</a><br>
        <a href="/glossary">Glossary</a>
      </div>
      <div>
        <p class="avg-footer__hd">Legal</p>
        <a href="/privacy">Privacy Policy</a>
        <button type="button" class="avg-footer__linkbtn" data-consent-open>Cookie settings</button>
      </div>
      <div>
        <p class="avg-footer__hd">Support</p>
        <a href="https://ko-fi.com/erinsaidwhat" class="avg-footer__kofi" target="_blank" rel="noopener noreferrer">&#9749; Buy me a coffee</a>
      </div>
    </div>
    <p class="avg-footer__copyright">&copy; American Visa Guide &middot; Community-powered immigration resource</p>
  </div>
</footer>`;

  /* Which nav item lights up, by the first part of the address: every page
     lives under its section (/interview/221g/green-sheet, /tools/workbook,
     /naturalization/oath). Addresses not listed (home, about, privacy) light
     nothing. 'life' and 'naturalization' light the Guide button and the
     matching item in its menu. */
  const ACTIVE_MAP = {
    'guide': 'guide',
    'glossary': 'guide',
    'life': 'life',
    'naturalization': 'naturalization',
    'interview': 'interview',
    'public-charge': 'interview',
    'data': 'data',
    'news': 'news',
    'tools': 'tools',
    'search': 'search',
  };

  const GUIDE_SECTIONS = { guide: 1, life: 1, naturalization: 1 };

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
    wireGroup(nav);
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
    const first = window.location.pathname.split('/')[1] || '';
    const active = ACTIVE_MAP[first.replace(/\.html$/, '')];
    if (!active) return;

    if (GUIDE_SECTIONS[active]) {
      const group = nav.querySelector('.nav-group-toggle[data-navpage="guide"]');
      if (group) group.classList.add('nav-link--active');
      const sub = nav.querySelector('.nav-sublink[data-navsub="' + active + '"]');
      if (sub) sub.setAttribute('aria-current', 'page');
      return;
    }
    const link = nav.querySelector('.nav-link[data-navpage="' + active + '"]');
    if (link) {
      link.setAttribute('aria-current', 'page');
      link.classList.add('nav-link--active');
    }
  }

  /* Guide disclosure menu. On wide screens it opens as a dropdown; in the
     hamburger menu its items are always listed, so the button is inert there
     (CSS hides the caret). */
  function wireGroup(nav) {
    const btn = nav.querySelector('.nav-group-toggle');
    const panel = btn && document.getElementById(btn.getAttribute('aria-controls'));
    if (!btn || !panel) return;

    // Matches the hamburger breakpoint in /css/nav.css
    const stacked = window.matchMedia('(max-width: 900px)');

    function setOpen(open) {
      // In the stacked phone menu the items are always shown, so the
      // button reports itself as expanded and ignores clicks.
      const shown = stacked.matches || open;
      btn.setAttribute('aria-expanded', String(shown));
      panel.classList.toggle('is-open', !stacked.matches && open);
    }

    setOpen(false);
    if (stacked.addEventListener) {
      stacked.addEventListener('change', function () { setOpen(false); });
    }

    btn.addEventListener('click', function () {
      if (stacked.matches) return;
      setOpen(!panel.classList.contains('is-open'));
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav-item--group')) setOpen(false);
    });

    nav.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) {
        setOpen(false);
        btn.focus();
        e.stopPropagation();
      }
    });

    // Close when focus leaves the group (Tab past the last item)
    btn.parentElement.addEventListener('focusout', function (e) {
      if (!btn.parentElement.contains(e.relatedTarget)) setOpen(false);
    });
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
