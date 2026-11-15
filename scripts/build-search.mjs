// Build the site search index with Pagefind (https://pagefind.app).
// Runs at deploy time (vercel.json buildCommand) and locally with
// `npm run build:search`. Writes public/pagefind/, which is git-ignored.
//
// What gets indexed:
// - every page's <main data-pagefind-body> (404 and redirect stubs have no
//   marker, so they are skipped). Breadcrumbs, live notices, contents boxes
//   and the section fold-out are left out so results show page content.
// - news items, which news.js draws in the browser: one record each,
//   linking to /news#<id>.
// - glossary terms, which glossary.js draws in the browser: one record each,
//   linking to that term's anchor on /glossary (Pagefind keeps one record
//   per URL, so each term needs its own).

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import * as pagefind from 'pagefind';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = path.join(root, 'public');

function fail(msg) {
  console.error('build-search: ' + msg);
  process.exit(1);
}

// News: the ITEMS block in news.js is JSON (review.mjs rewrites it).
function readNews() {
  const src = fs.readFileSync(path.join(site, 'js/news.js'), 'utf8');
  const m = src.match(/\/\/ BEGIN NEWS ITEMS\s*const ITEMS = (\[[\s\S]*?\]);\s*\/\/ END NEWS ITEMS/);
  if (!m) fail('could not find the news ITEMS block in public/js/news.js');
  return JSON.parse(m[1]);
}

// Glossary: TERMS in glossary.js is a JS array literal (single quotes), so
// evaluate just that literal in an empty sandbox.
function readGlossary() {
  const src = fs.readFileSync(path.join(site, 'js/glossary.js'), 'utf8');
  const m = src.match(/const TERMS = (\[[\s\S]*?\n {2}\]);/);
  if (!m) fail('could not find TERMS in public/js/glossary.js');
  return vm.runInNewContext(m[1], Object.create(null), { timeout: 1000 });
}

const { index, errors } = await pagefind.createIndex({
  forceLanguage: 'en',
  excludeSelectors: [
    '.avg-crumbs',
    '.avg-partof',
    '[data-live-notice]',
    '.toc',
    '.snav-fold',
    '.back-top',
    '.mobile-nav-toggle',
  ],
});
if (errors.length) fail(errors.join('\n'));

const dir = await index.addDirectory({ path: site });
if (dir.errors.length) fail(dir.errors.join('\n'));

const news = readNews();
for (const item of news) {
  const points = (item.points || []).map((p) => `${p.label ? p.label + ': ' : ''}${p.text}`);
  const content = [item.title, item.note || '', ...points].join('\n');
  const r = await index.addCustomRecord({
    url: '/news#' + item.id,
    content,
    language: 'en',
    meta: { title: item.title, section: 'News' },
  });
  if (r.errors.length) fail(r.errors.join('\n'));
}

// Same slug as slug() in public/js/glossary.js
const termSlug = (t) => 'term-' + t.term.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const terms = readGlossary();
const slugs = new Set();
for (const t of terms) {
  const s = termSlug(t);
  if (slugs.has(s)) fail(`two glossary terms share the anchor #${s}`);
  slugs.add(s);
  const title = t.full ? `${t.term}: ${t.full}` : t.term;
  const r = await index.addCustomRecord({
    url: '/glossary#' + s,
    content: [title, t.def || ''].join('\n'),
    language: 'en',
    meta: { title, section: 'Glossary' },
  });
  if (r.errors.length) fail(r.errors.join('\n'));
}

const out = await index.writeFiles({ outputPath: path.join(site, 'pagefind') });
if (out.errors.length) fail(out.errors.join('\n'));
await pagefind.close();

console.log(`build-search: ${dir.page_count} pages, ${news.length} news items, ${terms.length} glossary terms`);
