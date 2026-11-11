# Naturalization guide: full proposal

Draft, 11 Nov 2026. Builds on the existing hub (`public/naturalization.html`) and
its five live pages. Sources reviewed: USCIS Policy Manual Vol 12 (current as of
27 Oct 2026), Vol 6 Part B and Part I, PM-602-0188 (GMC, 15 Aug 2025) and
PA-2026-10 (investigations, 25 Aug 2026).

## 1. Who it's for, and the two questions that route them

The reader knows nothing. Before any step, they need two answers:

1. **Which path am I on?** (how they got the green card, marriage status, military, child)
2. **Where do I live?** (this decides the field office, the biometrics centre, the
   wait, and the kind of oath ceremony)

Every step page then shows a short "What changes for you" box keyed to those
two answers, so we don't fork into dozens of pages.

## 2. Page map

| # | Page | Status | Notes |
|---|---|---|---|
| Hub | `naturalization.html` | live, restructure | Add "Which path?" chooser and "Find your field office" above the steps |
| 0 | `naturalization/paths.html` | **new** | All routes to citizenship (section 3) |
| 1 | `eligibility.html` | live | Add CR-1 / I-751 interaction, refugee/asylee date rollback |
| 2 | `good-moral-character.html` | live, extend | Add 2025 holistic standard + character letters (section 4) |
| 3 | `naturalization/file-n400.html` | **new** | Online vs paper, fee, what to send, character letters |
| 4 | `naturalization/biometrics.html` | **new** | ASC appointment, location-dependent |
| — | `naturalization/background-checks.html` | **new** (or section of 4) | Name checks + neighborhood investigations |
| 5 | `test.html` | live | No change beyond cross-links |
| 6 | `naturalization/interview.html` | **new** | Location-dependent; N-652 outcomes |
| 7 | `naturalization/oath.html` | **new** | Administrative vs judicial, same-day, N-445 |
| 8 | `naturalization/after-citizenship.html` | **new** | Passport, SSA, voting, **upgrading relatives' petitions** |
| — | `naturalization/field-offices.html` | **new** | ZIP → office, what varies by office, moving |
| — | `delays-and-denials.html` | live | Add N-14, N-336, 1447(b), 1421(c) ladder |
| Data | `data.html` | extend | New "Naturalization" section (section 6) |

## 3. Step 0: Which path are you on? (new page)

One chooser, each card linking to the rule and the step-1 calculator preset.

**Main audience (family visa holders)**
- **Spouse of a US citizen, still married and living together** – 3 years as a
  permanent resident (INA 319(a)). Citizen spouse must have been a citizen for
  the whole 3 years. Vol 12 Part G ch 2–3.
- **Conditional resident (CR-1 / 2-year card)** – conditional time counts. You
  can file N-400 while I-751 is pending; USCIS usually needs the I-751 decided
  first and may decide both at the N-400 interview. Vol 6 Part I ch 3(E);
  Vol 12 Part G ch 5.
- **Everyone else with a green card** (parents, siblings, adult children,
  divorced/widowed spouses, F2A/F2B, employment, DV) – 5 years (INA 316).

**Other routes (short cards, link out)**
- **Abused spouse or child of a citizen (VAWA)** – 3 years, no marital-union or
  living-together requirement. Vol 12 Part G ch 3.
- **Spouse of a citizen working abroad** – no residence period (INA 319(b)).
  Vol 12 Part G ch 4.
- **Military service** – 1 year peacetime (INA 328) or any service in hostilities
  (INA 329), no fee. Vol 12 Part I.
- **Children** – under 18 with a green card living with a citizen parent become
  citizens automatically (INA 320; apply for N-600 or a passport, not N-400).
  Children abroad: INA 322 / N-600K. Vol 12 Part H. Note stepchildren don't
  count for citizenship (Vol 6 Part B ch 7 fn 1).
- **Refugees and asylees** – green card date is rolled back (refugees to arrival,
  asylees by one year), so they often qualify sooner than the card suggests.

Callout: "Not sure? Answer 3 questions" → small client-side quiz that outputs the
path and pre-fills the existing filing-date calculator.

## 4. What's new in 2025–2026 (threaded through steps 2, 3, 4, 6)

These are the changes the "totally unaware" reader won't hear elsewhere.

**Good moral character is now a positive test (PM-602-0188).** Officers weigh
the whole picture, not just the absence of crimes. Positive factors they look
for: community involvement, family caregiving, education, stable lawful work,
length of residence, **tax compliance**. New scrutiny: habitual traffic tickets,
"technically lawful" conduct out of step with the community. Rehabilitation
evidence: paid-up child support, finished probation, repaid overpayments,
**fully paid overdue taxes**. Action: gather proof of the positives *before*
filing.

**Neighborhood investigations are back (PA-2026-10, Vol 12 Part B ch 2).**
USCIS may interview neighbours, landlords, employers, coworkers and business
contacts, covering at least the last 5 years, usually before the interview.
USCIS can waive this, and **character reference letters help it decide**:
- Send **at least two** with the N-400, preferably from **US citizens who are not
  family** (neighbours, employers, coworkers).
- Each letter: writer's full name, address, phone, email, proof of citizenship or
  status; how long and how they know you; specific examples of honesty and
  community involvement; explicit statement on your character and attitude to
  the US and the Constitution.
- Optional, but not sending them "may contribute" to an investigation. Missing
  letters alone can't be the reason for a GMC denial.
- If the investigation finds something negative, USCIS must tell you and let you
  respond.

Deliverable: a **character letter template + checklist** (printable, matching
the existing printables), and an added line in the N-400 preparation list.

**Examination now "validates" what you claim (Vol 12 Part B ch 3).** Expect the
officer to check documents against your answers. Bring originals of everything
you sent.

**Fees** – proposed rule 2026-12542 still not final (already on hub; keep).

## 5. "Depending on where you live" (field offices page + per-step boxes)

**What location decides**
- **Where you file and who interviews you**: the USCIS field office covering your
  ZIP code. You must have lived 3 months in that state or service district before
  filing (Vol 12 Part D ch 6). A service district can cross state lines.
- **Where biometrics happen**: an Application Support Center (ASC), often a
  different building from the field office.
- **How long it takes**: backlogs vary from months to years by office.
- **Oath type**: administrative (USCIS, sometimes same day as the interview) or
  judicial (federal court). Some courts reserve oaths to themselves, which adds
  wait time.
- **Students**: can file where they study or at their parents' address if
  dependent. **Multiple homes**: residence = where you file federal taxes.

**Moving after filing**: report the address change within 10 days (AR-11 and on
the case); the file transfers to the new office, which can add months
(verify with community reports before stating a typical delay). Say this plainly: "If you can, don't move between filing and oath."

**Page contents**
1. "Find your office" – link to the USCIS field office locator + ASC locator
   (don't host our own ZIP map; USCIS boundaries change).
2. A table of all field offices with: state(s) served, latest published N-400
   processing time, pending N-400s (quarterly), community median filed→interview
   and interview→oath (from the tracker), judicial/administrative/same-day oath
   reports. Pulled from the data page source, not duplicated.
3. Per-step "What changes for you" boxes link here with `#office-<code>` anchors.

**Biometrics page (step 4)** – appointment notice (I-797C) usually weeks after
filing; what to bring (notice + green card + photo ID); rescheduling (online
account or contact centre, before the date, good cause); **missing it without
notice = application abandoned** (Vol 12 Part B ch 2(B)); biometric reuse
notices; walk-in policy varies by ASC.

**Interview page (step 6)** – notice timing; what to bring (originals,
tax transcripts, I-751 evidence if conditional, character letters copies,
proof of positive factors); who can come (attorney with G-28, interpreter
only if exempt from English); order of the day (oath to tell the truth, N-400
review, English, civics); outcomes on **N-652**: granted, continued
(N-14 evidence request or retest in 60–90 days), denied; re-interviews;
link to question bank pattern (we could seed an N-400 interview question bank
the same way as `interview-questions.js`).

**Oath page (step 7)** – N-445 questionnaire (events since interview: travel,
arrests, marriage); hand back green card; Certificate of Naturalization; check
it for errors before leaving (N-565 later costs money); not a citizen until the
oath; name change only at judicial ceremonies in some districts.

**After citizenship (step 8)** – passport (certificate is the original, keep it
safe), SSA update, voter registration, and for the family-visa audience the
**big one**: once you naturalize, your F2A spouse/child petitions **convert to
immediate relative** automatically, F2B can convert to F1 (with an opt-out if
F1 is slower), and you can now petition parents and siblings (Vol 6 Part B ch 2).
Tell NVC/USCIS with a copy of the certificate.

## 6. Data page: new "Naturalization" section

Keep the guide pages light; put numbers on `data.html` and link in.

| Block | Source | Refresh |
|---|---|---|
| N-400 national: received / approved / denied / pending by quarter | USCIS "Immigration and Citizenship Data" quarterly N-400 report | Quarterly |
| Pending N-400 by field office (bar chart, sortable table) | Same report, field office tab | Quarterly |
| Published processing time by field office | USCIS processing times tool | Monthly scrape |
| Community timelines by office: filed→biometrics, →interview, →oath | Naturalization tracker (`NATURALIZATION_TRACKER_FORM.md`) via `/api/data` | Live |
| Interview outcomes (granted / continued / denied) | Tracker | Live |

Follow the existing pattern: aggregate server-side in `api/data.js` (not client
Supabase tables). Suppress any office with fewer than ~5 community reports.

## 7. Suggested build order

1. Step 0 paths page + hub chooser (unblocks everyone else's "What changes for you").
2. Step 3 file N-400 + character letter template (most time-sensitive given PA-2026-10).
3. Field offices page + steps 4 and 6 (location-dependent core).
4. Steps 7 and 8.
5. Data page section (official data first; community data once the tracker has
   enough entries).
6. Extend step 2 (GMC) and delays-and-denials.

## 8. Decisions (Nov 11, 2026)

- **Character letters: recommend sending them.** Say they are optional, then
  recommend at least two from US citizens who are not family.
- **Field offices: one national page**, not a page per office.
- **Community tracker data goes live at 25+ responses.** Show official USCIS data
  on the data page first, and add the community blocks once there are 25 or more.
- **Step 0: a simple table, no quiz.** Built as `public/naturalization/paths.html`,
  with a short version on the hub (`#path`).
- **Copy style: US English and US grammar** for all new naturalization pages.
