/*
   Reddit research: search Reddit for N-400 / I-130 / London interview posts
   and save each relevant post with up to 100 comments and replies.

   Runs inside the Composio CLI, which injects an authenticated execute():

     composio run -f scripts/reddit/research.mjs            # default: past month
     composio run -f scripts/reddit/research.mjs week       # hour|day|week|month|year|all

   Output: scripts/reddit/out/<date>-<window>.json and .md (gitignored).
   Reddit usernames are not saved.

   Reddit rate-limits hard (HTTP 429). Requests are spaced out and a 429 is
   retried with a growing wait; if Reddit keeps refusing, the run stops and
   keeps what it has.
*/

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { judge } from '../news/filter.mjs';
import { isLondonIV } from './london-filter.mjs';

// ── Settings ────────────────────────────────────────────────────────────

const DEFAULT_QUERIES = [
  'N-400 interview',
  'N-400 oath ceremony',
  'I-130 approved London',
  'London embassy immigrant visa interview',
  'IR1 London interview',
  'CR1 London interview',
  'DS-260 London',
  'NVC documentarily qualified London',
];

// `london` set: movement at US Embassy London across every immigrant visa
// category (family, K-1, employment, DV). Feeds scripts/reddit/digest.mjs.
const LONDON_QUERIES = [
  'London interview letter',
  'London embassy interview scheduled',
  'London interview rescheduled',
  'London embassy cancelled interview',
  'London 221g',
  'London administrative processing',
  'London visa approved',
  'London visa in hand',
  'US embassy London immigrant visa',
  'IR1 CR1 London',
  'K1 London interview',
  'DV lottery London interview',
  'EB green card London consulate',
  'IR5 F2A London interview',
];

// Usage: composio run -f research.mjs [london] [window] [--since YYYY-MM-DD]
const ARGS = process.argv.slice(2);
const SET = ARGS.includes('london') ? 'london' : 'default';
const QUERIES = SET === 'london' ? LONDON_QUERIES : DEFAULT_QUERIES;
const sinceIdx = ARGS.indexOf('--since');
const SINCE = sinceIdx >= 0 && /^\d{4}-\d{2}-\d{2}$/.test(ARGS[sinceIdx + 1] ?? '') ? ARGS[sinceIdx + 1] : null;

const TIME_WINDOWS = ['hour', 'day', 'week', 'month', 'year', 'all'];
const WINDOW = ARGS.find((a) => TIME_WINDOWS.includes(a)) ?? 'month';

const POSTS_PER_QUERY = 25;   // Reddit max per page is 100
const COMMENTS_PER_POST = 100; // top-level + replies, in thread order
const REPLY_DEPTH = 10;
const MIN_COMMENTS = 1;       // skip posts nobody answered
const GAP_MS = 6000;          // pause between Reddit calls
const MAX_RETRIES = 4;

// ── Relevance ───────────────────────────────────────────────────────────

/**
 * Decide whether a search hit is worth fetching comments for.
 * Reddit search is loose ("London" alone matches lots of noise), so this is
 * where the shortlist is shaped.
 *
 * @param {{title: string, selftext: string, subreddit: string,
 *          num_comments: number, score: number}} post
 * @returns {boolean}
 */
function isRelevant(post) {
  if (SINCE && post.created < SINCE) return false;
  if (SET === 'london') return isLondonIV(post);
  // TODO(Erin): decide what counts as relevant. See the note in chat.
  return true;
}

// ── Reddit helpers ──────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class RateLimited extends Error {}

async function reddit(slug, args) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    await sleep(GAP_MS);
    // The Composio runtime throws on successful:false (incl. rate limits),
    // so turn a thrown error back into a result we can inspect.
    let res;
    try {
      res = await execute(slug, args);
    } catch (e) {
      res = { successful: false, error: e?.message ?? String(e) };
    }
    const status = res?.data?.status_code;
    const text = JSON.stringify(res?.data ?? res?.error ?? '').slice(0, 300);
    if (status === 429 || /\b429\b|rate limit/i.test(res?.error ?? '')) {
      const wait = 15000 * 2 ** attempt;
      console.error(`  429 from Reddit, waiting ${wait / 1000}s (try ${attempt + 1}/${MAX_RETRIES + 1})`);
      await sleep(wait);
      continue;
    }
    if (res?.successful === false || res?.data?.http_error) {
      throw new Error(`${slug} failed: ${res?.error || text}`);
    }
    return res.data;
  }
  throw new RateLimited(`Reddit kept returning 429 for ${slug}`);
}

// Search responses come back in a few shapes; accept all of them.
function postsFrom(data) {
  const raw =
    data?.posts ?? data?.data?.posts ??
    data?.children ?? data?.data?.children ?? [];
  return raw.map((p) => p?.data ?? p).filter((p) => p?.id);
}

function afterFrom(data) {
  return data?.after ?? data?.data?.after ?? null;
}

// Flatten the comment tree (top-level comments and their replies) in
// thread order: each top-level comment by score, its replies under it.
// Reddit collapses very long threads into "more" stubs; those are skipped
// (expanding them costs extra rate-limited calls).
function allComments(data) {
  const listing =
    data?.comments_listing ?? (Array.isArray(data) ? data[1] : null) ?? data?.[1];
  const out = [];
  const walk = (children, depth) => {
    const kept = (children ?? [])
      .filter((c) => c.kind === 't1')
      .map((c) => c.data)
      .filter((c) => c.author !== 'AutoModerator' && !c.stickied)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    for (const c of kept) {
      if (out.length >= COMMENTS_PER_POST) return;
      if (c.body && !['[deleted]', '[removed]'].includes(c.body)) {
        out.push({
          depth,
          score: c.score ?? 0,
          created: new Date(c.created_utc * 1000).toISOString().slice(0, 10),
          body: c.body,
          permalink: fullLink(c.permalink),
        });
      }
      // Replies of a deleted comment can still be useful, so always descend.
      walk(c.replies?.data?.children, depth + 1);
    }
  };
  walk(listing?.data?.children, 0);
  return out;
}

// ── Run ─────────────────────────────────────────────────────────────────

// Composio returns full URLs; raw Reddit returns /r/... paths.
const fullLink = (l = '') => (l.startsWith('http') ? l : `https://www.reddit.com${l}`);

const outDir = join(dirname(fileURLToPath(import.meta.url)), 'out');
mkdirSync(outDir, { recursive: true });
const stamp = `${new Date().toISOString().slice(0, 10)}-${SET === "london" ? "london-" : ""}${WINDOW}`;

// Resume: a rerun on the same day keeps what an earlier, rate-limited run
// saved and only fetches the queries and comments still missing.
const found = new Map();
const doneQueries = new Set();
const prevPath = join(outDir, `${stamp}.json`);
if (existsSync(prevPath)) {
  const prev = JSON.parse(readFileSync(prevPath, 'utf8'));
  for (const q of prev.doneQueries ?? []) doneQueries.add(q);
  for (const p of prev.posts ?? []) found.set(p.id, { ...p, permalink: fullLink(p.permalink.replace(/^https:\/\/www\.reddit\.com(?=https?:)/, '')) });
  console.error(`Resuming: ${found.size} posts, ${doneQueries.size}/${QUERIES.length} queries already done`);
}
let stoppedEarly = null;

try {
  for (const q of QUERIES) {
    if (doneQueries.has(q)) continue;
    console.error(`Searching: "${q}" (${WINDOW})`);
    const data = await reddit('REDDIT_SEARCH_ACROSS_SUBREDDITS', {
      search_query: q,
      sort: 'relevance',
      time_filter: WINDOW,
      limit: POSTS_PER_QUERY,
    });
    const posts = postsFrom(data);
    let kept = 0;
    for (const p of posts) {
      if (found.has(p.id)) { found.get(p.id).queries.push(q); continue; }
      const post = {
        id: p.id,
        subreddit: p.subreddit,
        title: p.title ?? '',
        selftext: p.selftext ?? '',
        score: p.score ?? 0,
        num_comments: p.num_comments ?? 0,
        created: new Date(p.created_utc * 1000).toISOString().slice(0, 10),
        permalink: fullLink(p.permalink),
        queries: [q],
        relevance: judge({ title: p.title ?? '', summary: p.selftext ?? '' }, { needs: 'visa' }),
      };
      if (post.num_comments < MIN_COMMENTS || !isRelevant(post)) continue;
      found.set(p.id, post);
      kept++;
    }
    console.error(`  ${posts.length} results, ${kept} new relevant`);
    doneQueries.add(q);
  }

  let i = 0;
  for (const post of found.values()) {
    i++;
    if (post.comments) continue;
    console.error(`Comments ${i}/${found.size}: ${post.title.slice(0, 70)}`);
    const data = await reddit('REDDIT_RETRIEVE_POST_COMMENTS', {
      article: post.id,
      sort: 'top',
      depth: REPLY_DEPTH,
      limit: 500,
    });
    post.comments = allComments(data);
  }
} catch (err) {
  if (!(err instanceof RateLimited)) throw err;
  stoppedEarly = err.message;
  console.error(`\nStopped early: ${err.message}. Saving what was collected.`);
}

// ── Save ────────────────────────────────────────────────────────────────

const posts = [...found.values()].sort((a, b) => b.created.localeCompare(a.created));

writeFileSync(
  join(outDir, `${stamp}.json`),
  JSON.stringify({ generated: new Date().toISOString(), set: SET, since: SINCE, window: WINDOW, queries: QUERIES, doneQueries: [...doneQueries], stoppedEarly, posts }, null, 2),
);

const md = [
  `# Reddit research: ${stamp}`,
  '',
  `${posts.length} posts. Queries: ${QUERIES.map((q) => `"${q}"`).join(', ')}.`,
  stoppedEarly ? `\n**Incomplete:** ${stoppedEarly}\n` : '',
  ...posts.flatMap((p) => [
    `## ${p.title}`,
    '',
    `r/${p.subreddit} · ${p.created} · ${p.score} points · ${p.num_comments} comments · [link](${p.permalink})`,
    '',
    p.selftext ? p.selftext.slice(0, 1500) + (p.selftext.length > 1500 ? ' …' : '') : '_(no body text)_',
    '',
    `### Comments and replies (${p.comments?.length ?? 'not fetched'})`,
    '',
    ...(p.comments ?? []).map((c) => `${'  '.repeat(c.depth ?? 0)}- **${c.score}** (${c.created}): ${c.body.replace(/\n+/g, ' ').slice(0, 600)}`),
    '',
  ]),
].join('\n');

writeFileSync(join(outDir, `${stamp}.md`), md);
console.error(`\nSaved ${posts.length} posts to scripts/reddit/out/${stamp}.{json,md}`);
