# Master workbook: design

16 November 2026. Status: draft for Erin's approval.

## Intent

One workbook for the whole journey: the visa, the move, and the tasks along the way. It builds on Nikki's *Moving to the USA Workbook* and thanks her, adds the detail the guide now has, and **agrees entirely with the site's current requirements**. The site's own content generates it, so the two cannot drift apart. People keep their own copy (Excel or Google Sheets), so a couple can share it, work offline, and track dates and costs.

## Goals

- Every document and task in the workbook reads exactly as it does on the site.
- Nothing is maintained twice: the workbook has no hand-written list of its own.
- Simple: five tabs, plain columns, no macros.
- Nikki is credited by name, as she is today.

## Non-goals

- Syncing progress between people or storing anyone's data on the site.
- Pre-filled fee amounts. Fees change, and the guide already states them on each stage.
- Anything after Stage 9 (US entry): the first year in the US (Life in the USA) and citizenship. Those pages are articles, not task lists; they can be added later once structured (Erin, 16 Nov 2026).
- Turning the stage pages into data files. The pages stay as they are and are read as the source.

## Anti-goals (a failure even if it works)

- A requirement worded differently in the workbook than on the site.
- A second list someone has to remember to update.
- A workbook so detailed that people stop using it.

## Approaches

| | Approach | Trade-off |
|---|---|---|
| A | A spreadsheet only, extending Nikki's file by hand | Easy to share, but goes stale as the guide changes |
| B | A tool on the site only (ticks saved in the browser) | Always current, but not shared between partners and weak for costs and dates |
| **C** | **Both from one source: the site generates the spreadsheet** | **Most work, but the only option that meets "agrees entirely"** |

**Picked: C** (Erin, 16 Nov 2026).

## The workbook: five tabs

1. **Tasks.** The guide's stages in order (Stage 1 to 9, with *If your I-130 is delayed* and *If your child is a US citizen* as optional sections after Stage 1). Each stage has a heading row with *Started* and *Done* date cells, then its **Action list** and **Before you move on** items, exactly as worded on the stage page. Columns: Who (Petitioner, Beneficiary or Either), Task, Done, Date, Notes, plus a link to the stage page.
2. **Documents.** Every row of the master checklist: group, file code (00, P01, B07…), document, the stage marks, the note, Done, Notes. This includes the public charge evidence pack (the rows with codes) and the new moving documents, so there is no separate evidence tab.
3. **Costs.** Nikki's *Savings & expenses* tab: Date, Description, Income/Savings (+), Expense (−), Running balance (formula), Dollars (USD). Left blank.
4. **Boxes.** Nikki's *Moving boxes inventory*, extended so **one list serves three jobs**: the customs declaration (CBP Form 3299, Part IV(D)), the mover's English inventory, and the insurance valuation. Header cells: Moving day, Ship items by, and Arrival in the US (you must arrive before your goods). Columns:
   - Box no. · Room · **Contents** (specific items, in English; never "Miscellaneous" or "Contents unknown", and describe boxes you packed yourself, "PBO")
   - **Purchased** (month and year) · **Country of purchase** · **Owned a year or more?** (a formula from the purchase date and the moving day)
   - **Declare separately?** (a formula: Yes when owned less than a year; those items are charged duty and listed on Part IV(D))
   - **Value or purchase price** (for customs) · **Replacement value** (for insurance; insurers may ask for high-value items separately)
   - Weight (lbs) · Box size (inches) · Colour code · Packed

   Nikki's *Company* and *Cost* columns move to the Costs tab, so costs are tracked in one place.
5. **About.** Thanks to Nikki (the current page's wording), the date the file was generated, how to use it, links to the guide, and "not legal advice".

"Done" is a Yes/blank dropdown (Excel data validation), which Google Sheets keeps on import.

## Where the moving content lives (no separate list)

The ten moving items are written once, where they belong in the guide, and reach the workbook automatically:

- **Stage 8, Before you leave**, gains action items and short sections for: keeping your UK phone number; closing down your UK life (council tax, utilities, TV licence, Royal Mail redirect, your GP, giving banks and pensions your US address); your UK driving record and no-claims proof; prescriptions and medical and dental records; credit history and a money plan; pets (CDC sourced); children's school records; and **shipping**: the paperwork set (passport and visa copies, Form 3299 and the supplemental declaration, an English inventory, a broker power of attorney, the bill of lading, and for sea freight an ISF filed at least 24 hours before loading), that you must arrive before your goods, that used household goods owned a year or more enter duty-free, and never to put your date of birth, SSN or passport number on a bill of lading.
- **Stage 9, US entry**, gains health cover from the day you land (qualifying life event; employer plans differ on needing US presence or an SSN).
- The USCIS Immigrant Fee stays on Stage 7, where it is today.
- **The master checklist** gains a **Moving** group for the documents to have in hand: the Immigrant Fee receipt, the CDC Dog Import Form receipt, a UK driving record and no-claims letter, a GP letter listing prescriptions, medical and dental records, children's school records, and the packing list. It gets a fifth stage column, **Move**. Existing rows have no Move value, and the table shows those as n/a.

Tasks are actions and documents are things to have. A task names its document rather than repeating its detail, as the stage pages already do.

## How it is built

- `scripts/build-workbook.mjs` reads the master checklist data (`public/js/checklist-data.js`, given a Node export like `section-nav.js` has) and the stage pages (`public/guide/*.html`, the `#action-list-title` and `#before-you-move-on-title` lists, which every stage page has). It writes `public/downloads/american-visa-guide-master-workbook.xlsx`.
- The Excel library is **exceljs**, a new devDependency.
- The build runs at deploy: it is added to `vercel.json`'s `buildCommand`, next to the search build, and as `npm run build:workbook` locally. The output file is git-ignored, like `public/pagefind/`, so every deploy ships a workbook that matches that deploy.
- The old address `/Moving_to_the_USA_Workbook.xlsx` gets a permanent redirect to the new file. This also closes review finding N10.
- **`/tools/workbook`** becomes the download page: what each tab holds, the thanks to Nikki, the Download and Copy to Google Sheets buttons, and the generated date. It drops its hand-written copy of tab 1, which is the repetition this project removes.
- **Google Sheets:** the "Copy to Google Sheets" button copies a sheet in Erin's Google Drive, which cannot update itself. After any deploy that changes the workbook, Erin imports the new file into that sheet, replacing its contents. The About tab's generated date makes a stale copy easy to spot.

## Tests

`test/workbook.test.js`:
- every stage page yields at least one Action list item and one Before you move on item;
- every master checklist row appears in the Documents tab, with the same name and note text;
- every task in the Tasks tab matches its stage page's text;
- the file builds without error.

## Pending

- **Shipping:** the guide text and tab 4 are written from the sources Erin supplied (CBP Form 3299 and a mover's instructions for it, the supplemental declaration, an ISF profile sheet, a broker power of attorney, the FIDI USA customs guide of May 2021, and an insurer's valuation form). These are used for structure and facts only: the site does not host them or name the companies. Linking Form 3299 itself waits on CBP's reply about its expired OMB date (28 Feb 2026). Until then, Stage 8 says your mover or customs broker supplies the current form.
- **Pets:** sourced from the CDC pages Erin supplied (Dog Import Form receipt, 6 months old, microchip, healthy; any port if only in rabies-free or low-risk countries; state and airline rules too).

## Calls made by the builder (for Erin to check)

- Five tabs, not eight: Evidence pack merged into Documents, and Tracker and Moving merged into Tasks.
- The Boxes tab drops Nikki's Company and Cost columns in favour of the Costs tab, and gains the customs and insurance columns.
- Nikki's original file is retired, not kept beside the new one, to avoid two workbooks. She stays credited by name on the page and in the About tab.
- Branch stages (delayed I-130, CRBA) appear as optional sections after Stage 1.
- No fee amounts are pre-filled.

## Name

**Master workbook** (Erin, 16 Nov 2026), matching "master checklist". It replaces "Moving to the USA Workbook" wherever the site names it: the guide overview, the Tools page card, the Tools sidebar (`section-nav.js`), the Stage 8 documents list, the workbook page itself, and the About page's thanks to Nikki. `docs/site-labels.md` gets the entry. The thanks to Nikki keep her workbook's original name.

## Decided with Erin (16 Nov 2026)

- Approach C: the site generates the spreadsheet.
- Stops at Stage 9, US entry.
- Erin owns the Google Sheet and re-imports after changes.
- Name: Master workbook.
