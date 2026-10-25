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

// --- buildPhases ---
const daysBetween = (a, b) => (a && b) ? Math.round((new Date(b) - new Date(a)) / 864e5) : null;
const plus = (iso, n) => { const d = new Date(iso); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
// one member: every milestone, `ago` days back, with fixed step gaps
const member = (i, ago, over = {}) => {
  const appr = daysAgo(ago), welcome = plus(appr, 10), fees = plus(welcome, 8), docs = plus(fees, 20),
    dq = plus(docs, 15), il = plus(dq, 80), med = plus(il, 30), iv = plus(med, 10), pp = plus(iv, 5);
  return { username_raw: `m${i}`, i130_approval: appr, nvc_welcome_letter: welcome, nvc_fees_paid: fees,
    nvc_docs_submitted: docs, dq_date: dq, interview_letter: il, medical: med, interview: iv,
    passport_from: iv, passport_in_hand: pp, interview_expedited: false, ...over };
};
const INTERVALS = {
  dq_to_il: { n: 40, median: 80, p25: 70, p75: 90, p90: 99, min: 60, max: 110, suppressed: false, small_sample: false, window_days: 180, censored: 3 },
  il_to_interview: { n: 35, median: 40, p25: 35, p75: 45, p90: 50, min: 30, max: 60, suppressed: false, small_sample: false, window_days: 270, censored: 1 },
  interview_to_passport: { n: 12, median: 5, p25: 4, p75: 7, p90: 8, min: 3, max: 9, suppressed: false, small_sample: true, window_days: null, censored: 9 },
};
const build = async (deduped, standard = deduped.filter(r => !r.interview_expedited)) =>
  (await load()).buildPhases({ deduped, standard, intervals: INTERVALS }, { now: NOW, daysBetween });
const byKey = phases => Object.fromEntries(phases.map(p => [p.key, p]));

test('buildPhases order and groups', async () => {
  const phases = await build(Array.from({ length: 40 }, (_, i) => member(i, 300)));
  assert.deepEqual(phases.map(p => p.key), ['approval_to_welcome', 'welcome_to_fees', 'fees_to_docs', 'docs_to_dq',
    'dq_to_il', 'il_to_interview', 'il_to_medical', 'medical_to_interview', 'interview_to_passport']);
  assert.deepEqual(phases.map(p => p.group), ['nvc', 'nvc', 'nvc', 'nvc', 'waiting', 'waiting', 'interview', 'interview', 'after']);
  assert.equal(byKey(phases).welcome_to_fees.label, 'Welcome letter → fees paid');
});

test('buildPhases headline phases equal intervals', async () => {
  const p = byKey(await build(Array.from({ length: 40 }, (_, i) => member(i, 300))));
  for (const k of ['dq_to_il', 'il_to_interview', 'interview_to_passport'])
    for (const f of ['median', 'p25', 'p75', 'n', 'window_days', 'suppressed', 'small_sample'])
      assert.equal(p[k][f], INTERVALS[k][f], `${k}.${f}`);
});

test('buildPhases drops capped and non-positive values', async () => {
  const rows = Array.from({ length: 40 }, (_, i) => member(i, 300));
  rows[0] = member(0, 300, { nvc_fees_paid: plus(rows[0].nvc_welcome_letter, 95) });        // above the 90-day cap
  rows[1] = member(1, 300, { nvc_docs_submitted: plus(rows[1].nvc_fees_paid, -4) });        // before fees paid
  rows[2] = member(2, 300, { nvc_docs_submitted: rows[2].nvc_fees_paid });                  // same day: 0
  const p = byKey(await build(rows));
  assert.equal(p.welcome_to_fees.n, 39);
  // rows 1 and 2, plus row 0: its later fees date now falls after its documents date
  assert.equal(p.fees_to_docs.n, 37);
  assert.equal(p.welcome_to_fees.median, 8);
});

test('buildPhases counts a resubmitting member once', async () => {
  const rows = Array.from({ length: 35 }, (_, i) => member(i, 300));
  const p = byKey(await build(rows));
  assert.equal(p.approval_to_welcome.n, 35);
});

test('buildPhases excludes expedited from standard phases', async () => {
  const rows = Array.from({ length: 40 }, (_, i) => member(i, 300, i < 4 ? { interview_expedited: true } : {}));
  const p = byKey(await build(rows));
  assert.equal(p.medical_to_interview.n, 36);
  assert.equal(p.il_to_medical.n, 36);
  assert.equal(p.approval_to_welcome.n, 40);
});
