-- Past London interviews with no outcome, reviewed by the admin on 2026-10-23.
-- RETURNING lists the rows each statement changed; expect 2 rows, then 11.

-- Approved. Both are historic imports and the approval date was not reported,
-- so visa_approval_date stays NULL rather than assuming the interview day.
UPDATE public.form_responses AS f
  SET interview_outcome = 'Approved'
  WHERE f.id IN (113, 335)                         -- kd (2025-08-27), rgs (2025-11-07)
    AND f.interview_outcome IS NULL
  RETURNING f.id, f.username_raw, f.interview_outcome, f.outcome_status;

-- Never reported an outcome. interview_outcome stays NULL: any text there is
-- counted as a reported outcome by api/data.js. The note records that the
-- gap is known so these rows are not chased again.
UPDATE public.form_responses AS f
  SET notes = concat_ws(' | ', nullif(f.notes, ''),
                'Outcome not reported; member has not returned to update their timeline (checked 2026-10-23).')
  WHERE f.id IN (328, 344,                         -- funfairlloyd, wiggy1033_27233
                 149, 107, 139, 334, 336,          -- neo, jsurico656, meskitt, sensei205, ephraim
                 142, 110, 153, 27)                -- mo, kaonashi, njg884, asdf
    AND f.interview_outcome IS NULL
    AND coalesce(f.notes, '') NOT LIKE '%Outcome not reported%'
  RETURNING f.id, f.username_raw, f.notes;
