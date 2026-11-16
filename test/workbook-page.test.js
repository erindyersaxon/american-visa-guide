// /tools/workbook is the master workbook's download page, and the site calls it
// "Master workbook" everywhere except the thanks to Nikki (her original's name).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const PUBLIC = path.join(__dirname, '..', 'public');
const read = f => fs.readFileSync(path.join(PUBLIC, f), 'utf8');
const page = read('tools/workbook.html');

test('the workbook page is the download page', () => {
  assert.match(page, /<h1[^>]*>Master workbook<\/h1>/);
  assert.ok(page.includes('href="/downloads/american-visa-guide-master-workbook.xlsx"'));
  assert.ok(page.includes('docs.google.com/spreadsheets/d/1ydOadF2laX3ksGuMaBFoTCemdEEjubhu'));
  for (const tab of ['Tasks', 'Documents', 'Costs', 'Boxes', 'About']) assert.ok(page.includes(tab), tab);
  assert.ok(page.includes('Nikki'));
  assert.doesNotMatch(page, /<table\b/);
  assert.match(page, /<main[^>]*data-pagefind-body/);
});

test('only the thanks to Nikki use the old name', () => {
  const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => {
    const p = path.join(d, e.name);
    if (e.isDirectory()) return e.name === 'pagefind' ? [] : walk(p);
    return /\.(html|js)$/.test(e.name) ? [p] : [];
  });
  for (const f of walk(PUBLIC)) {
    const html = fs.readFileSync(f, 'utf8');
    for (const m of html.matchAll(/Moving to the USA [Ww]orkbook/g)) {
      const around = html.slice(Math.max(0, m.index - 200), m.index + 60);
      assert.match(around, /Nikki/, `${path.relative(PUBLIC, f)}: "${around.replace(/\s+/g, ' ').slice(-120)}"`);
    }
  }
});

test('the Tools sidebar names the master workbook', () => {
  const { SECTIONS } = require('../public/js/section-nav.js');
  const links = SECTIONS.tools.groups.flatMap(g => g.links);
  assert.ok(links.some(l => l.href === '/tools/workbook' && l.text === 'Master workbook'));
});
