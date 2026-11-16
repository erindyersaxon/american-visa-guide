// Breadcrumbs must match the URL hierarchy (SITE_ARCHITECTURE_REVIEW.md
// step 6). Every link in a page's breadcrumb trail must point at an address
// above the page, in order: /interview/221g/green-sheet may show Home ›
// Interview › 221(g), because /interview and /interview/221g sit above it.
// This replaces generating crumbs at runtime: they stay static HTML (works
// without JavaScript, readable by search engines) and this test catches drift.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const PUBLIC = path.join(__dirname, '..', 'public');

// Known exceptions, each with the reason. Remove an entry once the page moves.
const EXCEPTIONS = {
  // Lives at /glossary because every section links to it; listed under Guide.
  '/glossary': 'site-wide page, filed under the Guide',
  // Optional branches of Stage 1 (indented under it in the guide sidebar);
  // their crumb shows Stage 1 as the parent although they sit beside it.
  '/guide/crba': 'branch of Stage 1',
  '/guide/delayed-i130': 'branch of Stage 1',
};

function pages(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return ['pagefind', '_design-preview'].includes(e.name) ? [] : pages(p);
    return e.name.endsWith('.html') ? [p] : [];
  });
}

function urlOf(file) {
  const rel = '/' + path.relative(PUBLIC, file).split(path.sep).join('/');
  return rel.replace(/\.html$/, '').replace(/\/index$/, '') || '/';
}

function crumbLinks(html) {
  const m = html.match(/<nav class="avg-crumbs"[^>]*>([\s\S]*?)<\/nav>/);
  if (!m) return null;
  const links = [...m[1].matchAll(/<a href="([^"#?]*)/g)].map((x) => x[1]);
  const current = /aria-current="page"/.test(m[1]);
  return { links, current };
}

const isAbove = (parent, url) => parent === '/' || url.startsWith(parent + '/');

const all = pages(PUBLIC).map((file) => ({ file, url: urlOf(file), html: fs.readFileSync(file, 'utf8') }));
const withCrumbs = all.filter((p) => crumbLinks(p.html));

test('pages with breadcrumbs exist', () => {
  assert.ok(withCrumbs.length > 40, `only ${withCrumbs.length} pages have breadcrumbs`);
});

for (const page of withCrumbs) {
  test(`breadcrumb matches URL: ${page.url}`, () => {
    const { links, current } = crumbLinks(page.html);
    assert.ok(current, 'last crumb should be the current page (aria-current="page")');
    assert.equal(links[0], '/', 'first crumb should be Home (/)');
    if (EXCEPTIONS[page.url]) return;

    let previous = '/';
    for (const href of links.slice(1)) {
      assert.ok(isAbove(href, page.url),
        `crumb ${href} is not above ${page.url}; move the page under it or fix the crumb`);
      assert.ok(isAbove(previous, href), `crumb ${href} is out of order after ${previous}`);
      previous = href;
    }
  });
}

test('every exception still exists and still needs to be one', () => {
  for (const url of Object.keys(EXCEPTIONS)) {
    const page = all.find((p) => p.url === url);
    assert.ok(page, `${url} no longer exists; remove it from EXCEPTIONS`);
  }
});
