/*
   Single source of truth for the live policy notice (interview
   rescheduling, Aug–Oct 2026). Rendered on the Guide Hub and on every stage
   page the rescheduling affects. Edit the notice HERE only; every page
   updates.

   Mount points, each replaced by the rendered notice:
     <div data-live-notice="full"></div>       full banner (#interview-cancellations)
     <div data-live-notice="medical"></div>    compact repeat, Stage 4 medical
     <div data-live-notice="doc-check"></div>  compact, Stage 4 document check
     <div data-live-notice="interview"></div>  compact repeat, Stage 5 interview
     <div data-live-notice="page"></div>       self-styled compact notice for non-guide
                                               pages (221(g), public charge, tools)

   Compact notices link to the full banner: in-page when it is on the same
   page, otherwise /guide#interview-cancellations.

   Load as a classic script at the end of <body> (not deferred), so the
   #interview-cancellations anchor exists before the browser scrolls to it.
 */
(function () {
  'use strict';

  const NOTICE_HTML = `
  <div class="alert-banner" id="interview-cancellations" role="region" aria-labelledby="interview-cancellations-title">
    <div class="alert-banner__head">Interview rescheduling</div>
    <div class="alert-banner__title" id="interview-cancellations-title">Canceled August and September interviews now have October dates.</div>
    <p>The embassy canceled London immigrant visa interviews booked for August and September 2026 for public charge training. Every canceled interview we know of now has a date in <strong>October 2026</strong>. If yours was canceled, <a href="https://forms.fillout.com/t/dTRqnkx9uxus" target="_blank" rel="noopener noreferrer">submit your timeline</a> so other applicants can see your new date. <strong>Not sure what applies to you?</strong> <a href="/interview">Start from the interview hub</a>.</p>
    <p><strong>Refused under 221(g) or the visa pause?</strong> London is calling these cases back for a new interview by email. If you have not heard yet, expect a new notice. <a href="/reinterview">Re-interview after a 221(g)</a>.</p>
    <p><strong>Waiting for an Interview Letter?</strong> Regular Interview Letter drops have not resumed. The last one went out on 14 July 2026. <a href="/data">See the data</a>.</p>
    <ul>
      <li><strong>Reply to confirm your new date.</strong> The Immigrant Visa Unit sends new dates by email, not through AIS. Check your spam folder.</li>
      <li><strong>No document check? Bring every original,</strong> one passport photo and your courier confirmation page. <a href="/guide/interview#no-document-check">What to bring</a>.</li>
      <li><strong>You can only move your date later.</strong> Rescheduling in <a href="https://ais.usvisa-info.com/en-gb/iv/" target="_blank" rel="noopener noreferrer">AIS</a> pushes your case back.</li>
      <li><strong>Check your medical date.</strong> You must enter the US within 6 months of the exam. <a href="/interview-dates">Check your dates</a>.</li>
    </ul>
    <p>Background: <a href="/september-2026-update.html">both visa pauses vacated</a> and <a href="/public-charge.html">public charge</a>.</p>
    <p class="alert-banner__meta">Updated 12 October 2026.</p>
  </div>`;

  // Shared first paragraph of the compact per-stage repeats.
  function summary(fullHref) {
    return `<p>London appointments booked for August and September 2026 were canceled for a global training initiative. Every canceled interview we know of has been rescheduled for <strong>October 2026</strong>. Medicals appear to be unaffected. <a href="${fullHref}">Read the full notice →</a></p>`;
  }

  const COMPACT = {
    medical: fullHref => `
    <div class="stage-alert" role="note">
      <div class="stage-alert__head">Interview rescheduling: updated 8 October 2026</div>
      ${summary(fullHref)}
      <p><strong>At this stage:</strong> medicals themselves appear to be unaffected and are going ahead as booked. The <strong>same-day embassy document check</strong> that normally follows your medical is canceled: everything described below under <a href="#doc-check-cancelled">Same-day embassy document check</a> is on hold. Medical results are valid for <strong>6 months</strong> from the exam, and you must <strong>enter the US within those same 6 months</strong>, so note the date of your exam: an interview far enough out could leave too little time to travel, or fall outside the window and mean a new medical. Do not book or rebook a medical on that assumption until you have a confirmed interview date. <a href="#medical-validity">How the 6 months works</a>.</p>
    </div>`,

    'doc-check': fullHref => `
    <div class="stage-alert" role="note">
      <div class="stage-alert__head">Canceled: updated 8 October 2026</div>
      <p>Same-day embassy document checks were canceled alongside the interviews, for London appointments booked for August and September 2026. <strong>Do not travel to the embassy after your medical</strong> unless you are told to. Every canceled interview we know of now has an October date; we have not seen a document check rebooked. Instead, applicants without one are being told to bring <strong>all original documents and one passport photo to the interview</strong>: see <a href="/guide/interview#no-document-check">what to bring without a document check</a>. <a href="${fullHref}">Read the full notice →</a></p>
      <p>Everything below describes how the document check ran before the cancellations, and is what you will need when they resume.</p>
    </div>`,

    interview: fullHref => `
    <div class="stage-alert" role="note">
      <div class="stage-alert__head">Interview rescheduling: updated 8 October 2026</div>
      <p>London interviews booked for August and September 2026 were canceled for a global public charge training initiative. Every canceled interview we know of has been rescheduled for <strong>October 2026</strong>. If yours was canceled, <a href="https://forms.fillout.com/t/dTRqnkx9uxus" target="_blank" rel="noopener noreferrer">submit your timeline</a> so other applicants can see your new date. <a href="${fullHref}">Read the full notice →</a></p>
      <p><strong>At this stage:</strong></p>
      <ul>
        <li><strong>Attend your rescheduled appointment.</strong> Reply to the Immigrant Visa Unit's email to confirm, if you have not already.</li>
        <li><strong>You can only reschedule to a later date.</strong> Rescheduling through AIS is only possible to a date <em>after</em> your assigned appointment, so moving your date pushes your case back.</li>
        <li><strong>No document check? Bring every original.</strong> The interview pack now emailed with the notice asks for all original documents and one passport photo at the interview itself. <a href="#no-document-check">See what to bring</a>.</li>
        <li><strong>Check your passport and medical dates.</strong> Your passport should be valid for six months beyond your intended date of entry, and your medical must be at least two weeks before the new interview date. Medical results are valid for 6 months, and you must enter the US within 6 months of the exam, so the new date needs to leave you time to travel. <a href="/interview-dates">Check your dates</a>.</li>
      </ul>
      <p style="margin-bottom:0;">Everything below describes the interview itself accurately and is worth preparing now.</p>
    </div>`,
  };

  // Compact notice for pages outside the guide (221(g), public charge,
  // the pause pages, checklists, tools). Those pages do not load
  // /css/stage.css, so this variant carries its own styles (PAGE_CSS).
  COMPACT.page = fullHref => `
    <div class="page-live-notice" role="note">
      <div class="page-live-notice__head">Interview rescheduling &middot; updated 8 October 2026</div>
      <p>Every London interview canceled in August and September 2026 that we know of has been rescheduled for <strong>October 2026</strong>. If yours was canceled, add your new date to the community database by submitting your timeline. Medical results are valid for <strong>6 months</strong>, and you must enter the US within those 6 months.</p>
      <p><a href="https://forms.fillout.com/t/dTRqnkx9uxus" target="_blank" rel="noopener noreferrer">Submit your timeline</a> &middot; <a href="/interview-dates">Check your dates</a> &middot; <a href="${fullHref}">Full notice</a></p>
    </div>`;

  const PAGE_CSS = `
    .page-live-notice { background:#f6ecd9; border:1px solid #e6d3b0; border-left:4px solid #b07840; border-radius:8px; padding:0.85rem 1.1rem; margin:0 0 1.75rem; color:#5e3a19; font-size:0.9rem; line-height:1.6; }
    .page-live-notice__head { font-weight:700; font-size:0.74rem; letter-spacing:0.04em; text-transform:uppercase; color:#875325; margin-bottom:0.35rem; }
    .page-live-notice p { margin:0 0 0.45rem; }
    .page-live-notice p:last-child { margin-bottom:0; }
    .page-live-notice a { color:#2f5a6e; font-weight:600; text-decoration:underline; text-underline-offset:2px; }
    @media print { .page-live-notice { display:none; } }`;

  function ensurePageCss() {
    if (document.getElementById('page-live-notice-css')) return;
    const st = document.createElement('style');
    st.id = 'page-live-notice-css';
    st.textContent = PAGE_CSS;
    document.head.appendChild(st);
  }

  function html(key, opts) {
    if (key === 'full') return NOTICE_HTML;
    const make = COMPACT[key];
    if (!make) return '';
    const fullHref = opts && opts.hasFull ? '#interview-cancellations' : '/guide#interview-cancellations';
    return make(fullHref);
  }

  function render() {
    const hasFull = !!document.querySelector('[data-live-notice="full"], #interview-cancellations');
    document.querySelectorAll('[data-live-notice]').forEach(el => {
      if (el.getAttribute('data-live-notice') === 'page') ensurePageCss();
      el.outerHTML = html(el.getAttribute('data-live-notice'), { hasFull }).trim();
    });
  }

  window.AVG_LIVE_NOTICE = { html, render };

  // Render now for mounts already parsed, and again once parsing finishes
  // for any later ones. Idempotent: each mount is replaced as it renders.
  render();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  }
})();
