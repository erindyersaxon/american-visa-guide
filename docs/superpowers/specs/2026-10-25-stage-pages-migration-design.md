# Stage pages onto guide-article components: design

Date: 25 Oct 2026
Status: approved in brainstorming, awaiting spec review
Scope: piece 3 of 4 (see `2026-10-24-guide-article-components-design.md` §1)

## 1. Purpose

Move the 11 guide stage pages and the `/guide` hub onto the shared
`guide-article.css` components:
- the pages take on the new component look
- their inline `style=""` attributes go
- the old stage-only component rules are deleted

Afterwards these 12 pages and the standalone articles (piece 4) share one
visual vocabulary.

**Pages (12):** `public/guide.html` and `public/guide/{after-interview,
before-you-leave, crba, delayed-i130, i130, interview-letter, interview,
medical, nvc, us-entry, waiting}.html`.

**Today:**
- 487 inline styles across the 11 stage pages, plus 44 on the hub.
- Components: `.info-card` (plain, `.warning`, `.tip`), `.stage-h1`,
  `.stage-meta`, `.stage-bottomline`, `.stage-actions` and a stage-only
  `.checklist`, all in `css/stage.css`.

**Not in scope:**
- wording changes
- new content
- anchor ID changes
- sidebar, accordion or hub-grid layout
- the standalone article pages (piece 4)

## 2. Decisions taken

| Question | Decision |
|---|---|
| Look | The pages take on the new component look; this is not a pixel-for-pixel cleanup |
| Hub | Included, so the old `stage.css` component rules can be deleted in this piece |
| Approach | A: a one-off script for the mechanical rewrites, a hand pass for judgement calls, and a permanent test guard |
| Warning severity | `.callout-alert` only where the title or first sentence names a refusal, a 221(g), a cancelled case or a lost fee or green card; otherwise `.callout-warn`. Appendix A is the full list |

## 3. Class mapping

Every page's `<main>` gets `guide-article` added to its existing classes, so
`class="main"` becomes `class="main guide-article"`.

| Today | Becomes |
|---|---|
| `h1.stage-h1` plus the following `p.stage-meta` and `div.stage-bottomline` | `<header class="article-header">` wrapping the `h1` (class removed), `p.article-meta` and `div.article-summary` |
| `p.stage-meta` "Reviewed 27 Sept 2026" span | `<span>Reviewed <time datetime="2026-09-27">27 Sept 2026</time></span>` |
| `div.stage-bottomline` | `div.article-summary`, keeping its paragraphs and order (its first paragraph is already "You are here: …") |
| `section.stage-actions` | `section.stage-actions` stays as the labelled section wrapper (keeps `id="action-list-title"`); its `<ol>` gets `class="article-actions"`; the `stage-actions` class becomes `article-actions-section` |
| `.info-card` | `.callout.callout-info` |
| `.info-card.tip` | `.callout.callout-good` |
| `.info-card.warning` | `.callout.callout-warn` or `.callout.callout-alert` (Appendix A) |
| `.info-card-head` | `.callout-title` |
| `ul.checklist` | unchanged (the shared rule applies under `.guide-article`) |

**Repeated inline patterns become classes in `guide-article.css`, all scoped:**

| Inline pattern (count) | Class | Notes |
|---|---|---|
| Member story wrapper `display:flex;flex-direction:column;gap:12px` | `.voices` | |
| Story card `background:var(--card-bg);border-left:3px solid var(--accent);…` (12) | `.voice` | Same names as `article.css`, for piece 4 |
| Story name line `font-size:14px;font-weight:600;color:var(--accent-light)` (12) | `.voice-who` | |
| Story text `font-size:16px` | `.voice-what` | |
| "Had your …? Add it to the tracker" banner (7) | `.article-prompt` | The empty icon `<span>` inside it is removed |
| Button-styled links (5) | `.article-cta` | |
| `color:var(--text-secondary)` and the other muted variants | `.text-muted` | |
| `color:var(--text-primary)` | (removed) | Already the default |
| Table cell padding and border styles | `.guide-article table th`, `.guide-article table td` rules | |
| Figure image `width:100%;height:auto;border…` | `.guide-article figure img` | |
| Back-to-top button (12) | `.back-top` in `stage.css` | Page chrome; `id="back-top"` stays for `stage.js` |

**Spacing-only inline styles** (`margin:0`, `margin-bottom:Npx`, `margin-top:Npx`,
`margin:16px 0`, about 200) are deleted. The shared rules already space
callout, summary and list paragraphs; any spot that then looks wrong is fixed
with a shared rule, not by putting the inline style back.

**Anything else** that is genuinely page-specific stays inline only if listed
in the allowlist (§5). The target is fewer than 10 entries across all 12 pages.

## 4. CSS changes

`public/css/guide-article.css` adds:
- the classes in §3, all under `.guide-article`, colours from the `--ga-*`
  tokens, no shadows, gradients or uppercase
- `@media print`: `.guide-article .callout`, `.voice`, `.stat-box` get
  `page-break-inside: avoid`, a 1pt solid #999 border and no background;
  `.article-prompt` and `.article-cta` are hidden

`public/css/stage.css`:
- adds `.back-top`
- deletes `.info-card*`, `.stage-h1`, `.stage-meta*`, `.stage-bottomline*`,
  `.stage-actions*` and its `.checklist*` rules once no page uses them
- keeps sidebar, section, accordion and hub layout

**Asset loading:** every one of the 12 pages loads
`/css/guide-article.css?v=20261025b` directly before `readability.css`.
`stage.css` is bumped to `?v=20261025b` on all 12.

## 5. Safety

**Anchor IDs are frozen.**
- Before any page changes, a snapshot of each page's IDs, in document order,
  is saved to `test/fixtures/stage-ids.json`.
- The migration script never edits `id` attributes.

**Visible text is unchanged.** A one-off check, run as a plan step and not a
permanent test, compares each page's text before and after migration. The text
is extracted with tags removed, entities decoded and whitespace collapsed. Any
difference stops work on that page. Expected differences:
- the removed empty icon spans
- the `<time>` wrapper, which carries the same text

**Permanent guard:** `test/stage-pages.test.js`, in `npm test`. For each of
the 12 pages:
1. No `style=` attributes except exact `{page, attribute}` entries in
   `test/fixtures/stage-inline-allowlist.json`.
2. None of these class tokens: `info-card`, `info-card-head`, `stage-h1`,
   `stage-meta`, `stage-bottomline`, `stage-actions`.
3. `<main` carries the class `guide-article`.
4. `guide-article.css` is linked before `readability.css`.
5. The ID list equals the snapshot.

**Behaviour kept:**
- accordions (`.sub-acc-*`)
- the sidebar active link
- back-to-top (`#back-top`)
- glossary (`[data-glossary]`)
- the live notice (`[data-live-notice]`)
- the stepper and stat boxes

None of these depend on the removed classes. This was checked in
`public/js/*.js`: the only other users of `info-card` are `naturalization.js`
and `print.css`, neither of which loads on these pages.

## 6. Rollout within the branch

1. CSS additions in `guide-article.css` (§4).
2. The ID snapshot and the test guard, which fails on today's pages.
3. The migration script over all 12 pages (renames, spacing removal,
   repeated patterns). Run the text check.
4. A hand pass, one commit per page: callout severity from Appendix A,
   leftover inline styles, then the text check again.
5. Delete the dead `stage.css` rules, bump `?v=`, and get the guard green.

## 7. Verification

- `npm test`: the guard passes on all 12 pages, and the existing 22 tests pass.
- Browser, on the preview server:
  - All 12 pages at 1280px and 375px: no horizontal overflow; callouts, story
    cards, prompt banner and CTA links render; nothing is unstyled.
  - Accordions open, the sidebar link updates on scroll, back-to-top works, and
    deep links such as `/guide/nvc#nvc-bar` land below the sticky stack.
  - Print preview of `/guide/nvc`: callouts don't split across pages and the
    prompt banner is hidden.
- PR description: before and after screenshots at 1280px for `/guide/nvc`,
  `/guide/interview` and `/guide`.

## Appendix A: warning cards (31)

**Rule.** `alert` when the title or first sentence names a refusal, a 221(g),
a cancelled or closed case, or a lost fee or green card. Otherwise `warn`.
"Borderline" marks cards whose later text warns of a 221(g). They stay `warn`
under the rule, but you may promote them.

| # | Page | Title | Class | Reason |
|---|---|---|---|---|
| 1 | after-interview | 221(g): refused until you send more | **alert** | Title names a 221(g) refusal |
| 2 | after-interview | Denied | **alert** | Title names a refusal |
| 3 | after-interview | Pay this fee as soon as possible | **alert** | First sentence: no fee means no physical green card |
| 4 | before-you-leave | ISAs: act before you leave | warn | Tax cost, not visa outcome |
| 5 | before-you-leave | File a P85 with HMRC | warn | |
| 6 | before-you-leave | Update your student loan details | warn | |
| 7 | crba | Evidence that works, and evidence that doesn't | warn | |
| 8 | crba | Do not forget | warn | |
| 9 | delayed-i130 | Why this stage now applies to almost every consular case | warn | |
| 10 | delayed-i130 | What escalation can and cannot do | warn | |
| 11 | i130 (`#i130-status`) | Current status: the queue has stopped… | warn | |
| 12 | i130 | Transgender and non-binary applicants | warn | |
| 13 | i130 | Read this before you use it | warn | |
| 14 | i130 | USCIS can require any petitioner or beneficiary to attend an interview | warn | |
| 15 | interview | Public charge: what has changed | warn | |
| 16 | interview | The outside queue: what to expect | warn | |
| 17 | interview (`#passport-sticker`) | Read the sticker on the back of your passport | warn | |
| 18 | interview (`#no-document-check`) | No document check? Bring every original | warn | "Canceled" refers to document checks, not cases |
| 19 | interview | Upload financial evidence first, and bring paper copies | warn | Borderline: later text warns of a 221(g) |
| 20 | medical | Vaccine waivers | warn | |
| 21 | medical | Transgender and non-binary applicants: document consistency | warn | |
| 22 | nvc (`#nvc-bar`) | NVC's bar is lower than London's. Meet London's. | warn | Borderline: later text cites a 221(g) refusal |
| 23 | nvc | 12-month inactivity rule | **alert** | First sentence: NVC closes the case |
| 24 | nvc | Relying on assets is risky at London | warn | Borderline: later text warns of a 221(g) |
| 25 | nvc | IRS tax transcript: treat it as required for London | warn | Borderline: later text warns of a 221(g) |
| 26 | nvc | Citizen of another country? Act early | warn | |
| 27 | nvc | What DQ does not mean | warn | |
| 28 | nvc | Expect this wording to change | warn | |
| 29 | nvc | Family members with different DQ dates: act now | warn | |
| 30 | us-entry | Keep your address up to date | warn | |
| 31 | us-entry | Carry proof of your status | warn | |

Result: 4 `alert`, 27 `warn` (4 of them borderline).
