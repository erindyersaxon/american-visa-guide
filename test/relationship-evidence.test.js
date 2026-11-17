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
