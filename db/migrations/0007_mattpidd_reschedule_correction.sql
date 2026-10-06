-- Data correction: mattpidd's rescheduled interview.
-- Run against Supabase project lkssaokcpqilrfwagxnv (SQL editor).
--
-- Row 359 (mattpidd, 2026-09-16) recorded the 2026-09-09 interview as
-- cancelled and not yet rescheduled. On 2026-10-06 the same member
-- resubmitted as "matt" (row 363, same interview letter and medical) and
-- entered the new date, 2026-10-21, in `interview` instead of
-- new_interview_at. Under migration 0006, `interview` holds the ORIGINAL
-- date, so row 363 hid the new appointment from the weekly list and fed a
-- false IL->interview interval into the queue stats.
--
-- idx_form_responses_username_unique allows one row per lower(username_raw),
-- and api/submit.js merges later submissions into that row, so the new date
-- goes on row 359 and the duplicate row 363 is removed. Clock time is
-- unknown, so the new date is stored at midnight UTC.

BEGIN;

UPDATE public.form_responses
  SET new_interview_at = '2026-10-21 00:00:00+00',
      submitter_email  = COALESCE(submitter_email,
                           (SELECT submitter_email FROM public.form_responses WHERE id = 363)),
      submitted_at     = '2026-10-06 13:56:14.307+00',
      notes            = 'Interview 2026-09-09 cancelled (global embassy training initiative); rescheduled on 2026-10-06 for 2026-10-21. Reported via a second form entry under "matt" (row 363), merged here.'
  WHERE id = 359 AND username_raw = 'mattpidd' AND interview = '2026-09-09';

DELETE FROM public.form_responses
  WHERE id = 363 AND username_raw = 'matt' AND interview = '2026-10-21';

COMMIT;
