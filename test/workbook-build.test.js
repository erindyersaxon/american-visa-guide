// The master workbook (scripts/build-workbook.mjs): five tabs generated from
// the stage pages and the master checklist data, so it reads exactly as the site does.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const ExcelJS = require('exceljs');
const { AVG_DOCS, needOf } = require('../public/js/checklist-data.js');

const PUBLIC = path.join(__dirname, '..', 'public');
const GENERATED = new Date(Date.UTC(2026, 10, 16));
let book, stages, htmlToText;

test.before(async () => {
  const extract = await import('../scripts/workbook/extract.mjs');
  const { buildWorkbook } = await import('../scripts/build-workbook.mjs');
  htmlToText = extract.htmlToText;
  stages = extract.loadStages(PUBLIC);
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'avg-wb-')), 'wb.xlsx');
  await buildWorkbook({ stages, docs: AVG_DOCS, generatedAt: GENERATED }).xlsx.writeFile(file);
  book = new ExcelJS.Workbook();
  await book.xlsx.readFile(file);
});

const values = sheet => {
  const rows = [];
  sheet.eachRow({ includeEmpty: false }, row => rows.push(row.values.slice(1).map(v => (v && typeof v === 'object' ? (v.text ?? v.result ?? v.formula ?? '') : v))));
  return rows;
};
const header = (sheet, rowNo) => sheet.getRow(rowNo).values.slice(1);

test('the workbook has the five tabs in order', () => {
  assert.deepEqual(book.worksheets.map(s => s.name), ['Tasks', 'Documents', 'Costs', 'Boxes', 'About']);
});

test('Tasks lists every stage task word for word', () => {
  const sheet = book.getWorksheet('Tasks');
  assert.deepEqual(header(sheet, 1), ['Who', 'Task', 'Done', 'Date', 'Notes', 'Stage page']);
  const rows = values(sheet);
  const flat = rows.map(r => r.join('|'));
  for (const s of stages) {
    const title = s.optional ? `${s.title} (if it applies)` : s.title;
    const head = rows.find(r => r[1] === title);
    assert.ok(head, title);
    assert.ok(head.includes('Started') && head.includes('Done'), `${title}: Started/Done`);
    for (const t of [...s.actions, ...s.thread].filter(x => !x.skip)) {
      assert.equal(flat.filter(f => f.startsWith(`${t.who}|${t.text}|`)).length, 1, t.text.slice(0, 60));
    }
  }
});

test('Tasks has one row per piece of work: no repeats, no Before you move on', () => {
  const rows = values(book.getWorksheet('Tasks')).slice(1);
  const tasks = rows.filter(r => ['Petitioner', 'Beneficiary', 'Either'].includes(r[0])).map(r => r[1]);
  assert.equal(tasks.length, new Set(tasks).size, 'duplicate task text');
  assert.equal(tasks.length, stages.flatMap(s => [...s.actions, ...s.thread].filter(t => !t.skip)).length);
  assert.ok(!rows.some(r => r.includes('Before you move on')));
  for (const s of stages) for (const t of [...s.actions, ...s.thread].filter(x => x.skip)) assert.ok(!tasks.includes(t.text), t.text.slice(0, 60));
});

test('Documents has one row per master checklist document', () => {
  const sheet = book.getWorksheet('Documents');
  const labels = AVG_DOCS.stages.map(s => s[1]);
  assert.deepEqual(header(sheet, 1), ['Group', 'Code', 'Document', ...labels, 'Note', 'Done', 'Notes']);
  const rows = values(sheet).slice(1);
  assert.equal(rows.length, AVG_DOCS.docs.length);
  const mark = { yes: '✓', cond: 'If applies', no: 'n/a' };
  // Same order as the master checklist: group by group.
  const ordered = AVG_DOCS.groups.flatMap(g => AVG_DOCS.docs.filter(d => d.group === g.key));
  assert.equal(ordered.length, AVG_DOCS.docs.length, 'every doc belongs to a group');
  ordered.forEach((d, i) => {
    assert.equal(rows[i][0], htmlToText(AVG_DOCS.groups.find(g => g.key === d.group).title), d.key);
    const r = rows[i];
    assert.equal(r[2], htmlToText(d.name), d.key);
    assert.equal(r[3 + labels.length], htmlToText(d.note), d.key);
    AVG_DOCS.stages.forEach(([key], j) => assert.equal(r[3 + j], mark[needOf(d, key)], `${d.key} ${key}`));
  });
});

test('Done columns offer a Yes dropdown', () => {
  for (const [name, col] of [['Tasks', 'C'], ['Documents', String.fromCharCode(68 + AVG_DOCS.stages.length + 1)]]) {
    const v = book.getWorksheet(name).getCell(`${col}3`).dataValidation;
    assert.equal(v && v.type, 'list', name);
    assert.deepEqual(v.formulae, ['"Yes"'], name);
  }
});

test('Costs keeps the savings and expenses columns', () => {
  const sheet = book.getWorksheet('Costs');
  assert.deepEqual(header(sheet, 1), ['Date', 'Description', 'Income/Savings (+)', 'Expense (−)', 'Running balance', 'Dollars (USD)', 'Company']);
  assert.ok(sheet.getCell('E2').formula, 'running balance is a formula');
});

test('Boxes serves customs, the mover and insurance', () => {
  const sheet = book.getWorksheet('Boxes');
  assert.deepEqual(['A1', 'A2', 'A3'].map(c => sheet.getCell(c).value), ['Moving day', 'Ship items by', 'Arrival in the US']);
  assert.deepEqual(header(sheet, 5), ['Box no.', 'Room', 'Contents', 'Purchased', 'Country of purchase', 'Owned a year or more?',
    'Declare separately?', 'Value or purchase price', 'Replacement value', 'Weight (lbs)', 'Box size (inches)', 'Colour code', 'Packed']);
  const owned = sheet.getCell('F6').formula;
  const declare = sheet.getCell('G6').formula;
  assert.equal(owned, 'IF(OR(D6="",$B$1=""),"",IF(EDATE(D6,12)<=$B$1,"Yes","No"))');
  assert.equal(declare, 'IF(F6="","",IF(F6="No","Yes",""))');
  for (const f of [owned, declare]) assert.doesNotMatch(f.replace(/\b(IF|OR|EDATE)\(/g, ''), /[A-Z]{2,}\(/, f);
  assert.ok(sheet.getCell('F205').formula, 'formulas filled down 200 rows');
});

test('About thanks Nikki and dates the file', () => {
  const text = values(book.getWorksheet('About')).flat().join(' ');
  for (const s of ['Nikki', 'Moving to the USA Workbook', 'not legal advice', '16 November 2026', 'https://www.americanvisaguide.com/guide']) {
    assert.ok(text.includes(s), s);
  }
});

test('no cell holds markup, entities or missing values', () => {
  for (const sheet of book.worksheets) {
    for (const row of values(sheet)) {
      for (const cell of row) {
        assert.doesNotMatch(String(cell ?? ''), /<[a-z]|&[a-z]+;|\bundefined\b|\bnull\b/, `${sheet.name}: ${String(cell).slice(0, 60)}`);
      }
    }
  }
});
