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
        // A topic tag ("Domicile", "Public charge") may come before the role tag.
        assert.match(li, /^<li(?: data-workbook="skip")?>(?:<span class="topic">[^<]+<span class="sr-only">,<\/span><\/span> )?<span class="role role--(petitioner|beneficiary|either)">/, li.slice(0, 80));
      }
    }
  }
});

test('Stage 9 health cover states the qualifying events accurately', () => {
  const section = entry.slice(entry.indexOf('id="health-cover"'), entry.indexOf('id="ssn"'));
  const plain = text(section);
  assert.match(plain, /moving to the US from abroad, and gaining lawful presence, are qualifying life events/i);
  assert.match(plain, /each plan sets its own rules for adding a spouse or family member/i);
  assert.doesNotMatch(plain, /Losing (that|NHS) cover is a qualifying life event|starting a new job is a qualifying life event|adding a spouse or family member to a policy is a qualifying life event/i);
  const action = text(listAfter(entry, 'action-list-title'));
  assert.doesNotMatch(action, /Losing NHS cover when you move is a qualifying life event|\. How\./);
});
