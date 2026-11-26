# Data Section Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the single `/data` page into a short landing page with one live interview-letter status line, plus six topic pages in two groups, "From members" and "From official reports".

**Architecture:** Static HTML pages under `public/data/`, sharing the existing `js/section-nav.js` sidebar (new `data` section). The live member sections keep loading `/api/data`, through one shared script extracted from today's inline module in `data.html`. The status line's wording is a pure function in its own file so it can be unit-tested. Old `/data#id` links are forwarded by a fragment map like `js/public-charge-anchors.js`.

**Tech Stack:** Plain HTML, CSS and browser JavaScript; `node --test` for tests; Vercel static hosting with `cleanUrls`.

**Spec:** `docs/superpowers/specs/2026-11-26-data-section-split-design.md` (approved by Erin, 26 Nov 2026). Read it before starting. The approved look is `public/_design-preview/data-hub-middle.html`. The comparison page source is `docs/superpowers/specs/assets/2026-11-26-tracker-vs-uscis-artifact-v5.html`.

## Global Constraints

- All copy on the landing page and in the page lists is used exactly as written in the spec.
- Group tags: "FROM MEMBERS" (people icon) and "FROM OFFICIAL REPORTS" (building icon); words always shown.
- Colours: members `#0F5E66` on tint `#EAF2F3`; official `#7A4A12` on tint `#F5EEE6`. Never the role colours `#1A5FB4`, `#1E6B34`, `#6A3D9A`.
- Text contrast 4.5:1 or better; links underlined; list and status links at least 44px tall; visible focus ring; no sideways scroll at 320px; `lang="en-GB"` on every page in the section.
- No usernames or other personal details in any page or page source. Individual members' points (comparison chart dots) are month plus wait only. Batch-level DQ dates (drop history, backlog, latest DQ with a letter) stay exact.
- Member pages show no "updated" date; they say *Live from timelines members share. These figures load each time you open the page.*
- Bump `?v=` on every CSS or JS file you change, on every page that loads it.
- No changes to `api/data.js` or the homepage.
- Commit on the feature branch only. Do not push to `main` (a push to `main` deploys to production).

## Review Focus

1. `/api/data` is down or returns an error: every member page and the landing status line must show the frozen fallback values plus *"These are the last figures we could load."*, never blank tiles or "undefined". Test owned by Task 1 (status line) and checked in Task 3.
2. `/api/data` returns no drop window (`estimated_next_window` empty) or no drops: the status line must still produce a sentence. Test in Task 1.
3. An old link such as `/data#calculator` or `/data#od-iv-table` opened on the new landing page must land on the moved section, and the hub must not still hold that id. Test in Task 7.
4. A topic page URL that doesn't exist (typo, old slug) serves the homepage with status 200 on the live site: launch checks compare page titles, not status codes. Checked in Task 8.
5. The official chart script only starts when `#official-data` exists, which won't be true on the split pages: charts would silently not draw. Test in Task 5.

---

## File Structure

| File | Responsibility |
|---|---|
| `public/js/data-status.js` (create) | Pure `statusLine(drops, stats, today)`; exported for Node tests, attached to `window.AVGDataStatus` in the browser |
| `public/js/data-pages.js` (create) | Fetch `/api/data`, fall back to the frozen snapshot, run each render function whose element is on the page. Extracted from the inline `<script type="module">` in `data.html` |
| `public/js/data-calculator.js` (create) | The timeline calculator script, extracted from the inline `<script>` in `data.html` |
| `public/css/data-section.css` (create) | Group tags, topic-page header, landing status line and page lists (from the mockup), plus the inline `<style>` block now in `data.html` |
| `public/js/data-anchors.js` (create) | Forwards old `/data#id` links to the new pages |
| `public/data.html` (rewrite) | The landing page |
| `public/data/interview-letters.html`, `wait-times.html`, `interviews.html`, `i130-us.html`, `family-visas.html`, `tracker-vs-uscis.html` (create) | The six topic pages |
| `public/js/section-nav.js` (modify) | Add the `data` section |
| `public/js/official-data-charts.js` (modify) | Start on any page with an `.od-chart`; add the London chart |
| `public/sitemap.xml` (modify) | Six new URLs |
| `test/data-status.test.js`, `test/data-pages.test.js` (create); `test/section-nav.test.js` (modify) | Tests |

---

### Task 1: Status line wording

**Files:**
- Create: `public/js/data-status.js`
- Test: `test/data-status.test.js`

**Interfaces:**
- Produces: `statusLine(drops, stats, today) -> { lead: string, rest: string }`. `drops` is the array `fromApiData` builds in `data.html` (newest first; `drop_date`, `dq_date_to`). `stats` has `next_drop_window_start`, `next_drop_window_end` (ISO `YYYY-MM-DD` or null). `today` is a `Date` at UTC midnight. Dates in the output are written as `14 July 2026`.
- Exported as `module.exports = { statusLine }` under Node and `window.AVGDataStatus = { statusLine }` in the browser (same pattern as `section-nav.js` lines 261–265).

- [ ] **Step 1: Write the failing tests** in `test/data-status.test.js`, one per row of the spec's status table plus the edge cases:

```js
const { statusLine } = require('../public/js/data-status.js');
const d = (s) => new Date(s + 'T00:00:00Z');
const drops = [{ drop_date: '2026-07-14', dq_date_to: '2026-04-14' }];

test('delayed: window passed with no drop', () => {
  const r = statusLine(drops, { next_drop_window_start: '2026-10-01', next_drop_window_end: '2026-10-15' }, d('2026-11-26'));
  assert.equal(r.lead, 'No new interview letters yet.');
  assert.equal(r.rest, 'London last sent letters on 14 July 2026, 135 days ago.');
});
test('in range', /* today inside the window */ ...lead 'Letters could go out any day.');
test('approaching: window starts within 7 days', ...lead 'Letters may go out soon.', rest starts 'Members expect the next batch from ');
test('outside range', ...lead 'No letters expected yet.');
test('a drop in the last 7 days wins over any window state', () => {
  const r = statusLine([{ drop_date: '2026-11-24', dq_date_to: '2026-08-20' }, ...drops],
    { next_drop_window_start: '2026-11-20', next_drop_window_end: '2026-12-05' }, d('2026-11-26'));
  assert.equal(r.lead, 'New interview letters went out on 24 November 2026.');
  assert.equal(r.rest, 'They covered cases ready by 20 August 2026.');
});
test('no window estimated: still a sentence', ...stats {} → lead 'No letters expected yet.', rest 'London last sent letters on 14 July 2026, 135 days ago.');
test('no drops at all', ...drops [] → lead is a non-empty string and rest contains no "undefined" or "NaN");
test('1 day ago reads "1 day ago"', ...);
```

Fill in each elided test with the inputs and the exact strings from the spec's status table.

- [ ] **Step 2: Run to verify they fail**

Run: `node --test test/data-status.test.js`
Expected: FAIL, "Cannot find module '../public/js/data-status.js'"

- [ ] **Step 3: Implement `statusLine` in `public/js/data-status.js`**

State rules copied from `renderBanner` in `data.html` (lines ~1266–1315): delayed = today after window end and no drop on or after window start; in range = start ≤ today ≤ end; approaching = start is 1–7 days away; otherwise outside. A drop dated within the last 7 days (inclusive) overrides all of these. With no drops, use *"We don't have a date for London's last letters yet."* as `rest` and the window-based `lead`.

- [ ] **Step 4: Run to verify they pass**

Run: `node --test test/data-status.test.js`
Expected: PASS, all tests

- [ ] **Step 5: Commit**

```bash
git add public/js/data-status.js test/data-status.test.js
git commit -m "Add status line wording for the data landing page"
```

---

### Task 2: Data section sidebar and shared styles

**Files:**
- Modify: `public/js/section-nav.js` (add `data` to `SECTIONS`)
- Create: `public/css/data-section.css`
- Modify: `test/section-nav.test.js`

**Interfaces:**
- Produces: `SECTIONS.data` with label `Data`; CSS classes used by Tasks 3–7: `.dsx-tag`, `.dsx-tag--members`, `.dsx-tag--official`, `.dsx-source` (the "where the numbers come from" line), `.dsx-status`, `.dsx-pages`, `.dsx-pages--members`, `.dsx-pages--official`, `.dsx-desc`, `.dsx-when`, `.dsx-how`. These are the mockup's `.dm-*` rules renamed to `.dsx-*`.

- [ ] **Step 1: Add the failing test** to `test/section-nav.test.js`: extend the first test's section list from `['guide', 'naturalization', 'tools']` to include `'data'`, and add:

```js
test('the data section lists its pages in the agreed groups', () => {
  const s = SECTIONS.data;
  assert.equal(s.label, 'Data');
  assert.deepEqual(s.groups.map((g) => g.heading || null), [null, 'From members', 'From official reports', null]);
  assert.deepEqual(linksOf('data').slice(0, 7), ['/data', '/data/interview-letters', '/data/wait-times', '/data/interviews', '/data/i130-us', '/data/family-visas', '/data/tracker-vs-uscis']);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test test/section-nav.test.js`
Expected: FAIL, `SECTIONS.data` undefined

- [ ] **Step 3: Add `SECTIONS.data`** with link texts exactly as the spec's "Sidebar and navigation" section, the last group holding "Share your timeline" → `https://forms.fillout.com/t/dTRqnkx9uxus` (the nav's submit link). Create `public/css/data-section.css` from the mockup's `<style>` block (renamed classes) plus the inline `<style>` block in `data.html` lines ~22–391, moved verbatim.

- [ ] **Step 4: Run to verify it passes**

Run: `node --test test/section-nav.test.js`
Expected: the new test passes. The "every link points at a real page" test will fail until Task 7; mark it with `{ todo: 'data pages land in Task 7' }` only for `/data/*` hrefs, and remove the todo in Task 7.

- [ ] **Step 5: Commit**

```bash
git add public/js/section-nav.js public/css/data-section.css test/section-nav.test.js
git commit -m "Add the data section sidebar and shared styles"
```

---

### Task 3: Shared live-data script

**Files:**
- Create: `public/js/data-pages.js`, `public/js/data-calculator.js`
- Modify: `public/data.html` (load the two scripts instead of the inline ones; nothing else changes yet)
- Create: `test/data-pages.test.js`

**Interfaces:**
- Consumes: `window.AVGDataStatus.statusLine` (Task 1).
- Produces: `data-pages.js` runs on `DOMContentLoaded`; each existing render function (`renderBanner`, `renderMetrics`, `renderPipeline`, `renderDropTable`, `renderAwaiting`, `renderOutcomes`, `renderPassport`) returns early if its element id is absent. New `renderStatus(drops, stats)` fills `#data-status` (used by Task 7) from `statusLine`, and appends *"These are the last figures we could load."* when the fallback `FB` is in use. `renderSource()` fills every `.dsx-source[data-live]` with the member-page source line.

- [ ] **Step 1: Write the failing test** in `test/data-pages.test.js`:

```js
test('the data page loads the shared scripts and keeps no inline data script', () => {
  const html = read('data.html');
  assert.match(html, /\/js\/data-status\.js\?v=/);
  assert.match(html, /\/js\/data-pages\.js\?v=/);
  assert.doesNotMatch(html, /<script type="module">/);
  assert.doesNotMatch(html, /function fromApiData/);
});
test('the frozen fallback carries no usernames', () => {
  const js = read('js/data-pages.js');
  assert.doesNotMatch(js, /\b(user(name)?|reddit|discord)_?name\b/i);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test test/data-pages.test.js`
Expected: FAIL on the first test

- [ ] **Step 3: Move the scripts.** Move the inline module (data.html ~1125–1463) into `data-pages.js` as a classic script wrapped in an IIFE, with the early-return guards and `renderStatus`/`renderSource` added. Move the inline calculator script (~945–1110) into `data-calculator.js` unchanged. Load `data-status.js`, then `data-pages.js`, with `defer`.

- [ ] **Step 4: Verify**

Run: `node --test test/data-pages.test.js` → PASS.
Then start the preview (`.claude/launch.json` → `static-public`), open `/data`, and confirm with the browser console that there are no errors and the tiles show the fallback values (there is no `/api/data` locally, so this also exercises Review Focus 1).

- [ ] **Step 5: Commit**

```bash
git add public/js/data-pages.js public/js/data-calculator.js public/data.html test/data-pages.test.js
git commit -m "Move the data page scripts into shared files"
```

---

### Task 4: The three member pages

**Files:**
- Create: `public/data/interview-letters.html`, `public/data/wait-times.html`, `public/data/interviews.html`
- Modify: `test/data-pages.test.js`

**Interfaces:**
- Consumes: `data-section.css` classes (Task 2), `data-pages.js` (Task 3), `SECTIONS.data` (Task 2).
- Produces: pages that hold these ids (moved from `data.html`, unchanged), which Task 7's anchor map points at:
  - interview-letters: `il-banner`, `m-last-drop`, `m-last-drop-sub`, `m-days-since`, `m-days-since-sub`, `il-latest-dq`, `m-interview-range`, `m-interview-range-sub`, `m-members-note`, `drops-hd`, `drops-tbody`, `backlog-hd`, `bk-total`, `bk-total-sub`, `bk-oldest`, `backlog-tbody`, `bk-note`
  - wait-times: `pipeline-hd`, `p-uscis-badge`, `p-uscis-summary`, `p-nvc-badge`, `p-nvc-summary`, `p-london-badge`, `p-london-summary`, `phases-hd`, `tn-days-since`, `phase-cards`, `calculator`, `calc-hd`, `dq-date`, `interview-date`, `delivery-method`, `passport-result`, `passport-date`, `passport-range`, `passport-confidence`
  - interviews: `outcomes-hd`, `o-approved`, `o-denied`, `passport-hd`, `pp-pickup`, `pp-mail`

- [ ] **Step 1: Write the failing tests** (add to `test/data-pages.test.js`):

```js
const MEMBER = ['/data/interview-letters', '/data/wait-times', '/data/interviews'];
const OFFICIAL = ['/data/i130-us', '/data/family-visas', '/data/tracker-vs-uscis'];
for (const url of MEMBER) test(`${url} is a member page`, () => {
  const html = read(fileFor(url));
  assert.match(html, /<html lang="en-GB"/);
  assert.match(html, /data-section="data"/);
  assert.match(html, /class="avg-crumbs"[\s\S]*?href="\/data"/);
  assert.match(html, /class="dsx-tag dsx-tag--members"[^>]*>[\s\S]*?From members/);
  assert.match(html, /class="dsx-source" data-live/);
  assert.match(html, /class="stage-prevnext"/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `node --test test/data-pages.test.js`
Expected: FAIL, file not found

- [ ] **Step 3: Build the pages.** Each uses `data.html`'s `<head>` stylesheets plus `section-nav.css` and `data-section.css`, `<body class="has-snav">`, the section sidebar script with `data-section="data"`, then in `<main data-pagefind-body>`: breadcrumb (Home › Data › page), tag, H1 (= link text from the spec), `<p class="dsx-source" data-live></p>`, the moved sections verbatim, and `stage-prevnext` links in sidebar order. Add `data-calculator.js` to wait-times only. Leave the sections in `data.html` for now (Task 7 removes them).

- [ ] **Step 4: Verify**

Run: `node --test test/data-pages.test.js` → PASS for the member pages.
In the preview, open each page at desktop width and at 320px: the sidebar rail or fold-out shows, tiles fill with fallback values, no console errors, no sideways scroll.

- [ ] **Step 5: Commit**

```bash
git add public/data/interview-letters.html public/data/wait-times.html public/data/interviews.html test/data-pages.test.js
git commit -m "Add the three member data pages"
```

---

### Task 5: The two official pages and the London chart

**Files:**
- Create: `public/data/i130-us.html`, `public/data/family-visas.html`
- Modify: `public/js/official-data-charts.js`, `test/data-pages.test.js`

**Interfaces:**
- Produces: `i130-us.html` holds `official-hd`, `od-chart-approvals`, `od-chart-denials`, `od-ir-table`, `od-ir-cap`, `od-fp-table`, `od-fp-cap`. `family-visas.html` holds the new `od-london-table` / `od-london-cap` / `od-chart-london`, then `od-chart-visas`, `od-iv-table`, `od-iv-cap`. In `official-data-charts.js`: `init()` starts when any `.od-chart` exists; new `londonChart(host, data)` draws monthly columns from `readMonths('od-london-table')`, one series (`spouse_total`), styled like `visasChart`.

- [ ] **Step 1: Write the failing tests:**

```js
test('the official chart script starts on any page with a chart', () => {
  const js = read('js/official-data-charts.js');
  assert.doesNotMatch(js, /getElementById\('official-data'\)\) return/);
  assert.match(js, /querySelector\('\.od-chart'\)/);
});
test('the London table matches the collected State Department file', () => {
  const csv = fs.readFileSync(path.join(__dirname, '..', 'data/official-stats/london_issuances.csv'), 'utf8').trim().split('\n').slice(1);
  const html = read('data/family-visas.html');
  const rows = [...html.matchAll(/<tr><th[^>]*>([A-Z][a-z]{2} \d{4})<\/th><td[^>]*>([\d,]+)<\/td>/g)];
  assert.equal(rows.length, csv.length);
  assert.equal(Number(rows.at(-1)[2].replace(/,/g, '')), Number(csv.at(-1).split(',')[3]));   // Feb 2026 spouse_total
});
for (const url of ['/data/i130-us', '/data/family-visas']) test(`${url} is an official page`, /* same checks as member pages, with dsx-tag--official / "From official reports", and a dsx-source line without data-live */);
```

- [ ] **Step 2: Run to verify they fail**

Run: `node --test test/data-pages.test.js` → FAIL

- [ ] **Step 3: Build the pages and the chart.** Move the official section's intro note, USCIS part and State Department part from `data.html` verbatim. On `family-visas.html`, put a London part first: H2 "Spouse visas issued in London", a sentence giving the median (128 a month, October 2023 to February 2026), the chart, and a `<details>` table (`Month | IR1 | CR1 | Spouse visas`) generated from the CSV. Source lines: *From USCIS quarterly reports. The latest covers April to June 2026.* and *From State Department monthly reports. The latest covers February 2026.* Change `init()`'s guard and add `londonChart`.

- [ ] **Step 4: Verify**

Run: `node --test test/data-pages.test.js` → PASS.
In the preview, all four charts draw on their pages and their tooltips work by mouse and keyboard focus.

- [ ] **Step 5: Commit**

```bash
git add public/data/i130-us.html public/data/family-visas.html public/js/official-data-charts.js test/data-pages.test.js
git commit -m "Add the official data pages and a London visa chart"
```

---

### Task 6: The comparison page

**Files:**
- Create: `public/data/tracker-vs-uscis.html`
- Modify: `test/data-pages.test.js`

**Interfaces:**
- Consumes: `docs/superpowers/specs/assets/2026-11-26-tracker-vs-uscis-artifact-v5.html` (copy, then restyle).

- [ ] **Step 1: Write the failing tests:**

```js
test('comparison page shows members only by month and wait', () => {
  const html = read('data/tracker-vs-uscis.html');
  const pts = html.match(/const PTS = (\[\[[\s\S]*?\]\])/)[1];
  assert.doesNotMatch(pts, /\d{4}-\d{2}-\d{2}/);
  assert.equal(JSON.parse(pts).length, 184);
});
test('comparison page keeps the agreed heading and quarter table', () => {
  const html = read('data/tracker-vs-uscis.html');
  assert.match(html, /Our members wait <em>about as long as everyone else<\/em> for I-130 approval/);
  assert.match(html, /id="table-quarters"/);
});
```

Also run the official-page checks from Task 5 on this URL.

- [ ] **Step 2: Run to verify they fail** → FAIL, file not found

- [ ] **Step 3: Build the page.** Keep the artifact's body content and script. Replace its `:root` palette and fonts with the site's stylesheets: tracker blue → members `#0F5E66`, USCIS orange → official `#7A4A12`; re-check contrast on chart text. Add the site header, breadcrumb, tag, source line (*From USCIS quarterly reports and timelines members shared, as of 25 November 2026.*), sidebar and prev/next. Load d3 7.8.5 from cdnjs as the artifact does (the site has no d3 copy).

- [ ] **Step 4: Verify**

Run: `node --test test/data-pages.test.js` → PASS. In the preview, both charts draw, the "Medians only" toggle works by keyboard, and nothing scrolls sideways at 320px.

- [ ] **Step 5: Commit**

```bash
git add public/data/tracker-vs-uscis.html test/data-pages.test.js
git commit -m "Add the tracker vs USCIS comparison page"
```

---

### Task 7: The landing page and old links

**Files:**
- Rewrite: `public/data.html`
- Create: `public/js/data-anchors.js`
- Modify: `test/data-pages.test.js`, `test/section-nav.test.js` (remove Task 2's `todo`), any page linking `/data#official-data`

**Interfaces:**
- Consumes: everything above. `#data-status` is filled by `renderStatus` (Task 3).

- [ ] **Step 1: Write the failing tests**, adapting `test/public-charge-pages.test.js`'s four anchor tests to `data-anchors.js` (map parsed with `/'([a-z0-9-]+)': '(\/data\/[a-z0-9-]+)(#[a-z0-9-]+)?'/g`; at least 50 entries; every mapped id exists on its target page and not on `data.html`; no site link points at a moved `/data#id`; loaded in the head of `data.html` only). Plus:

```js
test('the landing page matches the approved copy', () => {
  const html = read('data.html');
  assert.match(html, /<h1[^>]*>London family visa data<\/h1>/);
  assert.match(html, /From members' own timelines, and from official reports by USCIS and the State Department\./);
  assert.match(html, /This section is updated as members share dates\./);
  assert.match(html, /id="data-status"[^>]*role="status"|role="status"[^>]*id="data-status"/);
  for (const url of [...MEMBER, ...OFFICIAL]) assert.match(html, new RegExp(`href="${url}"`));
});
test('every data page is in the sitemap', () => { /* /data plus the six */ });
```

- [ ] **Step 2: Run to verify they fail** → FAIL

- [ ] **Step 3: Build it.** Rewrite `data.html` from the mockup `public/_design-preview/data-hub-middle.html`: real sidebar script instead of the hand-drawn rail, real hrefs, `data-pagefind-body` on `<main>`, the `dsx-*` classes, the status line as `<p class="dsx-status" id="data-status" role="status">` with the frozen-fallback sentence as its initial content, loading `data-status.js` and `data-pages.js`. Keep `<title>`, canonical and meta description, updating the description to the new page. Write `data-anchors.js` modelled on `guide-anchors.js`, generated from the id lists in Tasks 4–5 (every id that moved, section ids to the bare page, others keeping their fragment; `official-data` → `/data/i130-us`, `contents` and `otp-hd` → `/data`, dropped). Add the six URLs to `sitemap.xml` with `lastmod` 2026-11-26. Change the in-site `/data#official-data` link to `/data/i130-us`.

- [ ] **Step 4: Verify**

Run: `npm test` → all tests PASS (including section-nav with the todo removed).
In the preview: `/data#calculator` lands on `/data/wait-times#calculator`; `/data#od-iv-table` lands on `/data/family-visas#od-iv-table`; the landing page has no console errors and its status line reads the fallback sentence plus *"These are the last figures we could load."*

- [ ] **Step 5: Commit**

```bash
git add public/data.html public/js/data-anchors.js public/sitemap.xml test/ public/
git commit -m "Turn /data into a landing page for the data section"
```

---

### Task 8: Accessibility pass, clean-up and launch checks

**Files:**
- Delete: `public/_design-preview/data-hub.html`, `public/_design-preview/data-hub-middle.html`
- Modify: whichever page fails a check below

- [ ] **Step 1: Accessibility check, every page in the section.** In the preview, run the contrast script from the design session (every text node's computed colour against its blended background, 4.5:1, 3:1 for large text) and record the lowest ratio per page. Tab through each page and confirm the order follows reading order with a visible ring. Check 320px width for sideways scroll. Expected: no failures. Fix any, bumping `?v=`.

- [ ] **Step 2: Remove the two mockups** and run `npm test` → PASS.

- [ ] **Step 3: Commit**

```bash
git add -A public/_design-preview public/
git commit -m "Accessibility fixes and remove data mockups"
```

- [ ] **Step 4: Hand over for review, then launch.** Open a pull request from the branch. After Erin merges and the deploy finishes, fetch each of the seven URLs with `?cb=<timestamp>` and confirm each `<title>` is its own page's, not the homepage's; open `/data#official-data` and `/data#calculator` and confirm where they land. Erin tests the section once with VoiceOver.
