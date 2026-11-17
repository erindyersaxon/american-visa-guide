/*
   American Visa Guide: the master document list.

   Single source for every document the guide asks you to gather. The
   master checklist (/tools/master-checklist) renders its tables from DOCS, and
   each stage checklist renders its document items from the same entries:
   a stage page holds an empty <div data-doc-item="ID"> where the item
   goes, and this script fills in the checkbox and label.

   To change a document, edit it here. Each entry has:
     need   which stages need it: yes, cond (depends on your case) or no.
            A stage left out counts as no. The stages are listed once, in
            AVG_DOCS.stages: I-130, NVC, Medical, Interview and Move (getting
            ready to leave and arriving in the US).
     code   optional: the file code in the public charge evidence pack
            (P01, J01, B07...), shown next to the name
     note   the master checklist's note
     items  where it appears on a stage checklist, with that page's wording.
            Keep each item id unchanged: saved ticks are stored against it.

   Steps that are not documents (fill in a form, check names match, go to
   the Pass Back window) stay written on their own stage page.

   Load as a classic script after the page content and before checklist.js.
 */
var AVG_DOCS = {
 "stages": [
  [
   "i130",
   "I-130"
  ],
  [
   "nvc",
   "NVC"
  ],
  [
   "medical",
   "Medical"
  ],
  [
   "interview",
   "Interview"
  ],
  [
   "move",
   "Move"
  ]
 ],
 "groups": [
  {
   "key": "civil",
   "title": "Civil &amp; identity documents",
   "note": ""
  },
  {
   "key": "financial",
   "title": "Financial documents (I-864 affidavit of support)",
   "note": "For NVC and beyond. The petitioner and every joint sponsor each need their own set. The codes (P01, J01) are the file names in the public charge <a href=\"/public-charge/evidence#deliverables\">evidence pack</a>: one labelled PDF per row."
  },
  {
   "key": "beneficiary",
   "title": "Public charge evidence: you (the beneficiary)",
   "note": "Officers now ask the beneficiary for financial documents too, not just the petitioner. Send every row that applies to your case, in the public charge <a href=\"/public-charge/evidence#deliverables\">evidence pack</a>, at least five working days before the interview. Skip a row only when the thing does not exist for you."
  },
  {
   "key": "relationship",
   "title": "Relationship evidence",
   "note": "Filed with the I-130. For spouse cases, this is where USCIS looks hardest."
  },
  {
   "key": "police",
   "title": "Police &amp; background documents",
   "note": ""
  },
  {
   "key": "medical",
   "title": "Medical &amp; vaccination documents",
   "note": ""
  },
  {
   "key": "identity",
   "title": "Passport, photos &amp; copies",
   "note": ""
  },
  {
   "key": "forms",
   "title": "Forms &amp; applications",
   "note": ""
  },
  {
   "key": "interview",
   "title": "Interview packet &amp; day-of documents",
   "note": ""
  },
  {
   "key": "moving",
   "title": "Moving &amp; arrival documents",
   "note": "For leaving the UK and arriving in the US. The steps are on <a href=\"/guide/before-you-leave\">Stage 8: before you leave</a> and <a href=\"/guide/us-entry\">Stage 9: US entry</a>."
  }
 ],
 "docs": [
  {
   "key": "passport",
   "group": "civil",
   "name": "Passport (beneficiary)",
   "need": {
    "i130": "yes",
    "nvc": "yes",
    "medical": "yes",
    "interview": "yes"
   },
   "note": "Original required at all stages. Biographic page for NVC. At interview, London asks for a passport valid for six months beyond your intended date of entry to the US.",
   "items": [
    {
     "list": "interview",
     "id": "int-2",
     "label": "Passport, valid for at least six months beyond your intended date of entry into the US (London's instruction)"
    },
    {
     "list": "binder",
     "id": "fr-1",
     "label": "<strong>Passport</strong>"
    }
   ]
  },
  {
   "key": "birth-ben",
   "group": "civil",
   "name": "Birth certificate (beneficiary)",
   "need": {
    "i130": "yes",
    "nvc": "yes",
    "medical": "yes",
    "interview": "yes"
   },
   "note": "Certified copy. If UK-issued, provide translation if not in English.",
   "items": [
    {
     "list": "binder",
     "id": "s2-1",
     "label": "<strong>Birth Certificate</strong>: long form with parent names"
    }
   ]
  },
  {
   "key": "birth-pet",
   "group": "civil",
   "name": "Birth certificate (petitioner)",
   "need": {
    "i130": "yes",
    "nvc": "yes",
    "medical": "yes",
    "interview": "yes"
   },
   "note": "Certified copy. Establishes petitioner identity.",
   "items": []
  },
  {
   "key": "marriage",
   "group": "civil",
   "name": "Marriage certificate",
   "need": {
    "i130": "yes",
    "nvc": "yes",
    "medical": "yes",
    "interview": "yes"
   },
   "note": "Certified copy from the civil registry, timely registered. A church or ceremony certificate, or a marriage licence, is not enough (6 USCIS-PM B.6(C)(1)). Required for all spouse petitions at all stages.",
   "items": [
    {
     "list": "binder",
     "id": "s2-2",
     "label": "<strong>Marriage Certificate</strong>"
    }
   ]
  },
  {
   "key": "divorce",
   "group": "civil",
   "name": "Divorce decrees and death certificates",
   "need": {
    "i130": "yes",
    "nvc": "yes",
    "medical": "yes",
    "interview": "yes"
   },
   "note": "For any prior marriage. Required at all stages if either party previously married.",
   "items": [
    {
     "list": "binder",
     "id": "s2-3",
     "label": "<strong>Divorce Decrees</strong>, if applicable, all prior marriages"
    },
    {
     "list": "binder",
     "id": "s2-4",
     "label": "<strong>Death Certificates</strong>, if applicable, former spouses"
    }
   ]
  },
  {
   "key": "name-change",
   "group": "civil",
   "name": "Name change deed",
   "need": {
    "i130": "cond",
    "nvc": "cond",
    "medical": "cond",
    "interview": "cond"
   },
   "note": "Required at all stages if name changed (marriage, deed poll, etc.)",
   "items": [
    {
     "list": "i130",
     "id": "cons-6",
     "label": "Every name that differs between documents is explained by a legal name change document: marriage certificate, deed poll or court order (6 USCIS-PM B.6(C)(1))"
    },
    {
     "list": "nvc",
     "id": "nvc-26",
     "label": "Name change deed (if applicable)"
    },
    {
     "list": "binder",
     "id": "s2-6",
     "label": "<strong>Name Change Documents</strong>: if applicable"
    }
   ]
  },
  {
   "key": "adoption",
   "group": "civil",
   "name": "Adoption documents",
   "need": {
    "i130": "cond",
    "nvc": "cond",
    "medical": "cond",
    "interview": "cond"
   },
   "note": "Required at all stages if applicable (IR2/CR2 children).",
   "items": [
    {
     "list": "nvc",
     "id": "nvc-25",
     "label": "Adoption documents (if applicable)"
    },
    {
     "list": "binder",
     "id": "s2-5",
     "label": "<strong>Adoption Documents</strong>: if applicable"
    }
   ]
  },
  {
   "key": "i864",
   "group": "financial",
   "name": "Form I-864 (affidavit of support)",
   "need": {
    "i130": "no",
    "nvc": "yes",
    "medical": "no",
    "interview": "yes"
   },
   "note": "Wet-signed (not digital). Each sponsor completes separately. 08/24/26 edition from 1 October 2026; signing authorizes a credit check, so lift any credit freeze or be ready to.",
   "items": [
    {
     "list": "nvc",
     "id": "nvc-8",
     "label": "I-864 completed and wet-signed (not digital)"
    },
    {
     "list": "binder",
     "id": "s3-1",
     "label": "<strong>Form I-864, Petitioner</strong>, does not need to be the wet signed original; a printed copy is fine. Any I-864 signed from 1 October 2026 must be the <strong>08/24/26</strong> edition"
    }
   ]
  },
  {
   "key": "i864a",
   "group": "financial",
   "name": "Form I-864A (household member)",
   "need": {
    "i130": "no",
    "nvc": "cond",
    "medical": "no",
    "interview": "cond"
   },
   "note": "Only if you count a household member&rsquo;s income. A joint sponsor files their own I-864, not an I-864A.",
   "items": []
  },
  {
   "key": "joint-sponsor",
   "group": "financial",
   "name": "Joint sponsor package",
   "need": {
    "i130": "no",
    "nvc": "cond",
    "medical": "no",
    "interview": "cond"
   },
   "note": "Only if a joint sponsor is filing: their own I-864, the last 3 years of IRS Tax Return Transcripts, proof of US citizenship or permanent residence, and the last 3 months of payslips and bank statements plus the latest W-2. Add their relationship statement and any assets (rows below).",
   "items": [
    {
     "list": "nvc",
     "id": "nvc-12",
     "label": "Joint sponsor and I-864A (if applicable), with scenario-specific income evidence (see guide: joint sponsor documentation by scenario)"
    },
    {
     "list": "binder",
     "id": "s3-2",
     "label": "<strong>Form I-864, Joint Sponsor</strong>, if applicable, on the same edition rules as the petitioner's; include their scenario-specific income documents (W-2/employment letter/pay stubs, self-employment documents, SSA-1099/pension, LES, or I-864A), see \"Joint sponsor, documentation by scenario\" in the NVC guide"
    }
   ],
   "code": "J01–J05"
  },
  {
   "key": "transcript",
   "group": "financial",
   "name": "IRS Tax Return Transcripts (every sponsor)",
   "need": {
    "i130": "no",
    "nvc": "yes",
    "medical": "no",
    "interview": "yes"
   },
   "note": "Via IRS.gov with ID.me. Choose the <strong>Tax Return Transcript</strong>, not the Account Transcript: the page is headed &ldquo;Tax Return Transcript&rdquo; and lists the income lines from the 1040 as filed. The I-864 requires the most recent tax year for every sponsor (Form I-864 instructions, 08/24/26). For the public charge pack, send the last 3 years of IRS Tax Return Transcripts: a missing transcript is London&rsquo;s most common financial 221(g).",
   "items": [
    {
     "list": "nvc",
     "id": "nvc-9",
     "label": "IRS Tax Return Transcript via IRS.gov/ID.me for every sponsor (a 1040 with W-2s meets NVC's minimum only, see warning above)"
    },
    {
     "list": "binder",
     "id": "s3-3",
     "label": "<strong>IRS Tax Return Transcripts</strong>"
    }
   ],
   "code": "P01 · J01"
  },
  {
   "key": "tax-return",
   "group": "financial",
   "name": "Complete tax return (every sponsor)",
   "need": {
    "i130": "no",
    "nvc": "yes",
    "medical": "no",
    "interview": "yes"
   },
   "note": "Full return with all schedules if self-employed (C/E/F/SE). The most recent year is required for the I-864. For the public charge pack, send the last 3 years of IRS Tax Return Transcripts (row above).",
   "items": [],
   "code": "P01 · J01"
  },
  {
   "key": "employment",
   "group": "financial",
   "name": "Employment letter (current job)",
   "need": {
    "i130": "no",
    "nvc": "yes",
    "medical": "no",
    "interview": "yes"
   },
   "note": "Confirming employment, job title, and income for all sponsors.",
   "items": [
    {
     "list": "nvc",
     "id": "nvc-10",
     "label": "Employment letter confirming current employment and income"
    },
    {
     "list": "binder",
     "id": "s3-5",
     "label": "<strong>Employment Letter</strong>"
    }
   ]
  },
  {
   "key": "w2",
   "group": "financial",
   "name": "W-2s and 1099s",
   "need": {
    "i130": "no",
    "nvc": "yes",
    "medical": "no",
    "interview": "yes"
   },
   "note": "Last 3 years strongly recommended, to match the returns. Establishes US employment history. Posts list the most recent W-2 on public charge 221(g) checklists.",
   "items": [
    {
     "list": "binder",
     "id": "s3-4",
     "label": "<strong>W-2s / 1099s</strong>"
    }
   ],
   "code": "P02 · P07"
  },
  {
   "key": "paystubs",
   "group": "financial",
   "name": "Recent pay stubs",
   "need": {
    "i130": "no",
    "nvc": "yes",
    "medical": "no",
    "interview": "yes"
   },
   "note": "The last 3 months for each sponsor, plus the latest W-2, showing current income.",
   "items": [
    {
     "list": "binder",
     "id": "s3-6",
     "label": "<strong>Recent Pay Stubs</strong>"
    }
   ],
   "code": "P02 · J02"
  },
  {
   "key": "sponsor-status",
   "group": "financial",
   "name": "Proof of sponsor&rsquo;s US status",
   "need": {
    "i130": "yes",
    "nvc": "yes",
    "medical": "no",
    "interview": "yes"
   },
   "note": "US passport, naturalization certificate, US birth certificate or green card, for the petitioner and any joint sponsor.",
   "items": [
    {
     "list": "binder",
     "id": "s3-7",
     "label": "<strong>Proof of status, sponsor and joint sponsor:</strong> US passport, green card, birth certificate etc"
    }
   ]
  },
  {
   "key": "bank",
   "group": "financial",
   "name": "US bank statements",
   "need": {
    "i130": "cond",
    "nvc": "yes",
    "medical": "no",
    "interview": "yes"
   },
   "note": "The last 3 months, showing the salary arriving; 12 months if self-employed. Opening a US account and transferring funds are both named in State Department guidance as evidence of establishing domicile.",
   "items": [],
   "code": "P03 · J02"
  },
  {
   "key": "pc-health",
   "group": "financial",
   "name": "Petitioner&rsquo;s health insurance",
   "code": "P04",
   "need": {
    "i130": "cond",
    "nvc": "no",
    "medical": "no",
    "interview": "yes"
   },
   "note": "Plan confirmation or summary of benefits. At the I-130 stage, find out whether the plan can add you. Under the health factor, officers ask whether you will be covered by the petitioner&rsquo;s plan. See <a href=\"/public-charge/questions\">questions to rehearse</a>.",
   "items": []
  },
  {
   "key": "pc-savings",
   "group": "financial",
   "name": "Savings, investment and retirement statements",
   "code": "P06 · J04",
   "need": {
    "i130": "no",
    "nvc": "cond",
    "medical": "no",
    "interview": "cond"
   },
   "note": "Only if any. For a joint sponsor who counts assets, show how each converts to cash within a year.",
   "items": []
  },
  {
   "key": "pc-other-income",
   "group": "financial",
   "name": "Proof of other income",
   "code": "P07",
   "need": {
    "i130": "no",
    "nvc": "cond",
    "medical": "no",
    "interview": "cond"
   },
   "note": "Only if any: rental, retirement, dividends or self-employment income.",
   "items": []
  },
  {
   "key": "pc-debts",
   "group": "financial",
   "name": "Debt statements (sponsors)",
   "code": "P08",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "no",
    "interview": "cond"
   },
   "note": "Only if any: the latest statement for each debt, such as a mortgage, car loan or credit card balance. Add any child support order and a record of payments.",
   "items": []
  },
  {
   "key": "js-relationship",
   "group": "financial",
   "name": "Joint sponsor&rsquo;s relationship statement",
   "code": "J03",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "no",
    "interview": "cond"
   },
   "note": "Only if a joint sponsor is filing. A signed statement: how long they have known the petitioner and you, where they live, whether they have sponsored anyone before, and any history of support.",
   "items": []
  },
  {
   "key": "pc-dependent-care",
   "group": "financial",
   "name": "Dependents&rsquo; care costs",
   "code": "P10",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "no",
    "interview": "cond"
   },
   "note": "Only if any: the cost of care for any dependent with a health condition or care need, and which income or plan pays it. Officers ask who else the petitioner supports.",
   "items": []
  },
  {
   "key": "self-employed",
   "group": "financial",
   "name": "Self-employment evidence",
   "need": {
    "i130": "no",
    "nvc": "cond",
    "medical": "no",
    "interview": "cond"
   },
   "note": "If anyone is self-employed (petitioner, joint sponsor or you): the full tax return with every schedule, 12 months of bank statements (from the business account if there is one), the state business registration or licence, and proof the business trades, such as a website, recent invoices, client contracts, Forms 1099 or a Better Business Bureau profile. See <a href=\"/public-charge/evidence#self-employed\">if anyone is self-employed</a>.",
   "items": [
    {
     "list": "nvc",
     "id": "nvc-11",
     "label": "If self-employed (sponsor or joint sponsor): full return with all schedules (C/E/F/SE), 12 months business bank statements, business registration/EIN, signed business description"
    },
    {
     "list": "binder",
     "id": "s3-9",
     "label": "<strong>Self-Employment Supporting Documents</strong>, if applicable: Schedule C/E/F, 12 months business bank statements, business registration evidence"
    }
   ],
   "code": "P09 · J05 · B12"
  },
  {
   "key": "domicile",
   "group": "financial",
   "name": "Petitioner&rsquo;s proof of US domicile",
   "need": {
    "i130": "cond",
    "nvc": "yes",
    "medical": "yes",
    "interview": "yes"
   },
   "note": "Strongest first: US tax filings with domestic earned income, a W-2 or US job offer, utility bills across several months, a state ID. A lease or mortgage shows an address, not a residence. If the petitioner has no US record, start one at the I-130 stage: utility bills need months of history. Print a copy for the binder before the medical. See <a href=\"/domicile\">petitioner domicile</a>.",
   "items": [
    {
     "list": "nvc",
     "id": "nvc-29",
     "label": "<strong>Petitioner's proof of US domicile</strong>, uploaded under &ldquo;Other&rdquo; if there is no dedicated slot. Strongest first: US tax filing showing <strong>domestic earned income</strong>, W-2, current US job contract or signed offer with a start date, utility bills in the petitioner's name at a US address across several months, US school or university enrollment. A lease, mortgage or deed evidences an <em>address</em>, not a residence: include it, but never as your only domicile evidence."
    },
    {
     "list": "interview",
     "id": "int-5",
     "label": "Petitioner's US domicile evidence, and re-domicile evidence if the petitioner lives abroad, even if it was already uploaded at NVC. Domicile is a ticked box on the embassy's 221(g) sheet, so bring the originals rather than relying on the file"
    },
    {
     "list": "binder",
     "id": "s3-8",
     "label": "<strong>Proof of US Domicile, petitioner</strong>: bring this even if a joint sponsor is filing. A joint sponsor cures income, not the petitioner's domicile, and a petitioner who fails domicile does not qualify as a sponsor at all. Strongest evidence first: US tax filing showing <strong>domestic earned income</strong>, W-2, current US job contract or signed offer with a start date, utility bills in the petitioner's name at a US address over several months, US school or university enrollment, state ID. A lease, mortgage or deed shows an <em>address</em>, not that you live there: include it, but not on its own. See <a href=\"/domicile\">the petitioner's domicile problem</a>."
    }
   ]
  },
  {
   "key": "lease",
   "group": "financial",
   "name": "US lease, mortgage or deed",
   "need": {
    "i130": "no",
    "nvc": "yes",
    "medical": "no",
    "interview": "yes"
   },
   "note": "Supports US domicile, but evidences an <em>address</em> rather than residence. Never submit it as the only domicile evidence: pair it with utility bills, US tax filings showing domestic earned income, or a US job contract.",
   "items": [],
   "code": "P05"
  },
  {
   "key": "utilities",
   "group": "financial",
   "name": "US household utility bills",
   "need": {
    "i130": "no",
    "nvc": "yes",
    "medical": "no",
    "interview": "yes"
   },
   "note": "Recent bills (electricity, gas, water) showing US address. Last 3 months.",
   "items": []
  },
  {
   "key": "redomicile",
   "group": "financial",
   "name": "Evidence of re-establishing US domicile",
   "need": {
    "i130": "cond",
    "nvc": "cond",
    "medical": "cond",
    "interview": "cond",
    "move": "cond"
   },
   "note": "<strong>Treat as required, not optional, wherever the petitioner lives abroad</strong>: a joint sponsor cures income but cannot cure the petitioner's domicile, and a petitioner who fails it does not qualify as a sponsor. Moving contract, job contract, job applications, school/childcare inquiries, rental property contracts, US bank account opened or funds transferred, Social Security number application, dated statement of intent. Write the dated plan at the I-130 stage. The petitioner must be resident in the US, or arriving, no later than the date the beneficiary immigrates.",
   "items": [
    {
     "list": "nvc",
     "id": "nvc-30",
     "label": "<strong>If the petitioner lives abroad:</strong> evidence they are re-establishing US domicile. State Department guidance names opening a US bank account, transferring funds, US investments, <strong>seeking US employment</strong>, registering children in US schools, applying for a Social Security number, and voting. Add a dated written statement of intent, a moving or shipping quotation, and the US address arranged (a lease, or an arrangement to stay with family or friends, which the guidance accepts). Have this in place before you submit for review: London has put at least one case into administrative processing over domicile."
    },
    {
     "list": "binder",
     "id": "s3-11",
     "label": "<strong>Intent to re-establish US domicile</strong>, if the petitioner lives abroad: dated statement of intent, US job offer or transfer, the US address arranged (accommodation with family or friends counts), moving or shipping quotation, US bank account opened or funds transferred, school or childcare enquiries, Social Security number application, job applications. The petitioner must be resident in the US, or arriving, no later than the date the beneficiary immigrates."
    }
   ]
  },
  {
   "key": "js-domicile",
   "group": "financial",
   "name": "Joint sponsor&rsquo;s proof of US domicile",
   "need": {
    "i130": "no",
    "nvc": "cond",
    "medical": "cond",
    "interview": "cond"
   },
   "note": "Only if a joint sponsor is filing. Same standard as the petitioner&rsquo;s.",
   "items": [
    {
     "list": "nvc",
     "id": "nvc-31",
     "label": "<strong>Joint sponsor's proof of US domicile</strong> (if a joint sponsor is filing). The joint sponsor must meet the same citizenship, age and domicile requirements as the petitioner."
    },
    {
     "list": "binder",
     "id": "s3-12",
     "label": "<strong>Proof of US Domicile, joint sponsor</strong>, if a joint sponsor is filing: same requirement as the petitioner."
    }
   ]
  },
  {
   "key": "public-charge",
   "group": "financial",
   "name": "Public charge statement and evidence",
   "need": {
    "i130": "no",
    "nvc": "yes",
    "medical": "cond",
    "interview": "yes"
   },
   "note": "Draft the statement at NVC from the I-864 figures, and finish it while you wait for the interview letter. If the panel physician records a condition, add how you manage it, its US cost and who pays. Written statement plus a labelled evidence pack. Treat both as mandatory, even though the embassy calls the statement voluntary. The pack is every row on this page with a file code: P for the petitioner, J for a joint sponsor, B for you. Upload it to CEAC and email it at least five working days before the interview, and print it for the binder. See the <a href=\"/public-charge/evidence#deliverables\">evidence pack</a> and the <a href=\"/public-charge/statement\">statement builder</a>.",
   "items": [
    {
     "list": "binder",
     "id": "s3-10",
     "label": "<strong>Public Charge Statement and evidence pack</strong>: treat both as mandatory, even though the embassy calls the statement voluntary. The pack holds one labelled PDF per document: 00 for the statement, P for the petitioner (tax returns, payslips, bank statements, health insurance, housing), J for any joint sponsor, B for you (CV, diplomas, bank statements in every country, savings, property, health insurance quote). Upload it to your case in CEAC <em>and</em> email the same files to <a href=\"mailto:LNDIVSubmissions@state.gov\">LNDIVSubmissions@state.gov</a> with your case number in the subject line, at least five working days before your interview. See <a href=\"/public-charge/evidence#deliverables\">the evidence pack</a> and the <a href=\"/public-charge-statement\">statement builder</a>."
    },
    {
     "list": "binder",
     "id": "s3-13",
     "label": "<strong>Printed copy of the evidence pack</strong>, on its own Public Charge tab, in the same order and under the same file codes as your CEAC upload. When the officer asks for a document, you can find it by code. Members preparing for re-interviews bring everything: CV, diplomas, insurance quotes and the beneficiary's bank and investment statements. If anyone is self-employed, the pack also holds 12 months of bank statements (business account preferred) and proof the business is registered and trading."
    }
   ],
   "code": "00"
  },
  {
   "key": "timeline",
   "group": "relationship",
   "name": "Relationship timeline",
   "need": {
    "i130": "yes",
    "nvc": "no",
    "medical": "no",
    "interview": "no"
   },
   "note": "Narrative: how you met, key milestones, cohabitation start.",
   "items": [
    {
     "list": "i130",
     "id": "evid-4",
     "label": "Relationship timeline: written description of how/where you met, dates of major milestones, key life events together"
    }
   ]
  },
  {
   "key": "continuity",
   "group": "relationship",
   "name": "Photos, travel records and communication",
   "need": {
    "i130": "yes",
    "nvc": "no",
    "medical": "no",
    "interview": "cond"
   },
   "note": "Photos over time, including the wedding; travel records and boarding passes; communication logs. Reuse them at the interview if asked.",
   "items": [
    {
     "list": "i130",
     "id": "evid-3",
     "label": "Relationship continuity: photos (wedding, vacations, recent), travel records, communication logs"
    },
    {
     "list": "binder",
     "id": "s6-1",
     "label": "<strong>Relationship Evidence</strong>: photos, messages, travel records, especially wedding photos. Reuse content from your original I-130 submission and add to it (quality over quantity)"
    },
    {
     "list": "binder",
     "id": "s6-2",
     "label": "<strong>Additional Supporting Evidence</strong>"
    }
   ]
  },
  {
   "key": "joint-finance",
   "group": "relationship",
   "name": "Joint financial accounts",
   "need": {
    "i130": "cond",
    "nvc": "no",
    "medical": "no",
    "interview": "no"
   },
   "note": "Bank statements with both names. Strong evidence if available; not required if spouses live in different countries.",
   "items": [
    {
     "list": "i130",
     "id": "evid-1",
     "label": "Commingling of finances: joint bank statements over time, shared bills, or joint credit cards"
    }
   ]
  },
  {
   "key": "joint-lease",
   "group": "relationship",
   "name": "Joint lease or mortgage",
   "need": {
    "i130": "cond",
    "nvc": "no",
    "medical": "no",
    "interview": "no"
   },
   "note": "Proof of shared residence with both names. Strong evidence if available; not required if spouses live in different countries.",
   "items": [
    {
     "list": "i130",
     "id": "evid-2",
     "label": "Joint residence: lease or mortgage with both names (or utility bills showing same address over time)"
    }
   ]
  },
  {
   "key": "joint-property",
   "group": "relationship",
   "name": "Joint property ownership",
   "need": {
    "i130": "cond",
    "nvc": "no",
    "medical": "no",
    "interview": "no"
   },
   "note": "Deeds, vehicle titles or other property in both names (8 CFR 204.2(a)(1)(i)(B)(1)).",
   "items": [
    {
     "list": "i130",
     "id": "evid-5",
     "label": "Joint ownership of property (if any): deeds, vehicle titles, or insurance naming both of you"
    }
   ]
  },
  {
   "key": "children-birth",
   "group": "relationship",
   "name": "Birth certificates of children born to the couple",
   "need": {
    "i130": "cond",
    "nvc": "no",
    "medical": "no",
    "interview": "no"
   },
   "note": "Only if you have children together (8 CFR 204.2(a)(1)(i)(B)(4)).",
   "items": [
    {
     "list": "i130",
     "id": "evid-6",
     "label": "Birth certificates of children born to the couple (if any), naming both of you as parents"
    }
   ]
  },
  {
   "key": "long-distance",
   "group": "relationship",
   "name": "Long-distance evidence",
   "need": {
    "i130": "cond",
    "nvc": "no",
    "medical": "no",
    "interview": "cond"
   },
   "note": "For spouses who live in different countries and have no joint account or lease. Remittance receipts, contracts or invoices for purchases in both names, past and recent social media posts, and flight bookings and boarding passes for each visit.",
   "items": [
    {
     "list": "i130",
     "id": "evid-8",
     "label": "If you live in different countries: money transfer receipts, contracts or invoices for purchases in both names, past and recent social media posts, and flight bookings and boarding passes for each visit"
    }
   ]
  },
  {
   "key": "insurance",
   "group": "relationship",
   "name": "Insurance policies",
   "need": {
    "i130": "yes",
    "nvc": "no",
    "medical": "no",
    "interview": "no"
   },
   "note": "Life, health, auto insurance naming spouse as beneficiary.",
   "items": []
  },
  {
   "key": "affidavits",
   "group": "relationship",
   "name": "Affidavits from friends and family",
   "need": {
    "i130": "cond",
    "nvc": "no",
    "medical": "no",
    "interview": "no"
   },
   "note": "Two or more notarized statements from people who are not the petitioner or beneficiary and who saw the relationship first-hand (8 CFR 103.2(b)(2)(i)). Helpful if other evidence is thin. Use the <a href=\"/relationship-evidence-template\">relationship evidence template</a>.",
   "items": [
    {
     "list": "i130",
     "id": "evid-7",
     "label": "Optional: two or more notarized third-party affidavits, from people who are not parties to the petition and saw the relationship first-hand. Build them with the <a href=\"/relationship-evidence-template\">relationship evidence template</a>"
    }
   ]
  },
  {
   "key": "acro",
   "group": "police",
   "name": "ACRO police certificate (UK)",
   "need": {
    "i130": "no",
    "nvc": "yes",
    "medical": "yes",
    "interview": "yes"
   },
   "note": "Required if beneficiary aged 16+. Original only (never placeholder). Valid 12 months.",
   "items": [
    {
     "list": "nvc",
     "id": "nvc-18",
     "label": "ACRO (UK) certificate for each applicant aged 16+ who has lived in the UK more than 6 months"
    },
    {
     "list": "binder",
     "id": "s1-3",
     "label": "<strong>ACRO Police Certificate</strong>: photo page facing front"
    }
   ]
  },
  {
   "key": "foreign-police",
   "group": "police",
   "name": "Other police certificates",
   "need": {
    "i130": "no",
    "nvc": "cond",
    "medical": "cond",
    "interview": "cond"
   },
   "note": "For any country lived 12+ months after age 16 and/or where beneficiary is a citizen. Original required.",
   "items": [
    {
     "list": "nvc",
     "id": "nvc-19",
     "label": "Country of nationality: certificate if the applicant lived there more than 6 months (citizenship alone, without residence, does not trigger it)"
    },
    {
     "list": "nvc",
     "id": "nvc-20",
     "label": "Any other country where the applicant lived more than 12 months after age 16"
    },
    {
     "list": "nvc",
     "id": "nvc-21",
     "label": "Any country where the applicant was ever arrested, however short the stay"
    },
    {
     "list": "binder",
     "id": "s2-9",
     "label": "<strong>Additional Police Certificates</strong>: non-UK, per reciprocity rules"
    }
   ]
  },
  {
   "key": "military",
   "group": "police",
   "name": "Military records",
   "need": {
    "i130": "no",
    "nvc": "cond",
    "medical": "cond",
    "interview": "cond"
   },
   "note": "If applicable (military service history).",
   "items": [
    {
     "list": "nvc",
     "id": "nvc-24",
     "label": "Military records (if applicable)"
    },
    {
     "list": "binder",
     "id": "s2-8",
     "label": "<strong>Military Records</strong>: if applicable"
    }
   ]
  },
  {
   "key": "court",
   "group": "police",
   "name": "Court and prison records",
   "need": {
    "i130": "no",
    "nvc": "cond",
    "medical": "cond",
    "interview": "cond"
   },
   "note": "If applicable (any criminal history or court proceedings).",
   "items": [
    {
     "list": "binder",
     "id": "s2-7",
     "label": "<strong>Court / Criminal Records</strong>: if applicable"
    }
   ]
  },
  {
   "key": "vaccination",
   "group": "medical",
   "name": "Vaccination records",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "yes",
    "interview": "no"
   },
   "note": "Required for all beneficiaries. Original booklet/records. Bring to medical exam.",
   "items": [
    {
     "list": "binder",
     "id": "s1-2",
     "label": "<strong>Vaccination Records</strong>: does not need to be signed/stamped"
    }
   ]
  },
  {
   "key": "gp-summary",
   "group": "medical",
   "name": "GP summary (medical history)",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "yes",
    "interview": "no"
   },
   "note": "Required for all beneficiaries. Summary of medical history from GP.",
   "items": [
    {
     "list": "binder",
     "id": "s1-1",
     "label": "<strong>GP Summary / Patient Care Record</strong>: dated within 2–3 weeks of medical (does not need to be signed/stamped)"
    }
   ]
  },
  {
   "key": "medical-reports",
   "group": "medical",
   "name": "Additional medical reports",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "cond",
    "interview": "no"
   },
   "note": "If applicable (documentation for complex chronic conditions).",
   "items": [
    {
     "list": "binder",
     "id": "s1-4",
     "label": "<strong>Medical Reports</strong>, if applicable: chronic conditions, mental health, TB/STI"
    }
   ]
  },
  {
   "key": "red-book",
   "group": "medical",
   "name": "Child health record (Red Book)",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "cond",
    "interview": "no"
   },
   "note": "For children, if you have one.",
   "items": [
    {
     "list": "binder",
     "id": "s1-5",
     "label": "<strong>Child Health Record / Red Book</strong>: if applicable"
    }
   ]
  },
  {
   "key": "glasses",
   "group": "medical",
   "name": "Glasses or contact lenses",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "cond",
    "interview": "no"
   },
   "note": "If worn regularly. Required at medical exam.",
   "items": []
  },
  {
   "key": "pink-slip",
   "group": "medical",
   "name": "Pink medical checklist slip",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "yes",
    "interview": "yes"
   },
   "note": "Received from medical exam. REQUIRED to bring to embassy doc check and interview. Proves medical completed.",
   "items": [
    {
     "list": "medical",
     "id": "med-17",
     "label": "Receive pink checklist slip (REQUIRED for embassy)"
    },
    {
     "list": "binder",
     "id": "fr-6",
     "label": "<strong>Pink Medical Slip</strong>: add after medical"
    }
   ]
  },
  {
   "key": "photo",
   "group": "identity",
   "name": "US-style 2x2in passport photo",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "yes",
    "interview": "yes"
   },
   "note": "1 per beneficiary. Submitted at embassy document check. Used for sealed interview packet.",
   "items": [
    {
     "list": "medical",
     "id": "med-21",
     "label": "1 US-style 2x2in passport photo (for embassy submission)"
    },
    {
     "list": "binder",
     "id": "fr-9",
     "label": "<strong>1 US-Style 2x2in Passport Photo</strong>, for embassy submission at document check"
    }
   ]
  },
  {
   "key": "passport-bio",
   "group": "identity",
   "name": "Passport biographic page (copy)",
   "need": {
    "i130": "no",
    "nvc": "yes",
    "medical": "no",
    "interview": "yes"
   },
   "note": "Photocopy for NVC upload. Keep a copy in your binder for the interview.",
   "items": [
    {
     "list": "nvc",
     "id": "nvc-23",
     "label": "Passport biographic page (photocopy)"
    },
    {
     "list": "binder",
     "id": "s4-1",
     "label": "<strong>Passport Biographic Page Copy</strong>"
    }
   ]
  },
  {
   "key": "prev-passports",
   "group": "identity",
   "name": "Previous passports and visa history",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "no",
    "interview": "cond"
   },
   "note": "If relevant to your travel or visa history.",
   "items": [
    {
     "list": "binder",
     "id": "s4-2",
     "label": "<strong>Previous Passports</strong>: if relevant to travel/visa history"
    },
    {
     "list": "binder",
     "id": "s4-3",
     "label": "<strong>Visa History</strong>: if applicable"
    }
   ]
  },
  {
   "key": "copies",
   "group": "identity",
   "name": "Photocopies of all civil documents",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "yes",
    "interview": "yes"
   },
   "note": "Photocopies of birth certificates, marriage certificates, divorce decrees, passports. Bring originals and copies.",
   "items": []
  },
  {
   "key": "i130",
   "group": "forms",
   "name": "Form I-130",
   "need": {
    "i130": "yes",
    "nvc": "no",
    "medical": "no",
    "interview": "no"
   },
   "note": "Petition for Alien Relative. Petitioner signs. Beneficiary does not sign if outside US.",
   "items": []
  },
  {
   "key": "i130a",
   "group": "forms",
   "name": "Form I-130A (beneficiary supplement)",
   "need": {
    "i130": "yes",
    "nvc": "no",
    "medical": "no",
    "interview": "no"
   },
   "note": "Required for all spouse visas (CR1/IR1). Unsigned if completed outside the US.",
   "items": []
  },
  {
   "key": "ds260",
   "group": "forms",
   "name": "Form DS-260 (visa application)",
   "need": {
    "i130": "no",
    "nvc": "yes",
    "medical": "no",
    "interview": "no"
   },
   "note": "Online to NVC. All fields required. Prepare answers in advance (form times out).",
   "items": []
  },
  {
   "key": "ds260-conf",
   "group": "forms",
   "name": "DS-260 confirmation page",
   "need": {
    "i130": "no",
    "nvc": "yes",
    "medical": "yes",
    "interview": "yes"
   },
   "note": "Printed from CEAC after submitting DS-260. Bring to medical exam and interview.",
   "items": [
    {
     "list": "binder",
     "id": "fr-3",
     "label": "<strong>DS-260 Confirmation Page</strong>"
    }
   ]
  },
  {
   "key": "iv18a",
   "group": "forms",
   "name": "IV18a medical questionnaire",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "yes",
    "interview": "yes"
   },
   "note": "Download from the <a href=\"https://uk.usembassy.gov/wp-content/uploads/sites/204/2023/03/USA-MEDICAL-QUESTIONNAIRE_IV.pdf\" target=\"_blank\" rel=\"noopener noreferrer\">U.S. Embassy London website</a> (not CEAC), complete and print. Bring to the medical exam, and keep it in the front of your binder for the interview.",
   "items": [
    {
     "list": "binder",
     "id": "fr-4",
     "label": "<strong>Completed Medical Questionnaire (IV18a)</strong>: download from the <a href=\"https://uk.usembassy.gov/wp-content/uploads/sites/204/2023/03/USA-MEDICAL-QUESTIONNAIRE_IV.pdf\" target=\"_blank\" rel=\"noopener noreferrer\">U.S. Embassy London website</a>"
    }
   ]
  },
  {
   "key": "case-notices",
   "group": "forms",
   "name": "USCIS and NVC notices",
   "need": {
    "i130": "no",
    "nvc": "yes",
    "medical": "no",
    "interview": "yes"
   },
   "note": "The I-130 approval notice (NOA2) and any other notices from USCIS or NVC.",
   "items": [
    {
     "list": "binder",
     "id": "s5-3",
     "label": "<strong>USCIS Approval Notice (I-130 NOA2)</strong>"
    },
    {
     "list": "binder",
     "id": "s5-4",
     "label": "<strong>Any supporting documents from USCIS or NVC</strong>"
    }
   ]
  },
  {
   "key": "history",
   "group": "forms",
   "name": "Immigration history documents",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "no",
    "interview": "cond"
   },
   "note": "Only for a complex case history: earlier visas, refusals or applications.",
   "items": [
    {
     "list": "binder",
     "id": "s5-1",
     "label": "<strong>Immigration History Documents</strong>"
    },
    {
     "list": "binder",
     "id": "s5-2",
     "label": "<strong>Any documents specific to complex case history</strong>"
    }
   ]
  },
  {
   "key": "il",
   "group": "interview",
   "name": "Interview letter",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "yes",
    "interview": "yes"
   },
   "note": "Printed from email. Bring to medical exam and interview.",
   "items": [
    {
     "list": "binder",
     "id": "fr-2",
     "label": "<strong>Interview Letter</strong>: email print out"
    }
   ]
  },
  {
   "key": "courier",
   "group": "interview",
   "name": "Courier registration confirmation",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "yes",
    "interview": "yes"
   },
   "note": "Printed from AIS, with its QR code.",
   "items": [
    {
     "list": "binder",
     "id": "fr-5",
     "label": "<strong>Courier Registration Confirmation with QR Code</strong>: printed from AIS website"
    }
   ]
  },
  {
   "key": "medical-conf",
   "group": "interview",
   "name": "Medical appointment confirmation",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "yes",
    "interview": "yes"
   },
   "note": "The VisaMedicals confirmation email, printed. It stays in the front of your binder.",
   "items": [
    {
     "list": "binder",
     "id": "fr-8",
     "label": "<strong>Medical Confirmation</strong>: email print out"
    }
   ]
  },
  {
   "key": "packet",
   "group": "interview",
   "name": "Sealed interview packet",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "yes",
    "interview": "yes"
   },
   "note": "From embassy document check. Contains passport photo + medical results. Do not open before the interview. No document check? There is no packet: bring all originals and one passport photo to the interview (<a href=\"/guide/interview#no-document-check\">details</a>).",
   "items": [
    {
     "list": "medical",
     "id": "med-20",
     "label": "Receive sealed interview packet"
    },
    {
     "list": "interview",
     "id": "int-1",
     "label": "Sealed interview packet (from document check), includes your 2x2in passport photo submitted at doc check. <strong>No document check?</strong> There is no packet: bring every original document and one passport photo instead (<a href=\"/guide/interview#no-document-check\">what London asks for</a>)"
    },
    {
     "list": "binder",
     "id": "fr-7",
     "label": "<strong>Sealed Embassy Packet</strong>, add after document check, do not open"
    }
   ]
  },
  {
   "key": "requested",
   "group": "interview",
   "name": "Any requested documents",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "no",
    "interview": "cond"
   },
   "note": "Any additional documents specifically requested by embassy in interview letter.",
   "items": [
    {
     "list": "interview",
     "id": "int-3",
     "label": "Any documents requested by embassy"
    }
   ]
  },
  {
   "key": "ben-cv",
   "group": "beneficiary",
   "name": "CV",
   "code": "B01",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "no",
    "interview": "yes"
   },
   "note": "Every job, employer and date, most recent first.",
   "items": []
  },
  {
   "key": "ben-diplomas",
   "group": "beneficiary",
   "name": "Degree certificates and diplomas",
   "code": "B02",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "no",
    "interview": "yes"
   },
   "note": "Degree certificates, diplomas, transcripts and professional licences. Optional: a US credential evaluation stating the US equivalent of your degree.",
   "items": []
  },
  {
   "key": "ben-bank",
   "group": "beneficiary",
   "name": "Your bank statements, every country",
   "code": "B03",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "no",
    "interview": "yes"
   },
   "note": "The last 3 months for every bank account in your name, home-country accounts included; 12 months if self-employed.",
   "items": []
  },
  {
   "key": "ben-savings",
   "group": "beneficiary",
   "name": "Your savings and investments",
   "code": "B04",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "no",
    "interview": "cond"
   },
   "note": "Only if any: statements in your name, apart from the petitioner&rsquo;s.",
   "items": []
  },
  {
   "key": "ben-property",
   "group": "beneficiary",
   "name": "Your property",
   "code": "B05",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "no",
    "interview": "cond"
   },
   "note": "Only if any: proof of ownership and value for every property you name, co-owned property included.",
   "items": []
  },
  {
   "key": "ben-work",
   "group": "beneficiary",
   "name": "Employer letter or US job offer",
   "code": "B06",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "no",
    "interview": "cond"
   },
   "note": "Only if any: an employer letter confirming you may work from the US, or a US job offer.",
   "items": []
  },
  {
   "key": "ben-insurance",
   "group": "beneficiary",
   "name": "Health insurance quote",
   "code": "B07",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "no",
    "interview": "yes"
   },
   "note": "A quote for your age and ZIP code from <a href=\"https://www.healthcare.gov/see-plans/\" target=\"_blank\" rel=\"noopener noreferrer\">healthcare.gov</a>. It needs no application or SSN, and a travel policy does not answer this. If the petitioner&rsquo;s health plan will cover you, send proof of that coverage instead. Say when the cover starts and what covers you until then. Losing NHS cover when you move is a qualifying life event, so you can join a plan outside the usual enrolment window: the petitioner&rsquo;s employer plan, a marketplace plan, or your own employer&rsquo;s plan once you start work. Employer plans differ in cost and rules, and some need you in the US, or a Social Security Number, before they add you.",
   "items": []
  },
  {
   "key": "ben-medication",
   "group": "beneficiary",
   "name": "US cost of ongoing treatment, and who pays",
   "code": "B08",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "no",
    "interview": "cond"
   },
   "note": "Only if any: the US price, in dollars, of any ongoing medication or treatment, and who will treat it and which plan or income pays.",
   "items": []
  },
  {
   "key": "ben-debts",
   "group": "beneficiary",
   "name": "Your debt statements",
   "code": "B09",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "no",
    "interview": "cond"
   },
   "note": "Only if any: the latest statement for each debt, your Student Loans Company statement included. Add any child support order and a record of payments.",
   "items": []
  },
  {
   "key": "ben-credentials",
   "group": "beneficiary",
   "name": "Credential evaluation or licensing letters",
   "code": "B10",
   "need": {
    "i130": "cond",
    "nvc": "no",
    "medical": "no",
    "interview": "cond"
   },
   "note": "Only if your field is regulated in the US. Start the evaluation at the I-130 stage, because it is slow evidence to get.",
   "items": []
  },
  {
   "key": "ben-english",
   "group": "beneficiary",
   "name": "Proof of English",
   "code": "B11",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "no",
    "interview": "cond"
   },
   "note": "Only if English is not your first language: a qualification taught in English, a test result, or enrolment in English classes.",
   "items": []
  },
  {
   "key": "ben-retirement",
   "group": "beneficiary",
   "name": "Retirement plan",
   "code": "B13",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "no",
    "interview": "yes"
   },
   "note": "The latest statement for each pension, private retirement plan or investment you will rely on, and your UK State Pension forecast from <a href=\"https://www.gov.uk/check-state-pension\" target=\"_blank\" rel=\"noopener noreferrer\">GOV.UK</a>. See <a href=\"/public-charge/evidence#retirement\">your retirement plan</a>.",
   "items": []
  },
  {
   "key": "ben-child-birth",
   "group": "beneficiary",
   "name": "Child&rsquo;s full birth certificate",
   "code": "B14",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "no",
    "interview": "cond"
   },
   "note": "For a child immigrating: the full certificate naming the US citizen parent. See <a href=\"/public-charge/children-and-parents#minor-child\">children</a>.",
   "items": []
  },
  {
   "key": "ben-custody",
   "group": "beneficiary",
   "name": "Custody order or the other parent&rsquo;s consent",
   "code": "B15",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "no",
    "interview": "cond"
   },
   "note": "For a child whose parents live apart: the custody order, or the other parent&rsquo;s written consent to the move.",
   "items": []
  },
  {
   "key": "ben-school",
   "group": "beneficiary",
   "name": "School report and US school place",
   "code": "B16",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "no",
    "interview": "cond"
   },
   "note": "For a child immigrating: the latest school report, and proof of a US school place or the school district.",
   "items": []
  },
  {
   "key": "ben-residence",
   "group": "beneficiary",
   "name": "Proof you live at the sponsor&rsquo;s address",
   "code": "B17",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "no",
    "interview": "cond"
   },
   "note": "Only if the sponsor counts your income on the I-864: a lease, utility bill or council tax bill in your name at that address.",
   "items": []
  },
  {
   "key": "ben-other-income",
   "group": "beneficiary",
   "name": "Your other income",
   "code": "B18",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "no",
    "interview": "cond"
   },
   "note": "Only if any: proof of other income you can document, such as rental income, dividends or freelance invoices. Cash or informal income cannot be documented: describe it in your statement as it is, and do not inflate it.",
   "items": []
  },
  {
   "key": "ben-benefits",
   "group": "beneficiary",
   "name": "Past means-tested benefits",
   "code": "B19",
   "need": {
    "i130": "no",
    "nvc": "no",
    "medical": "no",
    "interview": "cond"
   },
   "note": "Only if any: means-tested benefits or food bank use by anyone in the household, now or in the past: letters showing when support started and ended, if you have them. Your statement explains when, why, for how long and what changed. Receiving benefits does not disqualify you; concealing them can. <a href=\"/public-charge#benefits\">What counts</a>.",
   "items": []
  },
  {
   "key": "move-immigrant-fee",
   "group": "moving",
   "name": "USCIS Immigrant Fee receipt",
   "need": {
    "move": "yes"
   },
   "note": "The receipt for the $235 USCIS Immigrant Fee. USCIS does not make your green card until it is paid. See <a href=\"/guide/after-interview\">Stage 7</a>.",
   "items": []
  },
  {
   "key": "move-dog-receipt",
   "group": "moving",
   "name": "CDC Dog Import Form receipt",
   "need": {
    "move": "cond"
   },
   "note": "One for each dog. Show it to the airline before boarding and to US Customs and Border Protection on arrival. The dog must be at least 6 months old, microchipped and healthy. Check your state&rsquo;s and airline&rsquo;s rules too. See <a href=\"/guide/before-you-leave\">pets</a>.",
   "items": []
  },
  {
   "key": "move-driving-record",
   "group": "moving",
   "name": "UK driving record and no-claims letter",
   "need": {
    "move": "cond"
   },
   "note": "Your DVLA driving record and a no-claims letter from your insurer, gathered before you leave. Both can lower US car insurance. See <a href=\"/life#life_2a\">your UK driving record</a>.",
   "items": []
  },
  {
   "key": "move-prescriptions",
   "group": "moving",
   "name": "GP letter listing your prescriptions",
   "need": {
    "move": "cond"
   },
   "note": "Only if you take regular medication. Bring enough to last until you see a US doctor.",
   "items": []
  },
  {
   "key": "move-records",
   "group": "moving",
   "name": "Copies of medical and dental records",
   "need": {
    "move": "yes"
   },
   "note": "Get them while you are still registered: the NHS charges for most care once you have moved.",
   "items": []
  },
  {
   "key": "move-school-records",
   "group": "moving",
   "name": "Children&rsquo;s school reports and records",
   "need": {
    "move": "cond"
   },
   "note": "For enrolling in a US school. Schools follow their state&rsquo;s vaccination rules.",
   "items": []
  },
  {
   "key": "move-inventory",
   "group": "moving",
   "name": "Shipping inventory",
   "need": {
    "move": "cond"
   },
   "note": "Only if you ship belongings: every item, in English, with what you paid and when and where you bought it. Use the Boxes tab in the <a href=\"/tools/workbook\">master workbook</a>. Your mover also asks for copies of your passport and visa, Form 3299 and a power of attorney.",
   "items": []
  }
 ]
};

// A stage a document does not mention counts as not needed there.
function needOf(doc, stage) {
  return (doc.need && doc.need[stage]) || 'no';
}

// Node (tests and scripts/build-workbook.mjs) reads the same data.
if (typeof module !== 'undefined' && module.exports) module.exports = { AVG_DOCS: AVG_DOCS, needOf: needOf };

(function () {
  'use strict';
  if (typeof document === 'undefined') return;
  var STAGES = AVG_DOCS.stages;
  var LISTS = {
    i130: ['/tools/checklist-i130', 'I-130'],
    nvc: ['/tools/checklist-nvc', 'NVC'],
    medical: ['/tools/checklist-medical', 'Medical day'],
    interview: ['/tools/checklist-interview', 'Interview day'],
    binder: ['/tools/checklist-binder', 'Binder']
  };
  var BADGE = {
    yes: '<span class="stage-badge yes">✓</span>',
    cond: '<span class="stage-badge conditional">*</span>',
    no: '<span class="stage-badge no">n/a</span>'
  };

  var byItem = {};
  AVG_DOCS.docs.forEach(function (doc) {
    doc.items.forEach(function (it) { byItem[it.id] = it; });
  });

  // Stage checklists: fill each placeholder with its checkbox and label
  document.querySelectorAll('[data-doc-item]').forEach(function (el) {
    var id = el.getAttribute('data-doc-item');
    var it = byItem[id];
    if (!it) { console.warn('No master document item for', id); return; }
    el.setAttribute('data-item-id', id);
    el.innerHTML = '<input type="checkbox" id="' + id + '" />\n<label for="' + id + '">' + it.label + '</label>';
  });

  // Master checklist: one table per group
  var master = document.getElementById('master-docs');
  if (master) {
    var html = '';
    AVG_DOCS.groups.forEach(function (g) {
      var docs = AVG_DOCS.docs.filter(function (d) { return d.group === g.key; });
      html += '<h2 id="docs-' + g.key + '">' + g.title + '</h2>';
      if (g.note) html += '<p class="section-note">' + g.note + '</p>';
      html += '<table class="doc-table"><thead><tr><th>Document</th>' +
        STAGES.map(function (s) { return '<th class="stage-col">' + s[1] + '</th>'; }).join('') +
        '<th>Notes</th></tr></thead><tbody>';
      docs.forEach(function (d) {
        var lists = [];
        d.items.forEach(function (it) { if (lists.indexOf(it.list) < 0) lists.push(it.list); });
        var on = lists.length ? '<span class="doc-on">On: ' + lists.map(function (l) {
          return '<a href="' + LISTS[l][0] + '">' + LISTS[l][1] + '</a>';
        }).join(' &middot; ') + '</span>' : '';
        html += '<tr><td><strong>' + d.name + '</strong>' +
          (d.code ? ' <span class="doc-code">' + d.code + '</span>' : '') + '</td>' +
          STAGES.map(function (s) { return '<td class="stage-col">' + BADGE[needOf(d, s[0])] + '</td>'; }).join('') +
          '<td>' + d.note + on + '</td></tr>';
      });
      html += '</tbody></table>';
    });
    master.innerHTML = html;
  }
})();
