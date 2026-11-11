/*
   American Visa Guide: 2025 civics test flashcards (/naturalization/test).
   Question data lives in /js/naturalization-test.js. Progress is saved in
   localStorage only (key avg-civics-known).
 */
(function () {
  'use strict';

  const el = function (id) { return document.getElementById(id); };
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  if (!document.getElementById('fc-card')) return;
  const DATA = window.AVG_NATZ_TEST;
  if (!DATA) return;
  const TESTS = DATA.TESTS;
  const KNOWN_KEY = 'avg-civics-known';

  const f = {
    topic: el('fc-topic'), star: el('fc-star'), focus: el('fc-focus'),
    stage: el('fc-stage'), empty: el('fc-empty'), card: el('fc-card'),
    num: el('fc-num'), q: el('fc-q'), a: el('fc-a'), uscis: el('fc-uscis'), note: el('fc-note'),
    badge: el('fc-star-badge'), pos: el('fc-pos'), topicLabel: el('fc-topic-label'),
    status: el('fc-status'), known: el('fc-known'), all: el('fc-all'),
  };
  let deck = [], pos = 0;

  function loadKnown() { try { return JSON.parse(localStorage.getItem(KNOWN_KEY)) || {}; } catch (e) { return {}; } }
  function saveKnown(m) { try { localStorage.setItem(KNOWN_KEY, JSON.stringify(m)); } catch (e) { /* storage unavailable */ } }
  const TEST_ID = '2025';
  function cardId(q) { return TEST_ID + ':' + q.n; }
  function test() { return TESTS[TEST_ID]; }
  function topicLabel(key) {
    const t = test().topics.filter(function (x) { return x.key === key; })[0];
    return t ? t.label : '';
  }

  function fillTopics() {
    f.topic.innerHTML = '<option value="all">All topics</option>' + test().topics.map(function (t) {
      return '<option value="' + t.key + '">' + esc(t.label) + '</option>';
    }).join('');
  }

  function filtered() {
    const topic = f.topic.value;
    return test().questions.filter(function (q) {
      if (topic !== 'all' && q.topic !== topic) return false;
      if (f.star.checked && !q.star) return false;
      return true;
    });
  }

  function build() {
    const list = filtered();
    const known = loadKnown();
    deck = f.focus.checked ? list.filter(function (q) { return !known[cardId(q)]; }) : list.slice();
    pos = 0;
    renderCard(list.length);
    renderList();
    updateStatus();
  }

  function renderCard(listLen) {
    const has = deck.length > 0;
    f.stage.hidden = !has;
    f.empty.hidden = has;
    if (!has) {
      f.empty.textContent = (f.focus.checked && (listLen === undefined || listLen > 0))
        ? 'You have marked every card in this set "Got it". Untick "Only cards I still need to review" to go through them all again.'
        : 'No questions match these filters.';
      return;
    }
    if (pos >= deck.length) pos = deck.length - 1;
    if (pos < 0) pos = 0;
    const q = deck[pos];
    f.card.classList.remove('is-flipped');
    f.num.textContent = 'Question ' + q.n + ' of ' + test().questions.length;
    f.q.textContent = q.q;
    f.badge.innerHTML = q.star ? '<span class="fc-star">* 65/20 question</span>' : '';
    f.a.innerHTML = q.a.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
    f.uscis.hidden = !q.uscis;
    f.uscis.textContent = q.uscis ? 'USCIS: ' + q.uscis : '';
    f.note.hidden = !q.note;
    f.note.textContent = q.note ? 'Study note: ' + q.note : '';
    f.pos.textContent = 'Card ' + (pos + 1) + ' of ' + deck.length;
    f.topicLabel.textContent = topicLabel(q.topic);
    const known = loadKnown();
    f.known.setAttribute('aria-pressed', String(!!known[cardId(q)]));
  }

  function renderList() {
    const t = test();
    f.all.innerHTML = filtered().map(function (q) {
      return '<li value="' + q.n + '"><strong>' + esc(q.q) + (q.star ? ' *' : '') + '</strong><span>' + q.a.map(esc).join(' · ') +
        (q.uscis ? ' [' + esc(q.uscis) + ']' : '') + '</span></li>';
    }).join('');
    const summary = document.querySelector('.fc-list summary');
    if (summary) summary.textContent = (function (n) { return n === 1 ? 'Show this question and its answers' : 'Show these ' + n + ' questions and answers as a list'; })(filtered().length);
  }

  function updateStatus() {
    const known = loadKnown();
    const prefix = TEST_ID + ':';
    const n = Object.keys(known).filter(function (k) { return known[k] && k.indexOf(prefix) === 0; }).length;
    const t = test();
    f.status.textContent = n + ' of ' + t.questions.length + ' marked "Got it". On test day you need ' + t.pass + ' of up to ' + t.asked + ' correct.';
  }

  function flip() { f.card.classList.toggle('is-flipped'); }
  function next() { if (pos < deck.length - 1) { pos++; renderCard(); } }
  function prev() { if (pos > 0) { pos--; renderCard(); } }
  function mark(isKnown) {
    if (!deck.length) return;
    const q = deck[pos];
    const m = loadKnown();
    if (isKnown) m[cardId(q)] = true; else delete m[cardId(q)];
    saveKnown(m);
    updateStatus();
    if (isKnown && f.focus.checked) {
      deck.splice(pos, 1);
      renderCard();
    } else if (pos < deck.length - 1) {
      pos++; renderCard();
    } else {
      renderCard();
    }
  }

  fillTopics();
  f.topic.addEventListener('change', build);
  f.star.addEventListener('change', build);
  f.focus.addEventListener('change', build);
  f.card.addEventListener('click', flip);
  el('fc-flip').addEventListener('click', flip);
  el('fc-next').addEventListener('click', next);
  el('fc-prev').addEventListener('click', prev);
  el('fc-known').addEventListener('click', function () { mark(true); });
  el('fc-review').addEventListener('click', function () { mark(false); });
  el('fc-shuffle').addEventListener('click', function () {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = deck[i]; deck[i] = deck[j]; deck[j] = t;
    }
    pos = 0; renderCard();
  });
  el('fc-reset').addEventListener('click', function () {
    const m = loadKnown();
    const prefix = TEST_ID + ':';
    Object.keys(m).forEach(function (k) { if (k.indexOf(prefix) === 0) delete m[k]; });
    saveKnown(m);
    build();
    f.status.textContent = 'Progress reset. All cards are back in the deck.';
  });
  document.addEventListener('keydown', function (e) {
    const r = f.card.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') prev();
    else if ((e.key === ' ' || e.key === 'Enter') && (e.target === f.card || e.target === document.body)) { e.preventDefault(); flip(); }
  });
  build();

})();
