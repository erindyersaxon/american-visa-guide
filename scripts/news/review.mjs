#!/usr/bin/env node
/*
   Review the news queue and publish approved items to public/js/news.js.

     npm run news:review                                list pending items
     npm run news:review -- approve <id> [--note "..."] [--title "..."]
     npm run news:review -- reject <id> [<id> ...]
     npm run news:review -- reject --all                reject everything pending
     npm run news:review -- add --type community --source "..." \
         --title "..." --url "https://..." --date YYYY-MM-DD [--note "..."]

   Approving or adding rewrites the ITEMS block in news.js. Commit and
   push both files to publish (push = deploy).
*/
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const QUEUE_PATH = join(ROOT, 'data', 'news-queue.json');
const NEWS_PATH = join(ROOT, 'public', 'js', 'news.js');
const BLOCK = /(\/\/ BEGIN NEWS ITEMS\n\s*const ITEMS = )([\s\S]*?)(;\n\s*\/\/ END NEWS ITEMS)/;
const TYPES = ['official', 'press', 'community'];

function parseArgs(argv) {
  const pos = [];
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const next = argv[i + 1];
      opts[key] = next === undefined || next.startsWith('--') ? true : (i++, next);
    } else {
      pos.push(argv[i]);
    }
  }
  return { cmd: pos[0] || 'list', ids: pos.slice(1), opts };
}

const fail = (msg) => {
  console.error(msg);
  process.exit(1);
};

async function loadQueue() {
  try {
    return JSON.parse(await readFile(QUEUE_PATH, 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') return { items: [] };
    throw e;
  }
}

const saveQueue = (q) => writeFile(QUEUE_PATH, JSON.stringify(q, null, 2) + '\n');

async function loadNews() {
  const src = await readFile(NEWS_PATH, 'utf8');
  const m = src.match(BLOCK);
  if (!m) fail('Could not find the BEGIN/END NEWS ITEMS block in public/js/news.js.');
  let items;
  try {
    items = JSON.parse(m[2]);
  } catch (e) {
    fail(`The ITEMS block in news.js is not valid JSON (${e.message}). Fix the hand edit and retry.`);
  }
  return { src, items };
}

async function saveNews({ src }, items) {
  items.sort((a, b) => b.date.localeCompare(a.date));
  const json = JSON.stringify(items, null, 2).replace(/\n/g, '\n  ');
  await writeFile(NEWS_PATH, src.replace(BLOCK, (_, a, __, c) => a + json + c));
}

function list(queue) {
  const pending = queue.items.filter((i) => i.status === 'pending');
  if (!pending.length) return console.log('Nothing pending review.');
  for (const i of pending) {
    console.log(`[${i.id}] ${i.date}  ${i.type.toUpperCase()}  ${i.sourceName}`);
    console.log(`    ${i.title}`);
    console.log(`    ${i.url}`);
    if (i.summary) console.log(`    ${i.summary.slice(0, 200)}`);
    console.log(`    matched: ${i.matched.join(', ')} (score ${i.score})\n`);
  }
  console.log(`${pending.length} pending.`);
}

async function main() {
  const { cmd, ids, opts } = parseArgs(process.argv.slice(2));
  const queue = await loadQueue();

  if (cmd === 'list') return list(queue);

  if (cmd === 'reject') {
    const targets = opts.all
      ? queue.items.filter((i) => i.status === 'pending')
      : ids.map((id) => queue.items.find((i) => i.id === id) || fail(`No queue item ${id}.`));
    targets.forEach((i) => { i.status = 'rejected'; i.decidedAt = new Date().toISOString(); });
    await saveQueue(queue);
    return console.log(`Rejected ${targets.length} item(s).`);
  }

  if (cmd === 'approve') {
    if (ids.length !== 1) fail('Approve one item at a time: approve <id> --note "..."');
    const q = queue.items.find((i) => i.id === ids[0]) || fail(`No queue item ${ids[0]}.`);
    const news = await loadNews();
    if (news.items.some((n) => n.id === q.id)) fail(`${q.id} is already on the news page.`);
    const item = {
      id: q.id,
      date: q.date,
      type: q.type,
      source: q.sourceName,
      title: typeof opts.title === 'string' ? opts.title : q.title,
      url: q.url,
    };
    if (typeof opts.note === 'string') item.note = opts.note;
    await saveNews(news, [...news.items, item]);
    q.status = 'approved';
    q.decidedAt = new Date().toISOString();
    await saveQueue(queue);
    return console.log(`Approved ${q.id}. Bump ?v= on news.js in news.html and index.html, then commit and push to publish.`);
  }

  if (cmd === 'add') {
    const { type, source, title, url, date, note } = opts;
    if (!TYPES.includes(type)) fail(`--type must be one of: ${TYPES.join(', ')}`);
    if (typeof source !== 'string' || typeof title !== 'string') fail('--source and --title are required.');
    if (typeof url !== 'string' || !/^https?:\/\//.test(url)) fail('--url must start with http:// or https://');
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) fail('--date must be YYYY-MM-DD');
    const news = await loadNews();
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40).replace(/-$/, '');
    const item = { id: `${type}-${date}-${slug}`, date, type, source, title, url };
    if (typeof note === 'string') item.note = note;
    await saveNews(news, [...news.items, item]);
    return console.log(`Added ${item.id}. Bump ?v= on news.js in news.html and index.html, then commit and push to publish.`);
  }

  fail(`Unknown command "${cmd}". Use list, approve, reject or add.`);
}

main().catch((e) => fail(e.stack || String(e)));
