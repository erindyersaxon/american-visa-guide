# Article Pages Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the 14 standalone article and tool pages onto the shared `guide-article.css` components, split the tool and form styles into `css/tools.css`, and delete `css/article.css`.

**Architecture:**
- **Phase 1 (Tasks 1–3)** rehomes styles. It is proven to change nothing by a computed-style hash snapshot taken in the browser before and after.
- **Phase 2 (Tasks 4–9)** applies the shared look, guarded by a permanent `node:test` guard, a text-equality check, a spacing-pairing check and in-container clipping checks.

**Tech Stack:** Static HTML, plain CSS, Node 24 `node:test`, Python 3 one-off scripts (scratchpad, not committed), and the browser pane for snapshots.

**Spec:** `docs/superpowers/specs/2026-10-25-article-pages-migration-design.md`

## Global Constraints

- **Pages (14):** `public/{221g-sheet,221g,administrative-processing,delayed-i130-remedies,domicile,history-worksheet,interview-dates,interview-day-sheet,interview-templates,interview,mandamus-pro-se,public-charge-statement,reinterview,visa-pause}.html`. Every one has `<main class="page-wrap" …>`.
- **Out of scope:** `public/i864-household-decision-tree.html`.
- **Tool pages** (they link `tools.css`): `221g-sheet`, `history-worksheet`, `interview-dates`, `interview-day-sheet`, `interview-templates`, `public-charge-statement`.
- **Tool classes:** `tool`, `field`, `field-row`, `check`, `btn`, `btn--ghost`, `btn-row`, `results`, `output`.
- **Pages allowed `<style>` blocks:** `delayed-i130-remedies`, `history-worksheet`, `interview-day-sheet`, `mandamus-pro-se`, `public-charge-statement`.
- **Renames:**
  - `eyebrow` → `article-eyebrow`
  - `lead` → `article-lead`
  - `table-wrap` → `table-card` (with `article-table` on its `<table>`)
  - `stage-card` → `step-card`
  - `stage-head` → `step-card-head`
  - `stage-pill` → `step-pill`
  - `stage-title` → `step-title`
- **Asset versions:**
  - `tools.css` is new at `?v=20261025c`.
  - `guide-article.css` is `?v=20261025c` on all 26 pages that load it (14 article plus 12 stage).
  - `article.css` is `?v=20261025c` during phase 1 only.
- **No wording changes. No `id` changes.** Phase 1 must leave every computed style unchanged.
- **Inline-style deletion rule:**
  - `margin*` may always go.
  - `padding*` or `gap` may go only if the element now carries a component class that defines its own padding or gap.
  - Allowlist under 10 entries.
- **Deviation from spec §3 and §4.4 (print overrides):** none of the 14 pages load `print.css`, so the overrides go into `guide-article.css` and `tools.css` print blocks. They move in phase 2 (Task 5), not phase 1: in phase 1 they stay inside `article.css`, which keeps phase 1 free of visible change.
- **New CSS:** `--ga-*` tokens, no `box-shadow`, `gradient` or `uppercase`, and a smallest text size of 14px. Article rules are scoped under `.guide-article`; `sr-only`, `no-print` and tool rules are unscoped.

## Review Focus

1. **Page `<style>` blocks that style renamed classes.** If a kept block references `.lead`, `.eyebrow`, `.table-wrap` or `.stage-*`, the rename would orphan those rules. Expected: those selectors are renamed too. Pinned in Task 6 (grep the kept blocks).
2. **Element rules under `.page-wrap`** (`h2`, `h3`, `details`, `summary`, `figure`, `table`): these style content without classes, and must carry over scoped, or `<details>` on 7 pages lose their look. Pinned in Task 5 (port every `.page-wrap <element>` rule) and Task 9 (`<details>` opened and screenshotted).
3. **Printing these pages:** the nav, footer, live notice and glossary must stay hidden in print. None of the 14 pages load `print.css`. Pinned in Task 8 (print rules present in `guide-article.css` and `tools.css`, read via CSSOM).
4. **A page with an eyebrow but no lead** (`interview-day-sheet`): the header wrap must still produce `header.article-header`. Pinned in Task 6 (14 headers counted).
5. **Tool output built by JavaScript** (`interview-dates` `li.ok`/`li.warn`/`li.bad`, statement-builder toggles): must look and work the same after both phases. Pinned in Task 3 and Task 9 (tool checks).

---

### Task 1: Phase 1 baseline snapshot

**Files:**
- Create (scratchpad only): `style-snapshot.js` (browser script), `article-pages.txt`

**Interfaces:**
- Produces, in the preview origin's `localStorage`:
  - `p4-baseline`: JSON `{ "<page>@<width>": ["<hash>", …] }`, one hash per element in `<main>`, in document order
  - `p4-tools`: tool smoke results
- Produces, as browser functions: `snapshot(pages, widths) -> object`, `compareTo(key) -> [{page, width, index, path, now}]`, `toolSmoke() -> object`

- [ ] **Step 1: Set up the worktree's own preview server** in the main checkout's `.claude/launch.json`, then open it.
- [ ] **Step 2: Write `style-snapshot.js`.** For each page and each width in `[1280, 375]`:
  - Load the page in a same-origin iframe of that width and open every `details` and `.sub-acc-item`.
  - For every element in `<main>`, join the computed values of the spec §4.1 property list into one string, then hash it with `cyrb53` (pinned below). The `path` is a short tag/class chain used for reporting.

```js
const cyrb53 = (s, seed = 0) => { let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < s.length; i++) { ch = s.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36); };
```

  - `toolSmoke()` checks:
    - `/interview-dates`: fill the first two date inputs with an interview date 30 days ahead and a medical date 20 days ago, submit, and record the number of `.results li` and their classes.
    - `/public-charge-statement`: click the first `.is-on`-toggling control and record that the class flipped.
    - `/history-worksheet`: type into the first `input` and record its value.
    - `/interview-templates`: click the first `[data-copy]` button and record that no console error appears and that the button's text or `aria-live` status changes.
- [ ] **Step 3: Run the baseline** on the unmodified pages and save `p4-baseline` and `p4-tools`.
  - Expected: 28 keys (14 pages × 2 widths), each a non-empty array.
  - Run `compareTo('p4-baseline')` immediately on the same pages. Expected: `[]`. This proves the snapshot is deterministic.
- [ ] **Step 4: Record in the ledger:** element counts per key and the `p4-tools` result. There is no commit, because nothing in the repo changed.

---

### Task 2: Phase 1, extract tools.css

**Files:**
- Create: `public/css/tools.css`
- Modify: the 6 tool pages (add the link)

**Interfaces:**
- Produces: `public/css/tools.css`, containing these `article.css` rules verbatim:
  - every rule whose selectors' root classes are tool classes
  - the "Tool forms" and "Results list" sections
  - the `:root` custom properties those rules reference
  - a header comment

- [ ] **Step 1: Build `tools.css`** by copying the rules unchanged; don't remove them from `article.css` yet. Each of the 6 tool pages gets `<link rel="stylesheet" href="/css/tools.css?v=20261025c">` directly after its `article.css` link.
- [ ] **Step 2: Verify phase 1 holds.** In the browser, `compareTo('p4-baseline')` → `[]`. Re-run `toolSmoke()` and check it equals `p4-tools`.
- [ ] **Step 3: Commit** with message `tools.css: tool and form styles in their own file (no visual change)`.

---

### Task 3: Phase 1, replace embedded copies

**Files:**
- Modify: `public/221g.html`, `public/administrative-processing.html`, `public/visa-pause.html`, `public/delayed-i130-remedies.html`

- [ ] **Step 1: Delete the embedded copies.** On `221g`, `administrative-processing` and `visa-pause`, delete the `<style>` element and add `<link rel="stylesheet" href="/css/article.css?v=20261025c">` in its place, before `nav.css`. On `delayed-i130-remedies`, add the same link and cut the `<style>` down to its 26 page-only selectors: the ones absent from `article.css`, worked out with the selector-set comparison from brainstorming.
- [ ] **Step 2: Bump `article.css`** to `?v=20261025c` on the 10 pages that already link it.
- [ ] **Step 3: Verify phase 1 holds.** `compareTo('p4-baseline')` → `[]` and `toolSmoke()` equals `p4-tools`. A non-empty diff means an embedded copy's values drifted from `article.css`. If so, port the embedded value into that page's `<style>` as a page-only rule, and record a ruling naming the selector.
- [ ] **Step 4: Commit** with message `Article pages: use the shared stylesheet instead of embedded copies (no visual change)`.

Phase 1 is complete and could ship at this point.

---

### Task 4: Phase 2 guard and ID snapshot

**Files:**
- Create: `test/fixtures/article-ids.json`, `test/fixtures/article-inline-allowlist.json` (`[]`), `test/article-pages.test.js`

**Interfaces:**
- Consumes: the `attrValues` and `version` helper patterns from `test/stage-pages.test.js`. Copy them, adjusted for this test.
- Produces: the guard described in spec §6, which honours `ARTICLE_PAGES_ROOT`, as the stage guard does with `STAGE_PAGES_ROOT`.

- [ ] **Step 1: Snapshot the IDs** of the 14 pages, in document order, to `article-ids.json`.
- [ ] **Step 2: Write `test/article-pages.test.js`.** It runs one `test()` per page with the seven assertions of spec §6 (messages like `${page}: article.css`, `${page}: old classes`, `${page}: main opt-in`, `${page}: css order`, `${page}: tools.css`, `${page}: inline styles`, `${page}: style blocks`, `${page}: ids`), plus one cross-page test:

```js
test('article pages share stylesheet builds with the stage pages', () => {
  const stageV = version(read('guide/nvc.html'), 'guide-article.css');
  assert.deepEqual([...new Set(PAGES.map(p => version(read(p), 'guide-article.css')))], [stageV]);
  assert.equal(new Set(TOOL_PAGES.map(p => version(read(p), 'tools.css'))).size, 1);
});
```

  `read(p)` reads from `ARTICLE_PAGES_ROOT`, falling back to `public/`. `guide/nvc.html` is always read from `public/`.
- [ ] **Step 3: Run `npm test`.** Expected: all 14 page tests and the cross-page test fail; the earlier 35 pass.
- [ ] **Step 4: Commit** with message `Article pages: ID snapshot and migration guard (red)`.

---

### Task 5: Phase 2 CSS

**Files:**
- Modify: `public/css/guide-article.css`, `public/css/tools.css`

- [ ] **Step 1: Port the article rules into `guide-article.css`.** Add every article (non-tool) rule from `article.css` that `guide-article.css` doesn't already cover, under `.guide-article`, with the renames from Global Constraints, translating colours to `--ga-*` tokens:
  - `page-wrap` and its responsive rule
  - `article-eyebrow`, `article-lead`, `disclaimer`
  - the section heading rules
  - `toc`, `toc-title`, `to-contents`
  - `sheet-grid`
  - `step-card`, `step-card-head`, `step-pill`, `step-title`
  - `keydates`, `keydate`, `provenance`, `sources`, `guide-return`
  - `chooser*`, `steps`
  - **every `.page-wrap <element>` rule** (Review Focus 2)

  Add `sr-only` and `no-print` unscoped. Where `article.css` and `guide-article.css` both define a component (callouts, voices, checklist), `guide-article.css` wins and the `article.css` version is dropped.
- [ ] **Step 2: Move the print overrides.** `.no-print`, `.site-nav`, `.avg-footer`, `.page-live-notice` and `.pause-glossary` with `display: none !important` go into `guide-article.css`'s `@media print`. `.btn-row` goes into a `@media print` block in `tools.css`.
- [ ] **Step 3: Verify.**
  - `grep -nE "box-shadow|gradient|uppercase" public/css/guide-article.css` returns no output.
  - The scope check returns no output, with `sr-only` and `no-print` added to its exclusions:

```bash
grep -nE '^\s*[.#a-z][^{]*\{' public/css/guide-article.css | grep -vE '\.guide-article|\.stat-(box|row)|\.sr-only|\.no-print|\.site-nav|\.avg-footer|\.page-live-notice|\.pause-glossary|^\s*:root|@media'
```

  - `npm test` passes the earlier 35.
- [ ] **Step 4: Commit** with message `guide-article.css: article page components and print overrides`.

---

### Task 6: Phase 2 markup migration script

**Files:**
- Modify: the 14 pages and the 12 stage pages (version bump only)
- Create (scratchpad): `migrate-article.py`; reuse `text-check.js` from piece 3

- [ ] **Step 1: Write and run `migrate-article.py`** over the 14 pages, skipping `<script>` blocks:
  - **Opt-in:** `<main class="page-wrap"` → `<main class="page-wrap guide-article"`.
  - **Header:** wrap `p.eyebrow`, the following `h1`, and the following `p.lead` if present, in `<header class="article-header">`.
  - **Renames:** apply them as whole class tokens. Add `class="article-table"` to the first `<table>` inside each `.table-card`.
  - **Dates:** in the hero (the first `p.article-lead` or an `article-meta`-style line), wrap any `(Reviewed|Updated) D Mon YYYY` in `<time datetime>`.
  - **Assets:** remove the `article.css` link; insert `guide-article.css?v=20261025c` before `readability.css`; keep `tools.css`.
  - **Kept `<style>` blocks:** rename `.eyebrow`, `.lead`, `.table-wrap` and `.stage-*` selectors there too (Review Focus 1).
- [ ] **Step 2: Bump the stage pages.** On the 12 stage pages, change `guide-article.css?v=20261025b` to `?v=20261025c`.
- [ ] **Step 3: Verify.**
  - `node text-check.js .` over the 14 pages → `OK` on all.
  - `grep -c 'class="article-header"'` over the 14 pages totals 14.
  - The guard passes everywhere except, possibly, rule 5 (inline styles).
- [ ] **Step 4: Commit** with message `Article pages: opt in to guide-article components`.

---

### Task 7: Phase 2 inline-style hand pass

**Files:**
- Modify: pages with leftover inline styles; `test/fixtures/article-inline-allowlist.json`; `public/css/guide-article.css` if a repeated pattern needs a class

- [ ] **Step 1: List the leftovers.** List each distinct leftover `(tag, style)` with context, using piece 3's leftover listing approach. Decide a mapping for each under the inline-style deletion rule, record it in the ledger, and apply it with a scratchpad `hand-pass` table.
- [ ] **Step 2: Run the spacing pairing check.** Use piece 3's `lost-spacing.py` adapted to these 14 pages (skip `header`, `time` and `link` tags). Expected: no element lost `padding` or `gap` without a class that defines it.
- [ ] **Step 3: Check the text and the guard.** `text-check.js` → `OK` on all 14, and `npm test` passes all tests.
- [ ] **Step 4: Commit** each page separately with message `Article pages: hand pass on /<page>`. The allowlist goes with the page it belongs to.

---

### Task 8: Delete article.css

**Files:**
- Delete: `public/css/article.css`

- [ ] **Step 1: Delete it.** First confirm `grep -rn "article.css" public --include=*.html | grep -v "<!--"` returns nothing.
- [ ] **Step 2: Verify the print rules** (Review Focus 3) on `/interview` in the browser. Through `document.styleSheets`, a `@media print` rule hides `.site-nav`, `.avg-footer`, `.page-live-notice`, `.pause-glossary` and `.no-print`; on a tool page, another hides `.btn-row`.
- [ ] **Step 3: Run `npm test`.** Expected: all pass.
- [ ] **Step 4: Commit** with message `Delete css/article.css (split into guide-article.css and tools.css)`.

---

### Task 9: Browser verification

**Files:** none, unless a check fails. Fix the defect in the owning task's file and commit it as `fix: <what>`.

- [ ] **Step 1: Desktop and phone pass.** For all 14 pages at 1280px and 375px, with `<details>` and accordions open:
  - no page overflow
  - zero clipped elements inside `.callout`, `.panel`, `.voice`, `.table-card`, `.step-card`, `details` and `.sub-acc-body` (the piece 3 in-container check)
  - `.article-header` present
  - `.callout` has a 3px left edge
- [ ] **Step 2: Tools.** `toolSmoke()` matches `p4-tools`'s counts and classes, and the `.results li.ok`/`.warn`/`.bad` computed colours are distinct (Review Focus 5).
- [ ] **Step 3: Details and deep links.** On `/221g` and `/reinterview`, screenshot an opened `<details>` (Review Focus 2). Load a hash to an ID inside a `<details>`; the target top must be at least the sticky stack bottom.
- [ ] **Step 4: Screenshots for the PR:** `/interview`, `/221g` and `/interview-dates` at 1280px. Link them in the PR through the Vercel preview URL that Vercel posts, not one built from the branch name.
