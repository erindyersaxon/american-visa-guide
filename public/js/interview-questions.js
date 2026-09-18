/*
   American Visa Guide: Interview Question Bank
   Single source of truth for the consular interview question bank.

   Almost every question here comes from a real community interview
   report at the US Embassy London (see checklist-interview.html for the
   full write-ups). The exceptions are attributed to 'Written
   questionnaire': those are taken verbatim from a written public charge
   questionnaire a post issued to an applicant ahead of interview, and
   are included because the same factors drive the questioning at London.

   Officers are confirming what they already know from your DS-260 and
   petition. They are not testing you. Answer honestly and consistently;
   the point of this bank is rehearsal, not memorization.

   A note on the 'publiccharge' theme: those questions are newer and
   sharper than the rest of the bank. Since the public charge assessment
   changed in November 2025 the financial questioning has become a
   sustained line of enquiry rather than a box-tick, and reports describe
   interviews running 30 to 40 minutes on it. See public-charge.html.

   HOW TO ADD A QUESTION (this file is the only place to edit):
     {
       q:     'The question, phrased the way officers tend to ask it',
       theme: one of the THEMES keys below,
       cats:  'all'  OR  an array like ['spouse', 'parent'],
       tip:   'Optional one-line prep note shown on the flashcard back',
       from:  'Optional attribution: a member handle or "Multiple reports"'
     }

   cats controls the category filter:
     'all'                → shown for every visa category
     ['spouse', ...]      → shown only when one of those categories is picked

   Both the bank view and the flashcard mode read from this array, so a
   single edit updates the whole tool.
 */
(function () {
  'use strict';

  // Broad visa categories the community has reported on. Spouse (CR-1/IR-1)
  // is where almost all London reports come from today; parent and child are
  // seeded from the questions that apply to any immigrant-visa applicant.
  const CATEGORIES = [
    { id: 'all',    label: 'All questions',        short: 'All' },
    { id: 'spouse', label: 'Spouse (CR-1 / IR-1)', short: 'Spouse' },
    { id: 'parent', label: 'Parent (IR-5)',        short: 'Parent' },
    { id: 'child',  label: 'Child (IR-2 / CR-2)',  short: 'Child' },
  ];

  // Ordered themes. `key` is referenced by each question's `theme`.
  const THEMES = [
    { key: 'relationship', label: 'How you met & your relationship' },
    { key: 'wedding',      label: 'The wedding & ceremony' },
    { key: 'petitioner',   label: 'Your petitioner / sponsor' },
    { key: 'living',       label: 'Where you’ll live & US plans' },
    { key: 'work',         label: 'Work & employment' },
    { key: 'finances',     label: 'Finances, sponsorship & benefits' },
    { key: 'publiccharge', label: 'Public charge: the deep financial dive' },
    { key: 'medical',      label: 'Medical, insurance & conditions' },
    { key: 'family',       label: 'Family & prior relationships' },
    { key: 'logistics',    label: 'Travel & logistics' },
  ];

  const QUESTIONS = [
    // How you met & your relationship
    { q: 'Who is petitioning you today, and what is your relationship?', theme: 'relationship', cats: 'all', tip: 'Know their full legal name and how you’re related.', from: 'Mia' },
    { q: 'What is your petitioner’s full name?', theme: 'relationship', cats: 'all', from: 'Mia' },
    { q: 'How and when did you meet?', theme: 'relationship', cats: ['spouse'], tip: 'A short, honest story is better than a rehearsed speech.', from: 'Multiple reports' },
    { q: 'Where was your first meeting in person?', theme: 'relationship', cats: ['spouse'], from: 'Mia' },
    { q: 'When did you first meet in person?', theme: 'relationship', cats: ['spouse'], from: 'Multiple reports' },
    { q: 'Did you meet in person alone, or was someone with you?', theme: 'relationship', cats: ['spouse'], from: 'Mia' },
    { q: 'When did you first fly out to America, and for how long?', theme: 'relationship', cats: ['spouse'], from: 'Mia' },
    { q: 'Tell me the full story of how your relationship progressed.', theme: 'relationship', cats: ['spouse'], tip: 'Have a natural timeline in your head: meeting → dating → engagement → marriage.', from: 'Mia' },
    { q: 'How long have you been together?', theme: 'relationship', cats: ['spouse'], from: 'Multiple reports' },
    { q: 'Has your petitioner visited the UK, and when?', theme: 'relationship', cats: ['spouse'], from: 'Mia' },

    // The wedding & ceremony
    { q: 'Where did you get married?', theme: 'wedding', cats: ['spouse'], from: 'Mia' },
    { q: 'When and where did you get married?', theme: 'wedding', cats: ['spouse'], from: 'Multiple reports' },
    { q: 'Who was there for the wedding?', theme: 'wedding', cats: ['spouse'], from: 'Mia' },
    { q: 'Did you have any other ceremonies (religious, cultural, or a second celebration)?', theme: 'wedding', cats: ['spouse'], from: 'Mia' },

    // Your petitioner / sponsor
    { q: 'What does your petitioner do for work?', theme: 'petitioner', cats: 'all', tip: 'Officers often review the sponsor’s income documents right after this: know their job and roughly what they earn.', from: 'Multiple reports' },
    { q: 'Where does your petitioner currently live?', theme: 'petitioner', cats: 'all', from: 'Multiple reports' },
    { q: 'What do your petitioner’s parents do for work?', theme: 'petitioner', cats: ['spouse'], tip: 'Comes up especially if you’ll be living with them at first.', from: 'Mia' },
    { q: 'Does your petitioner have a mortgage?', theme: 'petitioner', cats: 'all', tip: 'The largest of the debts the officer weighs. Know whether there is one and roughly what is outstanding.', from: 'Esther' },
    { q: 'Is your petitioner in a union?', theme: 'petitioner', cats: 'all', tip: 'Asked of a petitioner working somewhere unionised. Union membership speaks to job security and health coverage, so it helps you: know the answer.', from: 'Esther' },
    { q: 'Who else lives at the address?', theme: 'petitioner', cats: 'all', tip: 'Everyone, not just the people on the petition. Family status is a statutory public charge factor.', from: 'Esther' },

    // Where you'll live & US plans
    { q: 'Where will you live in the US?', theme: 'living', cats: 'all', from: 'Multiple reports' },
    { q: 'Who will you be living with when you first arrive?', theme: 'living', cats: 'all', from: 'Mia' },

    // Work & employment
    { q: 'Are you currently employed? What do you do?', theme: 'work', cats: 'all', from: 'Multiple reports' },
    { q: 'What do you plan to do for work once you get to America?', theme: 'work', cats: 'all', tip: 'A general direction is fine. You don’t need a signed job offer.', from: 'Mia' },
    { q: 'Who do you work for, and what does the company do?', theme: 'work', cats: 'all', tip: 'Expect the full background. One officer searched the applicant’s employer online during the interview and read the results back to her.', from: 'Esther' },
    { q: 'When did you join your current company?', theme: 'work', cats: 'all', from: 'Esther' },
    { q: 'Who was your previous employer?', theme: 'work', cats: 'all', tip: 'Continuity of employment is weighed as heavily as the current role. Have the whole history, not just the latest job.', from: 'Esther' },
    { q: 'Is your work remote?', theme: 'work', cats: 'all', tip: 'A gateway question. The two that follow it matter more.', from: 'Esther' },
    { q: 'Will your company allow you to work from the US? If not, what is your plan?', theme: 'work', cats: 'all', tip: 'Do not assume a remote job survives the move: many employers will not permit it, for tax and payroll reasons. Get written confirmation if you are relying on it, and have a fallback if you are not.', from: 'Esther' },
    { q: 'What did you study, and where? Do you have any other certifications?', theme: 'work', cats: 'all', tip: 'Have the full list, not just the highest qualification. Posts ask for education history as a list with subject, institution and year.', from: 'Esther' },

    // Finances, sponsorship & benefits
    { q: 'Have you, or your petitioner, ever received financial aid or benefits from the government?', theme: 'finances', cats: 'all', from: 'Multiple reports' },
    { q: 'Do you have any debt? Does your petitioner?', theme: 'finances', cats: 'all', from: 'Multiple reports' },
    { q: 'Do you have savings you’re bringing with you? Roughly how much? Does your petitioner have savings?', theme: 'finances', cats: 'all', tip: 'Have a ballpark figure ready. You won’t need exact numbers.', from: 'Multiple reports' },
    { q: 'Do you have a joint sponsor? Who are they, and what do they do?', theme: 'finances', cats: 'all', tip: 'Know their name, relationship to you, job and income. One member was told he “probably” needed one and was still approved.', from: 'Multiple reports' },

    // Public charge: the deep financial dive
    { q: 'Why was your petitioner’s income below the minimum in a given tax year?', theme: 'publiccharge', cats: 'all', tip: 'The officer reads the tax transcript in front of you and asks the beneficiary to explain it. Know the reason and know what changed. One petitioner’s 2025 income was low because he had just opened a business.', from: 'Esther' },
    { q: 'What is your petitioner’s business? If it fails, what will he or she do?', theme: 'publiccharge', cats: 'all', tip: 'Asked of any self-employed sponsor, and the contingency half is asked directly. Have an answer that does not depend on the business surviving.', from: 'Esther' },
    { q: 'How much do you earn a month?', theme: 'publiccharge', cats: 'all', tip: 'Have the figure ready in US dollars. Converting under pressure is an avoidable stumble.', from: 'Esther' },
    { q: 'Can I see your savings balance?', theme: 'publiccharge', cats: 'all', tip: 'Not a question, a request. Bring printed bank and investment statements: officers ask to see the balance, not just hear it.', from: 'Esther' },
    { q: 'Can you show proof of the property you own?', theme: 'publiccharge', cats: 'all', tip: 'Bring documentary proof for every property you claim, co-owned ones included. One applicant named two and could evidence only one.', from: 'Esther' },
    { q: 'Tell me about your side business. Do you get paid a salary for it?', theme: 'publiccharge', cats: 'all', tip: 'Cash or informal income draws detailed questioning because it cannot be evidenced like a payslip. Describe it accurately, do not inflate it, and lead on income you can document.', from: 'Esther' },
    { q: 'How many people does your petitioner support financially?', theme: 'publiccharge', cats: 'all', tip: 'Wider than the I-864 definition: it includes extended family or friends being supported, who appear nowhere on the affidavit. Work out both numbers.', from: 'Written questionnaire' },
    { q: 'Has either of you ever been institutionalized at government expense?', theme: 'publiccharge', cats: 'all', tip: 'A long-term stay in a mental health or nursing facility funded by the state. Ordinary NHS treatment is not this. Asked about the petitioner as well as you.', from: 'Written questionnaire' },
    { q: 'What is your petitioner’s salary after taxes?', theme: 'publiccharge', cats: 'all', tip: 'Written questionnaires ask for net, while the I-864 works in gross. Have both figures and say which one you are quoting.', from: 'Written questionnaire' },

    // Medical, insurance & conditions
    { q: 'Do you have any medical conditions?', theme: 'medical', cats: 'all', from: 'Mia' },
    { q: 'Do you have a plan for medication or treatment once you’re in the US?', theme: 'medical', cats: 'all', from: 'Mia' },
    { q: 'How will you get health insurance in the US?', theme: 'medical', cats: 'all', tip: 'Even a general plan (spouse’s employer, marketplace, etc.) is reassuring.', from: 'Mia' },
    { q: 'Are you on your petitioner’s insurance plan?', theme: 'medical', cats: 'all', tip: 'If not yet, say when you will be and what covers you until then.', from: 'Esther' },
    { q: 'Do you know what your medication costs in the US? Have you looked into it?', theme: 'medical', cats: 'all', tip: 'The health factor is about cost, not just coverage. An applicant with Type 1 diabetes was asked what insulin costs in the US. Price your own treatment in dollars before you go.', from: 'Esther' },

    // Family & prior relationships
    { q: 'Have you been married before? Has your petitioner?', theme: 'family', cats: 'all', from: 'Multiple reports' },
    { q: 'Do you have any children?', theme: 'family', cats: 'all', from: 'Multiple reports' },
    { q: 'Do you have any children or stepchildren?', theme: 'family', cats: 'all', from: 'Multiple reports' },
    { q: 'How does your family feel about you leaving? Have they met your partner?', theme: 'family', cats: ['spouse'], from: 'Mia' },
    { q: 'Have you ever lived anywhere else (another country)? Has your petitioner?', theme: 'family', cats: 'all', from: 'Multiple reports' },
    { q: 'Have you ever been arrested, in any country? Where have you lived?', theme: 'family', cats: 'all', tip: 'Any arrest anywhere, whatever the outcome, needs a police certificate from that country. Keep your answer consistent with your DS-260 and your certificates.', from: 'Multiple reports' },

    // Travel & logistics
    { q: 'When are you planning to fly out?', theme: 'logistics', cats: 'all', from: 'Multiple reports' },
    { q: 'Are you flying out alone?', theme: 'logistics', cats: 'all', from: 'Multiple reports' },
    { q: 'Have you traveled to the US before? (Prior visits, or any prior petition?)', theme: 'logistics', cats: 'all', from: 'Crimsonak' },
  ];

  window.AVG_INTERVIEW_QB = { CATEGORIES: CATEGORIES, THEMES: THEMES, QUESTIONS: QUESTIONS };
})();
