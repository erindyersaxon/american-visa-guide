/*
   American Visa Guide: "Which pause?" glossary.
   Single source of truth for the four things this site's readers call a
   "pause". Mounts into every <div data-pause-glossary></div> on the page.
   Self-styled so it renders on pages with or without the stage/article CSS.
   Edit the rows HERE only; every page updates.
 */
(function () {
  'use strict';

  const ROWS = [
    {
      term: 'Interview cancellations',
      what: 'London immigrant visa interviews booked for September 2026 were canceled so officers could take the new public charge training. Same-day document checks were canceled with them.',
      status: 'Being rescheduled by email. Not a refusal.',
      uk: 'Yes: every London immigrant visa applicant, whatever their nationality.',
      link: '/guide#interview-cancellations',
      linkText: 'Live notice',
    },
    {
      term: 'Nationality visa pause (75 countries)',
      what: 'From 21 January 2026, a 221(g) refusal for every immigrant visa applicant holding the nationality of one of 75 listed countries.',
      status: 'Vacated by a court on 21 August 2026, and the guidance behind it rescinded on 10 September 2026. Refusals made only because of it are being reconsidered.',
      uk: 'No. The UK was not on the list. It applied at London only to applicants interviewing on a listed passport.',
      link: '/september-2026-update',
      linkText: 'Both pauses vacated',
    },
    {
      term: 'Diversity visa pause',
      what: 'From 20 December 2025, a 221(g) refusal for every diversity visa applicant.',
      status: 'Temporarily vacated by a court on 28 August 2026 (a preliminary injunction), and the guidance rescinded on 10 September 2026.',
      uk: 'Only diversity visa applicants.',
      link: '/september-2026-update#courts',
      linkText: 'What the courts decided',
    },
    {
      term: 'Travel ban (Proclamation 10998)',
      what: 'A separate presidential proclamation suspending immigrant visas for nationals of 39 countries.',
      status: 'Still in force. The pause rulings do not affect it.',
      uk: 'No, unless you also hold a listed nationality. Check its dual-national exception.',
      link: '/221g#confusions',
      linkText: '221(g) vs AP vs pause',
    },
  ];

  const CSS = `
    .pause-glossary { margin:1.25rem 0 1.75rem; border:1px solid #ddd6cb; border-radius:10px; background:#fdfaf3; overflow:hidden; font-size:0.86rem; line-height:1.55; }
    .pause-glossary summary { cursor:pointer; padding:0.8rem 1.1rem; font-weight:700; color:#2f5a6e; list-style:none; }
    .pause-glossary summary::-webkit-details-marker { display:none; }
    .pause-glossary summary::before { content:"\\25B8"; display:inline-block; margin-right:0.5rem; transition:transform .15s; }
    .pause-glossary[open] summary::before { transform:rotate(90deg); }
    .pause-glossary__intro { padding:0 1.1rem 0.6rem; color:#6a6560; margin:0; }
    .pause-glossary__list { display:grid; gap:0; margin:0; padding:0; list-style:none; border-top:1px solid #e7e0d4; }
    .pause-glossary__row { display:grid; grid-template-columns: 11rem 1fr; gap:0.35rem 1rem; padding:0.75rem 1.1rem; border-bottom:1px solid #e7e0d4; }
    .pause-glossary__row:last-child { border-bottom:none; }
    .pause-glossary__term { font-weight:700; color:#1e1c17; }
    .pause-glossary__body p { margin:0 0 0.3rem; }
    .pause-glossary__body p:last-child { margin:0; }
    .pause-glossary__label { font-weight:600; color:#6a6560; }
    .pause-glossary a { color:#2f5a6e; font-weight:600; }
    @media (max-width:600px) { .pause-glossary__row { grid-template-columns:1fr; } }
    @media print { .pause-glossary summary::before { content:none; } }`;

  function markup(open) {
    const rows = ROWS.map(r => `
      <li class="pause-glossary__row">
        <div class="pause-glossary__term">${r.term}</div>
        <div class="pause-glossary__body">
          <p>${r.what}</p>
          <p><span class="pause-glossary__label">Status:</span> ${r.status}</p>
          <p><span class="pause-glossary__label">Affects UK nationals at London?</span> ${r.uk} <a href="${r.link}">${r.linkText}</a></p>
        </div>
      </li>`).join('');
    return `
    <details class="pause-glossary"${open ? ' open' : ''}>
      <summary>Which "pause" do you mean? Four different things share the word</summary>
      <p class="pause-glossary__intro">On this site, "interview cancellations" means the September rescheduling. "Pause" means one of the two refusal policies the courts struck down.</p>
      <ul class="pause-glossary__list">${rows}</ul>
    </details>`;
  }

  function render() {
    const mounts = document.querySelectorAll('[data-pause-glossary]');
    if (!mounts.length) return;
    if (!document.getElementById('pause-glossary-css')) {
      const st = document.createElement('style');
      st.id = 'pause-glossary-css';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    mounts.forEach(el => {
      el.outerHTML = markup(el.getAttribute('data-pause-glossary') === 'open').trim();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
