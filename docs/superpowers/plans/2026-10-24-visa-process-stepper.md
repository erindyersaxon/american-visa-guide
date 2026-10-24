# Visa Process Stepper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A four-step, reader-set visa progress bar, sticky under the shared nav on visa-process pages, with community-median timeframe tags from `/api/data`.

**Architecture:** Pure logic in `public/js/stepper-core.js` (unit-tested under Node), DOM in `public/js/stepper.js`, styles in `public/css/stepper.css`. `public/js/nav.js` mounts it after the nav. A page allowlist in core decides where it shows. `/api/data` gains a CDN cache header.

**Tech Stack:** Static HTML, vanilla ES2017 JS (classic deferred scripts, no modules, no bundler), plain CSS with design tokens, Node's built-in `node:test`, Vercel serverless (`api/data.js`).

**Spec:** `docs/superpowers/specs/2026-10-24-visa-process-stepper-design.md`

## Global Constraints

- No React, TSX, bundler or new npm dependency. Tests use `node:test` and `node:assert/strict` only.
- Never query Supabase from the browser. Timeframes come only from `GET /api/data` → `stage_avgs`.
- Colours, radii and fonts only through tokens (`var(--color-*)`, `--radius-*`, `--font-*`). No shadows, gradients or decorative icons. Red rule: `var(--color-mark, var(--color-gold))`.
- Storage keys: `localStorage['avg-step']` (`"1"`–`"4"`), `sessionStorage['avg-step-tags']`. Every storage access is in try/catch.
- Minimum sample size for a tag: `n >= 5`.
- Status words always visible: `Completed`, `In progress`, `Upcoming`.
- Site copy uses no em dashes and no `text-transform: uppercase` (repo convention since d7ec490).
- Cache header on successful `/api/data` responses: `public, s-maxage=600, stale-while-revalidate=3600`.
- New asset version: `?v=20261024` for every changed or new `/css` and `/js` file. `/css` and `/js` are served immutable, so a missed bump ships stale code.
- Local preview is `python3 -m http.server` (no clean URLs). The allowlist must accept both `/guide/nvc` and `/guide/nvc.html`.

## Review Focus

1. **Path variants**: `/index.html`, `/guide/` (trailing slash, local preview) and `/guide/nvc.html` should behave exactly like `/`, `/guide` and `/guide/nvc`. Pinned in Task 1 (`isStepperPage` path variants).
2. **Odd API values**: a `stage_avgs` entry with `median` of `0`, negative, `null` or a string should hide the tag, not render "~0 days". Pinned in Task 1 (`formatTag` rejects bad medians).
3. **Corrupt session cache**: a `sessionStorage['avg-step-tags']` holding invalid JSON or the wrong shape should trigger a refetch, not a blank or a throw. Pinned in Task 1 (`parseCachedTags`).
4. **Two open tabs**: choosing a step in one tab should update the bar in another open tab. Pinned in Task 4 (`storage` event listener) and Task 6 (browser check).
5. **Narrow phones**: the collapsed mobile row at 320px with the longest label, "Step 3 of 4: Interview prep & embassy interview", should truncate with an ellipsis, not overflow. Pinned in Task 3 (CSS) and Task 6 (320px check).

---

### Task 1: Core logic and test runner

**Files:**
- Create: `public/js/stepper-core.js`
- Create: `test/stepper-core.test.js`
- Modify: `package.json` (scripts)

**Interfaces:**
- Produces, on `window.AVGStepperCore` in the browser and `module.exports` under Node:
  - `STEPS: Array<{ id: 1|2|3|4, label: string, short: string, href: string, statKey: string }>`, in the order and with the values of spec §3. For example, step 2 is `{ id: 2, label: 'Medical exam (VisaMedicals)', short: 'Medical', href: '/guide/medical', statKey: 'il_to_medical_med' }`. Step 1's `statKey` is `'approval_to_dq_stats'`.
  - `MIN_N = 5`
  - `parseStoredStep(raw: string|null|undefined) -> 1|2|3|4|null`
  - `stepStatus(stepId: number, current: number|null) -> 'completed'|'in-progress'|'upcoming'|'neutral'`
  - `formatTag(stat: {median:number, n:number}|null|undefined) -> string|null`
  - `pickTags(apiData: object) -> { [id:number]: {median, n} | null }`, reading `apiData.stage_avgs[statKey]` and keeping only `median` and `n`.
  - `parseCachedTags(raw: string|null) -> object|null`. It returns the object only if it has keys `1`–`4`, each `null` or `{median:number, n:number}`.
  - `isStepperPage(pathname: string) -> boolean`

- [ ] **Step 1: Write the failing tests** in `test/stepper-core.test.js` (`require('../public/js/stepper-core.js')`):

```js
test('parseStoredStep accepts 1-4 only', () => {
  ['1','2','3','4'].forEach((s, i) => assert.equal(parseStoredStep(s), i + 1));
  ['0','5','abc','',' 2', '2.5', null, undefined].forEach(v => assert.equal(parseStoredStep(v), null));
});
test('stepStatus around current step 3', () => {
  assert.deepEqual([1,2,3,4].map(id => stepStatus(id, 3)), ['completed','completed','in-progress','upcoming']);
});
test('stepStatus unset is neutral', () => {
  assert.deepEqual([1,2,3,4].map(id => stepStatus(id, null)), Array(4).fill('neutral'));
});
test('formatTag days vs weeks', () => {
  assert.equal(formatTag({ median: 9, n: 12 }), '~9 days typical · 12 members');
  assert.equal(formatTag({ median: 13, n: 12 }), '~13 days typical · 12 members');
  assert.equal(formatTag({ median: 14, n: 12 }), '~2 wks typical · 12 members');
  assert.equal(formatTag({ median: 35, n: 48 }), '~5 wks typical · 48 members');
});
test('formatTag hides small or missing samples', () => {
  [null, undefined, { median: 20, n: 4 }].forEach(s => assert.equal(formatTag(s), null));
});
test('formatTag rejects bad medians', () => {
  [0, -3, null, '20', NaN].forEach(m => assert.equal(formatTag({ median: m, n: 30 }), null));
});
test('pickTags maps stage_avgs by step', () => {
  const t = pickTags({ stage_avgs: { approval_to_dq_stats: { avg: 40, median: 38, n: 60, min: 1, max: 120 }, il_to_medical_med: null } });
  assert.deepEqual(t[1], { median: 38, n: 60 });
  assert.equal(t[2], null);
  assert.equal(t[3], null); // missing key
});
test('parseCachedTags rejects junk', () => {
  ['{', '[]', '{"1":5}', null, '{"1":null,"2":null,"3":null}'].forEach(r => assert.equal(parseCachedTags(r), null));
  const ok = '{"1":{"median":38,"n":60},"2":null,"3":null,"4":{"median":12,"n":9}}';
  assert.deepEqual(parseCachedTags(ok)[4], { median: 12, n: 9 });
});
test('isStepperPage allowlist', () => {
  ['/', '/index.html', '/guide', '/guide/', '/guide.html', '/guide/nvc', '/guide/nvc.html',
   '/checklist-medical', '/221g', '/data'].forEach(p => assert.equal(isStepperPage(p), true, p));
});
test('isStepperPage path variants and exclusions', () => {
  ['/news', '/naturalization', '/life', '/privacy', '/guide-extra', '/visa-pause', '/404', '/news.html']
    .forEach(p => assert.equal(isStepperPage(p), false, p));
});
```

- [ ] **Step 2: Add `"test": "node --test test/"` to `package.json` scripts and run `npm test`.**
Expected: FAIL, `Cannot find module '../public/js/stepper-core.js'`.

- [ ] **Step 3: Implement `public/js/stepper-core.js`** as an IIFE that assigns to `module.exports` when it exists and to `window.AVGStepperCore` otherwise.
  - Allowlist: normalise the pathname by stripping a trailing `/` (except root), a trailing `.html`, and `/index` → `/`. Then match the exact list and the prefixes `/guide/` and `/checklist-` from spec §5.
  - Weeks: `Math.round(median / 7)` when `median >= 14`.

- [ ] **Step 4: Run `npm test`.** Expected: all 10 tests pass.

- [ ] **Step 5: Commit** `git add package.json public/js/stepper-core.js test/` with message `Stepper: core logic and node:test runner`.

---

### Task 2: CDN cache on /api/data

**Files:**
- Modify: `api/data.js:684` (the `res.status(200).json(` success return)

**Interfaces:** none consumed or produced in code. Tasks 4 and 6 rely on the header.

- [ ] **Step 1: Directly before the `return res.status(200).json({` at line 684, add `res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600')`.** Leave the 503, 500 and 405 paths uncached.
- [ ] **Step 2: Verify.** Run `node -e "import('./api/data.js').then(m => console.log(typeof m.default))"` (the file is ESM); expected: `function`. Run `grep -n "Cache-Control" api/data.js`; expected: exactly one line, just above the 200 response.
- [ ] **Step 3: Commit** with message `api/data: 10-minute CDN cache on successful responses`.

---

### Task 3: Styles and sticky offset

**Files:**
- Create: `public/css/stepper.css`
- Modify: `public/css/nav.css` (append the offset rules)
- Modify: `public/css/stage.css:368` (`scroll-margin-top: 72px` → `calc(var(--sticky-offset) + 8px)`)
- Modify: `public/css/print.css` (add `.visa-stepper { display: none !important; }` inside its print rules)

**Interfaces:**
- Produces the class names Task 4 renders:
  - Containers: `.visa-stepper` (the root `<nav>`), `.visa-stepper__list` (the `<ol>`), `.visa-stepper__step`.
  - Status modifiers on the step: `--completed`, `--in-progress`, `--upcoming`, `--neutral`.
  - Parts of a step: `.visa-stepper__dot`, `.visa-stepper__label`, `.visa-stepper__badge`, `.visa-stepper__tag`, `.visa-stepper__choose`.
  - Bar-level controls: `.visa-stepper__change`, `.visa-stepper__prompt`, `.visa-stepper__toggle` (mobile), `.visa-stepper.is-open`.
  - Live region: `.visa-stepper__live` (visually hidden).
  - Page flag: `html.has-stepper`.

- [ ] **Step 1: Append the `--sticky-offset` block from spec §7 verbatim to `nav.css`.** Make the stage.css and print.css edits listed above.
- [ ] **Step 2: Write `stepper.css` to spec §7.** Pin these values:
  - `position: sticky; top: 64px; z-index: 99`
  - desktop `min-height: 56px`, mobile collapsed toggle `min-height: 44px` (breakpoint `max-width: 767px`)
  - short labels between 768px and 1024px: the label renders `data-short` via a hidden or visible span pair
  - the In progress 2px bottom rule uses `var(--color-mark, var(--color-gold))`
  - the tag line has a fixed `min-height` so late tags don't shift layout
  - the pulse is a `@keyframes` ring, `2.5s`, `animation-iteration-count: 3`, only inside `@media (prefers-reduced-motion: no-preference)`
  - the mobile toggle text uses `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` (Review Focus 5)
  - focus uses `outline: var(--focus-outline); outline-offset: 2px`
- [ ] **Step 3: Verify.** Run `grep -nE "box-shadow|gradient|uppercase|#[0-9a-fA-F]{3,6}" public/css/stepper.css`; expected: no output.
- [ ] **Step 4: Commit** with message `Stepper: styles and shared sticky offset`.

---

### Task 4: DOM component and nav hook

**Files:**
- Create: `public/js/stepper.js`
- Modify: `public/js/nav.js:228` (in `mount()`, after `mountBanner(nav);`)

**Interfaces:**
- Consumes: `window.AVGStepperCore` (Task 1), the class names (Task 3), and `GET /api/data` (Task 2).
- Produces: `window.AVGStepper = { mount(nav: HTMLElement): void }`.

- [ ] **Step 1: In `nav.js` `mount()`, add `if (window.AVGStepper) window.AVGStepper.mount(nav);` after `mountBanner(nav);`.**
- [ ] **Step 2: Implement `mount(nav)` in `stepper.js`.**
  - It returns immediately unless `AVGStepperCore.isStepperPage(location.pathname)`. It is idempotent: if `.visa-stepper` already exists, it skips.
  - It inserts the bar as `nav.nextSibling` and adds `has-stepper` to `document.documentElement`.
  - Markup and wording are fixed by spec §6 and §9:
    - the root is `<nav class="visa-stepper" aria-label="Your visa progress">`, containing an `<ol>`
    - the step label is an `<a href>` with `data-short`
    - each step has a separate `<button class="visa-stepper__choose">This is me</button>`
    - the In progress `<li>` gets `aria-current="step"`
    - accessible name, e.g. "Step 2 of 4, Medical exam (VisaMedicals), in progress"
    - unset prompt: "Where are you? Pick your step"
    - mobile toggle: `<button aria-expanded="false" aria-controls>` reading "Step N of 4: {label} ▾" or "Where are you in the process? ▾"
    - the "Change" button clears `avg-step`
    - live region `role="status"` text: "Saved: you're on step N"
- [ ] **Step 3: Wire the behaviour.**
  - **Choose and Change:** write to or remove `localStorage['avg-step']` in try/catch, then re-render in place. Keep an in-memory `current` so choosing still works when storage throws.
  - **Two tabs:** `window.addEventListener('storage', e => e.key === 'avg-step' && rerender())` (Review Focus 4).
  - **Mobile:** the toggle flips `.is-open` and `aria-expanded`. Escape closes it and focuses the toggle.
- [ ] **Step 4: Fill the tags.**
  - Read `AVGStepperCore.parseCachedTags(sessionStorage['avg-step-tags'])`.
  - If that is null, `fetch('/api/data')`. If `ok`, take `pickTags(json)`, store it with `JSON.stringify`, and render.
  - Each tag renders `formatTag(tags[id])`, leaving it empty when null.
  - Any fetch or parse failure leaves the tags empty and never throws.
- [ ] **Step 5: Smoke check.**
  - `preview_start {name: "static-public"}`, open `/guide/nvc.html`.
  - `read_page`: expected a `navigation "Your visa progress"` with 4 list items and the prompt text.
  - `read_console_messages {onlyErrors: true}`: expected none, apart from a failed `/api/data`, which the Python server can't serve.
- [ ] **Step 6: Commit** with message `Stepper: DOM component mounted from nav.js`.

---

### Task 5: Load on every page

**Files:**
- Modify: every file under `public/` that loads `/js/nav.js` (50 HTML pages; `grep -rl 'js/nav.js' public --include=*.html`)

**Interfaces:**
- Consumes: the files from Tasks 1, 3 and 4.

- [ ] **Step 1: In each page, insert immediately before the existing `<script src="/js/nav.js?v=…" defer>` line:**

```html
<link rel="stylesheet" href="/css/stepper.css?v=20261024">
<script src="/js/stepper-core.js?v=20261024" defer></script>
<script src="/js/stepper.js?v=20261024" defer></script>
```

  Deferred scripts run in document order, so both stepper scripts run before `nav.js`. Match each page's existing indentation.
- [ ] **Step 2: Bump versions.** In the same pages, set `nav.js`, `nav.css`, `stage.css` and `print.css` references to `?v=20261024`. Do it with a short one-off script in the scratchpad, not by hand. It must not touch `public/js/shared.js` or `public/js/main.js`, which only mention `nav.js` in comments.
- [ ] **Step 3: Verify.**
  - `grep -rL 'stepper.js?v=20261024' $(grep -rl 'js/nav.js' public --include=*.html)` → no output.
  - `grep -rhoE '(nav|stage|print)\.(js|css)\?v=[0-9a-z]+' public --include=*.html | sort -u` → only `?v=20261024`.
  - `git diff --stat` → only HTML files.
- [ ] **Step 4: Commit** with message `Load the stepper on every page and bump asset versions`.

---

### Task 6: Browser verification

**Files:** none, unless a check fails. Fix the defect in the owning task's file and commit it as `Stepper: fix <what>`.

- [ ] **Step 1: Unit tests.** Run `npm test`. Expected: all pass.
- [ ] **Step 2: Desktop, 1280px, on `/guide/nvc.html`.** Then click "This is me" on step 2 and check:
  - step 1 shows Completed, step 2 In progress with `aria-current="step"`, steps 3 and 4 Upcoming
  - reload and navigate to `/checklists.html`: still step 2
  - take a screenshot
- [ ] **Step 3: Tablet and mobile.**
  - 900px: short labels show.
  - 375px and 320px: one collapsed row, with ellipsis on step 3's label. Expanding pushes content down. Escape closes it.
  - `document.documentElement.scrollWidth <= innerWidth` at both widths.
- [ ] **Step 4: Anchors.** On `/guide/interview.html`, follow a `#` section link. `getBoundingClientRect().top` of the target should be at least 120px on desktop and at least 108px at 375px.
- [ ] **Step 5: Absent where it should be.**
  - On `/news.html` and `/naturalization.html` there is no `.visa-stepper` and no `has-stepper` class.
- [ ] **Step 6: Failure modes.**
  - Set `localStorage['avg-step']='9'` and reload: unset state, key removed.
  - Set `sessionStorage['avg-step-tags']='{'` and reload: no throw.
  - With `/api/data` unavailable (the Python server can't serve it): no tags, no errors besides the 404.
  - Emulate `prefers-reduced-motion: reduce`: no animation.
  - Print emulation: stepper hidden.
- [ ] **Step 7: Two tabs.** Open a second tab on `/data.html`, choose step 3 in the first tab, and confirm the second tab updates to step 3.
- [ ] **Step 8: Live checks, after the user approves a push** (pushing to main deploys to production).
  - `curl -sI https://<site>/api/data | grep -i cache-control` shows the new header.
  - Tags render with real values on `/guide/nvc`.
