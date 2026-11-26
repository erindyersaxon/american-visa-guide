# Official data analysis and data visualisation: design

Date: 2026-11-25
Status: analysis complete; chart designs proposed, awaiting owner review before build
Working dashboard (private, for checking figures): https://claude.ai/artifact/CBKCUAarCbzDkdHorbRLzr

## Goal

Publish what official USCIS and State Department data says about the I-130 to London
visa journey, as a small set of charts members can read on a phone. Pair the official
numbers with the community tracker, which is the only source for London after February 2026.

The charts should read as americanvisaguide.com's own reporting: Civic Editorial palette,
plain-English titles that state the finding, a source line on every chart, and member-facing
text written in the Guide's voice.

## What the data shows

All IR figures are immediate relatives of U.S. citizens (spouses, parents, unmarried children
under 21). Quarters are federal fiscal quarters; FY26 Q3 is April to June 2026.

1. **USCIS decides far fewer IR petitions than a year ago.** 33,099 decisions a month in
   FY26 Q3 against 75,728 a month in FY25 Q3 (down 56.3%). Receipts (126,417) exceeded
   decisions (99,297), so the IR queue grew by 27,120 that quarter after three quarters of
   shrinking.
2. **USCIS moved the IR queue to Field Operations in April to June 2026.** Service centers
   (SCOPS) held 480,881 pending IR petitions at the end of March 2026 and 62,418 at the end of
   June. Field Operations (88 field offices plus the National Benefits Center) held 724,305,
   92.1% of the queue, up from 36.9%. Service-center receipts fell to 4,095 for the quarter.
   USCIS has published no notice of the move.
3. **Why a field office matters.** Service centers decide on paper and never interview. The
   Policy Manual (Vol. 6, Part B, Ch. 5) says a service center refers a petition that needs an
   interview to the field office with jurisdiction, which schedules it "according to its
   availability". PA-2025-12 (1 August 2025) widened the list of cases that require an
   interview. No source says which field office handles a petitioner living abroad.
4. **Denials rose.** 16.8% of IR decisions in FY26 Q3 were denials, against 6.7% in FY25 Q3.
5. **The monthly reports to Congress show the same direction** (IR and preference combined):
   September 2026 receipts 65,887 vs decisions 34,594; October 47,268 vs 28,276. 87.9% of the
   2,532,762 pending I-130s were older than six months in October 2026.
6. **Four USCIS processing times measure four different things.** Quarterly median 13.0 months
   (FY26 Q3), fiscal-year median 12.7 (FY2026), monthly average 17.9 (October 2026, all
   I-130s), and 80th percentile 29.5 for IR at all field offices (Case Processing Times page,
   checked 25 November 2026). The first three describe cases already decided. USCIS told the
   CIS Ombudsman (2026 report) that the processing-time figure and the case inquiry date come
   from the same data at different percentiles.
7. **London issued spouse visas at a steady rate through February 2026.** Median 128 IR1 + CR1
   visas a month (middle half 107 to 134) over 29 months. October 2025 to February 2026: 688,
   against 691 a year earlier. Worldwide spouse issuances fell to 6,847 in February 2026 after
   the State Department paused immigrant visas for nationals of 75 countries from 21 January 2026.
8. **London serves more than British nationals.** In FY2024 London issued 1,557 spouse visas
   while UK-born applicants received 1,077 worldwide, so at least 31% of London's spouse visas
   went to people born elsewhere (Report of the Visa Office 2024, Tables VIII and XIV).
9. **Refusal grounds (worldwide, FY2024, no post breakdown).** 221(g): 225,278 immigrant-visa
   findings, 191,245 overcome. Public charge 212(a)(4): 1,008 findings, 846 overcome. Findings
   and overcomes can fall in different fiscal years.
10. **NVC as of 23 November 2026.** Case creation working on 2 November (21 days behind);
    document review on 14 September (70 days); Public Inquiry Form replies on 17 November (6 days).
11. **Money does not explain the slowdown.** The fee account ended FY2024 with a $2.57B
    carryover and projected $7.01B revenue against $6.56B obligations for FY2025. The FY2026
    budget request raised Adjudication Operations staffing from 12,670 to 12,840 FTE.

## Member reports (London, since February 2026)

Official issuance data stops at February 2026. Members of the London channel report:

- London sent its most recent interview letters on 14 July 2026, to applicants DQ'd on or before
  14 April 2026.
- The embassy scheduled those interviews for September, cancelled them, and rescheduled them for
  October and November after a period members describe as training.
- No new interview letters since 14 July 2026.
- A few notices of second interviews: some for applicants held under the January 2026 immigrant
  visa pause, some after 221(g) refusals.
- No member has reported a second interview after a public charge refusal under 212(a)(4).

Before publishing, confirm the 14 July date and the 14 April DQ cutoff against
`public.form_responses`.

## Data files

`data/official-stats/` (all fixed snapshots; refresh by re-running the scripts):

| File | Contents | Source |
|---|---|---|
| `ir_quarterly.csv` | IR I-130 received, approved, denied, pending, median months, SCOPS/FOD split, FY24 Q1 to FY26 Q3 | USCIS I-130 performance data; quarterly all-forms reports |
| `uscis_quarterly_forms_extract.csv` | I-130, I-485 family, I-129F, DS-230 rows from each quarterly all-forms report | USCIS quarterly all-forms reports |
| `i130_monthly_all.csv` | All I-130s, Sep and Oct 2026 | USCIS reports to Congress (appropriation requirement) |
| `time_measures.csv` | The four processing-time measures | See Source column |
| `ir_historic_median.csv` | IR median by fiscal year, FY2021 to FY2026 | USCIS Historic Processing Times page, queried Oct 2026 |
| `nvc_timeframes.csv` | NVC working dates as of 23 Nov 2026 | NVC Timeframes page |
| `london_issuances.csv` | London family classes by month, plus worldwide IR1 + CR1, Oct 2023 to Feb 2026 | State Department monthly IV issuances by post |
| `london_issuances_all_classes.csv` | Every London visa class by month | Same |
| `rvo_fy2015_2024_london_and_uk_born.csv` | London IV total and UK-born IR visas by fiscal year | Report of the Visa Office 2024, Tables XII and XIV |
| `charts/chart1..4_*.csv` | Datawrapper-ready chart data | Built by `build_chart_csvs.py` |

Scripts in `scripts/official-stats/`:

- `extract_uscis.py SOURCE_DIR OUT.csv` rebuilds `ir_quarterly.csv` from the USCIS spreadsheets
  (`p_fyYYqN.xlsx`, `q_fyYYqN.xlsx`). The National Benefits Center counts as Field Operations;
  USCIS places it under that directorate.
- `extract_dos.py TEXT_DIR OUT.csv` parses the State Department by-post PDFs after `pdftotext -layout`.
- `build_chart_csvs.py` writes the four chart files.

Refresh cadence: USCIS quarterly data about three months after quarter end; State Department
monthly issuances when posted (none after February 2026 as of 25 November 2026); NVC timeframes
weekly; Case Processing Times monthly, logged with the date checked.

## Tool

Datawrapper, free plan. Responsive embeds that read on phones, one line of embed code, no
cookies or trackers, unlimited published charts. The free plan keeps a "Created with Datawrapper"
line under each chart. Custom fonts need a paid plan; on the free plan pick the closest built-in
serif and sans. Datawrapper's API can update chart data, so a later job could push refreshed CSVs
without code changes to the site.

Not Tableau Public (heavy embeds, weak on phones, published data downloadable by anyone) and not
Flourish (free-plan visualisations can be duplicated by any user).

## Charts

Every chart: title states the finding; one-line description; source line with date checked;
alt text; no legend where direct labels fit. Numbers formatted with thousands separators.

### Chart 1: "How long USCIS takes depends on which number you read"

- Type: dot plot (Datawrapper "Dot plot" or "Range plot"), one row per measure, shared months axis 0 to 30.
- Data: `charts/chart1_processing_time_measures.csv`.
- Highlight the 80th-percentile row in `--color-mark` (#991B1B); others in slate.
- Description: "The first three describe cases USCIS has already decided. The last is the figure
  USCIS uses before it accepts an inquiry."
- Source: "USCIS quarterly report FY26 Q3; Historic Processing Times; report to Congress Oct 2026;
  Case Processing Times, checked [date]."

### Chart 2: "USCIS moved the spouse-and-parent queue to field offices"

- Type: stacked column, quarter ending Dec 2023 to Jun 2026.
- Data: `charts/chart2_queue_by_directorate.csv`.
- Colours: service centers slate #334155; field offices and NBC #0F172A. One annotation on Jun 2026:
  "Apr to Jun 2026: 92% now at field offices".
- Description: "Pending immediate-relative I-130s at the end of each quarter. Service centers
  decide on paper; field offices hold interviews."

### Chart 3: "USCIS now receives more petitions than it decides"

- Type: line chart, two lines, points marked, straight segments.
- Data: `charts/chart3_received_vs_decided.csv`.
- Shade the area between the lines for FY26 Q3 only, with annotation "Queue grew by 27,120".

### Chart 4: "London issued spouse visas at a steady rate through February 2026"

- Type: column chart with a shaded range band (Datawrapper column chart; add the band with
  "Range highlight" using the low/high columns, then hide those columns as series).
- Data: `charts/chart4_london_spouse_visas.csv`.
- Annotation at the right edge: "Official data ends February 2026."
- Place the member-reports box (above) directly under this chart.

### Chart 5: "The whole journey, from filing to visa"

- Type: horizontal bar or simple timeline, one row per stage.
- Official rows: USCIS I-130 (80th percentile, dated); NVC document review (days behind, dated).
- Tracker rows from `public.form_responses`, filtered `embassy = 'London, United Kingdom'`,
  deduplicated on `LOWER(TRIM(username_raw))` keeping the latest `submitted_at` (same as
  `api/data.js`): DQ to interview letter, interview letter to interview, interview to visa in hand.
- Show median and IQR; suppress below n=10; small-sample warning for n=10 to 30. Never means.
- Confirm column names against the schema before writing the query.

## Placement (proposed)

- `/guide/i130` (`public/guide/i130.html`): charts 1 to 3. Chart 1 also suits
  `/guide/delayed-i130`, where members weigh escalation against the published time.
- `/guide/waiting` (`public/guide/waiting.html`, IL drops): chart 4, the member-reports box, and a
  dated status line: "Last London interview letters: 14 July 2026, for DQ dates up to 14 April 2026.
  Checked [date]."
- `/data` (`public/data.html`): chart 5 next to the existing tracker views.

## Design rules

- Palette: slate #0F172A, steel #334155, off-white #F8FAFC, border #E2E8F0, red #991B1B only for
  the single highlight in a chart. Red never signals alarm.
- Type: Georgia for chart titles where the plan allows; Public Sans for labels.
- Wrap each embed in the site's card style (1px border, `rounded-md`), not drop shadows.
- Definitions and method go in one closed `<details>` at the foot of the page.

## Writing rules for chart text

Plain words, active voice, a named actor ("USCIS moved", not "the queue was moved"). No em dashes.
State the finding, then one sentence on what it means for a member's case. Say "members report"
for community data and "USCIS data shows" for official data; never mix them in one sentence.

## What the data cannot show

- Which field office holds a petition from a U.S. citizen living in the UK.
- Spouse cases alone (IR combines spouses, parents, children).
- Reasons for denial, RFE or interview counts, or any single case's wait.
- Anything between I-130 approval and the visa at London after February 2026, except member data.
- Exact pending counts: USCIS warns that transfers and closures don't show and revises past figures.

## Open questions for the owner

1. Confirm placement above, or name the pages.
2. Datawrapper free plan with attribution, or Pro for custom fonts and no attribution?
3. Confirm the member-report dates against the tracker before publishing.

## Sources

- USCIS Immigration and Citizenship Data: quarterly all-forms reports FY24 Q1 to FY26 Q3; I-130
  performance data FY24 Q1 to FY26 Q3; reports to Congress, Sep and Oct 2026.
- USCIS Historic Processing Times (queried Oct 2026); Case Processing Times (25 Nov 2026).
- USCIS Policy Manual Vol. 6, Part B, Ch. 5 (current as of 27 Oct 2026); Policy Alert PA-2025-12.
- USCIS Field Operations Directorate and Service Center Operations Directorate pages; USCIS FY2026
  Congressional Budget Justification; IEFA FY2024 Statement of Financial Condition.
- CIS Ombudsman Annual Reports 2025 and 2026.
- State Department monthly IV issuances by post, Oct 2023 to Feb 2026; Report of the Visa Office 2024.
- NVC Timeframes (23 Nov 2026).
- Datawrapper pricing and FAQ; Tableau Public FAQ; Flourish help centre.
