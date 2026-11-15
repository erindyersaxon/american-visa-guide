# Naturalization (N-400) Tracker — Fillout Field List

Draft, 28 Sep 2026. Modelled on the visa tracker: the form collects **milestone
dates**, and intervals (filed → interview, interview → oath, …) are derived in
code, never asked for.

**Field ID = database column.** Set each Fillout field's key to the value in
the *Column* column so the webhook payload maps straight onto the table, the
same way `api/submit.js` handles `form_responses`.

**Date precision rule**

- **Exact date required:** `filed_date`, `interview_date`, `oath_date`. These
  drive the headline numbers.
- **Exact or month only:** every other date. Each one has a `*_precision`
  companion dropdown. If a member picks *Month only*, the helper text tells them
  to select the **1st of that month**. The stored value is then
  `YYYY-MM-01` with `precision = 'month'`.

Every date field has a "Not yet" option, meaning the field is left blank. Returning members
update their record by re-submitting with the same username, which is the same
upsert behaviour as the visa form.

---

## Welcome page (Fillout cover page, no fields)

**Heading:** Naturalization timeline tracker

**Body:**

> Welcome! This form collects real N-400 timelines from people going through
> naturalization, so everyone can see how long each step is actually taking at
> their field office.
>
> It doesn't matter where you're originally from. What matters is the dates.
>
> **What you'll need:** the dates from your USCIS notices (receipt,
> biometrics, interview, oath). You only need exact dates for when you filed,
> your interview and your oath. For everything else, the month is fine.
>
> **Filled in part of it?** Submit what you have now, then come back and use
> the same username to add new dates as your case moves along. Your entry will
> be updated, not duplicated.
>
> **Your privacy:** we never ask for your name, A-number or receipt number.
> Please don't include them anywhere in the form. Your email is optional and
> is never shown on the site. Answers are only shown as combined statistics.
>
> It takes about 3 minutes. Thank you for helping the next person know what to
> expect.

**Button:** Start

---

## Page 1 — About you

| # | Label (member-facing) | Fillout type | Column | Options / validation | Required |
|---|---|---|---|---|---|
| 1 | Username or nickname | Short answer | `username_raw` | Helper: "Use the same name each time so we can update your entry. Don't use your full name." Lower-cased on save. | Yes |
| 2 | Email address (optional) | Email | `email` | Helper: "Only used to remind you to add new dates as your case moves along. Never shown on the site or shared." Lower-cased on save. | No |
| 3 | Which USCIS field office is handling your case? | Dropdown (searchable) | `field_office` | The 90 USCIS field offices + `Don't know yet`. See Appendix A. | Yes |
| 4 | Which state do you live in? | Dropdown | `us_state` | 50 states + DC + territories. Reuse the list from the visa form. | Yes |

## Page 2 — Your case

| # | Label | Fillout type | Column | Options → stored value | Required |
|---|---|---|---|---|---|
| 5 | How are you eligible to naturalize? | Multiple choice | `eligibility_basis` | 5 years as a permanent resident → `5yr` · 3 years married to a US citizen → `3yr_marriage` · Military service → `military` · Other → `other` | Yes |
| 6 | How did you get your green card? | Dropdown | `green_card_category` | 16 options, see Appendix B. `green_card_route` (`immigrant_visa` / `adjustment` / `other`) is derived from the option on save. | Yes |
| 7 | How did you file your N-400? | Multiple choice | `filing_method` | Online → `online` · Paper (mailed) → `paper` | Yes |
| 8 | Did you file in the early 90-day window? | Multiple choice | `filed_early` | Yes → `true` · No → `false` · Not sure → null | No |
| 9 | Which fee did you pay? | Multiple choice | `fee_type` | Full fee → `full` · Reduced fee → `reduced` · Fee waiver → `waived` | No |
| 10 | Was your I-751 (removing conditions) still pending when you filed? | Multiple choice | `i751_pending_at_filing` | Yes → `true` · No → `false` · Not applicable (10-year card) → null | No |
| 11 | Did you ask to change your name on the N-400? | Multiple choice | `name_change_requested` | Yes → `true` · No → `false` | No |

*Note on Q10:* keep it visible to everyone, since "Not applicable" covers members with a 10-year card.
It matters most for the 3-year marriage route, where the N-400 and I-751 are often decided at one interview.

## Page 3 — Your dates

| # | Label | Fillout type | Column(s) | Precision | Required |
|---|---|---|---|---|---|
| 12 | Date you filed your N-400 | Date picker | `filed_date` | Exact only | Yes |
| 13 | Date on your receipt notice (I-797C) | Date picker + dropdown | `receipt_date`, `receipt_date_precision` | Exact / Month only | No |
| 14 | Biometrics | Multiple choice | `biometrics_type` | Had an appointment → `appointment` · USCIS reused my previous biometrics (no appointment) → `reused` · Still waiting → null | No |
| 14a | Biometrics appointment date | Date picker + dropdown | `biometrics_date`, `biometrics_date_precision` | Exact / Month only. *Show if Q14 = `appointment`.* | No |
| 15 | Date you received your interview notice | Date picker + dropdown | `interview_notice_date`, `interview_notice_date_precision` | Exact / Month only | No |
| 16 | Interview date | Date picker | `interview_date` | Exact only | No |
| 17 | Date you received your oath ceremony notice | Date picker + dropdown | `oath_notice_date`, `oath_notice_date_precision` | Exact / Month only. *Hide if Q24 = same-day oath.* | No |
| 18 | Oath ceremony date | Date picker | `oath_date` | Exact only | No |
| 19 | Date your US passport arrived (optional) | Date picker + dropdown | `passport_received_date`, `passport_received_date_precision` | Exact / Month only | No |

Precision dropdown options (for every `*_precision` field): I know the exact date → `exact` · I only know the month (select the 1st) → `month`.
Default: `exact`.

## Page 4 — Your interview

*Show this page only if Q16 (`interview_date`) is filled in.*

| # | Label | Fillout type | Column | Options → stored value | Required |
|---|---|---|---|---|---|
| 20 | What happened at the interview? | Multiple choice | `interview_outcome` | Approved → `approved` · Continued, asked for more documents (N-14) → `continued_docs` · Continued, re-test scheduled → `continued_retest` · Decision not made yet → `pending` · Denied → `denied` | Yes (on this page) |
| 21 | Did you pass the English and civics tests on the first try? | Multiple choice | `tests_first_try` | Passed both → `passed` · Re-test for English → `retest_english` · Re-test for civics → `retest_civics` · Re-test for both → `retest_both` · Exempt → `exempt` | No |
| 22 | Which civics test did you take? | Multiple choice | `civics_test_version` | 2008 version (100 questions) → `2008` · 2025 version (128 questions) → `2025` · Not sure → null | No |
| 23 | Did you use a language or medical exemption? | Multiple choice | `test_exemption` | None → `none` · 50/20 → `50_20` · 55/15 → `55_15` · 65/20 → `65_20` · Medical (N-648) → `n648` | No |
| 24 | Did you take the oath on the same day as your interview? | Multiple choice | `same_day_oath` | Yes → `true` · No → `false` | No |
| 25 | Was your interview rescheduled or re-held? | Multiple choice | `interview_change_type` | No → null · Rescheduled by USCIS → `rescheduled_uscis` · Rescheduled at my request → `rescheduled_me` · Second interview after a continuance → `reinterview` | No |
| 25a | Date of the new interview | Date picker | `new_interview_date` | Exact. *Show if Q25 is answered and not "No".* | No |

*Note on Q22:* check the USCIS rule for which filing dates take the 2025 test
before publishing. If the rule is based only on filing date, drop Q22 and derive
the version from `filed_date` in code.

*Logic:* if Q24 = `true`, set `oath_date` = `interview_date` on save and hide Q17/Q18.

## Page 5 — Anything else (optional)

| # | Label | Fillout type | Column | Options → stored value |
|---|---|---|---|---|
| 26 | Did you request an expedite or contact your congressional office? | Multiple choice | `expedite_type` | Neither → `none` · Expedite request → `expedite` · Congressional inquiry → `congressional` · Both → `both` |
| 27 | Was your case transferred to a different field office? | Multiple choice | `case_transferred` | Yes → `true` · No → `false` · Not sure → null |
| 28 | What kind of oath ceremony did you have? | Multiple choice | `oath_type` | At a USCIS office (administrative) → `administrative` · At a court (judicial) → `judicial` |
| 29 | Anything that surprised you about the interview? Which questions were you asked? | Long answer | `interview_notes` | Helper: "Please don't include personal details like your A-number or receipt number." |
| 30 | Privacy consent | Checkbox | `consent` | Reuse the visa form's GDPR wording (see `GDPR_COMPLIANCE.md`). | Yes |

---

## Derived metrics (computed, not asked)

| Metric | From → to | Include month-precision rows? |
|---|---|---|
| `filed_to_interview` | `filed_date` → `interview_date` | n/a (both exact) |
| `interview_to_oath` | `interview_date` → `oath_date` | n/a (both exact) |
| `filed_to_oath` | `filed_date` → `oath_date` | n/a (both exact) |
| `filed_to_biometrics` | `filed_date` → `biometrics_date` | Month-level only |
| `notice_to_interview` | `interview_notice_date` → `interview_date` | Month-level only |
| `oath_to_passport` | `oath_date` → `passport_received_date` | Month-level only |

Group results by `field_office` first, then `filing_method` and
`eligibility_basis`. Use the visa tracker's `small_sample` flag for field offices
with few reports.

---

## Table sketch (not yet applied)

A separate table from `form_responses`, so visa and naturalization stats never mix.

```sql
CREATE TABLE public.naturalization_responses (
  id                                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  submitted_at                      timestamptz NOT NULL DEFAULT now(),
  username_raw                      text,
  email                             text,
  field_office                      text,
  us_state                          text,
  eligibility_basis                 text CHECK (eligibility_basis IN ('5yr','3yr_marriage','military','other')),
  green_card_category               text CHECK (green_card_category IN (
                                      'iv_spouse','iv_parent','iv_child','iv_family_pref','iv_employment','iv_diversity','iv_other',
                                      'aos_k1','aos_spouse','aos_family_other','aos_employment','aos_asylum_refugee','aos_humanitarian','aos_other',
                                      'other','not_sure')),
  green_card_route                  text CHECK (green_card_route IN ('immigrant_visa','adjustment','other')),
  filing_method                     text CHECK (filing_method IN ('online','paper')),
  filed_early                       boolean,
  fee_type                          text CHECK (fee_type IN ('full','reduced','waived')),
  i751_pending_at_filing            boolean,
  name_change_requested             boolean,

  filed_date                        date,
  receipt_date                      date,
  receipt_date_precision            text CHECK (receipt_date_precision IN ('exact','month')),
  biometrics_type                   text CHECK (biometrics_type IN ('appointment','reused')),
  biometrics_date                   date,
  biometrics_date_precision         text CHECK (biometrics_date_precision IN ('exact','month')),
  interview_notice_date             date,
  interview_notice_date_precision   text CHECK (interview_notice_date_precision IN ('exact','month')),
  interview_date                    date,
  oath_notice_date                  date,
  oath_notice_date_precision        text CHECK (oath_notice_date_precision IN ('exact','month')),
  oath_date                         date,
  passport_received_date            date,
  passport_received_date_precision  text CHECK (passport_received_date_precision IN ('exact','month')),

  interview_outcome                 text CHECK (interview_outcome IN ('approved','continued_docs','continued_retest','pending','denied')),
  tests_first_try                   text CHECK (tests_first_try IN ('passed','retest_english','retest_civics','retest_both','exempt')),
  civics_test_version               text CHECK (civics_test_version IN ('2008','2025')),
  test_exemption                    text CHECK (test_exemption IN ('none','50_20','55_15','65_20','n648')),
  same_day_oath                     boolean,
  interview_change_type             text CHECK (interview_change_type IN ('rescheduled_uscis','rescheduled_me','reinterview')),
  new_interview_date                date,

  expedite_type                     text CHECK (expedite_type IN ('none','expedite','congressional','both')),
  case_transferred                  boolean,
  oath_type                         text CHECK (oath_type IN ('administrative','judicial')),
  interview_notes                   text,
  consent                           boolean,

  -- Ordering rules, same approach as migration 0001 (NULLs pass).
  CONSTRAINT nat_interview_after_filed CHECK (interview_date IS NULL OR filed_date IS NULL OR interview_date >= filed_date),
  CONSTRAINT nat_oath_after_interview  CHECK (oath_date IS NULL OR interview_date IS NULL OR oath_date >= interview_date),
  CONSTRAINT nat_passport_after_oath   CHECK (passport_received_date IS NULL OR oath_date IS NULL OR passport_received_date >= oath_date)
);

CREATE UNIQUE INDEX naturalization_responses_username_key
  ON public.naturalization_responses (lower(username_raw));
```

---

## Appendix A — Field office options (for Fillout bulk add)

90 offices, taken from the USCIS N-400 processing-times office list as mirrored
by immigrationtimes.org (data dated 17 Sep 2026). Written as `City (ST)` because
Fillout's bulk add splits on commas. Paste the block as-is.

```
Agana (GU)
Albany (NY)
Albuquerque (NM)
Anchorage (AK)
Atlanta (GA)
Baltimore (MD)
Boise (ID)
Boston (MA)
Brooklyn (NY)
Buffalo (NY)
Burlington (VT)
Charleston (SC)
Charlotte Amalie (VI)
Charlotte (NC)
Chicago (IL)
Christiansted (VI)
Cincinnati (OH)
Cleveland (OH)
Columbus (OH)
Cranbury (NJ)
Dallas (TX)
Denver (CO)
Des Moines (IA)
Detroit (MI)
El Paso (TX)
Fort Myers (FL)
Fort Smith (AR)
Fresno (CA)
Greer (SC)
Harlingen (TX)
Hartford (CT)
Helena (MT)
Hialeah (FL)
Honolulu (HI)
Houston (TX)
Imperial (CA)
Indianapolis (IN)
Jacksonville (FL)
Kansas City (MO)
Kendall (FL)
Las Vegas (NV)
Lawrence (MA)
Long Island (NY)
Los Angeles County (CA)
Los Angeles (CA)
Louisville (KY)
Manchester (NH)
Memphis (TN)
Miami (FL)
Milwaukee (WI)
Minneapolis-St. Paul (MN)
Montgomery (AL)
Mount Laurel (NJ)
Nashville (TN)
New Orleans (LA)
New York City (NY)
Newark (NJ)
Norfolk (VA)
Oakland Park (FL)
Oklahoma City (OK)
Omaha (NE)
Orlando (FL)
Philadelphia (PA)
Phoenix (AZ)
Pittsburgh (PA)
Portland (ME)
Portland (OR)
Providence (RI)
Queens (NY)
Raleigh (NC)
Reno (NV)
Sacramento (CA)
Saint Louis (MO)
Salt Lake City (UT)
San Antonio (TX)
San Bernardino (CA)
San Diego (CA)
San Fernando Valley (CA)
San Francisco (CA)
San Jose (CA)
San Juan (PR)
Santa Ana (CA)
Seattle (WA)
Spokane (WA)
Tampa (FL)
Tucson (AZ)
Washington (DC)
West Palm Beach (FL)
Wichita (KS)
Yakima (WA)
Don't know yet
```

---

## Appendix B — Green card options (Q6)

Grouped so members can find their route quickly. The group headings are shown
as helper text, not options. The label prefix gives `green_card_route`:
`iv_*` → `immigrant_visa`, `aos_*` → `adjustment`, anything else → `other`.

**Immigrant visa from abroad (entered the US on an immigrant visa)**

| Option label | Stored value |
|---|---|
| Spousal immigrant visa (CR1 or IR1) | `iv_spouse` |
| Parent of a US citizen (IR5) | `iv_parent` |
| Child of a US citizen (IR2 / CR2 / IR3 / IR4) | `iv_child` |
| Family preference visa (F1 / F2A / F2B / F3 / F4) | `iv_family_pref` |
| Employment-based immigrant visa (EB-1 to EB-5) | `iv_employment` |
| Diversity Visa lottery (DV) | `iv_diversity` |
| Other immigrant visa from abroad | `iv_other` |

**Adjustment of status (already in the US, filed an I-485)**

| Option label | Stored value |
|---|---|
| K-1 fiancé(e) visa then adjustment of status | `aos_k1` |
| Married a US citizen while in the US then adjustment of status | `aos_spouse` |
| Other family-based adjustment of status | `aos_family_other` |
| Employment-based adjustment of status | `aos_employment` |
| Asylum or refugee status | `aos_asylum_refugee` |
| Humanitarian route (VAWA / U visa / T visa / SIJ) | `aos_humanitarian` |
| Other adjustment of status (e.g. Cuban Adjustment Act or registry) | `aos_other` |

**Other**

| Option label | Stored value |
|---|---|
| Other | `other` |
| Not sure | `not_sure` |

Bulk-add block (no commas, so Fillout keeps each line as one option):

```
Spousal immigrant visa (CR1 or IR1)
Parent of a US citizen (IR5)
Child of a US citizen (IR2 / CR2 / IR3 / IR4)
Family preference visa (F1 / F2A / F2B / F3 / F4)
Employment-based immigrant visa (EB-1 to EB-5)
Diversity Visa lottery (DV)
Other immigrant visa from abroad
K-1 fiancé(e) visa then adjustment of status
Married a US citizen while in the US then adjustment of status
Other family-based adjustment of status
Employment-based adjustment of status
Asylum or refugee status
Humanitarian route (VAWA / U visa / T visa / SIJ)
Other adjustment of status (e.g. Cuban Adjustment Act or registry)
Other
Not sure
```
