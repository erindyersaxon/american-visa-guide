# Data comparison handoff: tracker vs official data

Written 25 November 2026, to resume this work in a new chat. It covers the review of the London I-130 dashboard, the new `national_stats` table, the tracker-vs-USCIS comparison page, and the tracker data fixes.

**To resume:** open a new chat in `/Users/erinsaxon/AVG` and say something like *"Read DATA_COMPARISON_HANDOFF.md, then pick up the open items."*

## Where things are

| What | Where | State |
|---|---|---|
| London I-130 dashboard ("I-130 to London visa: what the official data shows") | https://claude.ai/artifact/CBKCUAarCbzDkdHorbRLzr | Private. Reviewed and reworded 25 Nov; self-check passed |
| Comparison page ("Does the Tracker Match USCIS?") | https://claude.ai/artifact/RsaBq48RjZfM9oNDEFgGCJ | Private, version 2. Snapshot of 25 Nov; does not update |
| Official figures in Supabase | `public.national_stats` (project `lkssaokcpqilrfwagxnv`) | Live, 465 rows, RLS on with no policies (SQL editor / service role only) |
| Migration files | `db/migrations/0014`, `0015`, `0016` | Committed and pushed to `main` (`50e64f4`, `2816922`) |

## 1. Dashboard review

The dashboard's arithmetic all checked out. The wording fixes made on 25 Nov:

- Lede and first tile now compare April to June 2026 with three baselines, not just the unusually busy April to June 2025 quarter: −56.3% vs Apr–Jun 2025, −45.3% vs Apr–Jun 2024, −33.9% vs Jan–Mar 2026.
- Queue paragraph: "April 2025 to March 2026" (was July 2025). "Receipts exceeded decisions by 27,120"; the reported pending count rose 25,085.
- Field Operations heading softened to "USCIS now logs most of the IR queue under Field Operations", with a paragraph saying the one-quarter shift looks more like a reporting change than files moving.
- Denials heading now says the share rose because approvals fell; counts given (15,209 → 16,661 denials; 211,975 → 82,636 approvals).
- Processing-times intro explains the 13.0 vs 29.5 months figures cover different groups of cases.
- The "no member has reported a second interview after a 212(a)(4) refusal" bullet was replaced with the 24 Oct Discord report (1 Oct refusals, at least one 212(a)(4), given new dates; unconfirmed by a second report).
- February 2026 worldwide figure notes July and August 2024 were lower.

### Resolved on the dashboard (25 Nov, second session)

1. **FY26 Q3 office split checked** against `i130_performance_data_fy2026_q3_v1.xlsx` (USCIS, queried 07/2026): SCOPS IR received 4,095 and pending 62,418 match exactly. Each service center logged 814–826 IR receipts, yet they still approved ~25,300 IR. That evenness points to a coding or reporting change, not a real move, so the softened heading stays. A paragraph saying this was added under the Field Operations section. USCIS's page lists no FY26 Q2 or Q4 office file now.
2. **Links added:** Policy Manual Vol. 6 Pt B Ch. 5 (quote verified verbatim), PA-2025-12 PDF, FOD directorate page ("88 field offices", last reviewed 9 May 2025), State's 75-country pause page. New sentence: a federal court ended the pause on 21 Aug 2026 (*CLINIC v. Rubio*).
3. **Member-report box:** removed the September cancel / Oct–Nov reschedule bullet.

## 2. The `national_stats` table

Long format: one row per `source`, `series`, `period_start` (unique together). `period_start` is the first day of the period: FY26 Q3 → `2026-04-01`, FY2026 → `2025-10-01`.

| source | rows | covers |
|---|---|---|
| `uscis_i130_quarterly` | 95 | FY24 Q1–FY26 Q3: IR received, approved, denied, pending, median months, SCOPS/FOD split |
| `state_iv_issuances` | 348 | Oct 2023–Feb 2026: London visas by class + worldwide IR1/CR1 |
| `uscis_report_to_congress` | 12 | Sep–Oct 2026: all I-130s |
| `uscis_historic_processing_times` | 6 | FY2021–FY2026 IR median |
| `nvc_timeframes` | 3 | As of 23 Nov 2026 |
| `uscis_case_processing_times` | 1 | 80th percentile, field offices, 25 Nov 2026 |

Add new periods with `INSERT ... ON CONFLICT (source, series, period_start) DO UPDATE`, and record each batch as a new migration file.

### Comparison queries

I-130 wait, tracker vs USCIS, by fiscal quarter of approval:

```sql
with national as (
  select period_label,
         'FY' || to_char(period_start + interval '3 months','YY') || 'Q' || extract(quarter from period_start + interval '3 months') as fiscal_quarter,
         value as uscis_median_months
  from national_stats
  where source = 'uscis_i130_quarterly' and series = 'ir_median_months'
),
community as (
  select 'FY' || to_char(i130_approval + interval '3 months','YY') || 'Q' || extract(quarter from i130_approval + interval '3 months') as fiscal_quarter,
         (i130_approval - i130_priority_date) / 30.4375 as months_waited
  from form_responses
  where embassy ilike 'london%' and visa_category in ('CR1/IR1','IR2','CR2/IR2','IR5')
    and i130_priority_date is not null and i130_approval > i130_priority_date
)
select n.period_label, n.uscis_median_months, count(c.months_waited) as members,
       round(percentile_cont(0.5) within group (order by c.months_waited)::numeric, 1) as community_median_months
from national n left join community c using (fiscal_quarter)
group by 1, 2 order by 1;
```

London coverage (tracker approvals vs State Department issuances):

```sql
with national as (
  select period_start as month, value as issued
  from national_stats
  where source = 'state_iv_issuances' and series = 'london_spouse_total'
),
community as (
  select date_trunc('month', visa_approval_date)::date as month, count(*) as reported
  from form_responses
  where embassy ilike 'london%' and visa_category = 'CR1/IR1' and visa_approval_date is not null
  group by 1
)
select to_char(n.month, 'Mon YYYY') as month, n.issued, coalesce(c.reported, 0) as tracker,
       round(100.0 * coalesce(c.reported, 0) / n.issued, 1) as coverage_pct
from national n left join community c using (month)
order by n.month;
```

### Findings so far

- Tracker I-130 medians match USCIS IR medians within 0.7 months for FY25 Q2–FY26 Q2 (11, 31, 46, 49, 37 members).
- FY26 Q3 onward: only 10 members approved since April 2026, mostly long waits. Too few to compare.
- Tracker captures under 3% of London spouse visas in any month through Feb 2026. 65 of 79 tracker visa approvals fall in Mar–Nov 2026 (53 in Mar–Jul), which the State Department hasn't published yet.

## 3. Comparison page

Two interactive charts (member dots + quarterly medians; London issuances vs tracker approvals on one scale), tables under each, a "How to read this" section, and sources. Site fonts and slate palette, light and dark. Built from a 25 Nov snapshot. The source file is in the old session's scratchpad, so a new chat should rebuild from the artifact (Artifact tool, `action: "read"`) before changing it.

**Decided 25 Nov:** member-level dots are fine to show publicly as long as they carry no usernames or other personal details; a dot on a date or time period is fine. Checked: the page's data is `[approval date, months waited]` pairs only, with quarter-level tooltips and no usernames or row ids in the page source.

## 4. Tracker data fixes (applied and committed)

- **0015:** cleared unsent interview-letter dates on rows 338, 342 and 347. Originals kept in `notes`. Latest London letter in the tracker is now 14 Jul 2026.
- **0016:** row 338 DQ date set to 14 Sep 2026, from the admin; still waiting on an interview letter as of 25 Nov.

## Next steps

1. ~~Resolve the three open dashboard items above.~~ Done.
2. When USCIS publishes FY26 Q4 and the State Department publishes March 2026 onward: add rows to `national_stats` (new migration), rerun both queries, update the dashboard and the comparison page.
3. Possible further comparisons: NVC document review (tracker docs-submitted → DQ vs NVC's 70 days behind), tracker 221(g)/refusal share, and how many members report a USCIS petitioner interview (`i130_interview`).
4. Optionally commit `SITE_REVIEW_HANDOFF.md` and this file.
