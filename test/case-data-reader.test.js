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

// The 22-23 July 2026 glitch, as members' data shows it: an H008 added on
// 22 July but back-dated, and a copy of the IAF event that changes at every
// sign-in.
const glitchCase = (extraEvents = []) => JSON.stringify({ data: {
  receiptNumber: RECEIPT, formType: 'I-130', submissionDate: '2025-03-25',
  updatedAt: '2026-08-31', updatedAtTimestamp: '2026-08-31T22:28:33.758Z', documents: [],
  events: [
    { eventCode: 'IAF', createdAt: '2025-03-25', createdAtTimestamp: '2025-03-25T14:07:58.369Z',
      updatedAt: '2026-08-31', updatedAtTimestamp: '2026-08-31T22:28:33.758Z', eventDateTime: '2025-03-25', eventTimestamp: '2025-03-25T00:00:00.000Z' },
    { eventCode: 'H008', createdAt: '2026-07-22', createdAtTimestamp: '2026-07-22T23:25:23.499Z',
      updatedAt: '2026-07-22', updatedAtTimestamp: '2026-07-22T23:25:23.499Z', eventDateTime: '2026-05-21', eventTimestamp: '2026-05-21T12:21:00.000Z' },
    { eventCode: 'IAF', createdAt: '2025-03-25', createdAtTimestamp: '2025-03-25T12:00:23.501Z',
      updatedAt: '2025-03-25', updatedAtTimestamp: '2025-03-25T12:00:23.501Z', eventDateTime: '2025-03-25', eventTimestamp: '2025-03-25T00:00:00.000Z' },
    ...extraEvents,
  ] } });

test('an H008 added on 22 July 2026 is flagged as the system error, not an approval', () => {
  const s = reader.summarise(reader.parseInput(glitchCase()), codes);
  assert.deepEqual(s.h008, { glitch: ['2026-07-22'], other: [] });
  const h = s.events.find(e => e.code === 'H008');
  assert.equal(h.glitch, true);
  assert.equal(h.day, '2026-05-21');
  assert.equal(h.created, '2026-07-22');
  const words = reader.h008Paragraphs(s.h008).join(' ');
  assert.match(words, /22 July 2026/);
  assert.match(words, /system error/);
  assert.match(words, /approval notice, a PDF, in the Documents tab/);
  assert.doesNotMatch(words, /Members who were approved/);
});

test('a later H008 is described as what approvals looked like, still needing the notice', () => {
  const s = reader.summarise(reader.parseInput(glitchCase([
    { eventCode: 'H008', createdAt: '2026-11-21', createdAtTimestamp: '2026-11-21T13:59:00.832Z',
      updatedAt: '2026-11-21', eventDateTime: '2026-11-21', eventTimestamp: '2026-11-21T13:58:48.101Z' },
  ])), codes);
  assert.deepEqual(s.h008, { glitch: ['2026-07-22'], other: ['2026-11-21'] });
  const words = reader.h008Paragraphs(s.h008).join(' ');
  assert.match(words, /21 November 2026/);
  assert.match(words, /In members’ real approvals, a new H008 appeared/);
  assert.match(words, /H008 events from before July 2026 that did not come with an approval/);
  assert.match(words, /If there is no approval notice/);
});

test('every H008 summary ends with the approval notice rule and the Documents tab', () => {
  for (const h of [{ glitch: ['2026-07-23'], other: [] }, { glitch: [], other: ['2026-09-30'] }]) {
    const p = reader.h008Paragraphs(h);
    assert.deepEqual(p.slice(-2), [reader.APPROVAL_PROOF, reader.DOCUMENTS_TAB]);
  }
});

// A real approval as a member's data showed it (2025): FTA0, FTA0, then H008
// the next day, record closed, documents list still empty. Then KO when the
// case went to the State Department.
test('a real approval with KO gets the KO note, and still points to the Documents tab', () => {
  const approved = JSON.stringify({ data: {
    receiptNumber: RECEIPT, submissionDate: '2023-10-01', formType: 'I-130', updatedAt: '2025-01-29',
    updatedAtTimestamp: '2025-01-29T01:49:02.975Z', closed: true, documents: [],
    events: [
      { eventCode: 'KO', createdAt: '2025-02-03', eventDateTime: '2025-02-03' },
      { eventCode: 'H008', createdAt: '2025-01-29', createdAtTimestamp: '2025-01-29T01:49:03.294Z', updatedAt: '2025-01-29', eventDateTime: '2025-01-29' },
      { eventCode: 'FTA0', createdAt: '2025-01-28', updatedAt: '2025-01-28', eventDateTime: '2025-01-28' },
      { eventCode: 'FTA0', createdAt: '2025-01-07', updatedAt: '2025-01-07', eventDateTime: '2023-10-03' },
    ] } });
  const s = reader.summarise(reader.parseInput(approved), codes);
  assert.deepEqual(s.h008, { glitch: [], other: ['2025-01-29'] });
  assert.deepEqual(s.ko, ['2025-02-03']);
  assert.equal(s.events.find(e => e.code === 'KO').name, 'PETITION SHIPPED TO DOS AFTER APPROVAL OR REAFFIRMATION');
  const ko = reader.koParagraphs(s.ko).join(' ');
  assert.match(ko, /3 February 2025/);
  assert.match(ko, /approval notice in the Documents tab is still the confirmation/);
});

test('no H008, no H008 warning', () => {
  assert.equal(reader.summarise(reader.parseInput(cases), codes).h008, null);
});

test('the status title is read from the Office and status link, but never statusText', () => {
  const status = JSON.stringify({ data: { receiptNumber: RECEIPT, formType: 'I-130', currentActionCode: 'FTA0',
    currentActionCodeDate: '2026-11-06T15:31:10.448Z', statusTitle: 'Case Is Being Actively Reviewed By USCIS',
    statusText: `On November 6, 2026, we are actively reviewing your Form I-130, Receipt Number ${RECEIPT}.`,
    jurisdiction: 'NOR', jurisdictionDescription: 'NORFOLK, VA' } });
  const s = reader.summarise(reader.parseInput(status), codes);
  assert.deepEqual(s.status, { title: 'Case Is Being Actively Reviewed By USCIS', code: 'FTA0', day: '2026-11-06' });
  assert.doesNotMatch(JSON.stringify(s), new RegExp(RECEIPT));
});

test('codes missing from NIEM get the status members recorded with them', () => {
  const s = reader.summarise(reader.parseInput(JSON.stringify({ data: { events: [
    { eventCode: 'IMAG', createdAt: '2026-01-05', eventDateTime: '2026-01-05' },
    { eventCode: 'IKA', createdAt: '2026-01-02', eventDateTime: '2026-01-02' },
    { eventCode: 'ZZZ9', createdAt: '2026-01-01', eventDateTime: '2026-01-01' },
  ] } })), codes);
  const by = Object.fromEntries(s.events.map(e => [e.code, e]));
  assert.equal(by.IMAG.name, null);
  assert.equal(by.IMAG.reported, 'Biometrics appointment scheduled');
  assert.equal(by.IKA.reported, 'Request for initial evidence sent');
  assert.equal(by.ZZZ9.reported, null);
  assert.equal(reader.REPORTED_STATUS.H008, 'Case approved');
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
