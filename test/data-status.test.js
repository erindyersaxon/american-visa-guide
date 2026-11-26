// The one-line interview letter status on the /data landing page
// (docs/superpowers/specs/2026-11-26-data-section-split-design.md, "The status line").
const test = require('node:test');
const assert = require('node:assert/strict');
const { statusLine } = require('../public/js/data-status.js');

const d = (s) => new Date(s + 'T00:00:00Z');
const today = d('2026-11-26');
const drops = [{ drop_date: '2026-07-14', dq_date_to: '2026-04-14' }];
const win = (start, end) => ({ next_drop_window_start: start, next_drop_window_end: end });

test('delayed: the window passed with no drop', () => {
  const r = statusLine(drops, win('2026-10-01', '2026-10-15'), today);
  assert.equal(r.lead, 'No new interview letters yet.');
  assert.equal(r.rest, 'London last sent letters on 14 July 2026, 135 days ago.');
});

test('in range: today is inside the window', () => {
  const r = statusLine(drops, win('2026-11-20', '2026-12-05'), today);
  assert.equal(r.lead, 'Letters could go out any day.');
  assert.equal(r.rest, 'London last sent letters on 14 July 2026, 135 days ago.');
});

test('approaching: the window starts within 7 days', () => {
  const r = statusLine(drops, win('2026-11-30', '2026-12-10'), today);
  assert.equal(r.lead, 'Letters may go out soon.');
  assert.equal(r.rest, 'Members expect the next batch from 30 November 2026. London last sent letters on 14 July 2026.');
});

test('outside: the window is more than 7 days away', () => {
  const r = statusLine(drops, win('2026-12-20', '2027-01-05'), today);
  assert.equal(r.lead, 'No letters expected yet.');
  assert.equal(r.rest, 'London last sent letters on 14 July 2026, 135 days ago. Members expect the next batch from 20 December 2026.');
});

test('a drop in the last 7 days wins over any window state', () => {
  const r = statusLine([{ drop_date: '2026-11-24', dq_date_to: '2026-08-20' }, ...drops], win('2026-11-20', '2026-12-05'), today);
  assert.equal(r.lead, 'New interview letters went out on 24 November 2026.');
  assert.equal(r.rest, 'They covered cases ready by 20 August 2026.');
});

test('a drop exactly 7 days ago still counts as new', () => {
  const r = statusLine([{ drop_date: '2026-11-19', dq_date_to: '2026-08-01' }], {}, today);
  assert.equal(r.lead, 'New interview letters went out on 19 November 2026.');
});

test('a drop 8 days ago reads as days ago', () => {
  const r = statusLine([{ drop_date: '2026-11-18', dq_date_to: '2026-08-01' }], {}, today);
  assert.equal(r.lead, 'No letters expected yet.');
  assert.equal(r.rest, 'London last sent letters on 18 November 2026, 8 days ago.');
});

test('no window estimated: still a full sentence', () => {
  const r = statusLine(drops, {}, today);
  assert.equal(r.lead, 'No letters expected yet.');
  assert.equal(r.rest, 'London last sent letters on 14 July 2026, 135 days ago.');
});

test('no drops at all: no undefined or NaN', () => {
  const r = statusLine([], win('2026-10-01', '2026-10-15'), today);
  assert.equal(r.lead, 'No new interview letters yet.');
  assert.equal(r.rest, "We don't have a date for London's last letters yet.");
  assert.doesNotMatch(r.lead + r.rest, /undefined|NaN|null/);
});

test('missing stats object is tolerated', () => {
  const r = statusLine(drops, null, today);
  assert.equal(r.lead, 'No letters expected yet.');
});

test('daysSince counts whole days to UTC midnight, the same way as the status line', () => {
  const { daysSince } = require('../public/js/data-status.js');
  assert.equal(daysSince('2026-07-14', today), 135);
  assert.equal(daysSince('2026-07-14T00:00:00Z', today), 135);
  assert.equal(daysSince(null, today), null);
});
