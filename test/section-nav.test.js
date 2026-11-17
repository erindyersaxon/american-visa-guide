// Guard for the shared section sidebar (public/js/section-nav.js): one link
// list per section, rendered as a rail on wide screens and an "In this
// section" fold-out on phones. Replaces the sidebars that were copied by hand
// into every guide and naturalization page (SITE_REVIEW_HANDOFF.md, N2).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const PUBLIC = path.join(__dirname, '..', 'public');
const { SECTIONS } = require('../public/js/section-nav.js');

function pages(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return ['pagefind', '_design-preview'].includes(e.name) ? [] : pages(p);
    return e.name.endsWith('.html') ? [p] : [];
  });
}
const urlOf = (file) => ('/' + path.relative(PUBLIC, file).split(path.sep).join('/'))
  .replace(/\.html$/, '').replace(/\/index$/, '') || '/';
const ALL = pages(PUBLIC).map((f) => ({ url: urlOf(f), html: fs.readFileSync(f, 'utf8') }));
const sectionOf = (html) => (html.match(/section-nav\.js\?v=[^"]*" data-section="([^"]+)"/) || [])[1];
const linksOf = (key) => SECTIONS[key].groups.flatMap((g) => g.links.filter((l) => l.href).map((l) => l.href));

// Pages in a section that are reached from a parent page, not the list.
const OFF_LIST = new Set(['/guide/delayed-i130/mandamus']);

// The Tools hub is itself the full list of tools, so it doesn't get the sidebar.
const NO_SIDEBAR = new Set(['/tools']);

test('every guide, naturalization and tool page uses the shared sidebar', () => {
  for (const { url, html } of ALL) {
    const top = url.split('/')[1];
    if (!['guide', 'naturalization', 'tools'].includes(top) || NO_SIDEBAR.has(url)) continue;
    assert.equal(sectionOf(html), top, `${url}: data-section="${top}"`);
    assert.match(html, /section-nav\.css\?v=/, `${url}: loads section-nav.css`);
    assert.match(html, /<body[^>]*class="[^"]*\bhas-snav\b/, `${url}: body.has-snav (no layout shift)`);
  }
});

test('no page keeps a hand-copied sidebar or floating section button', () => {
  for (const { url, html } of ALL) {
    assert.doesNotMatch(html, /<aside class="sidebar"/, `${url}: old sidebar`);
    assert.doesNotMatch(html, /id="mobileNavToggle"|id="mobileNavDrawer"/, `${url}: old phone drawer`);
  }
});

test('each section list includes every page that opts in to it', () => {
  for (const { url, html } of ALL) {
    const key = sectionOf(html);
    if (!key || OFF_LIST.has(url)) continue;
    assert.ok(SECTIONS[key], `${url}: unknown section "${key}"`);
    assert.ok(linksOf(key).includes(url), `${url}: missing from the ${key} list`);
  }
});

test('every internal link in a section list points at a real page', () => {
  const urls = new Set(ALL.map((p) => p.url));
  for (const key of Object.keys(SECTIONS)) {
    for (const href of linksOf(key)) {
      if (!href.startsWith('/')) continue;
      const bare = href.split(/[#?]/)[0];
      assert.ok(urls.has(bare), `${key}: ${href} has no page`);
    }
  }
});

test('group labels sort the evidence examples, and every label has links under it', () => {
  for (const key of Object.keys(SECTIONS)) {
    for (const g of SECTIONS[key].groups) {
      g.links.forEach((l, i) => {
        if (!l.group) return;
        assert.ok(!l.href, `${key}: a group label is not a link`);
        const next = g.links[i + 1];
        assert.ok(next && next.href && next.sub, `${key}: "${l.group}" has an indented link under it`);
      });
    }
  }
  const ex = SECTIONS.tools.groups.find((g) => g.heading === 'Stage 1: Evidence examples');
  assert.ok(ex, 'examples have their own heading');
  assert.deepEqual(ex.links.filter((l) => l.group).map((l) => l.group), ['Spouses', 'Children', 'Parents and siblings']);
  assert.equal(ex.links.filter((l) => l.href).length, 9);
  assert.ok(ex.links.filter((l) => l.href).every((l) => !/Example$/.test(l.text)), 'no repeated "Example"');
});
