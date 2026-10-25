// Characterization tests for /api/data: run the real handler on synthetic
// London rows with the clock frozen, and pin its published statistics.
// UPDATE_GOLDEN=1 rewrites test/fixtures/api-data-golden.json from the current code.
const test = require('node:test');
const { mock } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROWS = require('./fixtures/api-data-rows.json');
const GOLDEN = path.join(__dirname, 'fixtures', 'api-data-golden.json');
const NOW = '2026-10-25T12:00:00Z';

async function runHandler(rows, nowISO) {
  const { default: handler } = await import('../api/data.js');
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://fixture.invalid';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'fixture-key';
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: true, json: async () => JSON.parse(JSON.stringify(rows)) });
  mock.timers.enable({ apis: ['Date'], now: new Date(nowISO) });
  let body, status = 200;
  const res = {
    status(c) { status = c; return this; },
    setHeader() { return this; },
    json(b) { body = b; return this; },
    end() { return this; },
  };
  try { await handler({ method: 'GET' }, res); } finally { mock.timers.reset(); globalThis.fetch = realFetch; }
  assert.equal(status, 200, `handler status ${status}: ${JSON.stringify(body)}`);
  return body;
}

const pinned = body => ({
  intervals: body.intervals,
  stage_avgs: body.stage_avgs,
  meta: { total_members: body.meta.total_members, total_submissions: body.meta.total_submissions },
});

test('api/data output is unchanged for the fixture', async () => {
  const body = await runHandler(ROWS, NOW);
  if (process.env.UPDATE_GOLDEN) fs.writeFileSync(GOLDEN, JSON.stringify(pinned(body), null, 2) + '\n');
  assert.deepEqual(pinned(body), JSON.parse(fs.readFileSync(GOLDEN, 'utf8')));
});


test('api/data exposes phases and phase_groups', async () => {
  const body = await runHandler(ROWS, NOW);
  assert.equal(body.phases.length, 9);
  assert.deepEqual(body.phase_groups.map(g => g.key), ['nvc', 'waiting', 'interview', 'after']);
  for (const ph of body.phases) {
    assert.equal(typeof ph.n, 'number', ph.key);
    assert.ok(ph.n <= body.meta.total_members, `${ph.key}: n ${ph.n} > members`); // the resubmission counts once
  }
  const p = Object.fromEntries(body.phases.map(x => [x.key, x]));
  for (const k of ['dq_to_il', 'il_to_interview', 'interview_to_passport'])
    assert.equal(p[k].median, body.intervals[k].median, k);
});
