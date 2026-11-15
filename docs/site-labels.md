# Site labels

One name per section, used the same way in the top nav (`public/js/nav.js`), breadcrumbs, homepage cards and in-text links. Page `<title>`s and H1s can say more ("Your interview: start here"), but link text that points at a section uses the label below.

| Section | Label | URL | Not |
|---|---|---|---|
| Stage-by-stage guide | **Guide** (the menu item inside the Guide dropdown is "Visa guide") | `/guide` | The Guide, Visa Guide |
| Interview hub and its pages | **Interview** | `/interview` | Your interview |
| Community timelines | **Data** | `/data` | Data Tracker |
| News | **News** | `/news` | Embassy news, Updates |
| Checklists, worksheets, templates | **Tools** | `/checklists` | Checklists & Tools, Checklists and tools, Checklists & Templates |
| After landing | **Life in the USA** | `/life` | Life in the US |
| Citizenship | **Naturalization** | `/naturalization` | Citizenship guide |
| Call to action | **Submit your timeline** | Fillout form | Submit Timeline |

## Where each section sits

- **Top nav:** Guide ▾ (Visa guide · Life in the USA · Naturalization), Interview, Data, News, Tools, and the "Submit your timeline" button.
- **Footer only:** About this site, Glossary, Privacy Policy, Cookie settings, Buy me a coffee.
- **Home:** the brand mark. There is no "Home" menu item.

When a page joins a section, add its file name to `ACTIVE_MAP` in `nav.js` so the right menu item lights up.
