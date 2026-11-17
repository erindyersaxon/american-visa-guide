-- immaculate_cheetah_27929 (row 373) was approved at the 2026-11-16 interview,
-- reported to the admin on 2026-11-17. The admin confirmed the 11-16 slot was
-- a rescheduled interview (the 09-30 original was cancelled), not a second
-- interview, so interview_change_type moves from Re-interview to Rescheduled.
-- Approved at interview: visa_approval_date follows the on-the-day convention
-- from 0007 and matches the interview date. outcome_status is generated.
-- Guarded on interview_outcome IS NULL. RETURNING should list 1 row.
UPDATE public.form_responses AS f
  SET interview_change_type = 'Rescheduled',
      interview_outcome     = 'Approved',
      visa_approval_date    = f.new_interview_at::date,
      notes = concat_ws(' | ',
                replace(f.notes, 'Re-interview IL received', 'Rescheduled interview IL received'),
                'Approved at the rescheduled 2026-11-16 interview (reported to admin 2026-11-17); admin confirmed it was a reschedule, not a second interview.')
  WHERE f.id = 373 AND f.username_raw = 'immaculate_cheetah_27929'
    AND f.new_interview_at = '2026-11-16 00:00:00+00'
    AND f.interview_outcome IS NULL
  RETURNING f.id, f.username_raw, f.interview_change_type, f.interview_outcome,
            f.visa_approval_date, f.outcome_status, f.notes;
