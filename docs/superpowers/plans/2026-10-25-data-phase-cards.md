# /data Wait Times by Phase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish robust per-phase statistics from `/api/data` and show them on `/data` as a grouped card grid with a freshness badge, replacing the stage-by-stage table.

**Architecture:**
- `api/_lib/phases.js` takes over `robustStats` and `rollingWindow` from `api/data.js` and adds `buildPhases`. `api/data.js` adds `phases` and `phase_groups` to its response.
- A characterization test pins today's `intervals` and `stage_avgs` output before any refactor.
- `public/js/phase-cards.js` formats and renders the cards with the existing `.stat-row` / `.stat-box` classes.

**Tech Stack:** Vercel serverless (ES modules), static HTML with vanilla JS, Node 24 `node:test` (with `mock.timers` for Date).

**Spec:** `docs/superpowers/specs/2026-10-25-data-phase-cards-design.md`

## Global Constraints

- **No change** to the existing `intervals`, `stage_avgs`, `trends` or `key_stats` fields of `/api/data`.
- **Phases, labels, groups, row sets and caps:** exactly spec §3.
- **Window steps:** 180, 270, 365, 545, 730 days, then all reports (`window_days: null`). Floor: 30 completed cases.
- **Suppression:** `suppressed` when n < 10; `small_sample` when n < 30.
- **Card text** is spec §5 verbatim:
  - suppressed value: "Not enough reports yet"
  - range: "most: {p25}–{p75} days"
  - months shown from 60 days, as "≈ {days/30.44 to 1 dp} months"
  - "{n} members"
  - window labels: last 6 months / last 9 months / last 12 months / last 18 months / last 2 years / all reports
  - "small sample"
- **Badge, live:** "Updated continuously from {N} London Embassy applicant submissions." Snapshot: "From {N} London Embassy applicant submissions (snapshot)." N is `meta.total_members` with en-GB separators.
- **IL Drop History stays a table**, untouched (spec standing rule).
- **Asset versions:** `/js/phase-cards.js?v=20261025d`; `/css/guide-article.css?v=20261025c` added to `/data`.
- **No new npm dependency.** No em dashes in site copy.

## Review Focus

1. **A member who submitted more than once** must count once in every phase. Pinned in Task 3 (`buildPhases counts a resubmitting member once`).
2. **Expedited interviews:** excluded from the `standard` phases (`il_to_medical`, `medical_to_interview`), included in `deduped` ones. Pinned in Task 3 (`buildPhases excludes expedited from standard phases`).
3. **Dates entered in the wrong order** (the "to" date before the "from" date) must be dropped, not counted as negative or zero waits. Pinned in Task 3 (the cap and order test).
4. **Medians at the 60-day boundary:** months shown at 60, not at 59. Pinned in Task 4 (`cardView months boundary`).
5. **Long source lines on narrow phones** (wide range, months, n, "last 2 years", "small sample") must wrap inside the card without overflow. Pinned in Task 6 (a 320px check with a seeded long phase).

---

### Task 1: Characterization test for /api/data

**Files:**
- Create: `test/fixtures/api-data-rows.json`, `test/fixtures/api-data-golden.json`
- Create: `test/api-data.test.js`

**Interfaces:**
- Produces: `runHandler(rows, nowISO) -> Promise<object>`, a test helper in `test/api-data.test.js`. It sets `NEXT_PUBLIC_SUPABASE_URL`/`_ANON_KEY` to dummy values, stubs `globalThis.fetch` to resolve `{ ok: true, json: async () => rows }`, freezes Date with `mock.timers.enable({ apis: ['Date'], now: new Date(nowISO) })`, calls the default export of `api/data.js` with `{ method: 'GET' }` and a fake `res`, and returns the JSON body.

- [ ] **Step 1: Build the fixture.** Create `api-data-rows.json` with about 60 synthetic London rows. It must exercise every field pair in spec §3, include:
  - one member submitted twice
  - two expedited interviews
  - one row whose "to" date is before its "from" date
  - one value above each cap

  It must also make `dq_to_il` need a window wider than 180 days. Use `username_raw` values `fixture-01` and up; use no real member names.
- [ ] **Step 2: Capture the golden output.** On the current, unmodified `api/data.js`, run `runHandler(rows, '2026-10-25T12:00:00Z')` once and save `{ intervals, stage_avgs, meta: { total_members, total_submissions } }` to `api-data-golden.json`.
- [ ] **Step 3: Write the test** `api/data output is unchanged for the fixture`. It deep-equals the same three fields against the golden file. Run `npm test`. Expected: all pass, the new test included.
- [ ] **Step 4: Commit** with message `Test: pin /api/data intervals and stage timings on a fixture`.

---

### Task 2: Move robustStats and rollingWindow into api/_lib/phases.js

**Files:**
- Create: `api/_lib/phases.js`
- Modify: `api/data.js` (remove the two functions; import them)
- Create: `test/phases.test.js`

**Interfaces:**
- Produces:
  - `robustStats(values: number[]) -> { n, median, p25, p75, p90, min, max, suppressed, small_sample }`
  - `rollingWindow(rows, cohortField, valueFn, filterFn, now: Date) -> robustStats & { window_days: number|null }`

  The bodies are unchanged except that `rollingWindow` takes `now` instead of calling `new Date()`.

- [ ] **Step 1: Write the failing tests** in `test/phases.test.js`, loading the module with `const P = await import('../api/_lib/phases.js')`:

```js
test('robustStats on 1..10', async () => {
  const s = P.robustStats([1,2,3,4,5,6,7,8,9,10]);
  assert.deepEqual([s.n, s.median, s.p25, s.p75], [10, 6, 3, 8]);
  assert.equal(s.suppressed, false); assert.equal(s.small_sample, true);
});
test('robustStats suppresses below 10', async () => assert.equal(P.robustStats([1,2,3,4,5,6,7,8,9]).suppressed, true));
test('rollingWindow widens to 365', async () => {
  // 12 completed cases cohorted in the last 180 days, 35 in the last 365
  assert.equal(P.rollingWindow(rows365, 'a', r => r.v, r => r.a, NOW).window_days, 365);
});
test('rollingWindow 180 when 40 recent', ...);           // window_days 180
test('rollingWindow all reports below floor', ...);     // window_days null
```

  Build `rows365` and the other row arrays inline with ISO `a` dates relative to `NOW = new Date('2026-10-25T12:00:00Z')`.
- [ ] **Step 2: Run `npm test`.** Expected: FAIL, cannot find module `api/_lib/phases.js`.
- [ ] **Step 3: Create the module.** Move the two functions verbatim into `api/_lib/phases.js` as named exports, with `rollingWindow` taking `now`. In `api/data.js`, import them, delete the local copies, and pass `new Date()` at each call site.
- [ ] **Step 4: Run `npm test`.** Expected: all pass, including Task 1's golden test (the refactor changed no output).
- [ ] **Step 5: Commit** with message `api: move robustStats and rollingWindow into api/_lib/phases.js`.

---

### Task 3: buildPhases and the response fields

**Files:**
- Modify: `api/_lib/phases.js`, `api/data.js`, `test/phases.test.js`, `test/api-data.test.js`

**Interfaces:**
- Produces:
  - `PHASES`: spec §3's 9 entries `{ key, group, label, from, to, rows, cap }`, in display order. The three headline phases have `from` set to `null` and `source: 'intervals'`.
  - `GROUPS: [{key:'nvc',label:'NVC'},{key:'waiting',label:'Waiting for your interview'},{key:'interview',label:'Interview stage'},{key:'after',label:'After the interview'}]`
  - `buildPhases({ deduped, standard, intervals }, { now, daysBetween }) -> Array<{ key, group, label, median, p25, p75, n, window_days, suppressed, small_sample }>`
  - `/api/data` gains `phases` and `phase_groups`.

- [ ] **Step 1: Write the failing tests.** In `phases.test.js`, construct `deduped`, `standard` and an `intervals` object directly:

```js
test('buildPhases order and groups', ...);   // keys in spec §3 order; groups nvc,nvc,nvc,nvc,waiting,waiting,interview,interview,after
test('buildPhases headline phases equal intervals', ...);  // for dq_to_il, il_to_interview, interview_to_passport: each of median,p25,p75,n,window_days,suppressed,small_sample equals intervals[key]
test('buildPhases drops capped and non-positive values', ...); // a 95-day welcome_to_fees value and a negative fees_to_docs value are not counted (n excludes them)
test('buildPhases counts a resubmitting member once', ...);    // deduped already holds one row per member: n equals deduped rows with both dates
test('buildPhases excludes expedited from standard phases', ...); // an expedited row present in deduped but not standard is not counted in medical_to_interview
```

  In `api-data.test.js`, add `api/data exposes phases and phase_groups`: `body.phases.length === 9`, `body.phase_groups.length === 4`, and every phase has numeric `n`.
- [ ] **Step 2: Run `npm test`.** Expected: FAIL, `buildPhases is not a function`.
- [ ] **Step 3: Implement `PHASES`, `GROUPS` and `buildPhases`.** For the phases computed here, call `rollingWindow(rowsFor(phase.rows), phase.from, r => daysBetween(r[from], r[to]), r => r[from] && r[to] && withinCap(days), now)`, where a value counts only if `0 < days <= cap` (or `cap === null`). The three `source: 'intervals'` phases copy their statistics from `intervals[key]`. In `api/data.js`, add `phases: buildPhases({ deduped, standard, intervals }, { now: new Date(), daysBetween })` and `phase_groups: GROUPS` to the response object.
- [ ] **Step 4: Run `npm test`.** Expected: all pass, and the golden test is still unchanged.
- [ ] **Step 5: Commit** with message `api: phases list with robust statistics for every step`.

---

### Task 4: phase-cards.js formatting and rendering

**Files:**
- Create: `public/js/phase-cards.js`
- Create: `test/phase-cards.test.js`

**Interfaces:**
- Produces (as `window.AVGPhaseCards` in the browser and `module.exports` under Node):
  - `formatDays(days) -> string`
  - `formatMonths(days) -> string`
  - `windowLabel(windowDays) -> string`
  - `cardView(phase) -> { value: string, source: string }`
  - `render(container, phases, groups) -> void` (browser only)

- [ ] **Step 1: Write the failing tests:**

```js
test('formatDays', () => { assert.equal(C.formatDays(1), '1 day'); assert.equal(C.formatDays(86), '86 days'); });
test('formatMonths', () => assert.equal(C.formatMonths(86), '≈ 2.8 months'));
test('windowLabel', () => assert.deepEqual([180,270,365,545,730,null].map(C.windowLabel),
  ['last 6 months','last 9 months','last 12 months','last 18 months','last 2 years','all reports']));
test('cardView normal', () => assert.deepEqual(C.cardView({ median:86, p25:70, p75:95, n:46, window_days:180, suppressed:false, small_sample:false }),
  { value: '86 days', source: 'most: 70–95 days · ≈ 2.8 months · 46 members · last 6 months' }));
test('cardView suppressed', () => assert.deepEqual(C.cardView({ median:20, p25:10, p75:30, n:7, window_days:null, suppressed:true, small_sample:true }),
  { value: 'Not enough reports yet', source: '7 members · all reports' }));
test('cardView small sample', () => assert.match(C.cardView({ median:12, p25:9, p75:14, n:22, window_days:365, suppressed:false, small_sample:true }).source, / · small sample$/));
test('cardView months boundary', () => {
  assert.match(C.cardView({ median:60, p25:50, p75:70, n:40, window_days:180, suppressed:false, small_sample:false }).source, /≈ 2\.0 months/);
  assert.doesNotMatch(C.cardView({ median:59, p25:50, p75:70, n:40, window_days:180, suppressed:false, small_sample:false }).source, /months/);
});
```

- [ ] **Step 2: Run `npm test`.** Expected: FAIL, cannot find module.
- [ ] **Step 3: Implement.** The file uses the IIFE export pattern of `public/js/stepper-core.js`. `render`:
  - empties the container
  - for each group that has phases: appends `<h3 class="phase-group">{label}</h3>`, then a `.stat-row` of `.stat-box[data-phase=key]` elements, each with `.stat-box__value`, `.stat-box__label` and `.stat-box__source` text nodes (DOM methods only)
  - if `phases` is missing or empty: appends `<p class="phase-cards-empty">Phase timings are temporarily unavailable.</p>`
- [ ] **Step 4: Run `npm test`.** Expected: all pass.
- [ ] **Step 5: Commit** with message `phase-cards.js: card wording and renderer`.

---

### Task 5: /data page changes

**Files:**
- Modify: `public/data.html`

- [ ] **Step 1: Load the new assets.** In `<head>`, insert `<link rel="stylesheet" href="/css/guide-article.css?v=20261025c">` directly before the `readability.css` link, and `<script src="/js/phase-cards.js?v=20261025d" defer></script>` with the other deferred scripts.
- [ ] **Step 2: Add the section.** Insert it immediately before the "Pipeline Status" section, following the markup pattern of the neighbouring sections (`section-hd`, `section-hd__title`, `section-hd__sub`):
  - title `Wait times by phase` with `id="phases-hd"`
  - sub-line "Median days for each step, with the range most members fall within."
  - a container `<div id="phase-cards"></div>`

  Add a page CSS rule: `.phase-group { margin: 1.25rem 0 0.5rem; font-size: 1rem; }`.
- [ ] **Step 3: Remove the old table.** Delete the "Median Stage-by-Stage Timings" section (the `timing-hd` heading through its table), the `renderTimings` function and its call in `boot()`.
- [ ] **Step 4: Wire up boot and the badge.**
  - In `boot()`, after the existing renders: `window.AVGPhaseCards && AVGPhaseCards.render(document.getElementById('phase-cards'), d.phases, d.phase_groups)`.
  - Change `renderMetrics(drops, stats)` to `renderMetrics(drops, stats, usedFallback)`. Set `#m-members-note` to the live or snapshot badge text from Global Constraints, and add the class `freshness-badge`.
  - Add a page CSS rule: `.freshness-badge { display:inline-block; padding:2px 10px; border:1px solid var(--color-border); border-radius:999px; font-size:14px; color:var(--color-text-muted); }`.
- [ ] **Step 5: Verify statically.**
  - `grep -n "timing-tbody\|renderTimings\|Stage-by-Stage" public/data.html` returns no output.
  - `grep -c "IL Drop History" public/data.html` is unchanged from `main`.
  - `npm test` passes.
- [ ] **Step 6: Commit** with message `/data: wait times by phase cards and freshness badge`.

---

### Task 6: Browser verification

**Files:** none, unless a check fails. Fix it in the owning task's file and commit it as `fix: <what>`.

- [ ] **Step 1: Seed the API response.** On the worktree preview, stub `window.fetch` for `/api/data` before boot, by injecting a script that overrides `fetch` and reloading. Return Task 1's handler output for the fixture. Include one phase edited to `{ median: 240, p25: 120, p75: 365, n: 12, window_days: 730, small_sample: true }` for Review Focus 5.
  - Expected: four group headings in spec order and 9 cards.
  - Expected: the DQ → interview letter card's numbers equal the headline interval shown further down.
  - Expected: the badge reads "Updated continuously from {total_members} London Embassy applicant submissions."
- [ ] **Step 2: Fallback.** With the stub returning HTTP 503:
  - Expected: the `FB` path runs, the badge reads "… (snapshot)."
  - Expected: the cards area shows "Phase timings are temporarily unavailable." (`FB` has no `phases` until Task 7).
- [ ] **Step 3: Phone widths.** At 375px and 320px:
  - no page overflow
  - zero clipped elements inside `.stat-box`
  - the long seeded phase wraps inside its card
- [ ] **Step 4: Unrelated sections untouched.** The IL Drop History table renders with all 7 columns, and the stage-by-stage table is gone.

---

### Task 7: After deploy (needs your OK to merge)

- [ ] **Step 1: Check production.** Production `/data` shows live cards. The badge count equals `meta.total_members` from production `/api/data`.
- [ ] **Step 2: Fill the snapshot.** In a follow-up commit, copy production's `phases` and `phase_groups` into `FB` in `public/data.html`, so the fallback path shows real cards. Re-run Task 6 Step 2, now expecting snapshot cards. Open it as a small PR.
