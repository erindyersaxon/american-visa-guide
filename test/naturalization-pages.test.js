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
