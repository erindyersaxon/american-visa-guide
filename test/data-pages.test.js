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

test('/data/tracker-vs-uscis is an official page', () => checkTopicPage('/data/tracker-vs-uscis', 'official'));

test('comparison page shows members only by month and wait', () => {
  const html = read('data/tracker-vs-uscis.html');
  const pts = html.match(/const PTS = (\[\[[\s\S]*?\]\])/)[1];
  assert.doesNotMatch(pts, /\d{4}-\d{2}-\d{2}/);
  assert.equal(JSON.parse(pts).length, 184);
});

test('comparison page keeps the agreed heading and quarter table', () => {
  const html = read('data/tracker-vs-uscis.html');
  assert.match(html, /Our members wait <em>about as long as everyone else<\/em> for I-130 approval/);
  assert.match(html, /id="table-quarters"/);
  assert.match(html, /cdnjs\.cloudflare\.com\/ajax\/libs\/d3\/7\.8\.5\/d3\.min\.js/);
  assert.doesNotMatch(html, /#2a78d6|#eb6834/i, 'artifact palette replaced by section colours');
});

// Old links like /data#calculator are forwarded by js/data-anchors.js.
const ids = (html) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const SHELL = new Set(['nav-placeholder', 'main-content', 'page-title', 'footer-placeholder', 'data-notice']);
const anchorsJs = read('js/data-anchors.js');
const MOVED = Object.fromEntries([...anchorsJs.matchAll(/'([a-z0-9-]+)': '(\/data\/[a-z0-9-]+)(#[a-z0-9-]+)?'/g)].map((m) => [m[1], m[2]]));

test('the anchor map is loaded in the head of the landing page only', () => {
  const hub = read('data.html');
  assert.ok(hub.indexOf('/js/data-anchors.js') > 0 && hub.indexOf('/js/data-anchors.js') < hub.indexOf('</head>'));
  for (const url of [...MEMBER, ...OFFICIAL]) assert.ok(!read(fileFor(url)).includes('data-anchors.js'), url);
});

test('every moved anchor exists on its new page, and not on the landing page', () => {
  assert.ok(Object.keys(MOVED).length >= 50, 'map parsed');
  const hubIds = ids(read('data.html'));
  for (const [id, url] of Object.entries(MOVED)) {
    assert.ok(ids(read(fileFor(url))).has(id), `${url} is missing #${id}`);
    assert.ok(!hubIds.has(id), `#${id} is still on the landing page, so the redirect would hide it`);
  }
});

test('no id appears on two data pages', () => {
  const seen = new Map();
  for (const url of ORDER) {
    for (const id of ids(read(fileFor(url)))) {
      if (SHELL.has(id)) continue;
      assert.ok(!seen.has(id), `#${id} is on both ${seen.get(id)} and ${url}`);
      seen.set(id, url);
    }
  }
});

test('no link on the site points at a moved anchor on /data', () => {
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return ['pagefind', '_design-preview'].includes(e.name) ? [] : walk(p);
    return /\.(html|js)$/.test(e.name) && e.name !== 'data-anchors.js' ? [p] : [];
  });
  for (const file of walk(PUBLIC)) {
    for (const m of fs.readFileSync(file, 'utf8').matchAll(/\/data#([a-z0-9-]+)/g)) {
      assert.ok(!MOVED[m[1]], `${path.relative(PUBLIC, file)} links /data#${m[1]}; use ${MOVED[m[1]]}#${m[1]}`);
    }
  }
});

test('the landing page matches the approved copy', () => {
  const html = read('data.html');
  assert.match(html, /<html lang="en-GB"/);
  assert.match(html, /<h1[^>]*>London family visa data<\/h1>/);
  assert.match(html, /From members' own timelines, and from official reports by USCIS and the State Department\./);
  assert.match(html, /This section is updated as members share dates\./);
  assert.match(html, /What members are telling us/);
  assert.match(html, /What the official figures say/);
  assert.match(html, /<p class="dsx-status" id="data-status" role="status">/);
  assert.match(html, /section-nav\.js\?v=[^"]*" data-section="data"/);
  assert.match(html, /<main data-pagefind-body/);
  for (const url of [...MEMBER, ...OFFICIAL]) assert.match(html, new RegExp(`href="${url}"`), url);
  assert.doesNotMatch(html, /design preview|dm-preview-flag/i);
});

test('every data page is in the sitemap', () => {
  const sitemap = read('sitemap.xml');
  for (const url of ORDER) assert.ok(sitemap.includes(`<loc>https://www.americanvisaguide.com${url}</loc>`), url);
});

test('final review: chart colour tokens are defined for every page, not only #official-data', () => {
  const css = read('css/data-section.css');
  assert.match(css, /:root[^{}]*\{[^}]*--viz-s1:\s*#2170a8[^}]*--viz-s2:\s*#c0692f/);
});

test('final review: each official chart container has a text summary', () => {
  for (const [file, id] of [['data/i130-us.html', 'od-chart-approvals'], ['data/i130-us.html', 'od-chart-denials'], ['data/family-visas.html', 'od-chart-london'], ['data/family-visas.html', 'od-chart-visas']]) {
    assert.match(read(file), new RegExp(`<div class="od-chart" id="${id}" role="group" aria-label="[^"]{30,}"`), `${file} #${id}`);
  }
});

test('final review: the topic pages\' skip link shows when focused', () => {
  assert.match(read('css/data-section.css'), /\.skip-to-main:focus\s*\{[^}]*top:\s*0\s*!important/);
});

test('final review: member pages count days ago the same way as the status line', () => {
  const js = read('js/data-pages.js');
  assert.match(js, /AVGDataStatus\.daysSince\(/);
  assert.doesNotMatch(js, /Date\.now\(\) - d\.getTime\(\)/);
});
