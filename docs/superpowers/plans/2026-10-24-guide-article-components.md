# Guide Article Components and Live Stat Box Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A shared, opt-in article component stylesheet and live community-median stat boxes, with the stepper moved onto one shared `/api/data` loader.

**Architecture:**
- `public/js/community-stats.js` holds the pure helpers and a single-flight, session-cached loader. Both `stepper.js` and the new `stat-box.js` consume it.
- `public/css/guide-article.css` defines the components under a `.guide-article` opt-in root. The stat box classes are unscoped.
- First use: stat boxes on `/guide/medical` and `/guide/interview`.

**Tech Stack:** Static HTML, vanilla ES2017 classic deferred scripts, plain CSS with design tokens, `node:test`.

**Spec:** `docs/superpowers/specs/2026-10-24-guide-article-components-design.md`

## Global Constraints

- No React, TSX, MDX, Tailwind, bundler or new npm dependency.
- Never query Supabase from the browser; only `GET /api/data` → `stage_avgs`.
- Allowlist (verbatim): `pd_to_approval_med`, `approval_to_welcome_med`, `welcome_to_fees_med`, `fees_to_docs_med`, `docs_to_dq_med`, `approval_to_dq_stats`, `il_to_medical_med`, `medical_to_interview_med`, `interview_to_passport_med`.
- `MIN_N = 5`.
- Durations: "~N days" below 14, "~N wks" with `Math.round(days / 7)` from 14.
- Cache key: `sessionStorage['avg-stage-stats']`. Every storage access is in try/catch. The old `avg-step-tags` key is no longer read or written.
- Every component rule except `.stat-box*` and `.stat-row` is scoped under `.guide-article`.
- Colours only through tokens, using a fallback chain: design-system name, then main.css name, then stage.css name, then a Civic Editorial hex. No `box-shadow`, `gradient` or `text-transform: uppercase`.
- Callout and summary text at body size; smallest text 14px.
- No em dashes in site copy (repo convention).
- New and changed `/css` and `/js` assets use `?v=20261024d`. These paths are served immutable, so a missed bump ships stale code.
- Stylesheet order: page stylesheet, `nav.css`, `stepper.css`, `guide-article.css`, `readability.css` (last).
- Deferred script order: `community-stats.js`, `stepper-core.js`, `stepper.js`, `stat-box.js`, `nav.js`.
- Local preview: `preview_start {name: "static-public"}`, served from `public/` by Python on port 8765. It has no `/api/data`.

## Review Focus

1. **Two consumers on one page**: when the stepper and the stat boxes both call `load()` before the first response arrives, the page should make exactly one request. Pinned in Task 2 (`load shares one in-flight request`).
2. **Storage that throws** (Safari private mode, blocked site data): `load()` should still fetch and resolve stats rather than reject. Pinned in Task 2 (`load works when storage throws`).
3. **A 200 response without `stage_avgs`**: every stat should be `null`, so the boxes keep their fallback text and the stepper shows no tags. Pinned in Task 1 (`pickStats handles missing stage_avgs`).
4. **A typo in `data-stat`**: the box keeps its fallback text and a warning names the key. Pinned in Task 4 (`statBoxView unknown key`) and Task 6 (console check).
5. **Data arriving after the reader has scrolled**: the box height must not change. Pinned in Task 3 (`min-height`) and Task 6 (height check).

---

### Task 1: Shared stat helpers

**Files:**
- Create: `public/js/community-stats.js`
- Create: `test/community-stats.test.js`

**Interfaces:**
- Produces, on `window.AVGStats` in the browser and `module.exports` under Node:
  - `STAT_KEYS: string[]`
  - `MIN_N = 5`
  - `isStat(stat) -> boolean`: true only for a finite number `median > 0` and a finite number `n`
  - `usable(stat) -> boolean`: `isStat(stat) && stat.n >= MIN_N`
  - `formatDuration(days: number) -> string`
  - `pickStats(apiData) -> { [key]: {median, n} | null }`: every `STAT_KEYS` key present
  - `parseCachedStats(raw: string|null) -> object|null`

- [ ] **Step 1: Write the failing tests** in `test/community-stats.test.js`:

```js
const S = require('../public/js/community-stats.js');
test('isStat rejects bad medians', () => {
  [0, -3, null, '20', NaN, Infinity].forEach(m => assert.equal(S.isStat({ median: m, n: 30 }), false));
  assert.equal(S.isStat({ median: 14, n: 30 }), true);
  assert.equal(S.isStat(null), false);
});
test('usable needs n >= 5', () => {
  assert.equal(S.usable({ median: 14, n: 4 }), false);
  assert.equal(S.usable({ median: 14, n: 5 }), true);
});
test('formatDuration', () => {
  assert.deepEqual([9, 13, 14, 35].map(S.formatDuration), ['~9 days', '~13 days', '~2 wks', '~5 wks']);
});
test('pickStats keeps allowlisted median and n only', () => {
  const s = S.pickStats({ stage_avgs: {
    il_to_medical_med: { avg: 50, median: 45, n: 186, min: 3, max: 170 },
    medical_to_interview_med: { median: '14', n: 9 },
    pd_to_approval: 300,
  } });
  assert.deepEqual(s.il_to_medical_med, { median: 45, n: 186 });
  assert.equal(s.medical_to_interview_med, null);   // invalid becomes null
  assert.equal('pd_to_approval' in s, false);       // not allowlisted
  assert.deepEqual(Object.keys(s).sort(), [...S.STAT_KEYS].sort());
});
test('pickStats handles missing stage_avgs', () => {
  [{}, null, { stage_avgs: null }].forEach(d =>
    assert.ok(Object.values(S.pickStats(d)).every(v => v === null)));
});
test('parseCachedStats rejects junk and round-trips valid', () => {
  ['{', '[]', null, '{"il_to_medical_med":null}'].forEach(r => assert.equal(S.parseCachedStats(r), null));
  const ok = JSON.stringify(S.pickStats({ stage_avgs: { il_to_medical_med: { median: 45, n: 186 } } }));
  assert.deepEqual(S.parseCachedStats(ok).il_to_medical_med, { median: 45, n: 186 });
  const bad = JSON.parse(ok); bad.docs_to_dq_med = { median: 0, n: 9 };
  assert.equal(S.parseCachedStats(JSON.stringify(bad)), null);
});
```

- [ ] **Step 2: Run `npm test`.** Expected: FAIL with `Cannot find module '../public/js/community-stats.js'`.
- [ ] **Step 3: Implement the helpers** in `public/js/community-stats.js`, using the IIFE export pattern from `public/js/stepper-core.js`: `module.exports` under Node, otherwise `window.AVGStats`.
- [ ] **Step 4: Run `npm test`.** Expected: all tests pass (6 new plus 10 existing).
- [ ] **Step 5: Commit** with message `community-stats: shared stat helpers`.

---

### Task 2: Single-flight cached loader

**Files:**
- Modify: `public/js/community-stats.js`
- Modify: `test/community-stats.test.js`

**Interfaces:**
- Consumes: Task 1 helpers.
- Produces: `load(deps?: { fetch, storage }) -> Promise<object|null>`.
  - `deps` defaults to `window.fetch` and `window.sessionStorage`. Tests inject fakes.
  - It never rejects.
  - It caches only the in-flight promise for one page view, never across a reload.
  - It also exports `_reset()`, which clears the in-flight promise, for tests only.

- [ ] **Step 1: Write the failing tests:**

```js
function fakeFetch(body, status = 200) {
  const f = async () => { f.calls++; return { ok: status === 200, status, json: async () => body }; };
  f.calls = 0; return f;
}
function memStorage() { const m = {}; return { getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, m }; }
const API = { stage_avgs: { il_to_medical_med: { median: 45, n: 186 } } };

test('load shares one in-flight request', async () => {
  S._reset(); const f = fakeFetch(API), st = memStorage();
  const [a, b] = await Promise.all([S.load({ fetch: f, storage: st }), S.load({ fetch: f, storage: st })]);
  assert.equal(f.calls, 1); assert.deepEqual(a, b);
  assert.deepEqual(JSON.parse(st.m['avg-stage-stats']).il_to_medical_med, { median: 45, n: 186 });
});
test('load uses a valid cache without fetching', async () => {
  S._reset(); const f = fakeFetch(API), st = memStorage();
  st.setItem('avg-stage-stats', JSON.stringify(S.pickStats(API)));
  assert.deepEqual((await S.load({ fetch: f, storage: st })).il_to_medical_med, { median: 45, n: 186 });
  assert.equal(f.calls, 0);
});
test('load refetches over a corrupt cache', async () => {
  S._reset(); const f = fakeFetch(API), st = memStorage(); st.setItem('avg-stage-stats', '{');
  await S.load({ fetch: f, storage: st }); assert.equal(f.calls, 1);
});
test('load works when storage throws', async () => {
  S._reset(); const f = fakeFetch(API);
  const boom = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };
  assert.deepEqual((await S.load({ fetch: f, storage: boom })).il_to_medical_med, { median: 45, n: 186 });
});
test('load resolves null on 503 and on network error', async () => {
  S._reset(); assert.equal(await S.load({ fetch: fakeFetch({ error: 'x' }, 503), storage: memStorage() }), null);
  S._reset(); assert.equal(await S.load({ fetch: async () => { throw new Error('offline'); }, storage: memStorage() }), null);
});
```

- [ ] **Step 2: Run `npm test`.** Expected: FAIL, `S.load is not a function`.
- [ ] **Step 3: Implement `load` and `_reset`.** A module-level `inflight` promise is returned to later callers. A failed load clears `inflight`, so a later call on the same page can retry.
- [ ] **Step 4: Run `npm test`.** Expected: all pass.
- [ ] **Step 5: Commit** with message `community-stats: single-flight session-cached loader`.

---

### Task 3: Move the stepper onto the shared loader

**Files:**
- Modify: `public/js/stepper-core.js`: remove `pickTags` and `parseCachedTags`; `formatTag` uses `AVGStats.usable` and `AVGStats.formatDuration`; get `AVGStats` via `require('./community-stats.js')` under Node and `window.AVGStats` in the browser.
- Modify: `public/js/stepper.js:140-152` (`loadTags`) and the `TAGS_KEY` constant: call `AVGStats.load()`, keep the result as `stats`, and render `core.formatTag(stats && stats[step.statKey])`.
- Modify: `test/stepper-core.test.js`: delete the `pickTags` and `parseCachedTags` tests. Keep the `formatTag` tests unchanged; they are the regression guard.
- Modify: all 50 pages that load `/js/stepper-core.js`. Insert `<script src="/js/community-stats.js?v=20261024d" defer></script>` directly before it, and bump `stepper-core.js` and `stepper.js` to `?v=20261024d`.

**Interfaces:**
- Consumes: `AVGStats.usable`, `AVGStats.formatDuration`, `AVGStats.load` (Tasks 1 and 2).
- Produces: `AVGStepperCore.formatTag(stat) -> string|null`, with its output unchanged. `pickTags` and `parseCachedTags` no longer exist.

- [ ] **Step 1: Delete the two moved tests and add a guard test**, then run `npm test`. Expected: FAIL on the guard while the old exports still exist.

```js
test('stepper-core no longer owns data loading', () => {
  const core = require('../public/js/stepper-core.js');
  assert.equal(core.pickTags, undefined);
  assert.equal(core.parseCachedTags, undefined);
});
```

- [ ] **Step 2: Make the code changes** to `stepper-core.js` and `stepper.js` listed above.
- [ ] **Step 3: Run `npm test`.** Expected: all pass, and the existing `formatTag` tests are unchanged.
- [ ] **Step 4: Update all 50 pages** with a one-off script kept in the scratchpad, not the repo. Verify:
  - `grep -rL 'community-stats.js?v=20261024d' $(grep -rl 'stepper-core.js' public --include='*.html')` returns no output.
  - `grep -rhoE 'stepper(-core)?\.js\?v=[0-9a-z]+' public --include='*.html' | sort -u` returns only `?v=20261024d`.
- [ ] **Step 5: Browser smoke test** on `/guide/nvc.html`:
  - seed `sessionStorage['avg-stage-stats']` with `JSON.stringify(AVGStats.pickStats({stage_avgs:{approval_to_dq_stats:{median:38,n:154}}}))` and reload
  - step 1's tag reads "~5 wks typical · 154 members"
  - `sessionStorage['avg-step-tags']` is never written
- [ ] **Step 6: Commit** with message `Stepper: use the shared community-stats loader`.

---

### Task 4: Stat box view logic and script

**Files:**
- Modify: `public/js/community-stats.js` (add `statBoxView`)
- Modify: `test/community-stats.test.js`
- Create: `public/js/stat-box.js`

**Interfaces:**
- Consumes: `AVGStats` (Tasks 1 and 2).
- Produces:
  - `AVGStats.statBoxView(key: string, stats: object|null) -> { value: string, n: number } | null`. It returns null when `key` is not in `STAT_KEYS`, when `stats` is null, or when the stat isn't `usable`.
  - `stat-box.js` runs on `DOMContentLoaded`, with no globals of its own.

- [ ] **Step 1: Write the failing tests:**

```js
test('statBoxView usable stat', () => {
  const stats = S.pickStats({ stage_avgs: { medical_to_interview_med: { median: 14, n: 187 } } });
  assert.deepEqual(S.statBoxView('medical_to_interview_med', stats), { value: '~2 wks', n: 187 });
});
test('statBoxView unknown key, no data, small n', () => {
  const stats = S.pickStats({ stage_avgs: { docs_to_dq_med: { median: 20, n: 4 } } });
  assert.equal(S.statBoxView('medical_to_interviw_med', stats), null);
  assert.equal(S.statBoxView('medical_to_interview_med', null), null);
  assert.equal(S.statBoxView('docs_to_dq_med', stats), null);
});
```

- [ ] **Step 2: Run `npm test`.** Expected: FAIL, `S.statBoxView is not a function`.
- [ ] **Step 3: Implement `statBoxView`.**
- [ ] **Step 4: Run `npm test`.** Expected: all pass.
- [ ] **Step 5: Write `public/js/stat-box.js`.**
  - Collect `.stat-box[data-stat]`. If there are none, return without calling `load`.
  - For each key not in `STAT_KEYS`, call `console.warn('stat-box: unknown key', key)` once.
  - Await `AVGStats.load()`, then for each box with a non-null view:
    - set `.stat-box__value` text to `view.value`
    - replace `.stat-box__source` contents with the text "Median of {n} member timelines · " followed by `<a href="/data">how we count</a>`, built with DOM methods, not `innerHTML`
    - add the class `stat-box--live`
  - Never touch `.stat-box__label`.
- [ ] **Step 6: Commit** with message `Stat box: view logic and filler script`.

---

### Task 5: Shared component stylesheet

**Files:**
- Create: `public/css/guide-article.css`

**Interfaces:**
- Produces the class names in spec §5 and §6, which pieces 3 and 4 and Task 6 rely on:
  - Article layout: `.guide-article`, `.article-header`, `.article-meta`, `.article-summary`, `.article-actions`, `.checklist`.
  - Callouts: `.callout`, `.callout-alert`, `.callout-warn`, `.callout-info`, `.callout-good`, `.callout-title`.
  - Stat box: `.stat-row`, `.stat-box`, `.stat-box__value`, `.stat-box__label`, `.stat-box__source`, `.stat-box--live`.

- [ ] **Step 1: Write the stylesheet to spec §5 and §6.**
  - Define local `--ga-*` tokens on `.guide-article, .stat-box`, following the chain pattern in `public/css/stepper.css`'s `--vs-*` block. The mark token chain is `var(--color-mark, #991B1B)`.
  - Pinned values:
    - `.stat-box`: `min-height: 6.5rem`, padding `12px 16px`, `border-radius: var(--radius-md, 0.375rem)`
    - `__value`: `1.5rem`, weight 600, `font-variant-numeric: tabular-nums lining-nums`
    - `__source`: `14px`
    - `.stat-row`: `display: flex; flex-wrap: wrap; gap: 12px`, boxes `flex: 1 1 200px`; under `max-width: 639px`, boxes are `flex-basis: 100%`
    - summary card: 3px left rule in the mark colour
    - callouts: 1px border plus a 3px left edge per variant
- [ ] **Step 2: Verify the rules.**
  - `grep -nE "box-shadow|gradient|uppercase" public/css/guide-article.css` → no output.
  - Every selector line outside the `--ga-*` block and the `.stat-*` rules starts with `.guide-article`:

```bash
grep -nE '^\s*[.#a-z][^{]*\{' public/css/guide-article.css | grep -vE '\.guide-article|\.stat-(box|row)|^\s*:root|@media'
```

    Expected: no output.
- [ ] **Step 3: Commit** with message `guide-article.css: shared opt-in article components`.

---

### Task 6: First use on the medical and interview pages

**Files:**
- Modify: `public/guide/medical.html`, `public/guide/interview.html`

**Interfaces:**
- Consumes: `guide-article.css` (Task 5), `stat-box.js` (Task 4).

- [ ] **Step 1: Load the new files on both pages.**
  - Insert `<link rel="stylesheet" href="/css/guide-article.css?v=20261024d">` directly before the `readability.css` link.
  - Insert `<script src="/js/stat-box.js?v=20261024d" defer></script>` directly after the `stepper.js` script.
- [ ] **Step 2: Insert the boxes** (spec §8). Place them directly after the first `<p>` that is a direct child of the section: the "Every applicant must have a medical exam…" paragraph in `section#medical`, and the "US Embassy London:" address paragraph in `section#interview`. Not the inline-styled feedback banner above it.
  - Medical: one `.stat-row` with `il_to_medical_med`, label "From interview letter to medical", value "About 6 weeks", source "Community estimate".
  - Interview: one `.stat-row` with two boxes:
    - `medical_to_interview_med`, label "From medical to interview", value "About 2 weeks"
    - `interview_to_passport_med`, label "From interview to passport back", value "About 5 days"
    
    Both with source "Community estimate".
- [ ] **Step 3: Commit** with message `Stat boxes on the medical and interview stage pages`.

---

### Task 7: Browser verification

**Files:** none, unless a check fails. Fix the defect in the owning task's file and commit it as `fix: <what>`.

- [ ] **Step 1: Run `npm test`.** Expected: all pass.
- [ ] **Step 2: Fallback with no API.** Open `/guide/interview.html` at 1280px:
  - both boxes show "About 2 weeks" and "About 5 days" with "Community estimate"
  - `read_console_messages {onlyErrors: true}` shows only the `/api/data` 404
- [ ] **Step 3: Live data.** Seed `sessionStorage['avg-stage-stats']` from `AVGStats.pickStats` with `medical_to_interview_med {median:14,n:187}` and `interview_to_passport_med {median:5,n:104}`, then reload:
  - values read "~2 wks" and "~5 days"
  - source reads "Median of 187 member timelines · how we count", with a link to `/data`
  - labels are unchanged
  - each box's height equals its pre-data height (Review Focus 5)
  - the stepper shows step 3's tag from the same cache
- [ ] **Step 4: One request.** Clear `sessionStorage`, stub `window.fetch` before the scripts run by injecting a counter with `javascript_tool` on a fresh load, then confirm `/api/data` was requested once (Review Focus 1). If stubbing before deferred scripts is impractical, use `read_network_requests {urlPattern: "/api/data"}` after a clean reload. Expected: one entry.
- [ ] **Step 5: Typo key.** In the working tree only, change the first box's `data-stat` in `public/guide/interview.html` to `medical_to_interviw_med` and reload with the cache seeded:
  - that box keeps "About 2 weeks"
  - `read_console_messages {pattern: "stat-box"}` shows one warning naming the key

  Revert with `git checkout public/guide/interview.html`. Nothing is committed.
- [ ] **Step 6: Mobile.** At 375px, `/guide/interview.html`:
  - the row stacks to one column
  - `document.documentElement.scrollWidth <= innerWidth`
- [ ] **Step 7: No visual change elsewhere.** On `/guide/medical.html`, `getComputedStyle` of the first `.checklist li` is unchanged with `guide-article.css` loaded versus with the link removed (the scoping holds). On `/news.html`, there is no `/api/data` request.
- [ ] **Step 8: After deploy** (needs your OK to merge): production `/guide/interview` shows live values.
