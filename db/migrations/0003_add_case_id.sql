-- Migration: case_id for cases reported under more than one username
-- Applied to Supabase project lkssaokcpqilrfwagxnv on 2026-08-25.
-- Recorded here for version control; the live database already has it applied
-- (Supabase migration name: add_case_id).
--
-- Purpose: a petitioner and a beneficiary sometimes each submit the tracker
-- form for the SAME case, producing two rows with the same milestone dates.
-- Aggregates in api/data.js group by row, so such a case is counted twice.
-- case_id records the linkage structurally instead of in prose `notes`.

-- ---------------------------------------------------------------------------
-- 1. The column
-- ---------------------------------------------------------------------------
-- Nullable with no default: adding it is metadata-only, existing rows keep
-- NULL, and the generated outcome_status column is untouched. Rows with a
-- NULL case_id are their own case - the read path must treat NULL as distinct
-- per row, never as a group.
ALTER TABLE public.form_responses
  ADD COLUMN case_id text;

COMMENT ON COLUMN public.form_responses.case_id IS
  'Shared key for rows that are the same immigration case reported under '
  'different usernames (e.g. petitioner and beneficiary each submitting). '
  'NULL means the row stands alone. ASSIGNED BY HAND ONLY - see migration '
  '0003 for why milestone dates cannot be used to infer this.';

-- Partial: only linked rows are ever looked up by this key.
CREATE INDEX form_responses_case_id_idx
  ON public.form_responses (case_id)
  WHERE case_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 2. Why this cannot be backfilled automatically
-- ---------------------------------------------------------------------------
-- Matching rows on milestone dates does NOT identify couples. London books
-- interviews in batches, so shared dates are the norm rather than a signal:
--   * 198 rows with an interview date fall on only 78 distinct dates;
--   * 144 of 188 rows have the medical exactly 14 days before the interview,
--     which is the embassy's standard lead time, not a coincidence;
--   * interview_letter is a batch-issue date shared across dozens of rows.
-- On 2026-07-22 alone, five unrelated rows (charlie, laura, titus robinson,
-- vlepp, regular__cereal) match on interview + medical + interview_letter.
-- Collapsing on those dates would merge five strangers into one case.
--
-- The only trustworthy signal is an explicit statement in `notes`. Of the 74
-- rows carrying notes, exactly two describe the same case under two usernames.

-- ---------------------------------------------------------------------------
-- 3. Backfill: the one confirmed pair
-- ---------------------------------------------------------------------------
-- ids 289 (vlepp, petitioner/wife) and 321 (regular__cereal, beneficiary/
-- husband). Both rows' notes state the linkage explicitly and their six
-- overlapping milestones agree. Keyed on the lower row id.
UPDATE public.form_responses SET case_id = 'case-289'
  WHERE id IN (289, 321)
    AND username_raw IN ('vlepp', 'regular__cereal');
