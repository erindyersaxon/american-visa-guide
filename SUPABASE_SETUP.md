# Supabase Integration Setup

This document describes how to wire up Supabase data sources to American Visa Guide.

## Overview

The site fetches live community data from Supabase tables:
- `il_drops` — Interview Letter drop history
- `community_stats` — Aggregate community statistics
- `member_timelines` — Individual member timeline data
- `weekly_activity` — Current week's community activity
- `settlement_data` — Where members have settled (state-level data)

All data fetches use a 5-minute cache to avoid repeated queries on the same page session.

## Environment Variables

Two environment variables must be set in Vercel:

- `SUPABASE_URL` — Your Supabase project URL (e.g., https://your-project.supabase.co)
- `SUPABASE_ANON_KEY` — Your Supabase public anon key (safe to expose in frontend code)

### Setting Up in Vercel

1. Go to Vercel project settings
2. Under "Environment Variables", add:
   - **SUPABASE_URL** = your-supabase-url
   - **SUPABASE_ANON_KEY** = your-supabase-anon-key
3. Redeploy the project

At build time, the `scripts/generate-config.js` script will create `public/config.json` with these values.

## File Structure

```
public/
  config.json                    (generated at build time)
  config.json.example            (template for manual setup)
  index.html                     (loads Supabase data)
  life.html                      (loads settlement data)
  js/
    env.js                       (loads environment variables)
    supabase.js                  (fetch functions)
    main.js                      (general utilities)

scripts/
  generate-config.js             (build-time config generator)

vercel.json                      (calls generate-config.js on build)
```

## Data Fetching Functions

All functions are in `public/js/supabase.js` and exported as ES modules:

### fetchILDrops()
Returns array of IL drop records with columns: date, gap_days, time_uk, dq_date_from, dq_date_to, dq_range_days, il_count, notes

Used by: index.html (drop history table, metrics)

### fetchCommunityStats()
Returns single object with: total_members, waiting_for_il, dq_to_il_avg_all, dq_to_il_avg_6m, dq_to_il_avg_3m, il_to_interview_avg_all, il_to_interview_avg_6m, approved_pct, pending_221g_pct, denied_pct, pickup_days_avg, mail_days_avg, interview_count_total

Used by: index.html (stats cards, pipeline status, passport return times)

### fetchMemberTimelines()
Returns array of individual timeline records with columns: i130_to_nvc_days, nvc_fee_to_docs_days, docs_to_dq_days, dq_to_il_days, il_to_medical_days, medical_to_interview_days, interview_to_passport_days, visa_category, embassy

Used by: index.html (per-stage timing table, trend analysis)

### fetchWeeklyActivity()
Returns single object with: interviews_this_week, medicals_this_week, flights_this_week, dq_this_week, i130_approved_this_week

Used by: index.html (This week in the community cards)

### fetchSettlementData()
Returns array with columns: state_code, state_name, member_count, gc_median_days, ssn_median_days, intervention_rate

Used by: life.html (settlement table)

## Error Handling

All fetch functions return `null` on error. Pages handle this gracefully with static fallback data:

- If `null` is returned, the page displays pre-defined static data
- A "Data Notice" banner appears on the homepage to let users know they're seeing cached data

## Local Development

For local testing without Vercel environment variables:

1. Create `public/config.json`:
```json
{
  "SUPABASE_URL": "https://your-project.supabase.co",
  "SUPABASE_ANON_KEY": "your-anon-key"
}
```

2. Serve the `public` folder (e.g., `python -m http.server` or `npx http-server public`)

3. Open http://localhost:8000

## Caching

All data is cached for 5 minutes (300,000ms) in-memory. On each page load:
1. Check if cached data exists and is fresh
2. If fresh, return it immediately
3. If stale or missing, fetch from Supabase
4. Cache the result for the next 5 minutes

To bypass cache during development, clear browser cache or add a timestamp parameter.

## FillOut Integration

Forms are linked via:

- **Submit Timeline**: https://forms.fillout.com/t/dTRqnkx9uxus
  - Link placed on index.html ("This Week" section)
  - Link placed on life.html (settlement data section)

Users can submit their dates (I-130 approval, NVC, DQ, IL, Medical, Interview, Passport arrival) to populate Supabase tables.

## Testing Checklist

- [ ] Load index.html and verify data appears in all sections
- [ ] Verify "This Week" cards show numbers (not skeleton loaders)
- [ ] Verify IL Drop History table populates
- [ ] Verify Interview Outcomes percentages appear
- [ ] Verify Passport Return Times show days
- [ ] Verify Per-Stage Timing table populates
- [ ] Load life.html and verify settlement table populates with state data
- [ ] Verify "Submit timeline" links work and open FillOut form
- [ ] Test with invalid Supabase key to verify fallback data displays
- [ ] Check console for no JavaScript errors

## Troubleshooting

### Data not appearing
1. Verify Supabase environment variables are set in Vercel
2. Check browser console for errors
3. Verify Supabase tables exist and have data
4. Check network tab to see if API requests are being made
5. Verify anon key has SELECT permissions on all tables

### Skeleton loaders persist
1. Check for JavaScript errors in console
2. Verify config.json was generated (check build logs)
3. Try clearing browser cache

### "Data Notice" banner appears
This indicates Supabase fetch failed and static fallback data is being used. Check:
1. Supabase connection
2. Network requests (DevTools → Network tab)
3. Supabase table data exists
4. Anon key permissions

## Supabase Tables

Required tables and structure:

```sql
-- il_drops
CREATE TABLE il_drops (
  date DATE,
  gap_days INTEGER,
  time_uk VARCHAR,
  dq_date_from DATE,
  dq_date_to DATE,
  dq_range_days INTEGER,
  il_count INTEGER,
  notes TEXT
);

-- community_stats
CREATE TABLE community_stats (
  total_members INTEGER,
  waiting_for_il INTEGER,
  dq_to_il_avg_all INTEGER,
  dq_to_il_avg_6m INTEGER,
  dq_to_il_avg_3m INTEGER,
  il_to_interview_avg_all INTEGER,
  il_to_interview_avg_6m INTEGER,
  approved_pct INTEGER,
  pending_221g_pct INTEGER,
  denied_pct INTEGER,
  pickup_days_avg INTEGER,
  mail_days_avg INTEGER,
  interview_count_total INTEGER
);

-- member_timelines
CREATE TABLE member_timelines (
  i130_to_nvc_days INTEGER,
  nvc_fee_to_docs_days INTEGER,
  docs_to_dq_days INTEGER,
  dq_to_il_days INTEGER,
  il_to_medical_days INTEGER,
  medical_to_interview_days INTEGER,
  interview_to_passport_days INTEGER,
  visa_category VARCHAR,
  embassy VARCHAR
);

-- weekly_activity
CREATE TABLE weekly_activity (
  interviews_this_week INTEGER,
  medicals_this_week INTEGER,
  flights_this_week INTEGER,
  dq_this_week INTEGER,
  i130_approved_this_week INTEGER,
  week_start DATE
);

-- settlement_data
CREATE TABLE settlement_data (
  state_code VARCHAR,
  state_name VARCHAR,
  member_count INTEGER,
  gc_median_days INTEGER,
  ssn_median_days INTEGER,
  intervention_rate DECIMAL
);
```

All tables should have RLS (Row Level Security) disabled to allow anon key access, or have a policy that grants SELECT to `anon` role.
