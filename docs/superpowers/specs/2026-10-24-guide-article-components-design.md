# Guide article components and live stat box: design

Date: 24 Oct 2026
Status: approved in brainstorming, awaiting spec review
Scope: pieces 1 and 2 of 4 (see §1)

## 1. Purpose and scope

Guide content is styled by three overlapping systems: `css/stage.css` (the 10
stage pages), `css/article.css` (about 10 standalone reference pages) and
`css/main.css`/`components.css`. The same ideas (page meta line, summary card,
task list, warning callout) exist under different class names with different
looks, and figures such as "about 2 weeks" are typed by hand.

The work is split into four pieces, each with its own spec, plan and build:

1. **Shared article components** (this spec): one stylesheet defining the
   header, summary, task list, checklist and callout patterns.
2. **Live stat box** (this spec): boxes that show community medians from
   `/api/data`, with author-written fallback text.
3. Stage page cleanup (later): move the 10 stage pages onto piece 1's classes
   and remove their inline `style=""` attributes.
4. Standalone article migration (later): move the `article.css` pages onto
   piece 1 and delete the duplicate rules.

Pieces 1 and 2 change no existing page's appearance except where §8 adds stat
boxes.

Not in scope: React, MDX, Tailwind or a build step. The site stays static HTML
with plain CSS and classic scripts.

## 2. Decisions taken

| Question | Decision |
|---|---|
| Framework | Plain CSS classes and a vanilla script, not a TSX component |
| Class vocabulary | Approach A: callouts keep `article.css` names (`.callout`, `.callout-warn`, `-alert`, `-info`, `-good`, `.callout-title`); header patterns take the stage layout under neutral names (`.article-meta`, `.article-summary`, `.article-actions`) |
| Reading measure | Unchanged: `readability.css` keeps 72ch, 17px phone / 18px tablet up, line-height 1.6 |
| Stat placement | Boxes in body text. The meta line keeps hand-typed official figures |
| Stat data | Only `stage_avgs` entries that carry `{ median, n }`, from an allowlist |
| Data loading | One site-wide loader, `js/community-stats.js`; the stepper moves onto it |

## 3. Opt-in scoping

Every component rule except the stat box is scoped under a root class,
`.guide-article`, which a page adds to its `<main>` when it migrates (pieces 3
and 4). Example: `.guide-article .checklist`.

This lets the shared stylesheet load anywhere without changing pages that
have not migrated: `stage.css` and `article.css` both define `.checklist`
differently, and an unscoped shared rule would silently restyle them.

`.stat-box` and `.stat-row` are not scoped, because nothing on the site uses
those names today and §8 places boxes on pages that have not migrated.

## 4. Files

| File | Change |
|---|---|
| `public/css/guide-article.css` | New. Components in §5 and §6. |
| `public/js/community-stats.js` | New. Pure helpers and the loader (§7). `window.AVGStats` in the browser, `module.exports` under Node. |
| `public/js/stat-box.js` | New. Finds `[data-stat]` boxes and fills them (§6). |
| `public/js/stepper-core.js` | `formatTag` uses `AVGStats.formatDuration`; `pickTags` and `parseCachedTags` are removed (moved into the shared loader). |
| `public/js/stepper.js` | Gets tags through `AVGStats.load()`; drops `sessionStorage['avg-step-tags']`. |
| `public/guide/medical.html`, `public/guide/interview.html` | Stat boxes (§8); load `guide-article.css`, `community-stats.js`, `stat-box.js`. |
| The 50 pages that load the stepper | Load `community-stats.js` before `stepper-core.js`; bump `stepper-core.js` and `stepper.js` `?v=`. |
| `test/community-stats.test.js` | New. |
| `test/stepper-core.test.js` | Updated for the moved helpers. |

**Load order on a page:**
1. The page's own stylesheet (`stage.css`, `article.css` or `main.css`).
2. `nav.css`, `stepper.css`.
3. `guide-article.css`.
4. `readability.css`, loaded last as it is today.

Scripts are `defer` in this order: `community-stats.js`, `stepper-core.js`,
`stepper.js`, `stat-box.js`, `nav.js`.

## 5. Shared components (piece 1)

All rules sit under `.guide-article` (§3). Colours come from tokens only,
using the stepper's three-way fallback chain (design-system names, then
`main.css` names, then `stage.css` names, then a Civic Editorial hex). No
shadows, no gradients, no uppercase.

| Pattern | Markup | Rules |
|---|---|---|
| Header | `<header class="article-header"><h1>…</h1> meta, summary</header>` | `h1` keeps the site heading style; 10px below it |
| Meta line | `<p class="article-meta"><span>⏱ Typical review 14 days</span><span>Reviewed <time datetime="2026-09-27">27 Sept 2026</time></span></p>` | Muted text, body size; spans separated by a `·` added in CSS; wraps cleanly |
| Summary card | `<div class="article-summary"><p><strong>…</strong> …</p>…</div>` | The first paragraph is the one-sentence summary and starts with a `<strong>` lead. Further paragraphs are optional ("You are here", "Do this first"). Surface background, 1px border, `--radius-md`, 3px left rule in `--color-mark` |
| Task list | `<ol class="article-actions">` with optional role pills | Numbered, generous spacing; role pills follow the existing role colour rules unchanged |
| Checklist | `<ul class="checklist">` | One rule replacing the two that differ today: a check mark before each item, a 1px divider between items, no divider after the last |
| Callouts | `<div class="callout callout-alert"><span class="callout-title">Barcode must match</span><p>…</p></div>` | Four variants, each a 1px border plus a 3px left edge: `-alert` (critical embassy rules that cause refusals: red family), `-warn` (cautions: amber), `-info` (slate), `-good` (sage). `.callout-title` is bold, body size. Text inside every callout is body size; today's 0.895rem is not kept |

**Text label rule.** Colour is never the only signal. Each callout has a
visible `.callout-title`, and authors write the title so it says what kind of
callout it is ("Refused if…", "Check before you book").

## 6. Stat box (piece 2)

**Markup.** The author writes the fallback; the script upgrades it.

```html
<div class="stat-row">
  <div class="stat-box" data-stat="medical_to_interview_med">
    <p class="stat-box__value">About 2 weeks</p>
    <p class="stat-box__label">From medical to interview</p>
    <p class="stat-box__source">Community estimate</p>
  </div>
</div>
```

**Upgraded state.** When valid data is available:
- `.stat-box__value` becomes `AVGStats.formatDuration(median)`, for example "~2 wks".
- `.stat-box__source` becomes "Median of N member timelines · " followed by a link
  to `/data` reading "how we count".
- `.stat-box__label` is never changed.
- The box gets the class `stat-box--live`.

**Look.**
- `.stat-box`: 1px `--color-border`, surface background, `--radius-md`, padding 12px 16px.
- `__value`: Public Sans 600, 1.5rem, tabular lining figures.
- `__label`: body size.
- `__source`: 14px, muted.
- `.stat-row`: flex with wrap, gap 12px; boxes `flex: 1 1 200px`; one column under 640px.
- `.stat-box` has a fixed `min-height`, so swapping in live text causes no layout shift.

**Script (`stat-box.js`).**
- On `DOMContentLoaded`, if any `.stat-box[data-stat]` exists, call
  `AVGStats.load()` and fill each box.
- If no box exists, do nothing and make no request.
- A key not in the allowlist logs `console.warn('stat-box: unknown key', key)`,
  and its fallback stays.

**Accessibility.** The box is plain text, with no live region: the update
happens without the reader doing anything, and announcing it would interrupt
them. The link in the source line is a normal underlined link.

## 7. Shared data loader (`community-stats.js`)

```
STAT_KEYS: string[]          // allowlist, §7.1
MIN_N = 5                    // matches MIN_TREND_N in api/data.js
isStat(stat) -> boolean      // finite number median > 0 and finite number n
formatDuration(days) -> string  // "~N days" below 14, "~N wks" (Math.round(days / 7)) from 14
pickStats(apiData) -> { [key]: {median, n} | null }   // only STAT_KEYS; invalid entries become null
parseCachedStats(raw) -> object | null                  // every STAT_KEYS key present, each null or isStat
usable(stat) -> boolean      // isStat(stat) && stat.n >= MIN_N
load() -> Promise<object|null>  // browser only
```

`load()` works like this:
- It reads `sessionStorage['avg-stage-stats']` through `parseCachedStats`.
- Otherwise it fetches `/api/data` once per page. Concurrent callers share
  one in-flight promise. It stores the `pickStats` result with `JSON.stringify`.
- It resolves `null` on any failure and never rejects.
- Every storage access is wrapped in try/catch.

### 7.1 Allowlist

`pd_to_approval_med`, `approval_to_welcome_med`, `welcome_to_fees_med`,
`fees_to_docs_med`, `docs_to_dq_med`, `approval_to_dq_stats`,
`il_to_medical_med`, `medical_to_interview_med`, `interview_to_passport_med`.

These are the `stage_avgs` entries built by `stageStats()` in `api/data.js`,
which return `{ avg, median, min, max, n }`. Only `median` and `n` are kept.

### 7.2 Stepper changes

- `stepper-core.formatTag(stat)` keeps its output exactly:
  - "~5 wks typical · 154 members"
  - "~9 days typical · 12 members"
  
  It builds the duration part with `AVGStats.formatDuration` and the threshold
  with `AVGStats.usable`. It reaches them through `window.AVGStats` in the
  browser and `require('./community-stats.js')` under Node.
- `stepper.js` calls `AVGStats.load()` and reads `stats[step.statKey]`.
- Removed: `TAGS_KEY` / `avg-step-tags`, and `stepper-core.pickTags` /
  `parseCachedTags`, along with their tests. Equivalent tests move to
  `community-stats.test.js`.
- `pickStats` stores `null` for any entry that fails `isStat`. This also fixes
  the deferred stepper minor where a non-numeric median made the cache refetch
  on every page view.

## 8. First use

- `/guide/medical`: one box, `il_to_medical_med`, label "From interview letter to medical",
  fallback "About 6 weeks". It goes directly after the first paragraph of
  `section#medical`.
- `/guide/interview`: a `.stat-row` with two boxes:
  - `medical_to_interview_med`, label "From medical to interview", fallback "About 2 weeks"
  - `interview_to_passport_med`, label "From interview to passport back", fallback "About 5 days"
  
  The row goes directly after the first paragraph of `section#interview`.

The fallback values are the 24 Oct 2026 production medians (6, 2 weeks;
5 days), so readers without JavaScript see the same figures.

## 9. Failure cases

| Situation | Result |
|---|---|
| JS off | Author fallback text shows; stepper absent as today |
| `/api/data` 503, 404, network error, slow | Fallback stays; stepper shows no tags; no uncaught errors |
| Stat `null`, `n < 5`, median 0, negative, non-number | Fallback stays for that box |
| Unknown `data-stat` key | Fallback stays; one `console.warn` naming the key |
| Corrupt or wrong-shape `avg-stage-stats` cache | Ignored; refetched once |
| Page with stepper and stat boxes | Exactly one `/api/data` request |
| Page without stat boxes or stepper | No request |

## 10. Testing

**Unit (`npm test`), `test/community-stats.test.js`:**
- `isStat` and `usable`: medians 0, -3, null, '20', NaN rejected; `n` 4 not usable, 5 usable.
- `formatDuration`: 9 gives "~9 days", 13 gives "~13 days", 14 gives "~2 wks", 35 gives "~5 wks".
- `pickStats`:
  - keeps only allowlisted keys
  - drops `avg`/`min`/`max`
  - turns an invalid entry into `null`
  - a missing key becomes `null`
- `parseCachedStats`: invalid JSON, an array, a missing key or a bad entry gives `null`; a valid object round-trips.

**Unit, `test/stepper-core.test.js`:** `formatTag` output is unchanged for the
existing cases (9, 13, 14, 35 days; `n` 4 hidden).

**Browser (preview server):**
- Stat boxes on `/guide/medical` and `/guide/interview`:
  - fallback text shows with the API unavailable
  - stubbed data upgrades the value and source line and keeps the label
  - at 375px the row stacks to one column with no horizontal overflow
  - box height does not change when data arrives
- `/guide/interview` with stepper and boxes: the network panel shows one `/api/data` request.
- A page with neither feature (`/news`): no request.
- Stepper tags still render from the shared cache on another page in the same visit.
- `guide-article.css` loaded on a page without `.guide-article`: no visual
  change. Compare the `.checklist` computed style before and after on
  `/guide/medical`.

## 11. Known effects

- Every stepper page loads one more small script (`community-stats.js`).
- Pieces 3 and 4 inherit the `.guide-article` opt-in: migrating a page means
  adding that class and switching its markup to §5's classes.
