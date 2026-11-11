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

test('every section page has the hub sidebar, desktop and drawer', () => {
  const canon = sidebars(read('naturalization.html'))[0];
  for (const p of SECTION_PAGES) {
    const s = sidebars(read(p));
    assert.equal(s.length, 2, `${p}: sidebar + drawer`);
    s.forEach(x => assert.equal(x, canon, p));
  }
});

test('aria-current marks the page itself', () => {
  for (const p of SECTION_PAGES) {
    const current = [...read(p).matchAll(/<a href="([^"]+)" aria-current="page"/g)].map(m => m[1]);
    assert.deepEqual(current, [URL_OF(p), URL_OF(p)], `${p}: once in sidebar, once in drawer`);
  }
});

test('step pages link Previous/Next along the chain', () => {
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

test('step 1 eligibility page', () => {
  const html = read('naturalization/eligibility.html');
  for (const id of ['five-year', 'three-year', 'continuous-residence', 'physical-presence',
    'state-residence', 'early-filing', 'sources']) assert.ok(hasId(html, id), `id ${id}`);
  assert.match(html, /href="\/naturalization\/when-can-i-apply"/);
  const pn = prevNext(html);
  assert.equal(pn.prev, '/naturalization');
  assert.equal(pn.next, '/naturalization/test');
  assert.deepEqual(scriptsOn(html), []);
});

// ---------- Hub and legacy anchors ----------
const vm = require('node:vm');
const ANCHORS = {
  timeline: '/naturalization/when-can-i-apply', calc: '/naturalization/when-can-i-apply',
  prepare: '/checklist-n400', prep: '/checklist-n400',
  civics: '/naturalization/test#flashcards', flashcards: '/naturalization/test#flashcards',
  english: '/naturalization/test#english', resources: '/naturalization#help',
};
const redirectFor = hash => {
  let got;
  const sandbox = { location: { hash, replace: u => { got = u; } }, window: { addEventListener() {} } };
  vm.runInNewContext(read('js/naturalization-anchors.js'), sandbox);
  return got;
};

test('legacy anchors resolve', () => {
  for (const [hash, url] of Object.entries(ANCHORS)) {
    assert.equal(redirectFor('#' + hash), url, `#${hash}`);
    const [file, frag] = url.split('#');
    const html = read(file.slice(1) + '.html');
    if (frag) assert.ok(hasId(html, frag), `${url}: id exists`);
  }
  for (const hash of ['#help', '#steps', '#community-h', '']) assert.equal(redirectFor(hash), undefined, hash);
});

test('hub links every built page and lists unbuilt steps as text', () => {
  const html = read('naturalization.html');
  assert.ok(html.indexOf('/js/naturalization-anchors.js') < html.indexOf('</head>'), 'anchor map in head');
  const steps = (html.match(/<section[^>]*id="steps"[\s\S]*?<\/section>/) || [''])[0];
  for (const url of ['/naturalization/eligibility', '/naturalization/when-can-i-apply', '/naturalization/test', '/checklist-n400']) {
    assert.ok(steps.includes(`href="${url}"`), `links ${url}`);
  }
  for (const t of ['Good moral character', 'Fill in and file Form N-400', 'Biometrics', 'Interview', 'Oath ceremony', 'After you become a citizen']) {
    assert.ok(steps.includes(t), `lists ${t}`);
  }
  for (const id of ['help', 'not-covered', 'community-h']) assert.ok(hasId(html, id), `id ${id}`);
  assert.deepEqual(scriptsOn(html), []);
  assert.ok(!fs.existsSync(path.join(PUBLIC, 'js/naturalization.js')), 'old script deleted');
});

// ---------- Nav, sitemap, inbound links ----------
test('nav maps the section', () => {
  const nav = read('js/nav.js');
  assert.match(nav, /\/\^\\\/naturalization\\\/\/\.test\(window\.location\.pathname\)/, 'section path rule');
  assert.match(nav, /'checklist-n400': 'naturalization'/);
});

test('sitemap lists the section', () => {
  const map = read('sitemap.xml');
  for (const p of SECTION_PAGES) {
    assert.ok(map.includes(`<loc>https://www.americanvisaguide.com${URL_OF(p)}</loc>`), URL_OF(p));
  }
});

test('no links to removed anchors', () => {
  const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
  const files = walk(PUBLIC).filter(f => /\.(html|js)$/.test(f) && !f.endsWith('naturalization-anchors.js'));
  const bad = files.filter(f => /naturalization(\.html)?#(timeline|calc|prepare|prep|civics|english|resources)\b/
    .test(fs.readFileSync(f, 'utf8'))).map(f => path.relative(PUBLIC, f));
  assert.deepEqual(bad, []);
});

// ---------- Final-review fixes ----------
test('printables build reads PREP from the checklist script', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'scripts/build-naturalization-printables.js'), 'utf8');
  const fn = src.slice(src.indexOf('function loadPrep'), src.indexOf('const PREP = loadPrep'));
  const file = (fn.match(/path\.join\(ROOT, '([^']+)'\)/) || [])[1];
  assert.equal(file, 'public/js/n400-checklist.js');
  assert.match(read('js/n400-checklist.js'), /const PREP = (\[[\s\S]*?\n  \]);/, 'PREP pattern still matches');
});

const section = (html, id) => (html.match(new RegExp(`<section[^>]*id="${id}"[\\s\\S]*?</section>`)) || [''])[0];

test('eligibility: waiting periods after a 1-year absence match Vol. 12 Part D ch. 3', () => {
  const cr = section(read('naturalization/eligibility.html'), 'continuous-residence');
  for (const t of ['4 years and 6 months', '4 years and 1 day', '2 years and 6 months', '2 years and 1 day', 'N-470']) {
    assert.ok(cr.includes(t), t);
  }
});

test('eligibility: 3-year rule lists continuous residence and marriage until the oath', () => {
  const s = section(read('naturalization/eligibility.html'), 'three-year');
  assert.match(s, /lived in the US continuously/);
  assert.match(s, /until you take the oath/);
});

test('eligibility: no unsupported claims; early filing 3-month rule explained', () => {
  const html = read('naturalization/eligibility.html');
  assert.doesNotMatch(html, /keep the fee/);
  assert.match(section(html, 'state-residence'), /before your interview/);
});

test('calculator timeline pills stay in a row', () => {
  assert.match(read('css/naturalization.css'), /\.natz-tool \.steps\{[^}]*flex-direction:row/);
});
