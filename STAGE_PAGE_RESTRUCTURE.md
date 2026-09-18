# Stage-page restructure: implementation guide

**Status:** Draft for review — not yet approved for implementation
**Prepared:** 18 September 2026
**Target branch:** `claude/visa-guide-content-review-6d8dfx`
**Audience:** A new Claude Code session with no prior context on this work

---

## 1. BLUF

**Split `/guide` into ten stage pages. `/guide` becomes a table of contents that routes readers to them.**

`public/guide.html` is currently 21,209 words of body content across twelve `<section>` blocks on one URL — roughly a 90-minute read. Readers arrive at a specific point in a 2–3 year process and need one stage, not all twelve. Each stage becomes its own page with its own URL, its own bottom line, and its own attached checklists and worksheets.

**This is a reorganisation, not a rewrite. No content is lost.** Every fact, callout, table, image, community account and link that exists today must exist after the work, on exactly one page, reachable from `/guide`.

**Three things make or break this job:**

1. **Extract the CSS before anything else.** `guide.html` carries 20,408 bytes of inline `<style>` (804 lines) that no other page loads. Ten stage pages cannot each carry a copy.
2. **Anchor redirects must be client-side.** URL fragments are never sent to the server, so `vercel.json` redirects cannot move `/guide#medical` to `/guide/medical`. This needs JavaScript on `/guide`.
3. **The live policy banner must become a shared component.** It appears three times in `guide.html` today and would need to appear on four-plus stage pages. Copy-pasting it into ten files during a live policy crisis will go stale within a week.

---

## 2. Non-negotiable constraints

Read these before starting. They override any judgement call made later.

| # | Constraint | Why |
|---|---|---|
| C1 | **No content deletion.** Every sentence in `guide.html` today lands somewhere after the work. | The owner asked for reorganisation, not editing. Content changes are a separate, later decision. |
| C2 | **De-duplication is by consolidation only.** Where the same fact appears twice, keep one copy at its canonical page and replace the other with a cross-link — never with nothing. | Retains the information while removing the maintenance burden. |
| C3 | **Every existing anchor keeps working.** `#uscis`, `#nvc`, `#medical`, `#waiting`, `#interview`, `#post`, `#entry`, `#crba`, `#delayed`, `#uk-obligations`, `#overview`, `#life`, `#interview-cancellations`, `#public-charge-statement`, `#filing-i130`, `#linking-i130`, `#dq-notice`, `#il-drops-paused`, `#nvc-strategic-hold`, `#id-me-account`, `#doc-check-cancelled`, `#visa-ir`, `#visa-f`. | These are linked from ten other pages in this repo and from Discord posts we cannot edit. |
| C4 | **Do not change facts, figures, dates or sources.** Two known factual defects are logged in §10 — fix those, and only those. **One authorised exception: Phase 2A (in §8).** | Fact changes need the owner's review, not a restructure session's. |
| C5 | **One commit per phase**, with the phase number in the message. Do not squash. | Each phase must be independently reviewable and revertible. |
| C6 | **Do not open a pull request** unless the owner asks. | Standing instruction for this repo. |

---

## 3. Vocabulary

Terms used throughout this document. A new session should adopt them.

- **Stage page** — one of the ten new pages, e.g. `/guide/nvc`. Holds one stage's full content.
- **Guide Hub** — the rebuilt `/guide`. A table of contents plus the Overview content. Referred to throughout as "the Guide Hub".
- **Attached document** — an existing checklist, worksheet or deep-dive page that belongs to a stage, e.g. `/checklist-nvc` belongs to Stage 2.
- **Bottom line** — the 40–80 word block at the top of every stage page answering: where you are, what happens here, what you do now.
- **Canonical home** — the one page that owns a given fact. Everything else links to it.
- **Retention ledger** — the word-count reconciliation in §9 that proves C1 held.

---

## 4. Current state

Measured from `public/guide.html` at 3,433 lines. A new session should re-measure before starting and reconcile against these numbers.

### 4.1 Content distribution

| Section `id` | Stage | Words | Share | H3s |
|---|---|---:|---:|---:|
| `overview` | Overview | 1,049 | 4.9% | 2 |
| `uscis` | 1 · USCIS / I-130 | 1,247 | 5.9% | 0 |
| `delayed` | 1A · Delayed I-130 | 514 | 2.4% | 0 |
| `crba` | 1B · CRBA | 1,054 | 5.0% | 0 |
| `nvc` | 2 · NVC | 3,793 | 17.9% | 2 |
| `waiting` | 3 · Waiting for IL | 5,279 | 24.9% | 11 |
| `medical` | 4 · Medical | 3,217 | 15.2% | 12 |
| `interview` | 5 · Interview | 1,424 | 6.7% | 6 |
| `post` | 6 · After Interview | 1,528 | 7.2% | 8 |
| `uk-obligations` | 7 · Before You Leave | 530 | 2.5% | 1 |
| `entry` | 8 · US Entry | 1,518 | 7.2% | 3 |
| `life` | 9 · Life in the USA | 56 | 0.3% | 0 |
| | **Total** | **21,209** | | **45** |

### 4.2 Technical facts a new session must know

| Fact | Detail | Consequence |
|---|---|---|
| Inline CSS | One `<style>` block, 20,408 bytes, 804 lines. `guide.html` loads only `/css/nav.css` externally. | Must be extracted to `/css/stage.css` in Phase 0. |
| Shared chrome | `/js/nav.js` injects nav and footer into `<div id="nav-placeholder">` and `<div id="footer-placeholder">`. | New pages get nav and footer for free. Include both placeholders. |
| Shared data table | `/js/il-interview.js` fills any `<tbody data-il-interview>`. | Stage 3 keeps working if the placeholder markup is preserved verbatim. |
| Routing | `vercel.json` has `cleanUrls: true`, `trailingSlash: false`, and an explicit `.html` → clean-URL redirect per page. | Each new page needs a redirect entry. Nested paths need directory structure under `public/`. |
| Heading structure | 1 `<h1>`, **0 `<h2>`**, 45 `<h3>`, 4 `<h4>`. Stage titles are `<div class="section-title">`. | Fix as part of the split, not after. |
| Accordions | 25 `.sub-acc-trigger` buttons, **0 with `aria-expanded`**. Bodies use `max-height:0; overflow:hidden`. | Add ARIA state in Phase 6. |
| Inline scripts | 4 blocks, 3,812 bytes — accordion toggles, mobile drawer, back-to-top. | Extract to `/js/stage.js` alongside the CSS. |

---

## 5. Target architecture

### 5.1 Page map

Words are post-split targets. Content moves whole; the figures are the current measurement, not a reduction target.

| # | URL | Source `id` | Words | Attached documents |
|---|---|---|---:|---|
| — | `/guide` — **Guide Hub** | — | ~700 new | All of the below |
| 1 | `/guide/overview` *(or fold into hub — see §5.2)* | `overview` | 1,049 | — |
| 2 | `/guide/i130` | `uscis` | 1,247 | `/checklist-i130`, `I-130_Visual.png`, `I-130_Visual_Decision_Tree.png` |
| 3 | `/guide/delayed-i130` | `delayed` | 514 | `/delayed-i130-remedies` |
| 4 | `/guide/crba` | `crba` | 1,054 | — |
| 5 | `/guide/nvc` | `nvc` | 3,793 | `/checklist-nvc`, `/worksheet-i864`, `/worksheet-ds260`, `/i864-household-decision-tree` |
| 6 | `/guide/waiting` | `waiting` | 5,279 | `/public-charge`, `/221g`, `/data`, `/checklist-binder` |
| 7 | `/guide/medical` | `medical` | 3,217 | `/checklist-medical` |
| 8 | `/guide/interview` | `interview` | 1,424 | `/checklist-interview`, `/interview-questions`, `/221g` |
| 9 | `/guide/after-interview` | `post` | 1,528 | `/221g`, `/visa-pause`, `/data` |
| 10 | `/guide/before-you-leave` | `uk-obligations` | 530 | `/workbook`, `Moving_to_the_USA_Workbook.xlsx` |
| 11 | `/guide/us-entry` | `entry` | 1,518 | `/life` |
| — | `/life` (exists) | `life` stub | — | — |

**Count:** ten stage pages. Overview is not among them — it lives on the Guide Hub (§5.2).

### 5.2 Overview folds into the Guide Hub — decided

**The Overview section does not become its own page.** Its 1,049 words — what the guide covers, what it does not, and the IR vs F visa categories — move into the Guide Hub.

Rationale: a Guide Hub of pure navigation would be ~700 words and rank for nothing. `/guide` is the site's strongest URL and keeping substantive orientation content on it protects that position while still giving the reader the table of contents they came for. The Overview is also genuinely the right content for a landing page — it is what a first-time reader needs before choosing a stage.

Placement within the Guide Hub is set in §7: table of contents first, Overview content below it. A reader who knows their stage should not have to scroll past the taxonomy to reach the links.

### 5.3 Directory layout

```
public/
  guide.html              → the Guide Hub (rebuilt)
  guide/
    i130.html
    delayed-i130.html
    crba.html
    nvc.html
    waiting.html
    medical.html
    interview.html
    after-interview.html
    before-you-leave.html
    us-entry.html
  css/
    stage.css             (new — extracted from guide.html)
  js/
    stage.js              (new — extracted from guide.html)
    live-notice.js        (new — shared policy banner)
```

With `cleanUrls: true`, `public/guide/nvc.html` serves at `/guide/nvc`.

---

## 6. The stage page template

**Every stage page follows this structure in this order.** This is where WfBR and BLUF get applied. A new session must not invent a per-page layout.

```
1. <nav-placeholder>                     shared chrome
2. Breadcrumb                            Guide › Stage 4: Medical
3. <h1>Stage 4: Medical exam</h1>
4. Stage meta strip                      time · cost · deadline · last reviewed
5. BOTTOM LINE block                     40–80 words, see 6.1
6. Live notice (if this stage is affected)
7. Action List                           3–6 imperatives with owner tags
8. Attached documents strip              see 6.3
9. <h2> content sections                 the retained content, unchanged
10. "Before you move on" checklist        3–5 self-verification items
11. Prev / next stage navigation
12. <footer-placeholder>
```

### 6.1 The bottom line block

Answers three questions in 40–80 words, in this order: **where you are · what happens here · what you do now.**

Write it from the retained content — do not invent new facts. Example, built from existing Stage 4 text:

> **Stage 4 — Medical exam.** You have your interview letter and need a medical before you can be interviewed. One clinic covers the whole UK, in London, and the appointment must fall at least 10 working days before your interview. Book the moment the monthly window opens; slots fill fast. Budget £250–£495. **Do this first: call VisaMedicals on 020 7486 7822.**

### 6.2 The stage meta strip

One line under the `<h1>`. Pull the values from the retained content; leave a field out rather than guessing it.

```
⏱ 1 day in London   ·   £250–£495   ·   Must be ≥10 working days before interview   ·   Reviewed 18 Sept 2026
```

### 6.3 The attached documents strip

The owner's requirement that documents sit with their relevant sections. Place it **above** the long-form content, not buried at the bottom — a reader who came for the checklist should not have to scroll 3,000 words.

```html
<aside class="stage-docs" aria-label="Documents for this stage">
  <h2>Documents for this stage</h2>
  <ul>
    <li><a href="/checklist-medical">Medical day checklist</a> — what to bring, hour by hour</li>
    <li><a href="/checklist-binder">Binder checklist</a> — how to organise originals</li>
  </ul>
</aside>
```

Each entry gets a **purpose clause** after the em-dash. A bare link list makes the reader open all of them to find out which one they need.

### 6.4 Heading rules

- One `<h1>` per page: the stage name.
- Former `<div class="section-title">` content becomes the `<h1>`.
- Former `<h3>` headings become `<h2>`.
- Former `<h4>` headings become `<h3>`.
- No level may be skipped.

### 6.5 Role tagging

Where an instruction has an owner, tag it. The guide currently uses "you" 549 times for two different people.

- **[Petitioner]** — the US citizen or LPR who filed
- **[Beneficiary]** — the person applying for the visa
- **[Joint sponsor]**
- **[Either]**

Apply to the Action List and the "Before you move on" checklist at minimum. Applying it to body prose is **out of scope** for this restructure — log it as follow-up.

---

## 7. The Guide Hub

`/guide` after the work. Target ~700 words, plus the Overview content if §5.2 folds it in.

```
1. <h1>American Visa Guide</h1>
2. Subtitle + last-reviewed stamp
3. Live notice (shared component)
4. "Start at your stage" — the existing .stage-pills row, repointed to page URLs
5. THE TABLE OF CONTENTS — see 7.1
6. Overview content (§5.2) — what the guide covers, what it does not, IR vs F categories
7. Cross-cutting pages: 221(g), public charge, visa pause, data, Life in the USA
8. All checklists and worksheets, grouped by stage
```

### 7.1 Table of contents format

Not a bare link list. Each row gives the reader enough to self-route without clicking.

| Stage | What happens | Typical wait | Your documents |
|---|---|---|---|
| **[1 · File the I-130](/guide/i130)** | Prove the relationship to USCIS | 12+ months, currently stalled | [I-130 checklist](/checklist-i130) |
| **[1A · Delayed I-130](/guide/delayed-i130)** | Escalation options after 15 months | — | [Remedies guide](/delayed-i130-remedies) |
| **[1B · CRBA](/guide/crba)** | For a child already a US citizen at birth | ~4 weeks | — |
| **[2 · NVC](/guide/nvc)** | Fees, DS-260, financial and civil documents | ~14 days per review | [NVC checklist](/checklist-nvc), [I-864](/worksheet-i864), [DS-260](/worksheet-ds260) |
| **[3 · Waiting for your interview letter](/guide/waiting)** | The queue, and how to use the wait | 77-day average, currently paused | [Public charge](/public-charge), [221(g)](/221g), [binder](/checklist-binder) |
| **[4 · Medical](/guide/medical)** | One clinic, one day, in London | ≥10 working days pre-interview | [Medical checklist](/checklist-medical) |
| **[5 · Interview](/guide/interview)** | The embassy appointment | 2–5 minutes | [Interview checklist](/checklist-interview), [questions](/interview-questions) |
| **[6 · After the interview](/guide/after-interview)** | Outcomes, passport return, fees | 4–11 days for passport | [221(g)](/221g) |
| **[7 · Before you leave the UK](/guide/before-you-leave)** | HMRC, student loans, NI, ISAs | — | [Workbook](/workbook) |
| **[8 · US entry](/guide/us-entry)** | Port of entry and green card | Card ≤90 days | — |
| **[9 · Life in the USA](/life)** | Banking, tax, settling | — | — |

Fill "typical wait" from existing content only. Leave a cell empty rather than inventing a figure.

---

## 8. Work packages

Eight phases. Each has an objective, inputs, tasks, and acceptance criteria. **Do not start a phase until the previous one's acceptance criteria pass.**

---

### Phase 0 — Baseline and extraction

**Objective:** Make ten stage pages possible without duplicating 20 KB of CSS ten times.

**Tasks**

1. `git checkout claude/visa-guide-content-review-6d8dfx` (create from `main` if absent).
2. Record the baseline retention ledger (§9). Save to `/tmp/.../baseline.json` — not into the repo.
3. Extract the `<style>` block from `guide.html` to `public/css/stage.css`. Replace with `<link rel="stylesheet" href="/css/stage.css?v=YYYYMMDD">`.
4. Extract the four inline `<script>` blocks to `public/js/stage.js` (accordion toggle, accordion group expand/collapse, mobile drawer, back-to-top).
5. Build `public/js/live-notice.js` on the `il-interview.js` pattern: one `NOTICE_HTML` constant, mounted into any `<div data-live-notice>`. Move the three current banner copies into it.
6. Verify `guide.html` is visually and behaviourally unchanged.

**Acceptance criteria**

- [ ] `guide.html` renders identically to before, accordions and drawer working.
- [ ] `guide.html` contains no `<style>` block and no inline `<script>` beyond the extracted references.
- [ ] Body word count unchanged from baseline (±0).

**Commit:** `Phase 0: extract guide CSS, JS and live notice to shared files`

---

### Phase 1 — Build the page shell

**Objective:** A working, empty template that every stage page is cut from.

**Tasks**

1. Create `public/guide/` and `public/guide/_template.html` (delete the template before the final commit — it must not deploy).
2. Template contains: `<head>` with per-page title, meta description, canonical URL and OG tags copied from `guide.html`'s pattern; `nav-placeholder`; breadcrumb; `<h1>`; meta strip; bottom-line block; live-notice mount; Action List; attached documents; content region; "Before you move on"; prev/next; `footer-placeholder`; the three script tags.
3. Add `.stage-docs`, `.stage-bottomline`, `.stage-meta`, `.stage-prevnext`, `.breadcrumb` to `stage.css`. Reuse existing tokens — do not introduce a new palette.
4. Cut **one** page end to end as the pilot: **`/guide/medical`**. It exercises every feature — tables, images, accordions, community accounts, a live notice, an attached checklist.

**Acceptance criteria**

- [ ] `/guide/medical` renders with nav, footer and working accordions.
- [ ] Its word count equals `medical`'s baseline (3,217) ±2%, the delta explained only by new template text.
- [ ] The three new template blocks (bottom line, meta strip, before-you-move-on) contain no fact absent from the source.

**Commit:** `Phase 1: add stage page template and pilot /guide/medical`

**Stop here and request review before Phase 2.** The pilot sets the pattern for ten pages; a correction is cheap now and expensive later.

---

### Phase 2 — Cut the remaining stage pages

**Objective:** All content relocated, nothing lost.

**Tasks** — one page at a time, in this order (simplest first to build confidence, hardest last):

1. `/guide/delayed-i130` (514 w)
2. `/guide/before-you-leave` (530 w)
3. `/guide/crba` (1,054 w)
4. `/guide/i130` (1,247 w)
5. `/guide/interview` (1,424 w)
6. `/guide/us-entry` (1,518 w)
7. `/guide/after-interview` (1,528 w)
8. `/guide/nvc` (3,793 w)
9. `/guide/waiting` (5,279 w)
10. `/guide/overview` — only if §5.2 chose a separate page

**Per-page procedure**

1. Copy the `<section>` body verbatim into the template's content region.
2. Apply the heading promotion in §6.4.
3. Write the bottom line, meta strip and before-you-move-on from content already on the page.
4. Populate the attached documents strip from the §5.1 map.
5. Preserve every `id` attribute exactly (C3).
6. Convert relative links (`life.html`, `221g.html`) to absolute (`/life`, `/221g`) — nested pages break relative paths.
7. Fix image `src` paths: `images/foo.png` → `/images/foo.png`.
8. Run the per-page retention check (§9.2).

**Acceptance criteria per page**

- [ ] Word count within 2% of source, delta explained by template text only.
- [ ] Every source `id`, link, image and table present.
- [ ] No relative link or image path remains.
- [ ] Heading levels contiguous from `<h1>`.

**Commit:** one per page — `Phase 2: cut /guide/nvc from guide.html`

---

### Phase 2A — Interview content refresh (owner-authorised)

**Run immediately after `/guide/interview` is cut in Phase 2. This is the only authorised content addition in the project** — the owner approved it explicitly. Everything in §13 still applies to every other page.

**Background.** The public charge assessment changed in November 2025. Interviews at London that were running 40 seconds to 5 minutes now run far longer, and the questioning is a sustained line of enquiry rather than a box-tick. The repo has already absorbed this in two places but **not** in the guide's interview stage.

**What the audit found**

| Asset | State | Action |
|---|---|---|
| `/js/interview-questions.js` | **Already current and complete.** 53 questions across 10 themes, 9 of them `publiccharge`. Already covers union, mortgage, remote-work permission, savings balance, property proof, cash side-income, business-failure contingency, below-threshold income year, previous employer, institutionalisation, and the medication-cost question. Header note already cites 30–40 minute interviews. Exposes `window.AVG_INTERVIEW_QB = { CATEGORIES, THEMES, QUESTIONS }`. | **No change. Do not add or edit questions.** |
| `public-charge.html` §"Inside a 35-minute public charge interview at London" | Full account present, 35–40 minutes, reproduced with permission. It is the source of the nine `publiccharge` questions, attributed to `Esther`. | **Do not alter. The 35–40 minute duration is correct and stands.** |
| `guide.html` Stage 5 | **Out of date.** Hardcodes 10 questions in two `<ul>` lists vs 53 in the bank. Says "typically 2–5 minutes" and "interview 1–10 minutes". Contains **zero** links to `/interview-questions`. All six community accounts pre-date the change. | Tasks 1–3 |

**Tasks**

1. **Change the interview duration figure to 20–35 minutes.** *(Owner-directed, 18 Sept 2026. This supersedes the earlier "add, do not replace" instruction for this figure specifically — it is a directed factual change under the C4 exception.)*

   The reason clause must be included, because the figure is only credible with it. Use the site's own term: **public charge worksheet**, not "checklist" — `public-charge.html` and `september-2026-update.html` use "worksheet" for the document deployed to consular officers, and "written questionnaire" for what applicants receive. Keep them distinct.

   **Change these two, and only these two:**

   | File | Line | Current | Change to |
   |---|---|---|---|
   | `guide.html` → `/guide/interview` | 2816 | "Take oath. Answer brief questions, **typically 2–5 minutes**. Receive decision." | "Take oath. Answer questions. **Expect 20–35 minutes**: since the public charge worksheet was deployed to consular officers, the financial questioning is a sustained line of enquiry rather than a box-tick. Receive decision." |
   | `checklist-interview.html` | 210 | "Interview itself: **2–5 minutes**" | "Interview itself: **20–35 minutes**" |

   **Do not change these:**

   - `checklist-interview.html` line 208, "**Document handover**: 2–5 minutes" — a different step. The document window really is that quick. Changing it would be a straightforward error.
   - The six individual community account durations in Stage 5 (40 seconds, ~2 minutes, ~5 minutes and so on). These are attributed reports of real interviews that happened. They are historical record, not guidance, and rewriting them would misrepresent the members who submitted them.
   - The `Common pattern across all cases` line at `guide.html:2875` (*"interview 1–10 minutes"*). It summarises the six accounts directly beneath it, so changing it to 20–35 would make it false about the very accounts it describes. **Date-qualify instead:** append *"All six accounts above pre-date the public charge worksheet. Expect substantially longer now — see the timing note in Interview structure."*

   **The total-time figures change too.** *(Owner-directed, 18 Sept 2026 — resolves L8.)* Both totals were built on a 2–5 minute interview and no longer hold.

   | File | Line | Current | Change to |
   |---|---|---|---|
   | `guide.html` → `/guide/interview` | 2816 | "Total time in embassy: **approximately 90–120 minutes**" | "Total time in embassy: **1.5–4.5 hours**" |
   | `checklist-interview.html` | 204 | "Total time in embassy: **1–3 hours**" | "Total time in embassy: **1.5–4.5 hours**" |

   Carry the prior range as context rather than dropping it — it is what the six accounts on the page actually show, and stating both makes the change legible instead of looking like a correction. Wording to the effect of: *"1.5–4.5 hours. Before the public charge worksheet, community members reported 30 minutes to 2 hours; the longer financial questioning has moved both ends of that."*

   This reconciles: the accounts record ~30 minutes (Queen B), ~45 minutes (Walsh), ~1.5 hours (HT3) and ~2 hours (Neri) — a 30-minute-to-2-hour spread, exactly the prior range.

   **One more account total not to touch.** `checklist-interview.html:175` reads *"Total time in building: 30 minutes"* — that is Queen B's attributed account, the same historical-record rule as the Stage 5 accounts. Only the two guidance figures in the table above change.

2. **Add the 35–40 minute account to the Stage 5 community experiences.** Every account currently on that page is pre-change, which leaves the reader with a false picture. Summarise the `public-charge.html` account (member `Esther`) in the same house format as the others — check-in, process, outcome — state the 35–40 minute duration, and link to the full write-up. Note the relationship to task 1: **20–35 minutes is the guidance figure** (what a reader should plan for), **35–40 minutes is one reported case** (what actually happened to Esther). Both are correct and they do not contradict each other — an account may sit above the guidance range. Do not round either to match the other. **Do not duplicate the full account**; `public-charge.html` stays its canonical home (C2).

3. **Render the complete question bank on `/guide/interview` — all 53 questions, from the shared source.**

   The owner's instruction: now that content is separating out, the interview stage carries the whole bank, not a 10-question excerpt.

   **Do not hardcode the questions into the page.** `/js/interview-questions.js` is the declared single source of truth and already publishes `window.AVG_INTERVIEW_QB`. Copying 53 questions into a second file is precisely the failure mode that produced the L2 date mismatch. Instead:

   - Delete the two hardcoded `<ul>` lists under `Common interview questions` (their 10 questions all exist in the bank — verify each before deleting, per C1).
   - Add a mount point and render from the shared object, following the `il-interview.js` precedent:
     ```html
     <div data-question-bank></div>
     <script src="/js/interview-questions.js?v=YYYYMMDD"></script>
     <script src="/js/question-bank-render.js?v=YYYYMMDD"></script>
     ```
   - Write `/js/question-bank-render.js` to fill any `<div data-question-bank>` with all 53 questions grouped under the 10 `THEMES` labels in their declared order, showing `q`, and `tip` where present. Keep it a static render — the category filter and flashcard mode stay on `/interview-questions`.
   - Theme counts to expect: relationship 9 · wedding 3 · petitioner 6 · living 2 · work 8 · finances 4 · publiccharge 9 · medical 5 · family 4 · logistics 3.
   - Lead the section with a line to the effect of: *"All 53 questions reported by community members at London, grouped by topic. To rehearse them as flashcards or filter by visa category, use the interview question bank."* — linking to `/interview-questions`.
   - Also add `/interview-questions` to the attached documents strip (§6.3) with a purpose clause.

**Acceptance criteria**

- [ ] Exactly four figures changed: two interview durations and two embassy totals (task 1's two tables). Every other duration in the repo is unchanged or date-qualified
- [ ] Both totals read 1.5–4.5 hours and carry the prior 30-minutes-to-2-hours range as context
- [ ] `checklist-interview.html:175` (Queen B, "Total time in building: 30 minutes") unchanged
- [ ] `public-charge.html` unmodified
- [ ] `/js/interview-questions.js` unmodified — question count stays 53
- [ ] `/guide/interview` renders all 53 questions under all 10 theme headings
- [ ] Questions are rendered from `window.AVG_INTERVIEW_QB`, not hardcoded — grep the page for a question string and find zero matches
- [ ] Each of the 10 previously hardcoded questions verified present in the bank before its `<ul>` was deleted
- [ ] `/guide/interview` links to `/interview-questions` in both the documents strip and the questions section
- [ ] Stage 5 community accounts include one post-November-2025 case
- [ ] `/interview-questions` still renders correctly — its bank view and flashcard mode are untouched
- [ ] `/guide/interview` meta strip (§6.2) carries the 20–35 minute figure, not 2–5
- [ ] `checklist-interview.html` line 208 (document handover) still reads 2–5 minutes
- [ ] The six community account durations are unchanged

**Commit:** `Phase 2A: bring interview stage up to date with post-2025 public charge questioning`


---

### Phase 3 — Rebuild the Guide Hub

**Objective:** `/guide` becomes the table of contents.

**Tasks**

1. Replace `guide.html`'s body with the §7 structure.
2. Build the §7.1 table. Every stage links to its page; every attached document links from the right row.
3. Repoint `.stage-pills` and the sidebar/drawer lists to page URLs.
4. Fold in the Overview content from the `overview` section (§5.2) — all 1,049 words, placed below the table of contents.
5. Mount the shared live notice.
6. Add the anchor-redirect script (§8, Phase 4) — it lives on the Guide Hub.

**Acceptance criteria**

- [ ] Hub contains no stage content beyond Overview (if folded in).
- [ ] All eleven table-of-contents rows present (ten stage pages + `/life`), each linking to a page that exists.
- [ ] Every attached document in §5.1 appears in at least one row.

**Commit:** `Phase 3: rebuild /guide as the Guide Hub`

---

### Phase 4 — Routing, redirects and anchors

**Objective:** Nothing that worked before 404s or dead-ends.

**Critical technical note: URL fragments are never sent to the server.** A `vercel.json` redirect cannot see `#medical` and therefore cannot route `/guide#medical` to `/guide/medical`. This **must** be JavaScript on the Guide Hub.

**Tasks**

1. Add `vercel.json` redirect entries for each new page's `.html` form, matching the existing pattern:
   ```json
   { "source": "/guide/nvc.html", "destination": "/guide/nvc", "permanent": true }
   ```
2. Add the anchor-redirect script to the Guide Hub:
   ```js
   // /guide#medical → /guide/medical. Fragments never reach the server,
   // so legacy deep links are rerouted client-side.
   (function () {
     'use strict';
     var MAP = {
       uscis: '/guide/i130',            i130: '/guide/i130',
       'filing-i130': '/guide/i130',    'linking-i130': '/guide/i130',
       delayed: '/guide/delayed-i130',  crba: '/guide/crba',
       nvc: '/guide/nvc',               'dq-notice': '/guide/nvc',
       'nvc-strategic-hold': '/guide/nvc',
       waiting: '/guide/waiting',       'il-drops-paused': '/guide/waiting',
       'public-charge-statement': '/guide/waiting',
       'id-me-account': '/guide/waiting',
       medical: '/guide/medical',       'doc-check-cancelled': '/guide/medical',
       interview: '/guide/interview',
       post: '/guide/after-interview',  'after-interview': '/guide/after-interview',
       'uk-obligations': '/guide/before-you-leave',
       entry: '/guide/us-entry',        life: '/life'
       // overview, visa-ir, visa-f, interview-cancellations stay on the Guide Hub
     };
     var target = MAP[location.hash.slice(1)];
     if (target) location.replace(target);
   })();
   ```
3. Update the ten in-repo pages that link to guide anchors: `221g.html`, `checklist-binder.html`, `checklist-i130.html`, `checklist-interview.html`, `checklist-medical.html`, `checklist-nvc.html`, `data.html`, `index.html`, `september-2026-update.html`, `visa-pause.html`. Point them at stage URLs directly rather than relying on the client-side hop.
4. Add all new pages to `public/sitemap.xml`.
5. Set each page's `<link rel="canonical">` to its own URL.

**Acceptance criteria**

- [ ] Every anchor in C3 resolves to live content.
- [ ] No in-repo link points at a `/guide#…` fragment that the map does not cover.
- [ ] `sitemap.xml` lists all new pages; no entry 404s.
- [ ] Two pre-existing broken anchors fixed (§10).

**Commit:** `Phase 4: add redirects, anchor mapping and sitemap entries`

---

### Phase 5 — Cross-linking and continuity

**Objective:** A reader can walk the process start to finish without returning to the Guide Hub.

**Tasks**

1. Prev/next on every stage page, in the §5.1 order.
2. Back-to-hub link in every breadcrumb.
3. Each attached document page gets a "Part of Stage N" link back to its stage page: `/checklist-nvc` → `/guide/nvc`, and so on for every checklist and worksheet in the repo.
4. Where content was split across stages and cross-references it (public charge in Stages 3 and 5; 221(g) in Stages 2, 3, 5 and 6; the transcript rule in Stages 2 and 3), verify each reference now names the destination page explicitly rather than saying "see below" or "see above".

**Acceptance criteria**

- [ ] Every stage page has working prev/next.
- [ ] No page contains "see below", "see above" or "in the section below" pointing at content now on a different page.
- [ ] Every checklist and worksheet links back to its stage.

**Commit:** `Phase 5: add prev/next navigation and stage cross-links`

---

### Phase 6 — Accessibility and structure fixes

**Objective:** Fix the defects the restructure exposes. Scope is limited to these five items.

**Tasks**

1. `aria-expanded` on all accordion triggers, toggled in `stage.js`.
2. `aria-controls` linking each trigger to its body; give each body an `id`.
3. Verify heading levels are contiguous on all ten stage pages and the Guide Hub.
4. Each page's `<title>` follows `Stage N: Name | American Visa Guide`; unique meta description per page.
5. Keyboard test: tab to each accordion, activate with Enter and Space.

**Acceptance criteria**

- [ ] 0 accordion triggers without `aria-expanded`.
- [ ] 0 heading-level skips across all pages.
- [ ] All pages have unique title and meta description.

**Commit:** `Phase 6: add accordion ARIA state and fix heading levels`

---

### Phase 7 — Verification

**Objective:** Prove C1 held and nothing is broken. **Do not commit until every check passes.**

**Tasks**

1. Run the full retention ledger (§9) and record the result in the commit message.
2. Link check: every internal `href` resolves to a file that exists.
3. Image check: every `src` resolves.
4. Render every page locally and confirm nav, footer, accordions, tables and images.
5. Confirm `_template.html` is deleted.
6. Confirm no secrets, API keys or `.env` values were introduced.

**Acceptance criteria**

- [ ] Retention ledger: total body words across all stage pages + hub ≥ 21,209 minus tolerance, with every shortfall itemised and explained.
- [ ] 0 broken internal links.
- [ ] 0 broken image paths.
- [ ] `public/guide/_template.html` absent.

**Commit:** `Phase 7: verification pass — retention ledger and link check`

---

## 9. Retention ledger

The mechanism that proves C1. **Run at Phase 0 for the baseline and at Phase 7 for the result.**

### 9.1 Baseline

Extract per-section body text from `guide.html` and record: word count, list of `id` attributes, list of `href` values, list of `src` values, count of `<table>` and `<h3>`.

### 9.2 Per-page check (Phase 2)

For each stage page, compare against its source section:

| Metric | Rule |
|---|---|
| Body words | ≥ source, or shortfall itemised sentence by sentence |
| `id` attributes | All source ids present |
| Internal links | All present, paths updated to absolute |
| External links | All present, unchanged |
| Images | All present, paths absolute |
| Tables | Count matches |

### 9.3 Final reconciliation (Phase 7)

```
sum(stage page body words) + Guide Hub body words
  ≥ 21,209 + (template text added × 10 pages)
```

Any negative delta must be itemised: which sentence, which page, why. **An unexplained shortfall fails the phase.** Template additions (bottom lines, meta strips, checklists) legitimately push the total *above* baseline — that is expected and fine.

---

## 10. Known defects to fix during the work

Only these. Everything else stays as written (C4).

| # | Defect | Location | Fix |
|---|---|---|---|
| D1 | Broken anchor `#i130` — no such id | Inbound link from another page | Repoint to `/guide/i130` |
| D2 | Broken anchor `#after-interview` — no such id | Inbound link from another page | Repoint to `/guide/after-interview` |

### Logged, not fixed — raise with the owner

These were found during review. They are **out of scope** for the restructure and must not be changed without the owner's decision.

| # | Issue |
|---|---|
| L1 | The IL section says the interview letter arrives from `National_Visa_Center@state.gov` (twice), but the reproduced email shows `LNDIVSubmissions@state.gov`. Readers are told to configure safe-senders from this. |
| L2 | `checklist-medical.html` carries community accounts for Nikki and Aqua with different dates than `guide.html` (Nikki: July 2026 vs 24 June 2026; Aqua: June 2026 vs February 2026). |
| L3 | Public charge content is substantially duplicated between Stage 3 and `/public-charge`. Consolidation is a content decision, not a restructure one. |
| L4 | SSN guidance appears in both Stage 6 and Stage 8; the USCIS Immigrant Fee appears in both. After the split these sit on different pages — cross-link them rather than merging. |
| L5 | 100 instances of a colon used mid-sentence as a comma or dash substitute, including two ungrammatical subject-verb splits. A copy-edit pass, separate from this work. |
| L6 | The CR1 and IR1 "Evidence at filing" paragraphs are byte-identical (70 words). |
| ~~L7~~ | *Resolved by Phase 2A task 3 — the owner directed that the interview stage carry the full bank.* |
| ~~L8~~ | *Resolved by Phase 2A task 1 — the owner set both totals to 1.5–4.5 hours, with the prior 30-minutes-to-2-hours range retained as context.* |
| L9 | `interview-questions.html:110` still says "Most London interviews run 2–10 minutes", which now contradicts the 20–35 minute guidance figure. Outside Phase 2A's two-file scope, so unchanged. *(Found in Phase 2A.)* |
| ~~L10~~ | *Resolved 18 Sept 2026 (owner): the Stage 5 lead line now reads "The pattern is consistent: long wait, professional officers." Esther's account is also now marked approved, so "All reported outcomes below are approvals" still holds.* |
| ~~L11~~ | *Resolved 18 Sept 2026 (owner): the four questions were added to `/js/interview-questions.js` as new "Multiple reports" entries (existing attributed questions left as they were), taking the bank to 57, and the interim list on `/guide/interview` was removed.* |
| ~~L12~~ | *Resolved 18 Sept 2026 (owner): the four checklist links now point to `/master-checklist`.* |
| ~~L13~~ | *Resolved 18 Sept 2026 (owner): the Overview's "data page" link now points to `/data` (data.html).* |

---

## 11. Risk register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Content lost during the cut | Medium | High | Retention ledger at every phase; one commit per page so a loss is bisectable |
| R2 | Live policy banner goes stale across ten pages | **High** | High | Shared `live-notice.js` in Phase 0 — do not copy-paste the banner |
| R3 | Deep links from Discord break | Medium | High | Client-side anchor map (Phase 4); C3 preserves every id |
| R4 | Search position of `/guide` drops as content moves | Medium | Medium | Fold Overview into the Guide Hub (§5.2); per-page canonicals; sitemap updated same day |
| R5 | Relative links break on nested paths | **High** | Medium | Phase 2 step 6 converts all to absolute; Phase 7 link check |
| R6 | CSS duplicated across ten pages | High if Phase 0 skipped | Medium | Phase 0 is a blocking prerequisite |
| R7 | Session runs out of context mid-restructure | Medium | Medium | One page per commit; this document plus `git log` restores position |
| R8 | Scope creep into copy-editing | **High** | Medium | C1 and C4; the §10 logged list is where edits go to wait |

---

## 12. Definition of done

- [ ] Ten stage pages live, each following the §6 template
- [ ] Phase 2A complete: interview stage date-qualified, post-2025 account added, all 53 questions rendered from the shared bank
- [ ] `/guide` is a table of contents, no stage content beyond Overview
- [ ] Every checklist and worksheet attached to its stage, with a purpose clause, above the fold
- [ ] Retention ledger reconciles; every shortfall itemised
- [ ] Every C3 anchor resolves
- [ ] All in-repo inbound links repointed
- [ ] `sitemap.xml` and `vercel.json` updated
- [ ] 0 broken internal links, 0 broken images, 0 heading skips, 0 accordions without `aria-expanded`
- [ ] Prev/next on every stage page; every attachment links back to its stage
- [ ] `_template.html` deleted
- [ ] Pushed to `claude/visa-guide-content-review-6d8dfx`
- [ ] No pull request opened unless requested

---

## 13. Out of scope

Do not do these. Each is a separate decision for the owner. **Phase 2A (in §8) is the one authorised exception** — it is scoped, owner-approved, and limited to the interview stage. It adds no questions; it renders the existing bank in full.

- Rewriting sentences, fixing the colon usage, or shortening paragraphs (L5)
- Merging or deleting duplicated content (L3, L4, L6)
- Changing facts, figures, dates, prices or sources
- Fixing the sender-address contradiction (L1) or the community-account date mismatch (L2)
- Adding new content, new sources, or new community accounts **anywhere except Phase 2A**
- Redesigning visual styling beyond the new layout classes in §6
- Changing `/data`, `/221g`, `/public-charge`, `/life` or any checklist beyond adding the stage backlink in Phase 5
- Opening a pull request
