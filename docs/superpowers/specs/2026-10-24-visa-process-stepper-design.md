# Visa Process Stepper: design

Date: 24 Oct 2026
Status: approved in brainstorming, awaiting spec review

## 1. Purpose

Readers on the London immigrant-visa path should see, on every visa-process
page, which of four broad steps they are on and roughly how long each step
takes for community members. The stepper is a progress marker the reader sets
for themselves; the site has no accounts and does not infer it.

Out of scope: per-user timelines, syncing across devices, the DQ to
interview-letter wait (covered by `/interview-dates`), and any change to the
ten guide stage pages themselves.

## 2. Decisions taken

| Question | Decision |
|---|---|
| Framework | Vanilla JS and CSS, no React or TSX. The site is static HTML. |
| Where `currentStep` comes from | The reader picks it; stored in `localStorage` |
| Which pages | Visa-process pages only (allowlist, §5) |
| Mounting | Approach A: `js/nav.js` mounts it, list of pages lives in `js/stepper.js` |
| Timeframe data | `/api/data` `stage_avgs`, never a browser Supabase client |
| API load | Add a 10-minute CDN cache to `/api/data`, plus a per-visit `sessionStorage` cache |
| Styling | Design tokens only, so it follows whichever palette ships (Civic Editorial is being designed separately) |

## 3. Steps

| # | Label (full / short) | Links to | Tag source (`stage_avgs`) |
|---|---|---|---|
| 1 | NVC & Form DS-260 / NVC & DS-260 | `/guide/nvc` | `approval_to_dq_stats` |
| 2 | Medical exam (VisaMedicals) / Medical | `/guide/medical` | `il_to_medical_med` |
| 3 | Interview prep & embassy interview / Interview | `/guide/interview` | `medical_to_interview_med` |
| 4 | Visa approval & passport courier / Visa & courier | `/guide/after-interview` | `interview_to_passport_med` |

Each `stage_avgs` entry is `{ avg, median, min, max, n }` or `null`.

The four medians are not a full timeline: the DQ to interview-letter wait sits
between steps 1 and 2 and is not shown. No UI sums the tags.

## 4. Files

| File | Change |
|---|---|
| `public/js/stepper-core.js` | New. Pure functions, no DOM: step definitions, status per step, parse/clear the stored value, tag formatting and hide rules, the page allowlist. Exposes `window.AVGStepperCore` in the browser and `module.exports` under Node. |
| `public/js/stepper.js` | New. DOM rendering, events, storage, the `/api/data` fetch and `sessionStorage` cache. Exposes `window.AVGStepper.mount(nav)`. |
| `public/css/stepper.css` | New. All stepper styles, tokens only. |
| `public/js/nav.js` | `mount()` calls `window.AVGStepper.mount(nav)` after `mountBanner`, when present. |
| `public/css/nav.css` | Define `--sticky-offset` and `html { scroll-padding-top }` (§7). |
| `public/css/stage.css` | `.section { scroll-margin-top }` (line 368) uses `calc(var(--sticky-offset) + 8px)` instead of `72px`. |
| `public/css/print.css` | `.visa-stepper { display: none }`. |
| `api/data.js` | `res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600')` on success responses only. |
| Every page loading `nav.js` (50 today, `?v=20261023`) | Add `stepper-core.js`, `stepper.js` and `stepper.css` tags before `nav.js`; bump `nav.js`, `nav.css` and, where loaded, `stage.css` and `print.css` `?v=`. |
| `test/stepper-core.test.js` | New, `node:test`. |
| `package.json` | `"test": "node --test test/"`. |

The three new files load on all 50 pages so the allowlist stays the only
switch; on pages outside it `mount()` returns without touching the DOM.

## 5. Page allowlist

Matched on `location.pathname` with clean URLs (`cleanUrls: true`,
no trailing slash), so `/guide/nvc`, not `/guide/nvc.html`. Also accept the
`.html` form for local preview.

Shown on:
`/`, `/guide`, `/guide/*` (all stage pages), `/checklists`, `/checklist-*`,
`/master-checklist`, `/tracker`, `/tools`, `/worksheet-ds260`,
`/worksheet-i864`, `/i864-household-decision-tree`, `/public-charge`,
`/public-charge-statement`, `/domicile`, `/interview`, `/interview-dates`,
`/interview-questions`, `/interview-day-sheet`, `/interview-templates`,
`/221g`, `/221g-sheet`, `/administrative-processing`, `/reinterview`, `/data`.

Not shown: `/naturalization`, `/life`, `/news`, `/about`, `/privacy`,
`/glossary`, `/english-test`, `/history-worksheet`, `/workbook`,
`/visa-pause`, `/september-2026-update`, `/mandamus-pro-se`,
`/delayed-i130-remedies`, the 404 page.

The list is a constant in `stepper-core.js`; changing it needs no HTML edits.

## 6. Behaviour

**State.** `localStorage['avg-step']` holds `"1"` to `"4"`. Reads and writes
are wrapped in try/catch. Any other stored value is treated as unset and
removed.

**Status per step**, for saved step `s`: steps below `s` are Completed, step
`s` is In progress, steps above are Upcoming. With no saved step, every step is
neutral (no badge) and the bar shows "Where are you? Pick your step".

**Choosing.** Each step has a "This is me" button (desktop: shown on hover and
focus, and always for the unset state; mobile: in the expanded list). Choosing
saves, re-renders, and announces "Saved: you're on step N" in a polite live
region. A "Change" button next to the In progress step clears the choice.

**Links and buttons are separate controls.** The step label is a link to its
guide page; the choose button is its own `<button>`.

**Desktop (≥768px).** A horizontal bar of four steps joined by connectors, each
with its badge and timeframe tag. 768 to 1024px uses short labels; full labels
are kept in the accessible name.

**Mobile (<768px).** A collapsed 44px row, "Step 2 of 4: Medical exam ▾", or
"Where are you in the process? ▾" when unset. Expanding shows the four steps as
a vertical list with badges, tags and choose buttons, pushing content down
(not overlaying). Escape collapses and returns focus to the toggle.

**Pulse.** The In progress dot gets a soft ring animation, about 2.5s per
cycle, 3 iterations, inside `@media (prefers-reduced-motion: no-preference)`.
Status is never carried by motion or colour alone: the badge word is always
present.

## 7. Visual and layout

Tokens only (`var(--color-*)`, `--radius-*`, `--font-*`). No shadows,
gradients or decorative icons. Under the Civic Editorial palette:

- Bar on `--color-bg` with a 1px `--color-border` bottom border, under the
  slate nav.
- Completed: filled `--color-navy` circle with ✓, muted label, "Completed" badge.
- In progress: `--color-navy` ring with the pulse, bold label, "In progress"
  badge, and a 2px rule beneath the step in
  `var(--color-mark, var(--color-gold))`: the single red mark under Civic
  Editorial, steel blue until that token exists.
- Upcoming: hollow ring in `--color-border-strong`, `--color-text-muted`
  label, "Upcoming" badge.
- Connectors: 1px; `--color-navy` between completed steps, `--color-border`
  ahead.
- Badges and tags: `--font-ui`, about 13px, `--radius-sm`, tabular numerals.

**Sizes.** Desktop bar 56px; mobile collapsed row 44px.

**Sticky stacking.** `.site-nav` is `position: sticky; top: 0; height: 64px`.
The stepper is inserted as the nav's next sibling with `position: sticky;
top: 64px; z-index: 99`.

```css
:root { --sticky-offset: 64px; }
html.has-stepper { --sticky-offset: 120px; }          /* 64 + 56 */
@media (max-width: 767px) {
  html.has-stepper { --sticky-offset: 108px; }        /* 64 + 44 */
}
html { scroll-padding-top: calc(var(--sticky-offset) + 8px); }
```

`stepper.js` adds `has-stepper` to `<html>` when it mounts. The expanded
mobile list is not sticky; only the collapsed row is.

## 8. Timeframe tags

- Format: median days as weeks when ≥14 days ("~5 wks typical"), otherwise
  days ("~9 days typical"), then "· N members".
- Hidden when the entry is `null`, `n < 5` (matching the API's `MIN_TREND_N`),
  or the data could not be loaded.
- The tag line reserves its height so tags arriving late cause no layout jump.
- Fetch `/api/data` once per visit; cache the four `{ median, n }` values in
  `sessionStorage['avg-step-tags']`. The bar renders immediately and fills tags
  when data arrives.

## 9. Accessibility

- `<nav aria-label="Your visa progress">` containing an `<ol>`.
- `aria-current="step"` on the In progress item.
- Accessible step name: "Step 2 of 4, Medical exam, in progress".
- Mobile toggle is a `<button aria-expanded aria-controls>`.
- Visible focus ring on every control, from the site's focus token.
- Live region for the save confirmation.

## 10. Failure cases

| Situation | Behaviour |
|---|---|
| `localStorage` blocked | Unset state; choosing works for the current page view |
| Stored value invalid | Treated as unset and removed |
| `/api/data` fails or is slow | Bar renders without tags; no console errors beyond the failed request |
| A step's stats `null` or `n < 5` | That tag hidden |
| JS disabled | No stepper; pages unchanged |
| `nav.js` runs before `stepper.js` loads | `nav.js` checks `window.AVGStepper` and skips |

## 11. Testing

**Unit (`node --test`)** on `stepper-core.js`:
- status for each step for saved values 1 to 4 and for unset;
- parsing `"1"`..`"4"`, and rejecting `"0"`, `"5"`, `"abc"`, `null`;
- tag formatting at 9, 14 and 35 days, and hiding for `null` and `n = 4`;
- allowlist: `/`, `/guide/nvc`, `/guide/nvc.html`, `/checklist-medical` shown;
  `/news`, `/naturalization`, `/guide-extra` not shown.

**Browser (preview server):**
- 1280px, 900px and 375px widths, plus reduced motion.
- Choose a step, reload, navigate to another page: the step persists.
- Clear storage: unset state.
- An anchor link on a stage page lands below the sticky stack.
- Absent on `/news` and `/naturalization`.
- No horizontal overflow at 375px.
- Block `/api/data`: no tags, nothing broken.
- Print preview hides it.

**After deploy:** `/api/data` response carries the new `Cache-Control` header.

## 12. Known effects

- Home and Data may show figures up to 10 minutes old (refreshed in the
  background). Approved.
- Adds three small requests per page (two JS, one CSS), all served immutable
  from `/js` and `/css`.
