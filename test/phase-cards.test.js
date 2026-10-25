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
