# Data section split: design

Date: 26 November 2026
Status: proposed, waiting for Erin's approval
Mockup: `public/_design-preview/data-hub-middle.html` (the approved look). An earlier alternative, `data-hub.html`, was not chosen.

## Why

`/data` is one 1,460-line page. Members' own reports (interview letter drops, DQ backlog, wait times, outcomes, passports, the calculator) fill the top, and official USCIS and State Department figures sit at the bottom under "The National Picture". The two kinds of number answer different questions and have very different strengths. Members' reports are a small group but the only source for interview letters, DQ dates and interviews. Official figures count every case but arrive months late. On one long page they blur together, and the official section is hard to find.

Erin wants `/data` split the way `/guide` is: a short landing page, then one page per topic, grouped so readers always know whether a number comes from members or from an official report. The landing page should give a quick sense of what matters, not pile every table onto the first screen.

Most visitors land on `/data` to answer one question, often straight from Reddit: has London sent new interview letters? That answer has to stay on `/data`.

## Goals

- `/data` becomes a landing page: a heading, one live status line about interview letters, then two plain lists of pages, "From members" and "From official reports".
- Six topic pages, three in each group, each built from content that already exists (plus the comparison page, which moves onto the site).
- Every topic page says at the top which kind of data it holds, where the numbers come from, and when they were last updated.
- The section shares one sidebar with the rest of the site's section system (`js/section-nav.js`), with previous and next links between pages like the guide stages.
- Accessible to WCAG 2.1 AA, checked the same way as the mockup (see "Accessibility").
- Plain, human wording throughout. Use the copy in this document as written.

## Non-goals

- No new statistics or charts beyond what `/data`, the comparison artifact and the repo's collected official data files already hold. (The London monthly chart on the family visas page is drawn from `data/official-stats/london_issuances.csv`, already collected.) The London I-130 dashboard artifact's findings (FOD shift, denial share, monthly reports to Congress) are not part of this change; they can become a later addition to "I-130s across the US".
- No change to `/api/data`, its numbers, or the homepage, which reads `/api/data` on its own.
- No change to how drop windows are estimated.
- No live feed from `national_stats` in Supabase. Official pages stay static HTML, updated by hand when new figures publish, as today.

## Anti-goals (this fails even if it works)

- A reader can't tell whether a number came from members or from USCIS or the State Department.
- The drop status leaves `/data`, so the Reddit visitor has to click to find out whether letters went out.
- The landing page turns into a dashboard with figures on every card. Erin compared this (the "quick-look cards" mockup) and chose the plainer list.
- Any public page or page source shows member usernames or other personal details. Individual members' points (like the comparison chart's dots) are shown only as a month and a wait (rule agreed 25 Nov 2026). Batch-level figures stay exact: the DQ date range each letter batch covered, the oldest waiting DQ date and the latest DQ date with a letter keep their exact dates, because they describe batches, not named people, and the exact cut-off is what waiting families need (Erin, 26 Nov 2026). The fallback data in page source must not add usernames.
- Existing links break. Reddit threads and the site link to `/data` and `/data#official-data`, and the live site serves the homepage with status 200 for unknown URLs, so a broken link fails silently.

## Approaches considered

| | What it is | Trade-off | Decision |
|---|---|---|---|
| A. Menu page only | `/data` is a plain list of pages, like `/guide`, with no live data | Tidy and fast, but readers must click to learn whether letters went out | Rejected: hides the one answer most visitors want |
| B. Quick-look cards | Big status card plus a card for each page showing one live figure | Answers at a glance, but heavier, needs live figures chosen for every card, and reads as a dashboard | Rejected by Erin after seeing the mockup |
| C. List plus one status line | A's plain list, with one live line about interview letters above it | Keeps the answer on `/data` while staying a simple contents page | **Chosen** |

## The landing page: `/data`

Layout follows the mockup exactly. Top to bottom:

1. Breadcrumb: Home › Data.
2. H1: **London family visa data**
3. Subtitle: *From members' own timelines, and from official reports by USCIS and the State Department.*
4. **Status line** (one line, a link at the end; see below).
5. Section "From members". Tag: FROM MEMBERS (people icon). H2: **What members are telling us**. Intro: *Dates London families have shared with us. It's a small group, but it's the only place to see when interview letters go out and how interviews are going. This section is updated as members share dates.* Then a list of three pages, each with a link and one sentence.
6. Section "From official reports". Tag: FROM OFFICIAL REPORTS (building icon). H2: **What the official figures say**. Intro: *Numbers USCIS and the State Department publish. They count every case, not just our members', but they come out months later.* Then a list of three pages, each with a link, one sentence, and how often it updates.
7. Closing note: **Where the numbers come from.** *Pages marked "From members" use timelines London families share with us. Pages marked "From official reports" use figures from USCIS and the State Department. Every page says when it was last updated. Waiting yourself? Share your timeline and help the next family.* ("Share your timeline" links to the existing submit page.)

The page lists use a `<ul>` (they are links, not data), styled like the guide hub's stage table: one bordered box per group, alternate rows lightly shaded, link in bold and underlined in the group's colour.

### Page list copy

From members (no per-row "updated" line; the intro covers it):

| Link text | Sentence |
|---|---|
| Interview letters | Each batch London has sent, which cases it covered, and who is still waiting. |
| Wait times and calculator | How long each step has taken members, and a rough estimate for your own dates. |
| Interviews and passports | How interviews went, cases asked for more paperwork, and how fast passports came back. |

From official reports:

| Link text | Sentence | Updated |
|---|---|---|
| I-130s across the US | How many petitions USCIS receives and decides, how many are waiting, and how long they take. | USCIS updates every 3 months |
| London and worldwide family visa data | How many family visas the London embassy gives out each month, and how many are issued worldwide. | Monthly, a few months behind |
| Do members' waits match USCIS? | How long our members waited for I-130 approval, next to the national figure. | When new official figures come out |

### The status line

It reuses the logic of today's `renderBanner` in `data.html` (four states from `stats.next_drop_window_start` / `_end` and the latest drop date), rewritten as one sentence. The link always reads **See every letter batch** and goes to the Interview letters page.

| State (today's chip) | Bold lead | Rest of the sentence |
|---|---|---|
| Delayed (window passed, no drop) | **No new interview letters yet.** | London last sent letters on {last drop date}, {n} days ago. |
| In range | **Letters could go out any day.** | London last sent letters on {last drop date}, {n} days ago. |
| Approaching (within 7 days) | **Letters may go out soon.** | Members expect the next batch from {window start}. London last sent letters on {last drop date}. |
| Outside range | **No letters expected yet.** | London last sent letters on {last drop date}, {n} days ago. Members expect the next batch from {window start}. |
| A drop in the last 7 days (new) | **New interview letters went out on {date}.** | They covered cases ready by {latest DQ date in that drop}. |

Dates are written in full ("14 July 2026"). If `/api/data` fails, use the same frozen fallback values `data.html` uses today and add *"These are the last figures we could load."* The dot beside the line is decorative (`aria-hidden`); the words carry the meaning. Use `role="status"` so the filled-in sentence is announced.

## The topic pages

URLs (builder's call if a better slug fits, but keep them short and stable):

| Page | URL | Built from today's `/data` |
|---|---|---|
| Interview letters | `/data/interview-letters` | IL banner and its four tiles, "IL Drop History" table, "DQ Backlog: Awaiting Interview Letters" |
| Wait times and calculator | `/data/wait-times` | "Pipeline Status", "Wait times by phase" (phase cards), "Timeline Calculator" |
| Interviews and passports | `/data/interviews` | "Interview Outcomes", "Passport Return Times" |
| I-130s across the US | `/data/i130-us` | "The National Picture": the USCIS part (immediate-relative and family-preference tables and charts) |
| London and worldwide family visa data | `/data/family-visas` | London first: monthly IR1 and CR1 visas issued in London, October 2023 to February 2026, from `data/official-stats/london_issuances.csv` (a chart and a table; the same figures the comparison page uses). Then "The National Picture": the State Department part, which is worldwide (family visas each month split by the 75 pause countries, `od-chart-visas`, `od-iv-table`) |
| Do members' waits match USCIS? | `/data/tracker-vs-uscis` | The comparison artifact (claude.ai/artifact/RsaBq48RjZfM9oNDEFgGCJ, version 5), restyled in the site's CSS |

Every topic page has, in order:

1. Breadcrumb: Home › Data › {page}.
2. The group tag (FROM MEMBERS or FROM OFFICIAL REPORTS), same style as on the landing page.
3. H1 = the link text from the landing page.
4. One line saying where the numbers come from and when they were last updated, Member pages say *Live from timelines members share. These figures load each time you open the page.* with no date: `/api/data`'s `meta.last_updated` is stamped with the time of every request, so it would overstate freshness, and changing the API is a non-goal (builder check, 26 Nov). Official pages hard-code the period, e.g. *From USCIS quarterly reports. The latest covers April to June 2026.*
5. The moved content, with its existing ids kept.
6. Previous / next links (the `stage-prevnext` pattern from the guide), in the sidebar's order.

Member pages keep their live loading from `/api/data` and the frozen fallback. The inline module script in `data.html` should become one shared script (e.g. `js/data-pages.js`) that each page loads, with each render function running only if its element is on the page. The calculator's script moves with the calculator.

The comparison page keeps its two charts, tables and "How to read this" text from version 5 of the artifact: dots by month, plain-language tiles, the quarter table, the heading "Our members wait about as long as everyone else for I-130 approval". Its data stays a static snapshot (as of 25 Nov 2026) embedded in the page. It uses d3 from the site's existing approach to charts if there is one; otherwise loading d3 from cdnjs as the artifact does is fine.

## Sidebar and navigation

Add a `data` entry to `SECTIONS` in `js/section-nav.js`, with label "Data":

- Data overview (`/data`)
- heading **From members**: Interview letters, Wait times and calculator, Interviews and passports
- heading **From official reports**: I-130s across the US, London and worldwide family visa data, Do members' waits match USCIS?
- Share your timeline (the submit page)

Every `/data` page loads the sidebar with `data-section="data"`. The top nav's "Data" link (`data-navpage="data"`) must show as current on all `/data/*` pages; check how `nav.js` decides the current item and extend it if it only matches `/data` exactly.

## Old links

URL fragments never reach the server, so add `js/data-anchors.js`, loaded in `<head>` on `/data` only and modelled on `js/guide-anchors.js`. It maps every section id that moves to its new page, keeping the fragment where the id survives on the new page. At minimum: `official-data` → `/data/i130-us`, `calculator` → `/data/wait-times#calculator`, and the ids of each moved section (`pipeline-hd`, `phases-hd`, `drops-hd`, `backlog-hd`, `outcomes-hd`, `passport-hd`, `calc-hd`, `official-hd`, plus the official section's State Department sub-ids such as `od-iv-cap` → `/data/family-visas`). Generate the map from today's `data.html` so nothing is missed.

Update the one in-site deep link (`/data#official-data`) to point straight at the new page.

## Look and colour

Taken from the mockup:

- Members colour `#0F5E66`, tint `#EAF2F3`. Official colour `#7A4A12`, tint `#F5EEE6`. Do not use the petitioner, beneficiary or "either" role colours.
- Tags: uppercase, 13px bold, icon plus words. Colour is never the only signal; the tag's words are always shown.
- Links underlined, 44px minimum hit area for list and status links, the site's focus ring.
- No new fonts. Reuse `stage.css`, `guide-article.css`, `readability.css`, `section-nav.css`; put the new rules in one new stylesheet (e.g. `css/data-section.css`).
- Bump the `?v=` on every CSS or JS file that changes (site convention).

## Accessibility

Checked on the mockup on 26 Nov 2026 and required on every page in the section:

- Text contrast 4.5:1 or better (mockup's lowest: 6.5:1).
- One H1 per page, H2 per section, lists for lists, tables only for tabular data with `<th scope>`.
- Keyboard order follows reading order; visible focus on every link and control.
- No sideways scrolling at 320px width.
- `lang="en-GB"` on the section's pages.
- Charts keep a text alternative: the tables under them, and an `aria-label` summary on each chart container.
- Test once with VoiceOver before launch (not done on the mockup).

## Launch checks

- Each new URL returns its own `<title>`, not the homepage (status codes don't prove this on the live site; titles do).
- `/data#official-data`, `/data#calculator` and the other mapped ids land on the right page and spot.
- Sitemap lists the new pages; the search index (`scripts/build-search.mjs`, pagefind) picks them up.
- `npm test` passes; add the `data` section to the section-nav test, and a page test like `test/public-charge-pages.test.js` (every page loads `data-section="data"`, has a breadcrumb and the group tag).
- After pushing, recheck any stale URL with `?cb=` before calling the deploy broken (the CDN can serve the old page for about 15 seconds).

## Decided after the builder check (26 Nov 2026)

- The State Department part of today's `/data` is worldwide, not London. Erin chose one page for both: "London and worldwide family visa data", London first.
- Batch-level DQ dates stay exact (see Anti-goals).
- Member pages carry no "updated" date (my call; see the topic page header).
- If a new drop lands while a window is open, the "new drop" sentence wins over the window states (my call).
- "Share your timeline" links to the same submission form the nav's "Submit your timeline" button uses (my call).

## Left to the builder

- Exact slugs, as long as they are short and the anchor map matches.
- Whether the official pages' sub-sections need their own small "on this page" contents list.
- How to split the inline script, as long as each page loads only what it needs and the fallback still works.
- Meta descriptions for the new pages.
