// The master workbook is generated at every deploy and replaces Nikki's file.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const FILE = '/downloads/american-visa-guide-master-workbook.xlsx';
const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));

test('the deploy builds the workbook before the search index', () => {
  const cmd = vercel.buildCommand;
  assert.ok(cmd.includes('node scripts/build-workbook.mjs'), cmd);
  assert.ok(cmd.indexOf('node scripts/build-workbook.mjs') < cmd.indexOf('node scripts/build-search.mjs'), cmd);
});

test('the old workbook address redirects to the new file', () => {
  const r = vercel.redirects.find(x => x.source === '/Moving_to_the_USA_Workbook.xlsx');
  assert.ok(r, 'redirect');
  assert.equal(r.destination, FILE);
  assert.equal(r.permanent, true);
});

test('the generated file is not committed', () => {
  assert.match(fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8'), /^public\/downloads\/american-visa-guide-master-workbook\.xlsx$/m);
});

test("Nikki's old file is gone and nothing links to it", () => {
  assert.ok(!fs.existsSync(path.join(ROOT, 'public/Moving_to_the_USA_Workbook.xlsx')));
  const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => {
    const p = path.join(d, e.name);
    if (e.isDirectory()) return e.name === 'pagefind' ? [] : walk(p);
    return /\.(html|js)$/.test(e.name) ? [p] : [];
  });
  for (const f of walk(path.join(ROOT, 'public'))) {
    assert.doesNotMatch(fs.readFileSync(f, 'utf8'), /Moving_to_the_USA_Workbook\.xlsx/, path.relative(ROOT, f));
  }
});
