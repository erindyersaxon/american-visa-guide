-- Migration: normalize entry_location encoding
-- Applied to Supabase project lkssaokcpqilrfwagxnv on 2026-08-26.
-- Recorded here for version control; the live database already has it applied
-- (Supabase migration name: normalize_entry_location_encoding).
--
-- entry_location was double-encoded: 36 rows held plain text
-- ("Boston, MA (BOS)") while 21 held a JSON-array string ('["Austin, TX (AUS)"]').
-- Cause: api/submit.js passed Fillout's payload through verbatim, and Fillout
-- sends multi-select answers as arrays, which PostgREST JSON-stringifies into
-- the text column. api/submit.js now flattens arrays before insert.

-- 1. Unwrap the JSON-array rows into the plain-text convention. Multiple ports
--    use '; ' as the separator, matching the rows that already store more than
--    one (ids 92, 114, 208). Empty arrays ('[]', ids 219 and 222) carry no
--    information and become NULL.
--    Verified no-op for the read path: normalizeEntryLocation in api/data.js
--    returns an identical label for every before/after pair, so the entry
--    airport distribution is unchanged. Result: 19 unwrapped, 2 nulled.
UPDATE public.form_responses
SET entry_location = nullif((
      SELECT string_agg(btrim(e), '; ' ORDER BY ord)
      FROM jsonb_array_elements_text(entry_location::jsonb) WITH ORDINALITY AS t(e, ord)
      WHERE btrim(e) <> ''
    ), '')
WHERE entry_location IS NOT NULL
  AND btrim(entry_location) ~ '^\[.*\]$';

-- 2. Backstop the invariant in the database, so a future writer that skips
--    api/submit.js cannot silently reintroduce the second encoding.
ALTER TABLE public.form_responses
  ADD CONSTRAINT entry_location_not_json_array
  CHECK (entry_location IS NULL OR btrim(entry_location) !~ '^\[.*\]$');

COMMENT ON COLUMN public.form_responses.entry_location IS
  'Port of entry as free text, e.g. "Boston, MA (BOS)". Multiple ports are separated by "; " with the clearing port first (pre-clearance counts as the port of entry). Never a JSON array - see migration 0004. Label variance is normalised on read by normalizeEntryLocation in api/data.js.';
