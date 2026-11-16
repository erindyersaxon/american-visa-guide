// Public charge was one long page until 15 Nov 2026 (SITE_ARCHITECTURE_REVIEW.md
// step 7). Old links like /public-charge#i864 are sent to the new page by
// js/public-charge-anchors.js. These tests keep that map honest.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const PUBLIC = path.join(__dirname, '..', 'public');
const read = (p) => fs.readFileSync(path.join(PUBLIC, p), 'utf8');
const ids = (html) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const fileFor = (url) => url.slice(1) + '.html';

const anchorsJs = read('js/public-charge-anchors.js');
const MOVED = Object.fromEntries([...anchorsJs.matchAll(/'([a-z0-9-]+)': '(\/public-charge\/[a-z-]+)'/g)].map((m) => [m[1], m[2]]));
const TOPIC = ['/public-charge', ...new Set(Object.values(MOVED))];

test('the anchor map is loaded in the head of the overview only', () => {
  const hub = read('public-charge.html');
  assert.ok(hub.indexOf('/js/public-charge-anchors.js') < hub.indexOf('</head>'));
  for (const url of TOPIC.slice(1)) {
    assert.ok(!read(fileFor(url)).includes('public-charge-anchors.js'), url);
  }
});

test('every moved anchor exists on its new page, and not on the overview', () => {
  assert.ok(Object.keys(MOVED).length >= 20, 'map parsed');
  const hubIds = ids(read('public-charge.html'));
  for (const [id, url] of Object.entries(MOVED)) {
    assert.ok(ids(read(fileFor(url))).has(id), `${url} is missing #${id}`);
    assert.ok(!hubIds.has(id), `#${id} is still on the overview, so the redirect would hide it`);
  }
});

test('no id appears on two public charge pages', () => {
  const seen = new Map();
  for (const url of TOPIC) {
    for (const id of ids(read(fileFor(url)))) {
      if (id === 'main') continue;
      assert.ok(!seen.has(id), `#${id} is on both ${seen.get(id)} and ${url}`);
      seen.set(id, url);
    }
  }
});

test('no link on the site points at a moved anchor on the overview', () => {
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === 'pagefind' ? [] : walk(p);
    return /\.(html|js)$/.test(e.name) && e.name !== 'public-charge-anchors.js' ? [p] : [];
  });
  for (const file of walk(PUBLIC)) {
    for (const m of fs.readFileSync(file, 'utf8').matchAll(/\/public-charge#([a-z0-9-]+)/g)) {
      assert.ok(!MOVED[m[1]], `${path.relative(PUBLIC, file)} links /public-charge#${m[1]}; use ${MOVED[m[1]]}#${m[1]}`);
    }
  }
});

test('every topic page uses the public charge sidebar and is in the sitemap', () => {
  const sitemap = read('sitemap.xml');
  for (const url of [...TOPIC, '/public-charge/statement']) {
    assert.match(read(fileFor(url)), /data-section="public-charge"/, url);
    assert.ok(sitemap.includes(`<loc>https://www.americanvisaguide.com${url}</loc>`), `${url} in sitemap`);
  }
});
