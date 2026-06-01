/* ─────────────────────────────────────────────────────────────
   American Visa Guide — main.js
   Handles: nav/footer partial loading, hamburger toggle,
            active-page detection, dark-mode toggle
   ───────────────────────────────────────────────────────────── */

/* ─── HTML Partials ───────────────────────────────────────── */
async function loadPartial(selector, url) {
  const el = document.querySelector(selector);
  if (!el) return;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} loading ${url}`);
    el.outerHTML = await res.text();
  } catch (err) {
    console.error('Partial load failed:', err);
  }
}

/* ─── Nav: hamburger + active page ───────────────────────── */
function initNav() {
  // Active page
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-link[data-navpage]').forEach(link => {
    try {
      const linkPath = new URL(link.href, window.location.origin).pathname.replace(/\/$/, '') || '/';
      if (linkPath === path) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('nav-link--active');
      }
    } catch {
      // external links — skip
    }
  });

  // Hamburger toggle
  const toggle = document.querySelector('.nav-toggle');
  const menu   = document.querySelector('.nav-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    menu.classList.toggle('is-open', !expanded);
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('.site-nav') && menu.classList.contains('is-open')) {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });
}

/* ─── Dark mode toggle (optional, wires up a button with
       data-theme-toggle if one exists on the page) ───────── */
function initThemeToggle() {
  const btn = document.querySelector('[data-theme-toggle]');
  if (!btn) return;

  const stored = localStorage.getItem('avg-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = stored ?? (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', initial);
  btn.setAttribute('aria-pressed', String(initial === 'dark'));

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('avg-theme', next);
    btn.setAttribute('aria-pressed', String(next === 'dark'));
  });
}

/* ─── Accordion ───────────────────────────────────────────── */
function initAccordions() {
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      const panelId  = trigger.getAttribute('aria-controls');
      const panel    = panelId ? document.getElementById(panelId) : null;

      trigger.setAttribute('aria-expanded', String(!expanded));
      if (panel) panel.hidden = expanded;
    });
  });
}

/* ─── Checklist persistence (localStorage) ───────────────── */
function initChecklists() {
  const page = window.location.pathname;

  document.querySelectorAll('.checklist-item__checkbox').forEach(cb => {
    if (!cb.id) return;
    const key = `avg-check:${page}:${cb.id}`;

    // Restore saved state
    if (localStorage.getItem(key) === '1') {
      cb.checked = true;
      cb.closest('.checklist-item')?.classList.add('is-checked');
    }

    cb.addEventListener('change', () => {
      localStorage.setItem(key, cb.checked ? '1' : '0');
      cb.closest('.checklist-item')?.classList.toggle('is-checked', cb.checked);
    });
  });
}

/* ─── GDPR: Worksheet data isolation verification ───────── */
function verifyWorksheetDataIsolation() {
  // Worksheets must store data in form field values only, not localStorage/sessionStorage
  const isWorksheet = /worksheet|public-charge/.test(window.location.pathname);
  if (isWorksheet) {
    const worksheetStorageUsed = Object.keys(sessionStorage)
      .filter(k => k.startsWith('worksheet') || k.startsWith('public-charge')).length;
    if (worksheetStorageUsed > 0) {
      console.warn('⚠️ Worksheet detected using sessionStorage — data must be stored in form fields only');
    }
  }
}

/* ─── Boot ────────────────────────────────────────────────── */
async function boot() {
  // Load partials — nav first (skip link must precede content)
  await Promise.all([
    loadPartial('#nav-placeholder',    '/nav.html'),
    loadPartial('#footer-placeholder', '/footer.html'),
  ]);

  initNav();
  initThemeToggle();
  initAccordions();
  initChecklists();
  verifyWorksheetDataIsolation();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
