/*
   Single source of truth for the live policy notice (interview
   rescheduling, Sept–Oct 2026). Rendered on the Guide Hub and on every stage
   page the rescheduling affects. Edit the notice HERE only; every page
   updates.

   Mount points, each replaced by the rendered notice:
     <div data-live-notice="full"></div>       full banner (#interview-cancellations)
     <div data-live-notice="medical"></div>    compact repeat, Stage 4 medical
     <div data-live-notice="doc-check"></div>  compact, Stage 4 document check
     <div data-live-notice="interview"></div>  compact repeat, Stage 5 interview

   Compact notices link to the full banner: in-page when it is on the same
   page, otherwise /guide#interview-cancellations.

   Load as a classic script at the end of <body> (not deferred), so the
   #interview-cancellations anchor exists before the browser scrolls to it.
 */
(function () {
  'use strict';

  const NOTICE_HTML = `
  <div class="alert-banner" id="interview-cancellations" role="region" aria-labelledby="interview-cancellations-title">
    <div class="alert-banner__head">Live notice &middot; Interview rescheduling</div>
    <div class="alert-banner__title" id="interview-cancellations-title">New interview dates are arriving by email, sometimes for the next morning. Be packed and ready now.</div>
    <p>London immigrant visa interviews through <strong>30 September 2026</strong> were canceled for a worldwide public charge training initiative. Rescheduled dates are going out now. Interviews first booked for early September are landing in <strong>early October 2026</strong>; we have not yet seen where later September interviews land.</p>
    <ul>
      <li><strong>Check your case email daily, including spam.</strong> Dates come direct from the Immigrant Visa Unit, not through AIS. Reply to confirm attendance straight away.</li>
      <li><strong>Keep your documents packed:</strong> passport, the plastic wallet from your document review, and your full document set. Know how you would reach <strong>33 Nine Elms Lane, London SW11 7US</strong> for an early slot.</li>
      <li><strong>No document check? Bring every original,</strong> plus one passport photo and your courier confirmation page. Missing documents may mean your appointment is canceled. <a href="/guide/interview#no-document-check">What to bring</a>.</li>
      <li><strong>You can only reschedule later, never earlier.</strong> Moving a short-notice date in <a href="https://ais.usvisa-info.com/en-gb/iv/" target="_blank" rel="noopener noreferrer">AIS</a> pushes your case back.</li>
      <li><strong>DV-2026 selectees:</strong> no diversity visa can be issued after <strong>30 September 2026</strong>. If you have an October date, <a href="/september-2026-update.html">escalate now</a>.</li>
    </ul>
    <p><strong>Example:</strong> on 8 September one applicant was emailed a 10:00 appointment for the next morning, told to bring their passport and document-review wallet, and warned that &ldquo;availability for appointments will be limited going forward&rdquo;. They attended and were approved.</p>
    <p>There is no general timetable; the Department says only that applicants will be told as appointments become available. Background: <a href="/september-2026-update.html">both visa pauses vacated</a> and <a href="/public-charge.html">public charge</a>.</p>
    <figure class="alert-banner__figure">
      <img src="/images/interview-reschedule-email-sept2026.png" alt="Email from the Immigrant Visa Unit, US Embassy London, telling an applicant they have been scheduled for an appointment on the 9th of September 2026 at 10:00AM, to bring the plastic wallet from their document review along with their passport, that they are strongly encouraged to attend as availability for appointments will be limited going forward, and to reply as soon as possible confirming attendance.">
      <figcaption>A rescheduling email sent direct by the Immigrant Visa Unit at US Embassy London, giving under 24 hours' notice. Applicant details removed.</figcaption>
    </figure>
    <p class="alert-banner__meta">Updated 23 September 2026.</p>
  </div>`;

  // Shared first paragraph of the compact per-stage repeats.
  function summary(fullHref) {
    return `<p>London appointments through <strong>30 September 2026</strong> were canceled for a global training initiative, and new dates are now being issued, in at least one case with <strong>less than 24 hours' notice</strong>. At this time, interviews originally booked in early September are being moved to <strong>early October 2026</strong>. Medicals appear to be unaffected. <a href="${fullHref}">Read the full notice →</a></p>`;
  }

  const COMPACT = {
    medical: fullHref => `
    <div class="stage-alert" role="note">
      <div class="stage-alert__head">Interview rescheduling: updated 23 September 2026</div>
      ${summary(fullHref)}
      <p><strong>At this stage:</strong> medicals themselves appear to be unaffected and are going ahead as booked. The <strong>same-day embassy document check</strong> that normally follows your medical is canceled: everything described below under <a href="#doc-check-cancelled">Same-day embassy document check</a> is on hold. Medical results have a limited validity window, so note the date of your exam: an interview far enough out could fall outside it and mean repeating parts of the examination. Do not book or rebook a medical on that assumption until you have a confirmed interview date.</p>
    </div>`,

    'doc-check': fullHref => `
    <div class="stage-alert" role="note">
      <div class="stage-alert__head">Canceled: updated 23 September 2026</div>
      <p>Same-day embassy document checks were canceled alongside the interviews, for London appointments up to and including <strong>30 September 2026</strong>. <strong>Do not travel to the embassy after your medical</strong> unless you are told to. Interviews are now being rescheduled; we have not yet seen a document check rebooked. Instead, applicants without one are being told to bring <strong>all original documents and one passport photo to the interview</strong>: see <a href="/guide/interview#no-document-check">what to bring without a document check</a>. <a href="${fullHref}">Read the full notice →</a></p>
      <p>Everything below describes how the document check ran before the cancellations, and is what you will need when they resume.</p>
    </div>`,

    interview: fullHref => `
    <div class="stage-alert" role="note">
      <div class="stage-alert__head">Interview rescheduling: updated 23 September 2026</div>
      <p>London interviews through <strong>30 September 2026</strong> were canceled for a global public charge training initiative. At this time, interviews that were originally booked in <strong>early September</strong> are being rescheduled to <strong>early October 2026</strong>. We have not yet seen where later September interviews are landing. New dates are arriving by email direct from the Immigrant Visa Unit, in at least one case with <strong>less than 24 hours' notice</strong>, with a request to reply confirming attendance. <a href="${fullHref}">Read the full notice →</a></p>
      <p><strong>At this stage:</strong></p>
      <ul>
        <li><strong>Do not attend a canceled appointment, but do attend a rescheduled one.</strong> Reply to confirm as soon as the email arrives, and be packed and ready to travel to Nine Elms.</li>
        <li><strong>You can only reschedule to a later date.</strong> Rescheduling through AIS is only possible to a date <em>after</em> your assigned appointment, so moving a short-notice slot pushes your case back.</li>
        <li><strong>No document check? Bring every original.</strong> The interview pack now emailed with the notice asks for all original documents and one passport photo at the interview itself. <a href="#no-document-check">See what to bring</a>.</li>
        <li><strong>Check your passport and medical dates.</strong> Your passport should be valid for six months beyond your intended date of entry, and your medical must be at least two weeks before the new interview date and still valid on it.</li>
        <li><strong>DV-2026 selectees:</strong> the pack states no diversity visa can be issued after <strong>30 September 2026</strong>, so an October date is past the deadline. <a href="/september-2026-update.html">Escalate now</a>.</li>
      </ul>
      <p style="margin-bottom:0;">Everything below describes the interview itself accurately and is worth preparing now.</p>
    </div>`,
  };

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
