# Site labels

One name per section, used the same way in the top nav (`public/js/nav.js`), breadcrumbs, homepage cards and in-text links. Page `<title>`s and H1s can say more ("Your interview: start here"), but link text that points at a section uses the label below.

| Section | Label | URL | Not |
|---|---|---|---|
| Stage-by-stage guide | **Guide** (the menu item inside the Guide dropdown is "Visa guide") | `/guide` | The Guide, Visa Guide |
| Interview hub and its pages | **Interview** | `/interview` | Your interview |
| Community timelines | **Data** | `/data` | Data Tracker |
| News | **News** | `/news` | Embassy news, Updates |
| Checklists, worksheets, templates | **Tools** | `/tools` | Checklists & Tools, Checklists and tools, Checklists & Templates |
| The spreadsheet for the whole journey | **Master workbook** | `/tools/workbook` | Moving to the USA Workbook (Nikki's original, named only when thanking her) |
| After landing | **Life in the USA** | `/life` | Life in the US |
| Citizenship | **Naturalization** | `/naturalization` | Citizenship guide |
| Call to action | **Submit your timeline** | Fillout form | Submit Timeline |

## Where each section sits

- **Top nav:** Guide ▾ (Visa guide · Life in the USA · Naturalization), Interview, Data, News, Tools, and the "Submit your timeline" button.
- **Footer only:** About this site, Glossary, Privacy Policy, Cookie settings, Buy me a coffee.
- **Home:** the brand mark. There is no "Home" menu item.

Every page lives under its section's address (`/interview/221g/green-sheet`, `/tools/workbook`), and the menu lights up the section from the first part of the address. A new top-level section needs one `ACTIVE_MAP` entry in `nav.js`. Breadcrumbs must follow the address too, and `npm test` (test/breadcrumbs.test.js) fails if they drift.
