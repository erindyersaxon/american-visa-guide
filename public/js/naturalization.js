/*
   American Visa Guide: Naturalization page (naturalization.html)
   Three tools, all client-side. Nothing entered here leaves the browser.

   1. Filing date calculator. Implements the 3-year (INA 319(a)) and
      5-year (INA 316(a)) rules as described in the USCIS Policy Manual,
      Vol. 12, and the 90-day early filing rule (INA 334(a)), then lists
      the forms, fees and documents that apply to the result.
      - 90-day early filing applies only to the permanent residence
        period. The 3 years of marriage and of the spouse's citizenship
        must be complete on the day you file (8 CFR 319.1(a)(3)).
      - Fees follow the USCIS fee schedule (G-1055) in force since
        1 April 2024. If DHS finalizes the June 2026 proposed rule,
        update FEES below and the "Where things stand" card.
   2. Preparation checklist. Ticks are saved in localStorage only.
   3. 2025 civics test flashcards and vocabulary lists. Data lives in
      /js/naturalization-test.js.
 */
(function () {
  'use strict';

  const DAY = 86400000;

  const FEES = {
    n400Online: 710,
    n400Paper: 760,
    n400Reduced: 380,
    i751: 750,
    n600Paper: 1385,
    n600Online: 1335,
    n336Paper: 830,
    n336Online: 780,
  };

  /* ---------- date helpers (UTC, so no timezone drift) ---------- */
  function parseDate(v) {
    if (!v) return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
    if (!m) return null;
    return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  }
  function today() {
    const n = new Date();
    return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()));
  }
  function addYears(d, n) {
    const r = new Date(Date.UTC(d.getUTCFullYear() + n, d.getUTCMonth(), d.getUTCDate()));
    // 29 February anniversaries fall on 1 March in non-leap years
    return r;
  }
  function addMonths(d, n) {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, d.getUTCDate()));
  }
  function addDays(d, n) { return new Date(d.getTime() + n * DAY); }
  function maxDate() { return new Date(Math.max.apply(null, Array.from(arguments).map(Number))); }
  function minDate() { return new Date(Math.min.apply(null, Array.from(arguments).map(Number))); }
  function fmt(d) {
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  }
  function daysBetween(a, b) { return Math.round((b - a) / DAY); }
  function ageOn(dob, d) {
    let a = d.getUTCFullYear() - dob.getUTCFullYear();
    if (d.getUTCMonth() < dob.getUTCMonth() ||
        (d.getUTCMonth() === dob.getUTCMonth() && d.getUTCDate() < dob.getUTCDate())) a--;
    return a;
  }
  function yearsOn(start, d) { return ageOn(start, d); }
  function money(n) { return '$' + n.toLocaleString('en-US'); }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function link(href, text) {
    return '<a href="' + href + '" target="_blank" rel="noopener noreferrer">' + text + '</a>';
  }

  /* =============================================================
     1. CALCULATOR
     ============================================================= */
  const CATS = {
    IR1: { label: 'IR1', conditional: false, spouse: true },
    CR1: { label: 'CR1', conditional: true, spouse: true },
    K1:  { label: 'K-1 (adjusted status)', conditional: 'maybe', spouse: true },
    IR2: { label: 'IR2', conditional: false, child: true },
    CR2: { label: 'CR2', conditional: true, child: true },
    IR5: { label: 'IR5', conditional: false, parent: true },
    F1:  { label: 'F1' }, F2A: { label: 'F2A' }, F2B: { label: 'F2B' },
    F3:  { label: 'F3' }, F4:  { label: 'F4' },
  };

  const form = document.getElementById('calc');
  const el = function (id) { return document.getElementById(id); };

  function syncFields() {
    const cat = CATS[el('c-cat').value];
    const married = el('c-married').value === 'yes';
    document.querySelectorAll('[data-when="married"]').forEach(function (f) { f.hidden = !married; });
    const cond = !!(cat && cat.conditional);
    document.querySelectorAll('[data-when="conditional"]').forEach(function (f) { f.hidden = !cond; });
    const sel = el('c-i751');
    const naOpt = sel.querySelector('option[value="na"]');
    if (cat && cat.conditional === 'maybe') {
      if (!naOpt) {
        const o = document.createElement('option');
        o.value = 'na'; o.textContent = 'Not applicable: my first card was a 10-year card';
        sel.insertBefore(o, sel.firstChild);
        sel.value = 'na';
      }
    } else if (naOpt) {
      naOpt.remove();
    }
  }

  function showError(msg) {
    const e = el('c-error');
    e.textContent = msg;
    e.hidden = !msg;
  }

  function calculate(ev) {
    ev.preventDefault();
    showError('');
    const catKey = el('c-cat').value;
    const cat = CATS[catKey];
    const lpr = parseDate(el('c-lpr').value);
    const dob = parseDate(el('c-dob').value);
    const married = el('c-married').value === 'yes';
    const mdate = parseDate(el('c-mdate').value);
    const sdate = parseDate(el('c-sdate').value);
    const now = today();

    if (!cat) return showError('Choose the visa category you immigrated on.');
    if (!lpr) return showError('Enter the "Resident since" date from your green card.');
    if (!dob) return showError('Enter your date of birth.');
    if (lpr > now) return showError('The "Resident since" date is in the future. Check the date on your green card.');
    if (dob >= lpr) return showError('Your date of birth must be before your "Resident since" date.');
    if (married && (!mdate || !sdate)) return showError('Enter your marriage date and the date your spouse became a US citizen, or choose "No" for the marriage question.');

    const i751 = cat.conditional ? el('c-i751').value : 'na';
    const conditional = cat.conditional && i751 !== 'na';

    // ---- Child Citizenship Act: IR2 / CR2 under 18 ----
    const ageNow = ageOn(dob, now);
    const age18 = addYears(dob, 18);
    if (cat.child && ageNow < 18) {
      return render(renderCCA(catKey, dob, age18));
    }

    // ---- 5-year rule ----
    const five = addYears(lpr, 5);
    const fiveEarly = addDays(five, -90);

    // ---- 3-year rule ----
    let three = null, threeEarly = null, threeDate = null, threeParts = null;
    if (married) {
      three = addYears(lpr, 3);
      threeEarly = addDays(three, -90);
      const m3 = addYears(mdate, 3);
      const s3 = addYears(sdate, 3);
      threeDate = maxDate(threeEarly, m3, s3);
      threeParts = { threeEarly: threeEarly, m3: m3, s3: s3 };
    }

    let path = '5';
    let earliest = fiveEarly;
    if (married && threeDate < fiveEarly) { path = '3'; earliest = threeDate; }
    const limitedByAge = earliest < age18;
    if (limitedByAge) earliest = age18;

    const years = path === '3' ? 3 : 5;
    const anniversary = path === '3' ? three : five;
    const canFileNow = earliest <= now;

    let html = '';

    // Banner
    let banner;
    const lapsed = conditional && i751 === 'notyet' && now > addYears(lpr, 2);
    if (lapsed) {
      banner = '<div class="result-banner stop"><div class="result-kicker">' + years + '-year rule · resolve your status first</div>' +
        '<div class="result-date">Earliest date on paper: ' + fmt(earliest) + '</div>' +
        '<div class="result-sub">Your conditional card expired on ' + fmt(addYears(lpr, 2)) + ' with no I-751 filed. USCIS cannot approve an N-400 until your status is restored. See below.</div></div>';
    } else if (canFileNow) {
      banner = '<div class="result-banner go"><div class="result-kicker">' + years + '-year rule · you can file now</div>' +
        '<div class="result-date">Eligible to file since ' + fmt(earliest) + '</div>' +
        '<div class="result-sub">Provided you also meet continuous residence, physical presence and the other requirements below.</div></div>';
    } else {
      const d = daysBetween(now, earliest);
      banner = '<div class="result-banner wait"><div class="result-kicker">' + years + '-year rule · earliest filing date</div>' +
        '<div class="result-date">' + fmt(earliest) + '</div>' +
        '<div class="result-sub">' + d + ' day' + (d === 1 ? '' : 's') + ' from today. File even one day early and USCIS can reject or deny the N-400. A denied application\'s fee is not refunded.</div></div>';
    }
    html += banner;

    // Why this date
    html += '<h3>How this date was worked out</h3><ul>';
    if (path === '3') {
      html += '<li>3 years as a permanent resident on ' + fmt(three) + '. You can file up to 90 days before that, from <strong>' + fmt(threeParts.threeEarly) + '</strong></li>';
      html += '<li>3 years of marriage on <strong>' + fmt(threeParts.m3) + '</strong>. This period has no 90-day early filing</li>';
      html += '<li>Your spouse a US citizen for 3 years on <strong>' + fmt(threeParts.s3) + '</strong>. This period has no 90-day early filing</li>';
      html += '<li>The latest of these three dates is your earliest filing date. You must still be married to, and living with, your spouse on the day you file and until you take the oath. ' + link('https://www.uscis.gov/policy-manual/volume-12-part-g-chapter-2', '[Policy Manual Vol. 12 Part G Ch. 2]') + '</li>';
    } else {
      html += '<li>5 years as a permanent resident on ' + fmt(five) + '. You can file up to 90 days before that, from <strong>' + fmt(fiveEarly) + '</strong> ' + link('https://www.uscis.gov/policy-manual/volume-12-part-d-chapter-6', '[Policy Manual Vol. 12 Part D Ch. 6]') + '</li>';
      if (married && threeDate) {
        html += '<li>You also asked about the 3-year marriage rule. It would not let you file sooner: its earliest date is ' + fmt(threeDate) + '</li>';
      } else if (cat.spouse && !married) {
        html += '<li>You are no longer married to, or living with, your US citizen spouse, so the 5-year rule applies. Time in marital union stops counting if you separate, divorce, or your spouse dies</li>';
      }
    }
    if (limitedByAge) html += '<li>You must be 18 to file an N-400. You turn 18 on <strong>' + fmt(age18) + '</strong>, which is later than the residence date</li>';
    html += '</ul>';

    // Timeline
    html += '<h3>Your timeline</h3><ol class="tl">';
    html += tlItem(lpr <= now, fmt(lpr), 'Became a permanent resident', 'Your "Resident since" date. The ' + years + '-year clock starts here.');
    if (conditional) {
      const exp = addYears(lpr, 2);
      const win = addDays(exp, -90);
      html += tlItem(i751 !== 'notyet', fmt(win) + ' to ' + fmt(exp),
        'Form I-751 filing window', 'File in the 90 days before your conditional card expires. Your time as a conditional resident counts toward naturalization.');
    }
    html += tlItem(canFileNow, fmt(earliest), 'Earliest date to file Form N-400', 'You must have lived for at least 3 months in the state or USCIS district where you file.');
    if (anniversary > earliest) {
      html += tlItem(anniversary <= now, fmt(anniversary), years + ' years as a permanent resident', 'The end of the statutory period. Continuous residence must continue from filing until the oath.');
    }
    const fileRef = canFileNow ? now : earliest;
    html += tlItem(false, 'A few weeks after filing', 'Biometrics appointment', 'Fingerprints and photo at an Application Support Center. The date is on your appointment notice.');
    html += tlItem(false, 'About ' + fmt(addMonths(fileRef, 6)) + ' to ' + fmt(addMonths(fileRef, 12)),
      'Interview, with the English and civics tests', 'Estimate: 6 to 12 months after filing (if you file on ' + fmt(fileRef) + '). Times vary a lot by field office, so check ' + link('https://egov.uscis.gov/processing-times/', 'USCIS processing times') + ' for yours.');
    html += tlItem(false, 'Same day to a few months after approval', 'Oath ceremony', 'You become a US citizen when you take the Oath of Allegiance, not at the interview.');
    html += '</ol>';

    // Requirements
    html += '<h3>Requirements to meet by the filing date</h3><ul>';
    html += '<li><strong>Continuous residence:</strong> ' + years + ' years. A trip of more than 6 months raises a presumption that you broke continuous residence. A trip of 1 year or more breaks it</li>';
    html += '<li><strong>Physical presence:</strong> at least ' + (path === '3' ? '18 months (548 days)' : '30 months (913 days)') + ' actually in the US during the ' + years + ' years before you file. Add up every day spent abroad</li>';
    html += '<li><strong>Good moral character</strong> throughout the ' + years + ' years, and until the oath</li>';
    html += '<li><strong>English and civics tests</strong> at the interview (see <a href="#civics">flashcards</a>)</li>';
    html += '</ul>';

    // Category-specific notes
    const notes = [];
    if (conditional && i751 === 'notyet') {
      const exp = addYears(lpr, 2);
      if (now > exp) {
        notes.push(['warning', 'Your conditional status has expired', 'Your 2-year card expired on ' + fmt(exp) + ' and no I-751 has been filed. Your permanent resident status ends automatically, and USCIS cannot approve an N-400 without it. File Form I-751 with a written explanation for the late filing, and speak to an attorney or accredited representative before filing anything else. ' + link('https://www.uscis.gov/i-751', '[USCIS: Form I-751]')]);
      } else {
        notes.push(['', 'File Form I-751 on time', 'File between ' + fmt(addDays(exp, -90)) + ' and ' + fmt(exp) + '. You can file an N-400 while the I-751 is pending. USCIS may then decide the I-751 at your naturalization interview, and it must approve it before it can approve the N-400. ' + link('https://www.uscis.gov/i-751', '[USCIS: Form I-751]')]);
      }
    } else if (conditional && i751 === 'pending') {
      notes.push(['tip', 'Pending I-751', 'You can file the N-400 now. Include a copy of the I-751 receipt notice (Form I-797C). USCIS may decide both at the interview, so bring evidence that your marriage is genuine: joint tax transcripts, a lease or mortgage, bank statements, and children\'s birth certificates. ' + link('https://www.uscis.gov/i-751', '[USCIS: Form I-751]')]);
    }
    if (cat.child) {
      notes.push(['', 'Check you are not already a citizen', 'If you became a permanent resident before age 18, and lived in the legal and physical custody of a US citizen parent while under 18, you may already be a citizen under the Child Citizenship Act. Then you do not need an N-400: use Form N-600 or apply for a US passport. See <a href="/life.html#life-cca">Child Citizenship Act</a>.']);
    }
    if (cat.parent) {
      notes.push(['', 'English test for parents (IR5)', 'The English test waivers need 15 to 20 years as a permanent resident, so most IR5 parents take the English test. Parents who cannot learn English because of a medical disability can ask for a waiver with ' + link('https://www.uscis.gov/n-648', 'Form N-648') + '.']);
    }
    if (catKey === 'F2A' && !married) {
      notes.push(['tip', 'If your spouse becomes a citizen', 'If your permanent resident spouse naturalizes, you may qualify for the 3-year rule once they have been a citizen for 3 years and you have been married and living together for 3 years. Rerun this calculator with "Yes" for the marriage question.']);
    }
    const ageAtFile = ageOn(dob, earliest);
    const lprAtFile = yearsOn(lpr, earliest);
    if (ageAtFile >= 65 && lprAtFile >= 20) {
      notes.push(['tip', '65/20: simpler civics test', 'At your filing date you will be ' + ageAtFile + ' and a permanent resident for ' + lprAtFile + ' years. The English test is waived, and you only study the 20 starred civics questions, in your own language.']);
    } else if ((ageAtFile >= 50 && lprAtFile >= 20) || (ageAtFile >= 55 && lprAtFile >= 15)) {
      notes.push(['tip', 'English test waived', 'At your filing date you will be ' + ageAtFile + ' and a permanent resident for ' + lprAtFile + ' years, so the English test is waived. You take the civics test in your language with an interpreter.']);
    }
    // Selective Service: anyone who was a permanent resident at any point between 18 and 26
    const age26 = addYears(dob, 26);
    if (lpr < age26 && age18 <= now) {
      notes.push(['warning', 'Selective Service (men)', 'You were a permanent resident at some point between ages 18 and 25. Men in that position must register with ' + link('https://www.sss.gov/register/', 'Selective Service') + '. If you are now 26 or older and did not register, USCIS may ask you to show it was not knowing and wilful, usually with a Status Information Letter from Selective Service. Get advice before filing.']);
    }
    notes.forEach(function (n) {
      html += '<div class="info-card ' + n[0] + '"><div class="info-card-head">' + n[1] + '</div><p>' + n[2] + '</p></div>';
    });

    // Forms and fees
    html += '<h3>Forms and fees</h3><div class="table-scroll"><table><thead><tr><th>Form</th><th>What it is for</th><th>Fee</th></tr></thead><tbody>';
    html += row('N-400', 'Application for Naturalization', 'req',
      money(FEES.n400Online) + ' online<br>' + money(FEES.n400Paper) + ' paper<br>' + money(FEES.n400Reduced) + ' reduced (paper only)', 'https://www.uscis.gov/n-400');
    if (conditional && i751 === 'notyet') {
      html += row('I-751', 'Petition to Remove Conditions on Residence', 'req', money(FEES.i751), 'https://www.uscis.gov/i-751');
    }
    html += row('I-912', 'Fee waiver, if you receive a means-tested benefit, have income at or below 150% of the poverty guidelines, or face financial hardship. Paper filing only', 'if', 'No fee', 'https://www.uscis.gov/i-912');
    html += row('N-648', 'Medical Certification for Disability Exceptions (English and civics waiver)', 'if', 'No fee', 'https://www.uscis.gov/n-648');
    html += row('G-28', 'Notice of appearance, if an attorney or accredited representative acts for you', 'if', 'No fee', 'https://www.uscis.gov/g-28');
    html += row('AR-11', 'Change of address. Required within 10 days of any move; you can update it online', 'if', 'No fee', 'https://www.uscis.gov/ar-11');
    html += row('N-470', 'Preserve residence, only for certain work abroad (US government, US companies, research). File before the absence reaches 1 year', 'if', 'See fee schedule', 'https://www.uscis.gov/n-470');
    html += row('N-336', 'Request a hearing if the N-400 is denied. File within 30 days of the decision', 'if',
      money(FEES.n336Online) + ' online<br>' + money(FEES.n336Paper) + ' paper', 'https://www.uscis.gov/n-336');
    html += '</tbody></table></div>';
    html += '<p style="font-size:12px;color:var(--muted);">Fees from the ' + link('https://www.uscis.gov/g-1055', 'USCIS fee schedule (G-1055)') + '. Biometrics are included in the N-400 fee. A proposed rule would raise the N-400 fee and end the reduced fee and waivers; it is <a href="#where-things-stand">not yet final</a>. Check the ' + link('https://www.uscis.gov/feecalculator', 'USCIS fee calculator') + ' on the day you file.</p>';

    // Documents
    html += '<h3>Documents</h3>';
    html += '<p><strong>Send with the application.</strong> Since August 2026, missing initial evidence can lead to denial with no request for evidence first.</p><ul>';
    html += '<li>Copy of your green card, front and back <span class="pill pill-req">Required</span></li>';
    html += '<li>Fee payment, or Form I-912 with its evidence <span class="pill pill-req">Required</span></li>';
    if (path === '3') {
      html += '<li>Evidence your spouse has been a US citizen for the whole 3 years: birth certificate, naturalization certificate, certificate of citizenship, Consular Report of Birth Abroad (FS-240), or the inside cover of their US passport <span class="pill pill-req">Required</span></li>';
      html += '<li>Your current marriage certificate <span class="pill pill-req">Required</span></li>';
      html += '<li>Proof that every earlier marriage, for both of you, has ended: divorce decrees, annulments or death certificates <span class="pill pill-if">If either of you married before</span></li>';
      html += '<li>Evidence you live together in marital union: IRS tax transcripts for the past 3 years, joint lease or mortgage, joint bank statements, children\'s birth certificates <span class="pill pill-if">Recommended</span></li>';
    }
    if (conditional && i751 === 'pending') html += '<li>I-751 receipt notice (Form I-797C) <span class="pill pill-req">Required</span></li>';
    html += '<li>Certified court dispositions, arrest reports and proof you completed any sentence, for every arrest, citation or charge anywhere in the world <span class="pill pill-if">If you were ever arrested or cited</span></li>';
    html += '<li>Evidence of continuous residence for any trip of more than 6 months: IRS tax transcripts, proof you kept your US job, and lease or mortgage records <span class="pill pill-if">If any trip was over 6 months</span></li>';
    html += '<li>Legal proof of any name change: marriage certificate, divorce decree, court order <span class="pill pill-if">If your name changed</span></li>';
    html += '<li>An IRS payment plan and proof of payments <span class="pill pill-if">If you owe tax</span></li>';
    html += '</ul>';
    html += '<p><strong>Bring to the interview:</strong> your appointment notice, green card, state-issued ID, every passport and travel document you have used since becoming a resident, and the originals of everything you sent in' + (path === '3' ? ', plus your spouse\'s proof of citizenship and the marriage evidence above' : '') + '.</p>';
    html += '<p style="font-size:12px;color:var(--muted);">Source: ' + link('https://www.uscis.gov/n-400', 'Form N-400 instructions and Document Checklist (M-477)') + '.</p>';

    render(html);
  }

  function renderCCA(catKey, dob, age18) {
    return '<div class="result-banner stop"><div class="result-kicker">' + catKey + ' · under 18</div>' +
      '<div class="result-date">Form N-400 is not the right form</div>' +
      '<div class="result-sub">You cannot file an N-400 until age 18 (' + fmt(age18) + '). You may already be a US citizen.</div></div>' +
      '<p>Under the Child Citizenship Act (INA 320), a child becomes a US citizen automatically on the date all of these are true: at least one parent is a US citizen; the child is under 18; the child is a permanent resident; and the child lives in the US in the legal and physical custody of the citizen parent. Most IR2 and CR2 children qualify on the day they enter the US. See <a href="/life.html#life-cca">Child Citizenship Act</a>.</p>' +
      '<h3>Forms and fees</h3><div class="table-scroll"><table><thead><tr><th>Form</th><th>What it is for</th><th>Fee</th></tr></thead><tbody>' +
      row('N-600', 'Certificate of Citizenship. Optional: it proves citizenship but does not grant it', 'if', money(FEES.n600Online) + ' online<br>' + money(FEES.n600Paper) + ' paper', 'https://www.uscis.gov/n-600') +
      row('DS-11', 'US passport application, using the green card, foreign passport and the parent\'s proof of citizenship', 'if', 'See State Department fees', 'https://travel.state.gov/content/travel/en/passports/need-passport/under-16.html') +
      '</tbody></table></div>' +
      '<p style="font-size:12px;color:var(--muted);">Sources: ' + link('https://www.uscis.gov/policy-manual/volume-12-part-h-chapter-4', 'USCIS Policy Manual Vol. 12 Part H Ch. 4') + '; ' + link('https://www.uscis.gov/g-1055', 'USCIS fee schedule (G-1055)') + '.</p>';
  }

  function tlItem(done, when, what, note) {
    return '<li' + (done ? ' class="done"' : '') + '><div class="tl-when">' + when + '</div><div class="tl-what">' + what + '</div><div class="tl-note">' + note + '</div></li>';
  }
  function row(formName, what, kind, fee, href) {
    return '<tr><td><a href="' + href + '" target="_blank" rel="noopener noreferrer"><strong>' + formName + '</strong></a>' +
      (kind === 'req' ? '<span class="pill pill-req">Required</span>' : '<span class="pill pill-if">If applies</span>') +
      '</td><td>' + what + '</td><td class="fee">' + fee + '</td></tr>';
  }
  function render(html) {
    const r = el('c-result');
    r.innerHTML = html;
    r.hidden = false;
    r.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (form) {
    el('c-cat').addEventListener('change', syncFields);
    el('c-married').addEventListener('change', syncFields);
    form.addEventListener('submit', calculate);
    el('c-reset').addEventListener('click', function () {
      form.reset();
      showError('');
      el('c-result').hidden = true;
      syncFields();
    });
    syncFields();
  }

  /* =============================================================
     2. PREPARATION CHECKLIST
     ============================================================= */
  const PREP = [
    { key: 'before', title: 'Before you file', items: [
      ['b1', 'Confirm your earliest filing date', 'Use the calculator above, then check it with the ' + link('https://www.uscis.gov/early-filing-calculator', 'USCIS early filing calculator') + '.'],
      ['b2', 'List every trip outside the US since you became a resident', 'Dates out and back, and where you went. Check them against your ' + link('https://i94.cbp.dhs.gov/', 'CBP I-94 travel history') + ' and passport stamps. Add up the days abroad to check physical presence.'],
      ['b3', 'Check that no single trip lasted 6 months or more', 'If one did, gather evidence that you kept your US home, job and tax residence.'],
      ['b4', 'Confirm you have lived 3 months in your current state or USCIS district', 'You file with the office covering where you live now.'],
      ['b5', 'Write out your address history for the past 5 years', 'With dates, and no gaps.'],
      ['b6', 'Write out your employment and school history for the past 5 years', 'Include gaps, unemployment, self-employment and retirement.'],
      ['b7', 'Gather your marital history and your spouse\'s details', 'Dates of every marriage and divorce for you and your spouse, and your spouse\'s proof of citizenship if you use the 3-year rule.'],
      ['b8', 'List all your children', 'Including adult, stepchildren and deceased children, with dates of birth and where they live.'],
      ['b9', 'Order IRS tax return transcripts for the past 3 or 5 years', 'Free from ' + link('https://www.irs.gov/individuals/get-transcript', 'IRS Get Transcript') + '. Check you filed as a resident every year, and set up a payment plan for any tax owed.'],
      ['b10', 'Men: check Selective Service registration', 'Required if you lived in the US as a permanent resident at any time between ages 18 and 25. Check at ' + link('https://www.sss.gov/verify/', 'sss.gov/verify') + '.'],
      ['b11', 'Get certified court records for any arrest, citation or charge', 'From the court and police in every place it happened, even if the record was sealed or expunged.'],
      ['b12', 'Copy your green card, front and back', 'Required with every N-400.'],
      ['b13', 'Decide between online and paper filing', 'Online costs $710 and gives you live case updates. The $380 reduced fee and the I-912 fee waiver need a paper filing.'],
      ['b14', 'Create a USCIS online account', 'At ' + link('https://my.uscis.gov/', 'my.uscis.gov') + '. You also need it for address changes and notices.'],
    ]},
    { key: 'filing', title: 'Filing the N-400', items: [
      ['f1', 'Answer every question, using "None" or "N/A" where nothing applies', 'Your answers must match your tax, travel and court records.'],
      ['f2', 'Attach all required initial evidence', 'Since 5 August 2026, USCIS can deny an incomplete filing without asking for missing documents first.'],
      ['f3', 'Pay the fee, or attach Form I-912', 'Do not send a fee with a waiver request: USCIS will take the payment and ignore the waiver.'],
      ['f4', 'Save a PDF of the submitted N-400 and your receipt notice (I-797C)', 'Reread it before your interview. The officer will go through it with you line by line.'],
    ]},
    { key: 'after', title: 'While your case is pending', items: [
      ['a1', 'Attend your biometrics appointment', 'Bring the appointment notice and photo ID.'],
      ['a2', 'Report any change of address within 10 days', 'Through your USCIS account or Form AR-11. Missed notices are a common reason for delays and denials.'],
      ['a3', 'Keep trips abroad short', 'Continuous residence must continue until your oath.'],
      ['a4', 'Study for the civics and English tests', 'Use the <a href="#civics">flashcards</a>, and practise saying your N-400 answers aloud.'],
      ['a5', 'Keep filing taxes, and avoid any new arrest or citation', 'Good moral character runs until the oath.'],
      ['a6', 'Reply to any request for evidence before the deadline', 'Send everything asked for in one response.'],
    ]},
    { key: 'interview', title: 'Interview day', items: [
      ['i1', 'Bring your interview notice, green card, state ID, and every passport and travel document', 'Include expired passports used since you became a resident.'],
      ['i2', 'Bring the originals of everything you submitted', 'Plus marriage evidence for the 3-year rule or a pending I-751, and tax transcripts.'],
      ['i3', 'Arrive early and expect to go through security', 'The officer places you under oath before asking about your application.'],
      ['i4', 'Get your Form N-652 before you leave', 'It shows whether your case was granted, continued (usually a retest or more documents), or denied.'],
    ]},
    { key: 'oath', title: 'Oath ceremony and after', items: [
      ['o1', 'Complete the questionnaire on your oath notice (Form N-445) on the day', 'It asks about anything that has happened since your interview.'],
      ['o2', 'Hand in your green card at the ceremony', 'You receive your Certificate of Naturalization. Check it for errors before you leave.'],
      ['o3', 'Apply for a US passport', 'Using Form DS-11 and your original naturalization certificate. See ' + link('https://travel.state.gov/content/travel/en/passports.html', 'travel.state.gov') + '.'],
      ['o4', 'Update your Social Security record', 'So employers can verify your citizenship. See ' + link('https://www.ssa.gov/', 'ssa.gov') + '.'],
      ['o5', 'Register to vote', 'At ' + link('https://vote.gov/', 'vote.gov') + '.'],
      ['o6', 'Check your children\'s status', 'Children under 18 who are permanent residents living with you may become citizens automatically. See <a href="/life.html#life-cca">Child Citizenship Act</a>.'],
      ['o7', 'Check whether your other country allows dual nationality', 'The UK does. ' + link('https://www.gov.uk/dual-citizenship', '[GOV.UK: Dual citizenship]')],
    ]},
  ];
  const PREP_KEY = 'avg-natz-prep';
  function loadPrep() { try { return JSON.parse(localStorage.getItem(PREP_KEY)) || {}; } catch (e) { return {}; } }
  function savePrep(m) { try { localStorage.setItem(PREP_KEY, JSON.stringify(m)); } catch (e) { /* storage unavailable */ } }

  function renderPrep() {
    const box = document.getElementById('prep');
    if (!box) return;
    const done = loadPrep();
    box.innerHTML = PREP.map(function (g) {
      const n = g.items.filter(function (i) { return done[i[0]]; }).length;
      return '<div class="prep-group"><div class="prep-head"><h3>' + g.title + '</h3><span class="prep-count" data-count="' + g.key + '">' + n + ' of ' + g.items.length + ' done</span></div>' +
        '<ul class="prep-list">' + g.items.map(function (i) {
          const id = 'prep-' + i[0];
          return '<li><input type="checkbox" id="' + id + '" data-prep="' + i[0] + '"' + (done[i[0]] ? ' checked' : '') + '>' +
            '<label for="' + id + '">' + i[1] + '<small>' + i[2] + '</small></label></li>';
        }).join('') + '</ul></div>';
    }).join('');
  }
  document.addEventListener('change', function (e) {
    const k = e.target && e.target.getAttribute && e.target.getAttribute('data-prep');
    if (!k) return;
    const m = loadPrep();
    if (e.target.checked) m[k] = true; else delete m[k];
    savePrep(m);
    PREP.forEach(function (g) {
      const n = g.items.filter(function (i) { return m[i[0]]; }).length;
      const c = document.querySelector('[data-count="' + g.key + '"]');
      if (c) c.textContent = n + ' of ' + g.items.length + ' done';
    });
  });
  const prepReset = document.getElementById('prep-reset');
  if (prepReset) prepReset.addEventListener('click', function () { savePrep({}); renderPrep(); });
  renderPrep();

  /* =============================================================
     3. CIVICS FLASHCARDS + VOCABULARY
     ============================================================= */
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

  // Vocabulary lists
  const vocabBox = document.getElementById('vocab');
  if (vocabBox && DATA.VOCAB) {
    const card = function (title, sub, groups) {
      return '<div class="vocab-card"><h4>' + title + '</h4><p class="vocab-sub">' + sub + '</p>' +
        groups.map(function (g) {
          return '<div class="vocab-group"><div class="vocab-label">' + esc(g.group) + '</div><div class="vocab-words">' +
            g.words.map(function (w) { return '<span>' + esc(w) + '</span>'; }).join('') + '</div></div>';
        }).join('') + '</div>';
    };
    vocabBox.innerHTML =
      card('Reading vocabulary', 'You read one of up to three questions aloud, for example "Who was the first President?"', DATA.VOCAB.reading) +
      card('Writing vocabulary', 'You write one of up to three sentences the officer reads, for example "Washington was the first President."', DATA.VOCAB.writing);
  }
})();
