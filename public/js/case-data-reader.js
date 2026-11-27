/*
   American Visa Guide: myUSCIS case data reader (/tools/case-data-reader)

   Reads the JSON a visitor copies from their own signed-in myUSCIS account
   and explains it: which office holds the case, the events with their
   published names, and whether the record changed after the latest event.

   Everything happens in the visitor's browser. Nothing is sent, stored or
   logged: no fetch, no storage, no analytics on the page (the page sets
   data-no-trackers, which consent.js obeys). The receipt number is never
   shown back.

   The parsing and summary functions are pure and exported for tests
   (test/case-data-reader.test.js). The DOM code below them runs only in a
   browser.
 */
(function (root) {
  'use strict';

  const RECEIPT_RE = /^[A-Z]{3}\d{10}$/;

  const LINKS = [
    { key: 'caseStatus', label: 'Office', path: 'https://my.uscis.gov/account/case-service/api/case_status/' },
    { key: 'cases', label: 'Events and updates', path: 'https://my.uscis.gov/account/case-service/api/cases/' },
    { key: 'receiptInfo', label: 'Location field', path: 'https://my.uscis.gov/secure-messaging/api/case-service/receipt_info/' },
  ];

  /* ---- Parsing ------------------------------------------------------ */

  function normaliseReceipt(text) {
    const r = String(text || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    return RECEIPT_RE.test(r) ? r : null;
  }

  function linksFor(receipt) {
    const r = normaliseReceipt(receipt);
    if (!r) return [];
    return LINKS.map(l => ({ key: l.key, label: l.label, url: l.path + r }));
  }

  /* Split pasted text into its top-level JSON objects, so a visitor can
     paste one response or several one after another. */
  function splitJson(text) {
    const out = [];
    let depth = 0, start = -1, inStr = false, esc = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (inStr) {
        if (esc) esc = false;
        else if (ch === '\\') esc = true;
        else if (ch === '"') inStr = false;
        continue;
      }
      if (ch === '"') { if (depth > 0) inStr = true; continue; }
      if (ch === '{') { if (depth === 0) start = i; depth++; }
      else if (ch === '}' && depth > 0) {
        depth--;
        if (depth === 0) { out.push(text.slice(start, i + 1)); start = -1; }
      }
    }
    return out;
  }

  /* First value stored under `key` anywhere in obj, breadth first. */
  function findKey(obj, key) {
    const queue = [obj];
    while (queue.length) {
      const cur = queue.shift();
      if (!cur || typeof cur !== 'object') continue;
      if (!Array.isArray(cur) && Object.prototype.hasOwnProperty.call(cur, key)) return cur[key];
      for (const v of Object.values(cur)) if (v && typeof v === 'object') queue.push(v);
    }
    return undefined;
  }

  function classify(obj) {
    if (obj && typeof obj.error === 'string') return 'error';
    if (findKey(obj, 'receipt_details') !== undefined) return 'receiptInfo';
    if (findKey(obj, 'jurisdiction') !== undefined) return 'caseStatus';
    if (Array.isArray(findKey(obj, 'events'))) return 'cases';
    return 'unknown';
  }

  function parseInput(text) {
    const docs = { cases: null, caseStatus: null, receiptInfo: null };
    const errors = [];
    let unreadable = 0;
    const parts = splitJson(String(text || ''));
    for (const part of parts) {
      let obj;
      try { obj = JSON.parse(part); } catch (e) { unreadable++; continue; }
      const kind = classify(obj);
      if (kind === 'error') errors.push(obj.error);
      else if (kind === 'unknown') unreadable++;
      else docs[kind] = obj;
    }
    if (!parts.length && String(text || '').trim()) unreadable++;
    return { docs, errors, unreadable };
  }

  /* ---- Dates -------------------------------------------------------- */

  function toDate(v) {
    if (v === null || v === undefined || v === '') return null;
    const d = typeof v === 'number' ? new Date(v) : new Date(String(v));
    return isNaN(d.getTime()) ? null : d;
  }

  /* USCIS sends a plain date ("2026-11-06") beside each timestamp. Prefer
     it, because it is the day USCIS recorded; fall back to the UTC day. */
  function dayOf(plain, stamp) {
    if (typeof plain === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(plain)) return plain;
    const d = toDate(stamp !== undefined ? stamp : plain);
    return d ? d.toISOString().slice(0, 10) : null;
  }

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];

  function formatDay(day) {
    if (!day) return 'unknown date';
    const [y, m, d] = day.split('-').map(Number);
    return d + ' ' + MONTHS[m - 1] + ' ' + y;
  }

  /* ---- Summary ------------------------------------------------------ */

  function officeKind(code, name) {
    const n = String(name || '').toUpperCase();
    const c = String(code || '').toUpperCase();
    if (n.includes('SERVICE CENTER') || ['NSC', 'CSC', 'TSC', 'VSC', 'YSC'].includes(c)) return 'service-center';
    if (n.includes('BENEFITS CENTER') || c === 'NBC') return 'nbc';
    if (/,\s*[A-Z]{2}$/.test(n)) return 'field-office';
    return 'unknown';
  }

  function summarise(parsed, codes) {
    const { docs } = parsed;
    const names = codes || {};
    const s = {
      found: { cases: !!docs.cases, caseStatus: !!docs.caseStatus, receiptInfo: !!docs.receiptInfo },
      accessDenied: parsed.errors.some(e => /access denied/i.test(e)),
      errors: parsed.errors,
      unreadable: parsed.unreadable,
      office: null, location: null,
      form: null, received: null, lastUpdated: null,
      events: [], silentUpdate: null,
    };

    if (docs.caseStatus) {
      const code = findKey(docs.caseStatus, 'jurisdiction');
      const name = findKey(docs.caseStatus, 'jurisdictionDescription');
      if (code || name) s.office = { code: code || null, name: name || null, kind: officeKind(code, name) };
    }

    if (docs.receiptInfo) {
      const loc = findKey(docs.receiptInfo, 'location');
      if (loc) s.location = String(loc);
      s.form = s.form || findKey(docs.receiptInfo, 'form') || null;
    }

    if (docs.cases) {
      const c = docs.cases;
      s.form = findKey(c, 'formType') || s.form;
      s.received = dayOf(findKey(c, 'submissionDate'), findKey(c, 'submissionTimestamp'));
      const updStamp = findKey(c, 'updatedAtTimestamp');
      const upd = toDate(updStamp);
      s.lastUpdated = upd ? { day: dayOf(findKey(c, 'updatedAt'), updStamp), time: upd.toISOString().slice(11, 16) } : null;

      const events = findKey(c, 'events') || [];
      s.events = events.filter(e => e && typeof e === 'object').map(e => {
        const code = e.eventCode ? String(e.eventCode) : null;
        const day = dayOf(e.eventDateTime || e.createdAt, e.eventTimestamp || e.createdAtTimestamp);
        const changedDay = dayOf(e.updatedAt, e.updatedAtTimestamp);
        return {
          code,
          name: code && names[code] ? names[code] : null,
          day,
          changed: changedDay && day && changedDay > day ? changedDay : null,
        };
      }).sort((a, b) => String(b.day).localeCompare(String(a.day)));

      const latest = s.events.reduce((m, e) => {
        const d = e.changed || e.day;
        return d && (!m || d > m) ? d : m;
      }, null);
      if (s.lastUpdated && s.lastUpdated.day && latest && s.lastUpdated.day > latest) {
        s.silentUpdate = { updated: s.lastUpdated.day, latestEvent: latest };
      }
    }
    return s;
  }

  /* ---- Words -------------------------------------------------------- */

  function officeSentence(office) {
    const label = [office.name, office.code && office.name ? '(' + office.code + ')' : office.code].filter(Boolean).join(' ');
    switch (office.kind) {
      case 'field-office':
        return { tone: 'good', title: 'A field office: ' + label,
          text: 'Members whose case data named a field office here later had the move confirmed by a congressional office or by USCIS.' };
      case 'service-center':
        return { tone: 'info', title: 'A service center: ' + label,
          text: 'USCIS has moved most immediate-relative I-130s to field offices, but this data still names a service center. Many members see this for months before it changes.' };
      case 'nbc':
        return { tone: 'info', title: 'The National Benefits Center: ' + label,
          text: 'The National Benefits Center prepares cases for field offices. It is part of the field office side of USCIS.' };
      default:
        return { tone: 'info', title: 'USCIS lists: ' + label,
          text: 'We do not know what kind of office this is. USCIS does not publish a list of these codes.' };
    }
  }

  function locationSentence(location, office) {
    if (String(location).toUpperCase() === 'FOD') {
      let text = 'FOD stands for Field Operations Directorate, the part of USCIS that runs field offices. On its own it does not mean your petition has reached a field office.';
      if (office && office.kind === 'service-center') text += ' Members often see FOD here while the office above still names a service center.';
      return text;
    }
    return 'USCIS does not explain this field.';
  }

  /* ---- Browser ------------------------------------------------------ */

  function el(tag, attrs, children) {
    const n = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (k === 'text') n.textContent = v;
      else if (k === 'className') n.className = v;
      else n.setAttribute(k, v);
    }
    (children || []).forEach(c => { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }

  function box(tone, title, paragraphs) {
    return el('div', { className: 'cdr-box cdr-box--' + tone }, [
      el('p', { className: 'cdr-box__title', text: title }),
      ...paragraphs.map(p => el('p', { text: p })),
    ]);
  }

  function renderResults(target, s) {
    target.textContent = '';
    const nothing = !s.found.cases && !s.found.caseStatus && !s.found.receiptInfo;

    if (s.accessDenied) {
      target.appendChild(box('warn', 'USCIS said "Access Denied"', [
        'Since about 22 November 2026, members report these links return "Access Denied", even when signed in. Make sure you are signed in to my.uscis.gov in this same browser and try again later.',
        'The myUSCIS case page still has to load this data to show your case, so it may still appear in your browser\'s developer tools (Network tab). We have not confirmed this.',
      ]));
    } else if (s.errors.length) {
      target.appendChild(box('warn', 'USCIS sent back an error', ['Make sure you are signed in to my.uscis.gov in this same browser, and that the receipt number is yours.']));
    }
    if (nothing) {
      if (!s.errors.length) target.appendChild(box('warn', 'We could not find any case data in that', ['Copy everything on the page (Ctrl+A or Cmd+A, then copy) and paste it again. You can paste the text from one link or from all three, one after another.']));
      return;
    }

    const sec = (title, children) => el('section', { className: 'cdr-section' }, [el('h3', { text: title }), ...children]);

    // Office
    const officeParts = [];
    if (s.office) {
      const o = officeSentence(s.office);
      officeParts.push(box(o.tone, o.title, [o.text]));
    } else {
      officeParts.push(el('p', { text: 'Paste the text from the Office link to see which office holds your petition.' }));
    }
    if (s.location) {
      officeParts.push(el('p', {}, [el('strong', { text: 'Location field: ' + s.location + '. ' }), locationSentence(s.location, s.office)]));
    }
    target.appendChild(sec('Which office has it', officeParts));

    // Record
    if (s.found.cases || s.form) {
      const rows = [];
      if (s.form) rows.push(['Form', String(s.form)]);
      if (s.received) rows.push(['Received', formatDay(s.received)]);
      if (s.lastUpdated) rows.push(['Record last changed', formatDay(s.lastUpdated.day) + ', ' + s.lastUpdated.time + ' UTC']);
      const dl = el('dl', { className: 'cdr-facts' }, rows.flatMap(([k, v]) => [el('dt', { text: k }), el('dd', { text: v })]));
      const parts = [dl];
      if (s.silentUpdate) {
        parts.push(box('info', 'Changed after the latest event', [
          'Your record changed on ' + formatDay(s.silentUpdate.updated) + ', after the latest event (' + formatDay(s.silentUpdate.latestEvent) + '). Members call this a silent update.',
          'It does not say what changed. Uploads, address changes, transfers and updates across the whole system all cause them, so on its own it is not a sign of progress.',
        ]));
      }
      target.appendChild(sec('Your record', parts));
    }

    // Events
    if (s.found.cases) {
      const parts = [];
      if (!s.events.length) {
        parts.push(el('p', { text: 'There are no events in this data.' }));
      } else {
        const tbody = el('tbody', {}, s.events.map(e => el('tr', {}, [
          el('td', { text: formatDay(e.day) }),
          el('td', {}, [el('code', { text: e.code || '?' })]),
          el('td', {}, [
            e.name ? sentenceCase(e.name) : el('em', { text: 'Not in the published code list. Nobody outside USCIS knows what it means.' }),
            e.changed ? el('span', { className: 'cdr-note', text: ' Changed again on ' + formatDay(e.changed) + '.' }) : null,
          ]),
        ])));
        parts.push(el('table', { className: 'cdr-table' }, [
          el('thead', {}, [el('tr', {}, ['Date', 'Code', 'Published name'].map(h => el('th', { scope: 'col', text: h })))]),
          tbody,
        ]));
        parts.push(el('p', { className: 'cdr-note', text: 'Names come from the NIEM code list that USCIS codes are drawn from. USCIS does not publish its own list or say how it uses each code.' }));
      }
      target.appendChild(sec('Events', parts));
    }

    const missing = LINKS.filter(l => !s.found[l.key]).map(l => l.label);
    if (missing.length && !nothing) {
      target.appendChild(el('p', { className: 'cdr-note', text: 'Not pasted: ' + missing.join(', ') + '. Paste those too to see everything.' }));
    }
    if (s.unreadable) {
      target.appendChild(el('p', { className: 'cdr-note', text: 'Part of what you pasted was not case data we recognise, so we skipped it.' }));
    }
  }

  function sentenceCase(name) {
    const t = String(name).toLowerCase();
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  function initPage() {
    const receiptInput = document.getElementById('cdr-receipt');
    const linkList = document.getElementById('cdr-links');
    const linkMsg = document.getElementById('cdr-link-msg');
    const paste = document.getElementById('cdr-paste');
    const results = document.getElementById('cdr-results');
    if (!receiptInput || !paste || !results) return;

    document.getElementById('cdr-link-form').addEventListener('submit', ev => {
      ev.preventDefault();
      linkList.textContent = '';
      const links = linksFor(receiptInput.value);
      if (!links.length) {
        linkMsg.textContent = 'That does not look like a receipt number. It is three letters and ten digits, like IOE1234567890.';
        return;
      }
      linkMsg.textContent = 'Open each link in a new tab while signed in to my.uscis.gov, copy everything on the page, and paste it below.';
      links.forEach(l => linkList.appendChild(el('li', {}, [
        el('a', { href: l.url, target: '_blank', rel: 'noopener noreferrer', text: l.label }),
      ])));
    });

    document.getElementById('cdr-read-form').addEventListener('submit', ev => {
      ev.preventDefault();
      const s = summarise(parseInput(paste.value), root.AVG_NIEM_CODES);
      renderResults(results, s);
      results.hidden = false;
      results.focus();
    });

    document.getElementById('cdr-clear').addEventListener('click', () => {
      paste.value = '';
      receiptInput.value = '';
      linkList.textContent = '';
      linkMsg.textContent = '';
      results.textContent = '';
      results.hidden = true;
      paste.focus();
    });
  }

  const api = { normaliseReceipt, linksFor, splitJson, parseInput, summarise, officeKind, officeSentence, locationSentence, formatDay };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else {
    root.AVG_CaseDataReader = api;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPage);
    else initPage();
  }
})(typeof window !== 'undefined' ? window : globalThis);
