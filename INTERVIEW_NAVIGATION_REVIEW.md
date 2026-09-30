# Interview navigation review

Reviewed 30 September 2026. Scope: `/221g#reinterview`, `/public-charge`, `/guide/interview`, and the pages a person reaches from them (`/visa-pause`, `/september-2026-update`, `/checklist-interview`, `/interview-questions`, `/guide/after-interview`, the homepage, the guide hub and the shared nav in `js/nav.js`).

Method: I walked the site as three applicants, starting from the homepage each time, and noted where each one got stuck, went the wrong way, or had to read more than 1,000 words to find the one instruction they needed. Findings are ranked by how much they cost a person the week before an interview.

---

## 1. The three applicants

| Applicant | What they need to know | Where the site keeps it today |
|---|---|---|
| **A. First interview.** Has an interview letter, possibly short notice, possibly no document check. | What to bring, where to go, the public charge statement and its 5-working-day deadline, the questions they will be asked. | `/guide/interview` (good), `/public-charge` (long), `/checklist-interview`, `/interview-questions`. Four pages, no single order to read them in. |
| **B. Rescheduled interview.** Appointment was canceled for the training; new date arrives by email, sometimes for the next morning. | Confirm by reply; don't reschedule later; is my medical still valid; what if I had no document check; has anything changed in what they'll ask (yes: the public charge worksheet). | The live notice in `js/live-notice.js`, shown only on the guide hub and stage pages. It is **not** on `/public-charge`, `/221g`, `/visa-pause`, `/september-2026-update` or the homepage body. |
| **C. Re-interview.** Had a 221(g) before the pause (ordinary, or pause-only) and has now been called back. | Which kind of 221(g) I hold and what that means; what the officer can reopen; what to update (joint sponsor tax year, I-864 edition, expiries); the domicile trap. | `/221g#reinterview`: section 8 of 11 on a page titled "how to prevent it, and how to resolve it". Also partly repeated on `/visa-pause#london` and `/september-2026-update#standing`/`#you`. |

### What each one experiences

**A. First interview.** From the homepage there is no link to the interview, the 221(g) page, public charge, or the question bank (`index.html` links only `/guide`, `/data`, `/checklists`, `/life`, `/about` and `/guide#interview-cancellations`). They click Guide → Stage 5. That page is the best one on the site for them. But its "Documents for this stage" box (`guide/interview.html:129`) lists the checklist, question bank and 221(g) page, **not** the public charge page, which the same page's "Bottom line" calls the first thing to do. The public charge page then opens with an update log and a 400-word caveat before the reader reaches the table of contents. The five-step "Do these five things" box is excellent and is the thing they needed; it should be the first thing they see.

**B. Rescheduled.** They arrive on `/public-charge` or `/221g` from a forum link. Neither page tells them interviews are being rescheduled or that the live notice exists. If they reach `/visa-pause`, it says cancellations reach London "up to and including 30 September 2026", which is today; from tomorrow that sentence reads as out of date. The live notice itself was last updated 23 September (`js/live-notice.js:39`). Medical validity is flagged as a risk ("limited validity window") but the actual period is never stated anywhere on the site, so the person cannot check their own date.

**C. Re-interview.** Their emailed instruction is "bring your passport and all your documents". Nothing in the top nav, homepage or guide hub says "called back for interview". The phrase they'd look for, "re-interview", doesn't appear in any heading. If they go to 221(g), the table of contents item is the 8th of 11. If they go to Visa pause, the page opens by telling them it has been superseded by another page. They end up reading three pages that each explain the same court ruling in slightly different words before they find the checklist they need (`221g.html`, "What to do before the new date").

The word **"pause"** is doing four jobs across these pages: the 75-country nationality pause, the diversity visa pause, the worldwide interview cancellations ("the autumn 2026 interview pause", "a pause that now reaches London appointments"), and Proclamation 10998. A person who reads "pause case" cannot tell which one applies to them.

---

## 2. Findings

### High: the person cannot find the right page

1. **No entry point by situation.** Top nav is organised by site section (Home, Data, Guide, 221(g), Checklists & Tools, Life, About). Someone with a date in their inbox has to know the site's structure. There is no "I have an interview" route.
2. **Re-interview guidance is buried under the wrong page title.** The best content for applicant C (`221g.html:802`) sits inside a prevention page. `/visa-pause` and `/september-2026-update` each link to it, but only in body text.
3. **Homepage has no path to interview content.** See above.
4. **Live notice is scoped to guide pages only.** `live-notice.js` is loaded on `guide.html` and `guide/*.html` only. The three pages most likely to be shared on forums (`/221g`, `/public-charge`, `/visa-pause`) do not show it.
5. **Stage 5's own document box omits public charge.** `guide/interview.html:129`.

### High: content that sends people the wrong way

6. **`/checklist-interview` "If not approved" conflates 221(g) with administrative processing** ("221(g) (Administrative Processing): Case under review…", `checklist-interview.html:244`). The 221(g) page spends a whole section (`#confusions`) explaining these are different. The checklist also has no link to `/221g` or `#reinterview` in that block, and describes only the nationality pause, not the September update.
7. **Date-bound wording will read as stale from 1 October 2026:** "through 30 September 2026" appears in the live notice, `/visa-pause`, `/guide/interview` and `/public-charge#fluid`. Tie the wording to a status ("cancellations have ended / are continuing") with an "as of" date, and put the date in one place.
8. **Community interview accounts on `/guide/interview` are ordered oldest-standard first.** Six pre-worksheet accounts of 40-second to 5-minute interviews (from line 274) come before the only post-change account (line 301). The caveat is there, but the ordering anchors expectations on the old standard. Put the post-change account first under its own heading.

### Medium: structure and wayfinding

9. **`/public-charge` has no breadcrumb and no link back to Stage 5**, unlike `/221g` and `/visa-pause`, which both have "Home / Guide / …" and "← Back to the interview stage". The page also opens with a changelog paragraph before its purpose.
10. **Long pages without a persistent table of contents.** `/221g` (1,045 lines of HTML) and `/public-charge` (939) have an "On this page" list at the top only. On mobile, a reader in section 8 has no way back except scrolling. A sticky or collapsible TOC, plus "↑ Contents" links after each section, would help. Stage pages already have a drawer (`mobileNavDrawer`) that could host it.
11. **Overlapping pause pages.** `/visa-pause` now opens by saying `/september-2026-update` is the current page. Two pages about the same litigation, plus the 221(g) section, is one too many for a reader. Either merge them or make `/visa-pause` an archive with a single prominent pointer.
12. **Nav highlighting gaps.** `ACTIVE_MAP` (`js/nav.js:155`) has no entry for `interview-questions` or `september-2026-update`, so no nav item is highlighted on those pages.
13. **Sitemap gaps.** `sitemap.xml` omits `/interview-questions`, `/master-checklist`, `/i864-household-decision-tree` and `/delayed-i130-remedies`. The question bank is one of the most useful pages for applicant A and is not submitted to search engines.
14. **Question bank filters by visa category only.** Questions already carry a theme (`publiccharge`, `finances`, `work`, `petitioner`, etc., in `js/interview-questions.js`) but there's no theme filter. Someone preparing for a public charge interview can't pull just those cards.

### Low

15. `/checklist-interview` "If approved" links to `/index.html` as the "data tracker"; the tracker is `/data`.
16. `/221g`'s TOC entry "An open 221(g), now called back to interview" is accurate but not the phrase people use. Add "re-interview" to the heading or TOC label so on-page search and search engines find it.

---

## 3. Recommendations

### 3.1 Add one hub: "Your interview" (`/interview`)

A short page that sorts the reader by situation, then sends them to the exact section they need. It should replace nothing; it routes to what exists.

```
Which of these is you?

[ I have my first interview date ]
   → 5-step prep list, in order:
     1. Public charge statement + evidence, CEAC + email, 5 working days ahead   → /public-charge#template, #submit
     2. Every financial document in CEAC                                        → /221g#prevent (Stage 5)
     3. What to bring (with / without a document check)                         → /guide/interview#no-document-check
     4. Rehearse questions (public charge filter on)                            → /interview-questions
     5. Getting there: South Pavilion, Ponton Road                              → /guide/interview

[ My interview was canceled and I've been given a new date ]
   → Reply to confirm now. Don't move it in AIS (later only).
   → Check expiries: medical, passport, ACRO (see date checker below)
   → The standard changed while you waited: public charge worksheet now used in every case → /public-charge
   → Then follow the first-interview list above

[ I had a 221(g) and I've been called back ]
   → Which 221(g)? (ordinary / pause-only / administrative processing)
   → /221g#reinterview and "What to do before the new date"
   → Domicile check if the petitioner has moved         → /221g#domicile

[ I was given a 221(g) at my interview ]              → /221g#resolve
[ I'm waiting after an administrative-processing 221(g) ] → /221g#security, /guide/after-interview
```

Link it from: the top nav (rename "221(g)" to "Interview", pointing here, with 221(g) moved into the hub), the homepage hero, the live notice, and the "Documents for this stage" box on Stage 5.

### 3.2 Move re-interview content to its own page (`/reinterview`)

Lift `221g.html#reinterview` and "What to do before the new date" into a standalone page, and leave a two-line summary with a link in its place on `/221g`. Point `/visa-pause#london` and `/september-2026-update#standing` and `#you` at it instead of restating the ruling. Structure:

1. Which 221(g) did you get? (a three-way chooser: ordinary document request / pause-only / administrative processing)
2. What the officer can reopen, for each
3. What has changed since your first interview (public charge worksheet, I-864 08/24/26 edition, domicile)
4. Checklist before the new date (existing list)
5. Possible outcomes, and the one-year INA §203(g) clock

### 3.3 Show the live notice on every interview-related page

Load `live-notice.js` (compact variant) on `/221g`, `/public-charge`, `/visa-pause`, `/september-2026-update`, `/checklist-interview` and `/interview-questions`. Alternatively, turn on the existing sitewide banner in `js/nav.js` (`BANNER_ENABLED`) with one line pointing to `/interview`. Replace date-bound phrasing with a status and a single "as of" date.

### 3.4 A glossary strip for "pause"

One definitions box, reused on every page that uses the word (as a shared include, like the live notice):

| Term | What it was | Status | Affects UK nationals? |
|---|---|---|---|
| Nationality visa pause (75 countries) | Jan 2026 IV suspension by nationality | Vacated 21 Aug 2026 | No (UK not listed) |
| Diversity visa pause | DV suspension | Vacated | Only DV applicants |
| Interview cancellations | Appointments canceled for public charge training | Rescheduling under way | Yes, all London IV applicants |
| Proclamation 10998 (travel ban) | 39-country IV suspension | In force | No |

Then say "interview cancellations", not "pause", for the third row everywhere.

### 3.5 Tools to add

1. **Interview date checker.** Enter the interview date (and medical date, ACRO date, passport expiry, date of any 221(g) letter). It returns:
   - Public charge statement deadline (5 working days before; skip weekends and US/UK holidays)
   - Medical still valid on the interview date? (The site currently never states the validity period; it needs to, with a travel.state.gov citation. I could not reach travel.state.gov from this environment to confirm the figure, so it isn't quoted here.)
   - ACRO within 12 months (site's own figure)
   - Passport valid 6 months beyond intended entry
   - Whether a new I-864 must be on the 08/24/26 edition (signed on or after 1 October 2026)
   - Days left on the INA §203(g) one-year clock
   - Whether the sponsor's tax year has rolled over since DQ

   This turns scattered warnings on four pages into one answer. It fits alongside the existing worksheets in `/checklists`.
2. **Public charge statement builder.** A form over the existing template in `public-charge.html#template`: the reader fills fields and chooses options A/B, and the page produces the email text plus the numbered file list. This removes the bracket-editing step, which is where people leave placeholders in.
3. **"What's on my green sheet" triage.** Tick the boxes on your sheet; get the matching rows from the box-by-box table, the submission route, and whether it's Type 1 or Type 2. The content is already in `221g.html#sheet`; this just filters it.
4. **15-year personal history worksheet** (for the DS-5535-style request in `221g.html#security`): travel, addresses, employers, education, passports, with a "check against DS-260" column. The page already tells people to prepare this before the interview, but there's no tool for it. It's the same pattern as `/worksheet-ds260`.
5. **Theme filter on the question bank**, defaulting to "public charge" when opened from `/public-charge` or `/reinterview` (for example, `/interview-questions?theme=publiccharge`).
6. **Printable "night before" one-pager.** Combine the Stage 5 "Before you move on" list, the no-document-check list, the address and South Pavilion directions, the embassy phone number, and the reschedule rule. `css/print.css` already exists.
7. **Reply templates.** Confirming a rescheduled appointment, and emailing `LNDIVSubmissions@state.gov` after a CEAC upload (subject line format already specified on `/public-charge#submit` and `/221g#publiccharge`). Copy buttons like the existing template's.

### 3.6 Page-level fixes

- `/public-charge`: add the breadcrumb and "← Back to Stage 5" link; move the changelog to the bottom or into a collapsed "What changed" line; put "Do these five things" directly under the H1.
- `/guide/interview`: add `/public-charge` (and `/interview` hub, once built) to "Documents for this stage"; lead the community accounts with the post-change account under "Since the public charge worksheet"; move the six older accounts under "Before August 2026".
- `/checklist-interview`: separate 221(g) from administrative processing in "If not approved", link `/221g#resolve` and the re-interview page, mention the September update, and fix the `/index.html` "data tracker" link to `/data`.
- `/221g` and `/public-charge`: sticky or collapsible TOC on mobile; "↑ Contents" after each H2.
- `js/nav.js`: add `interview-questions`, `september-2026-update` (and any new pages) to `ACTIVE_MAP`.
- `sitemap.xml`: add `/interview-questions`, `/master-checklist`, `/i864-household-decision-tree`, `/delayed-i130-remedies`, and any new pages.

---

## 4. Suggested order of work

| # | Change | Effort | Who it helps |
|---|---|---|---|
| 1 | Live notice / sitewide banner on interview pages; remove "through 30 September" phrasing | Small | B |
| 2 | Stage 5 docs box + `/public-charge` breadcrumb/back-link; checklist-interview fixes; ACTIVE_MAP; sitemap | Small | A, B, C |
| 3 | `/interview` hub, linked from nav, homepage and live notice | Medium | A, B, C |
| 4 | `/reinterview` page, with visa-pause and September update pointing to it | Medium | C |
| 5 | "Pause" glossary include | Small | B, C |
| 6 | Interview date checker | Medium | A, B, C |
| 7 | Question bank theme filter; statement builder; green-sheet triage; history worksheet; print one-pager | Medium each | A, C |

Items 1–2 are content and config edits with no new pages; they could ship today, before the first rescheduled London interviews in early October.
