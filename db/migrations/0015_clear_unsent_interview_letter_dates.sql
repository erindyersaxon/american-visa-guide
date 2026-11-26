-- Clear interview-letter dates that members entered without having received one.
-- Applied to Supabase project lkssaokcpqilrfwagxnv on 2026-11-25
-- (Supabase migration name: clear_unsent_interview_letter_dates).
--
-- Rows 338, 342 and 347 each show an interview letter (21 Jul, 26 Jul and
-- 1 Aug 2026) with no DQ date and no interview, on submissions that only
-- reported USCIS milestones. Row 338's own note says the member has not been
-- DQ'd or received a letter; row 347's date falls on a Saturday. London's
-- last letter batch went out on 14 Jul 2026, so these dates made it look as
-- though letters were still being sent. Reviewed by the admin on 2026-11-25.
--
-- The original value is kept in notes so nothing is lost.
-- RETURNING lists the rows changed; expect 3.

UPDATE public.form_responses AS f
  SET notes = concat_ws(' | ', nullif(f.notes, ''),
                'Interview letter date ' || to_char(f.interview_letter AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI')
                || ' UTC cleared 2026-11-25: entered without a DQ date or interview, member had not received a letter.'),
      interview_letter = NULL
  WHERE f.id IN (338, 342, 347)
    AND f.interview_letter IS NOT NULL
    AND f.dq_date IS NULL
    AND f.interview IS NULL
  RETURNING f.id, f.interview_letter, f.notes;
