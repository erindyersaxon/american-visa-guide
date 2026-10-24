# Stage Pages Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the 11 guide stage pages and the `/guide` hub onto the shared `guide-article.css` components, strip their inline styles, and delete the old stage-only component rules.

**Architecture:**
- A permanent `node:test` guard pins the end state: no inline styles beyond an allowlist, no old class names, `.guide-article` opt-in, CSS order, and frozen anchor IDs.
- A one-off script in the scratchpad does the mechanical rewrites.
- A hand pass per page handles callout severity and leftovers.
- A text-equality check proves no wording changed.

**Tech Stack:** Static HTML, plain CSS, Node 24 `node:test`, Python 3 for one-off scripts (not committed).

**Spec:** `docs/superpowers/specs/2026-10-25-stage-pages-migration-design.md`

## Global Constraints

- **Pages (12):** `public/guide.html` and `public/guide/{after-interview,before-you-leave,crba,delayed-i130,i130,interview-letter,interview,medical,nvc,us-entry,waiting}.html`.
- **No wording changes.** Expected text differences are only the removed empty icon `<span>`s and the `<time>` wrapper, which carries the same text.
- **Never add, remove or rename an `id` attribute.**
- **Forbidden class tokens after migration:** `info-card`, `info-card-head`, `stage-h1`, `stage-meta`, `stage-bottomline`, `stage-actions`.
- **Every page's `<main>`** becomes `<main class="main guide-article" id="main-content" role="main">`.
- **Asset versions:** `?v=20261025b` for `guide-article.css` and `stage.css` on all 12 pages. `guide-article.css` loads directly before `readability.css`.
- **Shared CSS rules:** new rules are scoped under `.guide-article`, use `--ga-*` tokens, and contain no `box-shadow`, `gradient` or `text-transform: uppercase`.
- **Inline-style allowlist:** at most 10 entries across all 12 pages.
- **Copy:** no em dashes in site copy.
- **Callout severity:** follows spec Appendix A exactly. Alerts are cards 1, 2, 3 and 23; every other warning is `callout-warn`.

## Review Focus

1. **Inline styles that carry meaning** (`display:none`, `font-weight`, `text-decoration`, `position`, sizes): deleting them would reveal hidden content or lose emphasis while the text check still passes. Pinned in Task 3 (the script deletes only spacing and colour declarations) and Task 4 (a `display:none` count check).
2. **Class attributes in unexpected shapes** (`class="info-card warning" id=…`, extra classes, odd spacing): a regex rename that misses one leaves an old class behind. Pinned by guard rule 2 in Task 1, which must pass at the end of Task 4.
3. **Callouts inside collapsed accordions:** spacing and colours must look right when an accordion is opened, not only in open content. Pinned in Task 6 (open every accordion on `/guide/nvc` and screenshot).
4. **Deep links into accordions** (`stage.js` opens the accordion that holds the target): these must still work after class changes. Pinned in Task 6 (a hash link to an ID inside a `.sub-acc-item`).
5. **Tables and long URLs inside callouts at 375px:** changed padding must not cause horizontal overflow. Pinned in Task 6 (scrollWidth on all 12 pages at 375px).

---

### Task 1: ID snapshot and the guard test

**Files:**
- Create: `test/fixtures/stage-ids.json`
- Create: `test/fixtures/stage-inline-allowlist.json` (starts as `[]`)
- Create: `test/stage-pages.test.js`

**Interfaces:**
- Produces:
  - `stage-ids.json`: `{ "<path relative to public/>": ["id1", "id2", …] }`, IDs in document order, for the 12 pages.
  - `stage-inline-allowlist.json`: an array of `{ "page": "<relative path>", "style": "<exact attribute value>" }`.

- [ ] **Step 1: Generate the snapshot** from the current pages, before any edits. Collect every `id="…"` with `/\sid="([^"]+)"/g` in document order, then write `stage-ids.json` with keys like `"guide.html"` and `"guide/nvc.html"`.
- [ ] **Step 2: Write `test/stage-pages.test.js`.** It runs one `test()` per page with five assertions:

```js
const PAGES = ['guide.html', ...['after-interview','before-you-leave','crba','delayed-i130','i130',
  'interview-letter','interview','medical','nvc','us-entry','waiting'].map(p => `guide/${p}.html`)];
const OLD = ['info-card', 'info-card-head', 'stage-h1', 'stage-meta', 'stage-bottomline', 'stage-actions'];
// per page:
// 1. every style="…" value is in the allowlist for that page
assert.deepEqual(styles.filter(s => !allowed.has(s)), [], `${page}: inline styles`);
// 2. no old class tokens (split each class attribute on whitespace)
assert.deepEqual(classTokens.filter(t => OLD.includes(t)), [], `${page}: old classes`);
// 3. <main …> has class token guide-article
assert.ok(mainClasses.includes('guide-article'), `${page}: main opt-in`);
// 4. guide-article.css link appears before readability.css link
assert.ok(idx('guide-article.css') !== -1 && idx('guide-article.css') < idx('readability.css'), `${page}: css order`);
// 5. ids unchanged
assert.deepEqual(ids, snapshot[page], `${page}: ids`);
```

- [ ] **Step 3: Run `npm test`.**
  - Expected: FAIL on all 12 page tests, on rules 1–4. Rule 5 passes, since the snapshot was just taken.
  - The 22 existing tests pass.
- [ ] **Step 4: Commit** with message `Stage pages: ID snapshot and migration guard (red)`.

---

### Task 2: Shared CSS additions

**Files:**
- Modify: `public/css/guide-article.css` (append)
- Modify: `public/css/stage.css` (add `.back-top`)

**Interfaces:**
- Produces these classes:
  - Member stories: `.voices`, `.voice`, `.voice-who`, `.voice-what`.
  - Prompts and buttons: `.article-prompt`, `.article-cta`.
  - Text and layout: `.text-muted`, `.article-actions-section`.
  - Element rules: `.guide-article table th`, `.guide-article table td`, `.guide-article figure img`.
  - Outside the scope: `.back-top`, in `stage.css`.

- [ ] **Step 1: Append to `guide-article.css`.** Everything goes under `.guide-article`, using the `--ga-*` tokens.

| Class | Rules |
|---|---|
| `.voices` | flex column, gap 12px, margin 12px 0 |
| `.voice` | `--ga-surface` background, 1px `--ga-border` border plus a 3px left edge in `--ga-text`, `--ga-radius`, padding 14px 16px |
| `.voice-who` | 14px, weight 600, `--ga-muted`, margin-bottom 4px |
| `.voice-what` | body size |
| `.article-prompt` | flex, align center, gap 10px, `--ga-good-bg` background, 1px border `--ga-border`, `--ga-radius`, padding 10px 14px, margin 0 0 16px; `p { margin: 0 }` |
| `.article-cta` | inline-flex, gap 6px, background `--ga-text`, text white, `--ga-font-ui`, 14px, weight 700, padding 7px 14px, `--ga-radius`, no underline |
| `.text-muted` | color `--ga-muted` |
| `table th`, `table td` | padding 9px 12px, border-bottom 1px `--ga-border`, text-align left |
| `figure img` | width 100%, height auto, 1px `--ga-border` border, `--ga-radius` |
| `.article-actions-section` | margin 0 0 24px |

- [ ] **Step 2: Add the print rules** per spec §4:
  - `.callout`, `.voice`, `.stat-box`: `page-break-inside: avoid; border: 1pt solid #999; background: none`.
  - `.article-prompt`, `.article-cta`: `display: none`.
- [ ] **Step 3: Add `.back-top` to `stage.css`.** The values are copied verbatim from today's inline style, except `opacity:0`, which stays as the initial state in the class (`stage.js` changes `style.opacity` at runtime):
  - `position:fixed; bottom:24px; right:24px; width:44px; height:44px; border-radius:50%`
  - `background:var(--accent); color:var(--text-inverse); border:none`
  - `font-size:18px; font-weight:700; cursor:pointer`
  - `opacity:0; transition:opacity .3s; z-index:99`
  - `display:flex; align-items:center; justify-content:center`
- [ ] **Step 4: Verify.**
  - `grep -nE "box-shadow|gradient|uppercase" public/css/guide-article.css` returns no output.
  - The scope check from the previous plan returns no output:

```bash
grep -nE '^\s*[.#a-z][^{]*\{' public/css/guide-article.css | grep -vE '\.guide-article|\.stat-(box|row)|^\s*:root|@media'
```

  - `npm test` still fails only on the Task 1 guard.
- [ ] **Step 5: Commit** with message `guide-article.css: voices, prompt, CTA, tables and print rules`.

---

### Task 3: Mechanical migration script

**Files:**
- Modify: the 12 pages
- Create (scratchpad only, not committed): `migrate-stage.py`, `text-check.js`

**Interfaces:**
- Consumes: the Task 2 classes.
- Produces: `text-check.js <page…>`. It compares the text of `git show main:public/<page>` with the working file, prints `OK <page>` or a unified diff, and exits non-zero on any difference. Task 4 runs it again.

- [ ] **Step 1: Write `text-check.js`.**
  - Extract text by removing `<script>…</script>`, `<style>…</style>` and tags, decoding `&amp; &lt; &gt; &quot; &#39; &nbsp;` and numeric entities, and collapsing whitespace.
  - Before comparing, drop empty icon spans from both sides.
  - Run it on the unedited pages. Expected: `OK` for all 12.
- [ ] **Step 2: Write `migrate-stage.py`**, applying these rewrites in order to each page:
  1. **`<main>`:** `<main class="main"` becomes `<main class="main guide-article"`.
  2. **Classes, by token within each `class="…"` attribute:**
     - `info-card warning` → `callout callout-warn`
     - `info-card tip` → `callout callout-good`
     - `info-card` (alone) → `callout callout-info`
     - `info-card-head` → `callout-title`
     - `stage-meta` → `article-meta`
     - `stage-bottomline` → `article-summary`
     - `stage-actions` → `article-actions-section`
     
     Other tokens such as `hub-reviewed` are kept.
  3. **Action list:** the first `<ol>` inside `section.article-actions-section` gets `class="article-actions"`.
  4. **Header (stage pages only):** wrap `<h1 class="stage-h1">…</h1>` plus the immediately following `p.article-meta` and `div.article-summary` in `<header class="article-header">…</header>`, and drop `class="stage-h1"`.
  5. **Reviewed date:** inside `article-meta`, `<span>Reviewed D Mon YYYY</span>` becomes `<span>Reviewed <time datetime="YYYY-MM-DD">D Mon YYYY</time></span>`. Parse the month from `Jan|Feb|Mar|Apr|May|June?|July?|Aug|Sept?|Oct|Nov|Dec`.
  6. **Repeated patterns:** replace these exact inline styles with classes (spec §3 table):
     - the story wrapper → `voices`
     - the story card → `voice`
     - the story name line → `voice-who`
     - the story text → `voice-what`
     - the "Had your…" banner `div` → `article-prompt`, with its empty `<span style="font-size:15px;flex-shrink:0;"></span>` removed
     - the button-link style → `article-cta`
     - the `back-top` button style → `class="back-top"`
     - `color:var(--text-secondary)`, `color:rgba(15,23,42,0.78)` and the other muted colours → `text-muted`
  7. **Spacing and colour declarations:** inside the remaining `style` attributes, delete only spacing declarations (`margin`, `margin-*`, `padding`, `padding-*`, `gap`) and `color:var(--text-primary)`. Drop the attribute if it ends up empty. **Never delete** `display`, `position`, `width`, `height`, `font-weight`, `font-size`, `text-decoration` or `border*` (Review Focus 1); those go to the hand pass.
  8. **Add the stylesheet:** insert `<link rel="stylesheet" href="/css/guide-article.css?v=20261025b">` before `readability.css` if it's absent, set its version if present, and set `stage.css` to `?v=20261025b`.
- [ ] **Step 3: Run the script, then `text-check.js` on all 12 pages.** Expected: `OK` for all 12. Any diff means the script is wrong: fix the script, not the page.
- [ ] **Step 4: Run `npm test`, saving the guard output to the workspace.**
  - Expected: rules 3, 4 and 5 pass on all pages; rule 2 has no failures; rule 1 still lists leftover inline styles.
  - Record the leftover count per page in the ledger.
- [ ] **Step 5: Commit** with message `Stage pages: mechanical move to guide-article classes`.

---

### Task 4: Hand pass, one commit per page

**Files:**
- Modify: each of the 12 pages
- Modify: `test/fixtures/stage-inline-allowlist.json`

**Interfaces:**
- Consumes: `text-check.js` (Task 3) and spec Appendix A.

For each page, in the order `nvc`, `interview`, `after-interview`, `medical`, `us-entry`, `waiting`, `interview-letter`, `i130`, `crba`, `before-you-leave`, `delayed-i130`, then `guide.html`:

- [ ] **Step 1: Callout severity.** Set cards 1, 2, 3 and 23 of Appendix A to `callout callout-alert`. Match each by its `callout-title` text; the IDs are listed where the card has one. All other former warnings stay `callout-warn`.
- [ ] **Step 2: Resolve every leftover `style=`.**
  - Map it to an existing shared class.
  - Or add a scoped rule to `guide-article.css` (for something that repeats), or to `stage.css` (for page layout).
  - Or keep it inline and add `{page, style}` to the allowlist (genuine one-offs only; at most 10 across all pages).
  - Before and after each page, compare the counts of `display:none` and `hidden` across inline styles and attributes: a `display:none` must become the `hidden` attribute or a class, never disappear (Review Focus 1).
- [ ] **Step 3: Run `text-check.js <page>`** (expected `OK`) and the guard for that page (expected pass).
- [ ] **Step 4: Commit** with message `Stage pages: hand pass on /<page>`.

When every page is done, `npm test` passes with all 12 page tests green, and the allowlist has at most 10 entries.

---

### Task 5: Remove dead stage.css rules

**Files:**
- Modify: `public/css/stage.css`

- [ ] **Step 1: Delete these rule blocks and their media-query variants:**
  - `.info-card` and every `.info-card…` selector
  - `.stage-h1`, `.stage-meta…`, `.stage-bottomline…`, `.stage-actions…`
  - the `.checklist…` rules
- [ ] **Step 2: Verify.**
  - `grep -nE "info-card|stage-h1|stage-meta|stage-bottomline|stage-actions|\.checklist" public/css/stage.css` returns no output.
  - `grep -rn "stage-meta\|info-card" public/guide public/guide.html` returns no output.
  - `npm test` passes.
- [ ] **Step 3: Commit** with message `stage.css: drop the old stage-only component rules`.

---

### Task 6: Browser verification

**Files:** none, unless a check fails. Fix the defect in the owning task's file and commit it as `fix: <what>`.

- [ ] **Step 1: `npm test` passes**, including all 12 guard tests.
- [ ] **Step 2: Desktop pass.** At 1280px, load each of the 12 pages on the worktree's preview server.
  - The console shows no errors, apart from the expected `/api/data` 404.
  - `.callout`, `.voice`, `.article-prompt` and `.article-cta` elements have their new computed styles: for example, `.callout-alert`'s border-left-color is the alert red.
  - Screenshot `/guide/nvc`, `/guide/interview` and `/guide` for the PR.
- [ ] **Step 3: Accordions** (Review Focus 3). On `/guide/nvc`, open every `.sub-acc-item` and screenshot one that contains a callout and a list.
- [ ] **Step 4: Deep link into an accordion** (Review Focus 4). Pick an ID inside a `.sub-acc-item` on `/guide/nvc` and load `/guide/nvc.html#<id>`.
  - Expected: its accordion is open.
  - Expected: the target top is at least the sticky stack bottom.
- [ ] **Step 5: Mobile** (Review Focus 5). At 375px, check `document.documentElement.scrollWidth <= innerWidth` on all 12 pages.
- [ ] **Step 6: Back-to-top.** On `/guide/nvc`, after scrolling more than 400px, `#back-top` has opacity 1; clicking it returns to the top.
- [ ] **Step 7: Print.** The pane can't emulate print media. Instead, read `guide-article.css`'s `@media print` rules through `document.styleSheets` on `/guide/nvc`. Expected: one rule sets `display: none` for `.article-prompt` and `.article-cta`, and one sets `page-break-inside: avoid` for `.callout`, `.voice` and `.stat-box`.
