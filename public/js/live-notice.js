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
    <p>London canceled immigrant visa interviews booked for August and September 2026 for public charge training. If yours moved, <a href="https://forms.fillout.com/t/dTRqnkx9uxus" target="_blank" rel="noopener noreferrer">submit your timeline</a> so other applicants can see the new dates. Not sure what applies to you? <a href="/interview">Start from the interview hub</a>.</p>
    <p><strong>Refused under 221(g) or the visa pause?</strong> London is emailing these applicants to book a new interview. <a href="/reinterview">Re-interview after a 221(g)</a>.</p>
    <p><strong>Waiting for an Interview Letter?</strong> London has sent none since 14 July 2026. <a href="/data">See the data</a>.</p>
    <ul>
      <li><strong>Reply to confirm your new date.</strong> London sends new dates by email, not through AIS. Check your spam folder.</li>
      <li><strong>No document check? Bring every original,</strong> one passport photo and your courier confirmation page. <a href="/guide/interview#no-document-check">What to bring</a>.</li>
      <li><strong>AIS only moves your date later.</strong> <a href="https://ais.usvisa-info.com/en-gb/iv/" target="_blank" rel="noopener noreferrer">Rescheduling there</a> pushes your case back.</li>
      <li><strong>Enter the US within 6 months of your medical.</strong> <a href="/interview-dates">Check your dates</a>.</li>
    </ul>
    <p>Background: <a href="/september-2026-update.html">both visa pauses vacated</a> and <a href="/public-charge.html">public charge</a>.</p>
    <p class="alert-banner__meta">Updated 12 October 2026.</p>
  </div>`;

  // Shared first paragraph of the compact per-stage repeats.
  function summary(fullHref) {
    return `<p>London canceled interviews booked for August and September 2026 for public charge training and moved them to <strong>October 2026</strong>. <a href="${fullHref}">Read the full notice →</a></p>`;
  }

  const COMPACT = {
    medical: fullHref => `
    <div class="stage-alert" role="note">
      <div class="stage-alert__head">Interview rescheduling: updated 8 October 2026</div>
      ${summary(fullHref)}
      <p><strong>At this stage:</strong> medicals appear unaffected and are going ahead as booked. The <strong>same-day embassy document check</strong> after your medical is canceled, so the <a href="#doc-check-cancelled">document check section</a> below is on hold. You must enter the US within <strong>6 months</strong> of your exam. Wait for a confirmed interview date before you book or rebook a medical. <a href="#medical-validity">How the 6 months works</a>.</p>
    </div>`,

    'doc-check': fullHref => `
    <div class="stage-alert" role="note">
      <div class="stage-alert__head">Canceled: updated 8 October 2026</div>
      <p>London canceled same-day embassy document checks along with interviews booked for August and September 2026. <strong>Do not travel to the embassy after your medical</strong> unless the embassy tells you to. Canceled interviews now have October dates; we have seen no document check rebooked. Bring <strong>all original documents and one passport photo to the interview</strong> instead: <a href="/guide/interview#no-document-check">what to bring without a document check</a>. <a href="${fullHref}">Read the full notice →</a></p>
      <p>The section below describes the document check as it ran before the cancellations. You will need it when checks resume.</p>
    </div>`,

    interview: fullHref => `
    <div class="stage-alert" role="note">
      <div class="stage-alert__head">Interview rescheduling: updated 12 October 2026</div>
      <p>London canceled interviews booked for August and September 2026 for public charge training and moved them to <strong>October 2026</strong>. If yours moved, <a href="https://forms.fillout.com/t/dTRqnkx9uxus" target="_blank" rel="noopener noreferrer">submit your timeline</a>. <a href="${fullHref}">Read the full notice →</a></p>
      <p><strong>Refused under 221(g) or the visa pause?</strong> London is emailing these applicants to book a new interview. <a href="/reinterview">Re-interview after a 221(g)</a>.</p>
      <p><strong>Waiting for an Interview Letter?</strong> London has sent none since 14 July 2026. <a href="/data">See the data</a>.</p>
      <p><strong>At this stage:</strong></p>
      <ul>
        <li><strong>Reply to confirm your new date.</strong> The Immigrant Visa Unit sends new dates by email.</li>
        <li><strong>AIS only moves your date later.</strong> Rescheduling there pushes your case back.</li>
        <li><strong>No document check? Bring every original</strong> and one passport photo to the interview. <a href="#no-document-check">What to bring</a>.</li>
        <li><strong>Check your passport and medical dates.</strong> Your passport needs six months' validity past your entry date. Your medical must fall at least two weeks before the interview, and you must enter the US within 6 months of it. <a href="/interview-dates">Check your dates</a>.</li>
      </ul>
      <p style="margin-bottom:0;">The interview guidance below still applies. Prepare now.</p>
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
