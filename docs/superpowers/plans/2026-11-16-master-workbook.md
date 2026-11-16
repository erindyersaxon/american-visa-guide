# Master Workbook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate a five-tab Excel "Master workbook" at every deploy from the site's own content (stage pages + master checklist data), add the moving content it needs, and replace Nikki's hand-made workbook while crediting her.

**Architecture:** `public/js/checklist-data.js` stays the single source for documents and gains the stage list (with a new `move` stage) and a Node export. A small extractor reads each stage page's Action list and "Before you move on" list. `scripts/build-workbook.mjs` combines both with exceljs into `public/downloads/american-visa-guide-master-workbook.xlsx`, run in Vercel's `buildCommand`. Nothing is maintained twice.

**Tech Stack:** Node (built-in `node:test`), exceljs (new devDependency), static HTML on Vercel.

**Spec:** `docs/superpowers/specs/2026-11-16-master-workbook-design.md`

## Global Constraints

- Site copy names the site owner as "Erin" only, never a surname or employer.
- Never host or name the mover, broker or insurer whose paperwork Erin supplied; never link CBP Form 3299 (pending CBP's reply). Say "your mover or customs broker supplies the current form".
- Pets facts come only from CDC: Dog Import Form receipt (show airline and CBP), at least 6 months old, microchip readable by a universal scanner, healthy on arrival; any US airport, seaport or land border if only in rabies-free or low-risk countries in the past 6 months; check your state and airline too.
- Health cover facts (Erin): losing NHS cover is a qualifying life event; joining a spouse's employer plan, entering the US, and starting a job are qualifying life events; employer plans differ, and some need US presence or an SSN first.
- Name: "Master workbook" everywhere the site names the workbook; Nikki's thanks keep "Moving to the USA Workbook" as her original's name.
- Any changed `/js/` or `/css/` file gets its `?v=` bumped on every page that loads it.
- New content pages keep `data-pagefind-body` on `<main>`. Stage page anchor IDs may only be added, never removed (snapshot in `test/fixtures/stage-ids.json`).
- Workbook text must read exactly as the site does: no rewording in the generator.
- Not legal advice: the About tab says so.

## Review Focus

1. **Entities and markup in source text** (`&rsquo;`, `<a>`, `<strong>`, the role tag's hidden `:`): every workbook cell must be clean plain text matching the page's visible text. Test in Task 3.
2. **A stage list item with no role tag, or an empty list**, after a future page edit: the build must fail loudly, not drop the item. Test in Task 3.
3. **Blank purchase date or moving day in Boxes**: the formulas must show blank, not an error. Test in Task 4.
4. **Formulas and dropdowns surviving Google Sheets import**: use only `IF`, `OR`, `EDATE` and list validation. Test in Task 4.
5. **Documents with no `move` value**: shown as "n/a" on the site and in the workbook, never "undefined". Tests in Tasks 1 and 4.

---

### Task 1: Shared stage list, Move column, Node export

**Files:**
- Modify: `public/js/checklist-data.js` (top comment, `AVG_DOCS`, the display IIFE)
- Modify: every page loading `checklist-data.js` (bump `?v=`)
- Test: `test/checklist-data.test.js` (create)

**Interfaces:**
- Produces: `require('public/js/checklist-data.js')` → `{ AVG_DOCS, needOf }`; `AVG_DOCS.stages: Array<[key: string, label: string]>` equal to `[['i130','I-130'],['nvc','NVC'],['medical','Medical'],['interview','Interview'],['move','Move']]`; `needOf(doc, stageKey) → 'yes'|'cond'|'no'` (missing → `'no'`).

- [ ] **Step 1: Write the failing tests** in `test/checklist-data.test.js`:
  - `stages lists the five stages in order` → `deepEqual(AVG_DOCS.stages, [...as above])`.
  - `needOf treats a missing stage as no` → `needOf({need:{i130:'yes'}}, 'move') === 'no'` and `needOf({need:{move:'cond'}}, 'move') === 'cond'`.
  - `every doc's need uses known stages and values` → each key in `stages`, each value in `yes|cond|no`.
- [ ] **Step 2: Run** `node --test test/checklist-data.test.js` → FAIL (`document is not defined` on require).
- [ ] **Step 3: Implement.** Add `"stages"` as the first key of `AVG_DOCS` (keep the JSON round-trip: `json.dumps(indent=1, ensure_ascii=False)` style). Add `function needOf(doc, stage)`. After the data, export `{ AVG_DOCS, needOf }` when `module.exports` exists. Make the IIFE return early when `typeof document === 'undefined'`, use `AVG_DOCS.stages` instead of its local `STAGES`, and `needOf` for each badge. Document `stages` and the `move` stage in the top comment.
- [ ] **Step 4: Run** `node --test test/checklist-data.test.js` → PASS; `npm test` → all pass.
- [ ] **Step 5: Bump** `checklist-data.js?v=` on the six pages that load it; check `/tools/master-checklist` in the browser at 1366px and 375px: a "Move" column shows "n/a" on existing rows, no console errors.
- [ ] **Step 6: Commit** `git add public/js/checklist-data.js public/tools test/checklist-data.test.js && git commit -m "Share the stage list and add a Move stage to the master checklist"`

### Task 2: Moving documents and the Stage 8 and 9 content

**Files:**
- Modify: `public/js/checklist-data.js` (new group `moving`, after `interview`)
- Modify: `public/guide/before-you-leave.html` (Action list, sections, Before you move on)
- Modify: `public/guide/us-entry.html` (Action list item and a short section on health cover)
- Modify: `test/fixtures/stage-ids.json` (additions only)
- Test: `test/checklist-data.test.js`, `test/moving-content.test.js` (create)

**Interfaces:**
- Consumes: `AVG_DOCS.stages`, `needOf` (Task 1).
- Produces: group key `moving`, title `Moving &amp; arrival documents`; doc keys `move-immigrant-fee`, `move-dog-receipt`, `move-driving-record`, `move-prescriptions`, `move-records`, `move-school-records`, `move-inventory`, each with `need.move` set and other stages absent.

- [ ] **Step 1: Write failing tests.**
  - `test/checklist-data.test.js`: `moving group has the seven moving documents` → the keys above exist in group `moving`, each `needOf(d,'move') !== 'no'`.
  - `test/moving-content.test.js`, reading the two pages' text:
    - Stage 8's Action list (`#action-list-title` section) mentions, case-insensitive: `phone number`, `council tax`, `driving record`, `prescription`, `credit`, `Dog Import Form`, `school`, `inventory`.
    - Stage 8 page text contains `Never put your date of birth` and does **not** contain `3299.pdf` or any `cbp.gov/document/forms` link.
    - Stage 9's Action list mentions `qualifying life event`.
    - Every new `<li>` in both lists starts with a role span.
- [ ] **Step 2: Run** `node --test test/checklist-data.test.js test/moving-content.test.js` → FAIL.
- [ ] **Step 3: Add the moving rows** to `checklist-data.js` (`items: []`; notes in plain site style):
  - Immigrant Fee receipt (`yes`): the USCIS receipt; keep it for entry, the green card is not produced until the fee is paid; links `/guide/after-interview`.
  - CDC Dog Import Form receipt (`cond`): one per dog; the CDC rules in Global Constraints.
  - UK driving record and no-claims letter (`cond`): from DVLA and your insurer, before you leave, for US car insurance; links `/life`.
  - GP letter listing prescriptions (`cond`), medical and dental records (`yes`), children's school records (`cond`, links B16 wording), packing list and inventory (`cond`, the Boxes tab).
- [ ] **Step 4: Write the Stage 8 content** in the page's existing patterns (role-tagged `li` in the Action list and Before you move on; `Either :` sub-sections under "UK tasks before you leave"): keeping your UK phone number (UK banks, HMRC and the Student Loans Company text you codes); closing down your UK life (council tax final bill, utilities, TV licence, Royal Mail redirect, telling your GP, giving banks and pensions your US address); UK driving record and no-claims proof; prescriptions and records; credit history and a money plan (keep a UK account; moving money; larger deposits without US credit; link `/life`); pets (Global Constraints); children's school records; shipping (the design's paperwork set, arrive before your goods, duty-free used goods owned a year or more, items owned under a year declared and charged duty, the ISF for sea freight, never put DOB/SSN/passport number on a bill of lading, your mover or customs broker supplies the current Form 3299). Keep ISAs first: the page orders sections costliest first.
- [ ] **Step 5: Write the Stage 9 health cover item and section** (Global Constraints wording), linking to B07 on `/public-charge/evidence#deliverables`.
- [ ] **Step 6: Run** the two tests → PASS; `npm test`; update `stage-ids.json` for the two pages only after confirming the diff is additions only.
- [ ] **Step 7: Commit** `git add public/js/checklist-data.js public/guide/before-you-leave.html public/guide/us-entry.html test && git commit -m "Add moving documents and Stage 8 and 9 moving content"`

### Task 3: Stage task extractor

**Files:**
- Create: `scripts/workbook/extract.mjs`
- Test: `test/workbook-extract.test.js`

**Interfaces:**
- Produces:
  - `htmlToText(html: string) → string`: strips tags, drops `<span class="sr-only">…</span>`, decodes every entity the site uses (named and numeric), collapses whitespace.
  - `extractStage(html: string, url: string) → { title: string, url, actions: Task[], verify: Task[] }` where `Task = { who: 'Petitioner'|'Beneficiary'|'Either', text: string }`; `title` from `<h1>`; throws `Error` naming `url` when a list is missing, empty, or an item lacks a role span.
  - `STAGE_PAGES: Array<{ file: string, url: string, optional?: true }>` in order: `i130`, `delayed-i130` (optional), `crba` (optional), `nvc`, `waiting`, `interview-letter`, `medical`, `interview`, `after-interview`, `before-you-leave`, `us-entry`.
  - `loadStages(publicDir: string) → Stage[]`.

- [ ] **Step 1: Write failing tests:**
  - `htmlToText` of `'<span class="role role--either">Either<span class="sr-only">:</span></span> We&rsquo;ve <a href="x">paid</a>.'` → `'Either We’ve paid.'`.
  - `extractStage` on the real `public/guide/nvc.html` → title `Stage 2: National Visa Center (NVC)`, `actions.length >= 5`, first action `who === 'Petitioner'`, `text` starts `Pay the $325 visa processing fee`, and no task text contains `<`, `&`, or begins with the role word.
  - `loadStages('public')` → 11 stages in `STAGE_PAGES` order, every stage has `actions.length > 0` and `verify.length > 0`.
  - `extractStage` throws on `<h1>T</h1><section><h2 id="action-list-title"></h2><ol><li>No role</li></ol></section>` with a message containing the url.
- [ ] **Step 2: Run** `node --test test/workbook-extract.test.js` → FAIL.
- [ ] **Step 3: Implement** with regular expressions over the known structure (section containing `#action-list-title` → its `ol.article-actions`; section containing `#before-you-move-on-title` → its `ul.checklist`), not an HTML library.
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `git add scripts/workbook test/workbook-extract.test.js && git commit -m "Read each stage's tasks for the master workbook"`

### Task 4: Build the workbook

**Files:**
- Create: `scripts/build-workbook.mjs`
- Modify: `package.json` (devDependency `exceljs`, script `"build:workbook": "node scripts/build-workbook.mjs"`)
- Test: `test/workbook-build.test.js`

**Interfaces:**
- Consumes: `loadStages`, `htmlToText` (Task 3); `AVG_DOCS`, `needOf` (Task 1).
- Produces: `buildWorkbook({ stages, docs, generatedAt: Date }) → ExcelJS.Workbook`; running the file writes `public/downloads/american-visa-guide-master-workbook.xlsx` (exported const `OUTPUT`).

- [ ] **Step 1: Install** `npm install --save-dev exceljs` (commit `package.json` and `package-lock.json` with this task).
- [ ] **Step 2: Write failing tests** (build in memory, write to a temp file, read back with exceljs):
  - sheet names in order: `Tasks`, `Documents`, `Costs`, `Boxes`, `About`.
  - **Tasks:** for every stage, a heading row with the stage title and cells labelled `Started` and `Done`; every `actions` and `verify` task appears once as a row with columns `Who`, `Task`, `Done`, `Date`, `Notes`, `Stage page`; optional stages' headings end with `(if it applies)`.
  - **Documents:** one row per `AVG_DOCS.docs` entry with columns `Group`, `Code`, `Document`, the five stage labels, `Note`, `Done`, `Notes`; `Document` and `Note` equal `htmlToText` of the source; stage cells are `✓`, `If applies` or `n/a` from `needOf`.
  - **Done columns** in Tasks and Documents carry list validation `"Yes"`.
  - **Costs:** headers `Date`, `Description`, `Income/Savings (+)`, `Expense (−)`, `Running balance`, `Dollars (USD)`, `Company`; `Running balance` cells are formulas.
  - **Boxes:** header cells `Moving day`, `Ship items by`, `Arrival in the US`; column headers exactly `Box no.`, `Room`, `Contents`, `Purchased`, `Country of purchase`, `Owned a year or more?`, `Declare separately?`, `Value or purchase price`, `Replacement value`, `Weight (lbs)`, `Box size (inches)`, `Colour code`, `Packed`; the two formula columns use only `IF`, `OR`, `EDATE` and return `""` when the purchase date or moving day is blank.
  - **About:** contains `Nikki`, `Moving to the USA Workbook`, `not legal advice`, the `generatedAt` date as `D Month YYYY`, and links to `https://www.americanvisaguide.com/guide`.
  - no cell in any sheet contains `<`, `&rsquo;`, `undefined` or `null`.
- [ ] **Step 3: Run** `node --test test/workbook-build.test.js` → FAIL.
- [ ] **Step 4: Implement** `buildWorkbook` and the CLI entry. Boxes layout: labels `Moving day`, `Ship items by`, `Arrival in the US` in `A1:A3` with their date cells in `B1:B3`; the column headers on row 5 in the order above (so Purchased is `D`, Owned a year or more? is `F`, Declare separately? is `G`); item rows from row 6, formulas filled down 200 rows. Then the CLI entry (`if (import.meta.url === pathToFileURL(process.argv[1]).href)` writes `OUTPUT`, creating `public/downloads/` if needed). Freeze each sheet's header row, bold headers, set readable column widths. Formulas, for row `n` with Purchased in `D` and Moving day in `B1`: `=IF(OR(Dn="",$B$1=""),"",IF(EDATE(Dn,12)<=$B$1,"Yes","No"))` and `=IF(Fn="","",IF(Fn="No","Yes",""))`.
- [ ] **Step 5: Run** the test → PASS; run `npm run build:workbook` and open the file to check it looks right (manual).
- [ ] **Step 6: Commit** `git add scripts/build-workbook.mjs package.json package-lock.json test/workbook-build.test.js && git commit -m "Generate the master workbook from the site's content"`

### Task 5: Deploy wiring and the old file

**Files:**
- Modify: `vercel.json` (`buildCommand`, `redirects`)
- Modify: `.gitignore`
- Delete: `public/Moving_to_the_USA_Workbook.xlsx`
- Test: `test/workbook-deploy.test.js`

- [ ] **Step 1: Write failing tests:**
  - `vercel.json` `buildCommand` contains `node scripts/build-workbook.mjs` before `node scripts/build-search.mjs`.
  - `redirects` has permanent entries from `/Moving_to_the_USA_Workbook.xlsx` to `/downloads/american-visa-guide-master-workbook.xlsx`.
  - `.gitignore` lists `public/downloads/american-visa-guide-master-workbook.xlsx`.
  - `public/Moving_to_the_USA_Workbook.xlsx` does not exist, and no page links to it.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** → PASS, `npm test` all pass.
- [ ] **Step 5: Commit** `git add -A vercel.json .gitignore public/Moving_to_the_USA_Workbook.xlsx test/workbook-deploy.test.js && git commit -m "Build the master workbook at deploy; redirect the old file"`

### Task 6: The workbook page and the new name

**Files:**
- Modify: `public/tools/workbook.html` (rewrite as the download page)
- Modify: `public/guide.html`, `public/about.html`, `public/tools.html`, `public/guide/before-you-leave.html`, `public/js/section-nav.js` (rename; bump `section-nav.js?v=` on every page)
- Modify: `docs/site-labels.md` (add the Master workbook row)
- Create: `docs/workbook.md` (Erin's maintenance note)
- Test: `test/workbook-page.test.js`

- [ ] **Step 1: Write failing tests:**
  - `/tools/workbook` has `<h1>` `Master workbook`, a download link to `/downloads/american-visa-guide-master-workbook.xlsx`, the existing Google Sheets copy link (`docs.google.com/spreadsheets/d/1ydOadF2laX3ksGuMaBFoTCemdEEjubhu`), the five tab names, `Nikki`, and no `<table>` mirroring tab contents.
  - Outside `about.html`'s and `workbook.html`'s thanks to Nikki, no page or script contains `Moving to the USA Workbook`.
  - `section-nav.js` `tools` list has `{ href: '/tools/workbook', text: 'Master workbook' }`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement**; the page keeps the Tools sidebar and `data-pagefind-body`. `docs/workbook.md` says: the file rebuilds at every deploy; after a deploy that changes tasks or documents, import the new file into the Google Sheet behind the Copy button (File → Import → Replace spreadsheet).
- [ ] **Step 4: Run** → PASS; `npm test`; check `/tools/workbook` and `/tools` in the browser at 1366px and 375px.
- [ ] **Step 5: Commit** `git add public docs test && git commit -m "Rename to Master workbook and make /tools/workbook the download page"`

### Task 7: End-to-end check

- [ ] **Step 1:** `npm test` → all pass. `npm run build:workbook` → file written; open each tab and spot-check three tasks and three documents against the live pages' wording.
- [ ] **Step 2:** Browser: `/guide/before-you-leave`, `/guide/us-entry`, `/tools/master-checklist`, `/tools/workbook` at 1366px and 375px; no console errors; the downloaded file opens.
- [ ] **Step 3:** After Erin approves the push and the deploy is live: the old address redirects to the new file, the file downloads, and its About tab shows today's date. Remind Erin to re-import it into her Google Sheet.
