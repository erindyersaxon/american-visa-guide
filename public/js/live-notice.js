/*
   Single source of truth for the live policy notice (interview
   rescheduling, Sept 2026). Rendered on the Guide Hub and on every stage
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
    <div class="alert-banner__title" id="interview-cancellations-title">Rescheduled interviews are going out, and some give less than a day's notice</div>
    <p>London immigrant visa appointments through <strong>30 September 2026</strong> were canceled to make room for a global public charge training initiative, worldwide and not only here. New dates are now being issued. <strong>Be ready to get to Nine Elms at a few hours' notice.</strong></p>
    <p><strong>What one rescheduled case looked like.</strong> A community case was emailed <strong>direct by the Immigrant Visa Unit</strong> on 8 September with an appointment at <strong>10:00 the following morning</strong>. The email asked them to bring <strong>the plastic wallet from their document review, along with their passport</strong>, warned that &ldquo;availability for appointments will be limited going forward&rdquo;, and asked them to <strong>reply confirming attendance as soon as possible</strong>. They attended and were approved.</p>
    <p><strong>So be ready now, not when the email lands.</strong> Check your case email daily, spam folder included: this one came straight from the embassy, not through AIS. Reply to confirm the moment it arrives. Keep your passport, the plastic wallet from your document review and your full document set together and packed. Work out how you get to <strong>33 Nine Elms Lane, London SW11 7US</strong> for an early appointment, and if you are travelling any distance, know what a same-night stay would cost you.</p>
    <p><strong>There is still no general timetable.</strong> The Department has said only that applicants will be told of a new date as appointments become available. Nothing here should be read as a forecast of when any particular case is called. Background, sources and what the officer is now required to do: <a href="/september-2026-update.html">both visa pauses have been vacated</a> and <a href="/public-charge.html">public charge</a>.</p>
    <figure class="alert-banner__figure">
      <img src="/images/interview-reschedule-email-sept2026.png" alt="Email from the Immigrant Visa Unit, US Embassy London, telling an applicant they have been scheduled for an appointment on the 9th of September 2026 at 10:00AM, to bring the plastic wallet from their document review along with their passport, that they are strongly encouraged to attend as availability for appointments will be limited going forward, and to reply as soon as possible confirming attendance.">
      <figcaption>A rescheduling email sent direct by the Immigrant Visa Unit at US Embassy London, giving under 24 hours' notice. Applicant details removed.</figcaption>
    </figure>
    <p class="alert-banner__meta">Posted 30 August 2026 when the cancellations began, rewritten on 12 September 2026 once rescheduling started. If your case is affected, watch the email address on your case and your <a href="https://ais.usvisa-info.com/en-gb/iv/" target="_blank" rel="noopener noreferrer">AIS account</a>.</p>
  </div>`;

  // Shared first paragraph of the compact per-stage repeats.
  function summary(fullHref) {
    return `<p>London appointments through <strong>30 September 2026</strong> were canceled for a global training initiative, and new dates are now being issued, in at least one case with <strong>less than 24 hours' notice</strong>. Medicals appear to be unaffected. <a href="${fullHref}">Read the full notice →</a></p>`;
  }

  const COMPACT = {
    medical: fullHref => `
    <div class="stage-alert" role="note">
      <div class="stage-alert__head">Interview rescheduling: updated 12 September 2026</div>
      ${summary(fullHref)}
      <p><strong>At this stage:</strong> medicals themselves appear to be unaffected and are going ahead as booked. The <strong>same-day embassy document check</strong> that normally follows your medical is canceled: everything described below under <a href="#doc-check-cancelled">Same-day embassy document check</a> is on hold. Medical results have a limited validity window, so note the date of your exam: an interview far enough out could fall outside it and mean repeating parts of the examination. Do not book or rebook a medical on that assumption until you have a confirmed interview date.</p>
    </div>`,

    'doc-check': fullHref => `
    <div class="stage-alert" role="note">
      <div class="stage-alert__head">Canceled: updated 12 September 2026</div>
      <p>Same-day embassy document checks were canceled alongside the interviews, for London appointments up to and including <strong>30 September 2026</strong>. <strong>Do not travel to the embassy after your medical</strong> unless you are told to. Interviews are now being rescheduled; we have not yet seen a document check rebooked. <a href="${fullHref}">Read the full notice →</a></p>
      <p>Everything below describes how the document check ran before the cancellations, and is what you will need when they resume.</p>
    </div>`,

    interview: fullHref => `
    <div class="stage-alert" role="note">
      <div class="stage-alert__head">Interview rescheduling: updated 12 September 2026</div>
      ${summary(fullHref)}
      <p><strong>At this stage:</strong> do not attend the embassy on a canceled appointment, but <strong>do attend a rescheduled one</strong>. New dates are arriving by email direct from the Immigrant Visa Unit, at very short notice, and asking for a reply to confirm attendance. Be packed and ready to travel to Nine Elms. Everything below describes the interview itself accurately and is worth preparing now.</p>
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
