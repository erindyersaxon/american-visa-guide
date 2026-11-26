-- Record kaka_72772's DQ date, reported by the admin on 2026-11-25.
-- Applied to Supabase project lkssaokcpqilrfwagxnv on 2026-11-25
-- (Supabase migration name: record_kaka_dq_date).
--
-- Row 338 (kaka_72772, CR2/IR2) had its unsent interview-letter date cleared
-- in 0015. The admin confirmed the member was documentarily qualified on
-- 2026-09-14 and, as far as she knows, is still waiting for an interview
-- letter. The member has not updated the form, so the source goes in notes.
--
-- Rows 342 (alabama) and 347 (jeffreythundathil): no further information;
-- 0015 already cleared their dates and noted why.
-- RETURNING lists the rows changed; expect 1.

UPDATE public.form_responses AS f
  SET dq_date = DATE '2026-09-14',
      notes = concat_ws(' | ', nullif(f.notes, ''),
                'DQ 2026-09-14 added 2026-11-25 from admin (member report); still waiting on an interview letter as of that date.')
  WHERE f.id = 338
    AND f.username_raw = 'kaka_72772'
    AND f.dq_date IS NULL
    AND f.interview_letter IS NULL
  RETURNING f.id, f.username_raw, f.dq_date, f.notes;
