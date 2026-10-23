-- Merge duplicate row 374 (matt, submitted 2026-10-21) into 359 (mattpidd),
-- the same case: same IL (14 Jul, one minute apart), category and outcome.
-- 374 reported the 2026-10-21 rebooked interview as `interview` and Approved;
-- 359 already records both (interview = original 09-09, new_interview_at =
-- 10-21, Approved, visa_approval_date 10-21), so nothing is carried over but
-- a note. Keep 359: it holds the reschedule history and the original date
-- the queue stats measure. RETURNING should list 1 row.
WITH d AS (
  DELETE FROM public.form_responses
  WHERE id = 374 AND username_raw = 'matt'
  RETURNING id
)
UPDATE public.form_responses k
  SET notes = concat_ws(' | ', nullif(k.notes, ''),
                'Merged duplicate row 374 ("matt", 2026-10-21 approval report) on 2026-10-23.')
  FROM d
  WHERE k.id = 359 AND k.username_raw = 'mattpidd'
  RETURNING k.id, k.username_raw, k.interview_outcome, k.notes;
