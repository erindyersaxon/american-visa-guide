-- Migration: I-130 petitioner interview columns
-- NOT YET APPLIED to Supabase. Apply, then add the two Fillout questions.
--
-- The Fillout form gains two optional questions in the I-130 section:
--   "Did USCIS schedule a petitioner interview before it decided your I-130?"
--     (dropdown Yes | No)                       -> i130_interview
--   "Petitioner interview date" (date picker)   -> i130_interview_date
-- api/submit.js writes webhook keys straight to columns, so the Fillout
-- webhook must send these exact key names. api/_lib/submit-fields.js turns
-- the Yes/No label into a boolean.
--
-- Interview -> approval is derived from i130_interview_date and i130_approval
-- in code; the form does not ask for it.

ALTER TABLE public.form_responses
  ADD COLUMN i130_interview boolean,
  ADD COLUMN i130_interview_date date;

-- A date only makes sense when the member said Yes (or skipped the question).
ALTER TABLE public.form_responses
  ADD CONSTRAINT form_responses_i130_interview_date_needs_yes
  CHECK (i130_interview_date IS NULL OR i130_interview IS DISTINCT FROM false);

-- USCIS holds the interview before it decides the petition. Same-day
-- approval at the interview is allowed.
ALTER TABLE public.form_responses
  ADD CONSTRAINT form_responses_i130_interview_before_approval
  CHECK (i130_interview_date IS NULL OR i130_approval IS NULL
         OR i130_interview_date <= i130_approval);

COMMENT ON COLUMN public.form_responses.i130_interview IS
  'Fillout: "Did USCIS schedule a petitioner interview before it decided your I-130?" Yes -> true, No -> false, skipped -> NULL (migration 0013).';
COMMENT ON COLUMN public.form_responses.i130_interview_date IS
  'Fillout: "Petitioner interview date". USCIS field office interview held before the I-130 decision (migration 0013).';
