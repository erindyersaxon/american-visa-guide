-- Migration: normalize interview outcome + resolve table drift
-- Applied to Supabase project lkssaokcpqilrfwagxnv on 2026-07-24.
-- Recorded here for version control; the live database already has it applied
-- (Supabase migration name: normalize_outcome_and_resolve_table_drift).
--
-- See DATA_QUALITY_REVIEW.md sections 3.2 and 3.3.

-- 1. Canonical outcome category as a STORED generated column. Recomputed
--    automatically on every insert/update (including Fillout writes via
--    api/submit.js), so the read path can GROUP BY instead of string-sniffing.
--    Immutable expression (lower / regexp_replace / LIKE only).
--    Categories: approved | cleared | not_approved | visa_pause | denied | NULL.
--    Verified to reproduce the previous api/data.js counts exactly:
--    approved 155, cleared 6, not_approved 6, visa_pause 3, denied 2, null 61.
ALTER TABLE public.form_responses
  ADD COLUMN outcome_status text
  GENERATED ALWAYS AS (
    CASE
      WHEN interview_outcome IS NULL OR btrim(interview_outcome) = '' THEN NULL
      WHEN lower(interview_outcome) = 'denied'
           OR lower(coalesce(resolution_outcome,'')) = 'denied' THEN 'denied'
      WHEN (regexp_replace(lower(interview_outcome),'[^a-z0-9]','','g') LIKE '%221g%'
            OR lower(interview_outcome) LIKE '%not approved%'
            OR lower(interview_outcome) LIKE '%administrative processing%')
           AND (lower(coalesce(resolution_outcome,'')) LIKE '%cleared%'
                OR lower(coalesce(resolution_outcome,'')) LIKE '%approved%') THEN 'cleared'
      WHEN lower(interview_outcome) = 'approved' THEN 'approved'
      WHEN (lower(interview_outcome) LIKE '%visa pause%'
            OR lower(coalesce(notes,'')) LIKE '%visa pause%')
           AND lower(coalesce(resolution_outcome,'')) NOT LIKE '%cleared%' THEN 'visa_pause'
      WHEN regexp_replace(lower(interview_outcome),'[^a-z0-9]','','g') LIKE '%221g%'
           OR lower(interview_outcome) LIKE '%not approved%'
           OR lower(interview_outcome) LIKE '%administrative processing%' THEN 'not_approved'
      ELSE 'other'
    END
  ) STORED;

-- 2. Port not_approved_reason from the abandoned `submissions` schema.
ALTER TABLE public.form_responses
  ADD COLUMN not_approved_reason text;

-- 3. Resolve the drift: `submissions` (0 rows, never referenced by any code)
--    was an abandoned redesign. form_responses is canonical. Drop the duplicate.
DROP TABLE public.submissions;
