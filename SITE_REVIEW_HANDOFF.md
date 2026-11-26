# Site review handoff: American Visa Guide

Written 16 November 2026, to resume this work in a new chat. It covers what changed in the site architecture review, why, how the site works now, what to watch out for, and the updated design critique with next steps.

**To resume:** open a new chat in `/Users/erinsaxon/AVG` and say something like *"Read SITE_REVIEW_HANDOFF.md, then start on step 1 of the follow-up plan."*

Related files: `SITE_ARCHITECTURE_REVIEW.md` (the original review, with a status note per step at the top) and `docs/site-labels.md` (the agreed section names).

---

## 1. What changed, and why

The original critique (15 Nov 2026, `SITE_ARCHITECTURE_REVIEW.md`) found that the site was organised by how it had been built, not by how people use it. Visitors are UK applicants in a London family visa case, mostly on phones, often arriving from Reddit with one question. All eight recommended steps are now live. Every push to `main` deploys to production on Vercel.

| Step | Commit | What changed | Why |
|---|---|---|---|
| 1. Menu | `f516112` | The top nav went from 10 items to Guide ▾ (Visa guide, Life in the USA, Naturalization), Interview, Data, News, Tools and a "Submit your timeline" button. Home, About and Support moved to the logo and footer. Labels unified, with the word list in `docs/site-labels.md`. | Ten equal items was too many to scan (Hick's Law), News was missing, and the same thing had three names in places. |
| 2. Interview sidebar | `5eb90fb` | The 14 interview pages share one sidebar from `js/section-nav.js` + `css/section-nav.css`: a left rail from 1100px, and an "In this section" fold-out on phones. | Interview content was spread across 13 pages with no local navigation, and it overlapped Stage 6. |
| 3. Tools page | `776a42a` | `/checklists` (now `/tools`) grouped by stage in guide order, with jump links. The four interview-day tools are kept but labelled by when to use them: binder first, checklist in the last week, day sheet the night before. Official sources and the lawyer finder moved to `/about#resources`. | It had become a 4,500-word page of mixed content. **Changed from the review:** the interview tools were *not* merged, because each does a different job and three save ticks. |
| 4. Homepage | `a7d42d2` | Stage picker in three labelled rows (before / the interview / after). Empty "This week" tiles hidden. News cut to three headlines (`data-news-compact` in `js/news.js`). Section cards match the menu. | Too much repetition, nine zero tiles most weeks, and the cards didn't match the nav. |
| 5. Search | `d2104b4` | Pagefind site search at `/search`, built at deploy by `scripts/build-search.mjs`. "Search" in the nav, and a search box on the 404 page. Covers pages, news items and glossary terms. | 60+ pages and no way to find a remembered fact. |
| 6. Addresses | `8a7144a` | 27 pages moved under their section's address, for example `/interview/221g/green-sheet`, `/tools/workbook`, `/public-charge/statement`. Every old address has a permanent redirect. The nav works out the section from the first part of the address. `test/breadcrumbs.test.js` keeps breadcrumbs matching addresses. | Breadcrumbs described a hierarchy the addresses didn't have. |
| 7. Public charge | `ee43558` | A 13,600-word page became an overview plus seven pages: evidence, questions, sponsors, children-and-parents, template, refused and sources. It has its own sidebar, and old `#anchors` redirect via `js/public-charge-anchors.js`. | It was the longest and second most linked page. **Changed from the review:** seven children, not five, to keep the overview short. |
| 8. Delayed I-130 and long pages | `bf3e4a2` | The remedies page merged into `/guide/delayed-i130` as "The escalation steps", with a jump list. `/mandamus-pro-se` became `/guide/delayed-i130/mandamus`. Life and Data got an "On this page" box. | A three-page chain for one task, and two very long pages with no contents. |

**Follow-up fixes after the review:**

| Commit | What | Why |
|---|---|---|
| `606bdd1` | Removed the stray `public/index.js` and `public/submit.js`. | Unused uploads; `/submit.js` exposed old server code publicly. |
| `88da2ad` | 404 workaround (see section 3). | Missing pages showed the homepage. |
| `1896dfa` | Fixed the 5 long-failing tests: one real page bug (the N-400 list's sidebar was missing "Delays, denials"), plus a stale anchor snapshot and stale naturalization previous/next tests. | The suite is now fully green: 163/163. |

---

## 2. How the site works now (conventions)

- **Deploy:** pushing to `main` deploys production on Vercel in about 30 seconds. Branch pushes create preview deploys, which are protected by Vercel login (the Vercel MCP `web_fetch_vercel_url` tool can read them).
- **Menu and footer:** `public/js/nav.js` + `public/css/nav.css` are the only source. The active section comes from the first part of the address (`ACTIVE_MAP` has one entry per top-level folder).
- **Section sidebars:** `public/js/section-nav.js` holds one link list per section (`interview`, `public-charge`). A page opts in with `<script src="/js/section-nav.js?v=…" data-section="interview" defer>` plus the CSS. The guide and naturalization sidebars are still static HTML copied into every page, as a sidebar and a phone drawer (see N2 below).
- **Addresses:** every page lives under its section. Moves go in `vercel.json` `redirects`, both `/old` and `/old.html`. `scripts/url-map.json` records the step 6 moves.
- **Search:** only pages whose `<main>` has `data-pagefind-body` are indexed, so **new content pages must add it**. Glossary records need unique addresses (`/glossary#term-<slug>`), because Pagefind keeps one record per address. The slug function exists in both `js/glossary.js` and `scripts/build-search.mjs`.
- **Caching:** `/js/` and `/css/` are cached for a year. **Any changed script or stylesheet needs its `?v=` bumped on every page that loads it**, or returning visitors keep the old copy.
- **Long pages:** the house pattern is an "On this page" `div.toc` box plus `/js/page-contents.js`, which adds a floating Contents button.
- **Link styling trap:** `readability.css` underlines and recolours plain links in `<main>` (`main a:not([class])`, specificity 0,2,2). Components that must not be underlined need a doubled class, e.g. `.tools-jump.tools-jump a`.
- **Tests:** `npm test` (163 tests). The key guards are `breadcrumbs.test.js`, `public-charge-pages.test.js`, and the stage and article page ID snapshots in `test/fixtures/`. Update a snapshot only after confirming no anchor was removed.
- **Copy:** use "Erin" only in site copy, never a surname or employer.

---

## 3. Known issue: missing pages and the 404 page

Vercel serves the **homepage with status 200** for any address that doesn't exist, instead of `public/404.html`.

- **Ruled out, on preview deploys:** the stray root scripts; `cleanUrls`; everything in `vercel.json` (cut to framework, build command and output folder); and the `api/` folder. The homepage fallback (same ETag as `/`) persisted every time.
- **Also ruled out:** the project has framework "Other", no project routing rules, no protection on custom domains. `/404` and `/404.html` serve correctly when opened directly, and `/api/*` misses get a real `NOT_FOUND`.
- **Not checked:** the firewall config (declined) and dashboard Build & Output overrides.
- **Workaround live (`88da2ad`):** a script at the top of `public/index.html` sends any path other than `/`, `/index.html` or `/index` to `/404?from=<path>`. The 404 page shows the address that was tried and pre-fills the search box with its words. It's still a soft 404 (status 200).
- **Next:** a Vercel support ticket, using the four preview tests as the reproduction. Remove the workaround once fixed.
- **Practical rule:** a 200 status proves nothing on this site, so **check pages by `<title>`**.

---

## 4. Updated design critique (16 Nov 2026)

Method: re-measured all 70 pages (words, local navigation, breadcrumbs, inbound links), walked the live site at 1366×800 and 375×812, and checked every original finding. Severity uses Nielsen's 0–4 scale.

### Original findings: status

| # | Finding | Status |
|---|---|---|
| F1 | 10-item nav | Fixed |
| F2 | Two interview homes | Mostly fixed (linked both ways; some overlap remains, see N7) |
| F3 | URLs vs breadcrumbs | Fixed, and guarded by a test |
| F4 | Tools dumping ground | Fixed |
| F5 | Huge public charge page | Fixed |
| F6 | Homepage | Fixed, but see N1 |
| F7 | Flat stage picker | Fixed |
| F8 | Inconsistent labels | Mostly fixed (see N8) |
| F9 | Delayed I-130 chain | Fixed |
| F10 | No search | Fixed |
| F11 | Long pages without contents | Partly fixed (see N3) |
| F12–F14 | Redirecting links, icon, dead files | Fixed |
| F15 | Stage 1 branch labels | No change needed |

### New and remaining findings

**Severity 3**

- **N1. On phones, the homepage's main action starts below the first screen.** The 15-word heading ("Your guide to the United States family immigrant visa process via the U.S. Embassy, London") wraps to **6 lines** at 375px and 4 at 1366×800. The stage picker starts 628px down an 812px screen, and only 2 of its 10 buttons show. *(Visual hierarchy; Serial position.)* **Fix:** a heading of about six words, e.g. "Your UK-to-US family visa, step by step", with London in a one-sentence subheading. Target: the first picker row visible on a 375×667 phone without scrolling.
- **N2. Three local-navigation patterns on phones.**
  - **Guide stages:** an **unlabelled floating "☰"**, the same icon as the site menu, so two hamburgers share the screen.
  - **Naturalization:** a floating "☰ Steps".
  - **Interview and public charge:** the "In this section" fold-out.

  *(Consistency H4; mystery meat navigation.)* **Fix:** use the fold-out everywhere by moving the guide and naturalization lists into `section-nav.js`. That also removes 26 hand-copied guide sidebars. **Minimum:** label the guide button "☰ Stages".

**Severity 2**

- **N3. Long guide stage pages have no "On this page" list:** `/guide/delayed-i130` (5,900 words), `/guide/interview` (5,200), `/guide/nvc` (4,400, 8,600px tall on a phone), and `/public-charge/template` (3,200). *(H6.)* **Fix:** the house `div.toc` + `page-contents.js` pattern on pages over about 2,500 words.
- **N4. Tool pages don't link across to related tools.** `/tools/checklist-nvc` links to one other tool, though three more belong to Stage 2. *(Contextual navigation.)* **Fix:** a "More tools for this stage" list from one shared source, e.g. a `tools` entry in `section-nav.js`.
- **N5. The N-400 list's "Clear all ticks" doesn't confirm** (`public/js/n400-checklist.js:101`). The other checklists and the statement builder do. *(H5, H3.)* **Fix:** one `confirm()`, using the same wording as `js/checklist.js`.
- **N6. Soft 404** (section 3). **Fix:** Vercel support.

**Severity 1**

- **N7.** The interview hub and Stage 6 overlap in places. Keep the hub to short routing summaries, and put the detail in Stage 6.
- **N8.** Leftover labels: "Data Tracker" (the Data page's `<title>` and About) and "Checklists & Tools" (`/naturalization/english-test`). Use "Data" and "Tools".
- **N9.** No breadcrumb on `/data`, `/life` and `/tools`. Add one for consistency.
- **N10.** `/Moving_to_the_USA_Workbook.xlsx` sits in the site root, not `/downloads/`. Move it, with a redirect, the next time it's updated.

### Suggested order

| # | Change | Findings | Effort |
|---|---|---|---|
| 1 | Shorter homepage heading and subheading | N1 | S |
| 2 | Confirm before "Clear all ticks"; leftover labels; crumbs on Data, Life and Tools | N5, N8, N9 | S |
| 3 | One phone pattern for local nav (guide and naturalization onto `section-nav.js`) | N2 | M |
| 4 | "On this page" on long stage pages | N3 | S–M |
| 5 | "More tools for this stage" on tool pages | N4 | S–M |
| 6 | Vercel support ticket for the 404 fallback | N6 | Your side |

**Worth testing with real visitors:** whether a six-word heading still tells first-time visitors from Google that the site is about London. If not, keep "London" in the heading and cut elsewhere.

---

## 5. Working pattern used so far

Each step: implement locally, verify in the browser at desktop and phone width (local server: `static-public-alt` in `.claude/launch.json`, port 8766, which serves `.html` paths only), run `npm test`, then commit and push on request. After each deploy, check the live site by page title. Erin approves each commit and push separately.
