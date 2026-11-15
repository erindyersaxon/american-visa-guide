# Site architecture review

> **Status, 15 November 2026:** steps 1 and 2 implemented. Step 1: the top nav is Guide ▾ / Interview / Data / News / Tools + "Submit your timeline", with labels in `docs/site-labels.md`. Step 2: the 14 interview pages share one sidebar from `js/section-nav.js` + `css/section-nav.css`. It's a fixed rail from 1100px up and an "In this section" fold-out under the breadcrumb below that. `/guide/interview` keeps the guide sidebar and is listed in the interview sidebar as "Stage 6".

Reviewed 15 November 2026. Scope: the whole site: 63 public pages, the shared nav and footer (`public/js/nav.js`), breadcrumbs, URL structure and redirects (`vercel.json`), and the homepage. Earlier reviews this builds on: `INTERVIEW_NAVIGATION_REVIEW.md` (implemented 30 Sep: the stage picker and `/interview` hub came from it) and `STAGE_PAGE_RESTRUCTURE.md`.

Method: page inventory with word counts; an internal link graph over every page (inbound/outbound links, orphans); breadcrumb trails extracted from each page; and a walk through the live site at desktop and phone widths. Findings are rated on Nielsen's 0–4 severity scale and tied to a named principle.

---

## 1. Context

| | |
|---|---|
| **Who** | UK residents in a family immigrant visa case through London. Mostly perpetual intermediates: they come back at each stage, often from a Reddit link, often stressed and on a phone. |
| **Posture** | Transient. People arrive with one question ("I was handed a green sheet", "my date moved") and want the answer, not a tour. |
| **Primary task** | "Where am I, what do I do next, and how long will it take?" |
| **Constraint** | Static HTML on Vercel, one maintainer, so the right structure is one that is cheap to keep consistent. |

## 2. What the site looks like today

**Seven content groups, one flat URL space.**

| Group | Pages | Where they live | Local nav |
|---|---|---|---|
| Guide (stages 1–9 plus CRBA and delayed I-130) | 12 | `/guide/*` | Sidebar + breadcrumb |
| Naturalization (steps 1–8 + 3 extras) | 12 | `/naturalization/*` | Sidebar + breadcrumb |
| "Your interview" (221(g), public charge, re-interview, dates, templates, admin processing, domicile, history worksheet…) | 13 | **Site root** | Breadcrumb only |
| Checklists and tools | 13 | **Site root** | Breadcrumb only |
| Delayed I-130 remedies + mandamus | 2 | **Site root** | Breadcrumb claims they sit under the Guide |
| Data, News, Life, About, Privacy, Glossary | 6 | Site root | None |
| Dead stubs (`tools.html`, `tracker.html`) | 2 | Root; redirected away in `vercel.json`, never served | – |

**Top nav: 10 items.** Home · Data · Guide · Interview · Checklists & Tools · Life in the USA · Naturalization · About · Submit Timeline · Support. News, the most time-sensitive content on the site, is not among them.

**Very long pages.** `/public-charge` 15,600 words · `/life` 9,900 · `/data` 7,300 · `/delayed-i130-remedies` 6,200 · `/i864-household-decision-tree` 6,000 · `/guide/interview` 6,000 · `/guide/nvc` 5,400 · `/checklists` 4,500.

**What already works and should be kept:** the homepage "Where are you in the process?" picker; guide and naturalization sidebars with a clear current-stage highlight; breadcrumbs on almost every page; one shared nav source; the active nav state (verified on `/221g`, which correctly lights "Interview").

---

## 3. Findings

### Severity 3: makes people work to find the right page

**F1. The top nav has 10 items, organised by section rather than by journey.** *(Hick's Law, Serial Position, Mental Model)*
Ten peers with equal weight. "Home" duplicates the logo; "About" and "Support" are housekeeping; "Life in the USA" is also Stage 10 of the Guide; Naturalization is for people 3+ years after the visa. Meanwhile News, the reason most returning visitors come back each week, is missing. On a phone this becomes a 10-row hamburger list.
**Recommendation:** five primary items plus one call to action:

```
Guide ▾        Interview      Data      News      Tools        [Submit your timeline]
 Stages 1–9                                                     (button, right)
 After you land (Life)
 Citizenship (Naturalization)
```
Move About, Privacy and Support (Ko-fi) to the footer and the brand area. Drop "Home": the logo is the home link (Jakob's Law).

**F2. There are two "interview" homes.** *(Consistency H4, Mental Model)*
`/interview` (the hub that came out of the 30 Sep review) and `/guide/interview` (Stage 6, the best page on the site for a first interview, 6,000 words) both claim the topic. The hub's most-linked target is `/guide/interview`, and Stage 6's sidebar never shows the 13 pages filed under "Your interview". So a person on Stage 6 cannot see the 221(g), public charge or re-interview pages in their local nav, and a person on the hub has to leave it to reach the core content.
**Recommendation:** make the interview one section with one local nav. Either (a) turn `/interview` into the section landing page and give every interview-cluster page the same sidebar the Guide uses, with Stage 6 as its first item; or (b) fold the hub's situation cards into the top of Stage 6 and make the cluster children of Stage 6. (a) is less disruptive, because it keeps the stage pages unchanged.

**F3. URLs don't match the hierarchy the breadcrumbs describe.** *(Navigation: orientation; Consistency H4)*
Breadcrumbs say `Home › Your interview › 221(g) › Administrative processing`, but the URL is `/administrative-processing`. Twenty-eight pages live at the root while the breadcrumbs put them three levels deep. Trails also disagree with each other:
- `relationship-evidence-template`: Home › **I-130 › I-130 checklist** › Template
- `relationship-evidence-example`: Home › **I-130 checklist** › Template › Example
- `delayed-i130-remedies` and `mandamus-pro-se` say they sit under the Guide, but neither appears in the Guide sidebar.

**Recommendation:** move each page under the URL its breadcrumb claims, with permanent redirects in `vercel.json` (the redirect list already has this pattern):

| Now | Proposed |
|---|---|
| `/221g`, `/221g-sheet`, `/administrative-processing`, `/history-worksheet`, `/domicile`, `/reinterview` | `/interview/221g/...` |
| `/public-charge`, `/public-charge-statement` | `/public-charge`, `/public-charge/statement` (see F5) |
| `/interview-dates`, `/interview-templates`, `/interview-day-sheet`, `/interview-questions` | `/interview/...` |
| `/checklist-*`, `/worksheet-*`, `/master-checklist`, `/workbook`, `/i864-household-decision-tree`, `/relationship-evidence-*` | `/tools/...` |
| `/delayed-i130-remedies`, `/mandamus-pro-se` | `/guide/delayed-i130/remedies`, `/guide/delayed-i130/mandamus` |
| `/english-test`, `/checklist-n400` | `/naturalization/...` |

Then generate breadcrumbs from the URL path so they can't drift.

**F4. "Checklists & Tools" has become the place for everything that doesn't fit elsewhere.** *(Organization scheme consistency, Miller's Law, Choice Overload)*
At 4,500 words it holds ~25 tool cards across every stage, plus legal remedies for delayed I-130s, naturalization flashcards, official sources, a "Need a lawyer?" block and third-party services. Interview-day prep alone has four overlapping tools: Interview Day Checklist, Interview-day sheet, Interview Binder Checklist and Master Checklist. Users can't tell which one to print.
**Recommendation:**
1. Keep it purely a tool index, grouped by stage in the same order as the Guide, with jump chips at the top ("NVC · Medical · Interview · After").
2. Move the delayed-I-130 remedies and naturalization blocks to their own sections (they're already reachable there). Move "Need a lawyer?" and official sources to About or the footer.
3. Merge the interview-day tools into two: one **checklist** (what to bring, binder order) and one **day-of sheet** (one page to print). Fold Master Checklist into the stage-grouped index itself, which is already a master list.

**F5. Public charge is a 15,600-word single page, filed under the wrong parent.** *(Aesthetic & minimalist H8, Recognition over recall H6)*
Twenty-three pages link to it, more than to any other page except the homepage, Checklists and Interview. Its breadcrumb puts it under "Your interview", but most of the work (the I-864, sponsors, the household calculator) happens at Stage 2, NVC. It has 12 numbered sections, including separate IR2 and IR5 sections that most readers skip.
**Recommendation:** make it a cross-stage topic hub at `/public-charge` (short: the five factors, the "do these five things" box, links out) with child pages: *Evidence pack*, *Sponsors & I-864* (absorbs `/worksheet-i864` and the household calculator links), *Children & parents (IR2/IR5)*, *If refused under 212(a)(4)*, *Statement builder*. Link it from both the NVC and Interview local navs.

### Severity 2: costs time or causes doubt

**F6. The homepage repeats a lot of content and leaves sections out.** *(H8, Serial Position, Consistency)*
- The "Explore the site" cards list Guide, Data, Checklists, Life and About, but not Interview, News or Naturalization, so they don't match the nav.
- Five full news items (~900 words) are inlined, which pushes the "What this site is" explainer to the very bottom, where first-time visitors won't reach it.
- "This Week in the Community" shows five zero-count tiles ("0 Medicals · None this week") most weeks. An empty state without a next step drains goodwill.

**Recommendation:** order the homepage as hero + stage picker → "This week" (hide zero tiles; show the CTA when everything is empty) → 3 news **headlines** → "Browse by section" cards matching the new nav → about/independence strip. Cut About from the cards because the footer covers it.

**F7. The stage picker is a flat list of 10 buttons.** *(Miller's Law, Hick's Law)*
It works, but ten equal chips is a lot to scan on a phone, and it mixes three situations that are about the same event.
**Recommendation:** chunk it into three labelled rows. **Before the interview:** Just starting · NVC emailed me · DQ'd, waiting · Letter arrived. **The interview:** I have a date · Rescheduled · Handed a 221(g) · Called back. **After:** Visa in my passport · Just landed. No new pages needed.

**F8. The same thing has different names in different places.** *(Labeling consistency, H4)*

| Concept | Labels in use | Pick one |
|---|---|---|
| Interview section | "Interview" (nav), "Your interview" (crumbs, H1) | **Interview** |
| Tools | "Checklists & Tools" (nav), "Checklists and tools" (crumbs), "Checklists & Templates" (homepage card) | **Tools** (short; the page title can expand it) |
| Data | "Data" (nav), "Data Tracker" (card, title) | **Data** |
| Guide | "Guide", "The Guide", "Visa Guide" (title) | **Guide** |
| Life | "Life in the USA" (nav), "Life in the US" (card), "Stage 10: Life in the USA" (hub) | **Life in the USA** |

Write these into a short word list next to `nav.js` so new pages use them.

**F9. Delayed I-130 has a three-level chain and three entry points.** *(Excise: navigational)*
`/guide/delayed-i130` (1,300 words) → `/delayed-i130-remedies` (6,200) → `/mandamus-pro-se` (2,300), plus four deep links from Checklists into `#congressional`, `#demand`, `#mandamus` and `#whitehouse`. Many readers are at Stage 1 and stalled right now, so this is a well-used path.
**Recommendation:** merge the guide page and the remedies page into one `/guide/delayed-i130` with a sticky in-page TOC (escalation ladder as the TOC). Keep mandamus as its single child. Remove the four cards from Checklists.

**F10. There's no site search across 60+ pages.** *(Search system; H7 flexibility)*
The only search input is the filter on the question bank. Returning users ("where was the bit about medical validity?") have to remember which of 13 interview pages holds the answer.
**Recommendation:** add a static search index built at deploy time (Pagefind runs on plain HTML, needs no server, and fits the existing `buildCommand`). Put it in the nav as an icon plus "Search" label; on phones, at the top of the menu. Index the glossary too.

**F11. Long pages without local navigation.** *(H6, Goal-Gradient)*
`/life` (9,900 words, 7 sections) and `/data` (7,300 words, 11 sections) have no sidebar or sticky TOC. The guide pages show how well a sidebar works here.
**Recommendation:** give both a sticky "On this page" TOC (sidebar on desktop, collapsible on phones). Consider splitting `/life` into *First weeks* and *First year & keeping your card*, which matches its own H2s.

### Severity 1: cosmetic or cleanup

**F12. Nav links use `.html` URLs that redirect.** `nav.js` points to `/index.html`, `/guide.html`, `/checklists.html`, `/life.html`, `/naturalization.html` and `/about.html`. Each one costs a 308 hop on every click, and the brand link goes to `/index.html`, not `/`. Point them at the clean URLs.

**F13. "Life in the USA" uses the same house icon as "Home"** (`nav.js`, both `<path d="M3 9l9-7…">`). Two identical icons on adjacent items read as the same destination. Goes away with F1; otherwise give Life its own glyph.

**F14. Dead and orphan files.** `public/tools.html` and `public/tracker.html` are never served (vercel redirects catch them first), so delete them. `/Moving_to_the_USA_Workbook.xlsx` is linked but sits outside `/downloads/` like the other files; move it for consistency. `/glossary` is only reachable from guide pages: add it to the footer.

**F15. The CRBA and delayed-I-130 entries in the Guide sidebar are unnumbered sub-items under Stage 1.** That is correct, but they're the only indented items, so they look like part of Stage 1's steps. Label them as branches ("If…") with a small branch icon, or move them to a "Special situations" group at the foot of the sidebar.

---

## 4. Proposed information architecture

```
/                          Home: stage picker → this week → headlines → sections
/guide                     Hub + stages 1–9   (sidebar)
  /guide/delayed-i130        (+ /mandamus)
  /guide/crba
/interview                 Section landing: situations   (sidebar, NEW)
  /guide/interview           Stage 6 stays canonical, listed first in sidebar
  /interview/221g            (+ /sheet, /admin-processing, /history, /domicile, /reinterview)
  /interview/dates, /templates, /day-sheet, /questions
/public-charge             Cross-stage topic hub   (sidebar, NEW)
  /public-charge/evidence, /sponsors, /ir2-ir5, /refusal, /statement
/data                      (sticky TOC)
/news
/tools                     Stage-grouped index; children /tools/*
/life                      (Guide ▾ "After you land")
/naturalization/*          (Guide ▾ "Citizenship")
/about  /privacy  /glossary   footer only
```

The site then has three kinds of page: **section landings** (Guide, Interview, Public charge, Tools, Naturalization), **content pages** that always show their section's sidebar, and **tools**. Every page has one parent, its URL reflects that parent, and the breadcrumb is generated from the URL.

## 5. Suggested order of work

| # | Change | Findings | Effort | Why this order |
|---|---|---|---|---|
| 1 | Nav to 5 + CTA; clean URLs; label word list | F1, F8, F12, F13 | S | One file (`nav.js`) and it changes every page at once |
| 2 | Interview section sidebar, Stage 6 first | F2 | M | Fixes the busiest cluster; reuses guide sidebar CSS |
| 3 | Tools index by stage; merge interview-day tools | F4 | M | Removes the biggest page of mixed content |
| 4 | Homepage reorder + chunked picker | F6, F7 | S | Front door matches the new nav |
| 5 | Static search | F10 | S–M | Safety net while URLs move |
| 6 | URL moves + redirects; generated crumbs | F3, F14 | M | Do after 2–3 so pages only move once |
| 7 | Public charge split | F5 | L | Biggest content edit; needs care with deep links from Reddit |
| 8 | Delayed I-130 merge; Life/Data TOCs; sidebar branches | F9, F11, F15 | M | |

**Test before committing to F1 and F3:** run a quick tree test (e.g. 8–10 people from the community, 5 tasks such as "You've been handed a green sheet. Where do you go?") on the current nav versus the proposed one. The labels in F8 are the most likely to need adjusting.
