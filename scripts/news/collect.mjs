#!/usr/bin/env node
/*
   News collector. Fetches every source in sources.mjs, keeps items that
   pass the keyword filter (filter.mjs), and adds new ones to the review
   queue at data/news-queue.json. Nothing here touches the live site:
   items reach the news page only when approved with review.mjs.

   Usage:
     npm run news:collect                     fetch and update the queue
     npm run news:collect -- --dry-run        print what would be queued
     npm run news:collect -- --verbose        also print what was filtered out

   The npm script passes --max-http-header-size: the embassy site sends
   ~17 KB of response headers, over Node's 16 KB default.

   Runs daily from .github/workflows/news-collect.yml. No dependencies:
   needs Node 20+ for global fetch.
*/
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SOURCES } from './sources.mjs';
import { judge } from './filter.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const QUEUE_PATH = join(ROOT, 'data', 'news-queue.json');

const DRY = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

// Ignore anything older than this, so a first run (or a source that
// re-publishes its archive) does not flood the queue.
const MAX_AGE_DAYS = 30;
// Rejected and approved ids are remembered this long so they never come back.
const FORGET_AFTER_DAYS = 180;

// Several government sites (behind Akamai) return 403 to non-browser
// user agents.
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36',
  'Accept': 'application/rss+xml, application/xml, application/json, text/xml;q=0.9, */*;q=0.8',
  'Accept-Language': 'en-GB,en;q=0.9',
};

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function decode(s) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&(\w+);/g, (m, n) => ENTITIES[n] ?? m);
}

const stripTags = (s) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

function tag(xml, name) {
  const m = xml.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? decode(m[1]).trim() : '';
}

function parseRss(xml) {
  return [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map(([, body]) => {
    // WordPress appends "The post X appeared first on Y." to every description.
    const summary = stripTags(decode(tag(body, 'description')))
      .replace(/The post .* appeared first on .*$/, '')
      .trim();
    return {
      title: stripTags(decode(tag(body, 'title'))),
      url: tag(body, 'link'),
      date: tag(body, 'pubDate'),
      summary: summary.slice(0, 400),
    };
  });
}

function parseFr(json) {
  return (JSON.parse(json).results || []).map((d) => ({
    title: d.title,
    url: d.html_url,
    date: d.publication_date,
    summary: [d.type, d.abstract].filter(Boolean).join(': ').slice(0, 400),
    key: `fr:${d.document_number}`,
  }));
}

function isoDate(raw) {
  const d = new Date(raw);
  return isNaN(d) ? null : d.toISOString().slice(0, 10);
}

const daysAgo = (iso) => (Date.now() - Date.parse(iso)) / 86400000;

// Google News appends " - Publisher" to every headline.
function splitPublisher(source, title) {
  if (source.type !== 'press') return { title, publisher: null };
  const i = title.lastIndexOf(' - ');
  return i > 0 ? { title: title.slice(0, i), publisher: title.slice(i + 3) } : { title, publisher: null };
}

async function fetchSource(source) {
  const res = await fetch(source.url, { headers: HEADERS, redirect: 'follow', signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.text();
  return source.kind === 'fr' ? parseFr(body) : parseRss(body);
}

async function loadQueue() {
  try {
    return JSON.parse(await readFile(QUEUE_PATH, 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') return { lastRun: null, sources: {}, items: [] };
    throw e;
  }
}

async function main() {
  const queue = await loadQueue();
  const known = new Set(queue.items.map((i) => i.id));
  const now = new Date().toISOString();
  const added = [];

  for (const source of SOURCES) {
    let raw;
    try {
      raw = await fetchSource(source);
    } catch (e) {
      // One blocked source must not stop the rest.
      const hint = e.cause?.code === 'UND_ERR_HEADERS_OVERFLOW' ? ' (run via npm run news:collect, which raises the header limit)' : '';
      console.warn(`✗ ${source.name}: ${e.message}${hint}`);
      queue.sources[source.id] = { ...queue.sources[source.id], lastError: e.message, lastErrorAt: now };
      continue;
    }

    let kept = 0;
    for (const r of raw) {
      const date = isoDate(r.date);
      if (!r.url || !r.title || !date || daysAgo(date) > MAX_AGE_DAYS) continue;

      const id = createHash('sha1').update(r.key || r.url).digest('hex').slice(0, 10);
      if (known.has(id)) continue;

      const verdict = judge(r, source);
      if (!verdict.keep) {
        if (VERBOSE) console.log(`  · skip [${verdict.reason}] ${r.title}`);
        continue;
      }

      const { title, publisher } = splitPublisher(source, r.title);
      const item = {
        id,
        status: 'pending',
        source: source.id,
        sourceName: publisher || source.label || source.name,
        type: source.type,
        date,
        title,
        url: r.url,
        summary: r.summary,
        matched: verdict.matched,
        score: verdict.score,
        foundAt: now,
      };
      known.add(id);
      added.push(item);
      kept++;
    }
    queue.sources[source.id] = { lastOk: now, fetched: raw.length, queued: kept };
    console.log(`✓ ${source.name}: ${raw.length} fetched, ${kept} new for review`);
  }

  // Drop decided items once they are old; keep pending ones until reviewed.
  const before = queue.items.length;
  queue.items = queue.items
    .filter((i) => i.status === 'pending' || daysAgo(i.foundAt) < FORGET_AFTER_DAYS)
    .concat(added)
    .sort((a, b) => b.date.localeCompare(a.date));
  queue.lastRun = now;

  console.log(`\n${added.length} new item(s); ${queue.items.filter((i) => i.status === 'pending').length} pending review.`);
  for (const i of added) console.log(`  + [${i.id}] ${i.date} ${i.sourceName}: ${i.title}`);

  // Fail the run (so GitHub emails) only when every source is down.
  const failed = SOURCES.filter((s) => queue.sources[s.id]?.lastErrorAt === now).length;
  if (failed === SOURCES.length) throw new Error('Every source failed.');

  // Write only when the items change, so quiet days make no commit.
  const changed = added.length > 0 || queue.items.length !== before;
  if (DRY || !changed) return;
  await mkdir(dirname(QUEUE_PATH), { recursive: true });
  await writeFile(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
