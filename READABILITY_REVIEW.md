# Readability and wayfinding review

**Date:** 22 October 2026
**Branch:** `claude/site-readability-content-45l1kz`
**Scope:** every page under `public/`, measured against GOV.UK, USWDS and WCAG 2.2 guidance.

## 1. Standards used

| Standard | What it asks for | Source |
|---|---|---|
| GOV.UK content design | Plain English, front-loaded pages, sentences of 25 words or fewer, writing for a reading age of 9 | [Writing for GOV.UK](https://www.gov.uk/guidance/content-design/writing-for-gov-uk) |
| GOV.UK type scale | One sans typeface, 19px body text on large screens, lines of about 75 characters or fewer | [Type scale](https://design-system.service.gov.uk/styles/type-scale/), [Layout](https://design-system.service.gov.uk/styles/layout/) |
| GOV.UK links | Underline every link in body text | [Links](https://design-system.service.gov.uk/styles/links/) |
| GOV.UK focus | Yellow fill and black underline on keyboard focus | [Focus states](https://design-system.service.gov.uk/get-started/focus-states/) |
| GOV.UK breadcrumbs | A trail from Home on every page below the top level | [Breadcrumbs](https://design-system.service.gov.uk/components/breadcrumbs/) |
| USWDS typography | Public Sans; a line length of 45 to 90 characters | [Typography](https://designsystem.digital.gov/components/typography/), [Public Sans](https://public-sans.digital.gov/) |
| WCAG 2.2 | 1.3.1 Info and relationships, 1.4.1 Use of color, 2.4.1 Bypass blocks, 2.4.7 Focus visible | [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [technique G183](https://www.w3.org/WAI/WCAG22/Techniques/general/G183) |
| Scanning | Readers scan; headings, short paragraphs and lists carry the page | [NN/g, How users read on the web](https://www.nngroup.com/articles/how-users-read-on-the-web/); YaleSites, Web Writing Best Practices |

**Typeface.** GOV.UK's typeface, GDS Transport, carries a licence that limits it to GOV.UK services. Public Sans, which the site already loads, plays the same role for US federal sites: the USWDS team designed it as a neutral, readable government typeface. The site now uses Public Sans for headings as well as body text, like GOV.UK uses one family throughout. The Georgia wordmark in the header stays.

## 2. What the audit found

Measured with a script over the text inside `<main>` on every page (Flesch-Kincaid grade, average sentence length, share of sentences over 25 words).

1. **Links on stage pages failed WCAG 1.4.1.** Stage links were teal with no underline. Their contrast against the surrounding body text was 1.82:1; WCAG technique G183 needs 3:1 plus a non-colour cue.
2. **Text too small for the most important content.** The stage "Bottom line" paragraph, the first thing a reader sees, was set at 14px, smaller than the body text. Content headings (h2) on stage pages were 15px, also smaller than body text. The site set about 650 font sizes at 9 to 13px.
3. **Lines too long.** Stage page text ran to about 1,060px wide, around 110 to 120 characters a line at 16px.
4. **Three breadcrumb patterns, and 13 child pages without a trail.** Interview pages used "Home / Your interview / X". Stage pages used "Guide › Stage" with no Home. Checklists and worksheets used "← Part of Stage N" and no trail. Glossary, the question bank, the September update and the checklist family had no breadcrumb.
5. **Four long pages had no `<main>` landmark** (221(g), administrative processing, delayed I-130 remedies, visa pause). Screen reader users could not jump to the content, and the skip link had no target.
6. **Long sentences on the hardest pages.** The 221(g), public charge, NVC and CRBA pages each had sentences of 40 to 69 words. (An earlier version of this line overstated average sentence length; see the correction in section 3.)
7. **Inconsistent stage names.** "7: After Interview", "Stage 7: After the Interview" and "After the interview" all named the same page; Title Case and sentence case were mixed.

## 3. What changed

### Typography and accessibility (`public/css/readability.css`, loaded last on every page)

- Headings in Public Sans bold, same family as the body.
- Body text 18px from tablet width up, 17px on phones, line height 1.6.
- Paragraphs and list items capped at 72 characters.
- Every untitled link inside `<main>` underlined; hover thickens the underline.
- GOV.UK focus state on links (yellow fill, black underline); yellow outline on buttons and form fields.
- All 9 to 13px text raised to 13 or 14px across pages and stylesheets.
- Stage pages: Bottom line and action list at full body size, h2 at 22px, h3 at 19px, body text at full strength instead of 85% opacity.
- Cache versions on every stylesheet link bumped to `v=20261022`, because `vercel.json` serves `/css/*` as immutable.

### Wayfinding

- One breadcrumb pattern (`.avg-crumbs`) on 40 pages: Home › Section › Page.
- A separate "Part of Stage N" line on tools and checklists that belong to a guide stage, as GOV.UK does for step-by-step journeys.
- Checklists and worksheets sit under "Checklists and tools", matching the highlighted nav item. Interview pages sit under "Your interview". 221(g) tools sit under 221(g).
- `<main id="main-content">` added to the four pages that lacked it.
- English test now highlights Naturalization in the nav.
- Stage names in sentence case across the sidebar, headings and hub.

### Content

- Every stage "Bottom line" split into three labelled parts: **You are here**, **What happens**, **Do this first**. Jargon defined in place (petitioner, beneficiary, NOA2, CRBA). No facts, figures or dates changed.
- Guide hub heading changed from the site name to "Your visa, step by step", with a one-line instruction to find your stage.
- 25 of the longest sentences rewritten or turned into lists on CRBA, interview, before you leave, NVC, 221(g) and public charge.

**Correction, 22 October 2026.** The first audit joined bullet points without full stops into one long "sentence", which inflated every grade. The corrected audit treats each bullet and block as its own unit. All figures below use the corrected audit.

### Plain-English pass, 22 October 2026

Every page was edited for plain English against the GOV.UK rules in section 1: one idea a sentence, active voice, "you", jargon defined where it first matters, lists in place of long inline series. No facts, figures, dates, fees, citations or anchors changed.

- **Full rewrites** of the eleven stage pages. Each one now opens with a three-part Bottom line, and its action list, callouts and checklist use the same plain wording.
- **CRBA role tags** now say *US citizen parent*, *Other parent* and *Either parent*. *Petitioner* and *Beneficiary* do not apply to a CRBA.
- **Two terminology fixes.** The After the interview and NVC stages called a 221(g) "administrative processing", which the 221(g) page treats as a different thing. Both now say 221(g).
- **Targeted edits** on the hub and deep-dive pages: the longest guidance sentences split or turned into lists.
- **Left as written:** quoted official emails, the public charge statement template, letter templates, court-filing excerpts and source lists. Member interview accounts keep their wording, with the longest sentences split.
- **Stage page text size:** callouts, checklists and document lists no longer carry inline 13-14px sizes, so they read at body size.

Average grade across the 40 pages over 300 words: **8.4 → 7.8**. The site already sat near GOV.UK's guidance on sentence length; the bigger gains came from structure (labelled Bottom lines, lists) and from defining terms in place, which a grade score does not measure.

| Page | Words | Grade before → after | Words per sentence | Sentences over 25 words |
|---|---:|---|---|---|
| `public-charge.html` | 6,819 | 8.5 → 8.4 | 15.3 → 15.0 | 13% → 11% |
| `life.html` | 4,847 | 8.4 → 8.1 | 12.5 → 12.1 | 8% → 4% |
| `delayed-i130-remedies.html` | 4,612 | 9.6 → 9.2 | 13.9 → 13.3 | 11% → 7% |
| `guide/interview.html` | 4,488 | 8.6 → 7.9 | 15.8 → 14.5 | 13% → 8% |
| `guide/nvc.html` | 3,918 | 8.7 → 7.4 | 13.3 → 12.6 | 8% → 6% |
| `221g.html` | 3,059 | 8.0 → 7.7 | 13.6 → 13.1 | 8% → 3% |
| `guide/i130.html` | 2,539 | 8.8 → 7.1 | 14.2 → 12.4 | 9% → 4% |
| `september-2026-update.html` | 2,414 | 9.2 → 8.9 | 14.3 → 13.7 | 16% → 11% |
| `guide/medical.html` | 2,353 | 8.6 → 7.5 | 12.4 → 11.6 | 9% → 6% |
| `administrative-processing.html` | 2,194 | 9.3 → 9.0 | 14.7 → 14.1 | 14% → 10% |
| `guide/waiting.html` | 2,069 | 7.9 → 6.6 | 12.3 → 10.9 | 8% → 5% |
| `mandamus-pro-se.html` | 1,784 | 8.5 → 8.2 | 13.3 → 12.7 | 10% → 7% |
| `guide/us-entry.html` | 1,704 | 8.4 → 7.0 | 13.6 → 12.5 | 7% → 5% |
| `naturalization.html` | 1,595 | 8.9 → 8.6 | 14.4 → 13.9 | 9% → 7% |
| `guide/crba.html` | 1,581 | 8.8 → 6.5 | 12.9 → 11.9 | 7% → 4% |
| `guide/after-interview.html` | 1,497 | 8.5 → 6.6 | 12.8 → 11.5 | 5% → 2% |
| `visa-pause.html` | 1,457 | 8.5 → 8.1 | 13.5 → 12.7 | 13% → 8% |
| `reinterview.html` | 1,457 | 7.3 → 7.1 | 13.3 → 12.7 | 12% → 7% |
| `i864-household-decision-tree.html` | 1,387 | 7.9 → 7.8 | 11.1 → 10.8 | 4% → 2% |
| `worksheet-i864.html` | 1,270 | 7.7 → 7.4 | 11.0 → 10.8 | 5% → 4% |
| `data.html` | 1,144 | 8.1 → 8.1 | 11.5 → 11.2 | 9% → 8% |
| `checklists.html` | 1,132 | 8.6 → 8.5 | 10.1 → 9.8 | 5% → 3% |
| `checklist-interview.html` | 996 | 8.4 → 7.9 | 13.6 → 12.8 | 12% → 9% |
| `guide.html` | 974 | 8.6 → 8.5 | 11.1 → 10.8 | 3% → 1% |
| `guide/interview-letter.html` | 958 | 8.7 → 7.8 | 13.3 → 12.0 | 8% → 1% |
| `interview.html` | 934 | 7.1 → 6.6 | 11.7 → 10.9 | 6% → 5% |
| `checklist-medical.html` | 931 | 6.6 → 6.6 | 9.5 → 9.5 | 1% → 1% |
| `guide/before-you-leave.html` | 917 | 8.7 → 6.1 | 14.2 → 12.6 | 5% → 1% |
| `public-charge-statement.html` | 756 | 6.2 → 6.2 | 8.9 → 8.9 | 1% → 1% |
| `guide/delayed-i130.html` | 692 | 10.2 → 8.3 | 15.7 → 14.4 | 5% → 8% |
| `about.html` | 675 | 7.1 → 7.1 | 11.1 → 11.1 | 7% → 7% |
| `checklist-nvc.html` | 626 | 9.3 → 9.1 | 13.1 → 12.5 | 10% → 8% |
| `domicile.html` | 599 | 9.7 → 8.4 | 17.4 → 13.3 | 19% → 9% |
| `checklist-binder.html` | 535 | 8.6 → 8.5 | 11.9 → 11.9 | 4% → 4% |
| `privacy.html` | 431 | 10.0 → 10.0 | 10.8 → 10.8 | 2% → 2% |
| `checklist-i130.html` | 374 | 8.7 → 8.7 | 8.9 → 8.9 | 5% → 5% |
| `interview-day-sheet.html` | 359 | 6.6 → 6.6 | 9.7 → 9.7 | 3% → 3% |
| `history-worksheet.html` | 354 | 7.5 → 7.3 | 11.0 → 10.7 | 6% → 3% |
| `english-test.html` | 334 | 9.7 → 9.3 | 16.6 → 15.9 | 10% → 5% |
| `index.html` | 318 | 8.0 → 8.0 | 9.9 → 9.9 | 0% → 0% |

The domicile page's word count falls because two of its callouts now hold bullet lists, which the audit script does not read inside a callout. The page lost no content.

## 4. Still to do

1. **Fact review of the rewrites.** The plain-English pass changed wording only, but the site covers legal process. Read the stage pages once with the facts in mind, starting with CRBA, NVC and the Interview stage.
2. **Inline styles on non-stage pages.** Stage pages no longer shrink callout text with inline sizes. Other pages (221(g), public charge, Life in the USA) still carry some; moving them into classes would let one rule set them.
3. **Generate the stage sidebar from one file.** Twelve pages carry two copies each of the same list (sidebar and mobile drawer). `nav.js` already does this for the top nav.
4. **Rename sub-stages 1A and 1B.** A non-expert reads "1A" as a step everyone takes. "If your I-130 is delayed" and "If your child is already a US citizen" say who the page is for.
5. **Glossary underlines.** Every abbreviation carries a dotted underline, which reads as a link. Mark the first use on each page only.
6. **Sentence-case the remaining Title Case headings** ("Interview Binder Checklist", "NVC Document Checklist", "Pipeline Status").
7. **Homepage stage chips** now show underlines, since they are untitled links. Give them a class if you prefer the old look; the underline does tell readers they are links.
8. **Usability test** with two or three people early in the process: ask each to find what to do at their stage, and note where they stall.
