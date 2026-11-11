// Guard for the naturalization section: the step-by-step hub at /naturalization,
// its step and tool pages, the split tool scripts, legacy #anchors, nav and sitemap.
// Spec: docs/superpowers/specs/2026-11-11-naturalization-section-design.md
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const PUBLIC = process.env.NATZ_PAGES_ROOT || path.join(__dirname, '..', 'public');
const read = rel => fs.readFileSync(path.join(PUBLIC, rel), 'utf8');

// ---------- Tool scripts ----------
const SCRIPTS = {
  'js/n400-calculator.js': "getElementById('calc')",
  'js/n400-checklist.js': "getElementById('prep')",
  'js/civics-flashcards.js': "getElementById('fc-card')",
};

test('scripts guard their root element', () => {
  for (const [file, root] of Object.entries(SCRIPTS)) {
    const src = read(file);
    assert.ok(src.includes(root), `${file}: looks up ${root}`);
    assert.match(src, /if \(!\w+\) return;/, `${file}: early return`);
  }
});

test('keeps storage keys', () => {
  assert.ok(read('js/n400-checklist.js').includes("'avg-natz-prep'"));
  assert.ok(read('js/civics-flashcards.js').includes("'avg-civics-known'"));
});

test('no same-page links to moved sections', () => {
  for (const file of Object.keys(SCRIPTS)) {
    assert.doesNotMatch(read(file), /href="#(civics|prepare|timeline|calc|flashcards)"|calculator above/, file);
  }
});

// ---------- Section pages ----------
const SECTION_PAGES = ['naturalization.html', 'naturalization/eligibility.html',
  'naturalization/when-can-i-apply.html', 'naturalization/test.html', 'checklist-n400.html'];
// Previous/Next order of the built step pages (the hub first). Add steps here as they are built.
const STEP_CHAIN = ['/naturalization', '/naturalization/eligibility', '/naturalization/test'];
const URL_OF = p => '/' + p.replace(/\.html$/, ''); // 'naturalization/test.html' → '/naturalization/test'
const sidebars = html => [...html.matchAll(/<ul class="sidebar-nav"[\s\S]*?<\/ul>/g)]
  .map(m => m[0].replace(/ aria-current="page"/g, '').replace(/\s+/g, ' '));
const prevNext = html => {
  const nav = (html.match(/<nav class="stage-prevnext"[\s\S]*?<\/nav>/) || [''])[0];
  const rel = r => (nav.match(new RegExp(`href="([^"]+)" rel="${r}"`)) || [])[1];
  return { found: !!nav, prev: rel('prev'), next: rel('next') };
};

test('every section page has the hub sidebar, desktop and drawer', { todo: 'until Task 6' }, () => {
  const canon = sidebars(read('naturalization.html'))[0];
  for (const p of SECTION_PAGES) {
    const s = sidebars(read(p));
    assert.equal(s.length, 2, `${p}: sidebar + drawer`);
    s.forEach(x => assert.equal(x, canon, p));
  }
});

test('aria-current marks the page itself', { todo: 'until Task 6' }, () => {
  for (const p of SECTION_PAGES) {
    const current = [...read(p).matchAll(/<a href="([^"]+)" aria-current="page"/g)].map(m => m[1]);
    assert.deepEqual(current, [URL_OF(p), URL_OF(p)], `${p}: once in sidebar, once in drawer`);
  }
});

test('step pages link Previous/Next along the chain', { todo: 'until Task 6' }, () => {
  STEP_CHAIN.slice(1).forEach((url, i) => {
    const pn = prevNext(read(url.slice(1) + '.html'));
    assert.ok(pn.found, `${url}: has stage-prevnext`);
    assert.equal(pn.prev, STEP_CHAIN[i], `${url}: prev`);
    assert.equal(pn.next, STEP_CHAIN[i + 2], `${url}: next`);
  });
});

// ---------- Tool pages ----------
const TOOL_SCRIPTS = ['n400-calculator.js', 'n400-checklist.js', 'civics-flashcards.js'];
const scriptsOn = html => TOOL_SCRIPTS.filter(s => html.includes(`/js/${s}`));
const hasId = (html, id) => new RegExp(`\\sid="${id}"`).test(html);

test('calculator page', () => {
  const html = read('naturalization/when-can-i-apply.html');
  for (const id of ['calc', 'c-result']) assert.ok(hasId(html, id), `id ${id}`);
  assert.match(html, /class="[^"]*\bnatz-tool\b/);
  assert.deepEqual(scriptsOn(html), ['n400-calculator.js']);
  assert.equal(prevNext(html).found, false, 'tools carry no pager');
});

test('checklist page', () => {
  const html = read('checklist-n400.html');
  for (const id of ['prep', 'prep-reset']) assert.ok(hasId(html, id), `id ${id}`);
  assert.match(html, /class="[^"]*\bnatz-tool\b/);
  assert.deepEqual(scriptsOn(html), ['n400-checklist.js']);
  assert.equal(prevNext(html).found, false, 'tools carry no pager');
});

// ---------- Step pages ----------
test('step 5 test page', () => {
  const html = read('naturalization/test.html');
  for (const id of ['civics', 'flashcards', 'fc-card', 'english', 'exemptions', 'study-help']) {
    assert.ok(hasId(html, id), `id ${id}`);
  }
  assert.ok(html.indexOf('/js/naturalization-test.js') !== -1 &&
    html.indexOf('/js/naturalization-test.js') < html.indexOf('/js/civics-flashcards.js'), 'data loads before flashcards');
  assert.deepEqual(scriptsOn(html), ['civics-flashcards.js']);
  const pn = prevNext(html);
  assert.equal(pn.prev, '/naturalization/eligibility');
  assert.equal(pn.next, undefined, 'last built step has no next');
});
