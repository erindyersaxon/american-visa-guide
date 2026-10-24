/*
   Visa process stepper: renders the bar that js/nav.js mounts under the nav.
   The reader picks their step; it lives in localStorage['avg-step'].
   Timeframe tags come from the shared community-stats loader (js/community-stats.js).
   Logic lives in js/stepper-core.js.
   Spec: docs/superpowers/specs/2026-10-24-visa-process-stepper-design.md
 */
(function () {
  'use strict';

  const STEP_KEY = 'avg-step';
  const BADGE = { completed: 'Completed', 'in-progress': 'In progress', upcoming: 'Upcoming' };

  let root = null;
  let current = null;
  let stats = null;

  function readStep() {
    try { return window.AVGStepperCore.parseStoredStep(localStorage.getItem(STEP_KEY)); }
    catch (e) { return null; }
  }

  function saveStep(step) {
    current = step;
    try {
      if (step == null) localStorage.removeItem(STEP_KEY);
      else localStorage.setItem(STEP_KEY, String(step));
    } catch (e) { /* storage blocked: keep the choice for this page view */ }
  }

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function renderStep(step, list) {
    const core = window.AVGStepperCore;
    const status = core.stepStatus(step.id, current);
    const li = el('li', 'visa-stepper__step visa-stepper__step--' + status);
    if (status === 'in-progress') li.setAttribute('aria-current', 'step');

    const dot = el('span', 'visa-stepper__dot', status === 'completed' ? '✓' : '');
    dot.setAttribute('aria-hidden', 'true');

    const head = el('span', 'visa-stepper__head');
    const link = el('a', 'visa-stepper__label');
    link.href = step.href;
    link.dataset.focusKey = 'link-' + step.id;
    link.setAttribute('aria-label', 'Step ' + step.id + ' of 4, ' + step.label +
      (BADGE[status] ? ', ' + BADGE[status].toLowerCase() : ''));
    const full = el('span', 'visa-stepper__full', step.label);
    const short = el('span', 'visa-stepper__short', step.short);
    full.setAttribute('aria-hidden', 'true');
    short.setAttribute('aria-hidden', 'true');
    link.append(full, short);
    head.append(link);

    const meta = el('span', 'visa-stepper__meta');
    if (BADGE[status]) {
      const badge = el('span', 'visa-stepper__badge', BADGE[status]);
      badge.setAttribute('aria-hidden', 'true');
      meta.append(badge);
    }
    const tagText = stats ? core.formatTag(stats[step.statKey]) || '' : '';
    const tag = el('span', 'visa-stepper__tag', tagText);
    if (tagText) tag.title = tagText; // the tag can be cut short on narrow screens
    const pick = el('button', 'visa-stepper__choose', 'This is me');
    pick.type = 'button';
    pick.dataset.focusKey = 'choose-' + step.id;
    pick.setAttribute('aria-label', "I'm on step " + step.id + ': ' + step.label);
    pick.addEventListener('click', function () { choose(step.id); });
    meta.append(tag, pick);

    li.append(dot, head, meta);
    list.append(li);
  }

  function render() {
    const core = window.AVGStepperCore;
    const open = root.classList.contains('is-open');
    const active = document.activeElement;
    const focusKey = active && root.contains(active) ? active.dataset.focusKey : null;

    root.className = 'visa-stepper' + (current == null ? ' visa-stepper--unset' : '') + (open ? ' is-open' : '');
    const inner = root.querySelector('.visa-stepper__inner');
    inner.replaceChildren();

    const now = current && core.STEPS[current - 1];
    const toggle = el('button', 'visa-stepper__toggle',
      (now ? 'Step ' + now.id + ' of 4: ' + now.label : 'Where are you in the process?') + ' ▾');
    toggle.type = 'button';
    toggle.dataset.focusKey = 'toggle';
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-controls', 'visa-stepper-list');
    toggle.addEventListener('click', function () { setOpen(!root.classList.contains('is-open')); });

    if (current == null) inner.append(el('p', 'visa-stepper__prompt', 'Where are you? Pick your step'));

    const list = el('ol', 'visa-stepper__list');
    list.id = 'visa-stepper-list';
    core.STEPS.forEach(function (s) { renderStep(s, list); });

    inner.prepend(toggle);
    inner.append(list);
    if (current != null) {
      const change = el('button', 'visa-stepper__change', 'Change');
      change.type = 'button';
      change.dataset.focusKey = 'change';
      change.setAttribute('aria-label', 'Change your step');
      change.addEventListener('click', function () { choose(null); });
      inner.append(change);
    }

    // Re-rendering replaces the controls; put keyboard focus back on the same
    // control, or on the reader's step if that control is gone.
    if (focusKey) {
      const target = [focusKey, 'link-' + current, 'toggle', 'link-1']
        .map(function (k) { return root.querySelector('[data-focus-key="' + k + '"]'); })
        .find(function (n) { return n && n.offsetParent !== null; });
      if (target) target.focus();
    }
  }

  function choose(step) {
    saveStep(step);
    render();
    root.querySelector('.visa-stepper__live').textContent =
      step == null ? 'Step cleared' : "Saved: you're on step " + step;
  }

  function setOpen(open) {
    root.classList.toggle('is-open', open);
    const toggle = root.querySelector('.visa-stepper__toggle');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function loadTags() {
    if (!window.AVGStats) return; // no tags: the bar works without them
    window.AVGStats.load().then(function (loaded) {
      if (!loaded) return;
      stats = loaded;
      if (root) render();
    });
  }


  function mount(nav) {
    const core = window.AVGStepperCore;
    if (!core || !nav || !nav.parentNode) return;
    if (!core.isStepperPage(location.pathname)) return;
    if (document.querySelector('.visa-stepper')) return;

    root = el('nav', 'visa-stepper');
    root.setAttribute('aria-label', 'Your visa progress');
    root.append(el('div', 'visa-stepper__inner'));
    const live = el('p', 'visa-stepper__live');
    live.setAttribute('role', 'status');
    root.append(live);
    nav.parentNode.insertBefore(root, nav.nextSibling);
    document.documentElement.classList.add('has-stepper');

    current = readStep();
    // Clear junk so it doesn't linger
    try {
      if (current == null && localStorage.getItem(STEP_KEY) != null) localStorage.removeItem(STEP_KEY);
    } catch (e) { /* ignore */ }

    loadTags();
    render();

    root.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && root.classList.contains('is-open')) {
        setOpen(false);
        root.querySelector('.visa-stepper__toggle').focus();
      }
    });
    window.addEventListener('storage', function (e) {
      if (e.key === STEP_KEY) { current = readStep(); render(); }
    });
  }

  window.AVGStepper = { mount: mount };
})();
