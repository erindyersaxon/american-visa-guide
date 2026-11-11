# Naturalization section: step-by-step architecture

Date: 11 Nov 2026
Status: structure approved in brainstorming, awaiting spec review

## 1. Purpose

Turn the single `/naturalization` page into a section modelled on GOV.UK's
"step by step" journeys and on our own `/guide` stage pages:

- a **hub** at `/naturalization` that lists the whole journey as 8 numbered steps
- **one page per step**, plus **"If…" side pages** for situations only some
  people face
- the same `guide-article` template, sidebar and Previous/Next pattern as the
  visa guide, so the two journeys feel like one site

The goal is navigation that follows what the user is trying to do ("Can I
apply yet? What could stop me? What happens at the interview?"), not the order
of the Policy Manual.

**Sources for new content:**
- USCIS Policy Manual Vol. 12 (local copy: `uscis-policy-manual-vol12-citizenship-naturalization.md`)
- Policy memo of 15 Aug 2025, *Restoring a Good Moral Character Evaluation
  Standard for Aliens Applying for Naturalization*

**Today:** `public/naturalization.html` (474 lines) plus `js/naturalization.js`
(602 lines: calculator, preparation list, flashcards) and
`js/naturalization-test.js`. Sections: `#timeline`/`#calc` (calculator),
`#prepare`/`#prep` (preparation list), `#civics`/`#flashcards`, `#english`,
`#resources`.

## 2. Decisions taken

| Question | Decision |
|---|---|
| Model | GOV.UK step-by-step: hub with numbered steps, every page in the journey shows the step list in its sidebar |
| Hub URL | `/naturalization` stays as the hub (keeps search ranking, nav link, Discord links) |
| Child URLs | `/naturalization/<slug>`, files in `public/naturalization/` (same pattern as `public/guide/`) |
| Page template | `guide-article` layout from `public/guide/i130.html` |
| Role chips | Not used: one person applies, so action lists have no Petitioner/Beneficiary pills |
| Good moral character | Its own step (2), not a sub-section; most changed by the 2025 memo |
| Out of scope | Military naturalization (Part I), spouses employed abroad / 319(b) (Part G ch. 4), revocation (Part L), certificates of citizenship for people born abroad (Part H ch. 3). Listed under "What this section does not cover" on the hub |
| Checklist URL | `/checklist-n400`, beside `/checklist-i130`, and listed on `/checklists` |
| Calculator | Moves to its own tool page; questions are unchanged in phase 1 |

## 3. Site map

| # | URL | Title (H1) | Status |
|---|---|---|---|
| Hub | `/naturalization` | Become a US citizen: step by step | Rewrite |
| 1 | `/naturalization/eligibility` | Check if you can apply | New, partly from today's calculator intro |
| 1 tool | `/naturalization/when-can-i-apply` | When can you apply? (calculator) | Moved |
| 1 if | `/naturalization/time-abroad` | If you've spent long periods abroad | New |
| 1 if | `/naturalization/conditional-residents` | If your I-751 is still pending | New |
| 2 | `/naturalization/good-moral-character` | Good moral character | New |
| 3 | `/naturalization/apply` | Fill in and file Form N-400 | New, plus fee help moved from resources |
| 3 tool | `/checklist-n400` | N-400 preparation list | Moved |
| 4 | `/naturalization/biometrics` | Your biometrics appointment | New |
| 5 | `/naturalization/test` | Prepare for the English and civics test | Moved (flashcards, English, exemptions) plus study resources |
| 6 | `/naturalization/interview` | Your naturalization interview | New |
| 7 | `/naturalization/oath` | The oath ceremony | New |
| 8 | `/naturalization/after` | After you become a citizen | New |
| if | `/naturalization/delayed` | If your N-400 is delayed | New |
| if | `/naturalization/denied` | If your application is denied | New |
| if | `/naturalization/children` | Your children's citizenship | New |

The `/english-test` page stays where it is; step 5 links to it.

## 4. Page template

Every step and "If…" page uses the same structure as `public/guide/i130.html`:

1. Breadcrumb: Home › Naturalization › Step N: Title
2. `article-header`: H1, `article-meta` (reviewed date, plus a time estimate
   where tracker data supports one), `article-summary` with **You are here /
   What happens / Do this first**
3. **Action list** (`ol.article-actions`), no role pills
4. **Documents for this stage** (forms, checklists, tools)
5. Body sections with `h2` ids that stay stable once published
6. **Sources**: Policy Manual chapter links (and the memo on step 2)
7. **Previous / Next** links to the neighbouring steps (`.stage-prevnext`, see §7)

**Sidebar** (desktop) and **mobile drawer**, identical on every page:

```
Naturalization steps
1: Check if you can apply
   If you've spent long periods abroad
   If your I-751 is still pending
2: Good moral character
3: Fill in and file Form N-400
4: Biometrics
5: English and civics test
6: Interview
7: Oath ceremony
8: After you become a citizen
   Your children's citizenship
—
Naturalization overview
If your N-400 is delayed
If you're denied
When can I apply? (calculator)
N-400 preparation list
Civics flashcards
```

## 5. Hub page (`/naturalization`)

1. H1 "Become a US citizen: step by step", a short intro on who this is for
   (green card holders through family visas), reviewed date
2. Discord / naturalization server callout (moved from today's page)
3. **The step list**: GOV.UK-style numbered list. Each step has a one-line
   description and its links (step page, tools, "If…" pages). Steps whose page
   is not built yet show the description without a link (see §9)
4. Quick tools row: calculator, preparation list, flashcards
5. **Get free and low-cost help**: legal help (nonprofits, accredited
   representatives), moved from today's resources section
6. **What this section does not cover** (out-of-scope list from §2)

## 6. Content map: what moves where

| Today (`naturalization.html`) | Moves to |
|---|---|
| Community callout (`#community-h`) | Hub |
| Calculator intro + `#calc` form + result timeline | `/naturalization/when-can-i-apply`; eligibility rules prose goes to step 1 |
| Preparation list `#prep` | `/checklist-n400` |
| Civics flashcards `#civics` / `#flashcards` | `/naturalization/test#flashcards` |
| The English test `#english` | `/naturalization/test#english` |
| Test exemptions | `/naturalization/test#exemptions` |
| Official study materials, classes and tutoring | `/naturalization/test#study-help` |
| Help with the fee | `/naturalization/apply#fees` |
| Free and low-cost legal help | Hub `#help`, also linked from `/naturalization/denied` and step 2 |

**JavaScript:** split `js/naturalization.js` into one file per tool so each
page loads only what it uses:
- `js/n400-calculator.js`
- `js/n400-checklist.js`
- `js/civics-flashcards.js`

The localStorage keys (`avg-natz-prep`, `avg-civics-known`) stay the same so
existing ticks and known cards survive the move. `js/naturalization-test.js`
(the civics question data, not a test) keeps its name and is loaded only by
`/naturalization/test`.

## 7. Shared pieces

- **Sidebar/drawer markup**: copied into each page, as the `/guide` pages do
  today (no build step on this site). A test checks every page under
  `public/naturalization/` has the same sidebar list (see §10).
- **Previous/Next component**: reuse the existing `nav.stage-prevnext`
  from `css/stage.css` (already on every `/guide` stage page). Only step pages
  carry it, linking to the neighbouring *built* step; tool and "If…" pages do
  not.
- **Unbuilt steps in the sidebar**: all 8 steps always appear. A step with no
  page yet is plain text (`<span class="sidebar-pending">`), not a link.
  "If…" pages appear only once built.
- **Tool styles**: the calculator, checklist and flashcard rules move from
  the `<style>` block in `naturalization.html` to `css/naturalization.css`,
  scoped under a `.natz-tool` wrapper that also carries the old page's colour
  variables, so they cannot clash with `stage.css` tokens.
- **Legacy anchors**: new `js/naturalization-anchors.js`, same idea as
  `js/guide-anchors.js`, loaded only on the hub. Fragments never reach the
  server, so the hub redirects in the browser:

| Old link | New target |
|---|---|
| `/naturalization#timeline`, `#calc` | `/naturalization/when-can-i-apply` |
| `#prepare`, `#prep` | `/checklist-n400` |
| `#civics`, `#flashcards` | `/naturalization/test#flashcards` |
| `#english` | `/naturalization/test#english` |
| `#resources` | `/naturalization#help` |

- **Nav**: `js/nav.js` keeps the "Naturalization" link at `/naturalization`
  and maps every `naturalization/*` page and `checklist-n400` to the
  `naturalization` active state.
- **Inbound links to update**: `guide.html`, `guide/crba.html`, `life.html`,
  `checklists.html`, `checklist-i130.html`, `public-charge.html`,
  `english-test.html`, `js/checklist-data.js`. Point each at the most specific
  new page.
- **Sitemap**: add every new URL to `public/sitemap.xml`.
- **Cache busting**: bump `?v=` on every page that loads a changed CSS/JS file.

## 8. Content outline for new pages

Content is drafted from the sources in §1. Each page cites the chapter it
relies on. The site uses "Erin" only, never a full name.

- **1 Eligibility** (Part D ch. 1–6): 5-year and 3-year (spouse of a US
  citizen) routes; continuous residence; physical presence; 3 months in the
  state or district; the 90-day early filing window; age 18+.
- **1 if: Time abroad** (Part D ch. 3, 5): trips of 6–12 months and 1+ year;
  rebutting the presumption; Form N-470.
- **1 if: Conditional residents** (Part G ch. 5): filing the N-400 while the
  I-751 is pending; interview handling.
- **2 Good moral character** (Part F; Aug 2025 memo): the statutory period;
  the holistic "totality of the circumstances" assessment; positive factors and
  rehabilitation the memo tells officers to weigh; permanent bars and
  conditional bars; common issues (taxes, Selective Service, child support,
  arrests, false claims to citizenship, unlawful voting); disclose everything,
  and get legal advice before filing if anything applies. Includes a "This is
  not legal advice" callout.
- **3 Apply**: online vs paper; fees, reduced fee and fee waiver; supporting
  documents; what to do after filing (receipt notice).
- **4 Biometrics** (Part B ch. 2): the appointment notice, what to bring,
  rescheduling.
- **5 Test** (Part E): 2025 civics test format; English reading, writing and
  speaking; exemptions (50/20, 55/15, 65/20); Form N-648 disability exception;
  retest after failing; study help.
- **6 Interview** (Part B ch. 3–4): what happens on the day; N-400 review
  under oath; Form N-652 outcomes (granted, continued, denied); Form N-14
  requests for evidence.
- **7 Oath** (Part J): Form N-445; returning the green card; same-day vs
  scheduled ceremony; name changes; rescheduling.
- **8 After**: passport; updating Social Security; registering to vote;
  certificate safekeeping and replacement (Part K ch. 4, Form N-565);
  petitioning for relatives (links back to `/guide/i130`).
- **if: Delayed**: processing times; case inquiries; Ombudsman; mandamus after
  120 days post-interview (links to `/mandamus-pro-se`).
- **if: Denied** (Part B ch. 5–6): Form N-336 hearing; re-filing; judicial
  review.
- **if: Children** (Part H ch. 4, 5): automatic citizenship under INA 320;
  Form N-600; passport as proof.

## 9. Phasing

The structure ships first, and content pages follow as they are written. A
step without a page is shown on the hub without a link, never as an empty page.

| Phase | Ships |
|---|---|
| 1. Structure | Hub, sidebar, pager, anchor map, nav, sitemap; moved pages: calculator, `/checklist-n400`, step 1 eligibility, step 5 test; JS split; inbound links |
| 2. Core steps | Step 2 good moral character, 3 apply, 6 interview, 7 oath |
| 3. Remaining | Step 4 biometrics, 8 after; all "If…" pages |

Each phase is its own PR.

## 10. Testing

- New `test/naturalization-pages.test.js` (run by `npm test`, alongside
  `stage-pages.test.js`) checks:
  - each new page has the same sidebar list
  - each step page links Previous/Next to the correct neighbours
  - every legacy anchor in §7 resolves to a page that exists
  - no internal link points at a removed `naturalization.html#…` id
  - every new URL is in `sitemap.xml`
- Manual check in the preview: calculator, preparation list ticks and
  flashcard progress still work and keep their saved state; mobile drawer;
  narrow width with no horizontal scroll.
