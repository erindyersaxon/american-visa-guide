# Kickoff prompt — stage-page restructure

**Paste everything below the line into a new session.** Attach or point it at `STAGE_PAGE_RESTRUCTURE.md`, which is the full specification. This file is just the opening instruction; the spec is the work.

---

You are picking up an approved, fully specified restructure of `americanvisaguide.com`. Read `STAGE_PAGE_RESTRUCTURE.md` in the repository root **before doing anything else** — it is the specification, it was reviewed and approved by the site owner on 18 September 2026, and it supersedes any judgement you would otherwise make about scope or approach.

## The job in one line

Split `public/guide.html` — 21,209 words on one URL — into ten stage pages under `/guide/`, and rebuild `/guide` as the **Guide Hub**: a table of contents plus the Overview content.

## Before you touch anything

1. Read `STAGE_PAGE_RESTRUCTURE.md` end to end. It is ~6,000 words. Do not skim it.
2. Confirm you are on branch `claude/visa-guide-content-review-6d8dfx`. Create it from `main` if it does not exist. **Never push to another branch.**
3. Run the Phase 0 baseline measurement (§9.1) before editing a single file. You cannot prove content retention without it.

## The five things that will trip you up

These are drawn from an audit of the live code. Each has cost someone time already.

1. **Extract the CSS first.** `guide.html` carries 20,408 bytes of inline `<style>` (804 lines) that no other page loads. Ten stage pages cannot each carry a copy. This is Phase 0 and it blocks everything else.
2. **Anchor redirects must be client-side.** URL fragments are never sent to the server, so no `vercel.json` redirect can move `/guide#medical` to `/guide/medical`. The spec has the full JavaScript map in Phase 4. Do not try to do it in config.
3. **The live policy banner must become a shared component.** It appears three times in `guide.html` today and would need to be on four-plus stage pages. Copy-pasting it will go stale within a week — the site is covering an active policy crisis. Follow the `il-interview.js` pattern already in the repo.
4. **Never hardcode the interview question bank.** `/js/interview-questions.js` is the declared single source of truth and already exposes `window.AVG_INTERVIEW_QB`. Render from it. Copying its 53 questions into a page is exactly the failure that produced the L2 date mismatch already logged in the spec.
5. **Convert every relative link and image path to absolute.** Pages move from `/guide` to `/guide/<stage>`, so `life.html` and `images/foo.png` break. This is a per-page task in Phase 2, step 6.

## Hard constraints

Full list in §2 of the spec. The ones that matter most:

- **No content deletion.** Every sentence in `guide.html` today lands somewhere afterwards. De-duplication is by consolidation plus cross-link, never by removal.
- **No fact, figure, date or source changes** — except the four figures explicitly directed in Phase 2A, which the owner approved.
- **Every existing anchor keeps working.** Twenty-three ids are listed in constraint C3. Ten other pages in this repo link to them, and so do community posts we cannot edit.
- **One commit per phase**, phase number in the message. Do not squash.
- **Do not open a pull request** unless the owner asks.

## Decisions the owner has already made — do not revisit

| Decision | Detail |
|---|---|
| Overview | Folds into the Guide Hub. It does not become its own page. |
| Naming | The rebuilt `/guide` is the **Guide Hub**. The per-stage imperative block is the **Action List**. |
| Interview questions | `/guide/interview` carries **all 53** questions, rendered from the shared bank. Not an excerpt. |
| Interview duration | Changes to **20–35 minutes**, in two files. Reason clause required: the public charge worksheet. |
| Embassy total time | Changes to **1.5–4.5 hours**, in two files, retaining the prior 30-minutes-to-2-hours range as context. |
| Esther's account | The 35–40 minute figure in `public-charge.html` **stands unchanged**. It is one reported case; 20–35 minutes is the guidance figure. Both are correct. |

## Where to start and where to stop

Work the phases in order. **Phase 1 ends at a review gate** — it cuts `/guide/medical` alone as a pilot, then stops for the owner to approve the template before the other nine are cut. Do not blow through that gate; correcting a template after ten pages exist costs ten times as much.

Phases: 0 (extract) → 1 (template + pilot, **STOP**) → 2 (cut nine pages) → 2A (interview refresh) → 3 (Guide Hub) → 4 (routing) → 5 (cross-links) → 6 (accessibility) → 7 (verification).

## How you know you are done

§12 of the spec is the definition of done. The single most important line: the retention ledger must reconcile, and **any word-count shortfall must be itemised sentence by sentence or the phase fails.** An unexplained shortfall means content was lost, which is the one outcome this whole specification exists to prevent.

## What is not yours to do

§13 lists it. In short: no copy-editing, no merging duplicated content, no fixing the known factual defects logged as L1–L6, no redesigning beyond the layout classes in §6. Those are the owner's decisions and several are already queued. If you find something new, add it to the logged list in §10 — do not act on it.
