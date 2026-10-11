-- Migration: document and constrain i130_escalation
-- Applied to Supabase project lkssaokcpqilrfwagxnv on 2026-10-11 by the admin
-- through the dashboard, so it has no entry in supabase_migrations.
-- Recorded here for version control; the live database already has it.
--
-- The column itself (jsonb, nullable) was added earlier outside the migration
-- history. The Fillout form sends it from a multi-select keyed
-- `i130_escalation`; api/submit.js writes webhook keys straight to columns.
-- Options: USCIS case inquiry | Congressional inquiry | Expedite request |
--          Demand letter | Writ of mandamus | None

ALTER TABLE public.form_responses
  ADD COLUMN IF NOT EXISTS i130_escalation jsonb;

COMMENT ON COLUMN public.form_responses.i130_escalation IS
  'I-130 escalation steps taken before approval, as a JSON array of Fillout labels, e.g. ["Congressional inquiry"]. NULL = not reported.';

ALTER TABLE public.form_responses
  ADD CONSTRAINT form_responses_i130_escalation_is_array
  CHECK (i130_escalation IS NULL OR jsonb_typeof(i130_escalation) = 'array');

-- Backfill: skowih reported a New Hampshire congressional inquiry before
-- their 2026-10-08 approval.
UPDATE public.form_responses
  SET i130_escalation = '["Congressional inquiry"]'
  WHERE id = 368 AND username_raw = 'skowih';
