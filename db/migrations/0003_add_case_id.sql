-- Migration: add case_id
-- Applied to Supabase project lkssaokcpqilrfwagxnv on 2026-08-25
-- (Supabase migration name: add_case_id, version 20260825111014).
--
-- RECONSTRUCTED 2026-08-26 from the applied statements recorded in
-- supabase_migrations.schema_migrations. The original file was never committed,
-- which left the "see migration 0003" pointer in the column comment dangling.
-- The SQL below is byte-for-byte what the live database has applied; only these
-- header comments are new.

ALTER TABLE public.form_responses
  ADD COLUMN case_id text;

COMMENT ON COLUMN public.form_responses.case_id IS
  'Shared key for rows that are the same immigration case reported under '
  'different usernames (e.g. petitioner and beneficiary each submitting). '
  'NULL means the row stands alone. ASSIGNED BY HAND ONLY - see migration '
  '0003 for why milestone dates cannot be used to infer this.';

CREATE INDEX form_responses_case_id_idx
  ON public.form_responses (case_id)
  WHERE case_id IS NOT NULL;

UPDATE public.form_responses SET case_id = 'case-289'
  WHERE id IN (289, 321)
    AND username_raw IN ('vlepp', 'regular__cereal');

-- Why milestone dates cannot infer a shared case (the rationale the comment
-- points at, recovered from the data rather than from the original file —
-- treat it as reconstructed, not as the author's stated reasoning):
-- ids 289 and 321 share both interview (2026-07-22) and interview_letter
-- (2026-05-29), which is what makes them look like one case. But those dates
-- are not distinguishing: 5 rows share that interview date and 2 share the
-- same IL timestamp, because members are scheduled in the same IL drop and
-- interviewed on the same day. Matching on milestone dates would therefore
-- merge unrelated members. Hence the by-hand assignment.
