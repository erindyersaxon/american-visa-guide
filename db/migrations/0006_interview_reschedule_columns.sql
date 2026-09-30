-- Migration: interview reschedule / re-interview columns
-- Applied to Supabase project lkssaokcpqilrfwagxnv on 2026-09-28
-- (Supabase migration name: interview_reschedule_columns).
--
-- The Fillout form gained two optional questions in the Embassy section:
--   "Has your interview been cancelled, moved, or have you been asked to
--    attend again?" (Rescheduled | Re-interview) -> interview_change_type
--   "New interview date and time" (UK time)      -> new_interview_at
-- api/submit.js writes webhook keys straight to columns, so the Fillout
-- webhook must send these exact key names.
--
-- Semantics going forward: `interview` stays the ORIGINAL embassy-assigned
-- date (what IL->interview queue stats should measure); the moved or second
-- appointment lives in new_interview_at.

ALTER TABLE public.form_responses
  ADD COLUMN interview_change_type text,
  ADD COLUMN new_interview_at timestamptz;

-- Accept Fillout's option labels in any casing ("Rescheduled", "Re-interview").
ALTER TABLE public.form_responses
  ADD CONSTRAINT form_responses_interview_change_type_valid
  CHECK (interview_change_type IS NULL
         OR lower(btrim(interview_change_type)) IN ('rescheduled', 're-interview'));

-- A new appointment can't predate the original one.
ALTER TABLE public.form_responses
  ADD CONSTRAINT form_responses_new_interview_after_interview
  CHECK (new_interview_at IS NULL OR interview IS NULL
         OR (new_interview_at AT TIME ZONE INTERVAL '0')::date >= interview);

COMMENT ON COLUMN public.form_responses.interview_change_type IS
  'Rescheduled | Re-interview (Fillout labels). A cancelled interview awaiting a new date is Rescheduled with new_interview_at NULL. NULL = interview went ahead as first scheduled (migration 0006).';
COMMENT ON COLUMN public.form_responses.new_interview_at IS
  'Date/time of the rescheduled appointment or second interview. `interview` holds the original date. Backfilled rows with no known clock time are stored at midnight UTC (migration 0006).';

-- Backfill: the three existing rows that recorded a move in `notes` had
-- overwritten `interview` with the NEW date. Move it across and restore the
-- original. The ordering constraints from 0001 still hold for all three.
UPDATE public.form_responses
  SET interview_change_type = 'Rescheduled',
      new_interview_at      = '2026-09-09 00:00:00+00',
      interview             = '2026-08-26'
  WHERE id = 356 AND interview = '2026-09-09';   -- esther: 08-26 slot cancelled, rebooked 09-09

UPDATE public.form_responses
  SET interview_change_type = 'Re-interview',
      new_interview_at      = '2026-10-08 00:00:00+00',
      interview             = '2026-08-05'
  WHERE id = 346 AND interview = '2026-10-08';   -- pippyd0321: 221(g) on 08-05, second interview 10-08

UPDATE public.form_responses
  SET interview_change_type = 'Rescheduled',
      new_interview_at      = '2026-09-01 00:00:00+00',
      interview             = '2026-06-22'
  WHERE id = 39 AND interview = '2026-09-01';    -- carlralph: 06-22 moved to 09-01 (09-01 later cancelled)

-- Cancelled under the global embassy training initiative and not yet rebooked:
-- the form now asks these members to pick Rescheduled and leave the date blank.
UPDATE public.form_responses
  SET interview_change_type = 'Rescheduled'
  WHERE id IN (105, 117, 167, 183, 331, 332, 333, 353, 359)
    AND interview_change_type IS NULL
    AND notes ILIKE '%not yet rescheduled%';

-- Applied separately after the migration, same day: ilma was refused under the
-- Bangladesh visa pause and recalled to re-interview. Dates from her later
-- report: original interview 2026-05-15 (221(g)), recalled for 2026-10-02.
UPDATE public.form_responses
  SET interview_change_type = 'Re-interview',
      interview             = '2026-05-15',
      new_interview_at      = '2026-10-02 00:00:00+00'
  WHERE id = 93 AND username_raw = 'ilma' AND interview IS NULL;

-- Corrections reported by the admin after the migration, same day:
-- carlralph's original interview for this cycle is 2026-09-01 (cancelled),
-- rebooked for 2026-10-06; wildeyesap ("Ashley") rebooked for 2026-10-06.
UPDATE public.form_responses
  SET interview = '2026-09-01', new_interview_at = '2026-10-06 00:00:00+00'
  WHERE id = 39 AND username_raw = 'carlralph';
UPDATE public.form_responses
  SET new_interview_at = '2026-10-06 00:00:00+00'
  WHERE id = 332 AND username_raw = 'wildeyesap';
