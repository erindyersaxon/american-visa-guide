-- Migration: national_stats reference table
-- Applied to Supabase project lkssaokcpqilrfwagxnv on 2026-11-25
-- (Supabase migration name: national_stats).
--
-- Official USCIS, State Department and NVC figures, stored long-form (one row
-- per source, series and period) so tracker queries can join to them instead
-- of typing numbers into VALUES lists. Seeded from the data files behind the
-- "I-130 to London visa: official data analysis" dashboard (Nov 2026).
--
-- period_start is the first day of the period: a federal fiscal quarter
-- (FY26 Q3 -> 2026-04-01), a fiscal year (FY2026 -> 2025-10-01), a calendar
-- month, or the as-of date for point-in-time pages. Add new periods with
-- INSERT ... ON CONFLICT (source, series, period_start) DO UPDATE.
--
-- The seed below writes one line per period and unpivots it with a LATERAL
-- VALUES list, so each figure appears once and the file stays short.
--
-- Not member data: RLS is on with no policies, so only the service role and
-- SQL editor can read it. The site does not read this table.

CREATE TABLE public.national_stats (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source       text    NOT NULL,
  series       text    NOT NULL,
  period_type  text    NOT NULL CHECK (period_type IN ('day','month','quarter','fiscal_year')),
  period_start date    NOT NULL,
  period_label text,
  value        numeric NOT NULL,
  unit         text    NOT NULL,
  source_title text,
  source_url   text,
  added_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source, series, period_start)
);

ALTER TABLE public.national_stats ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.national_stats IS
  'Official national figures (USCIS, State Department, NVC) for comparison with form_responses. Long form: one row per source, series and period (migration 0014).';


-- USCIS quarterly IR I-130 figures (federal fiscal quarters).
INSERT INTO public.national_stats (source, series, period_type, period_start, period_label, value, unit, source_title)
SELECT 'uscis_i130_quarterly', x.series, 'quarter', q.period_start::date, q.label, x.value,
       CASE WHEN x.series = 'ir_median_months' THEN 'months' ELSE 'petitions' END,
       'USCIS I-130 performance data and quarterly all-forms reports'
FROM (VALUES
    ('2023-10-01','FY24 Q1',174092,157913,17537,743584,NULL,109115,64969,430958,312626),
    ('2024-01-01','FY24 Q2',200048,161529,12239,773494,NULL,129960,70088,464655,308838),
    ('2024-04-01','FY24 Q3',183488,166002,15618,787399,NULL,110968,72517,493663,293735),
    ('2024-07-01','FY24 Q4',171974,167137,12663,784279,NULL,108863,63108,519297,264982),
    ('2024-10-01','FY25 Q1',193443,126933,9833,852120,14.3,119678,73758,567683,284437),
    ('2025-01-01','FY25 Q2',203682,147093,12734,902455,15.7,123006,80676,584481,317974),
    ('2025-04-01','FY25 Q3',188381,211975,15209,871740,14.4,109879,78502,564087,307653),
    ('2025-07-01','FY25 Q4',173595,232609,16679,801745,13.7,98506,75089,524979,276766),
    ('2025-10-01','FY26 Q1',146726,167401,15913,772234,13.1,89261,57465,497422,274812),
    ('2026-01-01','FY26 Q2',126666,132960,17243,761638,12.5,75381,51285,480881,280757),
    ('2026-04-01','FY26 Q3',126417,82636,16661,786723,13,4095,122322,62418,724305)
) AS q(period_start, label, ir_received, ir_approved, ir_denied, ir_pending, ir_median_months, scops_received, fod_received, scops_pending, fod_pending)
CROSS JOIN LATERAL (VALUES
    ('ir_received', q.ir_received::numeric),
    ('ir_approved', q.ir_approved::numeric),
    ('ir_denied', q.ir_denied::numeric),
    ('ir_pending', q.ir_pending::numeric),
    ('ir_median_months', q.ir_median_months::numeric),
    ('scops_received', q.scops_received::numeric),
    ('fod_received', q.fod_received::numeric),
    ('scops_pending', q.scops_pending::numeric),
    ('fod_pending', q.fod_pending::numeric)
) AS x(series, value)
WHERE x.value IS NOT NULL;

-- USCIS monthly reports to Congress: all I-130s, IR and preference combined.
INSERT INTO public.national_stats (source, series, period_type, period_start, period_label, value, unit, source_title)
SELECT 'uscis_report_to_congress', 'all_i130_' || x.series, 'month', m.period_start::date, m.label, x.value,
       CASE WHEN x.series = 'avg_processing_months' THEN 'months' ELSE 'petitions' END,
       'USCIS monthly reports to Congress (IR and preference combined)'
FROM (VALUES
    ('2026-09-01','Sep 2026',65887,28880,5714,2512691,2194897,17.3),
    ('2026-10-01','Oct 2026',47268,24259,4017,2532762,2226593,17.9)
) AS m(period_start, label, received, approved, denied, pending, pending_over_6_months, avg_processing_months)
CROSS JOIN LATERAL (VALUES
    ('received', m.received::numeric),
    ('approved', m.approved::numeric),
    ('denied', m.denied::numeric),
    ('pending', m.pending::numeric),
    ('pending_over_6_months', m.pending_over_6_months::numeric),
    ('avg_processing_months', m.avg_processing_months::numeric)
) AS x(series, value);

-- USCIS Historic Processing Times: IR I-130 median by fiscal year.
INSERT INTO public.national_stats (source, series, period_type, period_start, period_label, value, unit, source_title, source_url)
SELECT 'uscis_historic_processing_times', 'ir_median_months', 'fiscal_year', h.period_start::date, h.label, h.value, 'months',
       'USCIS Historic Processing Times page (queried Oct 2026)', 'https://egov.uscis.gov/processing-times/historic-pt'
FROM (VALUES
    ('2020-10-01','FY2021',10.2),
    ('2021-10-01','FY2022',10.3),
    ('2022-10-01','FY2023',11.8),
    ('2023-10-01','FY2024',11.7),
    ('2024-10-01','FY2025',14.4),
    ('2025-10-01','FY2026',12.7)
) AS h(period_start, label, value);

-- State Department immigrant visas issued at London by class, plus worldwide IR1 + CR1.
INSERT INTO public.national_stats (source, series, period_type, period_start, period_label, value, unit, source_title)
SELECT 'state_iv_issuances', x.series, 'month', l.period_start::date, to_char(l.period_start::date, 'Mon YYYY'), x.value, 'visas',
       'State Department monthly immigrant visa issuances by post and class'
FROM (VALUES
    ('2023-10-01',89,76,165,14,5,43,8,0,1,19,10,9610),
    ('2023-11-01',73,68,141,12,0,40,4,0,0,10,13,9927),
    ('2023-12-01',68,65,133,16,0,28,3,0,0,0,13,9713),
    ('2024-01-01',94,71,165,19,1,25,3,0,0,7,6,9812),
    ('2024-02-01',62,39,101,10,1,35,1,0,1,15,7,9341),
    ('2024-03-01',84,50,134,8,1,29,6,0,2,24,19,8888),
    ('2024-04-01',108,89,197,7,3,38,0,0,0,7,15,11015),
    ('2024-05-01',83,50,133,14,4,32,8,0,6,23,37,9837),
    ('2024-06-01',67,39,106,11,0,31,3,4,1,14,29,7541),
    ('2024-07-01',24,18,42,6,3,15,19,11,5,53,29,5420),
    ('2024-08-01',56,57,113,8,1,29,18,3,2,41,30,5368),
    ('2024-09-01',81,46,127,13,3,31,6,4,8,21,28,6164),
    ('2024-10-01',68,46,114,15,5,37,8,1,0,21,52,10216),
    ('2024-11-01',70,64,134,7,4,32,7,3,7,5,34,8981),
    ('2024-12-01',69,35,104,24,0,28,6,10,3,9,31,9492),
    ('2025-01-01',117,110,227,17,2,43,8,4,3,11,27,11034),
    ('2025-02-01',72,40,112,16,2,20,5,5,0,16,8,9885),
    ('2025-03-01',67,65,132,27,0,46,8,2,4,21,58,10720),
    ('2025-04-01',63,43,106,11,1,27,4,4,2,14,17,10541),
    ('2025-05-01',68,47,115,17,1,25,13,0,8,30,23,8881),
    ('2025-06-01',78,50,128,15,3,35,14,0,0,20,27,8453),
    ('2025-07-01',67,40,107,17,5,18,2,0,1,46,29,8502),
    ('2025-08-01',56,51,107,8,0,23,21,2,7,19,15,8131),
    ('2025-09-01',56,45,101,7,4,25,4,6,1,48,17,9264),
    ('2025-10-01',99,81,180,10,1,16,8,0,5,37,27,10338),
    ('2025-11-01',68,47,115,9,0,15,16,4,3,28,12,7936),
    ('2025-12-01',87,46,133,11,2,32,8,4,0,24,34,9471),
    ('2026-01-01',89,42,131,15,0,29,15,1,0,25,39,7569),
    ('2026-02-01',85,44,129,16,0,31,9,0,1,17,20,6847)
) AS l(period_start, ir1, cr1, spouse_total, ir2, cr2, ir5, f1, f2a, f2b, f3, f4, worldwide_ir1_cr1)
CROSS JOIN LATERAL (VALUES
    ('london_ir1', l.ir1::numeric),
    ('london_cr1', l.cr1::numeric),
    ('london_spouse_total', l.spouse_total::numeric),
    ('london_ir2', l.ir2::numeric),
    ('london_cr2', l.cr2::numeric),
    ('london_ir5', l.ir5::numeric),
    ('london_f1', l.f1::numeric),
    ('london_f2a', l.f2a::numeric),
    ('london_f2b', l.f2b::numeric),
    ('london_f3', l.f3::numeric),
    ('london_f4', l.f4::numeric),
    ('worldwide_ir1_cr1', l.worldwide_ir1_cr1::numeric)
) AS x(series, value);

-- Point-in-time pages: NVC Timeframes (23 Nov 2026) and USCIS Case Processing Times (25 Nov 2026).
INSERT INTO public.national_stats (source, series, period_type, period_start, period_label, value, unit, source_title, source_url) VALUES
  ('nvc_timeframes', 'case_creation_days_behind', 'day', '2026-11-23', 'Working on 2 Nov 2026', 21, 'days',
   'NVC Timeframes page', 'https://travel.state.gov/content/travel/en/us-visas/immigrate/nvc-timeframes.html'),
  ('nvc_timeframes', 'document_review_days_behind', 'day', '2026-11-23', 'Working on 14 Sep 2026', 70, 'days',
   'NVC Timeframes page', 'https://travel.state.gov/content/travel/en/us-visas/immigrate/nvc-timeframes.html'),
  ('nvc_timeframes', 'public_inquiry_form_reply_days_behind', 'day', '2026-11-23', 'Working on 17 Nov 2026', 6, 'days',
   'NVC Timeframes page', 'https://travel.state.gov/content/travel/en/us-visas/immigrate/nvc-timeframes.html'),
  ('uscis_case_processing_times', 'ir_p80_months_field_offices', 'day', '2026-11-25', 'Checked 25 Nov 2026', 29.5, 'months',
   'USCIS Case Processing Times page', 'https://egov.uscis.gov/processing-times/');
