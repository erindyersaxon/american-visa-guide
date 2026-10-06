-- Data correction: mattpidd's rescheduled interview.
-- Run against Supabase project lkssaokcpqilrfwagxnv (SQL editor).
--
-- Row 359 (mattpidd, 2026-09-16) recorded the 2026-09-09 interview as
-- cancelled and not yet rescheduled. On 2026-10-06 the same member
-- resubmitted as "matt" (row 363, same interview letter and medical) and
-- entered the new date, 2026-10-21, in `interview` instead of
-- new_interview_at. Under migration 0006, `interview` holds the ORIGINAL
-- date, so the row hid the new appointment from the weekly list and fed a
-- false IL->interview interval into the queue stats. The username is
-- aligned with row 359 so deduplication keeps one row for this member.
-- Clock time is unknown, so the new date is stored at midnight UTC.

UPDATE public.form_responses
  SET interview        = '2026-09-09',
      new_interview_at = '2026-10-21 00:00:00+00',
      username_raw     = 'mattpidd',
      notes            = 'Interview 2026-09-09 cancelled (global embassy training initiative); rescheduled on 2026-10-06 for 2026-10-21. Form entry corrected: new date had been entered as the original interview.'
  WHERE id = 363 AND username_raw = 'matt' AND interview = '2026-10-21';
