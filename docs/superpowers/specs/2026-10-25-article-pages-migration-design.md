# Article pages onto guide-article components: design

Date: 25 Oct 2026
Status: approved in brainstorming, awaiting spec review
Scope: piece 4 of 4 (see `2026-10-24-guide-article-components-design.md` §1)

## 1. Purpose

Move the standalone article and tool pages onto the shared
`guide-article.css` components, as piece 3 did for the stage pages, and
retire `css/article.css`.

`article.css` holds two kinds of style today:
- **article components**, which duplicate what `guide-article.css` now
  provides
- **tool and form components**, which have no shared home

Four pages also embed their own copy of the article styles.

**Pages (14):** `221g-sheet`, `221g`, `administrative-processing`,
`delayed-i130-remedies`, `domicile`, `history-worksheet`, `interview-dates`,
`interview-day-sheet`, `interview-templates`, `interview`, `mandamus-pro-se`,
`public-charge-statement`, `reinterview`, `visa-pause` (all `public/<name>.html`).

**Not in scope:**
- `/i864-household-decision-tree`: 4 of its 131 selectors come from
  `article.css`; it is its own tool.
- Wording changes.
- New content.
- Anchor ID changes.
- The tools' behaviour.

## 2. Decisions taken

| Question | Decision |
|---|---|
| Tool and form styles | Move unchanged into a new `css/tools.css`, loaded only by pages that use them; delete `article.css` |
| Page opening | `<header class="article-header">` wraps eyebrow, `h1` and lead; the lead stays a plain, larger intro paragraph (not the summary card) |
| Rollout | Two phases in one branch: phase 1 rehomes styles with zero visible change (proved by computed-style snapshots); phase 2 applies the new look |
| Look | Phase 2 adopts the shared component look, as on the stage pages |

## 3. Where each article.css section goes

| article.css section | Classes | Phase 2 destination |
|---|---|---|
| Layout | `page-wrap` | `guide-article.css`, scoped as `.guide-article .page-wrap` |
| Hero | `eyebrow`, `lead` | `.article-eyebrow`, `.article-lead` (renamed), inside `header.article-header` |
| Disclaimer | `disclaimer` | `guide-article.css`, scoped, same name |
| Section headings | element rules under `.page-wrap` | `guide-article.css`, scoped |
| On this page | `toc`, `toc-title`, `to-contents` | `guide-article.css`, scoped, same names |
| Figures and tables | `table-wrap` | Renamed to piece 3's `.table-card`; the `<table>` inside gets `.article-table` |
| Sheet grid | `sheet-grid` | `guide-article.css`, scoped, same name |
| Stage and mitigation cards (`/221g` only) | `stage-card`, `stage-head`, `stage-pill`, `stage-title` | Renamed `.step-card`, `.step-card-head`, `.step-pill`, `.step-title` |
| Callouts | `callout`, `callout-*`, `callout-title` | Already in `guide-article.css`; pages opt in, no rename |
| Key dates | `keydates`, `keydate` | `guide-article.css`, scoped |
| Voices | `voices`, `voice`, `voice-who`, `voice-what` | Already in `guide-article.css` |
| Provenance, sources, back to guide | `provenance`, `sources`, `guide-return` | `guide-article.css`, scoped |
| Checklist | `checklist` | Already in `guide-article.css` |
| Situation chooser, step list | `chooser`, `chooser-card`, `chooser-card--warn`, `chooser-card--alert`, `steps` | `guide-article.css`, scoped |
| **Tool forms and results** | `tool`, `field`, `field-row`, `check`, `btn`, `btn--ghost`, `btn-row`, `results` (and its `li.ok`, `li.warn`, `li.bad`), `output` | **`css/tools.css`, verbatim, unscoped** |
| Utilities | `sr-only`, `no-print` | `guide-article.css`, unscoped |
| Print overrides | `.no-print, .site-nav, .avg-footer, .page-live-notice, .pause-glossary, .btn-row { display: none !important }` (article.css line 499) | `print.css` (`.no-print`, `.site-nav`, `.avg-footer`, `.page-live-notice`, `.pause-glossary`) and `tools.css` (`.btn-row`) |
| `:root` tokens in article.css | `--ink`, `--muted`, `--line`, `--warn-*`, `--danger-*`, `--sage-*` and others | Phase 1: copied into `tools.css` only where tool rules use them. Phase 2: page content uses `--ga-*` |

**Pages that load `tools.css`** (they use tool classes): `221g-sheet`,
`history-worksheet`, `interview-dates`, `interview-day-sheet`,
`interview-templates`, `public-charge-statement`.

**Embedded `<style>` blocks:**
- **Removed entirely** on `221g`, `administrative-processing` and `visa-pause`
  (pure copies of `article.css`).
- **Cut down** on `delayed-i130-remedies` to its 26 page-only selectors
  (`.badge*`, `.copy-btn*`, `.remedy-*`, …).
- **Kept as they are** on `history-worksheet` (4 lines),
  `interview-day-sheet` (17), `mandamus-pro-se` (14) and
  `public-charge-statement` (14). These are page-specific.

## 4. Phase 1: rehome with zero visible change

1. **Baseline.** On the branch's preview server, for each of the 14 pages at
   1280px and 375px, with every `<details>` and accordion open, record the
   computed `display`, `position`, `box-sizing`, `width`, `height`,
   `margin-*`, `padding-*`, `border-*-width/style/color`, `color`,
   `background-color`, `font-family`, `font-size`, `font-weight`,
   `line-height`, `text-decoration-line`, `gap` and `grid-template-columns`
   of every element in `<main>`. The result is a JSON snapshot keyed by page,
   width and element index.
2. **Create `css/tools.css`** from the tool rules of `article.css`, verbatim,
   plus the `:root` tokens they use. Tool pages load
   `/css/tools.css?v=20261025c` after `article.css`. The duplicates stay in
   `article.css` until phase 2, so non-tool pages are untouched.
3. **Replace embedded copies.** On `221g`, `administrative-processing` and
   `visa-pause`, delete the embedded `<style>` and link
   `/css/article.css?v=20261025c`. On `delayed-i130-remedies`, link it and
   keep only the 26 page-only selectors in its `<style>`.
4. **Move the print overrides** into `print.css` and `tools.css` (§3).
5. **Re-snapshot and diff** against step 1. The diff must be empty for all 14
   pages at both widths. Any difference is fixed before phase 2.

Phase 1 ends in its own commits, and the branch could ship at that point.

## 5. Phase 2: restyle

1. **Snapshot IDs.** Save each page's IDs, in document order, to
   `test/fixtures/article-ids.json` before any phase 2 edit.
2. **Opt-in and assets:**
   - Each page's `<main class="page-wrap" …>` becomes
     `<main class="page-wrap guide-article" …>`. Every one of the 14 pages
     uses `<main class="page-wrap">`.
   - Every page loads `/css/guide-article.css?v=20261025c` before
     `readability.css`. Tool pages keep `tools.css`. No page links
     `article.css`.
   - Phase 2 changes `guide-article.css`, so the 12 stage pages that already
     load it are bumped from `?v=20261025b` to `?v=20261025c` in the same
     commit.
3. **Markup mapping.** Apply §3:
   - Wrap eyebrow, `h1` and lead in `header.article-header`.
   - Rename `eyebrow` → `article-eyebrow`, `lead` → `article-lead`,
     `table-wrap` → `table-card` (with `article-table` on its table), and
     `stage-card*` → `step-card*`.
   - "Reviewed/Updated D Mon YYYY" text in the hero gets
     `<time datetime>`, as on the stage pages.
4. **Inline styles** (about 86 across the 14 pages):
   - Spacing declarations may be deleted only if they are `margin*`, OR they
     are `padding*`/`gap` and the element now carries a component class that
     defines its own padding or gap.
   - Everything else maps to a shared class, or stays inline on the allowlist.
   - The target is fewer than 10 allowlist entries.
5. **New `guide-article.css` rules** for the classes in §3 not yet defined
   there: `page-wrap`, `article-eyebrow`, `article-lead`, `disclaimer`,
   `toc*`, `to-contents`, `sheet-grid`, `step-card*`, `keydates`, `keydate`,
   `provenance`, `sources`, `guide-return`, `chooser*`, `steps`, `sr-only`,
   `no-print`. They use `--ga-*` tokens; there are no shadows, gradients or
   uppercase; and the smallest text is 14px.
6. **Delete `css/article.css`** once `grep -r "article.css" public` finds
   nothing outside comments.

## 6. Safety

- **Text unchanged.** Run the piece 3 text check (main versus working copy,
  tags stripped, entities decoded) after every phase 2 step. The only
  expected differences are removed empty icon spans and new `<time>`
  wrappers.
- **IDs frozen.** Checked by the snapshot and by the guard.
- **Spacing pairing.** After the inline-style step, pair each element's
  removed `padding`/`gap` with its new classes, and list any element that
  lost spacing without a class that supplies it. The list must be empty.
- **Clipping at 375px.** Check inside callouts, panels, voices, table cards,
  `<details>` and accordions, not only page width. Zero clipped elements.
- **Tools work.** Check after phase 1 and again after phase 2:
  - `/interview-dates`: entering an interview and medical date renders the
    results list with its `ok`/`warn`/`bad` items styled.
  - `/public-charge-statement`: toggles change state.
  - `/interview-templates`: copy buttons copy.
  - `/history-worksheet` and `/221g-sheet`: fields accept input, and the
    output and print controls render.
- **Caching.** `article.css` can be deleted safely: HTML is revalidated on
  every request, so no fresh page references the deleted file. The
  `/css/*` immutable cache only affects files that still exist.

**Permanent guard:** `test/article-pages.test.js` in `npm test`, for each of
the 14 pages:
1. No reference to `/css/article.css`.
2. None of these class tokens: `eyebrow`, `lead`, `table-wrap`,
   `stage-card`, `stage-head`, `stage-pill`, `stage-title`.
3. `<main>` carries `guide-article`, and `guide-article.css` loads before
   `readability.css`.
4. A page using any of `tool`, `field`, `field-row`, `check`, `btn`,
   `results` or `output` links `tools.css`.
5. Inline styles, in any quoting, appear only in
   `test/fixtures/article-inline-allowlist.json`.
6. `<style>` blocks appear only on `delayed-i130-remedies`,
   `history-worksheet`, `interview-day-sheet`, `mandamus-pro-se` and
   `public-charge-statement`.
7. IDs equal `test/fixtures/article-ids.json`.

A cross-page test checks one `?v=` build each of `guide-article.css` and
`tools.css` across the 14 pages. The `guide-article.css` version must equal
the version the 12 stage pages request (`20261025c` after phase 2).

## 7. Verification

- `npm test` passes: both guards and the earlier suites.
- Phase 1: the computed-style diff is empty (§4.5), and the tools work.
- Phase 2, in the browser on the preview server:
  - all 14 pages at 1280px and 375px: no page overflow, no clipped elements
    (§6), and the new components render with their padding and gaps
  - the tools work
  - deep links to an ID inside a `<details>` or accordion on `/221g` and
    `/reinterview` land below the sticky stack
- The PR description links to the preview for `/interview`, `/221g` and
  `/interview-dates`.
