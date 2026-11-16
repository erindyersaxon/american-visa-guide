// Reads the guide's stage pages for the master workbook's Tasks tab: each
// page's Action list, word for word, one row per piece of work. An <li> with
// data-workbook="skip" still shows on the site but stays out of the workbook: a
// task a later stage repeats (the owning stage keeps the row), or a pointer to
// the next stage that is not a piece of work.
// Design: docs/superpowers/specs/2026-11-16-master-workbook-design.md
import fs from 'node:fs';
import path from 'node:path';

// Stage pages in guide order. The two branches of Stage 1 apply only to some cases.
export const STAGE_PAGES = [
  { file: 'guide/i130.html', url: '/guide/i130' },
  { file: 'guide/delayed-i130.html', url: '/guide/delayed-i130', optional: true },
  { file: 'guide/crba.html', url: '/guide/crba', optional: true },
  { file: 'guide/nvc.html', url: '/guide/nvc' },
  { file: 'guide/waiting.html', url: '/guide/waiting' },
  { file: 'guide/interview-letter.html', url: '/guide/interview-letter' },
  { file: 'guide/medical.html', url: '/guide/medical' },
  { file: 'guide/interview.html', url: '/guide/interview' },
  { file: 'guide/after-interview.html', url: '/guide/after-interview' },
  { file: 'guide/before-you-leave.html', url: '/guide/before-you-leave' },
  { file: 'guide/us-entry.html', url: '/guide/us-entry' },
];

// Every named entity the stage pages and checklist data use; numeric ones are decoded generally.
const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”',
  ndash: '–', mdash: '—', sect: '§', pound: '£', middot: '·', hellip: '…', ntilde: 'ñ', rarr: '→', larr: '←',
};

export function htmlToText(html) {
  const text = html
    .replace(/<span class="sr-only">[\s\S]*?<\/span>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, name) => {
      if (!(name in ENTITIES)) throw new Error(`Unknown HTML entity ${m}`);
      return ENTITIES[name];
    });
  return text.replace(/\s+/g, ' ').trim();
}

// A closing pointer sentence ("Why.", "See Stage 3.", "The steps are in Stage 4.")
// only makes sense as a link; the workbook row links to its stage instead.
const POINTER = /([.!?])\s+(?:(?:See|The steps are (?:in|under))\s+)?<a\b[^>]*>[\s\S]*?<\/a>\s*\.\s*$/;

const ROLE = /^\s*<span class="role role--(petitioner|beneficiary|either)">[\s\S]*?<\/span><\/span>\s*/;

// The first <ol> or <ul> after the heading with this id, inside the heading's
// own <section>, so a missing list fails rather than borrowing the next section's.
function listAfter(html, id, url) {
  const at = html.indexOf(`id="${id}"`);
  if (at < 0) throw new Error(`${url}: no #${id}`);
  const end = html.indexOf('</section>', at);
  const list = html.slice(at, end < 0 ? undefined : end).match(/<(ol|ul)\b[^>]*>([\s\S]*?)<\/\1>/);
  if (!list) throw new Error(`${url}: no list in the #${id} section`);
  const items = [...list[2].matchAll(/<li\b([^>]*)>([\s\S]*?)<\/li>/g)];
  if (!items.length) throw new Error(`${url}: empty list after #${id}`);
  return items.map(([, attrs, inner]) => {
    const role = inner.match(ROLE);
    if (!role) throw new Error(`${url}: item without a role tag: ${htmlToText(inner).slice(0, 60)}`);
    const who = role[1][0].toUpperCase() + role[1].slice(1);
    return {
      who,
      text: htmlToText(inner.slice(role[0].length).replace(POINTER, '$1')),
      skip: /\bdata-workbook="skip"/.test(attrs),
    };
  });
}

export function extractStage(source, url) {
  // Commented-out markup is invisible on the site, so it stays out of the workbook.
  const html = source.replace(/<!--[\s\S]*?-->/g, '');
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/);
  if (!h1) throw new Error(`${url}: no <h1>`);
  return {
    title: htmlToText(h1[1]),
    url,
    actions: listAfter(html, 'action-list-title', url),
  };
}

export function loadStages(publicDir) {
  return STAGE_PAGES.map(p => ({
    ...extractStage(fs.readFileSync(path.join(publicDir, p.file), 'utf8'), p.url),
    optional: !!p.optional,
  }));
}
