# Master workbook: how it stays current

The master workbook (`/tools/workbook`) is generated, not edited by hand.

- **What builds it:** `scripts/build-workbook.mjs`, run at every deploy (`vercel.json` `buildCommand`) and locally with `npm run build:workbook`. It writes `public/downloads/american-visa-guide-master-workbook.xlsx`, which is git-ignored.
- **Where its words come from:** the Tasks tab reads each stage page's Action list and "Before you move on" list (`scripts/workbook/extract.mjs`); the Documents tab reads `public/js/checklist-data.js`. Change the wording there, never in the spreadsheet.
- **Rules the build enforces:** every Action list and "Before you move on" item needs a Petitioner, Beneficiary or Either role tag, and any HTML entity used must be in `extract.mjs`'s `ENTITIES` list. Otherwise the build stops with the page name.

## Erin's step: the Google Sheets copy

The "Copy to Google Sheets" button copies a sheet in Erin's Google Drive (`docs.google.com/spreadsheets/d/1ydOadF2laX3ksGuMaBFoTCemdEEjubhu`). It cannot update itself. After a deploy that changes any stage's tasks or any checklist document:

1. Download the new file from https://www.americanvisaguide.com/downloads/american-visa-guide-master-workbook.xlsx
2. Open the Google Sheet, then **File → Import → Upload**, choose the file, and pick **Replace spreadsheet**.
3. Check the About tab shows the new date.
