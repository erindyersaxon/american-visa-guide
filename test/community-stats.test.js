const test = require('node:test');
const assert = require('node:assert/strict');
const S = require('../public/js/community-stats.js');

test('isStat rejects bad medians', () => {
  [0, -3, null, '20', NaN, Infinity].forEach(m => assert.equal(S.isStat({ median: m, n: 30 }), false));
  assert.equal(S.isStat({ median: 14, n: 30 }), true);
  assert.equal(S.isStat(null), false);
});

test('usable needs n >= 5', () => {
  assert.equal(S.usable({ median: 14, n: 4 }), false);
  assert.equal(S.usable({ median: 14, n: 5 }), true);
});

test('formatDuration', () => {
  assert.deepEqual([9, 13, 14, 35].map(S.formatDuration), ['~9 days', '~13 days', '~2 wks', '~5 wks']);
});

test('pickStats keeps allowlisted median and n only', () => {
  const s = S.pickStats({
    stage_avgs: {
      il_to_medical_med: { avg: 50, median: 45, n: 186, min: 3, max: 170 },
      medical_to_interview_med: { median: '14', n: 9 },
      pd_to_approval: 300,
    },
  });
  assert.deepEqual(s.il_to_medical_med, { median: 45, n: 186 });
  assert.equal(s.medical_to_interview_med, null); // invalid becomes null
  assert.equal('pd_to_approval' in s, false); // not allowlisted
  assert.deepEqual(Object.keys(s).sort(), [...S.STAT_KEYS].sort());
});

test('pickStats handles missing stage_avgs', () => {
  [{}, null, { stage_avgs: null }].forEach(d =>
    assert.ok(Object.values(S.pickStats(d)).every(v => v === null)));
});

test('parseCachedStats rejects junk and round-trips valid', () => {
  ['{', '[]', null, '{"il_to_medical_med":null}'].forEach(r => assert.equal(S.parseCachedStats(r), null));
  const ok = JSON.stringify(S.pickStats({ stage_avgs: { il_to_medical_med: { median: 45, n: 186 } } }));
  assert.deepEqual(S.parseCachedStats(ok).il_to_medical_med, { median: 45, n: 186 });
  const bad = JSON.parse(ok);
  bad.docs_to_dq_med = { median: 0, n: 9 };
  assert.equal(S.parseCachedStats(JSON.stringify(bad)), null);
});

function fakeFetch(body, status = 200) {
  const f = async () => { f.calls++; return { ok: status === 200, status, json: async () => body }; };
  f.calls = 0;
  return f;
}
function memStorage() {
  const m = {};
  return { getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, m };
}
const API = { stage_avgs: { il_to_medical_med: { median: 45, n: 186 } } };

test('load shares one in-flight request', async () => {
  S._reset();
  const f = fakeFetch(API), st = memStorage();
  const [a, b] = await Promise.all([S.load({ fetch: f, storage: st }), S.load({ fetch: f, storage: st })]);
  assert.equal(f.calls, 1);
  assert.deepEqual(a, b);
  assert.deepEqual(JSON.parse(st.m['avg-stage-stats']).il_to_medical_med, { median: 45, n: 186 });
});

test('load uses a valid cache without fetching', async () => {
  S._reset();
  const f = fakeFetch(API), st = memStorage();
  st.setItem('avg-stage-stats', JSON.stringify(S.pickStats(API)));
  assert.deepEqual((await S.load({ fetch: f, storage: st })).il_to_medical_med, { median: 45, n: 186 });
  assert.equal(f.calls, 0);
});

test('load refetches over a corrupt cache', async () => {
  S._reset();
  const f = fakeFetch(API), st = memStorage();
  st.setItem('avg-stage-stats', '{');
  await S.load({ fetch: f, storage: st });
  assert.equal(f.calls, 1);
});

test('load works when storage throws', async () => {
  S._reset();
  const f = fakeFetch(API);
  const boom = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };
  assert.deepEqual((await S.load({ fetch: f, storage: boom })).il_to_medical_med, { median: 45, n: 186 });
});

test('load resolves null on 503 and on network error', async () => {
  S._reset();
  assert.equal(await S.load({ fetch: fakeFetch({ error: 'x' }, 503), storage: memStorage() }), null);
  S._reset();
  assert.equal(await S.load({ fetch: async () => { throw new Error('offline'); }, storage: memStorage() }), null);
});
