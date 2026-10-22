/*
   American Visa Guide: public charge statement builder
   (/public-charge-statement). Produces the same statement as the template
   on /public-charge#template, from form fields. The applicant type (spouse,
   child under 18, son or daughter, parent) changes the questions and the
   wording; a child's statement is written by the petitioner on the
   child's behalf. Empty optional fields drop
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

  // data-show="a=b&c!=d&!e&f|g": every &-clause must hold, and a clause
  // holds when any of its |-terms does
  function term(c) {
    c = c.trim();
    let i = c.indexOf('!=');
    if (i > -1) return val(c.slice(0, i)) !== c.slice(i + 2);
    if (c.startsWith('!')) return !val(c.slice(1));
    i = c.indexOf('=');
    if (i > -1) return val(c.slice(0, i)) === c.slice(i + 1);
    return !!val(c);
  }
  function holds(cond) {
    return cond.split('&').every(c => c.split('|').some(term));
  }
  // An element counts as shown only if no .opt ancestor is hidden
  function shown(el) {
    for (let o = el.closest('.opt'); o; o = o.parentElement && o.parentElement.closest('.opt')) {
      if (!o.classList.contains('is-on')) return false;
    }
    return true;
  }
  function toggle() {
    form.querySelectorAll('[data-show]').forEach(el => {
      el.classList.toggle('is-on', holds(el.getAttribute('data-show')));
    });
  }

  // "a" or "an" before a job title, judged by its first letter. A
  // placeholder in brackets keeps "a".
  const an = w => (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w;

  function evidence(p) {
    // Codes match the evidence pack table on /public-charge#deliverables.
    // Boxes hidden for this applicant type stay out of the list.
    const ev = ['00 Public charge statement'];
    form.querySelectorAll('input[id^="ev-"]').forEach(box => {
      if (box.checked && shown(box)) ev.push(box.parentNode.textContent.trim());
    });
    p.push('ATTACHED EVIDENCE');
    ev.forEach(e => p.push(e));
  }

  function build() {
    if (val('rel') === 'child') return buildChild();
    const rel = val('rel');
    const retired = val('workplan') === 'retired';
    const name = ph(val('name'), 'Beneficiary Full Name');
    const kase = ph(val('case'), 'LND0123456789');
    const js = val('jsname');
    const p = [];

    p.push('To: LNDIVSubmissions@state.gov');
    p.push('Subject: Public Charge Statement – ' + kase + ' – ' + name);
    p.push('');
    p.push('Dear Immigrant Visa Unit,');
    p.push('');
    p.push('I submit this public charge statement ahead of my immigrant visa interview. My case number is ' + kase + ', and my interview is on ' + ph(val('idate'), 'DATE') + '. I have also uploaded this statement and its evidence to my case in CEAC.');
    p.push('');

    // PERSONAL CIRCUMSTANCES
    const pc = [];
    pc.push('I am ' + ph(val('age'), 'age') + ' years old.');
    if (val('english') === 'fluent') {
      pc.push('I am fluent in English, and I have used it throughout my ' + ph(val('englishbasis'), 'education / professional qualifications / current employment') + '.');
    } else {
      pc.push('English is my first language.');
    }
    pc.push('My highest qualification is ' + ph(val('qual'), 'qualification') + ', which I received from ' + ph(val('qualinst'), 'institution') + ' in ' + ph(val('qualyear'), 'year') + '.');
    if (val('extraqual')) pc.push('I also hold ' + sentence(val('extraqual')) + ' I can apply these skills in the US labor market.');
    const relText = rel === 'spouse' ? 'married to my petitioner' : 'the ' + ph(val('relother'), 'relationship') + ' of my petitioner';
    pc.push('I am ' + relText + ', and ' + (val('owndeps') ? 'my dependents are ' + sentence(val('owndeps')) : 'I have no dependents.'));
    if (rel === 'adult' && val('indepsince')) pc.push('I have supported myself since ' + val('indepsince') + ', and my petitioner does not support me financially.');
    pc.push(val('petdeps') ? 'My petitioner has ' + sentence(val('petdeps')) : 'My petitioner has no dependents other than those I name above.');
    if (val('depcare')) pc.push(sentence(val('depcare')) + ' No public funding pays for that care.');
    p.push('PERSONAL CIRCUMSTANCES');
    p.push(pc.join(' '));
    p.push('');

    if (val('condition')) {
      p.push('I have ' + val('condition') + ', which I manage with ' + ph(val('treatment'), 'treatment') + '.' + (retired ? '' : ' It does not affect my ability to work.') + ' I have priced this treatment in the United States: it costs about ' + ph(val('treatcost'), '$XXX per month') + '. The health insurance and income I describe below will cover that cost.');
    } else {
      p.push(retired ? 'I am in good health.' : 'I am in good health and have no condition that would prevent me from working.');
    }
    p.push('');

    // HOUSING
    p.push('HOUSING');
    const lw = ph(val('liveswith'), rel === 'spouse' ? 'my spouse, Name' : 'name, and their relationship to you');
    const pays = ' We will pay the housing costs from ' + ph(val('housingpaid'), 'my petitioner\'s income') + '.';
    if (val('address')) {
      p.push('When I enter the United States, I will live with ' + lw + ', at ' + val('address') + '.' + pays);
    } else {
      p.push('When I enter the United States, I will live with ' + lw + '. We are looking for a home in ' + ph(val('area'), 'City, State') + ' and expect to confirm our address within ' + ph(val('areatime'), 'timeframe') + '.' + pays);
    }
    p.push('');

    // EMPLOYMENT
    p.push('EMPLOYMENT');
    const emp = [];
    if (retired) {
      emp.push('I retired in ' + ph(val('retiredsince'), 'year') + ' after ' + ph(val('years'), 'X') + ' years as ' + an(ph(val('job'), 'job title')) + ' in ' + ph(val('sector'), 'sector') + ', most recently with ' + ph(val('employer'), 'Employer') + '. I do not plan to work in the United States. I describe the pensions I receive under RETIREMENT below.');
    } else emp.push('I am ' + an(ph(val('job'), 'job title')) + ' with ' + ph(val('years'), 'X') + ' years of experience in ' + ph(val('sector'), 'sector') + '. I have worked in this field without a break since ' + ph(val('since'), 'year') + ', and for ' + ph(val('employer'), 'Employer') + ' since ' + ph(val('employersince'), 'year') + '.');
    if (val('licence')) emp.push('My profession requires a license in the United States. I have ' + sentence(val('licence')));
    p.push(emp.join(' '));
    p.push('');
    if (retired) {
      // the pension takes the place of a work plan
    } else if (val('workplan') === 'keep') {
      let s = 'I work for ' + ph(val('employer'), 'Employer') + ' and plan to keep my role after I move.';
      s += val('keepconfirmed')
        ? ' My employer has confirmed in writing that I may work from the United States, and I can provide that letter on request.'
        : ' [Your employer has not confirmed in writing that you may work from the US. Get that confirmation, or describe this as employment you will seek.]';
      s += ' I earn about ' + ph(val('salary'), '$XX,XXX') + ' per year.';
      if (val('fallback')) s += ' If that arrangement ended, I would ' + sentence(val('fallback'));
      p.push(s);
    } else {
      p.push('I plan to look for work in ' + ph(val('sector'), 'sector') + ' when I arrive. I have ' + ph(val('years'), 'X') + ' years of experience in the field and expect to find a job within ' + ph(val('seektime'), 'timeframe') + ', earning about ' + ph(val('seeksalary'), '$XX,XXX') + ' per year. I have begun researching roles in ' + ph(val('seekarea'), 'City, State') + '.');
    }
    if (!retired) p.push('');
    let sp = 'My petitioner, ' + ph(val('pname'), 'Name') + ', works as ' + an(ph(val('pjob'), 'job title')) + ' at ' + ph(val('pemployer'), 'Employer') + ', earning about ' + ph(val('pgross'), '$XX,XXX') + ' per year before tax and about ' + ph(val('pnet'), '$XX,XXX') + ' after tax.';
    if (val('otheradult')) sp += ' ' + sentence(val('otheradult'));
    if (js) sp += ' My joint sponsor, ' + js + ', works as ' + an(ph(val('jsjob'), 'job title')) + ' at ' + ph(val('jsemployer'), 'Employer') + ', earning about ' + ph(val('jsincome'), '$XX,XXX') + ' per year.';
    if (rel === 'spouse') {
      sp += js
        ? ' My petitioner and my joint sponsor will support our household, and each has signed an I-864 Affidavit of Support committing to this.'
        : ' My petitioner will support our household, and has signed an I-864 Affidavit of Support committing to this.';
    } else {
      sp += js
        ? ' My petitioner and my joint sponsor have each signed an I-864 Affidavit of Support for me, committing to support me if I need it.'
        : ' My petitioner has signed an I-864 Affidavit of Support for me, committing to support me if I need it.';
    }
    p.push(sp);
    p.push('');

    // HEALTH INSURANCE
    p.push('HEALTH INSURANCE');
    if (val('ins') === 'employer') {
      p.push('Once I receive my Social Security Number, I will join my family\'s employer health insurance plan through ' + ph(val('insemployer'), 'Employer') + '. ' + ph(val('insprovider'), 'Insurance provider') + ' provides the plan, and it covers dependents. We will pay the premiums from ' + ph(val('inspaid'), 'my petitioner\'s income') + '. This coverage depends on employment with ' + ph(val('insemployer'), 'Employer') + ', which has been continuous since ' + ph(val('inssince'), 'year') + '. If that job ended, we would keep cover through ' + ph(val('insfallback'), 'COBRA or the ACA marketplace') + '.');
    } else {
      p.push((rel === 'parent' ? 'As a permanent resident, I can enroll in Medicare only after five years of continuous residence. Until then, ' : '') + 'I will buy health insurance through the Affordable Care Act marketplace. I have compared plans in ' + ph(val('insstate'), 'State') + ' and expect to pay about ' + ph(val('inspremium'), '$XXX') + ' per month. We will pay the premiums from ' + ph(val('inspaid'), 'my petitioner\'s income') + '.');
    }
    p.push('');

    // SAVINGS AND ASSETS
    p.push('SAVINGS AND ASSETS');
    const sa = [];
    const joint = val('saveswho') === 'joint';
    sa.push((joint ? 'My petitioner and I also have savings of about ' : 'I also have savings of about ') + ph(val('savings'), '$XX,XXX') + ', on top of the income above. ' + (joint ? 'We' : 'I') + ' keep them as a buffer for emergencies: they would cover our housing, insurance and living costs for about ' + ph(val('savemonths'), 'X') + ' months. ' + (joint ? 'We' : 'I') + ' can draw on them at once, and I can provide bank statements on request.');
    if (joint && (val('saveme') || val('savepet'))) sa.push('Of this, ' + ph(val('saveme'), '$XX,XXX') + ' is in my name and ' + ph(val('savepet'), '$XX,XXX') + ' in my petitioner\'s.');
    if (val('property')) sa.push('I also hold ' + sentence(val('property')) + ' I can provide proof of ownership for each.');
    if (val('otherincome')) sa.push((retired ? 'Besides my pensions, I receive ' : 'Besides my salary, I earn ') + sentence(val('otherincome')));
    sa.push('We meet the household costs above from the income in each section.');
    sa.push(val('debts') ? 'My outstanding debts are ' + sentence(val('debts')) : 'I have no significant debts.');
    if (val('slc')) sa.push('I have a UK student loan (Plan ' + val('slcplan') + ') with the Student Loans Company, with a balance of about £' + ph(val('slcgbp'), 'X').replace(/^£/, '') + ' ($' + ph(val('slcusd'), 'X').replace(/^\$/, '') + '). I have told the Company that I am moving to the United States. While I live abroad, the Company sets my repayments against my overseas income. I expect to pay about $' + ph(val('slcmonth'), 'XXX').replace(/^\$/, '') + ' per month, from ' + ph(val('slcpaid'), 'income source') + '. I attach my latest statement.');
    p.push(sa.join(' '));
    p.push('');

    // RETIREMENT
    const rt = [];
    if (val('retirework')) rt.push('I plan to work in the United States until retirement and earn the 40 Social Security credits, about 10 years of work, that qualify me for a US retirement benefit.');
    if (retired) rt.push('I receive ' + sentence(ph(val('retireplan'), 'each pension, who pays it, and the amount in dollars per year')) + ' These payments continue while I live in the United States. I attach the latest statement for each.');
    else if (val('retireplan')) rt.push((rt.length ? 'I will also fund my retirement from ' : 'I will fund my retirement from ') + sentence(val('retireplan')) + ' I attach the latest statement for each.');
    if (rt.length) {
      p.push('RETIREMENT');
      p.push(rt.join(' '));
      p.push('');
    }
    if (rel === 'parent') {
      p.push('CARE IN LATER LIFE');
      p.push('If I could no longer live independently, ' + sentence(ph(val('ltc'), 'who would care for you, and who would pay')) + ' I would not rely on care at government expense.');
      p.push('');
    }

    // PUBLIC BENEFITS
    p.push('PUBLIC BENEFITS');
    const pb = [];
    pb.push(val('benefits') === 'yes'
      ? sentence(ph(val('benefitsdetail'), 'What you received, when, why, and what changed'))
      : 'I have never received means-tested public assistance or social welfare benefits in the United Kingdom, the United States, or any other country.');
    pb.push(val('petbenefits') ? 'My petitioner ' + sentence(val('petbenefits')) : 'My petitioner has never received means-tested public assistance.');
    if (js) pb.push(val('jsbenefits') ? 'My joint sponsor ' + sentence(val('jsbenefits')) : 'My joint sponsor has never received means-tested public assistance.');
    pb.push(val('institution') ? sentence(val('institution')) : 'Neither I nor my petitioner has ever received long-term institutional care at government expense.');
    p.push(pb.join(' '));
    p.push('');
    p.push('I will support myself and my family without public benefits. I can provide any further information you need.');
    p.push('');
    p.push('Yours sincerely,');
    p.push(name);
    p.push('Case Number: ' + kase);
    if (val('email')) p.push(val('email'));
    p.push('');

    evidence(p);
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

  // A child under 18: the petitioner writes on the child's behalf. The
  // child's own details come from sections 1 and 2; from housing on, the
  // answers are the petitioner's.
  function buildChild() {
    const full = ph(val('name'), 'Child Full Name');
    const c = val('name') ? val('name').split(/\s+/)[0] : '[Child]';
    const kase = ph(val('case'), 'LND0123456789');
    const pname = ph(val('pname'), 'Petitioner Full Name');
    const js = val('jsname');
    const exempt = !!val('exempt');
    const p = [];

    p.push('To: LNDIVSubmissions@state.gov');
    p.push('Subject: Public Charge Statement – ' + kase + ' – ' + full);
    p.push('');
    p.push('Dear Immigrant Visa Unit,');
    p.push('');
    p.push('I am ' + pname + ', the ' + ph(val('prel'), 'father / mother') + ' and petitioner of ' + full + '. I submit this public charge statement on ' + c + '\'s behalf ahead of the immigrant visa interview. The case number is ' + kase + ', and the interview is on ' + ph(val('idate'), 'DATE') + '. I have also uploaded this statement and its evidence to the case in CEAC.');
    p.push('');

    p.push('THE CHILD');
    const ch = [];
    ch.push(c + ' is ' + ph(val('age'), 'age') + ' years old.');
    ch.push(val('english') === 'fluent'
      ? c + ' is fluent in English, through ' + ph(val('englishbasis'), 'school / home') + '.'
      : 'English is ' + c + '\'s first language.');
    if (exempt) ch.push(c + ' will live with me in the United States, in my legal and physical custody. Because ' + c + ' is under 18 and unmarried, ' + c + ' will become a US citizen on admission under INA 320, and so does not need a Form I-864.');
    ch.push(val('custody') === 'apart'
      ? sentence(ph(val('custodydetail'), 'The other parent, where they live, and the custody arrangement or their consent'))
      : c + '\'s other parent and I live together, and we are moving as a family.');
    if (val('carer')) ch.push('Day to day, ' + c + ' is looked after by ' + sentence(val('carer')));
    p.push(ch.join(' '));
    p.push('');

    p.push('EDUCATION');
    let ed = c + ' is in ' + ph(val('grade'), 'school year') + ' at ' + ph(val('school'), 'school') + ', and expects to finish school in ' + ph(val('schoolend'), 'year') + '. In the United States, ' + c + ' will attend ' + ph(val('usschool'), 'US school or school district') + '.';
    if (val('afterschool')) ed += ' After school, ' + c + ' plans ' + sentence(val('afterschool'));
    p.push(ed);
    p.push('');

    p.push('HEALTH');
    p.push(val('condition')
      ? c + ' has ' + val('condition') + ', which is managed with ' + ph(val('treatment'), 'treatment') + '. I have priced this treatment in the United States: it costs about ' + ph(val('treatcost'), '$XXX per month') + '. The health insurance and income I describe below will cover that cost.'
      : c + ' is in good health.');
    p.push('');

    p.push('HOUSING');
    const lw = ph(val('liveswith'), 'me');
    const pays = ' We will pay the housing costs from ' + ph(val('housingpaid'), 'my income') + '.';
    p.push(val('address')
      ? c + ' will live with ' + lw + ', at ' + val('address') + '.' + pays
      : c + ' will live with ' + lw + '. We are looking for a home in ' + ph(val('area'), 'City, State') + ' and expect to confirm our address within ' + ph(val('areatime'), 'timeframe') + '.' + pays);
    p.push('');

    p.push('MY INCOME AND HOUSEHOLD');
    let sp = 'I work as ' + an(ph(val('pjob'), 'job title')) + ' at ' + ph(val('pemployer'), 'Employer') + ', earning about ' + ph(val('pgross'), '$XX,XXX') + ' per year before tax and about ' + ph(val('pnet'), '$XX,XXX') + ' after tax.';
    if (val('otheradult')) sp += ' ' + sentence(val('otheradult'));
    if (js) sp += ' My joint sponsor, ' + js + ', works as ' + an(ph(val('jsjob'), 'job title')) + ' at ' + ph(val('jsemployer'), 'Employer') + ', earning about ' + ph(val('jsincome'), '$XX,XXX') + ' per year.';
    sp += ' I will support ' + c + ' from this income.';
    if (!exempt) sp += js
      ? ' My joint sponsor and I have each signed an I-864 Affidavit of Support for ' + c + '.'
      : ' I have signed an I-864 Affidavit of Support for ' + c + '.';
    sp += ' ' + (val('petdeps') ? 'I have ' + sentence(val('petdeps')) : 'I have no dependents other than ' + c + '.');
    if (val('depcare')) sp += ' ' + sentence(val('depcare')) + ' No public funding pays for that care.';
    p.push(sp);
    p.push('');

    p.push('HEALTH INSURANCE');
    if (val('ins') === 'employer') {
      p.push(c + ' will join my employer health insurance plan through ' + ph(val('insemployer'), 'Employer') + ', which covers dependents. ' + ph(val('insprovider'), 'Insurance provider') + ' provides the plan. We will pay the premiums from ' + ph(val('inspaid'), 'my income') + '. This coverage depends on my employment with ' + ph(val('insemployer'), 'Employer') + ', which has been continuous since ' + ph(val('inssince'), 'year') + '. If that job ended, we would keep cover through ' + ph(val('insfallback'), 'COBRA or the ACA marketplace') + '.');
    } else {
      p.push('I will buy health insurance for ' + c + ' through the Affordable Care Act marketplace. I have compared plans in ' + ph(val('insstate'), 'State') + ' and expect to pay about ' + ph(val('inspremium'), '$XXX') + ' per month, from ' + ph(val('inspaid'), 'my income') + '.');
    }
    p.push('');

    p.push('SAVINGS AND ASSETS');
    const sa = [];
    sa.push('I also have savings of about ' + ph(val('savings'), '$XX,XXX') + ', on top of the income above. I keep them as a buffer for emergencies: they would cover our housing, insurance and living costs for about ' + ph(val('savemonths'), 'X') + ' months. I can draw on them at once, and I can provide bank statements on request.');
    if (val('saveswho') === 'joint' && (val('saveme') || val('savepet'))) sa.push('Of this, ' + ph(val('saveme'), '$XX,XXX') + ' is in my name and ' + ph(val('savepet'), '$XX,XXX') + ' in ' + c + '\'s.');
    if (val('property')) sa.push('I also hold ' + sentence(val('property')) + ' I can provide proof of ownership for each.');
    sa.push(val('debts') ? 'My outstanding debts are ' + sentence(val('debts')) : 'I have no significant debts.');
    p.push(sa.join(' '));
    p.push('');

    p.push('PUBLIC BENEFITS');
    const pb = [];
    pb.push(val('benefits') === 'yes'
      ? sentence(ph(val('benefitsdetail'), 'What the child received, when, why, and what changed'))
      : c + ' has never received means-tested public assistance or social welfare benefits in the United Kingdom, the United States, or any other country.');
    pb.push(val('petbenefits') ? 'I ' + sentence(val('petbenefits')) : 'I have never received means-tested public assistance.');
    if (js) pb.push(val('jsbenefits') ? 'My joint sponsor ' + sentence(val('jsbenefits')) : 'My joint sponsor has never received means-tested public assistance.');
    pb.push(val('institution') ? sentence(val('institution')) : 'Neither ' + c + ' nor I has ever received long-term institutional care at government expense.');
    p.push(pb.join(' '));
    p.push('');
    p.push('I will support ' + c + ' without public benefits. I can provide any further information you need.');
    p.push('');
    p.push('Yours sincerely,');
    p.push(pname);
    p.push('Petitioner, on behalf of ' + full);
    p.push('Case Number: ' + kase);
    if (val('email')) p.push(val('email'));
    p.push('');
    evidence(p);
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

  // Defaults and examples that read wrongly for another applicant type.
  // A default is swapped only while the reader has left it unchanged.
  const PAYER = { child: 'my income', other: 'my petitioner\'s income' };
  const LIVES = { spouse: 'my husband, James Smith', child: 'me, and my wife, Anna Smith', adult: 'my father, David Jones', parent: 'my son, David Jones', other: 'my brother, David Jones' };
  const RELEX = { adult: 'son', parent: 'mother', other: 'brother' };
  function fitType() {
    const rel = val('rel');
    ['housingpaid', 'inspaid'].forEach(id => {
      const el = document.getElementById(id);
      if (el && (el.value === PAYER.child || el.value === PAYER.other)) el.value = rel === 'child' ? PAYER.child : PAYER.other;
    });
    const lw = document.getElementById('liveswith');
    if (lw) lw.placeholder = LIVES[rel] || LIVES.spouse;
    const ro = document.getElementById('relother');
    if (ro) ro.placeholder = RELEX[rel] || 'mother';
  }

  function update() {
    fitType();
    toggle();
    out.textContent = build();
    showGaps();
    save();
  }

  // Evidence boxes follow the answers that call for them. Each box is set
  // only when its answer flips, so a reader who unticks one by hand keeps
  // that choice until the answer changes again.
  const EVIDENCE = {
    'ev-jstax': () => !!val('jsname'),
    'ev-jspay': () => !!val('jsname'),
    'ev-jsrel': () => !!val('jsname'),
    'ev-savings': () => !!val('savings') && (val('rel') !== 'child' || val('saveswho') === 'joint'),
    'ev-petsavings': () => val('rel') === 'child' && !!val('savings'),
    'ev-property': () => !!val('property'),
    'ev-employer': () => val('workplan') === 'keep' && !!val('keepconfirmed'),
    'ev-treatment': () => !!val('condition'),
    'ev-slc': () => !!val('slc') || !!val('debts'),
    'ev-credential': () => !!val('licence'),
    'ev-englishproof': () => val('english') === 'fluent',
    'ev-retirement': () => !!val('retireplan'),
    'ev-cv': () => val('workplan') !== 'retired',
    'ev-birth': () => val('rel') === 'child',
    'ev-school': () => val('rel') === 'child',
    'ev-custody': () => val('rel') === 'child' && val('custody') === 'apart'
  };
  const evPrev = {};
  function syncEvidence(init) {
    Object.keys(EVIDENCE).forEach(id => {
      const now = EVIDENCE[id]();
      const box = document.getElementById(id);
      if (box && !init && now !== evPrev[id]) box.checked = now;
      evPrev[id] = now;
    });
  }

  restore();
  syncEvidence(true);
  form.addEventListener('input', () => { syncEvidence(false); update(); });
  form.addEventListener('change', e => {
    // A retired applicant does not earn Social Security credits by work
    if (e.target.id === 'workplan' && val('workplan') === 'retired') document.getElementById('retirework').checked = false;
    syncEvidence(false); update();
  });
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
    a.download = '00_Public_Charge_Statement.txt';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  document.getElementById('pc-clear').addEventListener('click', () => {
    if (!window.confirm('Clear every answer on this form?')) return;
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    form.reset();
    syncEvidence(true);
    update();
  });
})();
