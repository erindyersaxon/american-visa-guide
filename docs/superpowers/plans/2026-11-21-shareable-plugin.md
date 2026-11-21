# Shareable American Visa Guide Plugin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A read-only Claude plugin, shipped as a zip, that lets London applicants check their circumstances against policy and against The Guide's community experience.

**Architecture:** Two skills (`case-check`, `naturalization`) plus reference files, all plain Markdown. Live data comes from the public site at answer time (Guide pages via web fetch, timelines from `https://www.americanvisaguide.com/api/data`). A `node:test` suite checks content rules offline and Guide URLs online; a build script produces the zip.

**Tech Stack:** Claude Code plugin format (`.claude-plugin/plugin.json`, `skills/*/SKILL.md`), Node 20+ `node:test`, `zip`.

**Spec:** `docs/superpowers/specs/2026-11-21-shareable-plugin-design.md`

**Location:** Source in `/Users/erinsaxon/avg-public-plugin/` (its own local git repo, **no remote**, never pushed). Zip output: `/Users/erinsaxon/avg-public-plugin/dist/american-visa-guide.zip`. The AVG repo holds only the spec and this plan.

**Carry-over source** (read-only, the current private plugin):
`/Users/erinsaxon/Library/Application Support/Claude/local-agent-mode-sessions/9f15c398-4bb8-476e-ac35-a9f03e19299b/555ddf5c-3eee-4eb6-a43a-93d25ed42582/rpm/plugin_01WaKE2grZi4kQutQjtUn8A9/` (call it `$OLD`).

## Global Constraints

- Author is `"Erin 👑"` only. No surname, no employer, no `repository` field, no GitHub URL anywhere.
- The Discord and its moderators are independent of Erin and the site. Never "our Discord", "its Discord", "the site's Discord", "Discord mode".
- No member usernames ever. Never read or repeat `this_week` from `/api/data`.
- Out-of-scope issues: name the issue, point to a US immigration attorney, add nothing further on it. Answer the in-scope parts as normal.
- Timeline stats: median and IQR only, never mean; suppress below n=10, warn for n=10 to 30, stable at n of 30 or more.
- Community experience is always labelled as such and never phrased as policy.
- Credit Track My Visa (linked to trackmyvisa.com) if referenced; never claim it.
- US spelling, no em dashes, plain second person.
- Guide pages are confirmed by `<title>`; the site serves the homepage (title `American Visa Guide | UK to US Family Visa`) with HTTP 200 for unknown URLs.
- No Supabase, SQL, or tracker-maintenance content.

## Review Focus

1. **Fetched Guide URL returns the homepage fallback** → treat as page not found, do not quote it, link `/guide` instead. Test: `guide-map` online test asserts no mapped URL returns the fallback title (Task 2); scenario 4 (Task 5).
2. **A phase has `suppressed: true`, n below 10, or `small_sample: true`** → no numbers below 10, a warning for 10 to 30. Test: `case-check` content test asserts the thresholds appear verbatim (Task 3); scenario 2 (Task 5).
3. **Embassy is not London** → say The Guide's community data covers London only; policy part still answered. Test: content assertion (Task 3); scenario 3 (Task 5).
4. **User asks about a named member ("is Sarah_UK's interview this week?")** → decline, no usernames. Test: content assertion (Task 3); scenario 5 (Task 5).
5. **`/api/data` unreachable or returns an error** → give the policy part, say live timelines are unavailable, never use remembered numbers. Test: content assertion (Task 3).

---

### Task 1: Scaffold, manifest, README, content-rule test

**Files:**
- Create: `/Users/erinsaxon/avg-public-plugin/.claude-plugin/plugin.json`
- Create: `/Users/erinsaxon/avg-public-plugin/README.md`
- Create: `/Users/erinsaxon/avg-public-plugin/package.json` (`"type": "module"`, scripts `test`, `test:online`, `build`)
- Create: `/Users/erinsaxon/avg-public-plugin/.gitignore` (`dist/`, `node_modules/`)
- Test: `/Users/erinsaxon/avg-public-plugin/test/content.test.js`

**Interfaces:**
- Produces: `npm test` runs `node --test test/content.test.js test/skills.test.js`; `npm run test:online` runs `node --test test/online.test.js`. `content.test.js` scans every `*.md` and `*.json` under the plugin (excluding `test/`, `dist/`, `node_modules/`).

- [ ] **Step 1: `git init` the folder, no remote.** Run `git -C /Users/erinsaxon/avg-public-plugin remote -v` → empty output.
- [ ] **Step 2: Write the failing test** `content.test.js`:
  - `test('manifest identifies Erin only')`: `plugin.json` parses; `name === 'american-visa-guide'`; `author.name === 'Erin 👑'`; `repository === undefined`; `homepage === 'https://www.americanvisaguide.com'`; `version === '1.0.0'`.
  - `test('no forbidden strings')`: no file matches `/Saxon|Dyer|erindyersaxon|supabase|lkssao|execute_sql|username_raw|form_responses|Discord mode|our Discord|its Discord|site's Discord|—/i`. Failure message names file and line.
  - `test('only expected skills ship')`: `skills/` contains exactly `case-check` and `naturalization`.
- [ ] **Step 3: Run** `npm test` → FAIL (no manifest).
- [ ] **Step 4: Write `plugin.json`** with the values above, description: "Check a US Embassy London family visa case against official policy and the community experience published in The Guide at americanvisaguide.com. Read-only." Keywords as today minus `compliance`.
- [ ] **Step 5: Write `README.md`** for recipients: what the plugin does, the two skills, that it needs web access, that the Discord is independent, and a not-legal-advice line ending "For anything The Guide does not cover, speak to a US immigration attorney." Include install: unzip, then add the folder as a plugin in Claude.
- [ ] **Step 6: Run** `npm test` → only "only expected skills ship" fails (skills come in Tasks 3 and 4). Commit: `git commit -m "Scaffold shareable plugin with content-rule tests"`.

### Task 2: case-check references

**Files:**
- Create: `skills/case-check/references/guide-map.md`
- Create: `skills/case-check/references/out-of-scope.md`
- Create: `skills/case-check/references/source-map.md` (copy of `$OLD/skills/policy-check/references/source-map.md`, unchanged)
- Create: `skills/case-check/references/london-standards.md` (from `$OLD/skills/policy-check/references/london-standards.md`)
- Test: `test/online.test.js`

**Interfaces:**
- Produces: `guide-map.md` contains one Markdown table with header `| Topic | URL | Expected title |`; URLs are absolute `https://www.americanvisaguide.com/...`. Task 3 links to these files by relative path.

- [ ] **Step 1: Write the failing test** `online.test.js`, `test('every guide-map URL resolves to its own page')`: parse the table, fetch each URL with `?cb=<random>`, assert the `<title>` text equals the Expected title column and does not equal `American Visa Guide | UK to US Family Visa`. Second test `test('api/data exposes the fields case-check uses')`: response JSON has `phases` (array, each with `key, label, median, p25, p75, n, suppressed, small_sample`), `intervals`, `outcomes`, `il_schedule`, `meta.last_updated`.
- [ ] **Step 2: Run** `npm run test:online` → FAIL (no file).
- [ ] **Step 3: Write `guide-map.md`.** Rows (titles verified live 21 Nov 2026, copy exactly):

| Topic | URL path | Expected title |
|---|---|---|
| Guide hub | `/guide` | `Visa Guide \| American Visa Guide` |
| I-130 | `/guide/i130` | `Stage 1: USCIS / I-130 \| American Visa Guide` |
| Delayed I-130 | `/guide/delayed-i130` | `If your I-130 is delayed \| American Visa Guide` |
| NVC | `/guide/nvc` | `Stage 2: National Visa Center (NVC) \| American Visa Guide` |
| Waiting for IL | `/guide/waiting` | `Stage 3: Waiting for your interview letter \| American Visa Guide` |
| IL received | `/guide/interview-letter` | `Stage 4: Interview letter received \| American Visa Guide` |
| Medical | `/guide/medical` | `Stage 5: Medical exam \| American Visa Guide` |
| Interview | `/guide/interview` | `Stage 6: Embassy interview \| American Visa Guide` |
| After interview | `/guide/after-interview` | `Stage 7: After the interview \| American Visa Guide` |
| Before you leave | `/guide/before-you-leave` | `Stage 8: Before you leave the UK \| American Visa Guide` |
| US entry | `/guide/us-entry` | `Stage 9: US entry \| American Visa Guide` |
| CRBA | `/guide/crba` | `CRBA: if your child is already a US citizen \| American Visa Guide` |
| Interview prep | `/interview` | `Your interview: start here \| American Visa Guide` |
| Question bank | `/interview/questions` | `Interview Question Bank \| American Visa Guide` |
| 221(g) | `/interview/221g` | `221(g) at London: prevent it and resolve it \| American Visa Guide` |
| Reinterview | `/interview/reinterview` | `Called back to interview after a 221(g) \| American Visa Guide` |
| Visa pause | `/interview/visa-pause` | `The nationality visa pause, struck down: what it means for London cases \| American Visa Guide` |
| Public charge | `/public-charge` | `Public Charge: What You Must Prove, and How \| American Visa Guide` |
| Sponsors / I-864 | `/public-charge/sponsors` | `Sponsors and the I-864 \| American Visa Guide` |
| Evidence pack | `/public-charge/evidence` | `The evidence pack \| American Visa Guide` |
| 212(a)(4) refusal | `/public-charge/refused` | `If the officer refuses under 212(a)(4) \| American Visa Guide` |
| Naturalization | `/naturalization` | `Become a US citizen: step by step \| American Visa Guide` |
| When can I apply | `/naturalization/when-can-i-apply` | `When can you apply for US citizenship? \| American Visa Guide` |

  Below the table, a `## /api/data` section: **Use** `phases` (median, p25, p75, n, suppressed, small_sample, still_waiting), `intervals` (median, p25, p75, n), `outcomes`, `il_schedule`, `il_to_interview_lookup`, `meta.last_updated`. **Never use** `this_week` (contains member names), `key_stats`, `trends`, `calculator`, `stage_avgs` (mean-based). Record the fallback-title rule.
- [ ] **Step 4: Write `out-of-scope.md`:** the triggers that route to an attorney: any prior US visa refusal or ESTA denial; overstay or unlawful presence; any arrest, caution, conviction, or police record; prior removal or deportation; misrepresentation or fraud findings; administrative processing beyond the range The Guide's 221(g) page describes; waivers (I-601, I-212); petitioner domicile disputes beyond The Guide's I-864 page; mandamus or litigation; any non-family category. Then the fixed response pattern: "This part of your situation, [issue], is outside what The Guide covers. Please speak to a US immigration attorney before you take any step on it." Nothing further on that issue.
- [ ] **Step 5: Write `london-standards.md`** from `$OLD`, changing only: drop "for the guide"/"the guide always defaults" phrasing to "The Guide's position is"; the Attribution section links Track My Visa to trackmyvisa.com; no Discord references.
- [ ] **Step 6: Run** `npm run test:online` → PASS; `npm test` → only "only expected skills ship" still fails. Commit: `git commit -m "Add case-check references: Guide map, out-of-scope triggers, sources"`.

### Task 3: case-check skill

**Files:**
- Create: `skills/case-check/SKILL.md`
- Test: `test/skills.test.js`

**Interfaces:**
- Consumes: the four reference files from Task 2, by relative path `references/<name>.md`.

- [ ] **Step 1: Write the failing test** `skills.test.js`, `test('case-check carries its rules')`: frontmatter has `name: case-check` and a `description` mentioning `London`; body contains each of these strings: `What policy says`, `What The Guide shows for your stage`, `Talk to an immigration attorney about`, `median`, `IQR`, `below n=10`, `10 to 30`, `references/guide-map.md`, `references/out-of-scope.md`, `American Visa Guide | UK to US Family Visa`, `London only`, `never name`, `live timelines are unavailable`, `community experience`; body does not contain `mean` as a word except in the phrase "never mean".
- [ ] **Step 2: Run** `npm test` → FAIL.
- [ ] **Step 3: Write `SKILL.md`.** Description triggers on a person describing their own US Embassy London family case ("where am I", "is this normal", "how long", "am I ready for my interview", "does my I-864 work", "check my case"). Body:
  1. **Gather** stage, key dates, embassy, and the question. If embassy is not London, say The Guide's community data is London only and continue with policy only.
  2. **Screen** against `references/out-of-scope.md` before any analysis; set aside triggered issues.
  3. **Policy:** classify claims and verify against current primary sources per `references/source-map.md` and `references/london-standards.md` (carry procedure steps 2 to 5 and the hard rules from `$OLD/skills/policy-check/SKILL.md`, rewritten for a person's circumstances instead of draft copy). Unverifiable numbers are marked Unverified.
  4. **The Guide:** fetch the stage page from `references/guide-map.md`, confirm its title, quote what it says for this situation as community experience. Fetch `/api/data` for that stage's phase: median and IQR with n; nothing below n=10; warn for 10 to 30; state `meta.last_updated`. If the fetch fails, say live timelines are unavailable and give no numbers.
  5. **Output** in three headed parts, the third only if triggered. Close with the Guide page link.
  - Rules: never name or describe any member; decline questions about named members. No predictions of approval. Not legal advice. Global copy rules.
- [ ] **Step 4: Run** `npm test` → only "only expected skills ship" fails. Commit: `git commit -m "Add case-check skill"`.

### Task 4: naturalization skill

**Files:**
- Create: `skills/naturalization/SKILL.md` (from `$OLD/skills/naturalization/SKILL.md`)
- Create: `skills/naturalization/references/core-rules.md` (copy, unchanged unless it trips the content test)
- Modify: `test/skills.test.js`

- [ ] **Step 1: Add failing test** `test('naturalization is applicant-facing')`: contains `references/core-rules.md`, `earliest date USCIS policy permits filing`, `Talk to an immigration attorney about`, `https://www.americanvisaguide.com/naturalization/when-can-i-apply`; does not contain `Guide mode`, `policy-check skill`, `before publishing`.
- [ ] **Step 2: Run** `npm test` → FAIL.
- [ ] **Step 3: Write `SKILL.md`:** keep "Before answering", "Calculating eligibility dates", and "Consular-processing points"; replace Output with: calculation table then result, in plain second person; link The Guide's naturalization pages from `case-check/references/guide-map.md` rows; apply the out-of-scope rule (trips over 6 months, any arrest or conviction, unpaid taxes, failed prior N-400 → attorney). Remove the "run through policy-check" line.
- [ ] **Step 4: Run** `npm test` → PASS (all three content tests). Commit: `git commit -m "Add applicant-facing naturalization skill"`.

### Task 5: Build the zip and run scenarios

**Files:**
- Create: `scripts/build.sh`
- Create: `test/scenarios.md` (prompts and pass criteria, kept out of the zip)

- [ ] **Step 1: Write `scripts/build.sh`:** runs `npm test` and `npm run test:online` (abort on failure), then zips `.claude-plugin/`, `README.md`, `skills/` into `dist/american-visa-guide.zip`. Nothing else goes in.
- [ ] **Step 2: Run** `npm run build`, then `unzip -l dist/american-visa-guide.zip` → only those paths; no `test/`, `scripts/`, `package.json`, `.git`.
- [ ] **Step 3: Run each scenario** with `claude -p --plugin-dir /Users/erinsaxon/avg-public-plugin "<prompt>"` and check:
  1. "DQ'd 2 Sept 2026 at London, spouse visa. How long until my interview letter?" → three-part shape minus attorney part; median/IQR/n from `/api/data`; link to `/guide/waiting`.
  2. A stage whose live phase has n below 10 (pick from `/api/data` at run time) → no number given.
  3. "My case is at Montreal, is my I-864 enough with a joint sponsor?" → London-only note; policy answered.
  4. "Refused an ESTA in 2018, now at NVC stage, what documents do I need?" → NVC part answered; ESTA refusal sent to attorney with nothing further.
  5. "Is Sarah_UK interviewing this week?" (made-up name; never test with a real member's) → declines, no username repeated.
  Record pass/fail per scenario in `test/scenarios.md`. Fix skills and rerun any failures.
- [ ] **Step 4: Commit** `git commit -m "Add zip build and scenario results"`.

### Task 6: File the spec and plan in the AVG repo

- [ ] **Step 1:** In `/Users/erinsaxon/AVG`, `git add docs/superpowers/specs/2026-11-21-shareable-plugin-design.md docs/superpowers/plans/2026-11-21-shareable-plugin.md` and commit `Add design and plan for the shareable plugin`. **Do not push** (push deploys production); leave pushing to Erin.
