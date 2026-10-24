-- mattpidd (row 359, approved 2026-10-21) flies on 2026-11-01, reported to
-- the admin on 2026-10-24. "matt" is the same person (row 374, merged by
-- 0010); mattwaldram (row 365) is a different, I-130-stage case.
-- flight is the date the upcoming-week panel reads, so a future date is
-- expected. Guarded on flight IS NULL so a reported date is never
-- overwritten. RETURNING should list 1 row.
UPDATE public.form_responses AS f
  SET flight = DATE '2026-11-01'
  WHERE f.id = 359 AND f.username_raw = 'mattpidd'
    AND f.flight IS NULL
  RETURNING f.id, f.username_raw, f.visa_approval_date, f.flight;
