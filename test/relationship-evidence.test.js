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

test('template has a financial and legal records section before the photos, with no photo needed', () => {
  const docs = tpl.indexOf('id="doc-table"');
  assert.ok(docs > -1 && docs < tpl.indexOf('id="ph-table"'));
  assert.match(tpl, /docs: \[/);
  assert.doesNotMatch(tpl, /when primary or secondary evidence does not exist or is unavailable/);
});

test('example leads with financial and legal records that have no photo', () => {
  const { DOC_TYPES } = require('../public/js/evidence-story.js');
  const docs = [...ex.matchAll(/<tr data-doc-chapter="([a-z]+)">([\s\S]*?)<\/tr>/g)];
  assert.equal(docs.length, 2);
  const keys = CHAPTERS.map(c => c.key);
  for (const [, key, row] of docs) {
    assert.ok(keys.includes(key), key);
    assert.doesNotMatch(row, /<svg|<img/);
    assert.ok(DOC_TYPES.some(d => row.includes(`<dt>Type</dt><dd>${d.title}</dd>`)), 'type from DOC_TYPES');
    for (const f of ['Issued by', 'Names on it', 'Where it is in your filing']) assert.match(row, new RegExp(`<dt>${f}</dt><dd>[^<]{5,}</dd>`));
  }
  const at = id => ex.indexOf(id);
  assert.ok(at('id="example-timeline"') < at('id="example-docs"') && at('id="example-docs"') < at('class="ev-photos"'));
  assert.match(ex, /\(Document 1\)/);
  assert.match(ex, /\(Document 2\)/);
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

const pc = fs.readFileSync(path.join(PUBLIC, 'tools/relationship-evidence/parent-child-example.html'), 'utf8');

test('parent-child example: timeline, then records, then photos', () => {
  const at = s => pc.indexOf(s);
  assert.ok(at('id="example-timeline"') > -1);
  assert.ok(at('id="example-timeline"') < at('id="example-docs"') && at('id="example-docs"') < at('class="ev-photos"'));
  assert.equal((pc.match(/Document \d of 5/g) || []).length, 5);
  assert.equal((pc.match(/Photo \d of 3/g) || []).length, 3);
});

test('parent-child example cites the bona fide parent-child rule and flags CRBA', () => {
  assert.match(pc, /8 CFR 204\.2\(d\)\(2\)\(iii\)/);
  assert.match(pc, /href="\/guide\/crba"/);
  assert.match(pc, /href="\/tools\/checklist-i130#family"/);
  assert.match(pc, /<link rel="canonical" href="https:\/\/www\.americanvisaguide\.com\/tools\/relationship-evidence\/parent-child-example">/);
});

test('parent-child example is linked from the builder, sidebar, checklist and sitemap', () => {
  const href = '/tools/relationship-evidence/parent-child-example';
  for (const f of ['tools/relationship-evidence.html', 'js/section-nav.js', 'tools/checklist-i130.html', 'js/checklist-data.js']) {
    assert.ok(fs.readFileSync(path.join(PUBLIC, f), 'utf8').includes(href), f);
  }
  assert.ok(fs.readFileSync(path.join(PUBLIC, 'sitemap.xml'), 'utf8').includes('https://www.americanvisaguide.com' + href));
});

const { PARENT_CHAPTERS, PARENT_DOC_TYPES, setFor } = require('../public/js/evidence-story.js');

test('parent and child chapters cover support, schooling and welfare', () => {
  assert.deepEqual(PARENT_CHAPTERS.map(c => c.key), ['birth', 'support', 'school', 'together', 'visits', 'welfare']);
  assert.deepEqual(PARENT_CHAPTERS.filter(c => c.optional).map(c => c.key), ['together', 'visits']);
  assert.ok(PARENT_CHAPTERS.every(c => c.layers.length >= 2));
  assert.equal(setFor('parent').chapters, PARENT_CHAPTERS);
  assert.equal(setFor('spouse').chapters, CHAPTERS);
  assert.equal(setFor(undefined).chapters, CHAPTERS);
});

test('parent document types lead with the birth certificate', () => {
  assert.equal(PARENT_DOC_TYPES[0].key, 'birthcert');
  assert.ok(PARENT_DOC_TYPES.every(d => d.title && d.examples));
});

test('parent timeline uses parent chapters; a spouse chapter falls to Other', () => {
  const t = buildTimeline(
    [{ chapter: 'school', date: '2018-07-14', what: 'Sports day' }, { chapter: 'met', date: '2020-01-01', what: 'Old row' }],
    [],
    [{ chapter: 'support', date: '2012-05-01', type: 'support' }],
    'parent');
  assert.deepEqual(t.map(g => g.key), ['support', 'school', 'other']);
  assert.equal(t[0].items[0].what, 'Financial support');
});

test('template shows every parent chapter in its own story table', () => {
  const table = (tpl.match(/<table[^>]*id="story-table-parent"[\s\S]*?<\/table>/) || [''])[0];
  for (const c of PARENT_CHAPTERS) assert.ok(table.includes(c.title) && c.layers.every(l => table.includes(l.replace('’', '&rsquo;'))), c.key);
});

test('template switches between spouse and parent and child', () => {
  assert.match(tpl, /<input type="radio" name="ev-kind" value="spouse" checked>/);
  assert.match(tpl, /<input type="radio" name="ev-kind" value="parent">/);
  assert.match(tpl, /body:not\(\[data-ev-kind="parent"\]\) \[data-kind="parent"\], body\[data-ev-kind="parent"\] \[data-kind="spouse"\] \{ display: none !important; \}/);
  assert.match(tpl, /kind: d\.kind === 'parent' \? 'parent' : 'spouse'/);
  assert.match(tpl, /the parent-child relationship between /);
  for (const kind of ['spouse', 'parent']) {
    assert.ok((tpl.match(new RegExp(`data-kind="${kind}"`, 'g')) || []).length >= 6, kind);
  }
});

test('parent-child example uses the builder\'s parent chapters and types', () => {
  const keys = PARENT_CHAPTERS.map(c => c.key);
  const rows = [...pc.matchAll(/<tr data-(?:doc-)?chapter="([a-z]+)">([\s\S]*?)<\/tr>/g)];
  assert.equal(rows.length, 8);
  for (const [, key, row] of rows) {
    assert.ok(keys.includes(key), key);
    const title = PARENT_CHAPTERS.find(c => c.key === key).title;
    assert.match(row, new RegExp(`<dt>Chapter</dt><dd>${title}</dd>`), key);
  }
  for (const [, , row] of rows.filter(r => r[0].includes('data-doc-chapter'))) {
    assert.ok(PARENT_DOC_TYPES.some(d => row.includes(`<dt>Type</dt><dd>${d.title}</dd>`)), 'type from PARENT_DOC_TYPES');
  }
  for (const c of PARENT_CHAPTERS.filter(c => c.key !== 'together')) assert.match(pc, new RegExp(`<h3>${c.title}</h3>`));
});

const sib = fs.readFileSync(path.join(PUBLIC, 'tools/relationship-evidence/sibling-example.html'), 'utf8');

test('sibling example: every fact in the chain points to a listed document', () => {
  const docs = [...sib.matchAll(/<div class="ev-num">Document (\d) of 7<\/div>/g)].map(m => Number(m[1]));
  assert.deepEqual(docs, [1, 2, 3, 4, 5, 6, 7]);
  const chain = (sib.match(/<table class="ev-table chain">[\s\S]*?<\/table>/) || [''])[0];
  const refs = [...chain.matchAll(/<span class="doc-ref">Document (\d)<\/span>/g)].map(m => Number(m[1])).sort();
  assert.deepEqual(refs, [1, 2, 3, 4, 5, 6, 7]);
  const at = s => sib.indexOf(s);
  assert.ok(at('id="example-chain"') < at('id="example-timeline"') && at('id="example-timeline"') < at('id="example-docs"'));
});

test('sibling example cites the common-father, name change and derivative rules', () => {
  for (const cite of ['8 CFR 204.2(g)(2)(i), (iv)', '8 CFR 204.2(g)(5)', '8 CFR 204.2(g)(1)', '8 CFR 204.2(g)(4)']) assert.ok(sib.includes(cite), cite);
  assert.match(sib, /href="\/tools\/relationship-evidence\/parent-child-example"/);
  assert.match(sib, /<link rel="canonical" href="https:\/\/www\.americanvisaguide\.com\/tools\/relationship-evidence\/sibling-example">/);
  assert.doesNotMatch(sib, /certified copies/);
});

test('sibling example is linked from the builder, sidebar, checklist and sitemap', () => {
  const href = '/tools/relationship-evidence/sibling-example';
  for (const f of ['tools/relationship-evidence.html', 'js/section-nav.js', 'tools/checklist-i130.html']) {
    assert.ok(fs.readFileSync(path.join(PUBLIC, f), 'utf8').includes(href), f);
  }
  assert.ok(fs.readFileSync(path.join(PUBLIC, 'sitemap.xml'), 'utf8').includes('https://www.americanvisaguide.com' + href));
});
