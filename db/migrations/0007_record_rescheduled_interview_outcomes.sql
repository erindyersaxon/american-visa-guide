-- Outcomes for three of the London interviews cancelled on 2026-09-09 and
-- rebooked for 20-22 Oct, reported by the admin on 2026-10-23.
-- outcome_status is a generated column and recomputes from interview_outcome.

-- Approved at the rebooked interview. visa_approval_date follows the existing
-- convention of an on-the-day approval matching the interview date.
UPDATE public.form_responses AS f
  SET interview_outcome  = 'Approved',
      visa_approval_date = f.new_interview_at::date
  WHERE f.id IN (353, 359)                         -- jk27 (10-20), mattpidd (10-21)
    AND f.interview_change_type = 'Rescheduled'
    AND f.interview_outcome IS NULL;

-- Refused on public-charge grounds. Matches the other "Not Approved" rows:
-- the reason goes in not_approved_reason, resolution stays Still Pending.
UPDATE public.form_responses AS f
  SET interview_outcome   = 'Not Approved',
      resolution_outcome  = 'Still Pending',
      not_approved_reason = 'Refused under INA 212(a)(4) (public charge) at the rebooked interview on 2026-10-22.'
  WHERE f.id = 167                                 -- quostix (10-22)
    AND f.interview_change_type = 'Rescheduled'
    AND f.interview_outcome IS NULL;
