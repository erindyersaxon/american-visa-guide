// Moving content on Stage 8 (before you leave) and Stage 9 (US entry), which
// the master workbook's Tasks tab reads. Sources: CDC (pets), Erin (health
// cover), a mover's shipping pack (never named or linked).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = f => fs.readFileSync(path.join(__dirname, '..', 'public/guide', f), 'utf8');
const listAfter = (html, id) => {
  const i = html.indexOf(`id="${id}"`);
  assert.ok(i > 0, id);
  const from = html.slice(i);
  const m = from.match(/<(ol|ul)\b[\s\S]*?<\/\1>/);
  assert.ok(m, `list after ${id}`);
  return m[0];
};
const text = s => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

const leave = read('before-you-leave.html');
const entry = read('us-entry.html');

test('Stage 8 action list covers the moving tasks', () => {
  const actions = text(listAfter(leave, 'action-list-title')).toLowerCase();
  for (const word of ['phone number', 'council tax', 'driving record', 'prescription', 'credit',
    'dog import form', 'school', 'inventory']) {
    assert.ok(actions.includes(word), word);
  }
});

test('Stage 8 shipping guidance protects personal details and links no form', () => {
  assert.ok(leave.includes('Never put your date of birth'));
  assert.doesNotMatch(leave, /3299\.pdf|cbp\.gov\/document\/forms/);
});

test('Stage 9 action list covers health cover from arrival', () => {
  assert.ok(text(listAfter(entry, 'action-list-title')).toLowerCase().includes('qualifying life event'));
});

test('every stage 8 and 9 list item carries a role', () => {
  for (const html of [leave, entry]) {
    for (const id of ['action-list-title', 'before-you-move-on-title']) {
      for (const li of listAfter(html, id).match(/<li\b[\s\S]*?<\/li>/g)) {
        assert.match(li, /^<li><span class="role role--(petitioner|beneficiary|either)">/, li.slice(0, 80));
      }
    }
  }
});
