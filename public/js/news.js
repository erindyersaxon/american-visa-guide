/*
   American Visa Guide: Embassy and visa news
   Single source of truth for the news list on /news.

   HOW ITEMS GET HERE
     A daily job (scripts/news/collect.mjs) finds candidate items and puts
     them in a review queue (data/news-queue.json). Nothing reaches this
     file until it is approved:

       npm run news:review                         list pending items
       npm run news:review -- approve <id> --note "What it means for you"
       npm run news:review -- reject <id> [<id> ...]
       npm run news:review -- add --type community --source "r/NationalVisaCenter" \
           --title "..." --url "https://..." --date 2026-10-23 --note "..."

     Use `add` for things no feed can reach: Reddit threads, Instagram
     posts, emails members forward.

   EDITING BY HAND
     The ITEMS block below is rewritten by review.mjs, so it must stay
     valid JSON (double quotes, no trailing commas). Fields:
       id      any unique string
       date    YYYY-MM-DD, the date the source published it
       type    'official' | 'press' | 'community'
       source  who published it, e.g. "US Embassy London"
       title   headline, as published
       url     link to the original
       note    optional: one or two plain-English sentences on what it
               means for a family visa applicant at London

   Mounts: <div data-news></div> on /news (full list with filters), and
   <div data-news data-news-limit="5"></div> at the bottom of the
   homepage. Bump ?v= on the script tag in BOTH pages after edits.
 */
(function () {
  'use strict';

  // BEGIN NEWS ITEMS
  const ITEMS = [
    {
      "id": "647fe42890",
      "date": "2026-11-14",
      "type": "community",
      "source": "r/NationalVisaCenter",
      "title": "London still mostly rebooking cancelled interviews; scheduling tool unchanged",
      "url": "https://www.reddit.com/r/NationalVisaCenter/comments/1xpgxto/updated_november_2026_iv_scheduling_tool_for/",
      "note": "Applicants report London is still mainly rebooking interviews cancelled during the pause. The embassy's November scheduling tool update shows no change: June 2026 DQs for immediate relatives, March 2026 for family preference and February 2026 for employment-based cases. Applicants DQ'd in June and July report no interview letters yet, though one IR-1 direct consular filing case reports a new interview set for December. These are member reports, not an embassy announcement."
    },
    {
      "id": "39e4c91231",
      "date": "2026-11-14",
      "type": "community",
      "source": "r/NationalVisaCenter",
      "title": "London rebooked interviews continue into December, some at short notice",
      "url": "https://www.reddit.com/r/NationalVisaCenter/comments/1xdeu0k/london_embassy_just_got_a_rescheduled_interview/",
      "note": "Applicants whose September and October interviews were cancelled report new dates on 13, 17 and 25 November and 8 and 10 December, across K-1, IR-1, F2A and EB-3 cases. Some new dates arrive only 7 to 11 days ahead, and at least one K-1 interview was moved again, from 12 November to January. Two applicants report being turned away or rescheduled because their medical results had not reached the embassy in time, so book the medical as soon as a date arrives. These are member reports, not an embassy announcement."
    },
    {
      "id": "db1c375b1a",
      "date": "2026-11-14",
      "type": "community",
      "source": "r/NationalVisaCenter",
      "title": "London approvals resume, with more public charge questions at interview",
      "url": "https://www.reddit.com/r/NationalVisaCenter/comments/1xrrpwy/london_ir1_interview_complete/",
      "note": "Applicants report approvals for rebooked IR-1, F2A and K-1 interviews, usually with the passport kept and a few days of administrative processing before the case shows Issued. Interviews now include public charge questions on housing, health insurance, savings and work plans. Reports include an IR-1 refused under 212(a)(4) and a K-1 given a 221(g) asking for insurance and job-search evidence. Cases put in 221(g) before the pause (April to August) report little movement, though one K-1 from August was automatically scheduled for a re-interview in late November. These are member reports, not an embassy announcement."
    },
    {
      "id": "reddit-2026-10-23-reschedules",
      "date": "2026-10-23",
      "type": "community",
      "source": "r/NationalVisaCenter",
      "title": "London emails new dates for interviews canceled in September and October",
      "url": "https://www.reddit.com/r/NationalVisaCenter/",
      "note": "Applicants report September interviews moved to November and October interviews moved to December. These are member reports, not an embassy announcement."
    }
  ];
  // END NEWS ITEMS

  const TYPES = {
    official: { label: 'Official', hint: 'From a US government source' },
    press: { label: 'Press', hint: 'From a news outlet' },
    community: { label: 'Community', hint: 'Reported by applicants; not confirmed by the embassy' },
  };

  const CSS = `
    .news-filters { display:flex; flex-wrap:wrap; gap:0.5rem; margin:0 0 1.25rem; }
    .news-filters button { font:inherit; font-size:15px; padding:0.35rem 0.85rem; border-radius:var(--radius-md, 0.375rem); border:1px solid #cbd5e1; background:#fff; color:#1e293b; cursor:pointer; }
    .news-filters button[aria-pressed="true"] { background:#1e293b; border-color:#1e293b; color:#fff; }
    .news-list { list-style:none; margin:0; padding:0; }
    .news-item { padding:1rem 0; border-bottom:1px solid #e3ddd0; }
    .news-item:first-child { padding-top:0; }
    .news-meta { display:flex; flex-wrap:wrap; align-items:center; gap:0.5rem; font-size:14px; color:#334155; margin:0 0 0.3rem; }
    .news-tag { font-size:13px; font-weight:700; padding:0.1rem 0.5rem; border-radius:4px; }
    .news-tag--official { background:#e1ecf2; color:#24485a; }
    .news-tag--press { background:#efe9dc; color:#5a4a26; }
    .news-tag--community { background:#ece4f2; color:#4d2f6b; }
    .news-title { font-size:17px; font-weight:600; line-height:1.4; margin:0 0 0.3rem; }
    .news-title a { color:#1e293b; text-decoration:underline; text-underline-offset:2px; }
    .news-note { margin:0; line-height:1.55; max-width:none; }
    .news-empty { color:#334155; }
    .news-more { margin:1rem 0 0; }
    .news-more a { color:#1e293b; font-weight:600; text-decoration:underline; text-underline-offset:2px; }`;

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];

  function formatDate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return `${d} ${MONTHS[m - 1]} ${y}`;
  }

  function el(tagName, attrs, text) {
    const node = document.createElement(tagName);
    Object.entries(attrs || {}).forEach(([k, v]) => node.setAttribute(k, v));
    if (text != null) node.textContent = text;
    return node;
  }

  function itemNode(item) {
    const type = TYPES[item.type] || TYPES.press;
    const li = el('li', { class: 'news-item', 'data-type': item.type });

    const meta = el('p', { class: 'news-meta' });
    meta.append(
      el('span', { class: `news-tag news-tag--${item.type}`, title: type.hint }, type.label),
      el('time', { datetime: item.date }, formatDate(item.date)),
      document.createTextNode('·'),
      el('span', null, item.source)
    );

    const title = el('p', { class: 'news-title' });
    if (/^https?:\/\//.test(item.url)) {
      title.append(el('a', { href: item.url, target: '_blank', rel: 'noopener noreferrer' }, item.title));
    } else {
      title.textContent = item.title;
    }

    li.append(meta, title);
    if (item.note) li.append(el('p', { class: 'news-note' }, item.note));
    return li;
  }

  function render(mount) {
    // data-news-limit="5" shows the newest five, without filters, plus a
    // link to the full list (the homepage). No limit: everything (/news).
    const limit = parseInt(mount.dataset.newsLimit, 10) || 0;
    const all = ITEMS.slice().sort((a, b) => b.date.localeCompare(a.date));
    const items = limit ? all.slice(0, limit) : all;
    mount.replaceChildren();

    if (!items.length) {
      mount.append(el('p', { class: 'news-empty' }, 'No news yet.'));
      return;
    }

    const list = el('ul', { class: 'news-list' });
    items.forEach(i => list.append(itemNode(i)));

    if (limit) {
      mount.append(list);
      const more = el('p', { class: 'news-more' });
      more.append(el('a', { href: '/news' }, all.length > limit ? `All ${all.length} news items →` : 'Embassy and visa news →'));
      mount.append(more);
      return;
    }

    const present = Object.keys(TYPES).filter(t => items.some(i => i.type === t));
    if (present.length > 1) {
      const bar = el('div', { class: 'news-filters', role: 'group', 'aria-label': 'Filter by source' });
      ['all', ...present].forEach(t => {
        const btn = el('button', { type: 'button', 'data-filter': t, 'aria-pressed': String(t === 'all') },
          t === 'all' ? 'All' : TYPES[t].label);
        btn.addEventListener('click', () => {
          bar.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
          list.querySelectorAll('.news-item').forEach(li => {
            li.hidden = t !== 'all' && li.dataset.type !== t;
          });
        });
        bar.append(btn);
      });
      mount.append(bar);
    }
    mount.append(list);
  }

  function init() {
    const mounts = document.querySelectorAll('[data-news]');
    if (!mounts.length) return;
    if (!document.getElementById('news-css')) {
      const st = el('style', { id: 'news-css' });
      st.textContent = CSS;
      document.head.append(st);
    }
    mounts.forEach(render);
  }

  window.AVG_NEWS = { items: ITEMS, render: init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
