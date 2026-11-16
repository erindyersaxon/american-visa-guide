// Builds the master workbook from the site's own content, so it reads exactly
// as the site does: the stage pages' tasks and the master checklist's documents.
// Runs at deploy (vercel.json buildCommand) and as `npm run build:workbook`.
// Design: docs/superpowers/specs/2026-11-16-master-workbook-design.md
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ExcelJS from 'exceljs';
import { loadStages, htmlToText } from './workbook/extract.mjs';

const require = createRequire(import.meta.url);
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://www.americanvisaguide.com';
export const OUTPUT = path.join(ROOT, 'public/downloads/american-visa-guide-master-workbook.xlsx');

const MARK = { yes: '✓', cond: 'If applies', no: 'n/a' };
const BOX_ROWS = 200;
const YES = { type: 'list', allowBlank: true, formulae: ['"Yes"'] };

function headerRow(sheet, rowNo, labels) {
  const row = sheet.getRow(rowNo);
  row.values = labels;
  row.font = { bold: true };
  return row;
}

function formatDate(date) {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function addTasks(book, stages) {
  const sheet = book.addWorksheet('Tasks', { views: [{ state: 'frozen', ySplit: 1 }] });
  sheet.columns = [{ width: 12 }, { width: 80 }, { width: 8 }, { width: 12 }, { width: 30 }, { width: 40 }];
  headerRow(sheet, 1, ['Who', 'Task', 'Done', 'Date', 'Notes', 'Stage page']);
  for (const stage of stages) {
    const title = stage.optional ? `${stage.title} (if it applies)` : stage.title;
    const head = sheet.addRow(['', title, '', 'Started', '', 'Done']);
    head.font = { bold: true };
    head.getCell(5).numFmt = 'd mmm yyyy';
    head.getCell(7).numFmt = 'd mmm yyyy';
    const link = { text: SITE + stage.url, hyperlink: SITE + stage.url };
    const add = task => {
      const row = sheet.addRow([task.who, task.text, '', '', '', link]);
      row.getCell(2).alignment = { wrapText: true, vertical: 'top' };
      row.getCell(3).dataValidation = YES;
      row.getCell(4).numFmt = 'd mmm yyyy';
    };
    stage.actions.forEach(add);
    sheet.addRow(['', 'Before you move on']).font = { italic: true };
    stage.verify.forEach(add);
  }
}

function addDocuments(book, data, needOf) {
  const sheet = book.addWorksheet('Documents', { views: [{ state: 'frozen', ySplit: 1 }] });
  const labels = data.stages.map(s => s[1]);
  sheet.columns = [{ width: 24 }, { width: 14 }, { width: 40 }, ...labels.map(() => ({ width: 11 })), { width: 70 }, { width: 8 }, { width: 30 }];
  headerRow(sheet, 1, ['Group', 'Code', 'Document', ...labels, 'Note', 'Done', 'Notes']);
  const doneCol = 4 + labels.length + 1;
  for (const group of data.groups) {
    for (const doc of data.docs.filter(d => d.group === group.key)) {
      const row = sheet.addRow([htmlToText(group.title), doc.code || '', htmlToText(doc.name),
        ...data.stages.map(([key]) => MARK[needOf(doc, key)]), htmlToText(doc.note), '', '']);
      row.getCell(4 + labels.length).alignment = { wrapText: true, vertical: 'top' };
      row.getCell(doneCol).dataValidation = YES;
    }
  }
}

function addCosts(book) {
  const sheet = book.addWorksheet('Costs', { views: [{ state: 'frozen', ySplit: 1 }] });
  sheet.columns = [{ width: 12 }, { width: 40 }, { width: 18 }, { width: 14 }, { width: 16 }, { width: 14 }, { width: 24 }];
  headerRow(sheet, 1, ['Date', 'Description', 'Income/Savings (+)', 'Expense (−)', 'Running balance', 'Dollars (USD)', 'Company']);
  for (let r = 2; r <= BOX_ROWS + 1; r++) {
    sheet.getCell(`A${r}`).numFmt = 'd mmm yyyy';
    sheet.getCell(`E${r}`).value = { formula: r === 2 ? 'C2-D2' : `E${r - 1}+C${r}-D${r}` };
  }
}

function addBoxes(book) {
  const sheet = book.addWorksheet('Boxes', { views: [{ state: 'frozen', ySplit: 5 }] });
  sheet.columns = [10, 14, 40, 12, 18, 14, 14, 16, 16, 12, 16, 12, 8].map(width => ({ width }));
  ['Moving day', 'Ship items by', 'Arrival in the US'].forEach((label, i) => {
    sheet.getCell(`A${i + 1}`).value = label;
    sheet.getCell(`A${i + 1}`).font = { bold: true };
    sheet.getCell(`B${i + 1}`).numFmt = 'd mmm yyyy';
  });
  sheet.getCell('C1').value = 'You must arrive in the US before your goods. List what is in each box, in English: never "Miscellaneous" or "Contents unknown".';
  headerRow(sheet, 5, ['Box no.', 'Room', 'Contents', 'Purchased', 'Country of purchase', 'Owned a year or more?',
    'Declare separately?', 'Value or purchase price', 'Replacement value', 'Weight (lbs)', 'Box size (inches)', 'Colour code', 'Packed']);
  for (let r = 6; r < 6 + BOX_ROWS; r++) {
    sheet.getCell(`D${r}`).numFmt = 'mmm yyyy';
    sheet.getCell(`F${r}`).value = { formula: `IF(OR(D${r}="",$B$1=""),"",IF(EDATE(D${r},12)<=$B$1,"Yes","No"))` };
    sheet.getCell(`G${r}`).value = { formula: `IF(F${r}="","",IF(F${r}="No","Yes",""))` };
    sheet.getCell(`M${r}`).dataValidation = YES;
  }
}

function addAbout(book, generatedAt) {
  const sheet = book.addWorksheet('About');
  sheet.columns = [{ width: 110 }];
  const lines = [
    ['American Visa Guide: Master workbook', { bold: true, size: 14 }],
    [`Generated ${formatDate(generatedAt)} from the guide. Every task and document reads exactly as the site does.`],
    [''],
    ['How to use it', { bold: true }],
    ['Tasks: every stage’s action list and "Before you move on" checks, in order. Fill in Done, the date and your notes.'],
    ['Documents: every document on the master checklist, with the public charge evidence file codes (P01, B07…).'],
    ['Costs: your savings and expenses. Boxes: your shipping inventory, for customs, your mover and your insurer.'],
    [''],
    ['Thank you, Nikki', { bold: true }],
    ['This workbook builds on Nikki’s Moving to the USA Workbook. Nikki, a brilliant former moderator of the Track My Visa server, built it during the US Embassy London process to share with everyone who needs it.'],
    [''],
    ['The guide', { bold: true }],
    [{ text: `${SITE}/guide`, hyperlink: `${SITE}/guide` }],
    [{ text: `${SITE}/tools/master-checklist`, hyperlink: `${SITE}/tools/master-checklist` }],
    [''],
    ['This workbook is not legal advice. Your situation may differ.'],
  ];
  for (const [value, font] of lines) {
    const row = sheet.addRow([value]);
    if (font) row.font = font;
    row.getCell(1).alignment = { wrapText: true };
  }
}

export function buildWorkbook({ stages, docs, generatedAt }) {
  const { needOf } = require('../public/js/checklist-data.js');
  const book = new ExcelJS.Workbook();
  book.creator = 'American Visa Guide';
  book.created = generatedAt;
  addTasks(book, stages);
  addDocuments(book, docs, needOf);
  addCosts(book);
  addBoxes(book);
  addAbout(book, generatedAt);
  return book;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { AVG_DOCS } = require('../public/js/checklist-data.js');
  const book = buildWorkbook({ stages: loadStages(path.join(ROOT, 'public')), docs: AVG_DOCS, generatedAt: new Date() });
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  await book.xlsx.writeFile(OUTPUT);
  console.log(`Master workbook: ${path.relative(ROOT, OUTPUT)}`);
}
