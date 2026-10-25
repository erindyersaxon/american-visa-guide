# /data: wait times by phase: design

Date: 25 Oct 2026
Status: approved in brainstorming, awaiting spec review
Scope: pieces 1 and 2 of the /data overhaul

## 1. Purpose and scope

The /data dashboard should answer "how long is each step taking now" at a
glance. It should use high-contrast metric cards grouped by phase, show the
median with the 25th–75th percentile range instead of an average, and say how
many submissions back it.

The overhaul is split into four pieces, each with its own spec, plan and PR:

1. **API** (this spec): every phase gets robust statistics (median, p25, p75,
   n, sample flags) over a recent rolling window, published as an ordered
   `phases` list.
2. **Phase cards and freshness badge** (this spec): a "Wait times by phase"
   card grid near the top of /data replaces the stage-by-stage table, plus
   the freshness badge.
3. London tracker sections (later): pipeline status, letter drops, DQ
   backlog, scheduling, trends, outcomes, passport times and the calculator.
   Remove the repetition, turn the remaining charts into cards, and shorten
   the page.
4. National Picture (later): the 15,700px official-data section. Move it to
   its own page or collapse it.

**Not in scope:**
- end-to-end spans such as DQ → passport (decided: steps only)
- priority date → I-130 approval (§3)
- any change to the existing `intervals`, `stage_avgs`, `trends` or
  `key_stats` fields
- other /data sections

**Standing rule for all four pieces:** IL Drop History stays a table in every
piece. Later pieces may restyle it, but not convert it to cards or remove
columns. It is a comparison table read across rows (drop date, day, time, DQ
dates covered, interview dates, gap since previous, ILs issued) and down drops.

## 2. Decisions taken

| Question | Decision |
|---|---|
| Statistic | Median (p50) with 25th–75th percentile range and n. No means. |
| Time basis | The rolling recent window the three headline intervals already use: 180 days, widened to 270, 365, 545, 730 days, then all-time, until at least 30 completed cases |
| Phases | Single steps only, no end-to-end spans |
| Where the list lives | API: `phases` in `/api/data`, ready to render (approach A) |
| Card component | The existing `.stat-row` / `.stat-box` from `guide-article.css` |
| Badge count | `meta.total_members` (members after de-duplication; the query is already limited to the London embassy) |

## 3. Phases

In display order, grouped:

| group | key | label | from → to | rows | cap (days) |
|---|---|---|---|---|---|
| `nvc` | `approval_to_welcome` | I-130 approval → NVC welcome letter | `i130_approval` → `nvc_welcome_letter` | `deduped` | 90 |
| `nvc` | `welcome_to_fees` | Welcome letter → fees paid | `nvc_welcome_letter` → `nvc_fees_paid` | `deduped` | 90 |
| `nvc` | `fees_to_docs` | Fees paid → documents submitted | `nvc_fees_paid` → `nvc_docs_submitted` | `deduped` | 180 |
| `nvc` | `docs_to_dq` | Documents submitted → DQ | `nvc_docs_submitted` → `dq_date` | `deduped` | 180 |
| `waiting` | `dq_to_il` | DQ → interview letter | the existing `intervals.dq_to_il` | `standard` | none (as today) |
| `waiting` | `il_to_interview` | Interview letter → interview | the existing `intervals.il_to_interview` | `standard` | none (as today) |
| `interview` | `il_to_medical` | Interview letter → medical | `interview_letter` → `medical` | `standard` | 180 |
| `interview` | `medical_to_interview` | Medical → interview | `medical` → `interview` | `standard` | 60 |
| `after` | `interview_to_passport` | Interview → passport back | the existing `intervals.interview_to_passport` | `deduped` | none (as today) |

**Group labels:**
- `nvc`: "NVC"
- `waiting`: "Waiting for your interview"
- `interview`: "Interview stage"
- `after`: "After the interview"

**Row sets.** These are the existing definitions in `api/data.js`.
- `deduped`: latest submission per member.
- `standard`: `deduped` without expedited interviews.

**Caps.** These are today's `stageStats` caps. They drop impossible values
(data-entry errors) and are not outlier trimming.

**Left out: priority date → I-130 approval.** USCIS largely stopped deciding
consular I-130s from February 2025, so a recent median would describe a queue
that no longer moves.

## 4. API (piece 1)

**New module: `api/_lib/phases.js`** (ES module, like `api/data.js`). The
leading underscore keeps Vercel from deploying it as an endpoint.

```
PHASES: Array<{ key, group, label, from, to, rows: 'deduped'|'standard', cap: number|null }>
GROUPS: Array<{ key, label }>
robustStats(values: number[]) -> { n, median, p25, p75, p90, min, max, suppressed, small_sample }
rollingWindow(rows, cohortField, valueFn, filterFn, now: Date) -> robustStats(...) & { window_days: number|null }
buildPhases({ deduped, standard }, { now = new Date(), daysBetween }) -> Array<{
  key, group, label, median, p25, p75, n, window_days, suppressed, small_sample }>
```

**Moving the shared helpers.** `robustStats` and `rollingWindow` move out of
`api/data.js` into the module unchanged, apart from taking `now` as a
parameter for testability. `api/data.js` imports them, so the existing
`intervals` keep exactly their current values.

**How each phase is computed.**
- **Cohort and values.** The cohort field is the phase's `from` milestone.
  The value is `daysBetween(from, to)`. Only rows with both dates and a value
  in `(0, cap]` count (no upper bound when `cap` is null).
- **Headline intervals reused.** For `dq_to_il`, `il_to_interview` and
  `interview_to_passport`, `buildPhases` copies the statistics from the
  existing `intervals` object. They are not recomputed, so a card and a
  headline stat can never disagree.
- **Response.** `/api/data` adds a top-level `phases` (the array above) and
  `phase_groups` (`GROUPS`). No existing field changes.
- **Suppression** uses `robustStats`' existing thresholds:
  - `suppressed` when n < 10
  - `small_sample` when n < 30

## 5. Page (piece 2)

**New file: `public/js/phase-cards.js`.** It exposes `window.AVGPhaseCards`
in the browser and `module.exports` under Node.

```
formatDays(days: number) -> "86 days" | "1 day"
formatMonths(days: number) -> "≈ 2.9 months"   // shown only when days >= 60
cardView(phase) -> { value: string, source: string, flags: string[] }
render(container: HTMLElement, phases, groups) -> void
```

**`cardView` text:**
- **value:** `formatDays(median)`. When `suppressed` or the median is null,
  the value is "Not enough reports yet".
- **source:** the parts below, joined with " · ":
  - "most: {p25}–{p75} days" (left out when suppressed)
  - "{formatMonths(median)}" (only when median >= 60 and not suppressed)
  - "{n} members"
  - the window: "last 6 months", "last 9 months" or "last 12 months" for 180,
    270 and 365 days; "last 18 months" and "last 2 years" for 545 and 730;
    "all reports" for null
  - "small sample" when `small_sample` and not suppressed
- The label is the phase label.

**`render` output.** One `<h3 class="phase-group">` per group that has
phases, each followed by a `<div class="stat-row">` of
`<div class="stat-box" data-phase="{key}">` with `.stat-box__value`,
`.stat-box__label` and `.stat-box__source`. It is built with DOM methods, not
`innerHTML` from data.

**Changes to `public/data.html`:**
- **New section.** `<section aria-labelledby="phases-hd">` with
  `<h2 id="phases-hd" class="section-hd__title">Wait times by phase</h2>`, a
  one-line intro ("Median days for each step, with the range most members
  fall within."), and `<div id="phase-cards">`. It goes immediately after the
  top metrics block and before "Pipeline Status".
- **Removed.** The "Median Stage-by-Stage Timings" section and its
  `timing-tbody` renderer.
- **New stylesheets and scripts.**
  - Load `/css/guide-article.css?v=20261025c` before `readability.css`, for
    `.stat-row` / `.stat-box`.
  - Load `/js/phase-cards.js?v=20261025d` (deferred).
  - Add a small `.phase-group` rule in the page: heading spacing only.
- **Boot.** After data loads, call
  `AVGPhaseCards.render(document.getElementById('phase-cards'), d.phases, d.phase_groups)`.
- **Freshness badge.** The element that today shows "Community data from N
  members in the London pipeline." becomes a muted pill:
  - Live data: "Updated continuously from {N} London Embassy applicant
    submissions." N is `meta.total_members`, written with en-GB thousands
    separators.
  - Fallback snapshot: "From {N} London Embassy applicant submissions
    (snapshot)."
- **Fallback.** The `FB` snapshot gains `phases` and `phase_groups`, copied
  from production `/api/data` when this ships.

**Accessibility:**
- Group headings are real `h3`s under the section `h2`.
- Every card states its unit in words ("days", "members"); none relies on
  colour.
- The badge is plain text, not a live region.

## 6. Failure cases

| Situation | Result |
|---|---|
| `/api/data` down or slow | `FB` snapshot cards render; the badge says "(snapshot)"; the existing notice shows |
| A phase with n < 10 | Card shows "Not enough reports yet" and "{n} members" |
| An old cached `FB` without `phases` | The section shows its intro and "Phase timings are temporarily unavailable." |
| A phase missing from the response | Its card is not rendered; the group heading is skipped if empty |

## 7. Testing

**Unit (`npm test`), new `test/phases.test.js`.** It loads the ES module with
`await import()`.
- `robustStats` on [1..10] gives median 6, p25 3, p75 8 (linear
  interpolation, rounded, matching today's function). `suppressed` is true
  below 10 and `small_sample` true below 30.
- `rollingWindow`:
  - with 40 cases in the last 180 days → `window_days` 180
  - with 12 in 180 days but 35 in 365 → 365
  - with fewer than 30 at every step → `null` (all reports)
- `buildPhases` with fixture rows:
  - order and groups match §3
  - a value above the cap is excluded
  - a value of 0 or less is excluded
  - `dq_to_il`, `il_to_interview` and `interview_to_passport` equal the
    passed-in `intervals` objects field for field
- The existing `intervals` output is unchanged after the refactor. A fixture
  comparison, run before the move, is part of the plan.

**Unit, new `test/phase-cards.test.js`:**
- `formatDays(1)` → "1 day"; `formatDays(86)` → "86 days".
- `formatMonths(86)` → "≈ 2.8 months" (86 / 30.44, one decimal).
- `cardView` for a normal phase, a suppressed phase, a small sample and each
  window value.

**Browser (preview server):**
- With a seeded `/api/data` response (the local server has no API), the
  cards render in four groups.
- The fallback path renders from `FB` with "(snapshot)".
- At 375px the cards stack with no overflow, and nothing is clipped inside a
  card.
- The stage-by-stage table is gone.

**After deploy:**
- Production `/data` shows live cards.
- The badge count matches `meta.total_members`.
- The three repeated intervals match the headline stats lower on the page.
