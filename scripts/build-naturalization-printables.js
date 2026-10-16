// Builds the printable naturalization resources linked from Checklists & Tools:
//
//   public/downloads/naturalization-checklist.pdf
//   public/downloads/naturalization-civics-flashcards.pdf
//   public/downloads/naturalization-english-flashcards.pdf
//
// and, in build/printables/, the matching HTML files that are uploaded to
// Google Drive (converted to Google Docs) for the "Google Doc" links.
//
// The content comes from the same files the site uses, so rerun this after
// editing any of them:
//   public/js/naturalization.js       (PREP: the preparation checklist)
//   public/js/naturalization-test.js  (the 2025 civics questions)
//   public/js/english-test.js         (reading/writing vocabulary, interview words)
//
// Usage (Playwright is not a site dependency, so install it on demand):
//   npx -y -p playwright node scripts/build-naturalization-printables.js
// Optional: PUBLIC_SANS_DIR=<dir with public-sans-latin-{400,700}-normal.woff2>
// embeds Public Sans in the PDFs; otherwise a system sans-serif is used.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const OUT_PDF = path.join(ROOT, 'public', 'downloads');
const OUT_DOC = path.join(ROOT, 'build', 'printables');
const SITE = 'https://www.americanvisaguide.com';
const REVIEWED = 'September 27, 2026';

// ---------- load site data ----------
function loadWindowScript(file) {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), sandbox);
  return sandbox.window;
}
const CIVICS = loadWindowScript('public/js/naturalization-test.js').AVG_NATZ_TEST.TESTS['2025'];
const ENGLISH = loadWindowScript('public/js/english-test.js').AVG_ENGLISH_TEST;

function loadPrep() {
  const src = fs.readFileSync(path.join(ROOT, 'public/js/naturalization.js'), 'utf8');
  const m = src.match(/const PREP = (\[[\s\S]*?\n  \]);/);
  if (!m) throw new Error('PREP not found in naturalization.js');
  const link = (href, text) => '<a href="' + href + '">' + text + '</a>';
  const prep = vm.runInNewContext(m[1], { link });
  // Rewrite on-page references for a standalone document
  const fix = (s) => s
    .replace('Use the calculator above', 'Use the calculator at americanvisaguide.com/naturalization')
    .replace(/href="#civics"/g, 'href="' + SITE + '/naturalization#civics"')
    .replace(/href="\//g, 'href="' + SITE + '/');
  return prep.map((g) => ({ title: g.title, items: g.items.map((i) => [fix(i[1]), fix(i[2])]) }));
}
const PREP = loadPrep();

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const topicLabel = (key) => (CIVICS.topics.find((t) => t.key === key) || {}).label || '';

// ---------- shared print CSS ----------
function fontFace() {
  const dir = process.env.PUBLIC_SANS_DIR;
  if (!dir) return '';
  const face = (w) => {
    const f = path.join(dir, 'public-sans-latin-' + w + '-normal.woff2');
    if (!fs.existsSync(f)) return '';
    return '@font-face{font-family:"Public Sans";font-weight:' + w + ';src:url(data:font/woff2;base64,' +
      fs.readFileSync(f).toString('base64') + ') format("woff2")}';
  };
  return face(400) + face(700);
}
const PRINT_CSS = fontFace() + `
  @page { size: Letter; margin: 0.6in; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: "Public Sans", "Liberation Sans", Arial, sans-serif; font-size: 10.5pt; line-height: 1.45; color: #1e1c17; }
  h1, h2, h3 { font-family: Georgia, "Bitstream Charter", "Liberation Serif", serif; color: #2b3a42; margin: 0; }
  h1 { font-size: 22pt; line-height: 1.15; margin-bottom: 4pt; }
  h2 { font-size: 13pt; margin: 16pt 0 6pt; break-after: avoid; }
  a { color: #3e7188; text-decoration: none; }
  .brand { font-size: 8.5pt; font-weight: 700; color: #3e7188; letter-spacing: 0.02em; margin-bottom: 6pt; }
  .lead { color: #56524a; margin: 0 0 8pt; }
  .meta { font-size: 8.5pt; color: #6a6560; }
  .foot { font-size: 8pt; color: #6a6560; margin-top: 14pt; border-top: 1px solid #ddd6cb; padding-top: 6pt; }
`;

// ---------- 1. Naturalization checklist ----------
function checklistPdfHtml() {
  const groups = PREP.map((g) => `
    <h2>${esc(g.title)}</h2>
    <table class="ck">${g.items.map((i) => `
      <tr><td class="box"><span></span></td><td><strong>${i[0]}</strong><div class="det">${i[1]}</div></td></tr>`).join('')}
    </table>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>${PRINT_CSS}
    .ck { width: 100%; border-collapse: collapse; }
    .ck tr { break-inside: avoid; }
    .ck td { padding: 5pt 4pt; border-bottom: 1px solid #e6e0d5; vertical-align: top; }
    .ck td.box { width: 22pt; }
    .ck td.box span { display: inline-block; width: 11pt; height: 11pt; border: 1.2pt solid #2b3a42; border-radius: 2pt; margin-top: 2pt; }
    .det { font-size: 9pt; color: #56524a; }
  </style></head><body>
    <div class="brand">AMERICAN VISA GUIDE · NATURALIZATION</div>
    <h1>Naturalization Checklist: Form N-400</h1>
    <p class="lead">From deciding to file through to the oath ceremony. Your N-400 answers must match your tax, travel and court records, and USCIS can deny an application that is missing required evidence without first asking for it.</p>
    <p class="meta">Filing date calculator, fees and documents for your visa category: ${SITE.replace('https://', '')}/naturalization · Last reviewed ${REVIEWED}</p>
    ${groups}
    <p class="foot">Based on the Form N-400 instructions and the USCIS Policy Manual, Vol. 12. This is not legal advice. If you have ever been arrested, spent more than 6 months abroad in one trip, owe tax, or did not register for Selective Service, talk to an immigration attorney or DOJ-accredited representative before you file.</p>
  </body></html>`;
}
function checklistDocHtml() {
  return `<html><body>
    <h1>Naturalization Checklist: Form N-400</h1>
    <p>From deciding to file through to the oath ceremony. Your N-400 answers must match your tax, travel and court records, and USCIS can deny an application that is missing required evidence without first asking for it.</p>
    <p>Filing date calculator, fees and documents for your visa category: <a href="${SITE}/naturalization">americanvisaguide.com/naturalization</a>. Last reviewed ${REVIEWED}.</p>
    ${PREP.map((g) => `<h2>${esc(g.title)}</h2>
    <table border="1" cellpadding="6" style="border-collapse:collapse;width:100%">
      <tr><td style="width:8%"><b>Done</b></td><td style="width:35%"><b>Task</b></td><td><b>Details</b></td></tr>
      ${g.items.map((i) => `<tr><td>&#9744;</td><td>${i[0]}</td><td>${i[1]}</td></tr>`).join('')}
    </table>`).join('')}
    <p><i>Based on the Form N-400 instructions and the USCIS Policy Manual, Vol. 12. This is not legal advice. If you have ever been arrested, spent more than 6 months abroad in one trip, owe tax, or did not register for Selective Service, talk to an immigration attorney or DOJ-accredited representative before you file.</i></p>
  </body></html>`;
}

// ---------- flashcard PDF layout (8 cards per page, double-sided) ----------
// Fronts on odd pages, backs on even pages. The back page mirrors the two
// columns so each back lands behind its front when printed double-sided
// with "flip on long edge".
function cardPages(cards, per) {
  per = per || 8;
  const pages = [];
  for (let i = 0; i < cards.length; i += per) {
    const chunk = cards.slice(i, i + per);
    while (chunk.length < per) chunk.push(null);
    const fronts = chunk.map((c) => c ? c.front : '');
    const backs = [];
    for (let r = 0; r < per / 2; r++) {
      const l = chunk[r * 2], rt = chunk[r * 2 + 1];
      backs.push(rt ? rt.back : '', l ? l.back : '');
    }
    pages.push('<section class="sheet">' + fronts.map((f) => '<div class="card front">' + f + '</div>').join('') + '</section>');
    pages.push('<section class="sheet">' + backs.map((b) => '<div class="card back">' + b + '</div>').join('') + '</section>');
  }
  return pages.join('');
}
const CARD_CSS = `
  @page { size: Letter; margin: 0.4in; }
  .sheet { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: repeat(4, 1fr); height: 10.2in; break-after: page; }
  .sheet:last-child { break-after: auto; }
  .card { border: 1px dashed #a39c8e; padding: 12pt 14pt; display: flex; flex-direction: column; justify-content: center; overflow: hidden; }
  .front { text-align: center; align-items: center; gap: 6pt; }
  .tag { font-size: 7.5pt; font-weight: 700; color: #3e7188; letter-spacing: 0.03em; }
  .q { font-family: Georgia, "Bitstream Charter", "Liberation Serif", serif; font-size: 12.5pt; line-height: 1.3; color: #2b3a42; }
  .star { font-size: 7.5pt; font-weight: 700; color: #3e7188; }
  .back { font-size: 10pt; justify-content: flex-start; }
  .back ul { margin: 2pt 0 0; padding-left: 12pt; }
  .back li { margin-bottom: 1pt; }
  .back .note { font-size: 7.5pt; color: #3f6b5c; margin-top: 4pt; }
  .back .uscis { font-size: 7.5pt; color: #56524a; margin-top: 4pt; }
  .word { font-family: Georgia, "Bitstream Charter", "Liberation Serif", serif; font-size: 20pt; color: #2b3a42; }
  .mean { font-size: 13pt; text-align: center; }
  .lines { margin-top: 8pt; border-bottom: 1px solid #a39c8e; height: 18pt; }
  .cover { break-after: page; }
`;
function flashcardPdfHtml(title, lead, instructions, cards) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${PRINT_CSS}${CARD_CSS}</style></head><body>
    <div class="cover">
      <div class="brand">AMERICAN VISA GUIDE · NATURALIZATION</div>
      <h1>${esc(title)}</h1>
      <p class="lead">${lead}</p>
      <h2>How to print</h2>
      <ul>${instructions.map((i) => '<li>' + i + '</li>').join('')}</ul>
      <p class="meta">Last reviewed ${REVIEWED} · ${SITE.replace('https://', '')}</p>
    </div>
    ${cardPages(cards)}
  </body></html>`;
}
const PRINT_STEPS = [
  'Print double-sided, and choose <b>flip on long edge</b>. Each answer then prints behind its question.',
  'Cut along the dashed lines.',
  'If your printer is single-sided, print the odd pages, put the stack back in the tray, then print the even pages.',
];

// ---------- 2. Civics flashcards ----------
function civicsCards() {
  return CIVICS.questions.map((q) => ({
    front: `<div class="tag">2025 CIVICS · QUESTION ${q.n} · ${esc(topicLabel(q.topic).toUpperCase())}</div>
            <div class="q">${esc(q.q)}</div>${q.star ? '<div class="star">* 65/20 QUESTION</div>' : ''}`,
    back: `<div class="tag">QUESTION ${q.n} · ACCEPTED ANSWERS</div>
           <ul>${q.a.map((a) => '<li>' + esc(a) + '</li>').join('')}</ul>
           ${q.uscis ? '<div class="uscis">USCIS: ' + esc(q.uscis) + '</div>' : ''}
           ${q.note ? '<div class="note">Study note: ' + esc(q.note) + '</div>' : ''}`,
  }));
}
const CIVICS_LEAD = `All 128 questions and answers of the 2025 civics test, word for word from USCIS, "128 Civics Questions and Answers (2025 version)" (M-1778, 09/25). It applies to every N-400 filed on or after October 20, 2025. The officer asks up to 20 questions and you need 12 correct. Give one listed answer, or as many as the question asks for. Questions marked * are the 20 for applicants aged 65 or older with 20 or more years as a permanent resident. Study notes naming current officials are not part of the official answer: check <a href="https://www.uscis.gov/citizenship/testupdates">uscis.gov/citizenship/testupdates</a> the week before your interview.`;
function civicsDocHtml() {
  return `<html><body>
    <h1>2025 Civics Test Flashcards</h1>
    <p>${CIVICS_LEAD}</p>
    <p>To use as flashcards: fold each page down the middle so the questions are on one side and the answers on the other. Last reviewed ${REVIEWED}.</p>
    ${CIVICS.topics.map((t) => `<h2>${esc(t.label)}</h2>
    <table border="1" cellpadding="6" style="border-collapse:collapse;width:100%">
      <tr><td style="width:50%"><b>Question</b></td><td><b>Accepted answers</b></td></tr>
      ${CIVICS.questions.filter((q) => q.topic === t.key).map((q) => `<tr><td>${q.n}. ${esc(q.q)}${q.star ? ' *' : ''}</td><td>${q.a.map(esc).join('<br>')}${q.uscis ? '<br><i>USCIS: ' + esc(q.uscis) + '</i>' : ''}${q.note ? '<br><i>Study note: ' + esc(q.note) + '</i>' : ''}</td></tr>`).join('')}
    </table>`).join('')}
    <p><i>Source: <a href="https://www.uscis.gov/sites/default/files/document/questions-and-answers/2025-Civics-Test-128-Questions-and-Answers.pdf">USCIS, 128 Civics Questions and Answers (2025 version)</a>.</i></p>
  </body></html>`;
}

// ---------- 3. English flashcards ----------
function englishCards() {
  const cards = ENGLISH.INTERVIEW.map((r) => ({
    front: `<div class="tag">N-400 INTERVIEW WORD</div><div class="word">${esc(r[0])}</div>`,
    back: `<div class="tag">${esc(r[0].toUpperCase())} MEANS</div><div class="mean" style="margin-top:14pt">${esc(r[1])}</div>`,
  }));
  [['reading', 'READING', 'Read it aloud'], ['writing', 'WRITING', 'Write it here']].forEach(([key, label, prompt]) => {
    ENGLISH.VOCAB[key].forEach((g) => g.words.forEach((w) => cards.push({
      front: `<div class="tag">${label} VOCABULARY · ${esc(g.group.toUpperCase())}</div><div class="word">${esc(w)}</div>`,
      back: `<div class="tag">${label} VOCABULARY · ${esc(g.group.toUpperCase())}</div><div style="margin-top:6pt">${prompt}:</div><div class="lines"></div><div class="lines"></div>`,
    })));
  });
  return cards;
}
const ENGLISH_LEAD = `The English test has three parts: speaking (your answers about your N-400), reading one of up to three sentences aloud, and writing one of up to three sentences. These cards cover the 20 interview words from the USCIS practice test "Vocabulary for the Naturalization Interview: Self-Test 2", then every word on the USCIS reading and writing vocabulary lists (rev. 07/14). Every word in the reading and writing sentences comes from those lists.`;
function englishDocHtml() {
  const vocabTable = (key) => `<table border="1" cellpadding="6" style="border-collapse:collapse;width:100%">
      <tr><td style="width:30%"><b>Group</b></td><td><b>Words</b></td></tr>
      ${ENGLISH.VOCAB[key].map((g) => `<tr><td>${esc(g.group)}</td><td>${g.words.map(esc).join(', ')}</td></tr>`).join('')}
    </table>`;
  return `<html><body>
    <h1>Naturalization English Test Flashcards</h1>
    <p>${ENGLISH_LEAD}</p>
    <p>To use as flashcards: fold the interview word table down the middle so the words are on one side and the meanings on the other. Last reviewed ${REVIEWED}.</p>
    <h2>N-400 interview words</h2>
    <table border="1" cellpadding="6" style="border-collapse:collapse;width:100%">
      <tr><td style="width:50%"><b>You may hear</b></td><td><b>It means</b></td></tr>
      ${ENGLISH.INTERVIEW.map((r) => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('')}
    </table>
    <h2>Reading vocabulary</h2>
    <p>You read one of up to three questions aloud, for example "Who was the first President?"</p>
    ${vocabTable('reading')}
    <h2>Writing vocabulary</h2>
    <p>You write one of up to three sentences the officer reads, for example "Washington was the first President."</p>
    ${vocabTable('writing')}
    <p><i>Sources: USCIS, <a href="https://www.uscis.gov/sites/default/files/document/flash-cards/reading_vocab.pdf">Reading Vocabulary</a> and <a href="https://www.uscis.gov/sites/default/files/document/flash-cards/writing_vocab.pdf">Writing Vocabulary</a> for the Naturalization Test; Self-Test 2 teacher guide, <a href="https://www.uscis.gov/citizenship">USCIS Citizenship Resource Center</a>.</i></p>
  </body></html>`;
}

// ---------- build ----------
async function main() {
  fs.mkdirSync(OUT_PDF, { recursive: true });
  fs.mkdirSync(OUT_DOC, { recursive: true });
  const docs = {
    'naturalization-checklist.html': checklistDocHtml(),
    'naturalization-civics-flashcards.html': civicsDocHtml(),
    'naturalization-english-flashcards.html': englishDocHtml(),
  };
  for (const [f, html] of Object.entries(docs)) fs.writeFileSync(path.join(OUT_DOC, f), html);

  const pdfs = {
    'naturalization-checklist.pdf': checklistPdfHtml(),
    'naturalization-civics-flashcards.pdf': flashcardPdfHtml('2025 Civics Test Flashcards', CIVICS_LEAD, PRINT_STEPS, civicsCards()),
    'naturalization-english-flashcards.pdf': flashcardPdfHtml('Naturalization English Test Flashcards', ENGLISH_LEAD, PRINT_STEPS, englishCards()),
  };
  const { chromium } = require('playwright');
  const launch = fs.existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {};
  const browser = await chromium.launch(launch);
  const page = await browser.newPage();
  for (const [f, html] of Object.entries(pdfs)) {
    await page.setContent(html, { waitUntil: 'load' });
    await page.pdf({ path: path.join(OUT_PDF, f), format: 'Letter', preferCSSPageSize: true, printBackground: true });
    console.log('wrote public/downloads/' + f);
  }
  await browser.close();
  console.log('wrote build/printables/*.html (upload to Google Drive as Google Docs)');
}
main().catch((e) => { console.error(e); process.exit(1); });
