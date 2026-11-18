# Master workbook: how it stays current

The master workbook (`/tools/workbook`) is generated, not edited by hand.

- **What builds it:** `scripts/build-workbook.mjs`, run at every deploy (`vercel.json` `buildCommand`) and locally with `npm run build:workbook`. It writes `public/downloads/american-visa-guide-master-workbook.xlsx`, which is git-ignored.
- **Where its words come from:** the Tasks tab reads each stage page's Action list, one row per piece of work (`scripts/workbook/extract.mjs`); the Documents tab reads `public/js/checklist-data.js`. "Before you move on" checks stay on the site only.
- **Rows the workbook skips:** an Action list `<li>` with `data-workbook="skip"` still shows on the site but stays out of the workbook, so each piece of work has one row. Use it for a task a later stage repeats (the owning stage keeps the row) or a pointer that is not work. Today: the Tax Return Transcript upload on Stage 3 (owned by Stage 4), planning travel on Stage 7 (Stage 8), the Immigrant Fee and health cover on Stage 9 (Stages 7 and 3), and "When the IL arrives, go to Stage 4".
- **Link prompts:** a closing "Why.", "See Stage 3." or "The steps are in…" sentence is dropped from the workbook row, which links to its stage instead. Change the wording there, never in the spreadsheet.
- **Rules the build enforces:** every Action list item needs a Petitioner, Beneficiary or Either role tag, and any HTML entity used must be in `extract.mjs`'s `ENTITIES` list. Otherwise the build stops with the page name.

## Erin's step: the Google Sheets copy


The "Copy to Google Sheets" button copies a sheet in Erin's Google Drive (`docs.google.com/spreadsheets/d/1_IjUQpvfJsr1hZ3NTikashR73iAI6FKS0Y4rkKjpdew`, a native Google Sheet owned by the site account since 17 Nov 2026; the button links its `/copy` address). It cannot update itself. After a deploy that changes any stage's tasks or any checklist document:

1. Download the new file from https://www.americanvisaguide.com/downloads/american-visa-guide-master-workbook.xlsx
2. Open the Google Sheet, then **File → Import → Upload**, choose the file, and pick **Replace spreadsheet**.
3. Check the About tab shows the new date.
