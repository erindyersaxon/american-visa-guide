# Review: Data Quality Methodology vs. Live Data

Review of `dataqualitymethodology.md` against the live Supabase project
(`public.form_responses`, London embassy) as of **2026-07-24**. This is an
advisory review. Per the methodology's own scope note, `api/data.js` is a
protected file and is **not** modified here — the changes below are proposals.

All figures were measured directly from the database (deduplicated to the
latest submission per `LOWER(TRIM(username_raw))`, London only). Where a number
contradicts the doc's April 2026 snapshot, the live number governs.

> **Status update (2026-07-24):** Checklist items 1 and 3 are **done**. The bad
> rows were cleaned and three ordering constraints were added to
> `public.form_responses` (migration `db/migrations/0001_milestone_ordering_constraints.sql`).
> A **fourth** bad row surfaced during cleanup — `id 182` (sptd143), whose
> interview date was a year typo (`2025-07-01` → `2026-07-01`) — so four rows
> were corrected, not three.
>
> **Update 2 (2026-07-24):** Checklist item 4 (§4 display changes) is now
> **applied** to `api/data.js` and `public/js/tracker.js`. The API emits an
> `intervals` block (median + IQR + p90, `n=`, rolling window with auto-widen,
> and censored counts); the passport denominator was unified (dropped the
> `Approved`-only filter). At the 180-day window all three intervals clear the
> n=30 floor (46 / 84 / 62). The DQ→IL 180-day median is 86 days vs. the 65-day
> all-time figure — the rolling window surfaces the recent slowdown.
>
> **Update 3 (2026-07-24):** §3.2/3.3 schema normalization **applied** (migration
> `db/migrations/0002_...`). Added a STORED generated column `outcome_status`
> (`approved | cleared | not_approved | visa_pause | denied | null`) that
> reproduces the old string-matching counts exactly (155/6/6/3/2, 61 null);
> `api/data.js` now tallies it instead of ~30 lines of pattern matching. Ported
> `not_approved_reason` onto `form_responses` and dropped the dead, empty
> `submissions` table (`form_responses` documented as canonical in
> `SUPABASE_SETUP.md`). Remaining: §6 re-solicitation of passport-in-hand — a
> data-collection task, not a code change.
>
> **Update 4 (2026-07-24):** The interval display is now wired into the **real**
> stats page, `public/data.html` (served at `/data`) — the earlier edit had gone
> into `public/js/tracker.js`, which no page loads; that file was reverted. A new
> "Signature Wait Times" section renders median + IQR + `n=` + the censored tail
> for DQ→IL, IL→Interview, and Interview→Passport from the API's `intervals`
> block, with a matching fallback snapshot for when the API is unreachable. Note
> all code changes are still on the `claude/...` branch only — production deploys
> from `main`, so they go live when the branch is merged and Vercel redeploys.
> The DB changes are already live in production.

---

## 1. Headline: the baseline snapshot (doc §8) is stale and now misleading

The doc's Section 8 reference values (n = 184, April 2026 export) no longer
match reality and should not be used for validation. Live state:

| Interval | Doc §8 snapshot | **Live 2026-07-24** |
|---|---|---|
| Members (London, deduped) | 184 | **232** |
| **DQ → IL** completed | n = 129, median 60, IQR 42–72, p90 77 | **n = 178, median 65, IQR 46–78, p90 95** |
| DQ → IL right-censored (DQ, no IL) | 36 | **14** |
| **Interview → Passport** completed | n = 24 (below floor) | **n = 96 (well above floor)**, median 5, IQR 3–6, p90 9 |
| Interview → Passport censored | 109 (~82%) | **96 (~49%)** |
| Interview outcome captured | 17 of 184 (~9%) | **172 of 232 (~74%)** |

**Consequences that change the doc's own conclusions:**

- **Interview → Passport is no longer a small-sample interval.** With n = 96
  completed it clears the §4 stability floor of 30. The doc's instruction to
  carry a permanent small-sample warning on this interval is now wrong — drop
  the warning and publish median + IQR normally. (A 180-day rolling window
  still holds: 62 completed inside the last 180 days.)
- **Outcome capture is no longer catastrophic** (74% vs. the doc's 9%), so an
  approval-rate figure is now defensible with an `n =` label — but see §5 on
  how the live code currently computes it.

Recommendation: replace §8 with a note that says "recompute live; do not hardcode"
and delete the static numbers, or regenerate the snapshot from the query in the
appendix so a future reader isn't validating against 3-month-old values.

---

## 2. Answering the doc's two open questions

**§3 — "Confirm the exact column name storing the DQ timestamp."**
Resolved: the column is **`dq_date`**, and its type is **`date`**, not
`timestamptz`. Only `interview_letter` and `submitted_at` are `timestamptz`;
`dq_date`, `interview`, `medical`, `passport_in_hand` are all plain `date`.
So the "all comparisons in UTC" rule (§3, §10) only bites on `interview_letter`.
The correct interval expression is `interview_letter::date - dq_date`, which is
what should be used to avoid a spurious sub-day offset from the IL's time
component.

**§11 — "Is the passport gap attrition or a form-flow gap?"**
The data points hard at **reporting attrition, not queue time.** Of the members
who reached interview with no passport recorded, **61 were marked `Approved`**,
and their average time *since interview* is **147 days**. Real passport return
runs a median of 5 days (IQR 3–6). A 147-day "still waiting" population is not
waiting — they received the visa and stopped updating. This means:

- Do **not** surface these 96 censored cases as "still waiting, currently N days
  and counting" the way §9 recommends for DQ → IL. For the passport interval that
  phrasing would be actively false. Label them "reached interview, passport
  outcome not reported" instead.
- The real lever is §7's re-solicitation of the terminal milestone, not a
  statistical fix. This is the one place the doc's diagnosis is exactly right.

---

## 3. Database changes

The schema is sound; these are hardening and hygiene items.

1. **Add validity constraints (or a nightly check) for impossible intervals.**
   Live rows that are physically impossible and currently silently dropped:
   - `id 29`: `passport_in_hand` 2025-01-21 is **167 days before** its interview (2025-07-07).
   - `id 48`: passport 16 days before interview.
   - `id 207`: `interview_letter` typed as **2027**-05-29 (a year typo), producing a fake 450-day DQ → IL.

   These pass because nothing enforces ordering. Add `CHECK` constraints
   (`passport_in_hand >= interview`, `interview >= interview_letter::date`,
   `interview_letter::date >= dq_date`) **as `NOT VALID`** so existing bad rows
   are flagged for correction without blocking writes, plus a lightweight
   `data_quality_flags` view that lists violating `id`s for manual cleanup. This
   is the DB-side implementation of the doc's §3 "flag, do not silently include."

2. **Resolve the `form_responses` vs `submissions` schema drift.** There are two
   near-identical tables. `form_responses` is live (232 rows); `submissions` is
   empty (0 rows) and carries a column `form_responses` lacks:
   **`not_approved_reason`**. Either delete `submissions` or, better, port
   `not_approved_reason` onto `form_responses` — it directly supports the §8
   outcome breakdown (the live code currently infers "not approved" reasons by
   string-matching `notes`, which is fragile). Decide which table is canonical
   and document it in `SUPABASE_SETUP.md`.

3. **Normalize `interview_outcome` to a small enum.** Live values are already
   messy: `Approved` (155), `221(g)/Administrative Processing (AP)` (7),
   `Not Approved` (6), `221g` (2), `Denied` (1), `Visa Pause` (1). The API
   spends ~30 lines of punctuation-stripping and `notes` sniffing to collapse
   these (`api/data.js` lines 104–139). Add a generated/normalized column or a
   CHECK-constrained enum at write time so the read path can stop guessing.

4. **Add a partial index for the hot query.**
   `CREATE INDEX ON form_responses (embassy, submitted_at DESC)` — the API pulls
   `embassy = 'London, United Kingdom' ORDER BY submitted_at DESC` on every
   request. Negligible at 232 rows, cheap insurance as it grows.

5. **Keep the embassy filter exact but guard the fragility.** Only one non-London
   row exists today (`Stockholm, Sweden`), so the exact `=` filter is correct.
   But a single stray `'London, UK'` would silently vanish. Add a CHECK or a
   controlled dropdown at the form layer so `embassy` can only take canonical
   values — this protects the doc's §10 "exact filter" rule at the source.

---

## 4. Data-shown / display changes (the `api/data.js` proposal)

These reconcile what the code emits today against the methodology. The frontend
(`public/js/tracker.js`) consumes only what the API returns, so most of these
are API-shape changes with matching render tweaks.

| # | Methodology says | What the code does today | Recommended change |
|---|---|---|---|
| A | §5: **never publish a mean**; use median + IQR | Headline `key_stats.avg_dq_to_il` / `avg_il_to_interview` are **means**, rendered as the top-line stat cards (`renderKeyStats`) | Publish `median` + `p25`/`p75` (+ `p90`) as the headline; demote mean to a secondary/hidden field. `statsFromArray` already exists — extend it with percentiles and use it for the signature intervals, not just the calculator. |
| B | §4: `n =` on **every** figure; warn < 30; suppress < 10 | `n` is only on `stage_avgs` stats objects; headline `avg_*` are bare numbers; no suppression | Attach `{ value, n, suppressed, small_sample }` to every published interval and render the `n =` label + warning/suppression state. |
| C | §2/§9: show the censored tail inline | DQ → IL censored is surfaced via `awaiting_il` (frontier heuristic); **Interview → Passport censoring is invisible** | Emit an explicit `censored` count per interval. For passport, label it "passport not reported" (per §2 above), not "still waiting." |
| D | §3: flag `end < start`; §5: robust to outliers | Negatives dropped via `filter(n > 0)`; the headline `dqToIL` array has **no max cap** (stage stats do), so a bad row can drag the mean | Return a `flagged` count (rows where `end < start` or beyond a sane cap) instead of silently dropping; rely on median/IQR so outliers like the 83-day passport case (`id 42`) don't distort the headline. |
| E | §6: headline uses a **180-day rolling window**, auto-widening below floor | Headline is **all-time**; trends exist separately (12m/6m/3m/1m, `MIN_TREND_N = 5`) | Make the published headline the 180-day window (cohorted by milestone date), auto-widen if completed n < 30, and surface the window length used. Live check: 180-day windows already hold 47 (DQ→IL) and 62 (passport) completed, both above floor. |
| F | Consistency | `passportDays` requires `interview_outcome = 'Approved'`, but `pickupDays`/`mailDays` do not — three different denominators for the same interval | Pick one inclusion rule for the passport interval and apply it to all three arrays. |

Concrete display pattern to adopt (updated from §9 for the live numbers):

> **DQ → IL:** median **65 days** (IQR 46–78; n = 178 completed; 14 still awaiting an IL).
> **Interview → Passport:** median **5 days** (IQR 3–6; n = 96 completed; 96 members reached interview but haven't reported passport return).

---

## 5. Outcome / approval-rate note

The live approval calculation (`api/data.js` 104–139) reverse-engineers outcome
categories from free text and `notes` (`visa pause`, `221g`, `not approved`).
With `interview_outcome` now populated on 172 rows and a clean enum available
(§3.3), this logic can be deleted in favour of a `GROUP BY` on a normalized
column. Until then, publish the approval rate with its `n =` denominator (172),
not as a bare percentage — the current `renderKeyStats` shows a bare `%`.

---

## 6. Prioritized checklist

1. **Correct the 3 impossible rows** (`id 29`, `id 48`, `id 207`) or null their
   offending fields — they currently distort passport and DQ→IL. *(Data fix, no code.)*
2. **Retire doc §8's static snapshot** or regenerate it; drop the permanent
   small-sample warning on Interview → Passport (it's now n = 96).
3. **Add `NOT VALID` ordering constraints + a `data_quality_flags` view** so
   future bad rows surface instead of hiding.
4. **API proposal (needs approval to touch `api/data.js`):** switch headline to
   median + IQR + `n =` (rows A, B), emit explicit `censored`/`flagged` counts
   (C, D), move headline to a 180-day auto-widening window (E), unify the
   passport denominator (F).
5. **Normalize `interview_outcome`** and decide `form_responses` vs `submissions`
   canonicality; port `not_approved_reason`.
6. **Re-solicit passport-in-hand** from the 61 approved-but-unreported members —
   the only real fix for the 49% passport censoring.

---

## Appendix: regenerate the live snapshot

```sql
WITH london AS (
  SELECT * FROM public.form_responses WHERE embassy = 'London, United Kingdom'
),
deduped AS (
  SELECT DISTINCT ON (LOWER(TRIM(username_raw))) *
  FROM london WHERE username_raw IS NOT NULL AND TRIM(username_raw) <> ''
  ORDER BY LOWER(TRIM(username_raw)), submitted_at DESC
),
dq_il AS (
  SELECT (interview_letter::date - dq_date) AS d FROM deduped
  WHERE dq_date IS NOT NULL AND interview_letter IS NOT NULL
    AND interview_letter::date >= dq_date
    AND COALESCE(interview_expedited,false) = false
),
iv_pp AS (
  SELECT (passport_in_hand - interview) AS d FROM deduped
  WHERE interview IS NOT NULL AND passport_in_hand IS NOT NULL
    AND passport_in_hand >= interview
)
SELECT 'DQ_to_IL' i, COUNT(*) n,
  percentile_cont(0.25) WITHIN GROUP (ORDER BY d) p25,
  percentile_cont(0.5)  WITHIN GROUP (ORDER BY d) p50,
  percentile_cont(0.75) WITHIN GROUP (ORDER BY d) p75,
  percentile_cont(0.9)  WITHIN GROUP (ORDER BY d) p90, MAX(d) max
FROM dq_il
UNION ALL
SELECT 'IV_to_Passport', COUNT(*),
  percentile_cont(0.25) WITHIN GROUP (ORDER BY d),
  percentile_cont(0.5)  WITHIN GROUP (ORDER BY d),
  percentile_cont(0.75) WITHIN GROUP (ORDER BY d),
  percentile_cont(0.9)  WITHIN GROUP (ORDER BY d), MAX(d)
FROM iv_pp;
```
