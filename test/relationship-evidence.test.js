// Relationship evidence "tell it as a story": the shared chapter list, the
// timeline builder, and the pages that use them.
// Plan: docs/superpowers/plans/2026-11-17-relationship-evidence-story.md
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const PUBLIC = path.join(__dirname, '..', 'public');
const { CHAPTERS, buildTimeline } = require('../public/js/evidence-story.js');

test('chapters in story order', () => {
  assert.deepEqual(CHAPTERS.map(c => c.key), ['met', 'dating', 'engaged', 'wedding', 'home', 'children', 'after']);
  assert.deepEqual(CHAPTERS.filter(c => c.optional).map(c => c.key), ['home', 'children']);
  assert.ok(CHAPTERS.every(c => c.layers.length >= 2));
});

test('groups by chapter, sorts by date, drops empty chapters', () => {
  const t = buildTimeline(
    [{ chapter: 'wedding', date: '2024-04-06', what: 'Wedding' }, { chapter: 'met', date: '2022-06-03', what: 'Met', backup: 'Tickets' }],
    [{ chapter: 'met', date: '2022-06-02', what: 'Plans' }]);
  assert.deepEqual(t.map(g => g.key), ['met', 'wedding']);
  assert.deepEqual(t[0].items.map(i => [i.kind, i.n, i.date]), [['message', 1, '2022-06-02'], ['photo', 2, '2022-06-03']]);
  assert.equal(t[0].items[1].backup, 'Tickets');
});

test('old saved rows with no chapter go to Other, last', () => {
  const t = buildTimeline([{ date: '2023-01-01', what: 'Old row', imgs: [] }, { chapter: 'met', date: '2022-01-01', what: 'x' }], []);
  assert.deepEqual(t.map(g => g.key), ['met', 'other']);
  assert.equal(t[1].items[0].backup, '');
});

test('blank dates sort last within a chapter', () => {
  const t = buildTimeline([{ chapter: 'dating', what: 'undated' }, { chapter: 'dating', date: '2022-08-20', what: 'dated' }], []);
  assert.deepEqual(t[0].items.map(i => i.what), ['dated', 'undated']);
});

test('blank rows and empty input give no groups', () => {
  assert.deepEqual(buildTimeline([{ imgs: [], who: '', date: '', where: '', what: '' }], []), []);
  assert.deepEqual(buildTimeline([], []), []);
});

const tpl = fs.readFileSync(path.join(PUBLIC, 'tools/relationship-evidence.html'), 'utf8');

test('template shows every chapter in the story table', () => {
  const table = (tpl.match(/<table[^>]*id="story-table"[\s\S]*?<\/table>/) || [''])[0];
  for (const c of CHAPTERS) assert.ok(table.includes(c.title) && c.layers.every(l => table.includes(l)), c.key);
});

test('template loads the story module and has a timeline section', () => {
  assert.match(tpl, /<script src="\/js\/evidence-story\.js\?v=[0-9a-z]+"><\/script>/);
  assert.match(tpl, /id="timeline-section"/);
  assert.match(tpl, /'avg-relationship-evidence-v1'/);
});

test('template never parses user text as HTML', () => {
  const sets = [...tpl.matchAll(/innerHTML\s*=\s*([^;]+);/g)].map(m => m[1].trim());
  assert.deepEqual(sets.filter(v => v !== "''"), []);
});

const ex = fs.readFileSync(path.join(PUBLIC, 'tools/relationship-evidence/example.html'), 'utf8');

test('example rows are in chapters and backed up', () => {
  const rows = [...ex.matchAll(/<tr data-chapter="([a-z]+)">[\s\S]*?<\/tr>/g)];
  assert.equal(rows.length, 8);
  const keys = CHAPTERS.map(c => c.key);
  for (const [row, key] of rows) {
    assert.ok(keys.includes(key), key);
    assert.match(row, /<dt>Backed up by<\/dt><dd>[^<]{10,}<\/dd>/);
  }
  assert.ok(!rows.some(r => ['home', 'children'].includes(r[1])));
  assert.match(ex, /skip those chapters/);
  assert.match(ex, /id="example-timeline"/);
});

test('checklists link to the story guide, not the old URL', () => {
  const data = fs.readFileSync(path.join(PUBLIC, 'js/checklist-data.js'), 'utf8');
  assert.ok(!data.includes('href=\\"/relationship-evidence-template'));
  assert.match(data, /\/tools\/relationship-evidence#story/);
  assert.match(fs.readFileSync(path.join(PUBLIC, 'tools/checklist-i130.html'), 'utf8'), /relationship-evidence#story/);
});

test('document types follow the USCIS list, strongest first', () => {
  const { DOC_TYPES } = require('../public/js/evidence-story.js');
  assert.deepEqual(DOC_TYPES.map(d => d.key), ['property', 'lease', 'finances', 'children', 'other']);
  assert.ok(DOC_TYPES.every(d => d.title && d.examples));
});

test('documents reach the timeline with no photo, first on a shared date', () => {
  const t = buildTimeline(
    [{ chapter: 'home', date: '2025-01-10', what: 'Moving day' }],
    [],
    [{ chapter: 'home', date: '2025-01-10', type: 'lease', issuer: 'Foxtons' }, { chapter: 'home', date: '2025-02-01', type: 'finances', what: 'Joint Monzo account opened' }]);
  assert.deepEqual(t[0].items.map(i => [i.kind, i.n]), [['document', 1], ['photo', 1], ['document', 2]]);
  assert.equal(t[0].items[0].what, 'Lease showing you live together');
  assert.equal(t[0].items[2].what, 'Joint Monzo account opened');
});

test('a document row with only a type or issuer is not blank', () => {
  assert.equal(buildTimeline([], [], [{ chapter: 'home', type: 'lease' }]).length, 1);
  assert.equal(buildTimeline([], [], [{ chapter: 'home', issuer: 'Barclays' }]).length, 1);
  assert.deepEqual(buildTimeline([], [], [{ chapter: 'home' }]), []);
});

test('template has a joint documents section before the photos, with no photo needed', () => {
  const docs = tpl.indexOf('id="doc-table"');
  assert.ok(docs > -1 && docs < tpl.indexOf('id="ph-table"'));
  assert.match(tpl, /docs: \[/);
  assert.doesNotMatch(tpl, /when primary or secondary evidence does not exist or is unavailable/);
});

test('review: a row with only who and where still appears in the timeline', () => {
  const t = buildTimeline([{ chapter: 'met', who: 'Sam and Priya', where: 'London' }], []);
  assert.deepEqual(t.map(g => g.key), ['met']);
});

test('review: example affidavits come from people who saw the event', () => {
  const row4 = [...ex.matchAll(/<tr data-chapter="([a-z]+)">[\s\S]*?<\/tr>/g)][3][0];
  assert.doesNotMatch(row4, /affidavit/i);
  assert.doesNotMatch(ex, /called him/);
  assert.doesNotMatch(tpl, /I was there when Sam proposed/);
});

test('review: example notice date does not imply an unlisted trip', () => {
  assert.doesNotMatch(ex, /Notice of marriage given at Leeds Register Office in February 2024/);
});
