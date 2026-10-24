const test = require('node:test');
const assert = require('node:assert/strict');
const {
  parseStoredStep, stepStatus, formatTag, pickTags, parseCachedTags, isStepperPage,
} = require('../public/js/stepper-core.js');

test('parseStoredStep accepts 1-4 only', () => {
  ['1', '2', '3', '4'].forEach((s, i) => assert.equal(parseStoredStep(s), i + 1));
  ['0', '5', 'abc', '', ' 2', '2.5', null, undefined].forEach(v => assert.equal(parseStoredStep(v), null));
});

test('stepStatus around current step 3', () => {
  assert.deepEqual([1, 2, 3, 4].map(id => stepStatus(id, 3)), ['completed', 'completed', 'in-progress', 'upcoming']);
});

test('stepStatus unset is neutral', () => {
  assert.deepEqual([1, 2, 3, 4].map(id => stepStatus(id, null)), Array(4).fill('neutral'));
});

test('formatTag days vs weeks', () => {
  assert.equal(formatTag({ median: 9, n: 12 }), '~9 days typical · 12 members');
  assert.equal(formatTag({ median: 13, n: 12 }), '~13 days typical · 12 members');
  assert.equal(formatTag({ median: 14, n: 12 }), '~2 wks typical · 12 members');
  assert.equal(formatTag({ median: 35, n: 48 }), '~5 wks typical · 48 members');
});

test('formatTag hides small or missing samples', () => {
  [null, undefined, { median: 20, n: 4 }].forEach(s => assert.equal(formatTag(s), null));
});

test('formatTag rejects bad medians', () => {
  [0, -3, null, '20', NaN].forEach(m => assert.equal(formatTag({ median: m, n: 30 }), null));
});

test('pickTags maps stage_avgs by step', () => {
  const t = pickTags({
    stage_avgs: {
      approval_to_dq_stats: { avg: 40, median: 38, n: 60, min: 1, max: 120 },
      il_to_medical_med: null,
    },
  });
  assert.deepEqual(t[1], { median: 38, n: 60 });
  assert.equal(t[2], null);
  assert.equal(t[3], null); // missing key
});

test('parseCachedTags rejects junk', () => {
  ['{', '[]', '{"1":5}', null, '{"1":null,"2":null,"3":null}'].forEach(r => assert.equal(parseCachedTags(r), null));
  const ok = '{"1":{"median":38,"n":60},"2":null,"3":null,"4":{"median":12,"n":9}}';
  assert.deepEqual(parseCachedTags(ok)[4], { median: 12, n: 9 });
});

test('isStepperPage allowlist', () => {
  ['/', '/index.html', '/guide', '/guide/', '/guide.html', '/guide/nvc', '/guide/nvc.html',
    '/checklist-medical', '/221g', '/data'].forEach(p => assert.equal(isStepperPage(p), true, p));
});

test('isStepperPage path variants and exclusions', () => {
  ['/news', '/naturalization', '/life', '/privacy', '/guide-extra', '/visa-pause', '/404', '/news.html']
    .forEach(p => assert.equal(isStepperPage(p), false, p));
});
