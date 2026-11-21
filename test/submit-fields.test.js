// Unit tests for api/_lib/submit-fields.js (Fillout answer conversion).
const test = require('node:test');
const assert = require('node:assert/strict');
const load = () => import('../api/_lib/submit-fields.js');

test('toBoolean reads Fillout Yes/No labels in any casing', async () => {
  const F = await load();
  assert.equal(F.toBoolean('Yes'), true);
  assert.equal(F.toBoolean(' no '), false);
  assert.equal(F.toBoolean(true), true);
  assert.equal(F.toBoolean(null), null);
  assert.equal(F.toBoolean('Maybe'), null);
});

test('normalizeFields converts i130_interview and leaves other keys alone', async () => {
  const F = await load();
  const out = F.normalizeFields({ i130_interview: 'Yes', i130_interview_date: '2026-11-03', i130_rfe: 'No' });
  assert.deepEqual(out, { i130_interview: true, i130_interview_date: '2026-11-03', i130_rfe: 'No' });
  assert.deepEqual(F.normalizeFields({ username_raw: 'a' }), { username_raw: 'a' });
});
