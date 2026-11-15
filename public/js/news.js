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
      "id": "8d5f5a83f1",
      "date": "2026-11-15",
      "type": "community",
      "source": "Reddit: r/NationalVisaCenter, r/K1VisaInfo and others",
      "title": "London this week: 8–15 November. Some rebooked interviews pushed again to January",
      "url": "",
      "note": "London is still working through interviews it cancelled in September. This week some of those rebooked November dates were moved again, to early January. Interviews that went ahead mostly ended in approval, with public charge now a regular topic. These are member reports, not an embassy announcement.",
      "period": {
        "from": "2026-11-08",
        "to": "2026-11-15"
      },
      "points": [
        {
          "label": "Interview letters and scheduling",
          "text": "No one reported a new interview letter for a case waiting at NVC. Applicants DQ'd in June 2026 say they are still waiting, even though the scheduling tool lists June DQs for immediate relatives. Direct consular filing petitioners expect London to clear its rebooking backlog before it takes new filings."
        },
        {
          "label": "Reschedules and cancellations",
          "text": "Several K-1 and spousal applicants whose September interviews had been rebooked for 12 or 13 November were emailed, a day or two before, that the date had moved again to early January 2027. Others with 13 November dates still had their interviews and said only one window was open. Two applicants were turned away or rescheduled because their medical results had not reached the embassy. The panel physician allows 5 working days for results to arrive, so leave at least that between the medical and the interview."
        },
        {
          "label": "Outcomes",
          "text": "Applicants with rebooked September interviews reported approvals this week, including an IR-1 on 9 November. Approved cases typically spend 2 to 5 working days in administrative processing before CEAC shows Issued. One applicant interviewed on 6 November had their passport posted on 12 November."
        },
        {
          "label": "Public charge and 221(g)",
          "text": "Officers are asking about housing plans, health insurance, savings and work plans. One IR-1 applicant was approved with only a savings statement. At least two applicants were refused on public charge grounds (212(a)(4)), including an IR-1 family of five relying on a joint sponsor near the minimum. One K-1 was given a 221(g) for insurance and job-search evidence. Cases put in 221(g) in June to August report little movement after 4 to 5 months, though one August K-1 was automatically scheduled for a re-interview in late November."
        }
      ],
      "sources": [
        {
          "label": "It was moved.... again",
          "url": "https://www.reddit.com/r/K1VisaInfo/comments/1xsn3lj/it_was_moved_again/"
        },
        {
          "label": "London new interviews",
          "url": "https://www.reddit.com/r/NationalVisaCenter/comments/1xv9p6m/london_new_interviews/"
        },
        {
          "label": "London IR1 interview complete",
          "url": "https://www.reddit.com/r/NationalVisaCenter/comments/1xrrpwy/london_ir1_interview_complete/"
        },
        {
          "label": "Husband's IR-1 refused due to public charge",
          "url": "https://www.reddit.com/r/NationalVisaCenter/comments/1xssq6h/husbands_ir1_refused_due_to_public_charge/"
        },
        {
          "label": "Fiancé went to London K-1 interview, turned away",
          "url": "https://www.reddit.com/r/K1VisaInfo/comments/1xro25n/fiance_went_to_london_k1_interview_turned_away/"
        },
        {
          "label": "London IR1/CR1: latest DQ dates receiving interview letters",
          "url": "https://www.reddit.com/r/NationalVisaCenter/comments/1xwa498/london_ir1cr1_latest_dq_dates_receiving_interview/"
        }
      ]
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
    .news-points { margin:0.5rem 0 0; padding-left:1.25rem; line-height:1.55; }
    .news-points li { margin:0 0 0.35rem; }
    .news-sources { margin:0.5rem 0 0; font-size:14px; color:#334155; line-height:1.55; }
    .news-sources a { color:#1e293b; text-decoration:underline; text-underline-offset:2px; }
    .news-empty { color:#334155; }
    .news-more { margin:1rem 0 0; }
    .news-more a { color:#1e293b; font-weight:600; text-decoration:underline; text-underline-offset:2px; }`;

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];

  function formatDate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return `${d} ${MONTHS[m - 1]} ${y}`;
  }

  // Weekly roundups cover a period: "8–15 November 2026".
  function formatRange({ from, to }) {
    const [fy, fm, fd] = from.split('-').map(Number);
    const [ty, tm, td] = to.split('-').map(Number);
    if (fy === ty && fm === tm) return `${fd}–${td} ${MONTHS[tm - 1]} ${ty}`;
    if (fy === ty) return `${fd} ${MONTHS[fm - 1]} – ${td} ${MONTHS[tm - 1]} ${ty}`;
    return `${formatDate(from)} – ${formatDate(to)}`;
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
      el('time', { datetime: item.date }, item.period ? formatRange(item.period) : formatDate(item.date)),
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

    // Weekly roundup: one point per topic, then the threads it draws on.
    if (Array.isArray(item.points) && item.points.length) {
      const ul = el('ul', { class: 'news-points' });
      item.points.forEach((pt) => {
        const row = el('li');
        if (pt.label) row.append(el('strong', null, `${pt.label}: `));
        row.append(document.createTextNode(pt.text));
        ul.append(row);
      });
      li.append(ul);
    }
    if (Array.isArray(item.sources) && item.sources.length) {
      const p = el('p', { class: 'news-sources' }, 'From these threads: ');
      item.sources.filter((s) => /^https?:\/\//.test(s.url)).forEach((s, i) => {
        if (i) p.append(document.createTextNode(' · '));
        p.append(el('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer' }, s.label));
      });
      li.append(p);
    }
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
