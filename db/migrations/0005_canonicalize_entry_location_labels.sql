-- Migration: canonicalize entry_location labels
-- Applied to Supabase project lkssaokcpqilrfwagxnv on 2026-08-26.
-- Recorded here for version control; the live database already has it applied
-- (Supabase migration name: canonicalize_entry_location_labels).
--
-- Follows 0004, which fixed the *encoding*. This fixes the *labelling*: the
-- same airport was stored under up to four spellings ("Atlanta (ATL)",
-- "Atlanta, GA (ATL)", "Atlanta, Georgia (ATL)"), and some rows carried no
-- IATA code at all ("Phoenix Sky Harbor, Arizona"). 36 distinct values over
-- 55 non-null rows collapse to 24.

-- Canonical entry_location label: "City, ST (CODE)".
-- Pure function, so the backfill below and the write-side trigger share one
-- source of truth. Unrecognised text passes through unchanged (e.g. "Other"),
-- so this can never reject or lose a submission.
CREATE OR REPLACE FUNCTION public.canonical_entry_location(raw text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $fn$
  WITH input AS (SELECT btrim(coalesce(raw, '')) AS v),
  code_map(code, label) AS (VALUES
    ('ATL','Atlanta, GA (ATL)'), ('AUS','Austin, TX (AUS)'), ('BNA','Nashville, TN (BNA)'),
    ('BOS','Boston, MA (BOS)'), ('BWI','Baltimore, MD (BWI)'), ('CLE','Cleveland, OH (CLE)'),
    ('CLT','Charlotte, NC (CLT)'), ('CVG','Cincinnati, OH (CVG)'), ('DEN','Denver, CO (DEN)'),
    ('DFW','Dallas/Fort Worth, TX (DFW)'), ('DTW','Detroit, MI (DTW)'), ('EWR','Newark, NJ (EWR)'),
    ('IAD','Washington, DC (IAD)'), ('IAH','Houston, TX (IAH)'), ('JFK','New York, NY (JFK)'),
    ('LAS','Las Vegas, NV (LAS)'), ('LAX','Los Angeles, CA (LAX)'), ('MCO','Orlando, FL (MCO)'),
    ('MIA','Miami, FL (MIA)'), ('MSP','Minneapolis, MN (MSP)'), ('ORD','Chicago, IL (ORD)'),
    ('PDX','Portland, OR (PDX)'), ('PHL','Philadelphia, PA (PHL)'), ('PHX','Phoenix, AZ (PHX)'),
    ('PIT','Pittsburgh, PA (PIT)'), ('RDU','Raleigh-Durham, NC (RDU)'), ('SAN','San Diego, CA (SAN)'),
    ('SEA','Seattle, WA (SEA)'), ('SFO','San Francisco, CA (SFO)'), ('SJU','San Juan, PR (SJU)'),
    ('SLC','Salt Lake City, UT (SLC)'), ('STL','St Louis, MO (STL)'), ('TPA','Tampa, FL (TPA)'),
    -- Pre-clearance posts are outside the US, so the slot after the city is the
    -- country rather than a state.
    ('DUB','Dublin, Ireland (DUB)'), ('SNN','Shannon, Ireland (SNN)'), ('YUL','Montreal, Canada (YUL)')
  ),
  -- Fallbacks for text that carries no IATA code.
  keyword_map(kw, code, pri) AS (VALUES
    ('dublin','DUB',1), ('shannon','SNN',2), ('montreal','YUL',3),
    ('seattle','SEA',4), ('phoenix','PHX',5), ('boston','BOS',6), ('atlanta','ATL',7),
    ('los angeles','LAX',8), ('chicago','ORD',9), ('dulles','IAD',10), ('newark','EWR',11),
    ('denver','DEN',12), ('orlando','MCO',13), ('san juan','SJU',14), ('austin','AUS',15)
  ),
  parts AS (
    SELECT p.ord, btrim(p.part) AS part
    FROM input, LATERAL unnest(string_to_array(input.v, ';')) WITH ORDINALITY AS p(part, ord)
    WHERE input.v <> ''
  ),
  coded AS (
    SELECT parts.ord,
      coalesce(
        (SELECT cm.label FROM code_map cm
          WHERE upper(parts.part) LIKE '%(' || cm.code || ')%'),
        (SELECT cm.label FROM code_map cm JOIN keyword_map km ON km.code = cm.code
          WHERE lower(parts.part) LIKE '%' || km.kw || '%'
          ORDER BY km.pri LIMIT 1),
        nullif(parts.part, '')
      ) AS norm
    FROM parts
  )
  SELECT nullif(string_agg(norm, '; ' ORDER BY ord), '')
  FROM coded WHERE norm IS NOT NULL;
$fn$;

-- Backfill. 27 of 55 non-null rows change; the other 28 are already canonical.
-- Verified no-op for the read path: normalizeEntryLocation in api/data.js keys
-- off the IATA code, so the entry airport distribution is byte-identical
-- before and after (21 airports, 55 rows).
UPDATE public.form_responses
SET entry_location = public.canonical_entry_location(entry_location)
WHERE entry_location IS NOT NULL
  AND entry_location IS DISTINCT FROM public.canonical_entry_location(entry_location);

-- Keep it canonical on write, whatever the writer. Unmapped values pass
-- through, so a new airport is stored verbatim until it is added to the map.
CREATE OR REPLACE FUNCTION public.form_responses_canonicalize_entry_location()
RETURNS trigger
LANGUAGE plpgsql
AS $tg$
BEGIN
  NEW.entry_location := public.canonical_entry_location(NEW.entry_location);
  RETURN NEW;
END;
$tg$;

DROP TRIGGER IF EXISTS form_responses_canonical_entry_location ON public.form_responses;
CREATE TRIGGER form_responses_canonical_entry_location
  BEFORE INSERT OR UPDATE OF entry_location ON public.form_responses
  FOR EACH ROW EXECUTE FUNCTION public.form_responses_canonicalize_entry_location();

COMMENT ON COLUMN public.form_responses.entry_location IS
  'Port of entry, canonical form "City, ST (CODE)" - e.g. "Boston, MA (BOS)". Pre-clearance posts use the country in the state slot ("Dublin, Ireland (DUB)"). Multiple ports are separated by "; " with the clearing port first. Never a JSON array (migration 0004). Canonicalised on write by trigger form_responses_canonical_entry_location (migration 0005); unmapped values pass through verbatim.';

-- Adding a new airport: add one row to code_map and re-run this file. Existing
-- rows for that airport are picked up by the backfill; the trigger handles new
-- ones. The function is idempotent, so re-running is safe.
