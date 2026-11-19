-- Migration: I-130 interview columns
-- NOT YET APPLIED. Apply to Supabase project lkssaokcpqilrfwagxnv after the
-- admin approves (Supabase migration name: i130_interview_columns).
--
-- The Fillout form gains three optional questions in the I-130 section:
--   "Did USCIS call you or your spouse to an interview about the I-130?"
--     (No | Yes, petitioner only | Yes, petitioner and beneficiary) -> i130_interview
--   "Date on the USCIS interview notice"                          -> i130_interview_notice
--   "Date of the USCIS interview"                                 -> i130_interview_date
-- api/submit.js writes webhook keys straight to columns, so the Fillout
-- webhook must send these exact key names.
--
-- Semantics: these columns cover the USCIS field office interview on the
-- I-130 only. `interview` stays the US Embassy London immigrant visa
-- interview, so IL->interview queue stats are unaffected.

ALTER TABLE public.form_responses
  ADD COLUMN i130_interview text,
  ADD COLUMN i130_interview_notice date,
  ADD COLUMN i130_interview_date date;

-- Accept Fillout's option labels in any casing.
ALTER TABLE public.form_responses
  ADD CONSTRAINT form_responses_i130_interview_valid
  CHECK (i130_interview IS NULL
         OR lower(btrim(i130_interview)) IN
            ('no', 'yes, petitioner only', 'yes, petitioner and beneficiary'));

-- Dates only make sense when an interview happened.
ALTER TABLE public.form_responses
  ADD CONSTRAINT form_responses_i130_interview_dates_need_yes
  CHECK ((i130_interview_notice IS NULL AND i130_interview_date IS NULL)
         OR lower(btrim(coalesce(i130_interview, ''))) LIKE 'yes%');

-- Ordering: priority date <= notice <= interview <= I-130 decision.
ALTER TABLE public.form_responses
  ADD CONSTRAINT form_responses_i130_interview_ordering
  CHECK (
    (i130_interview_notice IS NULL OR i130_priority_date IS NULL
       OR i130_interview_notice >= i130_priority_date)
    AND (i130_interview_date IS NULL OR i130_interview_notice IS NULL
       OR i130_interview_date >= i130_interview_notice)
    AND (i130_interview_date IS NULL OR i130_approval IS NULL
       OR i130_approval >= i130_interview_date)
  );

COMMENT ON COLUMN public.form_responses.i130_interview IS
  'USCIS field office interview on the I-130: No | Yes, petitioner only | Yes, petitioner and beneficiary (Fillout labels). NULL = not answered. Separate from the embassy `interview` (migration 0013).';
COMMENT ON COLUMN public.form_responses.i130_interview_notice IS
  'Date printed on the USCIS I-130 interview notice (migration 0013).';
COMMENT ON COLUMN public.form_responses.i130_interview_date IS
  'Date the USCIS I-130 interview took place, or the scheduled date if still upcoming (migration 0013).';

-- Backfill: two rows state "No petitioner interview" in notes.
UPDATE public.form_responses
  SET i130_interview = 'No'
  WHERE id IN (368, 378)
    AND i130_interview IS NULL
    AND notes ILIKE '%no petitioner interview%';
