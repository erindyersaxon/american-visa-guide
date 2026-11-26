// The /data section: a landing page plus six topic pages
// (docs/superpowers/specs/2026-11-26-data-section-split-design.md).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const PUBLIC = path.join(__dirname, '..', 'public');
const read = (p) => fs.readFileSync(path.join(PUBLIC, p), 'utf8');

test('the data page loads the shared scripts and keeps no inline data script', () => {
  const html = read('data.html');
  assert.match(html, /\/js\/data-status\.js\?v=/);
  assert.match(html, /\/js\/data-pages\.js\?v=/);
  assert.doesNotMatch(html, /<script type="module">/);
  assert.doesNotMatch(html, /function fromApiData/);
});

test('the shared data script carries no usernames in its fallback', () => {
  const js = read('js/data-pages.js');
  assert.doesNotMatch(js, /\b(user_?name|reddit_?name|discord_?name|display_?name)\b/i);
});

test('the shared data script uses the status line and marks fallback figures', () => {
  const js = read('js/data-pages.js');
  assert.match(js, /AVGDataStatus\.statusLine/);
  assert.match(js, /These are the last figures we could load\./);
  assert.match(js, /Live from timelines members share\. These figures load each time you open the page\./);
});

const fileFor = (url) => url.slice(1) + '.html';
const MEMBER = ['/data/interview-letters', '/data/wait-times', '/data/interviews'];
const OFFICIAL = ['/data/i130-us', '/data/family-visas', '/data/tracker-vs-uscis'];
const ORDER = ['/data', ...MEMBER, ...OFFICIAL];

function checkTopicPage(url, kind) {
  const html = read(fileFor(url));
  assert.match(html, /<html lang="en-GB"/, `${url}: lang`);
  assert.match(html, /section-nav\.js\?v=[^"]*" data-section="data"/, `${url}: sidebar`);
  assert.match(html, /<body[^>]*class="[^"]*\bhas-snav\b/, `${url}: has-snav`);
  assert.match(html, /class="avg-crumbs"[\s\S]*?href="\/data"/, `${url}: breadcrumb to /data`);
  const tag = kind === 'members' ? /class="dsx-tag dsx-tag--members"[^>]*>[\s\S]*?From members/ : /class="dsx-tag dsx-tag--official"[^>]*>[\s\S]*?From official reports/;
  assert.match(html, tag, `${url}: group tag`);
  assert.match(html, kind === 'members' ? /class="dsx-source" data-live/ : /class="dsx-source">[^<]+</, `${url}: source line`);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${url}: one h1`);
  assert.match(html, /<main data-pagefind-body/, `${url}: searchable`);
  // previous / next follow the sidebar order
  const i = ORDER.indexOf(url);
  assert.match(html, new RegExp(`class="stage-prevnext"[\\s\\S]*?class="prev" href="${ORDER[i - 1]}"`), `${url}: prev`);
  if (ORDER[i + 1]) assert.match(html, new RegExp(`class="next" href="${ORDER[i + 1]}"`), `${url}: next`);
}

for (const url of MEMBER) test(`${url} is a member page`, () => checkTopicPage(url, 'members'));

test('member pages hold the sections moved from /data', () => {
  const has = (url, ids) => { const h = read(fileFor(url)); for (const id of ids) assert.match(h, new RegExp(`id="${id}"`), `${url} #${id}`); };
  has('/data/interview-letters', ['il-banner', 'm-last-drop', 'il-latest-dq', 'm-interview-range', 'drops-hd', 'drops-tbody', 'backlog-hd', 'backlog-tbody', 'bk-note']);
  has('/data/wait-times', ['pipeline-hd', 'phases-hd', 'phase-cards', 'calculator', 'calc-hd', 'passport-result']);
  has('/data/interviews', ['outcomes-hd', 'o-approved', 'o-denied', 'passport-hd', 'pp-pickup', 'pp-mail']);
  assert.match(read('data/wait-times.html'), /\/js\/data-calculator\.js\?v=/);
  for (const url of MEMBER) assert.match(read(fileFor(url)), /\/js\/data-pages\.js\?v=/, `${url}: live data`);
});

test('the official chart script starts on any page with a chart', () => {
  const js = read('js/official-data-charts.js');
  assert.doesNotMatch(js, /getElementById\('official-data'\)\) return/);
  assert.match(js, /querySelector\('\.od-chart'\)/);
  assert.match(js, /function londonChart\(host, data\)/);
});

test('the London table matches the collected State Department file', () => {
  const csv = fs.readFileSync(path.join(__dirname, '..', 'data/official-stats/london_issuances.csv'), 'utf8').trim().split('\n').slice(1);
  const html = read('data/family-visas.html');
  const table = html.slice(html.indexOf('id="od-london-table"'));
  const rows = [...table.matchAll(/<tr><th[^>]*>([A-Z][a-z]{2} \d{4})<\/th><td[^>]*>([\d,]+)<\/td>/g)].slice(0, csv.length);
  assert.equal(rows.length, csv.length, 'one row per month');
  csv.forEach((line, i) => {
    const [month, , , spouse] = line.split(',');
    const label = new Date(month + '-01T00:00:00Z').toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' }).replace('Sept', 'Sep');
    assert.equal(rows[i][1], label, `row ${i} month`);
    assert.equal(Number(rows[i][2].replace(/,/g, '')), Number(spouse), `${label} spouse visas`);
  });
});

for (const url of ['/data/i130-us', '/data/family-visas']) test(`${url} is an official page`, () => checkTopicPage(url, 'official'));

test('official pages hold the sections moved from /data', () => {
  const has = (url, ids) => { const h = read(fileFor(url)); for (const id of ids) assert.match(h, new RegExp(`id="${id}"`), `${url} #${id}`); };
  has('/data/i130-us', ['official-data', 'official-hd', 'od-chart-approvals', 'od-chart-denials', 'od-ir-table', 'od-ir-cap', 'od-fp-table', 'od-fp-cap']);
  has('/data/family-visas', ['od-london-table', 'od-london-cap', 'od-chart-london', 'od-chart-visas', 'od-iv-table', 'od-iv-cap']);
  for (const url of ['/data/i130-us', '/data/family-visas']) assert.match(read(fileFor(url)), /\/js\/official-data-charts\.js\?v=/, url);
});
