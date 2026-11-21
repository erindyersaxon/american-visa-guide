-- quostix (row 167) had a USCIS petitioner interview on 2026-03-24, reported
-- to the admin on 2026-11-21. The I-130 was approved the next day
-- (i130_approval 2026-03-25, already on the row). Guarded on
-- i130_interview_date IS NULL.
-- Applied to Supabase project lkssaokcpqilrfwagxnv on 2026-11-21
-- (Supabase migration name: record_quostix_petitioner_interview).
UPDATE public.form_responses
  SET i130_interview = true,
      i130_interview_date = '2026-03-24'
  WHERE id = 167 AND username_raw = 'quostix' AND i130_interview_date IS NULL;
