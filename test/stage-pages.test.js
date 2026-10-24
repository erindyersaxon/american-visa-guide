// Guard for the guide stage pages and the /guide hub: they stay on the shared
// guide-article components, carry no stray inline styles, and keep every anchor
// ID that Discord links depend on.
// Spec: docs/superpowers/specs/2026-10-25-stage-pages-migration-design.md
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const PUBLIC = process.env.STAGE_PAGES_ROOT || path.join(__dirname, '..', 'public');
const snapshot = require('./fixtures/stage-ids.json');
const allowlist = require('./fixtures/stage-inline-allowlist.json');

const PAGES = ['guide.html', ...['after-interview', 'before-you-leave', 'crba', 'delayed-i130', 'i130',
  'interview-letter', 'interview', 'medical', 'nvc', 'us-entry', 'waiting'].map(p => `guide/${p}.html`)];
const OLD = ['info-card', 'info-card-head', 'stage-h1', 'stage-meta', 'stage-bottomline', 'stage-actions',
  'warning', 'tip']; // old .info-card modifiers: callouts use callout-warn / callout-good

// Attribute values in any quoting: "x", 'x' or bare x
const attrValues = (html, name) => [...html.matchAll(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'gi'))]
  .map(m => m[1] ?? m[2] ?? m[3]);
const version = (html, file) => (html.match(new RegExp(`/css/${file}\\?v=([0-9a-z]+)`)) || [])[1];

for (const page of PAGES) {
  test(`stage page ${page}`, () => {
    const html = fs.readFileSync(path.join(PUBLIC, page), 'utf8');

    const allowed = new Set(allowlist.filter(a => a.page === page).map(a => a.style));
    const styles = attrValues(html, 'style');
    assert.deepEqual(styles.filter(s => !allowed.has(s)), [], `${page}: inline styles`);

    const classTokens = attrValues(html, 'class').flatMap(v => v.split(/\s+/));
    assert.deepEqual(classTokens.filter(t => OLD.includes(t)), [], `${page}: old classes`);

    const main = html.match(/<main\b[^>]*\sclass="([^"]*)"/);
    assert.ok(main && main[1].split(/\s+/).includes('guide-article'), `${page}: main opt-in`);

    const idx = name => html.indexOf(`/css/${name}`);
    assert.ok(idx('guide-article.css') !== -1 && idx('guide-article.css') < idx('readability.css'),
      `${page}: css order`);

    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
    assert.deepEqual(ids, snapshot[page], `${page}: ids`);
  });
}

// /css is served immutable: every page must ask for the same build of each stylesheet.
test('stage pages share one version of each stylesheet', () => {
  for (const file of ['guide-article.css', 'stage.css']) {
    const versions = new Set(PAGES.map(p => version(fs.readFileSync(path.join(PUBLIC, p), 'utf8'), file)));
    assert.equal(versions.size, 1, `${file}: ${[...versions].join(', ')}`);
    assert.ok([...versions][0], `${file}: missing ?v=`);
  }
});
