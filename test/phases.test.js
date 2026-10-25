// Unit tests for api/_lib/phases.js (robust statistics and the phases list).
const test = require('node:test');
const assert = require('node:assert/strict');

const NOW = new Date('2026-10-25T12:00:00Z');
const daysAgo = n => { const d = new Date(NOW); d.setUTCDate(d.getUTCDate() - n); return d.toISOString().slice(0, 10); };
const load = () => import('../api/_lib/phases.js');
// rows cohorted `ago` days back, each with value v
const cohort = (count, ago, v = 20) => Array.from({ length: count }, (_, i) => ({ a: daysAgo(ago + (i % 5)), v: v + (i % 7) }));

test('robustStats on 1..10', async () => {
  const P = await load();
  const s = P.robustStats([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.deepEqual([s.n, s.median, s.p25, s.p75], [10, 6, 3, 8]);
  assert.equal(s.suppressed, false);
  assert.equal(s.small_sample, true);
});

test('robustStats suppresses below 10', async () => {
  const P = await load();
  assert.equal(P.robustStats([1, 2, 3, 4, 5, 6, 7, 8, 9]).suppressed, true);
});

test('rollingWindow 180 when 40 recent', async () => {
  const P = await load();
  const rows = cohort(40, 30);
  assert.equal(P.rollingWindow(rows, 'a', r => r.v, r => r.a, NOW).window_days, 180);
});

test('rollingWindow widens to 365', async () => {
  const P = await load();
  const rows = [...cohort(12, 30), ...cohort(23, 300)]; // 12 within 180 days, 35 within 365
  assert.equal(P.rollingWindow(rows, 'a', r => r.v, r => r.a, NOW).window_days, 365);
});

test('rollingWindow all reports below floor', async () => {
  const P = await load();
  const rows = cohort(20, 30);
  const s = P.rollingWindow(rows, 'a', r => r.v, r => r.a, NOW);
  assert.equal(s.window_days, null);
  assert.equal(s.n, 20);
});
