# Naturalization Section, Phase 1 (Structure) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/naturalization` into a step-by-step hub, and move its existing tools (calculator, preparation list, civics flashcards, English test and exemptions) onto their own pages in the new structure.

**Architecture:** Static HTML pages under `public/naturalization/`, built from the `/guide` stage-page template (`stage.css` + `guide-article.css`, sidebar + mobile drawer, `.stage-prevnext`). `js/naturalization.js` is split into one script per tool. A hub-only script redirects old `#fragment` links. A Node test guards sidebar consistency, the Previous/Next chain, legacy anchors, inbound links and the sitemap.

**Tech Stack:** Plain HTML/CSS/JS, served by Vercel with `cleanUrls: true`; tests use `node --test` (`npm test`).

**Spec:** `docs/superpowers/specs/2026-11-11-naturalization-section-design.md` (phase 1 of §9). Phases 2 and 3 are content writing and get their own plans.

## Global Constraints

- Site copy names the owner as "Erin" only, never a full name.
- `/naturalization` stays the hub URL. Children live at `/naturalization/<slug>` (files `public/naturalization/<slug>.html`). The checklist is `/checklist-n400` (`public/checklist-n400.html`).
- localStorage keys are unchanged: `avg-natz-prep` and `avg-civics-known`.
- `js/naturalization-test.js` (civics question data, global `window.AVG_NATZ_TEST`) keeps its name and contents.
- `/css` and `/js` are served immutable: every page that loads a new or changed CSS/JS file uses a `?v=` query, and all pages in the section share one version of each file. New files start at `?v=20261111`.
- Sidebar (desktop `aside.sidebar` and mobile drawer) is identical on every section page apart from `aria-current="page"`.
- The 8 steps always appear in the sidebar. Unbuilt steps are `<span class="sidebar-pending">N: Title</span>`; unbuilt "If…" pages are omitted.
- Step titles (sidebar wording): `1: Check if you can apply`, `2: Good moral character`, `3: Fill in and file Form N-400`, `4: Biometrics`, `5: English and civics test`, `6: Interview`, `7: Oath ceremony`, `8: After you become a citizen`.
- Built in phase 1: hub, `eligibility` (step 1), `when-can-i-apply` (tool), `test` (step 5), `checklist-n400` (tool).
- New `id`s, once published, never change (Discord links depend on them).
- Work on branch `naturalization-step-by-step`. Pushing `main` deploys production, so nothing is merged without Erin's approval.

## Review Focus

1. **Saved progress survives the move.** Someone with ticks and "known" cards from the old page opens `/checklist-n400` or `/naturalization/test` and sees them. Pinned by: Task 1 test `keeps storage keys`, plus the Task 8 manual check.
2. **Old deep links land in the right place.** `/naturalization#calc`, `#prepare`, `#civics`, `#english`, `#resources` (from Discord, `checklists.html`, `english-test.html`) go to the new page and section. Pinned by: Task 6 test `legacy anchors resolve`.
3. **Tool scripts do not crash on pages without their markup.** Each split script returns early when its root element is missing, so a page that loads the wrong script, or a cached copy of the old hub, does not throw. Pinned by: Task 1 test `scripts guard their root element`.
4. **Section pages highlight "Naturalization" in the top nav**, including `naturalization/interview` and `naturalization/test`, whose file names match other nav keys (`interview`). Pinned by: Task 7 test `nav maps the section`.
5. **Links inside tools point at the new pages.** The checklist's "Use the calculator above" and the `#civics` links inside the calculator and checklist output now point to other pages. Pinned by: Task 1 test `no same-page links to moved sections`.

---

## File map

| File | Responsibility |
|---|---|
| `public/js/n400-calculator.js` | Filing-date calculator (from `naturalization.js` §1, with the date helpers) |
| `public/js/n400-checklist.js` | Preparation list (from §2), key `avg-natz-prep` |
| `public/js/civics-flashcards.js` | Flashcards (from §3), key `avg-civics-known` |
| `public/css/naturalization.css` | Tool styles moved from `naturalization.html`'s `<style>`, scoped under `.natz-tool` |
| `public/js/naturalization-anchors.js` | Legacy `#fragment` → new URL map, loaded only by the hub |
| `public/naturalization.html` | Hub (rewritten) |
| `public/naturalization/eligibility.html` | Step 1 |
| `public/naturalization/when-can-i-apply.html` | Calculator page |
| `public/naturalization/test.html` | Step 5 |
| `public/checklist-n400.html` | Preparation list page |
| `public/css/stage.css` | Add `.sidebar-nav .sidebar-pending` |
| `public/js/nav.js` | Active state for the section |
| `public/sitemap.xml`, `public/checklists.html`, `public/english-test.html` | New URLs and updated links |
| `test/naturalization-pages.test.js` | Guard for the section |
| `public/js/naturalization.js` | Deleted at the end of Task 6 |

---

### Task 0: Branch

- [ ] **Step 1:** `git switch -c naturalization-step-by-step`. Expected: `Switched to a new branch`.

---

### Task 1: Split the tool scripts and styles

**Files:**
- Create: `public/js/n400-calculator.js`, `public/js/n400-checklist.js`, `public/js/civics-flashcards.js`, `public/css/naturalization.css`
- Modify: `public/naturalization.html` (load the 3 scripts and the CSS in place of `naturalization.js` and the tool `<style>` rules; wrap each tool in `.natz-tool`)
- Test: `test/naturalization-pages.test.js` (create)

**Interfaces:**
- Produces: three self-contained IIFEs. Each one returns immediately if its root is missing: `#calc`, `#prep` and `#fc-card` (and `window.AVG_NATZ_TEST`) respectively. `css/naturalization.css` styles anything inside `.natz-tool`.
- Produces: the test file's helpers `read(rel)` (reads from `public/`) and the constant `PUBLIC`, used by later tasks.

- [ ] **Step 1: Write the failing tests** in `test/naturalization-pages.test.js`. Use the same header style and `PUBLIC` env override as `test/stage-pages.test.js`.

```js
const SCRIPTS = { 'js/n400-calculator.js': "getElementById('calc')",
  'js/n400-checklist.js': "getElementById('prep')", 'js/civics-flashcards.js': "getElementById('fc-card')" };

test('scripts guard their root element', () => {
  for (const [file, root] of Object.entries(SCRIPTS)) {
    const src = read(file);
    assert.ok(src.includes(root), `${file}: looks up ${root}`);
    assert.match(src, /if \(!\w+\) return;/, `${file}: early return`);
  }
});
test('keeps storage keys', () => {
  assert.ok(read('js/n400-checklist.js').includes("'avg-natz-prep'"));
  assert.ok(read('js/civics-flashcards.js').includes("'avg-civics-known'"));
});
test('no same-page links to moved sections', () => {
  for (const file of Object.keys(SCRIPTS))
    assert.doesNotMatch(read(file), /href="#(civics|prepare|timeline|calc|flashcards)"|calculator above/, file);
});
```

- [ ] **Step 2: Run** `npm test -- --test-name-pattern="scripts guard|storage keys|same-page"` (or `node --test test/naturalization-pages.test.js`). Expected: FAIL (`ENOENT` for `js/n400-calculator.js`).

- [ ] **Step 3: Split `public/js/naturalization.js`** at its three `/* ===== N. ===== */` banners.
  - The calculator file keeps `DAY`, `FEES`, the date helpers, `money`, `esc`, `link` and `el`.
  - The checklist and flashcard files copy only the helpers they call (`esc`, `link`, `el`). Duplicating these few lines is deliberate, so no shared global is needed.
  - Each file keeps its part of the header comment.
  - Calculator line 236: `href="#civics"` → `href="/naturalization/test#flashcards"`.
  - Checklist `b1`: "Use the calculator above" → "Use the <a href="/naturalization/when-can-i-apply">filing date calculator</a>".
  - Checklist `a4`: `href="#civics"` → `href="/naturalization/test#flashcards"`.

- [ ] **Step 4: Move the tool CSS.**
  - Move every rule under the `/* Preparation checklist */`, `/* Calculator */`, `/* Flashcards */` and `/* Resources */` comments from `naturalization.html`'s `<style>` into `public/css/naturalization.css`, each selector prefixed with `.natz-tool `.
  - Also move the `.info-card`, `.grid-2`, `table`/`th`/`td` and `.table-scroll` rules the calculator result uses, prefixed the same way.
  - Open the file with a `.natz-tool { … }` block holding the old `:root` variables (`--navy` … `--border-subtle`) and `color: var(--white); font-family: var(--font-body);`.
  - Keep the `@media print` and `prefers-reduced-motion` rules, prefixed.

- [ ] **Step 5: Update `naturalization.html`.**
  - Wrap `#calc`'s section, `#prepare`'s section and `#civics`'s section each in `<div class="natz-tool">`.
  - Replace `<script src="js/naturalization.js…">` with the three new scripts (`?v=20261111`, after `naturalization-test.js`).
  - Add `<link rel="stylesheet" href="/css/naturalization.css?v=20261111">`.
  - Delete the moved rules from its `<style>`. The page still works as one page at this point.

- [ ] **Step 6: Run** `npm test`. Expected: all tests pass, including the 3 new ones.

- [ ] **Step 7: Browser check.** `preview_start` the site, then open `/naturalization`:
  - The calculator gives a result for IR1 with a green card date of 2023-01-15.
  - A checklist tick survives a reload.
  - Flashcards flip, and "Known" survives a reload.
  - The console shows no errors.

- [ ] **Step 8: Commit** `git add -A public/js public/css public/naturalization.html test/naturalization-pages.test.js && git commit -m "Naturalization: split tool scripts and styles"`.

---

### Task 2: Section shell (sidebar, pending style, page list in the test)

**Files:**
- Modify: `public/css/stage.css` (append `.sidebar-nav .sidebar-pending`: same padding as `.sidebar-nav a`, `color: var(--muted)`, no hover, `cursor: default`; bump `stage.css?v=` only on the new section pages)
- The sidebar is copied by hand into each page (desktop and drawer), as on `/guide`; there is no include mechanism.
- Test: `test/naturalization-pages.test.js`

**Interfaces:**
- Produces: the canonical sidebar markup below, and two test constants: `SECTION_PAGES` (every section page) and `STEP_CHAIN` (pager order).

```html
<div class="sidebar-label">Naturalization steps</div>
<ul class="sidebar-nav" role="list" aria-label="Naturalization steps">
  <li><a href="/naturalization/eligibility">1: Check if you can apply</a></li>
  <li><span class="sidebar-pending">2: Good moral character</span></li>
  <li><span class="sidebar-pending">3: Fill in and file Form N-400</span></li>
  <li><span class="sidebar-pending">4: Biometrics</span></li>
  <li><a href="/naturalization/test">5: English and civics test</a></li>
  <li><span class="sidebar-pending">6: Interview</span></li>
  <li><span class="sidebar-pending">7: Oath ceremony</span></li>
  <li><span class="sidebar-pending">8: After you become a citizen</span></li>
  <li role="presentation"><div class="sidebar-divider"></div></li>
  <li><a href="/naturalization">Naturalization overview</a></li>
  <li><a href="/naturalization/when-can-i-apply">When can I apply? (calculator)</a></li>
  <li><a href="/checklist-n400">N-400 preparation list</a></li>
  <li><a href="/naturalization/test#flashcards">Civics flashcards</a></li>
</ul>
```

- [ ] **Step 1: Write the failing tests.**

```js
const SECTION_PAGES = ['naturalization.html', 'naturalization/eligibility.html',
  'naturalization/when-can-i-apply.html', 'naturalization/test.html', 'checklist-n400.html'];
const STEP_CHAIN = ['/naturalization', '/naturalization/eligibility', '/naturalization/test'];
const sidebars = html => [...html.matchAll(/<ul class="sidebar-nav"[\s\S]*?<\/ul>/g)]
  .map(m => m[0].replace(/ aria-current="page"/g, '').replace(/\s+/g, ' '));

test('every section page has the hub sidebar, desktop and drawer', () => {
  const canon = sidebars(read('naturalization.html'))[0];
  for (const p of SECTION_PAGES) {
    const s = sidebars(read(p));
    assert.equal(s.length, 2, `${p}: sidebar + drawer`);
    s.forEach(x => assert.equal(x, canon, p));
  }
});
const URL_OF = p => '/' + p.replace(/\.html$/, '');   // 'naturalization/test.html' → '/naturalization/test'
test('aria-current marks the page itself', () => {
  for (const p of SECTION_PAGES) {
    const html = read(p);
    const current = [...html.matchAll(/<a href="([^"]+)" aria-current="page"/g)].map(m => m[1]);
    assert.deepEqual(current, [URL_OF(p), URL_OF(p)], `${p}: once in sidebar, once in drawer`);
  }
});
```

- [ ] **Step 2: Run** `node --test test/naturalization-pages.test.js`. Expected: FAIL (`ENOENT` on `naturalization/eligibility.html`). These tests stay red until Task 6. Mark them `{ todo: 'until Task 6' }` so the other suites keep running, and remove the `todo` in Task 6.

- [ ] **Step 3: Add the `.sidebar-pending` rule** to `public/css/stage.css`.

- [ ] **Step 4: Commit** `git commit -am "Naturalization: section sidebar style and guard"`.

---

### Task 3: Calculator page and checklist page

**Files:**
- Create: `public/naturalization/when-can-i-apply.html`, `public/checklist-n400.html`
- Test: `test/naturalization-pages.test.js`

**Interfaces:**
- Consumes: Task 1 scripts and CSS, and the Task 2 sidebar.
- Page shell: copy `public/guide/i130.html`.
  - Keep: head (stage.css, nav.css/js, guide-article.css, readability.css, consent.js), mobile drawer, `aside.sidebar`, `main.main.guide-article`, footer placeholder, `stage.js`, `glossary.js`.
  - Drop: `live-notice.js`, the role pills and the I-130 content.
  - Canonical, og:url and breadcrumb match the page URL (`Home › Naturalization › <page>`).

- [ ] **Step 1: Write the failing tests.**
  - `when-can-i-apply` has `id="calc"`, `id="c-result"`, `.natz-tool`, and loads `n400-calculator.js`, not the other two.
  - `checklist-n400` has `id="prep"` and `id="prep-reset"`, and loads `n400-checklist.js` only.
  - Neither page has `nav.stage-prevnext` (tools carry no pager).

- [ ] **Step 2: Run.** Expected: FAIL, the files don't exist.

- [ ] **Step 3: Build `when-can-i-apply.html`.**
  - H1 "When can you apply?"
  - `article-summary`:
    - "You are here: you have a green card through a family visa and want your earliest N-400 filing date."
    - "What happens: answer the questions; the result shows your date, the forms, fees and documents."
    - "Do this first: have your green card's 'Resident since' date to hand."
  - The `#timeline` section's calculator markup goes in verbatim (ids unchanged), wrapped in `.natz-tool`.
  - Below it: "Next: check the rest of the eligibility rules", linking to `/naturalization/eligibility`.

- [ ] **Step 4: Build `checklist-n400.html`.**
  - H1 "N-400 preparation list". Summary: ticks are saved in this browser only.
  - The `#prepare` section markup goes in verbatim, wrapped in `.natz-tool`.
  - Keep the link to `/downloads/naturalization-checklist.pdf`.

- [ ] **Step 5: Run** `npm test`. Expected: the new tests pass (Task 2 todos still pending).

- [ ] **Step 6: Commit** `git add public/naturalization public/checklist-n400.html test && git commit -m "Naturalization: calculator and checklist pages"`.

---

### Task 4: Step 5 test page

**Files:**
- Create: `public/naturalization/test.html`
- Test: `test/naturalization-pages.test.js`

- [ ] **Step 1: Write the failing tests.**
  - The page has ids `civics`, `flashcards`, `fc-card`, `english`, `exemptions`, `study-help`.
  - It loads `naturalization-test.js` before `civics-flashcards.js`, and no other tool script.
  - It has `nav.stage-prevnext` with `rel="prev"` → `/naturalization/eligibility` and no `rel="next"` (last built step in `STEP_CHAIN`).

- [ ] **Step 2: Run.** Expected: FAIL.

- [ ] **Step 3: Build the page.**
  - H1 "Step 5: Prepare for the English and civics test".
  - `article-summary`: You are here / What happens (civics questions asked aloud; reading, writing, speaking) / Do this first (start the flashcards).
  - Action list: 4–6 items, no role pills.
  - "Documents for this stage": English practice (`/english-test`), the civics PDF and English PDF downloads.
  - Sections, moved verbatim from `naturalization.html` (wrap the flashcards in `.natz-tool`):
    - `#civics` (flashcards, ids unchanged)
    - `#english`
    - Test exemptions, now `<section id="exemptions">`
    - "Official study materials" + "Classes and tutoring", now `<section id="study-help">`
  - Sources: Policy Manual Vol. 12 Part E ch. 2 (`https://www.uscis.gov/policy-manual/volume-12-part-e-chapter-2`) and ch. 3.

- [ ] **Step 4: Run** `npm test`. Expected: PASS (todos pending).

- [ ] **Step 5: Commit** `git commit -m "Naturalization: step 5 test page"` (add the new file first).

---

### Task 5: Step 1 eligibility page

**Files:**
- Create: `public/naturalization/eligibility.html`
- Test: `test/naturalization-pages.test.js`

- [ ] **Step 1: Write the failing tests.**
  - Section ids `five-year`, `three-year`, `continuous-residence`, `physical-presence`, `state-residence`, `early-filing`, `sources`.
  - A link to `/naturalization/when-can-i-apply`.
  - `stage-prevnext`: prev → `/naturalization`, next → `/naturalization/test`.
  - No script tags for the tool scripts.

- [ ] **Step 2: Run.** Expected: FAIL.

- [ ] **Step 3: Write the page.**
  - H1 "Step 1: Check if you can apply".
  - Summary: "Do this first: use the calculator".
  - One section per id above, drafted from Policy Manual Vol. 12 Part D ch. 1–6. Take facts from the calculator's existing logic and comments where they overlap: 90-day early filing applies only to the residence period; the 3 years of marriage must be complete on the day you file.
  - Each section ends with a `.src` link to its chapter.
  - Mention trips of 6 months to 1 year, and of 1 year or more, in one paragraph only. A full page comes in phase 3.
  - Verify every number against the cited chapter before committing.
  - Flag the wording for Erin's review in the PR description.

- [ ] **Step 4: Run** `npm test`. Expected: PASS (todos pending).

- [ ] **Step 5: Commit** `git commit -m "Naturalization: step 1 eligibility page"` (add the file first).

---

### Task 6: Hub rewrite, legacy anchors, retire the old script

**Files:**
- Modify: `public/naturalization.html` (full rewrite to the section template)
- Create: `public/js/naturalization-anchors.js`
- Delete: `public/js/naturalization.js`
- Test: `test/naturalization-pages.test.js` (remove the Task 2 `todo`s)

**Interfaces:**
- `naturalization-anchors.js` follows `js/guide-anchors.js` exactly: an IIFE with `var MAP`, `go()` reading `location.hash` and calling `location.replace(target)`, run once and on `hashchange`. It is loaded in `<head>`, not deferred.

- [ ] **Step 1: Write the failing test** `legacy anchors resolve`. Run the script in `node:vm` with a fake `location` and `window`, once per hash, and assert the `replace` argument:

```js
const EXPECT = { timeline: '/naturalization/when-can-i-apply', calc: '/naturalization/when-can-i-apply',
  prepare: '/checklist-n400', prep: '/checklist-n400', civics: '/naturalization/test#flashcards',
  flashcards: '/naturalization/test#flashcards', english: '/naturalization/test#english',
  resources: '/naturalization#help' };
// for each [hash, url]: sandbox { location: { hash: '#'+hash, replace: u => got = u }, window: { addEventListener(){} } }
// assert.equal(got, url); and assert the target file exists in public/ (strip '#…', add '.html')
// also: '#help' and '#steps' produce no replace (they live on the hub)
```

  Also add `hub links every built page`: the hub's step list links `eligibility`, `when-can-i-apply`, `test`, `checklist-n400`, and steps 2, 3, 4, 6, 7, 8 appear as text without `href`.

- [ ] **Step 2: Run.** Expected: FAIL.

- [ ] **Step 3: Write `naturalization-anchors.js`** with the `EXPECT` map.

- [ ] **Step 4: Rewrite the hub** on the section template (sidebar with `aria-current` on "Naturalization overview", no pager). Sections:
  - H1 "Become a US citizen: step by step", plus a short intro and the reviewed date.
  - The existing community callout (`#community-h`), unchanged.
  - `<section id="steps">`: an `<ol>` of the 8 steps. Each has its title, a one-line description and its links. Unbuilt steps have no link and say "Guide coming soon".
  - A quick tools row: calculator, checklist, flashcards.
  - `<section id="help">`: "Get free and low-cost help", the legal-help and fee-help lists moved verbatim. Fee help stays here until step 3 (`/naturalization/apply#fees`) is built in phase 2.
  - `<section id="not-covered">`: military, employed abroad, revocation, citizenship at birth abroad.
  - Load `naturalization-anchors.js?v=20261111` in `<head>`.
  - Remove the tool scripts, `naturalization-test.js` and `css/naturalization.css` from the hub.

- [ ] **Step 5: Delete** `public/js/naturalization.js`. Grep for any remaining reference: `grep -rn "naturalization.js" public` should return nothing.

- [ ] **Step 6: Remove the `todo`s and run** `npm test`. Expected: all pass, including the sidebar and `aria-current` tests.

- [ ] **Step 7: Commit** `git add -A public test && git commit -m "Naturalization: step-by-step hub and legacy anchors"`.

---

### Task 7: Nav, sitemap, inbound links

**Files:**
- Modify: `public/js/nav.js:254-258`, `public/sitemap.xml`, `public/checklists.html:828,838,855`, `public/english-test.html:63`, and every page that loads `nav.js` (bump its `?v=`)
- Test: `test/naturalization-pages.test.js`

- [ ] **Step 1: Write the failing tests.**
  - `nav maps the section`: `nav.js` source contains `/^\/naturalization\//` mapped to `'naturalization'`, and `'checklist-n400': 'naturalization'`.
  - `sitemap lists the section`: `sitemap.xml` has a `<loc>` for each URL in `SECTION_PAGES`.
  - `no links to removed anchors`: no file under `public/` (html and js, excluding `naturalization-anchors.js`) matches `/naturalization(\.html)?#(timeline|calc|prepare|prep|civics|english|resources)/`.

- [ ] **Step 2: Run.** Expected: FAIL.

- [ ] **Step 3: Make the changes.**
  - In `nav.js`, put the section test next to the `/guide/` one: `/^\/naturalization\//` → `'naturalization'`. Also add `'checklist-n400': 'naturalization'` to `ACTIVE_MAP`.
  - Bump `nav.js?v=` on every page that loads it. Find them with `grep -rl "js/nav.js?v=" public`.
  - Sitemap: add the 4 new URLs, using the existing entry's format.
  - `checklists.html:838` → `/checklist-n400`; `:855` → `/naturalization/test#flashcards`; `:828` → `/naturalization`.
  - `english-test.html:63` → `/naturalization/test#exemptions`.

- [ ] **Step 4: Run** `npm test`. Expected: all pass.

- [ ] **Step 5: Commit** `git commit -am "Naturalization: nav, sitemap and inbound links"`.

---

### Task 8: Verify in the browser and open the PR

- [ ] **Step 1: Seed old state.** `preview_start`, then on the hub run in the console:
  `localStorage.setItem('avg-natz-prep','{"b1":true}'); localStorage.setItem('avg-civics-known','{"2025:1":true}')`
  Card ids are `TEST_ID + ':' + n`, with `TEST_ID = '2025'`.

- [ ] **Step 2: Check each page and link:**
  - `/checklist-n400` shows `b1` ticked.
  - `/naturalization/test` shows card 1 as known.
  - `/naturalization#calc` lands on the calculator page; `#civics` on `/naturalization/test#flashcards`.
  - The top nav highlights Naturalization on all 5 pages.
  - The console shows no errors on any page.

- [ ] **Step 3: Mobile.** `resize_window` to the mobile preset. The drawer opens and shows the same list, there is no horizontal scroll on any page, and the flashcard flips.

- [ ] **Step 4: Screenshot** the hub and the test page as proof, then reset the preview to desktop.

- [ ] **Step 5: Push and open the PR,** after Erin approves. The PR body lists the eligibility wording for review and the follow-up phases 2 and 3.
