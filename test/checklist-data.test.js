// Guard for the master checklist data (public/js/checklist-data.js): the one
// list of documents behind the master checklist, the stage checklists and the
// master workbook (docs/superpowers/specs/2026-11-16-master-workbook-design.md).
const test = require('node:test');
const assert = require('node:assert/strict');
const { AVG_DOCS, needOf } = require('../public/js/checklist-data.js');

const STAGES = [['i130', 'I-130'], ['nvc', 'NVC'], ['medical', 'Medical'], ['interview', 'Interview'], ['move', 'Move']];

test('stages lists the five stages in order', () => {
  assert.deepEqual(AVG_DOCS.stages, STAGES);
});

test('needOf treats a missing stage as no', () => {
  assert.equal(needOf({ need: { i130: 'yes' } }, 'move'), 'no');
  assert.equal(needOf({ need: { move: 'cond' } }, 'move'), 'cond');
});

test("every doc's need uses known stages and values", () => {
  const keys = new Set(STAGES.map(s => s[0]));
  for (const d of AVG_DOCS.docs) {
    for (const [stage, value] of Object.entries(d.need)) {
      assert.ok(keys.has(stage), `${d.key}: unknown stage ${stage}`);
      assert.ok(['yes', 'cond', 'no'].includes(value), `${d.key}: ${stage}=${value}`);
    }
  }
});

test('the master checklist labels every stage on phones', () => {
  const html = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'public/tools/master-checklist.html'), 'utf8');
  AVG_DOCS.stages.forEach(([, label], i) => {
    assert.match(html, new RegExp(`td:nth-child\\(${i + 2}\\)::before \\{ content: "${label}"; \\}`), label);
  });
  assert.match(html, new RegExp(`grid-template-columns: repeat\\(${AVG_DOCS.stages.length}, 1fr\\)`));
});
