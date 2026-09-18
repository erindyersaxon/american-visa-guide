# Proposed section: petitioner US domicile

**Status: logged, not implemented.** No page changes have been made. This file
records the argument, the draft copy, and the open questions so the section can
be built (or rejected) deliberately.

Proposed primary home: `public/221g.html`, new `<h2 id="domicile">` between
`#financial` ("The dominant cause: financial") and `#prevent` ("Prevent it").
Secondary touch points listed in [§6](#6-where-the-site-already-touches-this).

Logged 2026-09-18. Updated same day against the text of 9 FAM 601.14
(CT:VISA-2149, 04-22-2025), supplied directly after the egress block described
in [§10](#10-sources-with-verification-status).

---

## 1. The claim

The site currently treats US domicile as a **document** — a checkbox on the
green sheet, a line item in the NVC upload list, mostly discussed in the context
of **joint sponsors**. That framing is backwards for the riskiest case.

Domicile is not a document. For the petitioner it is an **eligibility condition
to be a sponsor at all**, and it is the one financial problem a joint sponsor
cannot fix.

- **The sponsor *is* the petitioner.** 9 FAM 601.14-5(a)(3): "The 'sponsor' for
  purposes of the AOS is the petitioner; anyone else is either a joint or
  substitute sponsor. All references to requirements for the 'sponsor' or
  'sponsors' would apply not only to the petitioner sponsor, but also to any
  substitute sponsor, household members executing Form I-864A, and joint
  sponsors submitting a Form I-864."
- **Domicile is in the qualifying list.** 9 FAM 601.14-5(a)(1)(d): to qualify as
  a sponsor an individual must be "domiciled in any of the 50 States of the
  United States, the District of Columbia, or any territory or possession of the
  United States." Statutory basis: INA 213A / 8 U.S.C. 1183a; regulatory,
  8 CFR 213a and 22 CFR 40.41 (9 FAM 601.14-1).
- **The petitioner files either way.** 9 FAM 601.14-5(b)(1): the petitioner must
  submit the I-864 "even if they cannot meet the requirements outlined in
  paragraph (1) above," and 601.14-5(c): "Regardless, a Form I-864 would have to
  be executed by the petitioner for all applicants. Only then could a joint
  sponsor be used if needed."
- **The named cure is income, and only income.** Every time the FAM describes
  what a joint sponsor fixes, it says income: 601.14-5(a)(2) ("if the relative
  petitioner sponsor cannot meet the income guidelines... the visa applicant
  will require a joint sponsor"), 601.14-5(b)(1) ("since a joint sponsor may be
  used to meet the Federal poverty level income requirements"), 601.14-5(b)(2),
  601.14-5(c). No provision anywhere names a joint sponsor as a cure for the
  petitioner's domicile.

Therefore: petitioner income can be $0 and the case survives on a joint sponsor.
Petitioner **domicile** cannot be zero, and there is no second filer who can
supply it.

**One honest caveat on the FAM wording.** 601.14-5(b)(1) is loosely drafted: it
says the petitioner files "even if they cannot meet the requirements outlined in
paragraph (1)" — and paragraph (1) is the whole qualifying list, domicile
included — then adds that "such adverse circumstances would not necessarily mean
that the applicant would be ineligible under INA 212(a)(4) since a joint sponsor
may be used to meet the Federal poverty level **income** requirements." Read
loosely, the first clause could be taken to imply a domicile failure is
survivable too. Read on its own terms, the sentence offers exactly one cure and
that cure is income-scoped. The section should rest on the second reading and
should not overclaim: the accurate statement is that **the FAM provides no
mechanism by which a joint sponsor substitutes for the petitioner's domicile**,
not that a named rule forbids it.

That asymmetry is the whole section. It is not currently stated anywhere on the
site.

**Still outstanding:** 601.14-5(a)(1)(d) cross-refers to **9 FAM 601.14-7** for
domicile, and that subsection was not included in the text supplied. It is the
provision that defines domicile, governs temporary absence abroad, and sets the
intent-to-re-establish standard — i.e. the substance of [§3](#3-the-evidence-calibration-the-substantive-edit)
and [§5](#5-if-the-petitioner-has-genuinely-left-the-us). Get 601.14-7 before
drafting final copy.

## 2. Why this is getting sharper, not softer

Two structural facts:

1. **Most UK-side petitioners are physically in the UK during the process.** The
   pattern the community normalises — USC petitioner living with the beneficiary
   in the UK, or in a third country, while the case runs — is exactly the fact
   pattern that produces a domicile question at the window.
2. **The officer's real question is not "do you own something in the US?" but
   "are you actually going back, and when?"** Domicile evidence is read as
   evidence of *intent and imminence*. A petitioner who has not lived in the US
   as an adult has a harder version of this question than a petitioner who moved
   abroad for a three-year posting and kept a US address, a US employer, and US
   tax filings with domestic earned income.

The second point is the one the site should say out loud, because it changes
what evidence people bother to collect.

## 3. The evidence calibration (the substantive edit)

This is where the proposed copy departs from what the green sheet literally
lists, so it needs to be argued, not asserted.

The London green sheet (reproduced on `/221g.html`, and in
`public/images/221g-green-sheet-p2.jpg`) lists as acceptable domicile proof:

> proof of filing U.S. taxes with domestic earned income, proof of property in
> the U.S., a signed copy of a lease in the U.S., proof of U.S. bank accounts or
> investments, utility bill payments, and/or valid state identification card.

**Proposed framing: these items are not equal, and the sheet's ordering is not
an accident.** Sort them by what they actually prove:

| Tier | Evidence | What it proves |
|---|---|---|
| **Strong** | US tax filing **with domestic earned income**; W-2; current US job contract or signed job offer with a start date | You earn in the US, from the US. Hardest to stage. |
| **Strong** | Utility bills in your name at a US address, over a run of months | Someone is consuming power/water/internet at that address. Closest proxy for *living there*. |
| **Moderate** | Valid state ID / driver's licence; US bank accounts with domestic activity; university transcripts and enrollment | Ties and presence, but all obtainable while living abroad. |
| **Weak alone** | Mortgage; deed; signed lease | Proves you **pay for** a US address. Does not prove you **live at** it. |

The weak-alone tier is the point. A lease or mortgage is an ownership or
liability document; a landlord in Ohio does not know or care whether the tenant
is in Ohio. Utility consumption, domestic earned income, and enrollment records
are behavioural — they are generated by being there. A petitioner who submits
only a lease has submitted a document the sheet names, and still has not
answered the officer's question.

**Calibration caution before this ships:** the sheet does list property and
leases as acceptable, and NVC routinely accepts them. The section must not tell
people a lease will be rejected — it won't be, on its own terms. The accurate
claim is narrower and should be worded as: *a lease or mortgage satisfies the
checkbox but carries little weight on the underlying question, so do not let it
be your only domicile evidence.* Overstating this is the main way this section
could do harm.

## 4. Petitioner vs joint sponsor: the risk is different in kind

Both must be US-domiciled. The consequence of failing differs:

- **Joint sponsor fails domicile** → the joint sponsor is disqualified. Find
  another joint sponsor. Painful, survivable, fixable inside the 221(g) window.
- **Petitioner fails domicile** → two problems land at once. The I-864 is from a
  person not eligible to sponsor, *and* the officer now has an affirmative
  reason to doubt the immigration plan itself: if the petitioner is not moving,
  what is the beneficiary immigrating into? That second doubt is not curable
  with paperwork and bleeds into public charge and, for K-1s, into intent.

This is why the section belongs on the 221(g) page rather than only in the I-864
material. It is a refusal-risk topic, not a form-filling topic.

## 4a. Scope: which cases this section is about

**The I-864 domicile requirement does not reach K-1 applicants at the consular
stage.** 9 FAM 601.14-3(b)(3)(d): "The I-864 is not required for K visa
applicants. However, such applicants will have to submit Form I-864 to
DHS/USCIS at the time of adjustment of status to that of an LPR." The petitioner
in a K-1 case files Form I-134 at the consular stage; the I-864 and its
213A domicile condition arrive later, at adjustment (and 601.14-3(a)(1)(d)
confirms K nonimmigrants adjusting to LPR status must then present one).

This is a correction to the first draft of this note, which addressed "your
spouse or fiancé(e)" in one breath. The London green sheet is a combined sheet —
it carries both the I-864 boxes and the K-1 intent-to-marry box — which makes
the conflation easy and the published copy must not repeat it.

The petitioner-domicile risk is still real for K-1s, but it rests on different
footing and should be written separately if it is written at all:

- the I-134 and the public charge assessment under INA 212(a)(4), where a
  petitioner who is not in the US is a live negative factor;
- the intent to marry **and reside** — a petitioner with no US presence
  undercuts the premise of the visa;
- the I-864 domicile requirement lands in full at adjustment, so a K-1
  petitioner with no domicile has deferred the problem, not avoided it.

So: **write the section for IR/CR/F-preference cases, and give K-1s a short
labelled carve-out** rather than folding them in.

## 5. If the petitioner has genuinely left the US

Two distinct postures, and the site should make people pick one:

- **Domicile retained.** The move abroad was temporary and US domicile was never
  abandoned (US tax filings, a maintained US address, a US employer, a defined
  end date). Evidence the continuity.
- **Domicile abandoned, intent to re-establish.** Permitted route: the sponsor
  shows convincing evidence they will re-establish US domicile **on or before
  the date the beneficiary is admitted**. Evidence is forward-looking: a signed
  written statement of intent with a date, a US job offer or transfer, housing
  arranged, school or childcare enquiries, a moving/shipping quotation or
  contract, funds moved to US accounts, a booked return itinerary. Volume and
  concreteness matter — one letter of intent with no dates is the weak case.
  *The "on or before admission" standard and this evidence list come from
  practitioner summaries and the Department's public-facing guidance, not yet
  from primary text — they live in 9 FAM 601.14-7, which is still outstanding.*

The site already has a row for this (`public/master-checklist.html:396`,
"Intent to Re-Domicile (If Applicable)"). It reads as optional. Under this
proposal it stops being optional for any overseas petitioner.

**Hardest sub-case, and the one to name explicitly:** the petitioner who is a US
citizen but has lived in the UK since childhood. They may never have held adult
US domicile to retain, may have no US tax filing history with domestic earned
income, no state ID, no US utility history. Citizenship is not domicile. This
petitioner is starting from zero on the intent-to-re-establish route and needs
to be told so early — at I-130, not at the interview.

## 6. Where the site already touches this

Existing mentions, all narrower than what is proposed:

| File | Line | Current framing |
|---|---|---|
| `public/221g.html` | 464–465 | Green-sheet table row. Neutral restatement of the sheet. |
| `public/221g.html` | 633 | I-130 stage: "start thinking about how you will show US domicile" — planning-only, correctly staged, but no weight attached. |
| `public/221g.html` | 646–647 | NVC stage: upload domicile evidence "even where NVC does not demand it". Closest existing line. |
| `public/guide.html` | 1720–1721 | Joint-sponsor list + "Evidence of US domicile (even if not listed as required)". |
| `public/master-checklist.html` | 396–401 | "Intent to Re-Domicile (If Applicable)" row. |
| `public/checklist-interview.html` | 103 | Asks the right question already. |
| `public/checklist-binder.html` | 220 | "if not covered by taxes or employment: something like mortgage/lease/job offer" — **directly contradicts §3** and would need rewording. |
| `public/worksheet-i864.html` | 168 | Domicile listed under joint-sponsor requirements only. |
| `public/public-charge.html` | 619 | "Joint sponsors face heightened review… domicile may all be verified." |

Net: domicile appears ~12 times and is framed as a joint-sponsor concern or a
checkbox every time. No page states the petitioner asymmetry in §1.

## 7. The London data point

Community-reported, London Immigrant Visa Unit: a petitioner who is a US citizen
but has lived in the UK since age 7 was placed in 221(g) on domicile grounds.

**Handle carefully.** This is a single, second-hand report. It is directionally
consistent with the statute and with how the green sheet is structured, but it
is not a pattern and must not be published as one. If used, it should appear as
a labelled anecdote ("one community-reported case at London"), not as evidence
of a trend, and not with identifying detail. Preferable: hold it out of the
published copy and use it only to justify the section's existence internally,
unless more reports surface. The `form_responses` data could be checked for
domicile-related 221(g) reasons before publishing anything quantitative.

## 8. Draft copy (not inserted)

> ### The petitioner's domicile problem
>
> A joint sponsor can fix income. Nobody can fix the petitioner's domicile.
>
> To sponsor an immigrant, a person must be domiciled in the United States. That
> is a condition of being a sponsor at all, not a document you attach — and the
> petitioner has to be a sponsor. If the petitioner's income is too low, a joint
> sponsor files alongside them and the case survives. If the **petitioner** is
> not US-domiciled, there is no second filer to bring in. The problem is the
> petitioner, and it has to be solved by the petitioner.
>
> This catches UK-side couples disproportionately, because the normal thing to
> do while a case is running is to be together in the UK.
>
> **What the officer is actually asking.** Not "do you own something in the
> US?" but "are you going back, and when?" Sort your evidence by that test:
>
> - **Carries weight:** US tax filings showing domestic earned income, a W-2, a
>   current US job contract or a signed offer with a start date, utility bills in
>   your name at a US address across several months, university transcripts or
>   enrollment.
> - **Helps, but is obtainable from abroad:** a state ID, US bank accounts, US
>   investments.
> - **Satisfies the checkbox and little else:** a mortgage or a lease. Both prove
>   you pay for an address. Neither proves you live at it. Do not let a lease be
>   your only domicile evidence.
>
> **If you have genuinely left the US,** you are on the intent-to-re-establish
> route: a dated written statement of intent, a US job offer or transfer, housing
> arranged, schools or childcare contacted, a moving quotation, funds moved to US
> accounts, a booked return. You must show you will be domiciled in the US on or
> before the date the person you are sponsoring is admitted. Several concrete
> items beat one letter.
>
> **If you are the petitioner on a K-1,** this section is not describing your
> paperwork: the I-864 is not required of K visa applicants at the interview, and
> you file an I-134 instead. It is still describing your risk. A petitioner who
> is not in the United States weakens the public charge picture and the premise
> that you will marry and live there — and the full I-864 domicile requirement
> arrives when your fiancé(e) adjusts status. Deferred, not avoided.
>
> **Citizenship is not domicile.** A US citizen who has lived abroad since
> childhood may have no adult US domicile to point back to, no US earned income
> history, no state ID, no utility record. That petitioner is starting from
> nothing on this requirement and should start at the I-130 stage, not at the
> interview.

## 9. Open questions before implementing

1. **Does the site want to take the §3 position on leases at all?** It is a
   judgement call that goes beyond the green sheet's own wording. If yes,
   `public/checklist-binder.html:220` must be reworded to match, or the site
   contradicts itself.
2. **Anecdote in or out?** (§7.) Default recommendation: out of published copy.
3. **Does this warrant its own page** (`/domicile.html`) rather than a 221(g)
   section, given it also belongs to the I-864, NVC, and public-charge stories?
   A section on `/221g.html` plus cross-links is the cheaper first move.
4. **K-1 interaction — resolved, see §4a.** The I-864 is not required of K visa
   applicants at the consular stage (9 FAM 601.14-3(b)(3)(d)), so the section
   must not address K-1 petitioners as though 213A domicile applied to them now.
   Remaining question is only whether the carve-out drafted in §8 is the right
   length, or whether K-1 domicile deserves its own treatment.
5. **Primary sources need re-verification before publish** — see below.

## 10. Sources, with verification status

`travel.state.gov` and `fam.state.gov` are both blocked by this environment's
network egress proxy. The text of **9 FAM 601.14 (CT:VISA-2149, 04-22-2025)**
was subsequently supplied directly and is the basis for the citations marked
verified below — but the copy supplied ran from 601.14-1 to 601.14-5(e) and was
cut off there, so **9 FAM 601.14-7, the domicile subsection itself, has still
not been read.** That is the single biggest remaining gap.

| Source | Status |
|---|---|
| 9 FAM 601.14-5(a)(1)(d) — sponsor must be "domiciled in any of the 50 States of the United States, the District of Columbia, or any territory or possession of the United States" | **Verified**, quoted verbatim. |
| 9 FAM 601.14-5(a)(3) — the sponsor *is* the petitioner; sponsor requirements apply to the petitioner sponsor as well as joint/substitute sponsors | **Verified**, quoted verbatim. Load-bearing for §1. |
| 9 FAM 601.14-5(b)(1), (b)(2), (c) and 601.14-5(a)(2) — petitioner files the I-864 regardless; joint sponsor named only as a cure for **income** | **Verified.** See the drafting caveat in §1 — the copy must not overclaim here. |
| 9 FAM 601.14-3(b)(3)(d) — "The I-864 is not required for K visa applicants" at the consular stage; required at adjustment | **Verified.** Corrected a scope error in the first draft; see §4a. |
| 9 FAM 601.14-1 — authority: INA 213A (8 U.S.C. 1183a); 8 CFR 213a; 22 CFR 40.41 | **Verified.** |
| **9 FAM 601.14-7 — the domicile subsection: definition, temporary absence abroad, intent-to-re-establish standard and evidence** | **NOT READ.** Egress-blocked and outside the supplied excerpt. §3 and §5 rest on secondary sources until this is obtained. |
| INA 213A(f)(1)(C) / 8 U.S.C. §1183a(f)(1)(C); INA 213A(f)(5) | Statute not read directly; the FAM restatement is verified and is what §1 now cites. |
| [USCIS, Form I-864 and instructions](https://www.uscis.gov/i-864) — domicile evidence list | Not fetched. **Verify the evidence list against §3's tiering.** |
| US Embassy London green 221(g) sheet, community-supplied July 2026 — `public/images/221g-green-sheet-p2.jpg` | **Verified directly.** Quoted in §3 from the image. |
| Secondary practitioner summaries for the intent-to-re-establish evidence list: [CitizenPath](https://citizenpath.com/reestablish-us-domicile-filing-form-i-864/), [Boundless](https://www.boundless.com/immigration-resources/prove-domicile-form-i-864) | Retrieved via search. **Secondary — do not cite on-site in place of the FAM or the Department.** |
| London domicile 221(g) case (§7) | **Single community report. Uncorroborated.** |

**To close out the sourcing:** 9 FAM 601.14-7 (domicile), and 601.14-5(e)
onward, which was truncated mid-sentence in the supplied text at the substitute
sponsor provisions (INA 213A(f)(5)(B)).
