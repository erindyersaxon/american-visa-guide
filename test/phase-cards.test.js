const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../public/js/phase-cards.js');

const phase = over => ({ median: 86, p25: 70, p75: 95, n: 46, window_days: 180, suppressed: false, small_sample: false, ...over });

test('formatDays', () => {
  assert.equal(C.formatDays(1), '1 day');
  assert.equal(C.formatDays(86), '86 days');
});

test('formatMonths', () => assert.equal(C.formatMonths(86), '≈ 2.8 months'));

test('windowLabel', () => assert.deepEqual([180, 270, 365, 545, 730, null].map(C.windowLabel),
  ['last 6 months', 'last 9 months', 'last 12 months', 'last 18 months', 'last 2 years', 'all reports']));

test('cardView normal', () => assert.deepEqual(C.cardView(phase()),
  { value: '86 days', source: 'most: 70–95 days · ≈ 2.8 months · 46 members · last 6 months' }));

test('cardView suppressed', () => assert.deepEqual(
  C.cardView(phase({ median: 20, p25: 10, p75: 30, n: 7, window_days: null, suppressed: true, small_sample: true })),
  { value: 'Not enough reports yet', source: '7 members · all reports' }));

test('cardView small sample', () => assert.match(
  C.cardView(phase({ median: 12, p25: 9, p75: 14, n: 22, window_days: 365, small_sample: true })).source, / · small sample$/));

test('cardView months boundary', () => {
  assert.match(C.cardView(phase({ median: 60, p25: 50, p75: 70, n: 40 })).source, /≈ 2\.0 months/);
  assert.doesNotMatch(C.cardView(phase({ median: 59, p25: 50, p75: 70, n: 40 })).source, /≈/);
});

test('cardView null median reads as not enough reports', () =>
  assert.equal(C.cardView(phase({ median: null, p25: null, p75: null, n: 0, suppressed: true })).value, 'Not enough reports yet'));

test('cardView shows members still waiting', () => {
  assert.equal(C.cardView(phase({ still_waiting: 3 })).source,
    'most: 70–95 days · ≈ 2.8 months · 46 members · 3 still waiting · last 6 months');
  assert.doesNotMatch(C.cardView(phase({ still_waiting: 0 })).source, /still waiting/);
});

test('data.html keeps the not-a-forecast caveat with the phase cards', () => {
  const html = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'public', 'data.html'), 'utf8');
  const start = html.indexOf('id="phases-hd"'), end = html.indexOf('<!-- IL DROP HISTORY TABLE -->');
  assert.ok(start > 0 && end > start, 'phases section present');
  assert.match(html.slice(start, end), /Historical data, not a forecast/);
});

test('data.html DQ backlog has no expected-batch estimates', () => {
  const html = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'public', 'data.html'), 'utf8');
  assert.doesNotMatch(html, /Expected Batch|expectedBatchLabel|drops away|drop expected to reach/);
});

test('cardView adds the all-time median when given', () => {
  assert.equal(C.cardView(phase({ all_time_median: 68 })).source,
    'most: 70–95 days · ≈ 2.8 months · 46 members · last 6 months · all-time median 68 days');
  assert.doesNotMatch(C.cardView(phase()).source, /all-time/);
});

test('data.html shows each wait only in the phase cards', () => {
  const html = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'public', 'data.html'), 'utf8');
  assert.doesNotMatch(html, /Typical recent wait|id="iv-(dqil|iliv|ivpp)"|id="t-(alltime|6mo)"|id="trend-hd"|renderIntervals|renderTrends/);
  const start = html.indexOf('id="phases-hd"'), end = html.indexOf('<!-- IL DROP HISTORY TABLE -->');
  assert.match(html.slice(start, end), /id="tn-days-since"/);
});

test('data.html has no IL to interview scheduling table', () => {
  const html = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'public', 'data.html'), 'utf8');
  assert.doesNotMatch(html, /id="sched-hd"|data-il-interview|il-interview\.js/);
});

test('data.html puts pipeline status above wait times by phase', () => {
  const html = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'public', 'data.html'), 'utf8');
  const pipeline = html.indexOf('id="pipeline-hd"'), phases = html.indexOf('id="phases-hd"');
  assert.ok(pipeline > 0 && phases > pipeline);
});

test('render adds a note under the matching card only', () => {
  const nodes = [];
  const mk = tag => ({ tag, children: [], dataset: {}, append(...c) { this.children.push(...c); }, replaceChildren() { this.children = []; } });
  global.document = { createElement: tag => { const n = mk(tag); nodes.push(n); return n; } };
  const container = mk('div');
  C.render(container, [phase({ key: 'docs_to_dq', group: 'nvc', label: 'Docs → DQ' }), phase({ key: 'fees_to_docs', group: 'nvc', label: 'Fees → docs' })],
    [{ key: 'nvc', label: 'NVC' }], { docs_to_dq: 'Conflicts with NVC' });
  delete global.document;
  const boxes = container.children[1].children;
  const notes = b => b.children.filter(c => c.className === 'stat-box__note').map(c => c.textContent);
  assert.deepEqual(notes(boxes[0]), ['Conflicts with NVC']);
  assert.deepEqual(notes(boxes[1]), []);
});
