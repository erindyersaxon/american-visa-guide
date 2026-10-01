/*
   American Visa Guide: public charge statement builder
   (/public-charge-statement). Produces the same statement as the template
   on /public-charge#template, from form fields. Empty optional fields drop
   their sentence; empty required fields show as [brackets], and a status
   bar counts them. Runs in the browser; answers are remembered in
   localStorage on this device only.
 */
(function () {
  'use strict';

  const KEY = 'avg-pc-statement-v1';
  const form = document.getElementById('pc-form');
  const out = document.getElementById('pc-out');
  if (!form || !out) return;

  const fields = Array.prototype.slice.call(form.querySelectorAll('input, select, textarea'));

  function val(id) {
    const el = document.getElementById(id);
    if (!el) return '';
    if (el.type === 'checkbox') return el.checked;
    return el.value.trim();
  }
  const ph = (v, placeholder) => v || '[' + placeholder + ']';
  const lines = s => s.split('\n').map(x => x.trim()).filter(Boolean);
  const sentence = s => s ? s.replace(/\s*\.?\s*$/, '.') : '';

  // data-show="a=b&!c&d": every clause must hold
  function holds(cond) {
    return cond.split('&').every(c => {
      c = c.trim();
      if (c.startsWith('!')) return !val(c.slice(1));
      const i = c.indexOf('=');
      if (i > -1) return val(c.slice(0, i)) === c.slice(i + 1);
      return !!val(c);
    });
  }
  function toggle() {
    form.querySelectorAll('[data-show]').forEach(el => {
      el.classList.toggle('is-on', holds(el.getAttribute('data-show')));
    });
  }

  function build() {
    const name = ph(val('name'), 'Beneficiary Full Name');
    const kase = ph(val('case'), 'LND0123456789');
    const js = val('jsname');
    const p = [];

    p.push('To: LNDIVSubmissions@state.gov');
    p.push('Subject: Public Charge Statement – ' + kase + ' – ' + name);
    p.push('');
    p.push('Dear Immigrant Visa Unit,');
    p.push('');
    p.push('I am writing to submit my public charge statement in advance of my immigrant visa interview. My case number is ' + kase + ' and my interview is scheduled for ' + ph(val('idate'), 'DATE') + '. The statement and supporting evidence have also been uploaded to my case in CEAC.');
    p.push('');

    // PERSONAL CIRCUMSTANCES
    const pc = [];
    pc.push('I am ' + ph(val('age'), 'age') + ' years old.');
    if (val('english') === 'fluent') {
      pc.push('I am fluent in English, and my ' + ph(val('englishbasis'), 'education / professional qualifications / current employment') + ' has been conducted in English.');
    } else {
      pc.push('English is my first language.');
    }
    pc.push('My highest qualification is ' + ph(val('qual'), 'qualification') + ' from ' + ph(val('qualinst'), 'institution') + ', awarded in ' + ph(val('qualyear'), 'year') + '.');
    if (val('extraqual')) pc.push('I also hold ' + sentence(val('extraqual')) + ' These skills are directly transferable to the US labor market.');
    const rel = val('rel') === 'other' ? 'the ' + ph(val('relother'), 'relationship') + ' of my petitioner' : 'married to my petitioner';
    pc.push('I am ' + rel + ', and ' + (val('owndeps') ? 'my dependents are ' + sentence(val('owndeps')) : 'I have no dependents.'));
    pc.push(val('petdeps') ? 'My petitioner has ' + sentence(val('petdeps')) : 'My petitioner has no dependents other than those named above.');
    if (val('depcare')) pc.push(sentence(val('depcare')) + ' It does not depend on public funding.');
    p.push('PERSONAL CIRCUMSTANCES');
    p.push(pc.join(' '));
    p.push('');

    if (val('condition')) {
      p.push('I have ' + val('condition') + ', which is well managed with ' + ph(val('treatment'), 'treatment') + '. It does not affect my ability to work. I have researched the cost of this treatment in the United States: it costs approximately ' + ph(val('treatcost'), '$XXX per month') + '. That cost will be met by the health insurance and income described below.');
    } else {
      p.push('I am in good health and have no condition that would prevent me from working.');
    }
    p.push('');

    // HOUSING
    p.push('HOUSING');
    const lw = ph(val('liveswith'), 'my spouse, Name');
    if (val('address')) {
      p.push('Upon entry to the United States, I will be living with ' + lw + ', at ' + val('address') + '. The housing costs will be met by ' + ph(val('housingpaid'), 'my petitioner\'s income') + '.');
    } else {
      p.push('Upon entry to the United States, I will be living with ' + lw + '. We are currently in the process of securing accommodation in ' + ph(val('area'), 'City, State') + ' and expect to confirm our address within ' + ph(val('areatime'), 'timeframe') + '. The housing costs will be met by ' + ph(val('housingpaid'), 'my petitioner\'s income') + '.');
    }
    p.push('');

    // EMPLOYMENT
    p.push('EMPLOYMENT');
    const emp = [];
    emp.push('I am a ' + ph(val('job'), 'job title') + ' with ' + ph(val('years'), 'X') + ' years of experience in ' + ph(val('sector'), 'sector') + '. I have been continuously employed in this field since ' + ph(val('since'), 'year') + ', most recently with ' + ph(val('employer'), 'Employer') + ' since ' + ph(val('employersince'), 'year') + '.');
    if (val('licence')) emp.push('My profession is licensed in the United States. I have ' + sentence(val('licence')));
    p.push(emp.join(' '));
    p.push('');
    if (val('workplan') === 'keep') {
      let s = 'I am currently employed by ' + ph(val('employer'), 'Employer') + ' and plan to continue in my role following my move.';
      s += val('keepconfirmed')
        ? ' My employer has confirmed in writing that they permit me to work from the United States, and I can provide that confirmation on request.'
        : ' [Your employer has not confirmed in writing that you may work from the US. Get that confirmation, or describe this as employment you will seek.]';
      s += ' My current salary is approximately ' + ph(val('salary'), '$XX,XXX') + ' per year.';
      if (val('fallback')) s += ' If that arrangement were to end, I would ' + sentence(val('fallback'));
      p.push(s);
    } else {
      p.push('I plan to seek employment in ' + ph(val('sector'), 'sector') + ' upon arrival. I have ' + ph(val('years'), 'X') + ' years of experience in the field and expect to secure employment within ' + ph(val('seektime'), 'timeframe') + ', at an estimated salary of approximately ' + ph(val('seeksalary'), '$XX,XXX') + ' per year. I have already begun researching roles in ' + ph(val('seekarea'), 'City, State') + '.');
    }
    p.push('');
    let sp = 'My petitioner, ' + ph(val('pname'), 'Name') + ', works as a ' + ph(val('pjob'), 'job title') + ' at ' + ph(val('pemployer'), 'Employer') + ', earning approximately ' + ph(val('pgross'), '$XX,XXX') + ' per year before tax, and approximately ' + ph(val('pnet'), '$XX,XXX') + ' after tax.';
    if (val('otheradult')) sp += ' ' + sentence(val('otheradult'));
    if (js) sp += ' My joint sponsor, ' + js + ', works as a ' + ph(val('jsjob'), 'job title') + ' at ' + ph(val('jsemployer'), 'Employer') + ', earning approximately ' + ph(val('jsincome'), '$XX,XXX') + ' per year.';
    sp += ' During any period before my own employment begins, my household will be supported by ' + (js ? 'my petitioner\'s and my joint sponsor\'s' : 'my petitioner\'s') + ' income. The I-864 Affidavit' + (js ? 's' : '') + ' of Support confirm' + (js ? '' : 's') + ' this commitment.';
    p.push(sp);
    p.push('');

    // HEALTH INSURANCE
    p.push('HEALTH INSURANCE');
    if (val('ins') === 'employer') {
      p.push('I will be added to my family\'s employer-provided health insurance plan through ' + ph(val('insemployer'), 'Employer') + ' once my Social Security Number is issued. The plan is provided by ' + ph(val('insprovider'), 'Insurance provider') + ' and covers dependents. The premiums will be paid for by ' + ph(val('inspaid'), 'my petitioner\'s income') + '. This coverage is tied to employment that has been continuous. If that role ended, we would maintain cover through ' + ph(val('insfallback'), 'COBRA or the ACA marketplace') + '.');
    } else {
      p.push('I will obtain health insurance through the Affordable Care Act marketplace. I have researched available plans in ' + ph(val('insstate'), 'State') + ' and expect the monthly premium to be approximately ' + ph(val('inspremium'), '$XXX') + '. The premiums will be paid for by ' + ph(val('inspaid'), 'my petitioner\'s income') + '.');
    }
    p.push('');

    // SAVINGS AND ASSETS
    p.push('SAVINGS AND ASSETS');
    const sa = [];
    sa.push('In addition to the income described above, and not in place of it, ' + (val('saveswho') === 'joint' ? 'my petitioner and I jointly have' : 'I have') + ' savings of approximately ' + ph(val('savings'), '$XX,XXX') + '. I regard these as a contingency buffer rather than a source of support: they would cover our housing, insurance and living costs for approximately ' + ph(val('savemonths'), 'X') + ' months if they were ever needed. These funds are held in readily accessible accounts and can be evidenced by bank statements, which I can provide on request.');
    if (val('saveswho') === 'joint' && (val('saveme') || val('savepet'))) sa.push('Of this, ' + ph(val('saveme'), '$XX,XXX') + ' is held in my own name and ' + ph(val('savepet'), '$XX,XXX') + ' in my petitioner\'s.');
    if (val('property')) sa.push('I also hold ' + sentence(val('property')) + ' I can provide documentary proof of ownership for each.');
    if (val('otherincome')) sa.push('I additionally earn ' + sentence(val('otherincome')));
    sa.push('The household costs set out above are met from the income described in each section.');
    sa.push(val('debts') ? 'My outstanding liabilities are ' + sentence(val('debts')) : 'I have no significant outstanding debts or financial liabilities.');
    if (val('slc')) sa.push('I have a UK student loan (Plan ' + val('slcplan') + ') with the Student Loans Company, with a balance of approximately £' + ph(val('slcgbp'), 'X').replace(/^£/, '') + ' ($' + ph(val('slcusd'), 'X').replace(/^\$/, '') + '). I have told the Student Loans Company that I am moving to the United States. Repayments while I live abroad are set by the Student Loans Company against my overseas income and will be approximately $' + ph(val('slcmonth'), 'XXX').replace(/^\$/, '') + ' per month, paid from ' + ph(val('slcpaid'), 'income source') + '. My latest statement is attached.');
    p.push(sa.join(' '));
    p.push('');

    // PUBLIC BENEFITS
    p.push('PUBLIC BENEFITS');
    const pb = [];
    pb.push(val('benefits') === 'yes'
      ? sentence(ph(val('benefitsdetail'), 'What you received, when, why, and what changed'))
      : 'I have never received means-tested public assistance or social welfare benefits in the United Kingdom, the United States, or any other country.');
    pb.push(val('petbenefits') ? 'My petitioner ' + sentence(val('petbenefits')) : 'My petitioner has never received means-tested public assistance.');
    if (js) pb.push(val('jsbenefits') ? 'My joint sponsor ' + sentence(val('jsbenefits')) : 'My joint sponsor has never received means-tested public assistance.');
    pb.push(val('institution') ? sentence(val('institution')) : 'Neither I nor my petitioner has ever been institutionalized for long-term care at government expense.');
    p.push(pb.join(' '));
    p.push('');
    p.push('I am committed to supporting myself and my family independently and have no intention of relying on public benefits. I am happy to provide any additional information if required.');
    p.push('');
    p.push('Yours sincerely,');
    p.push(name);
    p.push('Case Number: ' + kase);
    if (val('email')) p.push(val('email'));
    p.push('');

    // ATTACHED EVIDENCE
    const ev = ['Public charge statement'];
    if (val('ev-pettax')) ev.push('Petitioner IRS tax returns / transcripts, last 3 years');
    if (val('ev-petpay')) ev.push('Petitioner payslips, last 3 months');
    if (val('ev-petbank')) ev.push('Petitioner bank statements, last 3 months');
    if (val('ev-petins')) ev.push('Petitioner health insurance, plan confirmation or summary of benefits');
    if (val('ev-jstax')) ev.push('Joint sponsor IRS tax returns / transcripts, last 3 years');
    if (val('ev-slc')) ev.push('Beneficiary UK student loan statement');
    if (val('ev-employer')) ev.push('Employer letter confirming US-based work is permitted');
    p.push('ATTACHED EVIDENCE');
    ev.forEach((e, i) => p.push(String(i + 1).padStart(2, '0') + ' ' + e));
    p.push('');

    p.push('APPENDIX A: WORK HISTORY');
    const wh = lines(val('workhist'));
    (wh.length ? wh : ['[Job title] – [Employer name] – [years]']).forEach(l => p.push(l));
    p.push('');
    p.push('APPENDIX B: EDUCATION AND QUALIFICATIONS');
    const eh = lines(val('eduhist'));
    (eh.length ? eh : ['[Qualification and subject] – [Institution] – [Year]']).forEach(l => p.push(l));

    return p.join('\n');
  }

  function save() {
    const data = {};
    fields.forEach(el => { if (el.id) data[el.id] = el.type === 'checkbox' ? el.checked : el.value; });
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* storage unavailable */ }
  }
  function restore() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!data) return;
      fields.forEach(el => {
        if (!el.id || !(el.id in data)) return;
        if (el.type === 'checkbox') el.checked = !!data[el.id];
        else el.value = data[el.id];
      });
    } catch (e) { /* storage unavailable */ }
  }

  // Count the [bracketed] placeholders left in the statement, so the
  // reader can see from anywhere on the form how much is still missing.
  const bar = document.getElementById('pc-bar');
  const barText = document.getElementById('pc-bar-text');
  const gapsEl = document.getElementById('pc-gaps');
  function gapCount() { return (out.textContent.match(/\[[^\]]+\]/g) || []).length; }
  function gapText(n) {
    return n === 0 ? 'No gaps left. Read it through before you send it.'
      : n === 1 ? '1 gap left in [brackets].'
      : n + ' gaps left in [brackets].';
  }
  function showGaps() {
    const n = gapCount();
    if (barText) barText.textContent = gapText(n);
    if (bar) bar.classList.toggle('is-done', n === 0);
    if (gapsEl) {
      gapsEl.textContent = n === 0 ? gapText(0) : gapText(n) + ' Fill each one, or delete the sentence, before you send it.';
      gapsEl.classList.toggle('is-done', n === 0);
    }
  }

  function update() {
    toggle();
    out.textContent = build();
    showGaps();
    save();
  }

  restore();
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  update();

  document.getElementById('pc-copy').addEventListener('click', function () {
    const btn = this;
    const n = gapCount();
    const done = () => {
      btn.textContent = n ? 'Copied, with ' + n + (n === 1 ? ' gap' : ' gaps') : 'Copied';
      setTimeout(() => { btn.textContent = 'Copy'; }, 2500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(out.textContent).then(done, () => selectOut());
    } else selectOut();
  });
  function selectOut() {
    const r = document.createRange(); r.selectNodeContents(out);
    const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
  }
  document.getElementById('pc-download').addEventListener('click', () => {
    const n = gapCount();
    if (n && !window.confirm('Your statement still has ' + n + (n === 1 ? ' gap' : ' gaps') + ' in [brackets]. Download it anyway?')) return;
    const blob = new Blob([out.textContent], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '01_Public_Charge_Statement.txt';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  document.getElementById('pc-clear').addEventListener('click', () => {
    if (!window.confirm('Clear every answer on this form?')) return;
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    form.reset();
    update();
  });
})();
