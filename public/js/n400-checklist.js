/*
   American Visa Guide: N-400 preparation list (/checklist-n400).
   Ticks are saved in localStorage only (key avg-natz-prep).
 */
(function () {
  'use strict';

  const root = document.getElementById('prep');
  if (!root) return;

  function link(href, text) {
    return '<a href="' + href + '" target="_blank" rel="noopener noreferrer">' + text + '</a>';
  }

  const PREP = [
    { key: 'before', title: 'Before you file: start 3 to 6 months ahead', items: [
      ['b1', 'Confirm your earliest filing date', 'Use the <a href="/naturalization/when-can-i-apply">filing date calculator</a>, then check it with the ' + link('https://www.uscis.gov/early-filing-calculator', 'USCIS early filing calculator') + '.'],
      ['b2', 'List every trip outside the US since you became a resident', 'Dates out and back, and where you went. Check them against your ' + link('https://i94.cbp.dhs.gov/', 'CBP I-94 travel history') + ' and passport stamps. Add up the days abroad to check physical presence.'],
      ['b3', 'Check that no single trip lasted 6 months or more', 'If one did, gather evidence that you kept your US home, job and tax residence.'],
      ['b4', 'Confirm you have lived 3 months in your current state or USCIS district', 'You file with the office covering where you live now.'],
      ['b5', 'Write out your address history for the past 5 years', 'With dates, and no gaps.'],
      ['b6', 'Write out your employment and school history for the past 5 years', 'Include gaps, unemployment, self-employment and retirement.'],
      ['b7', 'Gather your marital history and your spouse\'s details', 'Dates of every marriage and divorce for you and your spouse, and your spouse\'s proof of citizenship if you use the 3-year rule.'],
      ['b8', 'List all your children', 'Including adult, stepchildren and deceased children, with dates of birth and where they live.'],
      ['b9', 'Order IRS tax return transcripts and tax account transcripts for every year of the statutory period', 'Free from ' + link('https://www.irs.gov/individuals/get-transcript', 'IRS Get Transcript') + '. Return transcripts show you filed as a resident. Account transcripts show payments, penalties (transaction code 176 or 170), interest and any balance. Pay every balance in full before you file, and finish any payment plan first. See <a href="/naturalization/good-moral-character">Taxes</a>.'],
      ['b17', 'Check that each year of the statutory period meets estimated-tax safe harbor', 'If you are employed (W-2), raise your W-4 withholding. If you are self-employed, run an LLC or have high income, make quarterly estimated payments. Prepay 110% of last year\'s tax if last year\'s income was over $150,000. See <a href="/naturalization/good-moral-character">Taxes</a>.'],
      ['b18', 'Get copies of your earlier immigration forms and check your N-400 against them', 'Your I-130, DS-260 or DS-230, and I-485. Children, marriages, addresses and trips must match. If you lack copies, file a ' + link('https://www.uscis.gov/records/request-records-through-the-freedom-of-information-act-or-privacy-act', 'FOIA request') + ' with USCIS. See <a href="/naturalization/delays-and-denials#old-forms">Savane</a>.'],
      ['b19', 'Gather evidence of good character', 'Employment records, community involvement and family responsibilities. Officers weigh positive evidence as well as misconduct.'],
      ['b10', 'Men: check Selective Service registration', 'Required if you lived in the US as a permanent resident at any time between ages 18 and 25. Check at ' + link('https://www.sss.gov/verify/', 'sss.gov/verify') + '.'],
      ['b11', 'Get certified court records for any arrest, citation or charge', 'From the court and police in every place it happened, even if the record was sealed or expunged.'],
      ['b12', 'Copy your green card, front and back', 'Required with every N-400.'],
      ['b13', 'Decide between online and paper filing', 'Online costs $710 and gives you live case updates. The $380 reduced fee and the I-912 fee waiver need a paper filing. A proposed rule would raise the fee and end both: see <a href="/naturalization#fee">fee changes</a>.'],
      ['b15', 'Arrange English translations of any document not in English', 'Each needs a full translation and the translator\'s signed statement that it is complete and accurate. Anyone fluent except you can translate.'],
      ['b16', 'If you pay child support, or have children who do not live with you, gather proof of support', 'The support order and records of payment: cancelled checks, receipts, court or agency payment records, or wage garnishment. Failing to support dependents can count against good moral character.'],
      ['b14', 'Create a USCIS online account', 'At ' + link('https://my.uscis.gov/', 'my.uscis.gov') + '. You also need it for address changes and notices.'],
    ]},
    { key: 'filing', title: 'Filing the N-400', items: [
      ['f1', 'Answer every question, using "None" or "N/A" where nothing applies', 'Your answers must match your tax, travel and court records.'],
      ['f2', 'Attach all required initial evidence', 'USCIS can deny an incomplete filing without asking for missing documents first.'],
      ['f7', 'Include at least two character reference letters', 'From US citizens who know you well and are not relatives. USCIS uses them to decide whether to skip a neighborhood investigation. See the <a href="/naturalization/file-n400#character-letters">letter guide and template</a>.'],
      ['f3', 'Pay the fee, or attach Form I-912', 'Do not send a fee with a waiver request: USCIS will take the payment and ignore the waiver.'],
      ['f5', 'If you file online, submit within 30 days of your last edit', 'USCIS keeps an online draft for 30 days from the last time you worked on it, then deletes it. A draft is not filed until you submit and pay. ' + link('https://www.uscis.gov/policy-manual/volume-1-part-b-chapter-6', '[USCIS Policy Manual Vol. 1 Part B Ch. 6]')],
      ['f6', 'Name and combine your uploads so the officer can follow them', 'One PDF per document type, numbered and named for what it is, for example 01_GreenCard.pdf, 02_Tax_Transcripts.pdf, 03_Marriage_Certificate.pdf. Criminal and court records must be complete, official copies.'],
      ['f4', 'Save a PDF of the submitted N-400 and your receipt notice (I-797C)', 'Reread it before your interview. The officer will go through it with you line by line. The receipt notice also extends your green card\'s validity by 24 months, so keep it with your card.'],
    ]},
    { key: 'after', title: 'While your case is pending', items: [
      ['a1', 'Attend your biometrics appointment', 'Every N-400 applicant attends, even if you gave biometrics before. Bring the appointment notice and photo ID. If you miss it without rescheduling, USCIS treats the application as abandoned and denies it. ' + link('https://www.uscis.gov/sites/default/files/document/policy-manual-updates/20251212-PhotographReuse.pdf', '[USCIS policy alert, Dec. 12, 2025]')],
      ['a2', 'Report any change of address within 10 days', 'Through your USCIS account or Form AR-11. Missed notices are a common reason for delays and denials.'],
      ['a3', 'Keep trips abroad short', 'Continuous residence must continue until your oath.'],
      ['a4', 'Study for the civics test', 'Use the <a href="/naturalization/test#flashcards">civics flashcards</a>, and practice saying your N-400 answers aloud. English practice sheets are on <a href="/checklists.html#naturalization">Checklists &amp; Tools</a>.'],
      ['a5', 'Keep filing taxes on time, and prepay enough during the year', 'File by the deadline every year, even if you owed or paid late before. If you earn wages (W-2), raise your W-4 withholding. If you are self-employed, run an LLC or have high income, make quarterly estimated payments large enough to avoid the underpayment penalty. Pay by April even if you file an extension. Avoid any new arrest or citation: good moral character runs until the oath.'],
      ['a6', 'Reply to any request for evidence before the deadline', 'Send everything asked for in one response.'],
    ]},
    { key: 'interview', title: 'Interview day', items: [
      ['i1', 'Bring your interview notice, green card, state ID, and every passport and travel document', 'Include expired passports used since you became a resident.'],
      ['i2', 'Bring the originals of everything you submitted', 'Plus marriage evidence for the 3-year rule or a pending I-751, IRS return and account transcripts, and proof of tax payments.'],
      ['i3', 'Arrive early and expect to go through security', 'The officer places you under oath before asking about your application.'],
      ['i4', 'Get your Form N-652 before you leave', 'It shows whether your case was granted, continued (usually a retest or more documents), or denied.'],
    ]},
    { key: 'oath', title: 'Oath ceremony and after', items: [
      ['o1', 'Complete the questionnaire on your oath notice (Form N-445) on the day', 'It asks about anything that has happened since your interview.'],
      ['o2', 'Hand in your green card at the ceremony', 'You receive your Certificate of Naturalization. Check it for errors before you leave.'],
      ['o3', 'Apply for a US passport', 'Using Form DS-11 and your original naturalization certificate. See ' + link('https://travel.state.gov/content/travel/en/passports.html', 'travel.state.gov') + '.'],
      ['o4', 'Update your Social Security record', 'So employers can verify your citizenship. See ' + link('https://www.ssa.gov/', 'ssa.gov') + '.'],
      ['o5', 'Register to vote', 'At ' + link('https://vote.gov/', 'vote.gov') + '.'],
      ['o6', 'Check your children\'s status', 'Your biological or adopted children under 18 who are permanent residents living with you may become citizens automatically. Stepchildren do not. See <a href="/life.html#life-cca">Child Citizenship Act</a>.'],
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

})();
