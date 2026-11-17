# Relationship Evidence Story Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Teach couples to lay out relationship evidence as a dated story in chapters, with each chapter backed by several kinds of evidence that confirm one another, and let the template build a printable timeline index from their rows.

**Architecture:** One small shared module, `public/js/evidence-story.js`, holds the chapter list and a pure `buildTimeline()` function. It works in the browser and exports to Node for tests, the same pattern as `checklist-data.js`. The template page gets a static "Tell it as a story" section, a Chapter field and a "Backed up by" field on each photo and message row, and a printed timeline index ahead of the photos. The worked example gets chapters, "Backed up by" lines and a timeline. The I-130 checklist, binder and master checklist then point to the new section.

**Tech Stack:** Static HTML and vanilla JS on Vercel, Node built-in `node:test`.

**Spec:** Erin's request of 17 Nov 2026 (no separate spec doc). Here it is in full:
> Instruct people more about how to layer evidence to tell a story that is easy for an adjudicator to understand and follow. First meeting: photo, tickets to an event, texts from that meeting. Relationship building: flights, hotels, photos. Engagement: marriage license, photos. Wedding: payments, photos, marriage cert. Affidavits from friends attesting to these events (e.g. a friend when they met or got engaged, with specific dates and times). Moving in together: lease, utilities, becoming insurance beneficiaries. Children: birth certs, photos, insurance.

## Global Constraints

- Load `american-visa-guide:site-copy-style` before writing any copy. Use plain, short sentences. Write "officer", not "adjudicator" (the site's existing word on these pages).
- Name the site owner as "Erin" only, if at all.
- Run `american-visa-guide:policy-check` on any new factual claim about what USCIS or the consulate requires. The layering advice is framed as how to present evidence, not as a requirement.
- Do not invent evidence types beyond Erin's list, apart from the "Since filing" chapter (already site guidance: `public/guide/i130.html:415`).
- Living together and children are marked "if this applies". The copy must say plainly that couples who live apart skip these chapters, and that their travel and message records carry them instead.
- UK couples give notice of marriage rather than getting a licence. Write "marriage licence or notice of marriage".
- When a `/js/` or `/css/` file changes, bump its `?v=` on every page that loads it. `checklist-data.js` is loaded at `?v=20261117dq` on 6 pages.
- Keep `data-pagefind-body` on `<main>`. Do not remove existing element IDs from either relationship evidence page.
- Saved template data (`localStorage` key `avg-relationship-evidence-v1`) must keep loading. Do not change the key.
- Render user text with `textContent` / the page's `el()` helper. Only ever assign `''` to `innerHTML`.

## Review Focus

1. **Saved data from before this change** (rows with no `chapter` or `backup`): it loads without errors, and those rows appear under "Other" in the timeline. Tested in Task 1 and Task 2.
2. **A couple who never lived together and have no children**: no empty "Living together" or "Children" headings in the printed timeline, and the copy does not suggest they are missing something. Tested in Task 1 (empty chapters are left out) and Task 3 (the example's skip note).
3. **Rows with a chapter but no date**: they sort last within their chapter. They must not crash the timeline or jump to the top. Tested in Task 1.
4. **No chapters chosen at all**: the timeline section is hidden in print, so nobody gets a page that holds only "Other". Tested in Task 2.
5. **User text containing `<` or `&`** in "What" or "Backed up by": it prints as typed and is never parsed as HTML. Tested in Task 2 (innerHTML guard).

---

### Task 1: Chapter list and timeline builder

**Files:**
- Create: `public/js/evidence-story.js`
- Test: `test/relationship-evidence.test.js` (create)

**Interfaces:**
- Produces: `window.AVG_STORY = { CHAPTERS, buildTimeline }` in the browser; `module.exports = { CHAPTERS, buildTimeline }` in Node (guard with `typeof module !== 'undefined'`).
- `CHAPTERS: Array<{ key: string, title: string, optional: boolean, layers: string[] }>`, in this order and with this exact copy:

| key | title | optional | layers |
|---|---|---|---|
| `met` | First meeting | false | A photo from the day · Tickets or a booking for the event · Messages from that day or the next |
| `dating` | Getting to know each other | false | Flights and boarding passes · Hotel bookings · Photos from each visit |
| `engaged` | Engagement | false | Photos of the engagement · Marriage licence or notice of marriage |
| `wedding` | Wedding | false | Payments to the venue and suppliers · Photos with your guests · Marriage certificate |
| `home` | Living together | true | Lease or mortgage in both names · Utility bills at the same address · Naming each other as insurance beneficiaries |
| `children` | Children | true | Birth certificates naming you both · Photos · Insurance covering the child |
| `since` | Since filing | false | Travel records for each visit · Photos · Messages |

- `buildTimeline(photos: Row[], messages: Row[]) -> Array<{ key, title, items: Array<{ kind: 'photo'|'message', n: number, date: string, what: string, backup: string }> }>`, where `Row = { chapter?, date?, what?, backup?, imgs?, who?, where? }` and `n` is the row's 1-based position in its own table.
  - Groups follow `CHAPTERS` order. Rows with a missing or unknown `chapter` go in a final `{ key: 'other', title: 'Other' }` group.
  - Groups with no items are left out.
  - Within a group, items sort by ISO `date` ascending. Blank dates go last. Ties keep photos before messages, then table order.
  - A row with no `date`, `what`, `backup` or `imgs` (a blank row) is skipped.
  - Missing `backup` becomes `''`.

- [ ] **Step 1: Write the failing tests** in `test/relationship-evidence.test.js`

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const PUBLIC = path.join(__dirname, '..', 'public');
const { CHAPTERS, buildTimeline } = require('../public/js/evidence-story.js');

test('chapters in story order', () => {
  assert.deepEqual(CHAPTERS.map(c => c.key), ['met','dating','engaged','wedding','home','children','since']);
  assert.deepEqual(CHAPTERS.filter(c => c.optional).map(c => c.key), ['home','children']);
  assert.ok(CHAPTERS.every(c => c.layers.length >= 2));
});
test('groups by chapter, sorts by date, drops empty chapters', () => {
  const t = buildTimeline(
    [{ chapter: 'wedding', date: '2024-04-06', what: 'Wedding' }, { chapter: 'met', date: '2022-06-03', what: 'Met', backup: 'Tickets' }],
    [{ chapter: 'met', date: '2022-06-02', what: 'Plans' }]);
  assert.deepEqual(t.map(g => g.key), ['met', 'wedding']);
  assert.deepEqual(t[0].items.map(i => [i.kind, i.n, i.date]), [['message', 1, '2022-06-02'], ['photo', 2, '2022-06-03']]);
  assert.equal(t[0].items[1].backup, 'Tickets');
});
test('old saved rows with no chapter go to Other, last', () => {
  const t = buildTimeline([{ date: '2023-01-01', what: 'Old row', imgs: [] }, { chapter: 'met', date: '2022-01-01', what: 'x' }], []);
  assert.deepEqual(t.map(g => g.key), ['met', 'other']);
  assert.equal(t[1].items[0].backup, '');
});
test('blank dates sort last within a chapter', () => {
  const t = buildTimeline([{ chapter: 'dating', what: 'undated' }, { chapter: 'dating', date: '2022-08-20', what: 'dated' }], []);
  assert.deepEqual(t[0].items.map(i => i.what), ['dated', 'undated']);
});
test('blank rows and empty input give no groups', () => {
  assert.deepEqual(buildTimeline([{ imgs: [], who: '', date: '', where: '', what: '' }], []), []);
  assert.deepEqual(buildTimeline([], []), []);
});
```

- [ ] **Step 2: Run** `node --test test/relationship-evidence.test.js`. Expected: FAIL, "Cannot find module '../public/js/evidence-story.js'".
- [ ] **Step 3: Implement** `public/js/evidence-story.js` as an IIFE with the interface above, with a short top comment naming the two pages that use it.
- [ ] **Step 4: Run** `node --test test/relationship-evidence.test.js`. Expected: 5 pass.
- [ ] **Step 5: Commit** `git add public/js/evidence-story.js test/relationship-evidence.test.js && git commit -m "Add relationship evidence chapters and timeline builder"`

---

### Task 2: Template page: story guidance, chapter fields, printed timeline

**Files:**
- Modify: `public/tools/relationship-evidence.html` (lead, new section after the "Leave these out" callout, "How to fill it in" list, `FIELDS`, `blankRow`, the section-visibility code near line 408, a new print section)
- Test: `test/relationship-evidence.test.js`

**Interfaces:**
- Consumes: `AVG_STORY.CHAPTERS`, `AVG_STORY.buildTimeline(state.photos, state.messages)` from Task 1.
- Produces: the anchor `#story` (Task 4 links to it) and the row fields `chapter` and `backup`.

Page changes:
- Load `<script src="/js/evidence-story.js?v=20261117a"></script>` (not deferred) before the inline script.
- New section `<section id="story" class="no-print">` titled **"Tell it as a story"**, after the "Leave these out" callout. It contains:
  - An intro: the officer should be able to follow your relationship from first meeting to today in a few minutes. Put it in chapters, in date order, and back up each chapter with two or three kinds of evidence from the same dates. A photo, a ticket and a message from the same night each confirm the others.
  - A table `<table class="ev-table" id="story-table">` with one row per chapter: Chapter | What backs it up. Write the titles and layers as static HTML, copied exactly from `CHAPTERS`, so Pagefind indexes them. Add "(if this applies)" after the two optional titles.
  - Four short rules:
    1. Anchor each chapter on a dated document.
    2. Use dates that match your passport stamps and forms.
    3. Ask each affidavit writer to name the chapter events they saw, with the date, the place and roughly the time ("I was at the table when Sam proposed, Calton Hill, about 7pm on 15 April 2023").
    4. Skip chapters that do not apply. Couples who live apart lean on travel records and messages.
  - A link to the example.
- "How to fill it in": add "Choose a chapter for each row and list what backs it up. The printout starts with a one-page timeline built from these."
- `FIELDS.photos` and `FIELDS.messages`: add `{ k: 'chapter', label: 'Chapter', select: true }` first and `{ k: 'backup', label: 'Backed up by', ph: 'Concert tickets for 3 June; WhatsApp messages that night; Tom Hughes affidavit' }` last. Build the select's options from `CHAPTERS`, with a first option `''` labelled "Choose a chapter". Its print preview `.pv` shows the chapter title.
- `blankRow()` gains `chapter: ''` and `backup: ''`.
- New `<section class="ev-section" id="timeline-section">`, placed before the photos section. Print head: "Relationship evidence: timeline". Body `#timeline`, re-rendered on every `save()`: one `h3` per group, then a list of items. Each item reads "`fmtDate(date)` · `what` (Photo `n`)", with "Backed up by: `backup`" on a second line when it is not blank. Toggle `.empty` on the section when `buildTimeline` returns no group *other than* `other` (Review Focus 4).

- [ ] **Step 1: Write the failing tests** (append)

```js
const tpl = fs.readFileSync(path.join(PUBLIC, 'tools/relationship-evidence.html'), 'utf8');
test('template shows every chapter in the story table', () => {
  const table = tpl.match(/<table[^>]*id="story-table"[\s\S]*?<\/table>/)[0];
  for (const c of CHAPTERS) assert.ok(table.includes(c.title) && c.layers.every(l => table.includes(l)), c.key);
});
test('template loads the story module and has a timeline section', () => {
  assert.match(tpl, /<script src="\/js\/evidence-story\.js\?v=[0-9a-z]+"><\/script>/);
  assert.match(tpl, /id="timeline-section"/);
  assert.match(tpl, /'avg-relationship-evidence-v1'/);
});
test('template never parses user text as HTML', () => {
  const sets = [...tpl.matchAll(/innerHTML\s*=\s*([^;]+);/g)].map(m => m[1].trim());
  assert.deepEqual(sets.filter(v => v !== "''"), []);
});
```

- [ ] **Step 2: Run** `node --test test/relationship-evidence.test.js`. Expected: the 3 new tests FAIL.
- [ ] **Step 3: Implement** the page changes above.
- [ ] **Step 4: Run** `npm test`. Expected: all pass, including the existing suites.
- [ ] **Step 5: Check in the browser.** Run `preview_start` for the site and open `/tools/relationship-evidence`.
  - Old data: put a v1-shaped object with no `chapter` in `localStorage`, then reload. Expect no console errors, and the row shows under "Other".
  - Add two rows in different chapters, one with no date, then use print preview. Expect the timeline first, chapters in order, and the undated row last.
  - Clear all chapters. Expect the timeline section hidden in print.
  - Type `<b>x</b>` in "What". Expect it to print literally.
  - Check at 375px width. Expect no horizontal scroll.
- [ ] **Step 6: Commit** `git add public/tools/relationship-evidence.html test/relationship-evidence.test.js && git commit -m "Teach chapter-by-chapter evidence layering in the relationship template"`

---

### Task 3: Worked example in chapters

**Files:**
- Modify: `public/tools/relationship-evidence/example.html` (the "What makes it work" callout, the 8 rows, a new timeline block before the table)
- Test: `test/relationship-evidence.test.js`

**Interfaces:**
- Consumes: chapter keys and titles from Task 1. The example is static HTML: copy the titles in, and do not load the module.

Changes:
- Each `<tr>` gets `data-chapter="<key>"`. Each `<dl>` gets `<dt>Chapter</dt>` (first) and `<dt>Backed up by</dt>` (last), with this copy:

| Row | Chapter | Backed up by |
|---|---|---|
| 1 | met | Tom's party invitation for 3 June 2022; WhatsApp messages we swapped that night; Tom Hughes affidavit |
| 2 | dating | Sam's flight to London and boarding pass; Brighton train tickets for 20 August 2022 |
| 3 | dating | Priya's flight to Columbus and boarding pass; Linda Carter affidavit |
| 4 | engaged | Notice of marriage given at Leeds Register Office; Tom Hughes affidavit (Priya called him that evening) |
| 5 | wedding | Register office fee receipt; restaurant invoice for the lunch; marriage certificate |
| 6 | since | Sam's boarding pass for 16 August 2024; WhatsApp messages planning the weekend |
| 7 | since | Priya's flight booking for 26 November to 17 December 2024 |
| 8 | since | Sam's boarding pass for 14 March 2025; I-130 receipt notice dated January 2025 |

  Rows 6 and 7 fall between the wedding and filing. Check them against the "Since filing" title. If the policy check or Erin's review says they belong under Wedding or a renamed chapter, change the key here and in Task 1 together.
- New block before the table: `<section id="example-timeline">`. It holds an `h2` "Timeline", then the same grouped list Task 2 prints, written as static HTML for these 8 rows.
- Add this line to the callout: "Sam and Priya have not lived together yet and have no children, so they skip those chapters. Their flights, boarding passes and messages carry the story instead."
- Edit the callout's first bullet: "Each row answers who, when, where and what happened, and names the documents that back it up."

- [ ] **Step 1: Write the failing test** (append)

```js
const ex = fs.readFileSync(path.join(PUBLIC, 'tools/relationship-evidence/example.html'), 'utf8');
test('example rows are in chapters and backed up', () => {
  const rows = [...ex.matchAll(/<tr data-chapter="([a-z]+)">[\s\S]*?<\/tr>/g)];
  assert.equal(rows.length, 8);
  const keys = CHAPTERS.map(c => c.key);
  for (const [row, key] of rows) {
    assert.ok(keys.includes(key), key);
    assert.match(row, /<dt>Backed up by<\/dt><dd>[^<]{10,}<\/dd>/);
  }
  assert.ok(!rows.some(r => ['home', 'children'].includes(r[1])));
  assert.match(ex, /skip those chapters/);
  assert.match(ex, /id="example-timeline"/);
});
```

- [ ] **Step 2: Run** `node --test test/relationship-evidence.test.js`. Expected: the new test FAILs.
- [ ] **Step 3: Implement** the example changes.
- [ ] **Step 4: Run** `npm test`. Expected: all pass.
- [ ] **Step 5: Check the page in the browser** at desktop and 375px width, and in print preview. Expect the timeline first and every row showing Chapter and Backed up by.
- [ ] **Step 6: Commit** `git add public/tools/relationship-evidence/example.html test/relationship-evidence.test.js && git commit -m "Show the relationship evidence example as a layered story"`

---

### Task 4: Point the checklists at the story section

**Files:**
- Modify: `public/js/checklist-data.js` (the `evid-4` item and its group note; the `evid-7` label and note links)
- Modify: `public/tools/checklist-i130.html:198`, `public/tools/checklist-binder.html` (Section 6 note)
- Modify: the 6 pages loading `checklist-data.js` (bump `?v=20261117dq` to a new value)
- Test: `test/relationship-evidence.test.js`, `test/checklist-data.test.js` (existing; must stay green)

**Interfaces:**
- Consumes: the anchor `/tools/relationship-evidence#story` from Task 2.

Changes:
- `evid-4` label becomes: "Relationship timeline: your story in chapters, from first meeting to today, each backed by dated documents. Use the <a href=\"/tools/relationship-evidence#story\">story guide</a>". Its group note becomes: "Narrative: how you met, key milestones, and the documents that back up each one."
- `evid-7` label and note: replace `/relationship-evidence-template` with `/tools/relationship-evidence` (the redirect works, but link straight to the page). In the label, add "naming the dates and places they saw".
- `checklist-i130.html:198` becomes: "Lay out photos and message logs with the relationship evidence template, chapter by chapter: names, date, location, and the documents that back up each one. See <a href=\"/tools/relationship-evidence#story\">tell it as a story</a>."
- Binder Section 6 `section-note`: add "Keep it in story order, with the timeline page at the front."

- [ ] **Step 1: Write the failing test** (append)

```js
test('checklists link to the story guide, not the old URL', () => {
  const data = fs.readFileSync(path.join(PUBLIC, 'js/checklist-data.js'), 'utf8');
  assert.ok(!data.includes('href=\\"/relationship-evidence-template'));
  assert.match(data, /\/tools\/relationship-evidence#story/);
  assert.match(fs.readFileSync(path.join(PUBLIC, 'tools/checklist-i130.html'), 'utf8'), /relationship-evidence#story/);
});
```

- [ ] **Step 2: Run** `node --test test/relationship-evidence.test.js`. Expected: FAIL.
- [ ] **Step 3: Implement** the copy changes and the `?v=` bump (`grep -rl "checklist-data.js?v=20261117dq" public` should then return nothing).
- [ ] **Step 4: Run** `npm test && npm run build:workbook`. Expected: all pass, and the workbook builds with the new `evid-4` text.
- [ ] **Step 5: Commit** `git add public test && git commit -m "Link relationship evidence checklist items to the story guide"`

After pushing, remind Erin to re-import the master workbook into her Google Sheet, because the `evid-4` text changed.
