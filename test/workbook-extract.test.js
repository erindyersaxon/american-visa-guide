// The master workbook's Tasks tab reads each stage page's Action list and
// "Before you move on" list (scripts/workbook/extract.mjs).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const PUBLIC = path.join(__dirname, '..', 'public');
const load = () => import('../scripts/workbook/extract.mjs');

test('htmlToText drops markup, hidden text and entities', async () => {
  const { htmlToText } = await load();
  const html = '<span class="role role--either">Either<span class="sr-only">:</span></span> We&rsquo;ve <a href="x">paid</a>.';
  assert.equal(htmlToText(html), 'Either We’ve paid.');
});

test('extractStage reads the NVC stage', async () => {
  const { extractStage } = await load();
  const stage = extractStage(fs.readFileSync(path.join(PUBLIC, 'guide/nvc.html'), 'utf8'), '/guide/nvc');
  assert.equal(stage.title, 'Stage 2: National Visa Center (NVC)');
  assert.ok(stage.actions.length >= 5);
  assert.equal(stage.actions[0].who, 'Petitioner');
  assert.match(stage.actions[0].text, /^Pay the \$325 visa processing fee/);
  for (const t of [...stage.actions, ...stage.verify]) {
    assert.doesNotMatch(t.text, /[<&]|^(Petitioner|Beneficiary|Either)\b/, t.text);
  }
});

test('loadStages reads every stage in order', async () => {
  const { loadStages, STAGE_PAGES } = await load();
  const stages = loadStages(PUBLIC);
  assert.equal(stages.length, 11);
  assert.deepEqual(stages.map(s => s.url), STAGE_PAGES.map(p => p.url));
  for (const s of stages) {
    assert.ok(s.actions.length > 0, `${s.url} actions`);
    assert.ok(s.verify.length > 0, `${s.url} verify`);
  }
});

test('extractStage fails loudly on an item with no role', async () => {
  const { extractStage } = await load();
  const html = '<h1>T</h1><section><h2 id="action-list-title"></h2><ol><li>No role</li></ol></section>';
  assert.throws(() => extractStage(html, '/guide/broken'), /\/guide\/broken/);
});
