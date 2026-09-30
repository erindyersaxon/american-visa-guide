/*
   American Visa Guide: interview date checker (/interview-dates).
   Runs entirely in the browser. Inputs are remembered in localStorage on
   this device only, as a convenience; nothing is sent anywhere.
 */
(function () {
  'use strict';

  // Days the US Embassy London is closed: US federal holidays (observed)
  // and bank holidays in England, 2026–2027. Extend each year.
  const HOLIDAYS = new Set([
    // US federal, 2026
    '2026-01-01', '2026-01-19', '2026-02-16', '2026-05-25', '2026-06-19', '2026-07-03',
    '2026-09-07', '2026-10-12', '2026-11-11', '2026-11-26', '2026-12-25',
    // England, 2026
    '2026-04-03', '2026-04-06', '2026-05-04', '2026-08-31', '2026-12-28',
    // US federal, 2027
    '2027-01-01', '2027-01-18', '2027-02-15', '2027-05-31', '2027-06-18', '2027-07-05',
    '2027-09-06', '2027-10-11', '2027-11-11', '2027-11-25', '2027-12-24', '2027-12-31',
    // England, 2027
    '2027-03-26', '2027-03-29', '2027-05-03', '2027-08-30', '2027-12-27', '2027-12-28',
  ]);

  const STORE_KEY = 'avg-interview-dates-v1';
  const FIELDS = ['interview', 'medical', 'passport', 'acro', 'letter', 'entry', 'taxyear'];
  const DAY = 86400000;

  const $ = id => document.getElementById(id);

  function parse(v) {
    if (!v) return null;
    const [y, m, d] = v.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  }
  function iso(d) { return d.toISOString().slice(0, 10); }
  function fmt(d) {
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  }
  function addMonths(d, n) {
    const y = d.getUTCFullYear(), m = d.getUTCMonth() + n, day = d.getUTCDate();
    const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    return new Date(Date.UTC(y, m, Math.min(day, last)));
  }
  function days(a, b) { return Math.round((b - a) / DAY); }
  function isWorkingDay(d) {
    const wd = d.getUTCDay();
    return wd !== 0 && wd !== 6 && !HOLIDAYS.has(iso(d));
  }
  function workingDaysBefore(d, n) {
    let x = new Date(d);
    let count = 0;
    while (count < n) {
      x = new Date(x - DAY);
      if (isWorkingDay(x)) count++;
    }
    return x;
  }
  function workingDaysBetween(a, b) {
    // Working days strictly after a, up to and including b.
    let n = 0, x = new Date(a);
    while (x < b) {
      x = new Date(+x + DAY);
      if (isWorkingDay(x)) n++;
    }
    return n;
  }
  function today() {
    const t = new Date();
    return new Date(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()));
  }

  function item(cls, title, body) {
    return `<li class="${cls}"><b>${title}</b>${body}</li>`;
  }

  function check() {
    const v = {};
    FIELDS.forEach(f => { v[f] = $('d-' + f).value; });
    try { localStorage.setItem(STORE_KEY, JSON.stringify(v)); } catch (e) { /* storage unavailable */ }

    const interview = parse(v.interview);
    const medical = parse(v.medical);
    const passport = parse(v.passport);
    const acro = parse(v.acro);
    const letter = parse(v.letter);
    const entry = parse(v.entry);
    const now = today();
    const out = [];

    if (!interview && !letter) {
      $('d-results').innerHTML = item('info', 'Enter your interview date to start.', ' Everything else is optional.');
      return;
    }

    if (interview) {
      const until = days(now, interview);
      if (until < 0) {
        out.push(item('info', `Your interview date was ${fmt(interview)}.`, ' Dates below are still worked out from it.'));
      }

      // Public charge statement: 5 working days before
      const due = workingDaysBefore(interview, 5);
      const left = days(now, due);
      out.push(item(left < 0 ? 'bad' : left <= 3 ? 'warn' : 'ok',
        `Public charge statement: upload and email by ${fmt(due)}`,
        left < 0
          ? ' That is already past. Send it now anyway: upload to CEAC, then email LNDIVSubmissions@state.gov. A late statement is better than none, but it may not be read before the interview. <a href="/public-charge-statement">Build it</a>.'
          : ` Five working days before the interview, not counting weekends or UK and US holidays. ${left === 0 ? 'That is today.' : left + ' day' + (left === 1 ? '' : 's') + ' from now.'} <a href="/public-charge-statement">Build it</a>.`));

      // Interview on/after 1 Oct 2026: I-864 edition
      if (interview >= parse('2026-10-01')) {
        out.push(item('info', 'Any new I-864 must be on the 08/24/26 edition',
          ' USCIS accepts only that edition from 1 October 2026. It applies to any affidavit signed now, for example from a new or replacement joint sponsor. Sponsors should lift any credit freeze. <a href="/public-charge#i864">Details</a>.'));
      }
    }

    // Medical: valid 6 months; entry must be within the same 6 months
    if (medical) {
      const expiry = addMonths(medical, 6);
      if (interview) {
        const gapWd = workingDaysBetween(medical, interview);
        if (medical > interview) {
          out.push(item('bad', 'Your medical is after your interview date',
            ' The medical must come first, at least 10 working days before the interview. Check the dates.'));
        } else if (interview >= expiry) {
          out.push(item('bad', `Your medical expires on ${fmt(expiry)}, before your interview`,
            ' Medical results are valid for 6 months. You will need a new medical. Raise it with the Immigrant Visa Unit when you confirm the appointment, and call VisaMedicals on 020 7486 7822.'));
        } else {
          const gap = days(interview, expiry);
          const cls = gap < 21 ? 'bad' : gap < 45 ? 'warn' : 'ok';
          out.push(item(cls, `You must enter the US by ${fmt(expiry)}`,
            ` Medical results are valid for 6 months from ${fmt(medical)}, and you must enter the US on the visa within those same 6 months. That leaves <strong>${gap} days</strong> after the interview for the passport to come back by courier (typically 2 to 7 working days) and for you to travel.` +
            (cls === 'bad' ? ' That is very tight. Ask the Immigrant Visa Unit whether you should repeat the medical.' : cls === 'warn' ? ' Plan travel early.' : '')));
          if (gapWd < 10) {
            out.push(item('warn', `Your medical is only ${gapWd} working day${gapWd === 1 ? '' : 's'} before the interview`,
              ' VisaMedicals asks for the medical to be at least 10 working days before the interview, so results reach the embassy in time.'));
          }
        }
        if (entry && entry > expiry) {
          out.push(item('bad', `Your planned entry date is after ${fmt(expiry)}`,
            ' You must enter the US within 6 months of your medical. Move your travel earlier.'));
        }
      } else {
        out.push(item('info', `Medical valid until ${fmt(expiry)}`,
          ' You must enter the US by this date. Add your interview date to check the gap.'));
      }
    }

    // Passport: valid 6 months beyond intended entry
    if (passport) {
      let basis = entry, basisText = 'your planned entry date';
      if (!basis && medical) { basis = addMonths(medical, 6); basisText = 'the last day you could enter (6 months after your medical)'; }
      if (!basis && interview) { basis = interview; basisText = 'your interview date (add a medical or entry date for a better check)'; }
      if (basis) {
        const need = addMonths(basis, 6);
        out.push(item(passport >= need ? 'ok' : 'bad',
          passport >= need ? 'Passport validity is fine' : 'Your passport may not be valid long enough',
          ` London asks for a passport valid at least 6 months beyond your intended date of entry. Measured from ${basisText}, it needs to run to ${fmt(need)}; yours expires ${fmt(passport)}.` +
          (passport >= need ? '' : ' Renew now, or plan to enter earlier.')));
      }
    }

    // ACRO: 12 months for embassy purposes
    if (acro && interview) {
      const acroEnd = addMonths(acro, 12);
      out.push(item(acroEnd > interview ? 'ok' : 'bad',
        acroEnd > interview ? 'ACRO police certificate is in date' : 'Your ACRO police certificate will be over 12 months old',
        ` The embassy treats it as valid for 12 months: yours runs to ${fmt(acroEnd)}.` + (acroEnd > interview ? '' : ' Apply for a new one now.')));
    }

    // Tax year recency
    if (v.taxyear && interview) {
      const y = interview.getUTCFullYear();
      const latestFileable = interview >= parse(y + '-04-15') ? y - 1 : y - 2;
      const have = Number(v.taxyear);
      if (have < latestFileable) {
        out.push(item('warn', `A ${latestFileable} tax return may now be available`,
          ` Your CEAC documents go up to ${have}. The US filing deadline for ${latestFileable} returns was 15 April ${latestFileable + 1}. If any sponsor has filed, upload the new IRS transcript for every sponsor before the interview. <a href="https://www.irs.gov/individuals/get-transcript" target="_blank" rel="noopener noreferrer">Get a transcript</a>.`));
      } else {
        out.push(item('ok', 'Tax year looks current', ` ${have} is the most recent year a sponsor would normally have filed.`));
      }
    }

    // 221(g) one-year clock
    if (letter) {
      const end = addMonths(letter, 12);
      const left = days(now, end);
      out.push(item(left < 0 ? 'bad' : left < 60 ? 'warn' : 'info',
        `221(g) one-year deadline: ${fmt(end)}`,
        left < 0
          ? ' More than a year has passed since the date on your letter. Under INA §203(g) the application can be canceled. Speak to an immigration attorney.'
          : ` Under INA §203(g) you must act within one year of the date on the letter. ${left} days left. Do not wait for it: submit as soon as you can. If you get a new sheet, enter its date too.`));
    }

    $('d-results').innerHTML = out.join('');
  }

  function init() {
    const form = $('d-form');
    if (!form) return;
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
      if (saved) FIELDS.forEach(f => { if (saved[f]) $('d-' + f).value = saved[f]; });
    } catch (e) { /* storage unavailable */ }
    form.addEventListener('input', check);
    form.addEventListener('submit', e => { e.preventDefault(); check(); });
    $('d-clear').addEventListener('click', () => {
      FIELDS.forEach(f => { $('d-' + f).value = ''; });
      try { localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ }
      check();
    });
    check();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
