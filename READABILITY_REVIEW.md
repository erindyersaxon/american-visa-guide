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
6. **Long sentences on the hardest pages.** The CRBA page averaged 29.5 words a sentence. On the interview stage 28% of sentences ran over 25 words. The 221(g), public charge and NVC pages each had sentences of 40 to 69 words.
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

| Page | FK grade before → after | Words per sentence | Sentences over 25 words |
|---|---|---|---|
| Stage 1B: CRBA | 15.0 → 13.4 | 29.5 → 25.7 | 23% → 22% |
| Stage 6: Interview | 11.2 → 10.3 | 21.2 → 19.0 | 28% → 21% |
| Stage 8: Before you leave | 11.8 → 11.2 | 21.1 → 20.7 | 22% → 19% |
| 221(g) | 9.0 → 8.9 | 16.2 → 15.9 | 12% → 10% |

The page-level numbers move a little because the rewrites target the passages a reader hits first. Most stage pages still sit at grade 10 to 11. GOV.UK's target is far lower.

## 4. Still to do

1. **A full plain-English pass, page by page.** Start with CRBA (grade 13.4), Before you leave (11.2), Delayed I-130 (11.2), Interview letter received (10.5) and Life in the USA (11.3). Check each page for sentences over 25 words; about 60 remain over 30 words on the stage, 221(g) and public charge pages alone.
2. **Move inline `style="font-size:14px"` into classes.** Community-account paragraphs on stage pages carry inline sizes, so the reader sees them smaller than body text. A `.community-note` class would let one rule set them.
3. **Generate the stage sidebar from one file.** Twelve pages carry two copies each of the same list (sidebar and mobile drawer). `nav.js` already does this for the top nav.
4. **Rename sub-stages 1A and 1B.** A non-expert reads "1A" as a step everyone takes. "If your I-130 is delayed" and "If your child is already a US citizen" say who the page is for.
5. **Glossary underlines.** Every abbreviation carries a dotted underline, which reads as a link. Mark the first use on each page only.
6. **Sentence-case the remaining Title Case headings** ("Interview Binder Checklist", "NVC Document Checklist", "Pipeline Status").
7. **Homepage stage chips** now show underlines, since they are untitled links. Give them a class if you prefer the old look; the underline does tell readers they are links.
8. **Usability test** with two or three people early in the process: ask each to find what to do at their stage, and note where they stall.
