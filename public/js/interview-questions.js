/* ─────────────────────────────────────────────────────────────
   American Visa Guide — Interview Question Bank
   Single source of truth for the consular interview question bank.

   Every question here comes from a real community interview report at
   the US Embassy London (see checklist-interview.html for the full
   write-ups). Officers are confirming what they already know from your
   DS-260 and petition — they are not testing you. Answer honestly and
   consistently; the point of this bank is rehearsal, not memorization.

   HOW TO ADD A QUESTION (this file is the only place to edit):
     {
       q:     'The question, phrased the way officers tend to ask it',
       theme: one of the THEMES keys below,
       cats:  'all'  OR  an array like ['spouse', 'parent'],
       tip:   'Optional one-line prep note shown on the flashcard back',
       from:  'Optional attribution — a member handle or "Multiple reports"'
     }

   cats controls the category filter:
     'all'                → shown for every visa category
     ['spouse', ...]      → shown only when one of those categories is picked

   Both the bank view and the flashcard mode read from this array, so a
   single edit updates the whole tool.
   ───────────────────────────────────────────────────────────── */
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
    { key: 'relationship', label: 'How you met & your relationship', icon: '💬' },
    { key: 'wedding',      label: 'The wedding & ceremony',          icon: '💍' },
    { key: 'petitioner',   label: 'Your petitioner / sponsor',       icon: '👤' },
    { key: 'living',       label: 'Where you’ll live & US plans', icon: '🏠' },
    { key: 'work',         label: 'Work & employment',               icon: '💼' },
    { key: 'finances',     label: 'Finances, sponsorship & benefits', icon: '💷' },
    { key: 'medical',      label: 'Medical, insurance & conditions',  icon: '🩺' },
    { key: 'family',       label: 'Family & prior relationships',     icon: '👪' },
    { key: 'logistics',    label: 'Travel & logistics',              icon: '✈️' },
  ];

  const QUESTIONS = [
    // ── How you met & your relationship ──
    { q: 'Who is petitioning you today, and what is your relationship?', theme: 'relationship', cats: 'all', tip: 'Know their full legal name and how you’re related.', from: 'Mia' },
    { q: 'What is your petitioner’s full name?', theme: 'relationship', cats: 'all', from: 'Mia' },
    { q: 'How and when did you meet?', theme: 'relationship', cats: ['spouse'], tip: 'A short, honest story is better than a rehearsed speech.', from: 'Multiple reports' },
    { q: 'Where was your first meeting in person?', theme: 'relationship', cats: ['spouse'], from: 'Mia' },
    { q: 'Did you meet in person alone, or was someone with you?', theme: 'relationship', cats: ['spouse'], from: 'Mia' },
    { q: 'When did you first fly out to America, and for how long?', theme: 'relationship', cats: ['spouse'], from: 'Mia' },
    { q: 'Tell me the full story of how your relationship progressed.', theme: 'relationship', cats: ['spouse'], tip: 'Have a natural timeline in your head: meeting → dating → engagement → marriage.', from: 'Mia' },
    { q: 'How long have you been together?', theme: 'relationship', cats: ['spouse'], from: 'Multiple reports' },
    { q: 'Has your petitioner visited the UK, and when?', theme: 'relationship', cats: ['spouse'], from: 'Mia' },

    // ── The wedding & ceremony ──
    { q: 'Where did you get married?', theme: 'wedding', cats: ['spouse'], from: 'Mia' },
    { q: 'Who was there for the wedding?', theme: 'wedding', cats: ['spouse'], from: 'Mia' },
    { q: 'Did you have any other ceremonies (religious, cultural, or a second celebration)?', theme: 'wedding', cats: ['spouse'], from: 'Mia' },

    // ── Your petitioner / sponsor ──
    { q: 'What does your petitioner do for work?', theme: 'petitioner', cats: 'all', tip: 'Officers often review the sponsor’s income documents right after this — know their job and roughly what they earn.', from: 'Multiple reports' },
    { q: 'Where does your petitioner currently live?', theme: 'petitioner', cats: 'all', from: 'Multiple reports' },
    { q: 'What do your petitioner’s parents do for work?', theme: 'petitioner', cats: ['spouse'], tip: 'Comes up especially if you’ll be living with them at first.', from: 'Mia' },

    // ── Where you'll live & US plans ──
    { q: 'Where will you live in the US?', theme: 'living', cats: 'all', from: 'Multiple reports' },
    { q: 'Who will you be living with when you first arrive?', theme: 'living', cats: 'all', from: 'Mia' },

    // ── Work & employment ──
    { q: 'Are you currently employed? What do you do?', theme: 'work', cats: 'all', from: 'Multiple reports' },
    { q: 'What do you plan to do for work once you get to America?', theme: 'work', cats: 'all', tip: 'A general direction is fine — you don’t need a signed job offer.', from: 'Mia' },

    // ── Finances, sponsorship & benefits ──
    { q: 'Have you, or your petitioner, ever received financial aid or benefits from the government?', theme: 'finances', cats: 'all', from: 'Multiple reports' },
    { q: 'Do you have any debt? Does your petitioner?', theme: 'finances', cats: 'all', from: 'Multiple reports' },
    { q: 'Do you have savings you’re bringing with you? Roughly how much? Does your petitioner have savings?', theme: 'finances', cats: 'all', tip: 'Have a ballpark figure ready — you won’t need exact numbers.', from: 'Multiple reports' },
    { q: 'Do you have a joint sponsor? Who are they, and what do they do?', theme: 'finances', cats: 'all', tip: 'Know their name, relationship to you, job and income. One member was told he “probably” needed one and was still approved.', from: 'Multiple reports' },

    // ── Medical, insurance & conditions ──
    { q: 'Do you have any medical conditions?', theme: 'medical', cats: 'all', from: 'Mia' },
    { q: 'Do you have a plan for medication or treatment once you’re in the US?', theme: 'medical', cats: 'all', from: 'Mia' },
    { q: 'How will you get health insurance in the US?', theme: 'medical', cats: 'all', tip: 'Even a general plan (spouse’s employer, marketplace, etc.) is reassuring.', from: 'Mia' },

    // ── Family & prior relationships ──
    { q: 'Have you been married before? Has your petitioner?', theme: 'family', cats: 'all', from: 'Multiple reports' },
    { q: 'Do you have any children?', theme: 'family', cats: 'all', from: 'Multiple reports' },
    { q: 'How does your family feel about you leaving? Have they met your partner?', theme: 'family', cats: ['spouse'], from: 'Mia' },
    { q: 'Have you ever lived anywhere else (another country)? Has your petitioner?', theme: 'family', cats: 'all', from: 'Multiple reports' },

    // ── Travel & logistics ──
    { q: 'When are you planning to fly out?', theme: 'logistics', cats: 'all', from: 'Multiple reports' },
    { q: 'Are you flying out alone?', theme: 'logistics', cats: 'all', from: 'Multiple reports' },
    { q: 'Have you traveled to the US before? (Prior visits, or any prior petition?)', theme: 'logistics', cats: 'all', from: 'Crimsonak' },
  ];

  window.AVG_INTERVIEW_QB = { CATEGORIES: CATEGORIES, THEMES: THEMES, QUESTIONS: QUESTIONS };
})();
