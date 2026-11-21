-- rapputk (row 378) reported "Petitioner Interview: No" on Discord
-- (2026-11-06 21:21). The row's notes already said so; set the column to
-- match. Guarded on i130_interview IS NULL. Applied via execute_sql on 2026-11-21.
UPDATE public.form_responses
  SET i130_interview = false
  WHERE id = 378 AND username_raw = 'rapputk' AND i130_interview IS NULL;
