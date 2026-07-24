-- Migration: milestone ordering constraints + data cleanup
-- Applied to Supabase project lkssaokcpqilrfwagxnv on 2026-07-24.
-- Recorded here for version control; the live database already has it applied
-- (Supabase migration name: add_milestone_ordering_constraints).
--
-- Purpose: prevent chronologically impossible milestone intervals from being
-- written to public.form_responses. See DATA_QUALITY_REVIEW.md sections 2-3.

-- ---------------------------------------------------------------------------
-- 1. One-off data cleanup (four rows that violated the ordering rules)
-- ---------------------------------------------------------------------------
--   id 29  (aurelia): passport_in_hand 2025-01-21 was 167 days before the
--                     interview; true value unrecoverable -> null it.
--   id 48  (nurse_s): passport_in_hand 2025-11-05 was 16 days before the
--                     interview; true value unrecoverable -> null it.
--   id 182 (sptd143): interview 2025-07-01 was a year typo (DQ 2026-02, IL
--                     2026-05) -> corrected to 2026-07-01.
--   id 207 (anna):    interview_letter 2027-05-29 was a year typo (interview
--                     2026-06) -> corrected to 2026-05-29 13:53 UTC.

UPDATE public.form_responses SET passport_in_hand = NULL
  WHERE id = 29  AND passport_in_hand = '2025-01-21';
UPDATE public.form_responses SET passport_in_hand = NULL
  WHERE id = 48  AND passport_in_hand = '2025-11-05';
UPDATE public.form_responses SET interview = '2026-07-01'
  WHERE id = 182 AND interview = '2025-07-01';
UPDATE public.form_responses SET interview_letter = '2026-05-29 13:53:00+00'
  WHERE id = 207 AND interview_letter = '2027-05-29 13:53:00+00';

-- ---------------------------------------------------------------------------
-- 2. Ordering constraints
-- ---------------------------------------------------------------------------
-- CHECK is satisfied when either operand is NULL, so partial records are
-- unaffected. interview_letter is timestamptz; it is compared at UTC using an
-- immutable interval-offset cast (AT TIME ZONE INTERVAL '0'), which matches the
-- read path's UTC computation of DQ->IL. A plain ::date cast is STABLE, not
-- IMMUTABLE, and Postgres rejects it inside a CHECK constraint.

ALTER TABLE public.form_responses
  ADD CONSTRAINT form_responses_passport_after_interview
  CHECK (passport_in_hand IS NULL OR interview IS NULL
         OR passport_in_hand >= interview);

ALTER TABLE public.form_responses
  ADD CONSTRAINT form_responses_interview_after_il
  CHECK (interview IS NULL OR interview_letter IS NULL
         OR interview >= (interview_letter AT TIME ZONE INTERVAL '0')::date);

ALTER TABLE public.form_responses
  ADD CONSTRAINT form_responses_il_after_dq
  CHECK (dq_date IS NULL OR interview_letter IS NULL
         OR (interview_letter AT TIME ZONE INTERVAL '0')::date >= dq_date);
