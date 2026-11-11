# Naturalization page: taxes and 2026 enforcement changes (design)

Status: revision 2 (Nov 11 feedback applied), awaiting approval. Nothing built or pushed.
Page: `public/naturalization.html`, `public/js/naturalization.js`
Inputs: `naturalization-tax-compliance.md`, `n400-applicant-guide-2026.md` (uploaded Nov 11, 2026)

## Problem

The live page gives advice that the 2026 reports say can get an applicant denied:

| Location | Current text | Problem |
|---|---|---|
| Prep item `b9` | "Order IRS tax **return** transcripts... set up a **payment plan** for any tax owed." | Return transcripts do not show penalties or balances. USCIS has denied applicants on payment plans. |
| Calculator result, "Send with the application" | "An IRS or state payment agreement and proof of payments (If you owe tax)" | Same: presents a payment plan as the fix. |
| Prep item `a5` | "Keep filing taxes" | Filing is not enough. Late payment and estimated-tax penalties have been cited. |
| Warning card, tax bullet | "Unfiled tax returns, taxes owed, or filing as a nonresident" | Misses payment plans, estimated-tax penalties, late payment after an extension, and a spouse's tax record. |
| "Last reviewed" | September 27, 2026 | Stale. |

The page also says nothing about the slowdown, the denial rate, the N-336 appeal, the 120-day lawsuit option, the country-of-birth hold, or the proposed fee increase.

## Page structure after the change

New and changed parts in **bold**.

1. Hero (unchanged)
2. Community aside (unchanged)
3. Jump nav: Filing date & forms · **Taxes** · Preparation list · Civics flashcards · **Delays & denials** · Free & low-cost help
4. **"What changed in 2025 and 2026" alert card** (new, short)
5. Calculator section (one result line corrected)
6. **Taxes and good moral character section** (new, `#taxes`)
7. Preparation list (items corrected and added)
8. Civics flashcards (unchanged)
9. **Delays, denials and your options section** (new, `#delays`)
10. Free & low-cost help (one fee note added)

The taxes section sits before the preparation list because applicants need years of lead time to fix a tax record. The delays section sits after civics: it matters once the case is filed.

## 4. "What changed" alert card

`info-card warning`, placed under the jump nav, above "Last reviewed". Four bullets, each linking to its section:

- USCIS applies a stricter good moral character review to every case it decides, including cases filed in 2025 (PM-602-0188, Aug 15, 2025). → `#taxes`
- USCIS has denied applicants on IRS payment plans, applicants who paid late after an extension, and in one report an applicant with small estimated-tax penalties. → `#taxes`
- Decisions have slowed and denials have risen to about 1 in 5. → `#delays`
- A proposed rule would raise the online N-400 fee from $710 to $1,280. → `#fee`

## 6. New section: Taxes and good moral character (`#taxes`)

Section label: "Before you file". H2: "Taxes and good moral character".

**6a. Intro paragraph (3 sentences).** USCIS treats tax compliance as part of good moral character for the 3- or 5-year statutory period (8 CFR 316.10(b)(3)(iii); Policy Manual Vol. 12, Part F, Ch. 5). The August 2025 memo lists "full payment of overdue taxes" as rehabilitation evidence and does not mention payment plans. N-400 Part 9 asks whether you owe overdue federal, state or local tax.

**6b. "What USCIS has denied" — three cards with a source-strength tag.**
Each card carries a pill showing how strong the evidence is, so readers can weigh it:

| Card | Pill | Source |
|---|---|---|
| Active IRS payment plan, including one held by a spouse | News report | Bloomberg Tax, 2026 |
| Late payment after a filing extension, described in denial letters as "an unlawful act" | News report | Bloomberg Tax, 2026 |
| Estimated-tax penalties of $10, $270 and $500 with a $0 balance at filing (Miami) | Applicant report, unverified | r/USCIS, Nov 2026 |

The second r/USCIS account (payment plan, oath cancelled 4 days before, no RFE or NOID) goes in the first card as a supporting detail, also tagged unverified. Every Reddit claim on the page carries the "Applicant report, unverified" tag, because no official source confirms it.

New pill styles: `pill-policy` (USCIS policy), `pill-news` (news report), `pill-anecdote` (applicant report). Reuse existing `.pill` base.

**6c. "The estimated-tax trap" — table + short text.**
Two sentences on pay-as-you-go: paying the full balance in April does not stop an underpayment penalty. Then the IRS safe-harbor table from the upload (under $1,000 owed; 90% of this year; 100% of last year; 110% if prior-year AGI over $150,000, or $75,000 married filing separately), sourced to IRS Topic 306 and Pub. 505. One line listing who is most exposed: bonuses, RSU vesting, 1099 or self-employment income, investment gains, a spouse's business on a joint return.

**6d. "Extensions" — one `info-card tip`.** An extension gives more time to file, not to pay. Pay the estimated balance by the April deadline.

**6e. "How to check your record" — 4 steps.**
1. Order IRS return transcripts and account transcripts for each year of the statutory period. Look for code 176 and any penalty, interest or balance.
2. Pay every balance in full, including penalties and interest. Finish any payment plan before you file.
3. Check your spouse's record if you file jointly, and check state and local tax.
4. If anything shows up, prepare a written explanation of the circumstances, send it with the N-400, and talk to an immigration attorney before filing.

## 5 and 7. Corrections to existing content

| ID | New text (summary) |
|---|---|
| `b9` | "Order IRS return transcripts **and** account transcripts for every year of the statutory period" · Return transcripts show you filed as a resident. Account transcripts show penalties, interest, code 176 and any balance. Pay everything in full before you file. See [Taxes](#taxes). |
| new `b17` | "Make sure every year of the statutory period meets estimated-tax safe harbor" · Adjust W-4 withholding or pay quarterly. Use the 110% rule above $150,000 AGI. |
| new `b18` | "Get copies of your earlier immigration forms and check your N-400 against them" · I-130, DS-260 or DS-230, I-485. FOIA to USCIS if you lack copies. Children, marriages, addresses and trips must match (*Savane v. Secretary DHS*, 3d Cir. 2026). |
| new `b19` | "Gather positive character evidence" · Employment, community involvement, family responsibilities (PM-602-0188). |
| `a5` | "Keep filing taxes on time, and prepay enough during the year" · File by the deadline every year, even if you owe or paid late before. If you earn wages (W-2), raise your W-4 withholding. If you are self-employed, run an LLC, or have high income, make quarterly estimated payments large enough to meet safe harbor. Avoid any new arrest or citation: good moral character runs until the oath. |
| `i2` | Add "IRS account transcripts and proof of payment" |
| Calculator result line | Replace payment-agreement line with: "IRS account transcripts and proof of full payment (If you owed tax). If you are still on a payment plan, talk to an attorney before filing." |
| Warning card tax bullet | "Any tax balance, IRS or state payment plan, estimated-tax penalty, or late payment during the statutory period, for you or a spouse on a joint return, or filing as a nonresident" |

The printable checklist PDF reads `PREP`, so it gets rebuilt with `scripts/build-naturalization-printables.js`.

## 9. New section: Delays, denials and your options (`#delays`)

Section label: "After you file". H2: "Delays, denials and your options".

**9a. Numbers table** (from the applicant guide): decisions per month, denial rate, pending cases, share pending over 6 months, USCIS average processing time. Columns: "2024 to Sep 2025" and "Aug 2026". Caption: USCIS published times count only finished cases, so the backlog is a better guide.

**9b. Your field office.** No office table. Link to the USCIS processing-times tool (egov.uscis.gov/processing-times) and the quarterly field office data, and tell readers to look up their own office. Note: the backlog falls unevenly. Some offices have a few months of pending work; others have several years, and the published time can understate it.

**9c. Your options, as a short definition list:**
- **No decision 120 days after your interview:** you can ask a federal judge to decide under 8 U.S.C. 1447(b). Median closed case in 2026: about 2.5 months. A suit forces a decision, not an approval, and a settlement does not pay your legal fees (*Avdeeva v. Tucker*, 1st Cir. 2025).
- **Denied:** you have 30 days to file Form N-336 to request a hearing with USCIS. Federal court review follows.
- **Born in, or a citizen of, a designated country:** expect a hold under the January 1, 2026 policy (39 countries), including dual nationals by birth.

## 10. Fee note

Add to "Help with the fee", with `id="fee"`: "A June 23, 2026 proposed rule would raise the fee to $1,280 online and $1,330 on paper. Check whether it is final before you choose a filing date." Update `b13` to point here.

## Visual design

Uses only existing components (`content-section`, `section-label`, `info-card warning|tip`, `table-scroll`, `.pill`, `res-grid` not needed). Additions:
- Three pill variants for source strength.
- A three-card row for 6b, reusing `.res-grid` layout with `div.res` (no link), so it stacks on phones.
No new JS behavior. No layout changes to the calculator or flashcards.

## Verification before build

The site rule is that every figure links to an official source. I will open each of these and drop or reword any claim I cannot confirm:

- PM-602-0188 wording on "full payment of overdue taxes" and payment plans
- Bloomberg Tax article (may be paywalled; quote only what I can see)
- Both r/USCIS threads (kept, labelled unverified)
- *Savane v. Secretary DHS* and *Avdeeva v. Tucker* on CourtListener
- June 23, 2026 fee proposal in the Federal Register
- January 1, 2026 hold policy and its 39-country count on uscis.gov
- Monthly and field office numbers against USCIS Report to Congress and quarterly data
- IRS safe-harbor thresholds against Pub. 505

## Out of scope

Civics content, the calculator logic, and other pages. `checklists.html` changes only if the PDF rebuild changes its labels.
