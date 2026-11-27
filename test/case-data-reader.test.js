// The myUSCIS case data reader (/tools/case-data-reader): parsing what a
// member pastes, and the summary it shows. Sample data follows the shapes
// members have posted, with a made-up receipt number.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const reader = require('../public/js/case-data-reader.js');
const codes = require('../public/js/niem-codes.js');

const RECEIPT = 'IOE0000000001';

const receiptInfo = JSON.stringify({ data: { receipt_details: {
  form: 'I-130', location: 'FOD', milnatz: 0, onpt: 0, premproc: 0,
  receipt_date: 'Fri, 15 Aug 2025 00:00:00 GMT', receipt_number: RECEIPT, subtype: '134A-IR' } },
  message: `Query was successful for payload {'receipt_number': '${RECEIPT}'}` });

const caseStatus = (code, name) => JSON.stringify({ data: { receiptNumber: RECEIPT, jurisdiction: code, jurisdictionDescription: name } });

const cases = JSON.stringify({ data: {
  receiptNumber: RECEIPT, formType: 'I-130', formName: 'Petition for Alien Relative',
  submissionDate: '2025-06-27', submissionTimestamp: '2025-06-27T00:00:00.000Z',
  updatedAt: '2026-11-17', updatedAtTimestamp: '2026-11-17T15:07:00.000Z',
  events: [
    { receiptNumber: RECEIPT, eventId: 'a', eventCode: 'IAF', createdAt: '2025-06-27', createdAtTimestamp: '2025-06-27T14:02:14.088Z',
      updatedAt: '2025-06-27', updatedAtTimestamp: '2025-06-27T14:02:14.088Z', eventDateTime: '2025-06-27', eventTimestamp: '2025-06-27T14:02:14.088Z' },
    { receiptNumber: RECEIPT, eventId: 'b', eventCode: 'FTA0', createdAt: '2026-11-06', createdAtTimestamp: '2026-11-06T15:31:12.645Z',
      updatedAt: '2026-11-06', updatedAtTimestamp: '2026-11-06T15:31:12.645Z', eventDateTime: '2026-11-06', eventTimestamp: '2026-11-06T15:31:10.448Z' },
    { receiptNumber: RECEIPT, eventId: 'c', eventCode: 'FTA1', createdAt: '2026-11-07', eventDateTime: '2026-11-07' },
  ] } });

test('receipt numbers are cleaned and checked', () => {
  assert.equal(reader.normaliseReceipt(' ioe 0000000001 '), RECEIPT);
  assert.equal(reader.normaliseReceipt('IOE123'), null);
  assert.deepEqual(reader.linksFor('nope'), []);
  const links = reader.linksFor(RECEIPT);
  assert.equal(links.length, 3);
  for (const l of links) {
    assert.ok(l.url.startsWith('https://my.uscis.gov/'), l.url);
    assert.ok(l.url.endsWith('/' + RECEIPT), l.url);
  }
});

test('several pasted responses are split and sorted by kind', () => {
  const p = reader.parseInput(`${receiptInfo}\n\n${caseStatus('NOR', 'NORFOLK, VA')}\n${cases}`);
  assert.equal(p.unreadable, 0);
  assert.ok(p.docs.receiptInfo && p.docs.caseStatus && p.docs.cases);
});

test('braces inside strings do not break the split', () => {
  const parts = reader.splitJson('{"a":"}{"} {"b":"\\"}"}');
  assert.deepEqual(parts.map(s => JSON.parse(s)), [{ a: '}{' }, { b: '"}' }]);
});

test('a field office jurisdiction is reported as a field office', () => {
  const s = reader.summarise(reader.parseInput(caseStatus('NOR', 'NORFOLK, VA') + receiptInfo), codes);
  assert.deepEqual(s.office, { code: 'NOR', name: 'NORFOLK, VA', kind: 'field-office' });
  assert.equal(s.location, 'FOD');
  assert.match(reader.officeSentence(s.office).title, /field office: NORFOLK, VA \(NOR\)/);
});

test('FOD with a service center says FOD alone does not mean it moved', () => {
  const s = reader.summarise(reader.parseInput(caseStatus('NSC', 'NEBRASKA SERVICE CENTER') + receiptInfo), codes);
  assert.equal(s.office.kind, 'service-center');
  const words = reader.locationSentence(s.location, s.office);
  assert.match(words, /does not mean your petition has reached a field office/);
  assert.match(words, /still names a service center/);
});

test('an office we cannot place is not guessed', () => {
  assert.equal(reader.officeKind('VBI', 'VIRTUAL OFFICE'), 'unknown');
  assert.match(reader.officeSentence({ code: 'VBI', name: 'VIRTUAL OFFICE', kind: 'unknown' }).text, /do not know/);
});

test('events get their published names, and unknown codes stay unknown', () => {
  const s = reader.summarise(reader.parseInput(cases), codes);
  assert.equal(s.form, 'I-130');
  assert.equal(s.received, '2025-06-27');
  assert.deepEqual(s.events.map(e => e.code), ['FTA1', 'FTA0', 'IAF']);
  const byCode = Object.fromEntries(s.events.map(e => [e.code, e]));
  assert.equal(byCode.FTA0.name, 'DATABASE CHECKS RECEIVED');
  assert.equal(byCode.IAF.name, 'RECEIPT LETTER EMAILED');
  assert.equal(byCode.FTA1.name, null);
});

test('a record change after the latest event is flagged, with dates', () => {
  const s = reader.summarise(reader.parseInput(cases), codes);
  assert.deepEqual(s.silentUpdate, { updated: '2026-11-17', latestEvent: '2026-11-07' });
  assert.equal(reader.formatDay('2026-11-17'), '17 November 2026');
});

test('no silent update when the record last changed on the latest event day', () => {
  const same = JSON.parse(cases);
  same.data.updatedAt = '2026-11-07';
  same.data.updatedAtTimestamp = '2026-11-07T20:00:00.000Z';
  const s = reader.summarise(reader.parseInput(JSON.stringify(same)), codes);
  assert.equal(s.silentUpdate, null);
});

test('an event changed after it was created counts as the latest activity', () => {
  const ev = JSON.parse(cases);
  ev.data.events[0].updatedAt = '2026-11-17';
  ev.data.events[0].updatedAtTimestamp = '2026-11-17T13:18:51.540Z';
  const s = reader.summarise(reader.parseInput(JSON.stringify(ev)), codes);
  assert.equal(s.events.find(e => e.code === 'IAF').changed, '2026-11-17');
  assert.equal(s.silentUpdate, null);
});

test('Access Denied is recognised', () => {
  const s = reader.summarise(reader.parseInput('{"error":"Access Denied"}'), codes);
  assert.equal(s.accessDenied, true);
  assert.equal(s.found.cases, false);
});

test('text that is not case data is counted as unreadable', () => {
  assert.equal(reader.parseInput('hello').unreadable, 1);
  assert.equal(reader.parseInput('{"foo": 1}').unreadable, 1);
  assert.equal(reader.parseInput('{"broken": ').unreadable, 1);
});

test('the reader page keeps third-party tools and network calls out', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'tools', 'case-data-reader.html'), 'utf8');
  assert.match(html, /<html[^>]*\sdata-no-trackers/);
  const js = fs.readFileSync(path.join(__dirname, '..', 'public', 'js', 'case-data-reader.js'), 'utf8');
  assert.doesNotMatch(js, /fetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|innerHTML/);
  const consent = fs.readFileSync(path.join(__dirname, '..', 'public', 'js', 'consent.js'), 'utf8');
  assert.match(consent, /data-no-trackers/);
});
