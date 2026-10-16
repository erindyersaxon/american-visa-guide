/*
   American Visa Guide: the master document list.

   Single source for every document the guide asks you to gather. The
   master checklist (/master-checklist) renders its tables from DOCS, and
   each stage checklist renders its document items from the same entries:
   a stage page holds an empty <div data-doc-item="ID"> where the item
   goes, and this script fills in the checkbox and label.

   To change a document, edit it here. Each entry has:
     need   which stages need it: yes, cond (depends on your case) or no
     note   the master checklist's note
     items  where it appears on a stage checklist, with that page's wording.
            Keep each item id unchanged: saved ticks are stored against it.

   Steps that are not documents (fill in a form, check names match, go to
   the Pass Back window) stay written on their own stage page.

   Load as a classic script after the page content and before checklist.js.
 */
var AVG_DOCS = {
 "groups": [
  {
   "key": "civil",
   "title": "Civil &amp; identity documents",
   "note": ""
  },
  {
   "key": "financial",
   "title": "Financial documents (I-864 affidavit of support)",
   "note": "For NVC and beyond. The petitioner and every joint sponsor each need their own set."
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
   "note": "Certified copy. Required for all spouse petitions at all stages.",
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
    "medical": "yes",
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
    "medical": "cond",
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
    "medical": "cond",
    "interview": "cond"
   },
   "note": "Only if a joint sponsor is filing: their own I-864, IRS transcript, proof of US status and income evidence for their situation.",
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
   ]
  },
  {
   "key": "transcript",
   "group": "financial",
   "name": "IRS tax transcript (every sponsor)",
   "need": {
    "i130": "no",
    "nvc": "yes",
    "medical": "yes",
    "interview": "yes"
   },
   "note": "Via IRS.gov with ID.me. Most recent tax year required for every sponsor (Form I-864 instructions, 08/24/26). Last 3 years strongly recommended.",
   "items": [
    {
     "list": "nvc",
     "id": "nvc-9",
     "label": "Tax return: IRS transcript via IRS.gov/ID.me for every sponsor (a 1040 with W-2s meets NVC's minimum only, see warning above)"
    },
    {
     "list": "binder",
     "id": "s3-3",
     "label": "<strong>IRS Tax Transcripts</strong>"
    }
   ]
  },
  {
   "key": "tax-return",
   "group": "financial",
   "name": "Complete tax return (every sponsor)",
   "need": {
    "i130": "no",
    "nvc": "yes",
    "medical": "yes",
    "interview": "yes"
   },
   "note": "Full return with all schedules if self-employed (C/E/F/SE). Most recent year required; last 3 years strongly recommended.",
   "items": []
  },
  {
   "key": "employment",
   "group": "financial",
   "name": "Employment letter (current job)",
   "need": {
    "i130": "no",
    "nvc": "yes",
    "medical": "yes",
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
    "medical": "yes",
    "interview": "yes"
   },
   "note": "Last 3 years strongly recommended, to match the returns. Establishes US employment history. Posts list the most recent W-2 on public charge 221(g) checklists.",
   "items": [
    {
     "list": "binder",
     "id": "s3-4",
     "label": "<strong>W-2s / 1099s</strong>"
    }
   ]
  },
  {
   "key": "paystubs",
   "group": "financial",
   "name": "Recent pay stubs",
   "need": {
    "i130": "no",
    "nvc": "yes",
    "medical": "yes",
    "interview": "yes"
   },
   "note": "The latest stubs for each sponsor, showing current income.",
   "items": [
    {
     "list": "binder",
     "id": "s3-6",
     "label": "<strong>Recent Pay Stubs</strong>"
    }
   ]
  },
  {
   "key": "sponsor-status",
   "group": "financial",
   "name": "Proof of sponsor&rsquo;s US status",
   "need": {
    "i130": "yes",
    "nvc": "yes",
    "medical": "yes",
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
    "medical": "yes",
    "interview": "yes"
   },
   "note": "Recent statements showing US domicile and financial capacity. 3-6 months recommended. Opening a US account and transferring funds are both named in State Department guidance as evidence of establishing domicile.",
   "items": []
  },
  {
   "key": "self-employed",
   "group": "financial",
   "name": "Self-employment evidence",
   "need": {
    "i130": "no",
    "nvc": "cond",
    "medical": "cond",
    "interview": "cond"
   },
   "note": "If a sponsor is self-employed: the full return with all schedules, 12 months of business bank statements, and business registration or EIN.",
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
   ]
  },
  {
   "key": "domicile",
   "group": "financial",
   "name": "Petitioner&rsquo;s proof of US domicile",
   "need": {
    "i130": "no",
    "nvc": "yes",
    "medical": "yes",
    "interview": "yes"
   },
   "note": "Strongest first: US tax filings with domestic earned income, a W-2 or US job offer, utility bills across several months, a state ID. A lease or mortgage shows an address, not a residence. See <a href=\"/domicile\">petitioner domicile</a>.",
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
    "medical": "yes",
    "interview": "yes"
   },
   "note": "Supports US domicile, but evidences an <em>address</em> rather than residence. Never submit it as the only domicile evidence: pair it with utility bills, US tax filings showing domestic earned income, or a US job contract.",
   "items": []
  },
  {
   "key": "utilities",
   "group": "financial",
   "name": "US household utility bills",
   "need": {
    "i130": "no",
    "nvc": "yes",
    "medical": "yes",
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
    "i130": "no",
    "nvc": "cond",
    "medical": "cond",
    "interview": "cond"
   },
   "note": "<strong>Treat as required, not optional, wherever the petitioner lives abroad</strong>: a joint sponsor cures income but cannot cure the petitioner's domicile, and a petitioner who fails it does not qualify as a sponsor. Moving contract, job contract, job applications, school/childcare inquiries, rental property contracts, US bank account opened or funds transferred, Social Security number application, dated statement of intent. The petitioner must be resident in the US, or arriving, no later than the date the beneficiary immigrates.",
   "items": [
    {
     "list": "nvc",
     "id": "nvc-30",
     "label": "<strong>If the petitioner lives abroad:</strong> evidence they are re-establishing US domicile. State Department guidance names opening a US bank account, transferring funds, US investments, <strong>seeking US employment</strong>, registering children in US schools, applying for a Social Security number, and voting. Add a dated written statement of intent, a moving or shipping quotation, and the US address arranged (a lease, or an arrangement to stay with family or friends, which the guidance accepts)."
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
    "medical": "yes",
    "interview": "yes"
   },
   "note": "Written statement (treat as mandatory, even though the embassy calls it voluntary), sent with the last 3 years of IRS tax returns for every sponsor, and the last 3 months of payslips and bank statements, and proof of the petitioner's health insurance, plus evidence of US housing, US healthcare plan (employer, private, ACA marketplace), how housing and insurance are paid for, and the beneficiary's professional qualifications/evidence of ability to work in US. See the <a href=\"/public-charge.html\">statement template</a>.",
   "items": [
    {
     "list": "binder",
     "id": "s3-10",
     "label": "<strong>Public Charge Statement</strong>: treat as mandatory, even though the embassy calls it voluntary. Include the last 3 years of IRS tax returns for every sponsor, and the last 3 months of payslips and bank statements, and proof of the petitioner's health insurance. Include linked evidence (e.g. health insurance quote/coverage, job information and estimated salaries for petitioner/joint sponsor/beneficiary, housing information and how it is paid for). This should already have been emailed to <a href=\"mailto:LNDIVSubmissions@state.gov\">LNDIVSubmissions@state.gov</a> with your case number in the subject line, or uploaded directly to your case in CEAC. Do this at least a few days before your interview date. See the <a href=\"/guide/waiting#public-charge-statement\">public charge statement checklist</a> and <a href=\"/public-charge.html\">template</a>."
    }
   ]
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
    "interview": "no"
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
     "label": "Commingling of finances: joint bank statements (6+ months), shared bills, or joint credit cards"
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
   "note": "Notarized statements. Helpful if evidence sparse.",
   "items": []
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
    "interview": "no"
   },
   "note": "Photocopy for NVC upload.",
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
    "interview": "no"
   },
   "note": "Download from the <a href=\"https://uk.usembassy.gov/wp-content/uploads/sites/204/2023/03/USA-MEDICAL-QUESTIONNAIRE_IV.pdf\" target=\"_blank\" rel=\"noopener noreferrer\">U.S. Embassy London website</a> (not CEAC), complete and print. Bring to medical exam.",
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
    "interview": "no"
   },
   "note": "The VisaMedicals confirmation email, printed.",
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
  }
 ]
};

(function () {
  'use strict';
  var STAGES = [['i130', 'I-130'], ['nvc', 'NVC'], ['medical', 'Medical'], ['interview', 'Interview']];
  var LISTS = {
    i130: ['/checklist-i130', 'I-130'],
    nvc: ['/checklist-nvc', 'NVC'],
    medical: ['/checklist-medical', 'Medical day'],
    interview: ['/checklist-interview', 'Interview day'],
    binder: ['/checklist-binder', 'Binder']
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
        html += '<tr><td><strong>' + d.name + '</strong></td>' +
          STAGES.map(function (s) { return '<td class="stage-col">' + BADGE[d.need[s[0]]] + '</td>'; }).join('') +
          '<td>' + d.note + on + '</td></tr>';
      });
      html += '</tbody></table>';
    });
    master.innerHTML = html;
  }
})();
