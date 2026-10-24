// Guard for the standalone article and tool pages: they stay on the shared
// guide-article components (tools on tools.css), with no article.css, no stray
// inline styles or <style> blocks, and every anchor ID unchanged.
// Spec: docs/superpowers/specs/2026-10-25-article-pages-migration-design.md
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const PUBLIC = path.join(__dirname, '..', 'public');
const ROOT = process.env.ARTICLE_PAGES_ROOT || PUBLIC;
const snapshot = require('./fixtures/article-ids.json');
const allowlist = require('./fixtures/article-inline-allowlist.json');

const PAGES = ['221g-sheet', '221g', 'administrative-processing', 'delayed-i130-remedies', 'domicile',
  'history-worksheet', 'interview-dates', 'interview-day-sheet', 'interview-templates', 'interview',
  'mandamus-pro-se', 'public-charge-statement', 'reinterview', 'visa-pause'].map(p => `${p}.html`);
const TOOL_PAGES = ['221g-sheet', 'history-worksheet', 'interview-dates', 'interview-day-sheet',
  'interview-templates', 'public-charge-statement'].map(p => `${p}.html`);
const STYLE_BLOCK_PAGES = ['delayed-i130-remedies', 'history-worksheet', 'interview-day-sheet',
  'mandamus-pro-se', 'public-charge-statement'].map(p => `${p}.html`);
const OLD = ['eyebrow', 'lead', 'table-wrap', 'stage-card', 'stage-head', 'stage-pill', 'stage-title'];
const TOOL_CLASSES = ['tool', 'field', 'field-row', 'check', 'btn', 'results', 'output'];

const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
// Attribute values in any quoting: "x", 'x' or bare x
const attrValues = (html, name) => [...html.matchAll(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'gi'))]
  .map(m => m[1] ?? m[2] ?? m[3]);
const version = (html, file) => (html.match(new RegExp(`/css/${file}\\?v=([0-9a-z]+)`)) || [])[1];
const withoutScripts = html => html.replace(/<script\b[\s\S]*?<\/script>/gi, '');

for (const page of PAGES) {
  test(`article page ${page}`, () => {
    const html = read(page);
    const markup = withoutScripts(html);

    assert.ok(!/\/css\/article\.css/.test(markup.replace(/<!--[\s\S]*?-->/g, '')), `${page}: article.css`);

    const classTokens = attrValues(markup, 'class').flatMap(v => v.split(/\s+/));
    assert.deepEqual(classTokens.filter(t => OLD.includes(t)), [], `${page}: old classes`);

    const main = html.match(/<main\b[^>]*\sclass="([^"]*)"/);
    assert.ok(main && main[1].split(/\s+/).includes('guide-article'), `${page}: main opt-in`);

    const idx = name => html.indexOf(`/css/${name}`);
    assert.ok(idx('guide-article.css') !== -1 && idx('guide-article.css') < idx('readability.css'), `${page}: css order`);

    if (classTokens.some(t => TOOL_CLASSES.includes(t))) assert.ok(idx('tools.css') !== -1, `${page}: tools.css`);

    const allowed = new Set(allowlist.filter(a => a.page === page).map(a => a.style));
    assert.deepEqual(attrValues(markup, 'style').filter(s => !allowed.has(s)), [], `${page}: inline styles`);

    const hasStyleBlock = /<style\b/i.test(markup);
    assert.ok(!hasStyleBlock || STYLE_BLOCK_PAGES.includes(page), `${page}: style blocks`);

    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
    assert.deepEqual(ids, snapshot[page], `${page}: ids`);
  });
}

test('article pages share stylesheet builds with the stage pages', () => {
  const stageV = version(fs.readFileSync(path.join(PUBLIC, 'guide/nvc.html'), 'utf8'), 'guide-article.css');
  assert.deepEqual([...new Set(PAGES.map(p => version(read(p), 'guide-article.css')))], [stageV], 'guide-article.css');
  const toolV = new Set(TOOL_PAGES.map(p => version(read(p), 'tools.css')));
  assert.equal(toolV.size, 1, `tools.css: ${[...toolV].join(', ')}`);
  assert.ok([...toolV][0], 'tools.css: missing ?v=');
});
