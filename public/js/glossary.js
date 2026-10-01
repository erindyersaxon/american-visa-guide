/*
   American Visa Guide: glossary.
   Single source of truth for the abbreviations and community terms used
   across the site. Edit TERMS here only; every page updates.

   On any page that loads this script:
   - The first use of each abbreviation inside <main> gets an <abbr title>.
   - Every <div data-glossary></div> becomes a collapsible "Terms on this
     page" list, filtered to the terms that appear on the page.
   - <div data-glossary="all"></div> renders the full list (the /glossary page).
   Self-styled so it renders with or without the stage/article CSS.
 */
(function () {
  'use strict';

  // match: the exact text to find (case-sensitive). Omit for terms that are
  // listed but never auto-marked (multi-word community phrases).
  const TERMS = [
    // Forms
    { term: 'I-130', full: 'Petition for Alien Relative', def: 'The form the US citizen or permanent resident files with USCIS to prove the family relationship. Approval moves the case to NVC.', match: 'I-130' },
    { term: 'I-130A', full: 'Supplemental Information for Spouse Beneficiary', def: 'Filed with an I-130 for a spouse. Gives the beneficiary\'s address and employment history.', match: 'I-130A' },
    { term: 'I-864', full: 'Affidavit of Support', def: 'The sponsor\'s legally binding promise to support the immigrant, with proof of income. Filed at NVC.', match: 'I-864' },
    { term: 'I-864A', full: 'Contract Between Sponsor and Household Member', def: 'Lets a household member\'s income count towards the sponsor\'s I-864.', match: 'I-864A' },
    { term: 'DS-260', full: 'Immigrant Visa Electronic Application', def: 'The beneficiary\'s visa application, completed online in CEAC during the NVC stage.', match: 'DS-260' },
    { term: 'I-751', full: 'Petition to Remove Conditions on Residence', def: 'Filed by CR1 and CR2 holders before the 2-year conditional green card expires.', match: 'I-751' },
    { term: 'N-400', full: 'Application for Naturalization', def: 'The form a permanent resident files to become a US citizen.', match: 'N-400' },
    { term: 'I-601', full: 'Application for Waiver of Grounds of Inadmissibility', def: 'Asks USCIS to waive a ground the consular officer refused the visa on, where a waiver is available.', match: 'I-601' },
    { term: '221(g)', full: 'INA section 221(g) refusal', def: 'A refusal at the interview while the officer waits for something more. Usually resolved by sending exactly what the green sheet asks for.', match: '221(g)', link: '/221g' },

    // Agencies and systems
    { term: 'USCIS', full: 'US Citizenship and Immigration Services', def: 'Decides the I-130, and later issues the green card.', match: 'USCIS' },
    { term: 'NVC', full: 'National Visa Center', def: 'Part of the State Department. Collects fees, the DS-260 and documents after I-130 approval, then sends the case to London.', match: 'NVC' },
    { term: 'CEAC', full: 'Consular Electronic Application Center', def: 'The State Department website where you pay NVC fees, complete the DS-260, upload documents and check case status.', match: 'CEAC' },
    { term: 'AIS', full: 'Appointment and courier system', def: 'The London visa appointment site (ais.usvisa-info.com). You register your interview and choose how your passport comes back.', match: 'AIS' },
    { term: 'DOS', full: 'US Department of State', def: 'Runs NVC and the embassy. Decides the visa itself.', match: 'DOS' },
    { term: 'CBP', full: 'US Customs and Border Protection', def: 'Inspects you at the port of entry. You become a permanent resident when a CBP officer admits you.', match: 'CBP' },
    { term: 'IRS', full: 'Internal Revenue Service', def: 'The US tax authority. Issues the tax return transcripts sponsors upload.', match: 'IRS' },
    { term: 'SSA', full: 'Social Security Administration', def: 'Issues Social Security numbers.', match: 'SSA' },
    { term: 'SSN', full: 'Social Security Number', def: 'The US identity number for work, tax and banking. Requested through the DS-260.', match: 'SSN' },
    { term: 'ACRO', full: 'ACRO Criminal Records Office', def: 'Issues the UK police certificate. Valid 12 months for the embassy.', match: 'ACRO' },
    { term: 'HMRC', full: 'HM Revenue & Customs', def: 'The UK tax authority.', match: 'HMRC' },
    { term: 'AILA', full: 'American Immigration Lawyers Association', def: 'Professional body for US immigration attorneys. Its directory lists lawyers by practice area.', match: 'AILA' },

    // Notices and statuses
    { term: 'NOA1', full: 'Notice of Action 1 (receipt notice)', def: 'USCIS confirms it received the I-130. Carries the receipt number and priority date.', match: 'NOA1' },
    { term: 'NOA2', full: 'Notice of Action 2 (approval notice)', def: 'USCIS approved the I-130. The case moves to NVC.', match: 'NOA2' },
    { term: 'RFE', full: 'Request for Evidence', def: 'USCIS asks for missing or weak evidence. The community also calls it an RFE when NVC rejects a document in CEAC.', match: 'RFE' },
    { term: 'DQ', full: 'Documentarily Qualified', def: 'NVC has accepted everything it needs. The case joins the London queue for an interview letter. "DQ\'d" means you reached it.', match: 'DQ' },
    { term: 'IL', full: 'Interview Letter', def: 'The email from National_Visa_Center@state.gov with your interview date.', match: 'IL' },
    { term: 'AP', full: 'Administrative processing', def: 'Further checks after the interview. Short AP after an approval is routine and is not the same as a 221(g).', match: 'AP' },
    { term: 'PD', full: 'Priority date', def: 'The date USCIS received your I-130. Sets your place in the queue.', match: 'PD' },

    // Visa categories and routes
    { term: 'IR', full: 'Immediate Relative', def: 'Spouses, unmarried children under 21 and parents of US citizens. No annual cap.', match: 'IR' },
    { term: 'CR1 / IR1', full: 'Conditional or 10-year resident spouse', def: 'CR1 if married under 2 years when you enter the US (2-year green card); IR1 if 2 years or more (10-year green card).', match: 'CR1' },
    { term: 'F categories', full: 'Family Preference (F1, F2A, F2B, F3, F4)', def: 'Capped categories. The priority date must be current on the Visa Bulletin before NVC starts.' },
    { term: 'LPR', full: 'Lawful permanent resident', def: 'A green card holder.', match: 'LPR' },
    { term: 'AOS', full: 'Adjustment of Status', def: 'Getting a green card from inside the US. This site covers the other route, consular processing through London.', match: 'AOS' },
    { term: 'DCF', full: 'Direct Consular Filing', def: 'Filing the I-130 at an embassy instead of USCIS, for a US citizen living abroad in exceptional cases. Not covered here.', match: 'DCF' },
    { term: 'CRBA', full: 'Consular Report of Birth Abroad', def: 'Proof that a child born abroad was a US citizen at birth. Replaces an immigrant visa for that child.', match: 'CRBA' },

    // People and community terms
    { term: 'Petitioner', full: '', def: 'The US citizen or permanent resident who files the I-130.' },
    { term: 'Beneficiary', full: '', def: 'The family member immigrating to the US.' },
    { term: 'Joint sponsor', full: '', def: 'A second US citizen or permanent resident who files their own I-864 when the petitioner\'s income is not enough.' },
    { term: 'Drop', full: '', def: 'Community word for a batch of interview letters sent out at once.' },
    { term: 'The line', full: '', def: 'The oldest priority date USCIS is still deciding. Cases behind it wait their turn.' },
    { term: 'Wet signature', full: '', def: 'Signed by hand in ink, then scanned. The I-864 needs one.' },
    { term: 'Tax return transcript', full: '', def: 'An IRS summary of a filed tax return. London expects one for every sponsor.' },
    { term: 'Public charge', full: '', def: 'Whether the officer thinks you are likely to depend on government support. Weighed at the interview.', link: '/public-charge' },
  ];

  const CSS = `
    .glossary { margin:1.25rem 0 1.75rem; border:1px solid #ddd6cb; border-radius:10px; background:#fdfaf3; overflow:hidden; font-size:0.86rem; line-height:1.55; }
    .glossary summary { cursor:pointer; padding:0.8rem 1.1rem; font-weight:700; color:#2f5a6e; list-style:none; }
    .glossary summary::-webkit-details-marker { display:none; }
    .glossary summary::before { content:"\\25B8"; display:inline-block; margin-right:0.5rem; transition:transform .15s; }
    .glossary[open] summary::before { transform:rotate(90deg); }
    .glossary__list { margin:0; padding:0; list-style:none; border-top:1px solid #e7e0d4; }
    .glossary__row { display:grid; grid-template-columns:10rem 1fr; gap:0.25rem 1rem; padding:0.6rem 1.1rem; border-bottom:1px solid #e7e0d4; }
    .glossary__row:last-child { border-bottom:none; }
    .glossary__term { font-weight:700; color:#1e1c17; }
    .glossary__full { display:block; font-weight:600; color:#6a6560; }
    .glossary__body { margin:0; color:#1e1c17; }
    .glossary a { color:#2f5a6e; font-weight:600; }
    .glossary__more { padding:0.6rem 1.1rem; margin:0; border-top:1px solid #e7e0d4; }
    abbr.gl-abbr { text-decoration:underline dotted; text-underline-offset:2px; cursor:help; }
    @media (max-width:600px) { .glossary__row { grid-template-columns:1fr; } }
    @media print { .glossary summary::before { content:none; } }`;

  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Word-ish boundaries that also treat "-" as part of a form number,
  // so I-130 does not match inside I-130A.
  const pattern = t => new RegExp('(^|[^A-Za-z0-9-])(' + esc(t.match) + ')(?![A-Za-z0-9-])');

  const SKIP = new Set(['A', 'ABBR', 'BUTTON', 'SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'CODE', 'PRE', 'SUMMARY', 'H1', 'TITLE', 'LABEL']);

  function textNodes(root) {
    const out = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        for (let el = n.parentElement; el && el !== root; el = el.parentElement) {
          if (SKIP.has(el.tagName) || el.hasAttribute('data-no-glossary') || el.classList.contains('glossary') || el.classList.contains('sidebar') || el.classList.contains('breadcrumb')) return NodeFilter.FILTER_REJECT;
        }
        return n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    while (walker.nextNode()) out.push(walker.currentNode);
    return out;
  }

  // For each term, wrap its first occurrence in <main>. Text nodes inside
  // an <abbr> are skipped, so a fresh walk per term sees the current DOM.
  function markFirstUses(root) {
    TERMS.filter(t => t.match && t.full).forEach(t => {
      const re = pattern(t);
      for (const node of textNodes(root)) {
        const m = re.exec(node.nodeValue);
        if (!m) continue;
        const target = node.splitText(m.index + m[1].length);
        target.splitText(t.match.length);
        const abbr = document.createElement('abbr');
        abbr.className = 'gl-abbr';
        abbr.title = t.full;
        abbr.textContent = t.match;
        target.parentNode.replaceChild(abbr, target);
        return;
      }
    });
  }

  function row(t) {
    const full = t.full ? `<span class="glossary__full">${t.full}</span>` : '';
    const link = t.link ? ` <a href="${t.link}">More</a>` : '';
    return `<li class="glossary__row"><div class="glossary__term">${t.term}${full}</div><p class="glossary__body">${t.def}${link}</p></li>`;
  }

  function termsOnPage(root) {
    const text = root.textContent;
    return TERMS.filter(t => {
      if (t.match) return pattern(t).test(text);
      return new RegExp('\\b' + esc(t.term) + '\\b', 'i').test(text);
    });
  }

  function render() {
    if (!document.getElementById('glossary-css')) {
      const st = document.createElement('style');
      st.id = 'glossary-css';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    const main = document.querySelector('main') || document.body;
    const onPage = termsOnPage(main);

    document.querySelectorAll('[data-glossary]').forEach(el => {
      const all = el.getAttribute('data-glossary') === 'all';
      const list = all ? TERMS : onPage;
      if (!list.length) { el.remove(); return; }
      if (all) {
        el.outerHTML = `<div class="glossary" style="padding:0"><ul class="glossary__list" style="border-top:none">${list.map(row).join('')}</ul></div>`;
      } else {
        el.outerHTML = `<details class="glossary"><summary>Terms on this page (${list.length})</summary><ul class="glossary__list">${list.map(row).join('')}</ul><p class="glossary__more"><a href="/glossary">Full glossary</a></p></details>`;
      }
    });

    markFirstUses(main);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
