# Civic Editorial Palette Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin the static site from cream + steel blue to Civic Editorial (slate, off-white, 1px borders, modest radii, red as a sparing mark) without renaming tokens.

**Architecture:** One JSON colour map drives a one-off swap script and a reusable static checker. The checker is written first. Each later task makes one of its checks pass, then hand-edits what a value swap can't express (new tokens, shadows, radii, nav chrome). A browser pass and Erin's screenshot review gate the push.

**Tech Stack:** Plain CSS custom properties and inline `<style>` blocks in `public/`; Node 24 (`node:test`, no dependencies) for the checker; Python 3 for the swap script, following `scripts/palette-swap.py`.

**Spec:** `docs/superpowers/specs/2026-10-24-civic-editorial-palette-design.md` (read it; this plan does not repeat the token table).

## Global Constraints

- Work in a git worktree on branch `civic-editorial` (superpowers:using-git-worktrees). Never push. Pushing `main` deploys production; Erin approves first.
- Keep every legacy token name. Change only values, and add new tokens: `--color-mark`, `--color-mark-on-dark`, `--shadow-overlay`.
- Unchanged: role colours `#1A5FB4`, `#1E6B34`, `#6A3D9A`; the brand chevrons `#bf3b3b`, `#2e4a7d`; sage `#4A6B50` and amber `#875325`; all `/data` chart colours (`public/js/official-data-charts.js`, `public/js/data.js` are never touched).
- `public/css/readability.css` keeps its typography and GOV.UK yellow focus. The only addition is link hover (Task 3).
- Headings stay Public Sans. Source Serif 4 is used only on the nav wordmark.
- Red `#991B1B` never fills a button or link, except error and destructive states (`#7F1D1D`).
- No em dashes in any copy or comments you add (site rule since `d7ec490`).
- Files in scope for colour edits: `public/css/*.css`, `public/*.html`, `public/guide/*.html`, `public/js/nav.js`, `public/favicon.svg`, `scripts/og-image-source.html`. Call these SCOPE.

## Review Focus

1. **Pages with their own inline `:root`** (9 pages, e.g. `i864-household-decision-tree.html` with `--gold`, `--surface`). They must come out slate like everything else. The `hex` check covers their literals; Task 7's browser pass must open each one.
2. **Inline `--color-mark` without the token.** Pages that don't load `design-system.css` lack `--color-mark`, so every use must be written as `var(--color-mark, #991B1B)`. Task 3 adds a `marks` assertion for the fallback.
3. **Nav on stage and article pages**, which define different token names. `nav.css` must not depend on page tokens for its slate values. Task 6 tests that `nav.css` uses its own `--nav-*` block.
4. **Focus visibility on slate.** The GOV.UK yellow focus must still show on nav links, and the toggle outline must be `#F8FAFC`. Task 7 does a keyboard check on one page of each stylesheet family.
5. **Error states shown by colour alone.** The spec requires an icon plus the word "Error". Task 7 lists every rendered error/destructive component and confirms the label is there. Anything missing becomes a follow-up for Erin; this pass doesn't add new components.

---

### Task 1: Static checker

**Files:**
- Create: `scripts/check-civic.mjs`
- Test: `scripts/check-civic.test.mjs`

**Interfaces:**
- Produces: `type Violation = { file: string, line: number, rule: string, detail: string }`. Named exports, each returning `Violation[]`:
  - `checkHex(files: string[], map: {hex: Record<string,string>}, allow: string[])`
  - `checkShadow(files)`
  - `checkRadius(files, roundAllow: string[])`
  - `checkContrast(tokenFile: string, pairs: Pair[])`, where `Pair = [fg: string, bg: string, min: number]` and a value starting `--` is resolved from the first `:root` in `tokenFile`
  - `checkMarks(rules: [file, selector][])`
  - `checkNav(navCss: string)`
  - Also exports `blocks(text) -> {selector, body, line}[]`: a linear brace scanner (no backtracking regex) that reads `<style>` contents for `.html` files.
- CLI: `node scripts/check-civic.mjs <hex|shadow|radius|contrast|marks|nav|all>` prints one `file:line rule detail` per violation. It exits 1 if there are any and prints `ok <check>` otherwise.
- Data lives in the module as exported constants, filled by later tasks: `ROUND_ALLOW` (Task 5), `PAIRS` (Task 3), `MARK_RULES` (Task 3). It reads the map from `scripts/civic-palette-map.json` (Task 2).

- [ ] **Step 1: Write failing tests** with `node:test` and inline fixture strings written to a temp dir:
  - `hex flags a mapped key case-insensitively`: `#3E7188` with map `{hex:{"3e7188":"0f172a"}}` gives 1 violation, `rule === "hex"`.
  - `hex ignores allowed values`: `#bf3b3b` with allow `["bf3b3b"]` gives 0.
  - `shadow allows none, overlay, :focus selectors, readability.css, print.css`: each gives 0. `.card{box-shadow:0 1px 2px #000}` gives 1.
  - `shadow flags hover lifts`: `.x:hover{transform:translateY(-2px)}` gives 1, rule `lift`.
  - `shadow flags non-none shadow tokens`: `:root{--shadow-sm:0 1px 2px #000}` gives 1.
  - `radius flags pills unless allow-listed`: `.btn{border-radius:9999px}` gives 1. `.step-num{border-radius:50%}` with allow `[".step-num"]` gives 0.
  - `radius flags 10px+`: `12px` and `0.75rem` give 1 each; `0.375rem` gives 0; `:root{--radius-lg:0.75rem}` gives 1.
  - `contrast`: `["#475569","#F8FAFC",4.5]` passes and `["#64748B","#F8FAFC",4.5]` fails.
  - `blocks reports the line of each selector` across a nested `@media`.
- [ ] **Step 2: Run** `node --test scripts/check-civic.test.mjs`. Expected: FAIL, module not found.
- [ ] **Step 3: Implement** `scripts/check-civic.mjs`. Use the WCAG 2.x relative luminance formula. Treat a radius of `--radius-full`, `9999px`, `999px`, `100px` or `50%` as full.
- [ ] **Step 4: Run** `node --test scripts/check-civic.test.mjs`. Expected: all PASS.
- [ ] **Step 5: Run** `node scripts/check-civic.mjs shadow`. Expected: exits 1 and lists about 35 violations. This is the baseline, so record the count in the commit message.
- [ ] **Step 6: Commit** `scripts/check-civic.mjs scripts/check-civic.test.mjs` with the message "Add Civic Editorial static checker".

### Task 2: Colour map and swap

**Files:**
- Create: `scripts/civic-palette-map.json`, `scripts/civic-palette-swap.py`
- Test: `scripts/test_civic_palette_swap.py`
- Modify: every file in SCOPE (generated)

**Interfaces:**
- Produces: `civic-palette-map.json` = `{ "hex": {old: new}, "rgba": [[[r,g,b],[r,g,b]], ...], "allow": ["bf3b3b","2e4a7d"] }`, lower-case hex without `#`. `checkHex` reads `hex` keys and `allow`.
- `civic-palette-swap.py` exposes `swap(text: str, cmap: dict) -> str`. Its CLI is `python3 scripts/civic-palette-swap.py FILE...`, which loads the JSON and rewrites files in place. Copy the regex approach of `scripts/palette-swap.py`: 6-digit hex only, preserve the alpha on `rgba`.

Map values (exact):

```
surfaces   fdfaf3>ffffff f4efe6>f8fafc ede8de>f1f5f9 f7f2e9>f1f5f9 efe9dd>f1f5f9 efe6d2>f1f5f9
           ece5d6>f8fafc e7e0d4>e2e8f0 e4ddcf>e2e8f0 e8e4dc>e2e8f0 e0d8c9>e2e8f0 d9d3c8>cbd5e1
borders    ddd6cb>e2e8f0 a39c8e>64748b
text       1e1c17>0f172a 56524a>334155 6a6560>475569
structure  2b3a42>0f172a 233038>1e293b 1e2b32>020617 3d5260>334155 e8eef1>f1f5f9 0d2a38>020617
           17242e>0f172a 1e3040>1e293b 28404e>1e293b 3a5a6c>334155
accent     3e7188>0f172a 2f5a6e>1e293b 5a8fa6>475569 c8dde6>cbd5e1 edf4f8>f1f5f9 a9cbd9>cbd5e1
           cfdde3>e2e8f0 a9c2cd>cbd5e1 e9f0f3>f1f5f9 cfe0e7>e2e8f0 bcd6e0>cbd5e1 e6f3f8>f1f5f9
           1e5f78>1e293b 155e78>1e293b 0e4e66>0f172a 0a3f53>0f172a 6a8898>64748b 9badb8>94a3b8
           7baabb>94a3b8 8fc0cf>94a3b8 9ecfdf>cbd5e1
red        b04a38>7f1d1d 9b3434>7f1d1d a83a3a>7f1d1d 7a3022>7f1d1d 7f2d2d>7f1d1d f8ece7>fef2f2
           f7e9e6>fef2f2 f5ded6>fee2e2 ecccc4>fecaca dfa9a0>fecaca e4b3aa>fecaca
success    e9f0e6>eff5f0 ebf1ec>eff5f0
warning    f7efdc>fbf5ec f6ecd9>fbf5ec d9bb86>e5cfa8 e6d3b0>e5cfa8
rgba       30,28,23>15,23,42  62,113,136>15,23,42  43,58,66>15,23,42  90,143,166>71,85,105
           244,239,230>248,250,252  106,101,96>71,85,105  200,221,230>203,213,225  176,74,56>127,29,29
```

- [ ] **Step 1: Write failing tests** with `unittest`:
  - `swap("#3E7188")` gives `"#0f172a"`.
  - `swap("rgba(90, 143, 166, 0.12)")` gives `"rgba(71,85,105, 0.12)"`.
  - `swap("#bf3b3b #2e4a7d #1A5FB4")` is unchanged.
  - `swap("#fff")` is unchanged (3-digit hex is out of scope).
- [ ] **Step 2: Run** `python3 -I -m unittest scripts/test_civic_palette_swap.py`. Expected: FAIL.
- [ ] **Step 3: Implement** the map JSON and `swap`.
- [ ] **Step 4: Run** the tests again. Expected: PASS.
- [ ] **Step 5: Run** the swap over SCOPE: `python3 scripts/civic-palette-swap.py public/css/*.css public/*.html public/guide/*.html public/js/nav.js public/favicon.svg scripts/og-image-source.html`. It prints "N files changed".
- [ ] **Step 6: Run** `node scripts/check-civic.mjs hex`. Expected: `ok hex`. Then run `grep -ic "#1a5fb4\|#1e6b34\|#6a3d9a" public/css/*.css public/*.html` and confirm the count matches `main`.
- [ ] **Step 7: Commit** the scripts and the swapped files with the message "Swap palette to Civic Editorial values".

### Task 3: Tokens, red marks, buttons

**Files:**
- Modify: `public/css/design-system.css` (`:root` and the rules at 202, 309, 375, 419)
- Modify: `public/css/main.css` (`:root` 100-135)
- Modify: `public/css/components.css` (`.btn` variants, `.page-header__eyebrow` 978, `.page-header__title span` 985)
- Modify: `public/css/article.css` (`.eyebrow` 64, `h1 span, h1 em` 79)
- Modify: `public/css/stage.css` (303, `.page-hero-eyebrow` 860, `.page-hero-h1 span` 862)
- Modify: `public/css/readability.css` (link hover only)
- Modify: `scripts/check-civic.mjs` (`PAIRS`, `MARK_RULES`)

**Interfaces:**
- Consumes: the Task 1 checks.
- Produces: the tokens `--color-mark: #991B1B` and `--color-mark-on-dark: #F87171` in `design-system.css` and `main.css`. Task 6 uses the same literal values inside `nav.css`.

- [ ] **Step 1: Fill `PAIRS`.** Token pairs, resolved from `public/css/design-system.css`:
  - text, text-secondary and text-muted on `--color-bg` and `--color-surface-alt`, at 4.5
  - `--color-gold` on `--color-bg`, at 4.5
  - `--color-mark` on `--color-bg`, at 4.5
  - `--color-mark-on-dark` on `--color-navy`, at 4.5
  - `--color-border-strong` on `--color-bg`, at 3
  - `--color-error` on `--color-destructive-subtle`, at 4.5
  - `--color-success` on `--color-success-subtle`, at 4.5
  - `--color-warning` on `--color-warning-subtle`, at 4.5
  - `--color-text-inverse` on `--color-navy`, at 4.5

  Literal pairs, at 4.5: `#CBD5E1/#0F172A`, `#94A3B8/#0F172A`, `#F87171/#0F172A`, `#F8FAFC/#1E293B`.
- [ ] **Step 2: Fill `MARK_RULES`.** Each block must contain `var(--color-mark, #991B1B)` (or `--color-mark-on-dark` on dark heroes). The blocks are the eight selectors listed under Files above, plus the guide and life hero `h1 span` styles found by `grep -n "h1 span\|h1 em" public/guide/*.html public/life.html`.
- [ ] **Step 3: Run** `node scripts/check-civic.mjs contrast marks`. Expected: FAIL, because `--color-mark` and `--color-mark-on-dark` don't exist yet.
- [ ] **Step 4: Edit tokens.**
  - Add the two mark tokens.
  - Set `--color-error`, `--color-destructive` to `#7F1D1D`, `--color-destructive-subtle` to `#FEF2F2`, `--color-destructive-border` to `#FECACA`, `--color-info` to `#0F172A`, `--color-info-subtle` to `#F1F5F9`, and `--color-navy-dark` to `#020617`.
  - Set `--color-primary-hover` to `#1E293B`. In `main.css`, set `--radius-md` to `0.375rem`.
  - Header comment: rename the palette to "Civic Editorial", and add one line per legacy name stating its real role (for example `--color-gold: link and old accent, now slate`).
- [ ] **Step 5: Edit marks and buttons.**
  - Point the `MARK_RULES` blocks at the mark token, with italic kept.
  - In `readability.css`, add `main a:not([class]):hover, main a.inline-link:hover { color: var(--color-mark, #991B1B); }`.
  - `.btn` secondary: `background: var(--color-surface)`, `border: 1px solid var(--color-border-strong)`, `color: var(--color-text)`.
  - `.btn` destructive: `#7F1D1D`.
  - Primary already resolves to slate after Task 2; confirm it does.
- [ ] **Step 6: Run** `node scripts/check-civic.mjs contrast marks hex`. Expected: `ok` for all three.
- [ ] **Step 7: Commit** with the message "Add Civic Editorial tokens, red marks and button variants".

### Task 4: Shadows to borders

**Files:**
- Modify: `public/css/design-system.css:143-145,337`, `public/css/main.css` shadow tokens, `public/css/components.css:16,21,73,368,686,818,831,915,1096`, `public/css/stage.css:125,158`, `public/css/nav.css:78,267`
- Modify: `public/checklists.html:33,49,224`, `public/data.html:142,194,262,305,407`, `public/index.html:136-140,279`, `public/interview-questions.html:25,61`, `public/naturalization.html:151`, `public/i864-household-decision-tree.html:74`, `public/life.html:66`, `public/public-charge-statement.html:25`

**Interfaces:**
- Consumes: `checkShadow`.
- Produces: the token `--shadow-overlay: 0 1px 2px rgba(15,23,42,.08)`. Define it in `design-system.css` and `main.css`, and use `var(--shadow-overlay, 0 1px 2px rgba(15,23,42,.08))` wherever the page may not load either file.

- [ ] **Step 1: Run** `node scripts/check-civic.mjs shadow`. Expected: FAIL, matching the Task 1 baseline list.
- [ ] **Step 2: Set** `--shadow-xs/sm/md/lg` to `none` in both token files, and add `--shadow-overlay`.
- [ ] **Step 3: Make overlay layers use `--shadow-overlay` plus a 1px border:**
  - `nav.css:267` (mobile menu)
  - `stage.css:158` (drawer)
  - `components.css:1096` (`.toast`)
  - `data.html:407` (`.od-tip`)
  - `life.html:66` (`#tooltip`)
  - `public-charge-statement.html:25` (`.pc-bar`)
- [ ] **Step 4: Recolour focus halos.** In `components.css:818`, replace the halo with `0 0 0 2px var(--color-bg), 0 0 0 4px #0F172A`. Do the same at `:831` with `#7F1D1D`.
- [ ] **Step 5: Delete every other `box-shadow` declaration**, including `components.css:368` (the active step halo, which is decoration).
  - Add `border: 1px solid var(--color-border)` to the element if it has no border.
  - Where a hover rule raised the shadow or used `translateY(-…)` (for example `index.html:137-140`, `checklists.html:29-33`), make the hover set `border-color: var(--color-border-strong)` instead.
  - In those `transition` lists, replace `box-shadow` and `transform` with `border-color`.
  - `.qb-mode-btn[aria-selected="true"]` marks its selected state with `border: 1px solid var(--color-border-strong)`.
- [ ] **Step 6: Run** `node scripts/check-civic.mjs shadow`. Expected: `ok shadow`.
- [ ] **Step 7: Commit** with the message "Replace drop shadows with 1px borders".

### Task 5: Radii

**Files:**
- Modify: `scripts/check-civic.mjs` (`ROUND_ALLOW`)
- Modify: `public/css/design-system.css` (`--radius-xl`, `.btn`, `.badge`, `.stage-chip`), `public/css/main.css` (`--radius-lg/xl/2xl`), `public/css/components.css` (`.badge`, `.tag`, `.btn`, `.progress`, `.progress__bar`), `public/css/nav.css` (`.nav-link--support`, `.avg-footer__kofi`), `public/css/stage.css` (`.coffee-btn`)
- Modify: the `<style>` blocks in `checklist-interview.html`, `checklists.html`, `data.html`, `delayed-i130-remedies.html`, `index.html`, `interview-questions.html`, `life.html`, `naturalization.html`, `worksheet-ds260.html`, `worksheet-i864.html`, plus any 10px+ literal radius `checkRadius` reports (for example `i864-household-decision-tree.html` `.step-card`, `life.html` `#tooltip`)

- [ ] **Step 1: Set `ROUND_ALLOW`.** These are exactly the circles, lines and radios:
  - `.steps > li::before`, `.step__marker`, `.form-check-input[type="radio"]`, `.form-check-input[type="radio"]:checked::after`
  - `.nav-toggle-bar`, `.mobile-nav-toggle`, `.step-num`, `.status-dot`, `.step-number`, `.tooltip-trigger`
  - `.home-hero__eyebrow-dot`, `.stage-badge`, `.steps li::before`, `.tl li::after`
- [ ] **Step 2: Run** `node scripts/check-civic.mjs radius`. Expected: FAIL, about 25 violations.
- [ ] **Step 3: Small labels go to `var(--radius-sm)`:** `.badge`, `.tag`, `.stage-chip`, `.skel--chip`, `.card-progress`, `.progress`, `.progress__bar`.
- [ ] **Step 4: Everything else goes to `var(--radius-md)`:** buttons, `.qb-modes`, `.qb-mode-btn`, `.home-routes a`, `.jump a`, `.steps li`, `.community .btn-link`, `.coffee-btn`, `.nav-link--support`, `.avg-footer__kofi`.
  - Any literal radius of 10px or more becomes `var(--radius-md, 0.375rem)`.
  - `--radius-lg/xl/2xl` in `main.css`, and `--radius-xl` in `design-system.css`, become `0.375rem`.
- [ ] **Step 5: Run** `node scripts/check-civic.mjs radius`. Expected: `ok radius`.
- [ ] **Step 6: Commit** with the message "Square off pills and large radii".

### Task 6: Nav, banner, footer, wordmark, OG image

**Files:**
- Modify: `public/css/nav.css` (the whole file's colour rules; the `@import` goes at line 1)
- Verify only: `public/js/nav.js:34`, `public/favicon.svg`, `scripts/og-image-source.html:71` (Task 2 set the tile to `#f8fafc`)
- Regenerate: `public/images/og-home.png`
- Modify: `scripts/check-civic.mjs` (`checkNav`)

**Interfaces:**
- Produces: a `:root` block at the top of `nav.css` with these tokens, and every nav, banner and footer rule uses only these (no page tokens):

```
--nav-bg:#0F172A  --nav-raised:#1E293B  --nav-line:#334155  --nav-text:#CBD5E1
--nav-text-muted:#94A3B8  --nav-text-strong:#F8FAFC  --nav-mark:#F87171  --nav-control:#475569
```

- [ ] **Step 1: Implement `checkNav`.** It asserts the following, one violation per failed assertion:
  - `nav.css` starts with an `@import` containing `Source+Serif+4` and `text=`.
  - `.nav-brand-text` uses a font-family starting `'Source Serif 4'`.
  - The `.site-nav`, `.site-banner`, `.avg-footer` and `.nav-menu` blocks contain no `var(--color-`.
  - `.site-nav .nav-link:focus-visible` uses `var(--nav-text-strong)`.
  - `nav.js` and `favicon.svg` contain `#f8fafc` and not `#ece5d6`.
- [ ] **Step 2: Run** `node scripts/check-civic.mjs nav`. Expected: FAIL.
- [ ] **Step 3: Edit `nav.css` to the spec's section 3 table.**
  - Import: `@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,600&text=AmericanVisGud%20&display=swap');`
  - Wordmark: `.nav-brand-text` uses `font-family: 'Source Serif 4', Georgia, 'Iowan Old Style', serif; font-weight: 600`.
  - Bar: `.site-nav` uses `background: var(--nav-bg)`, a `border-bottom: 1px solid var(--nav-raised)`, and no shadow.
  - Links: `--nav-text`; on hover, `--nav-text-strong` text on a `--nav-raised` background.
  - Active link: white text on `--nav-raised`, with a 2px `--nav-mark` bottom bar drawn by an absolutely positioned `::after`. This doesn't shift the layout and needs no shadow.
  - Brand: the "Visa" span is `--nav-mark`.
  - Support link: `--radius-md`, a `--nav-control` border, and off-white text.
  - Banner: `--nav-raised`.
  - Mobile menu: a `--nav-bg` background with a `--nav-line` top border.
  - Toggle: a `--nav-line` border and `--nav-text` bars.
  - Skip link: off-white background, slate text, and `outline: 2px solid #991B1B`.
  - Footer: background `--nav-bg`, text `--nav-text`, muted `--nav-text-muted`, links `--nav-text-strong` and underlined, hover `--nav-mark`, `--nav-raised` hairlines.
- [ ] **Step 4: Run** `node scripts/check-civic.mjs nav shadow radius hex`. Expected: `ok` for all four.
- [ ] **Step 5: Re-render the OG image:** `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --hide-scrollbars --window-size=1200,630 --screenshot="$PWD/public/images/og-home.png" "file://$PWD/scripts/og-image-source.html"`. Then Read the PNG and confirm it shows the off-white tile on the new palette.
- [ ] **Step 6: Commit** with the message "Slate nav, banner and footer; Source Serif wordmark; refresh OG image".

### Task 7: Cache busting, browser verification, review gate

**Files:**
- Modify: every page's `?v=` for each CSS/JS file changed on this branch
- Create: screenshots in the session scratchpad (not the repo)

- [ ] **Step 1: Bump cache params.** For each file in `git diff --name-only main -- public/css public/js`, set `?v=20261024` on every reference in `public/**/*.html`. For `nav.js`, also check the loader in any shared JS. Verify with `grep -rhoE '(css|js)/[a-z-]+\.(css|js)\?v=[^"]+' public | sort | uniq -c`: every changed file shows only `v=20261024`.
- [ ] **Step 2: Run** `node scripts/check-civic.mjs all && node --test scripts/ && python3 -I -m unittest scripts/test_civic_palette_swap.py`. Expected: all pass.
- [ ] **Step 3: Browser pass.** Use `preview_start {name: "static-public"}` from the worktree root (point `--directory` at the worktree's `public`). For each of the 52 pages, at 1280 and 375 wide:
  - Run `document.documentElement.scrollWidth <= innerWidth`.
  - Check there are no console errors.
  - Confirm that `.site-nav`'s computed background is `rgb(15, 23, 42)`.

  Record the results as a table in the notes folder.
- [ ] **Step 4: Screenshot review set**, in light mode at both widths:
  - home, the `/guide` hub, `/guide/interview`
  - `/data`: chart colours unchanged and readable
  - `/interview-dates`, `/checklist-nvc`, `/i864-household-decision-tree`, `/news`
  - the 9 inline-`:root` pages (Review Focus 1)
- [ ] **Step 5: Keyboard check** on `index.html`, `guide/interview.html` and `about.html`:
  - Tab once: the skip link shows, with its red outline.
  - Tab into the nav: the yellow GOV.UK focus shows on the slate background.
  - The toggle at 375 shows its `#F8FAFC` outline.
- [ ] **Step 6: Error-label audit** (Review Focus 5). Grep the error and destructive classes in `components.css` and `design-system.css`, find the pages that render them, and list any that show colour without an icon or the word "Error".
- [ ] **Step 7: Print preview** (`emulateMedia print` or the print dialog screenshot) for `checklist-interview.html` and `interview-day-sheet.html`: black on white, no shadows.
- [ ] **Step 8: Commit** the cache bumps with the message "Bump asset versions for Civic Editorial".
- [ ] **Step 9: STOP.** Send Erin the screenshots, the overflow table and the error-label list. Do not push or merge. After she approves, update memory `avg-palette-cream-steel-blue` to describe Civic Editorial, and fix its stale `js/nav.js` path to `public/js/nav.js`.
