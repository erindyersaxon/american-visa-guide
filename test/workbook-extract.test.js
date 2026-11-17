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
  for (const t of stage.actions) {
    assert.doesNotMatch(t.text, /[<&]|^(Petitioner|Beneficiary|Either)\b/, t.text);
  }
});

test('extractStage reads the domicile and public charge box, labeled by topic', async () => {
  const { extractStage } = await load();
  const stage = extractStage(fs.readFileSync(path.join(PUBLIC, 'guide/i130.html'), 'utf8'), '/guide/i130');
  assert.ok(stage.thread.some(t => t.who === 'Petitioner' && /^Domicile: Find your situation/.test(t.text)));
  assert.ok(stage.thread.some(t => t.who === 'Beneficiary' && /^Public charge: Read the five factors/.test(t.text)));
  for (const t of stage.thread) assert.doesNotMatch(t.text, /[<&]|Done when/, t.text);
});

test('extractStage reads topic tags and expandable lines in an Action list', async () => {
  const { extractStage } = await load();
  const stage = extractStage(fs.readFileSync(path.join(PUBLIC, 'guide/nvc.html'), 'utf8'), '/guide/nvc');
  const dom = stage.actions.find(t => /^Domicile: /.test(t.text));
  assert.equal(dom.who, 'Petitioner');
  assert.match(dom.text, /utility bills\. If the petitioner lives abroad: Upload a signed letter of intent/);
  assert.ok(stage.actions.some(t => t.who === 'Beneficiary' && /^Public charge: Draft your public charge statement/.test(t.text)));
  for (const t of stage.actions) assert.doesNotMatch(t.text, /[<&]/, t.text);
});

test('every stage on the main path has domicile and public charge tasks', async () => {
  const { loadStages } = await load();
  const tagged = t => /^(Domicile|Public charge): /.test(t.text);
  const withTasks = loadStages(PUBLIC).filter(s => [...s.actions, ...s.thread].some(tagged)).map(s => s.url);
  assert.deepEqual(withTasks, ['/guide/i130', '/guide/nvc', '/guide/waiting', '/guide/interview-letter', '/guide/medical',
    '/guide/interview', '/guide/after-interview', '/guide/before-you-leave']);
});

test('loadStages reads every stage in order', async () => {
  const { loadStages, STAGE_PAGES } = await load();
  const stages = loadStages(PUBLIC);
  assert.equal(stages.length, 11);
  assert.deepEqual(stages.map(s => s.url), STAGE_PAGES.map(p => p.url));
  for (const s of stages) assert.ok(s.actions.length > 0, `${s.url} actions`);
});

test('repeated tasks and stage pointers are marked to skip', async () => {
  const { loadStages } = await load();
  const skipped = loadStages(PUBLIC).flatMap(s => s.actions.filter(t => t.skip).map(t => [s.url, t.text]));
  const expected = [
    ['/guide/waiting', 'If the US tax filing deadline has passed'],
    ['/guide/waiting', 'When the IL arrives, go to Stage 4'],
    ['/guide/after-interview', 'Plan your travel.'],
    ['/guide/us-entry', 'Have health cover from the day you land.'],
    ['/guide/us-entry', 'Pay the $235 USCIS Immigrant Fee'],
  ];
  assert.equal(skipped.length, expected.length, JSON.stringify(skipped));
  for (const [url, start] of expected) {
    assert.ok(skipped.some(([u, t]) => u === url && t.startsWith(start)), `${url}: ${start}`);
  }
});

test('extractStage fails loudly on an item with no role', async () => {
  const { extractStage } = await load();
  const html = '<h1>T</h1><section><h2 id="action-list-title"></h2><ol><li>No role</li></ol></section>';
  assert.throws(() => extractStage(html, '/guide/broken'), /\/guide\/broken/);
});

test('extractStage reads only the list inside its own section', async () => {
  const { extractStage } = await load();
  const role = '<span class="role role--either">Either<span class="sr-only">:</span></span>';
  const html = `<h1>T</h1>
    <section><h2 id="action-list-title">Action list</h2><p>No list here.</p></section>
    <section><h2 id="before-you-move-on-title">Before you move on</h2><ul><li>${role} Verify.</li></ul></section>`;
  assert.throws(() => extractStage(html, '/guide/missing-list'), /\/guide\/missing-list.*action-list-title/);
});

test('extractStage ignores commented-out items', async () => {
  const { extractStage } = await load();
  const role = '<span class="role role--either">Either<span class="sr-only">:</span></span>';
  const html = `<h1>T</h1>
    <section><h2 id="action-list-title">A</h2><ol><li>${role} Shown.</li><!-- <li>${role} Hidden.</li> --></ol></section>
    <section><h2 id="before-you-move-on-title">B</h2><ul><li>${role} Check.</li></ul></section>`;
  const stage = extractStage(html, '/guide/comments');
  assert.deepEqual(stage.actions.map(t => t.text), ['Shown.']);
});

test('extractStage flags a skip and drops a trailing link prompt', async () => {
  const { extractStage } = await load();
  const role = '<span class="role role--either">Either<span class="sr-only">:</span></span>';
  const html = `<h1>T</h1><section><h2 id="action-list-title">A</h2><ol>
    <li>${role} Do X. <a href="/why">Why</a>.</li>
    <li>${role} Do Y. See <a href="/s3">Stage 3</a>.</li>
    <li data-workbook="skip">${role} Do Z. The steps are in <a href="/s4">Stage 4</a>.</li>
    <li>${role} Read <a href="/a">the guide</a> first.</li>
  </ol></section>`;
  const stage = extractStage(html, '/guide/t');
  assert.deepEqual(stage.actions.map(t => [t.text, t.skip]),
    [['Do X.', false], ['Do Y.', false], ['Do Z.', true], ['Read the guide first.', false]]);
});
