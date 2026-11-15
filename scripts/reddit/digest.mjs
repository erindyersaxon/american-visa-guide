#!/usr/bin/env node
/*
   Turn a London Reddit research run into news-queue digests: one pending
   `community` item per signal (interview letters, reschedules, outcomes),
   each citing every thread that reports it.

     node scripts/reddit/digest.mjs                 newest out/*-london-*.json
     node scripts/reddit/digest.mjs <file.json>     a specific run
     node scripts/reddit/digest.mjs --dry-run       print, don't write

   Then review as usual:  npm run news:review
   Nothing here touches the live site.

   Ids are per signal per ISO week, so a weekly run makes fresh digests and
   a rerun in the same week replaces that week's still-pending digest
   (approved or rejected ones are left alone).
*/
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isLondonIV } from './london-filter.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const QUEUE_PATH = join(ROOT, 'data', 'news-queue.json');
const OUT_DIR = join(HERE, 'out');

const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const file =
  args.find((a) => a.endsWith('.json')) ??
  join(OUT_DIR, readdirSync(OUT_DIR).filter((f) => /-london-.*\.json$/.test(f)).sort().at(-1) ?? '');

// ── Signals ─────────────────────────────────────────────────────────────

const SIGNALS = {
  il: {
    label: 'interview letters',
    title: (n) => `London: applicants report new interview letters (${n})`,
    re: /\b(interview letter|\bILs?\b|got (my|our|the) interview|interview (date|scheduled|booked)|DQ dates?|scheduling (tool|update))/i,
  },
  reschedule: {
    label: 'reschedules or cancellations',
    title: (n) => `London: applicants report rescheduled or cancelled interviews (${n})`,
    re: /\b(reschedul\w*|cancel+ed|postponed|moved (my|our|the) interview|new (interview )?date)/i,
  },
  outcome: {
    label: 'interview outcomes and administrative processing',
    title: (n) => `London: interview outcomes and 221(g) updates (${n})`,
    re: /\b(approved|visa in hand|passport (back|returned|delivered)|issued|221\s?\(?g\)?|administrative processing|\bAP\b|refused|denied)/i,
  },
};

const MONTHS = 'January|February|March|April|May|June|July|August|September|October|November|December';
const MONTH_RE = new RegExp(`\\b(${MONTHS})\\b`, 'gi');

function isoWeek(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y = t.getUTCFullYear();
  const wk = Math.ceil(((t - Date.UTC(y, 0, 1)) / 864e5 + 1) / 7);
  return `${y}-W${String(wk).padStart(2, '0')}`;
}

const hashId = (s) => createHash('sha1').update(s).digest('hex').slice(0, 10);

// ── Build ───────────────────────────────────────────────────────────────

const run = JSON.parse(readFileSync(file, 'utf8'));
// Older runs doubled the host ("https://www.reddit.comhttps://...").
run.posts = run.posts.filter(isLondonIV);
for (const p of run.posts) p.permalink = p.permalink.replace(/^https:\/\/www\.reddit\.com(?=https?:)/, '');
const week = isoWeek(new Date(run.generated));
const now = new Date().toISOString();

const digests = [];
for (const [key, sig] of Object.entries(SIGNALS)) {
  const threads = [];
  let commentHits = 0;
  const months = new Map();
  for (const p of run.posts) {
    const postHit = sig.re.test(`${p.title}\n${p.selftext}`);
    const hits = (p.comments ?? []).filter((c) => sig.re.test(c.body));
    if (!postHit && !hits.length) continue;
    commentHits += hits.length;
    threads.push(p);
    for (const txt of [p.title, p.selftext, ...hits.map((c) => c.body)]) {
      for (const m of txt.matchAll(MONTH_RE)) {
        const k = m[1][0].toUpperCase() + m[1].slice(1).toLowerCase();
        months.set(k, (months.get(k) ?? 0) + 1);
      }
    }
  }
  if (!threads.length) continue;

  threads.sort((a, b) => b.num_comments - a.num_comments || b.created.localeCompare(a.created));
  const reports = threads.length + commentHits;
  const subs = [...new Set(threads.map((t) => `r/${t.subreddit}`))];
  const monthList = [...months].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([m, n]) => `${m} (${n})`);

  const lines = [
    `${threads.length} thread(s) and ${commentHits} comment(s) mention ${sig.label}, ${run.since ?? 'past ' + run.window} to ${run.generated.slice(0, 10)}.`,
    reports === 1 ? 'SINGLE REPORT: only one mention; treat as unconfirmed.' : null,
    monthList.length ? `Months mentioned most: ${monthList.join(', ')}.` : null,
    key === 'reschedule' && (months.has('September') || months.has('October'))
      ? 'Some mentions name September/October, which may be the 23 Oct reschedule wave already on /news.'
      : null,
    'Threads:',
    ...threads.slice(0, 8).map((t) => `- ${t.created} r/${t.subreddit}: ${t.title} ${t.permalink}`),
    threads.length > 8 ? `- …and ${threads.length - 8} more (see urls)` : null,
  ].filter(Boolean);

  digests.push({
    id: hashId(`reddit-london-${key}-${week}`),
    status: 'pending',
    source: `reddit-london-${key}`,
    sourceName: subs.length <= 3 ? subs.join(', ') : `Reddit (${subs.length} subreddits)`,
    type: 'community',
    date: threads.map((t) => t.created).sort().at(-1),
    title: sig.title(`${threads.length} thread${threads.length === 1 ? '' : 's'}`),
    url: threads[0].permalink,
    urls: threads.map((t) => t.permalink),
    summary: lines.join('\n'),
    matched: [key, `${reports} report(s)`],
    score: reports,
    reports,
    foundAt: now,
  });
}

// ── Queue ───────────────────────────────────────────────────────────────

if (DRY) {
  for (const d of digests) console.log(`[${d.id}] ${d.title}\n${d.summary}\n`);
  process.exit(0);
}

const queue = JSON.parse(readFileSync(QUEUE_PATH, 'utf8'));
let added = 0, replaced = 0, kept = 0;
for (const d of digests) {
  const i = queue.items.findIndex((x) => x.id === d.id);
  if (i < 0) { queue.items.push(d); added++; }
  else if (queue.items[i].status === 'pending') { queue.items[i] = d; replaced++; }
  else kept++;
}
writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n');
console.log(`From ${file.split('/').pop()}: ${added} added, ${replaced} replaced, ${kept} already decided. Run: npm run news:review`);
