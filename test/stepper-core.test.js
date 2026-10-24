const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../public/js/stepper-core.js');
const { parseStoredStep, stepStatus, formatTag, isStepperPage } = core;

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

test('isStepperPage allowlist', () => {
  ['/', '/index.html', '/guide', '/guide/', '/guide.html', '/guide/nvc', '/guide/nvc.html',
    '/checklist-medical', '/221g', '/data'].forEach(p => assert.equal(isStepperPage(p), true, p));
});

test('isStepperPage path variants and exclusions', () => {
  ['/news', '/naturalization', '/life', '/privacy', '/guide-extra', '/visa-pause', '/404', '/news.html']
    .forEach(p => assert.equal(isStepperPage(p), false, p));
});

test('stepper-core no longer owns data loading', () => {
  assert.equal(core.pickTags, undefined);
  assert.equal(core.parseCachedTags, undefined);
});
