# Proposed section: petitioner US domicile

**Status: logged, not implemented.** No page changes have been made. This file
records the argument, the draft copy, and the open questions so the section can
be built (or rejected) deliberately.

Proposed primary home: `public/221g.html`, new `<h2 id="domicile">` between
`#financial` ("The dominant cause: financial") and `#prevent` ("Prevent it").
Secondary touch points listed in [§6](#6-where-the-site-already-touches-this).

Logged 2026-09-18. Rewritten the same day against the full text of
**9 FAM 601.14** (CT:VISA-2149, 04-22-2025; the domicile subsection 601.14-7 at
CT:VISA-1542, 05-12-2022), supplied as PDF after the network egress proxy
blocked `fam.state.gov` and `travel.state.gov`. Every FAM quotation below is
verbatim from that text.

---

## 1. The claim — and it is stronger than first drafted

The site currently treats US domicile as a **document** — a checkbox on the
green sheet, a line item in the NVC upload list, mostly discussed in the context
of **joint sponsors**. That framing is backwards for the riskiest case.

Domicile is not a document. For the petitioner it is an **eligibility condition
to be a sponsor at all**, and the FAM says in terms that a joint sponsor cannot
rescue it.

**9 FAM 601.14-7(a)(3)(c)**, quoted in full because the whole section rests on
it:

> If a petitioner cannot satisfy the domicile requirement, the petitioner fails
> to qualify as a "sponsor" for the purposes of submitting Form I-864. **A joint
> sponsor cannot be accepted and the applicant must be refused pursuant to
> INA 212(a)(4).** Without a properly executed I-864, signed by a sponsor (the
> petitioner) who is "domiciled" in the United States, in visa cases which
> require an I-864, then an IV cannot be approved.

Supporting chain:

- **The sponsor *is* the petitioner.** 9 FAM 601.14-5(a)(3) and 601.14-6(a)(1),
  identically: "The 'sponsor' is the petitioner; anyone else is a joint or
  substitute sponsor."
- **Domicile is in the qualifying list.** 601.14-5(a)(1)(d): a sponsor must be
  "domiciled in any of the 50 States of the United States, the District of
  Columbia, or any territory or possession of the United States."
- **A joint sponsor cures income, and the FAM only ever says income.**
  601.14-9(c)(1) triggers a joint sponsor where the petitioner "cannot
  demonstrate ability to maintain a household income of at least 125% (or 100%
  when applicable) of the Federal Poverty Guidelines." Same at 601.14-5(a)(2),
  (b)(1), (b)(2), (c).
- **Living abroad is presumptively disqualifying.** 601.14-7(a)(2)(a): "a
  petitioner who is maintaining a principal residence outside the United States
  could not normally claim a U.S. domicile and would be **ineligible to submit
  Form I-864**."

So: petitioner income can be $0 and the case survives on a joint sponsor.
Petitioner domicile cannot be zero — and the failure mode is not a request for
more paperwork, it is refusal under INA 212(a)(4).

> **Correction to the first draft of this note.** Before the FAM text was in
> hand, this section hedged: that the FAM provided "no mechanism" for a joint
> sponsor to supply the petitioner's domicile, rather than an express rule
> against it. That hedge was wrong. 601.14-7(a)(3)(c) is an express rule, and
> the published copy can state it flatly.

Statutory and regulatory authority, per 601.14-1: INA 213A (8 U.S.C. 1183a);
8 CFR 213a; 22 CFR 40.41.

## 2. What "domicile" actually means

**601.14-7(a)(1)(a)**: domicile is "the place where a sponsor has their
principal 'residence' (as defined in INA 101(a)(33)) in the United States, with
the intention to maintain that residence for the foreseeable future."

Two components — a principal residence, and an intention to keep it. Both are
about *living somewhere*, which is why the evidence question in §3 resolves the
way it does.

There are exactly **three** postures a petitioner can be in. The site should
make people identify which one is theirs, because the evidence differs:

| Posture | Test | FAM |
|---|---|---|
| **A. Domiciled, living in the US** | Principal residence in the US. No issue. | 601.14-7(a)(1)(a) |
| **B. Abroad, domicile retained** | Three-part test, see §4. Named examples: students, contract workers, NGO volunteers. | 601.14-7(a)(2)(b) |
| **B2. Abroad on qualifying employment** | Automatically domiciled. Narrow list, see §4. | 601.14-7(b), INA 319(b)(1) |
| **C. Abroad, domicile abandoned** | Must *establish* domicile: steps taken, plus physical residence at or before the applicant's immigration. See §5. | 601.14-7(a)(3) |

## 3. The evidence calibration (the substantive edit)

The original instinct behind this note — *a mortgage or lease is not enough
because it does not show that you live there* — is well supported, and the
support is sharper than expected.

**The FAM's own evidence list does not mention property, a mortgage, or a lease
at all.** 601.14-7(a)(3)(b), complete:

> (i) Opening a bank account; (ii) Transferring funds to the United States;
> (iii) Making investments in the United States; (iv) Seeking employment in the
> United States; (v) Registering children in U.S. schools; (vi) Applying for a
> Social Security number; and (vii) Voting in local, State, or Federal
> elections.

Compare the London green sheet (`public/images/221g-green-sheet-p2.jpg`), which
*does* list property and leases:

> proof of filing U.S. taxes with domestic earned income, proof of property in
> the U.S., a signed copy of a lease in the U.S., proof of U.S. bank accounts or
> investments, utility bill payments, and/or valid state identification card.

These are two different lists doing two different jobs, and the section should
say so rather than treat either as *the* list:

- The **green sheet** lists documents that evidence an existing domicile — it is
  a request for proof from someone claiming posture A or B.
- The **FAM** lists steps that evidence *establishing* domicile — posture C.

Where they diverge is instructive. Housing does appear in the FAM, but only as a
prerequisite to be paired with presence: 601.14-7(a)(3)(a)(iv) requires the
sponsor to "establish an address (a house, an apartment, or arrangements for
accommodations with family or friend) **and** either must have already taken up
physical residence in the United States" or satisfy the officer they will do so
by the time the applicant immigrates. Housing alone is half a test.

And the governing standard is explicitly factual residence, not documentation.
601.14-7(a)(3)(b): "you must be satisfied that the sponsor has, **in fact**,
taken up principal residence in the United States."

**So the defensible published claim is:** a lease or a mortgage is on the
Embassy's list and will be accepted as part of a package, but it evidences an
address, not a residence — and the FAM's own list of what establishes domicile
does not include it. Do not let it be your only domicile evidence.

**Calibration caution retained:** do not tell readers a lease will be rejected.
It is on the sheet and it is not worthless. The claim is about weight and
sufficiency, not admissibility. Overstating this is still the main way this
section could do harm.

Two items worth surfacing for readers separately, because they are cheap and
people miss them: **applying for a Social Security number** and **voting** are
both on the FAM list, and both are available to a US citizen who has never lived
in the US as an adult.

## 4. Two ways to be abroad and still be domiciled

The site should carry both, because most overseas petitioners assume neither
applies to them.

**Temporary absence, domicile retained** — 601.14-7(a)(2)(b). Where a petitioner
"has maintained both a U.S. residence and a residence abroad," the officer
determines which is the principal abode. The FAM names students, contract
workers, and NGO volunteers as people who "remained abroad for extended periods
but still maintain a principal residence in the United States." The petitioner
must satisfy the officer that they:

> (i) Departed the United States for a limited, and not indefinite, period;
> (ii) Intended to maintain a U.S. domicile at the time of departure; and,
> (iii) Can present convincing evidence of continued ties to the United States.

Note (i): *limited, not indefinite*. A petitioner who moved to the UK to be with
their partner, with no end date, fails this on its face — however many US bank
accounts they hold.

**Qualifying employment abroad — automatic domicile.** 601.14-7(b) and
601.14-7(a)(1)(c): a US citizen living abroad temporarily **is** domiciled in
the US if their employment meets INA 319(b)(1). The qualifying employers:

> (a) The U.S. Government; (b) A U.S. institution of research recognized as such
> by the Secretary of Homeland Security (see 8 CFR 316.20); (c) A U.S. firm or
> corporation engaged in whole or in part in the development of foreign trade
> and commerce with the United States or a subsidiary thereof; (d) A public
> international organization in which the United States participates by treaty
> or statute; (e) A religious denomination having a bona fide organization in
> the United States, if the individual concerned is authorized to perform the
> ministerial or priestly functions thereof; and (f) A religious denomination or
> an interdenominational mission organization having a bona fide organization in
> the United States, if the person concerned is engaged solely as a missionary.

This is genuinely useful and appears **nowhere on the site**. Category (c) is
broad — a USC in London working for a US corporation or its subsidiary may
already qualify. Also relevant for LPR sponsors: 601.14-7(a)(1)(b), an LPR
abroad temporarily is domiciled in the US if they obtained the preservation of
residence benefit under INA 316(b) or INA 317.

## 4a. Scope: which cases this section is about

**The I-864 domicile requirement does not reach K-1 applicants at the consular
stage.** 9 FAM 601.14-3(b)(3)(d): "The I-864 is not required for K visa
applicants. However, such applicants will have to submit Form I-864 to
DHS/USCIS at the time of adjustment of status to that of an LPR." The petitioner
in a K-1 case files Form I-134 at the consular stage; the I-864 and its 213A
domicile condition arrive later, at adjustment (601.14-3(a)(1)(d) confirms K
nonimmigrants adjusting must then present one).

This corrects the first draft of this note, which addressed "your spouse or
fiancé(e)" in one breath. The London green sheet is a combined sheet — it
carries both the I-864 boxes and the K-1 intent-to-marry box — which makes the
conflation easy, and the published copy must not repeat it.

The petitioner-domicile risk is still real for K-1s, on different footing:

- the I-134 and public charge under INA 212(a)(4), where a petitioner not in the
  US is a live negative factor;
- intent to marry **and reside** — a petitioner with no US presence undercuts
  the premise of the visa;
- the I-864 domicile requirement lands in full at adjustment, so a K-1
  petitioner without domicile has deferred the problem, not avoided it.

So: **write the section for IR/CR/F-preference cases and give K-1s a short
labelled carve-out.**

One further carve-out, narrow but worth a footnote: 601.14-7(a)(4) — for
employment-based beneficiaries petitioned by a relative or a relative's business
entity, where that relative is neither a USC/LPR nor US-domiciled, "the lack of
Form I-864 will not be an impediment to admissibility." Not relevant to the
site's family-based audience; noted so nobody rediscovers it and thinks it is a
general exception. It is not.

## 5. If the petitioner has genuinely left the US (posture C)

Verified standard, 601.14-7(a)(3)(a). The petitioner must satisfy the officer:

> (i) That they have taken steps to establish a domicile in the United States;
> (ii) That they have either already taken up physical residence in the United
> States or will do so concurrently with the applicant; (iii) The sponsor does
> not have to precede the applicant to the United States but, if they do not do
> so, they must at least arrive in the United States concurrently with the
> applicant […] (v) Must at a minimum […] intend to take up residence there no
> later than the time of the applicant's immigration to the United States.

Three points the site can state precisely, where it currently hedges:

1. **The deadline is the applicant's immigration**, not the interview and not
   the I-864 filing. The petitioner may travel with them; they may not follow
   later.
2. **"There is no time frame for the resident to establish residence"**
   (601.14-7(a)(3)(b)) — but that is not leniency. The same sentence requires
   the officer to be satisfied the sponsor "has, in fact, taken up principal
   residence." No deadline, no discretion.
3. **An address must be arranged** — and accommodation with family or friends
   counts (601.14-7(a)(3)(a)(iv)). Useful: readers assume they need a lease.

The site already has a row for this (`public/master-checklist.html:396`, "Intent
to Re-Domicile (If Applicable)"). It reads as optional. Under this proposal it
stops being optional for any petitioner in posture C — and its listed evidence
(moving contract, job contract, job applications, school/childcare inquiries,
rental contracts) maps well onto the FAM list, so it needs promoting, not
rewriting.

**Hardest sub-case, and the one to name explicitly:** the petitioner who is a US
citizen but has lived in the UK since childhood. They may never have held adult
US domicile to retain, so posture B is unavailable; absent INA 319(b)(1)
employment, B2 is too. They are in posture C from a standing start, possibly
without an SSN, a state ID, a US tax history with domestic earned income, or any
US voting record — four of the seven FAM evidence items. Citizenship is not
domicile. This petitioner needs to be told at I-130, not at the interview.

## 6. Where the site already touches this

| File | Line | Current framing |
|---|---|---|
| `public/221g.html` | 464–465 | Green-sheet table row. Neutral restatement of the sheet. |
| `public/221g.html` | 633 | I-130 stage: "start thinking about how you will show US domicile" — correctly staged, no weight attached. |
| `public/221g.html` | 646–647 | NVC stage: upload domicile evidence "even where NVC does not demand it". Closest existing line. |
| `public/guide.html` | 1720–1721 | Joint-sponsor list + "Evidence of US domicile (even if not listed as required)". |
| `public/master-checklist.html` | 396–401 | "Intent to Re-Domicile (If Applicable)" row. Evidence list is good; promote it. |
| `public/checklist-interview.html` | 103 | Asks the right question already. |
| `public/checklist-binder.html` | 220 | "if not covered by taxes or employment: something like mortgage/lease/job offer" — **contradicts §3**, needs rewording. |
| `public/worksheet-i864.html` | 168 | Domicile listed under joint-sponsor requirements only. |
| `public/public-charge.html` | 619 | "Joint sponsors face heightened review… domicile may all be verified." |

Net: domicile appears ~12 times, framed as a joint-sponsor concern or a checkbox
every time. **No page states that a joint sponsor cannot cure it**, and no page
mentions the INA 319(b)(1) employment route.

## 7. The London data point

Community-reported: a petitioner who is a US citizen but has lived in the UK
since age 7 was placed in 221(g) on domicile grounds at London.

**Recommendation: keep it out of the published copy, and it no longer needs to
be in it.** The FAM makes that outcome predictable from the text —
601.14-7(a)(2)(a) says a petitioner maintaining a principal residence outside
the US "could not normally claim a U.S. domicile and would be ineligible to
submit Form I-864," and (a)(3)(c) says the applicant "must be refused pursuant
to INA 212(a)(4)." Citing the FAM is stronger than citing one second-hand case,
carries no identification risk, and does not imply a trend from n=1. The
anecdote justified writing this section; it does not need to appear in it.

If a quantitative claim is ever wanted, check `form_responses` for
domicile-related 221(g) reasons first.

## 8. Draft copy (not inserted)

> ### The petitioner's domicile problem
>
> A joint sponsor can fix income. Nobody can fix the petitioner's domicile.
>
> The State Department's own guidance to consular officers is blunt about this.
> If the petitioner cannot satisfy the domicile requirement, they "fail to
> qualify as a sponsor," and then: *"A joint sponsor cannot be accepted and the
> applicant must be refused pursuant to INA 212(a)(4)."* That is the whole
> problem in one sentence. Low petitioner income is survivable — a joint sponsor
> files alongside and the case goes on. A petitioner who is not US-domiciled is
> not a paperwork gap. There is no second filer who can supply it.
>
> This catches UK-side couples disproportionately, because the normal thing to
> do while a case is running is to be together in the UK.
>
> **Domicile means your principal residence is in the United States and you
> intend to keep it there.** Both halves. Which leaves three positions:
>
> **You live in the US.** Nothing to solve.
>
> **You are abroad temporarily and kept your US home.** You must show you left
> for a limited, not indefinite, period; that you meant to keep your US domicile
> when you went; and that you have real continuing ties. "Limited, not
> indefinite" is the part that catches people — moving to be with your partner,
> with no end date, is not a temporary absence however many US accounts you hold.
>
> **You are abroad on qualifying US employment.** If you work for the US
> government, a US firm or its subsidiary engaged in developing US foreign trade,
> a recognised US research institution, a public international organisation the
> US belongs to, or as clergy or a missionary for a US religious body, you are
> *already* treated as US-domiciled while abroad. Check this before assuming you
> have a problem — it is a real carve-out and many people qualify without knowing.
>
> **You are abroad and your US domicile is gone.** You are re-establishing it.
> The officer must be satisfied you have taken real steps *and* that you have
> taken up residence in the US, or will do so no later than the date the person
> you are sponsoring immigrates. You may travel together. You may not follow on
> later.
>
> **What counts.** The Department's list of what establishes domicile is: opening
> a US bank account, transferring funds, making US investments, seeking US
> employment, registering children in US schools, applying for a Social Security
> number, and voting. Notice what is not on it — property, a mortgage, a lease.
> The Embassy will accept a lease as part of a package and you should include one
> if you have it, but it evidences an address, not a residence: a landlord does
> not know whether you are in the country. What carries weight is evidence
> generated by *being there* — US tax filings showing domestic earned income, a
> W-2, a US job offer with a start date, utility bills in your name across
> several months, school enrollment. The standard the officer applies is whether
> you have "in fact taken up principal residence" in the United States.
>
> Your address can be a house, an apartment, or an arrangement to stay with
> family or friends. You do not need a lease to satisfy that part.
>
> **Citizenship is not domicile.** A US citizen who has lived abroad since
> childhood may have no adult US domicile to point back to — no US earned income
> history, no state ID, no utility record, possibly no Social Security number and
> no voting record. That is four of the seven items on the Department's own list
> unavailable from a standing start. If that is you, begin at the I-130 stage,
> not at the interview.
>
> **If you are the petitioner on a K-1,** this is not describing your paperwork:
> the I-864 is not required of K visa applicants at the interview, and you file
> an I-134 instead. It is still describing your risk. A petitioner who is not in
> the United States weakens both the public charge picture and the premise that
> you will marry and live there — and the full I-864 domicile requirement arrives
> when your fiancé(e) adjusts status. Deferred, not avoided.

## 9. Open questions before implementing

1. **The §3 lease position — now well supported, still a judgement call on
   wording.** The FAM omits property from its list and applies an "in fact taken
   up principal residence" test, so the claim is defensible. It must still be
   framed as weight, not admissibility. If adopted,
   `public/checklist-binder.html:220` must be reworded or the site contradicts
   itself.
2. **Anecdote in or out?** Resolved in §7: out. The FAM does the work.
3. **Does this warrant its own page** (`/domicile.html`)? The case is stronger
   after reading 601.14-7 — there are now three postures, a qualifying-employment
   carve-out, an LPR variant, and a K-1 variant, which is more than a section on
   `/221g.html` comfortably holds. Recommend: section on `/221g.html` now,
   revisit a dedicated page if it runs long.
4. **K-1 interaction — resolved,** see §4a.
5. **Should the INA 319(b)(1) carve-out get its own callout?** It is the only
   piece of this that is *good* news, it is absent from the site, and category
   (c) plausibly covers a meaningful number of London-area petitioners.
6. **Sourcing is closed** — see §10. No blockers remain.

## 10. Sources, with verification status

`travel.state.gov` and `fam.state.gov` are blocked by this environment's network
egress proxy. **9 FAM 601.14 was supplied directly as PDF** and extracted
locally; all FAM citations below are verified verbatim against that text. The
sourcing gap flagged in the previous revision of this file is closed.

| Source | Status |
|---|---|
| **9 FAM 601.14-7 Domicile** (CT:VISA-1542, 05-12-2022) — definition (a)(1); maintaining domicile (a)(2); establishing domicile and the evidence list (a)(3); **the "joint sponsor cannot be accepted" rule (a)(3)(c)**; INA 319(b)(1) employment (b) | **Verified**, quoted verbatim throughout. |
| 9 FAM 601.14-5(a)(1)(d) — sponsor must be domiciled in a State, DC, or US territory or possession | **Verified**, verbatim. |
| 9 FAM 601.14-5(a)(3) and 601.14-6(a)(1) — the sponsor *is* the petitioner | **Verified**, verbatim. |
| 9 FAM 601.14-5(a)(2), (b)(1), (b)(2), (c); 601.14-9(c)(1) — joint sponsor as a cure for **income** | **Verified.** |
| 9 FAM 601.14-3(b)(3)(d) and 601.14-3(a)(1)(d) — K visa applicants exempt at consular stage, required at adjustment | **Verified.** Corrected a scope error; see §4a. |
| 9 FAM 601.14-6(b)(4) — evidence of sponsor eligibility includes domicile | **Verified.** |
| 9 FAM 601.14-1 — authority: INA 213A (8 U.S.C. 1183a); 8 CFR 213a; 22 CFR 40.41 | **Verified.** |
| INA 101(a)(33) (residence); INA 319(b)(1); INA 316(b)/317; 8 CFR 316.20 | Cross-references named in the FAM. Not read directly; cited as the FAM cites them. |
| [USCIS, Form I-864 and instructions](https://www.uscis.gov/i-864) | Not fetched. Optional — the FAM governs consular practice and is sufficient here. |
| US Embassy London green 221(g) sheet, community-supplied July 2026 — `public/images/221g-green-sheet-p2.jpg` | **Verified directly.** Quoted in §3 from the image. |
| Secondary practitioner summaries ([CitizenPath](https://citizenpath.com/reestablish-us-domicile-filing-form-i-864/), [Boundless](https://www.boundless.com/immigration-resources/prove-domicile-form-i-864)) | Superseded by the FAM text. **Do not cite on-site.** |
| London domicile 221(g) case (§7) | Single community report. Uncorroborated. Recommended out of published copy. |

On-site citation, if the section ships: link
[9 FAM 601.14](https://fam.state.gov/fam/09FAM/09FAM060114.html) and cite
subsection numbers inline, consistent with how `/guide.html` cites travel.state
and USCIS.
