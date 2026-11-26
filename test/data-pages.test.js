// The /data section: a landing page plus six topic pages
// (docs/superpowers/specs/2026-11-26-data-section-split-design.md).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const PUBLIC = path.join(__dirname, '..', 'public');
const read = (p) => fs.readFileSync(path.join(PUBLIC, p), 'utf8');

test('the data page loads the shared scripts and keeps no inline data script', () => {
  const html = read('data.html');
  assert.match(html, /\/js\/data-status\.js\?v=/);
  assert.match(html, /\/js\/data-pages\.js\?v=/);
  assert.doesNotMatch(html, /<script type="module">/);
  assert.doesNotMatch(html, /function fromApiData/);
});

test('the shared data script carries no usernames in its fallback', () => {
  const js = read('js/data-pages.js');
  assert.doesNotMatch(js, /\b(user_?name|reddit_?name|discord_?name|display_?name)\b/i);
});

test('the shared data script uses the status line and marks fallback figures', () => {
  const js = read('js/data-pages.js');
  assert.match(js, /AVGDataStatus\.statusLine/);
  assert.match(js, /These are the last figures we could load\./);
  assert.match(js, /Live from timelines members share\. These figures load each time you open the page\./);
});
