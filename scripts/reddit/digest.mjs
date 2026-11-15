#!/usr/bin/env node
/*
   Turn a London Reddit research run into ONE weekly roundup for the news
   queue: a single pending `community` item that captures what applicants
   reported over the week, with a point per signal (interview letters,
   reschedules, outcomes) and a short list of source threads.

     node scripts/reddit/digest.mjs                 newest out/*-london-*.json
     node scripts/reddit/digest.mjs <file.json>     a specific run
     node scripts/reddit/digest.mjs --dry-run       print, don't write

   The generated `points` are evidence counts and month tallies, a starting
   point only: whoever reviews the run rewrites `title`, `note` and `points`
   in data/news-queue.json from the threads before approving.
   Then:  npm run news:review   (approve copies note, points, sources, period)

   Only comments posted inside the week count, so an old thread doesn't
   replay old news. The id is per ISO week: a rerun in the same week replaces
   that week's roundup while it is still pending (approved or rejected ones
   are left alone).
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

const MAX_SOURCES = 6; // threads listed on the public page; all are kept in `urls`

// ── Signals ─────────────────────────────────────────────────────────────

const SIGNALS = {
  il: {
    label: 'Interview letters and scheduling',
    re: /\b(interview letter|\bILs?\b|got (my|our|the) interview|interview (date|scheduled|booked)|DQ dates?|DQ'?d|scheduling (tool|update)|new interviews?)/i,
  },
  reschedule: {
    label: 'Reschedules and cancellations',
    re: /\b(reschedul\w*|cancel+ed|postponed|moved (my|our|his|her|the) interview|new (interview )?date)/i,
  },
  outcome: {
    label: 'Outcomes and administrative processing',
    re: /\b(approved|visa in hand|passport (back|returned|delivered|posted)|issued|221\s?\(?g\)?|administrative processing|\bAP\b|refused|denied|public charge)/i,
  },
};

const MONTHS = 'January|February|March|April|May|June|July|August|September|October|November|December';
const MONTH_RE = new RegExp(`\\b(${MONTHS})\\b`, 'gi');
const MONTH_NAMES = MONTHS.split('|');

function isoWeek(d) {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y = t.getUTCFullYear();
  const wk = Math.ceil(((t - Date.UTC(y, 0, 1)) / 864e5 + 1) / 7);
  return `${y}-W${String(wk).padStart(2, '0')}`;
}

const hashId = (s) => createHash('sha1').update(s).digest('hex').slice(0, 10);
const dayMonth = (iso) => {
  const [, m, d] = iso.split('-').map(Number);
  return { d, m: MONTH_NAMES[m - 1] };
};
function rangeLabel(from, to) {
  const a = dayMonth(from), b = dayMonth(to);
  return a.m === b.m ? `${a.d}–${b.d} ${b.m}` : `${a.d} ${a.m} – ${b.d} ${b.m}`;
}

// ── Build ───────────────────────────────────────────────────────────────

const run = JSON.parse(readFileSync(file, 'utf8'));
const to = run.generated.slice(0, 10);
const from = run.since ?? new Date(Date.parse(to) - 7 * 864e5).toISOString().slice(0, 10);
const week = isoWeek(new Date(run.generated));
const now = new Date().toISOString();

// Older runs doubled the host ("https://www.reddit.comhttps://...").
const posts = run.posts.filter(isLondonIV).map((p) => ({
  ...p,
  permalink: p.permalink.replace(/^https:\/\/www\.reddit\.com(?=https?:)/, ''),
  comments: (p.comments ?? []).filter((c) => c.created >= from),
}));

const points = [];
const evidence = new Map(); // thread id -> number of in-week mentions across signals
for (const [key, sig] of Object.entries(SIGNALS)) {
  let threads = 0, comments = 0;
  const months = new Map();
  for (const p of posts) {
    const postHit = p.created >= from && sig.re.test(`${p.title}\n${p.selftext}`);
    const hits = p.comments.filter((c) => sig.re.test(c.body));
    if (!postHit && !hits.length) continue;
    threads++;
    comments += hits.length;
    evidence.set(p.id, (evidence.get(p.id) ?? 0) + (postHit ? 1 : 0) + hits.length);
    for (const txt of [postHit ? `${p.title} ${p.selftext}` : '', ...hits.map((c) => c.body)]) {
      for (const m of txt.matchAll(MONTH_RE)) {
        const k = m[1][0].toUpperCase() + m[1].slice(1).toLowerCase();
        months.set(k, (months.get(k) ?? 0) + 1);
      }
    }
  }
  if (!threads) continue;
  const monthList = [...months].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([m, n]) => `${m} ×${n}`);
  points.push({
    key,
    label: sig.label,
    text:
      `DRAFT: ${threads} thread(s), ${comments} comment(s) this week.` +
      (threads + comments === 1 ? ' SINGLE REPORT.' : '') +
      (monthList.length ? ` Months mentioned: ${monthList.join(', ')}.` : ''),
  });
}

const ranked = posts
  .filter((p) => evidence.has(p.id))
  .sort((a, b) => evidence.get(b.id) - evidence.get(a.id) || b.num_comments - a.num_comments);
const subs = [...new Set(ranked.map((p) => `r/${p.subreddit}`))];
const reports = [...evidence.values()].reduce((a, b) => a + b, 0);

if (!ranked.length) {
  console.log(`No London reports between ${from} and ${to}; nothing queued.`);
  process.exit(0);
}

const roundup = {
  id: hashId(`reddit-london-week-${week}`),
  status: 'pending',
  source: 'reddit-london-week',
  sourceName: subs.length <= 2 ? `Reddit: ${subs.join(', ')}` : `Reddit: ${subs.slice(0, 2).join(', ')} and others`,
  type: 'community',
  date: to,
  period: { from, to },
  title: `London this week: ${rangeLabel(from, to)}`,
  url: '',
  note: '',
  points: points.map(({ label, text }) => ({ label, text })),
  sources: ranked.slice(0, MAX_SOURCES).map((p) => ({ label: p.title, url: p.permalink })),
  urls: ranked.map((p) => p.permalink),
  summary: `${ranked.length} thread(s) with ${reports} in-week mention(s), ${from} to ${to}. Rewrite note and points before approving.`,
  matched: points.map((p) => p.key),
  score: reports,
  reports,
  foundAt: now,
};

// ── Queue ───────────────────────────────────────────────────────────────

if (DRY) {
  console.log(JSON.stringify(roundup, null, 2));
  process.exit(0);
}

const queue = JSON.parse(readFileSync(QUEUE_PATH, 'utf8'));
const i = queue.items.findIndex((x) => x.id === roundup.id);
let action = 'added';
if (i < 0) queue.items.push(roundup);
else if (queue.items[i].status === 'pending') { queue.items[i] = roundup; action = 'replaced'; }
else action = `left alone (already ${queue.items[i].status})`;
writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n');
console.log(`Weekly roundup ${roundup.id} ${action}: ${roundup.title}, ${ranked.length} threads. Run: npm run news:review`);
