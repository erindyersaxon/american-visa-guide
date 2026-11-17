/*
   American Visa Guide: section sidebar ("In this section")
   One list of links per section, shared by every page in it. Styles live in
   /css/section-nav.css.

   Usage, in the page <head>:
     <link rel="stylesheet" href="/css/section-nav.css?v=...">
     <script src="/js/section-nav.js?v=..." data-section="interview" defer></script>

   Renders twice from the same list:
   - wide screens: a fixed rail on the left (same look as the guide sidebar);
   - narrower screens: an "In this section" fold-out under the breadcrumb.
   CSS shows one or the other. The current page is marked with aria-current.
 */

(function () {
  'use strict';

  /* Each group: an optional heading and its links. `sub: true` indents a
     link under the one before it ("only if this applies"). An entry with
     `group` instead of `href` is a small label that sorts a long list into
     kinds; the indented links under it belong to it. */
  const SECTIONS = {
    guide: {
      label: 'Guide',
      groups: [
        {
          links: [
            { href: '/guide', text: 'Guide overview' },
          ],
        },
        {
          heading: 'Stages',
          links: [
            { href: '/guide/i130', text: '1: USCIS / I-130' },
            { href: '/guide/delayed-i130', text: 'If your I-130 is delayed', sub: true },
            { href: '/guide/crba', text: 'If your child is a US citizen (CRBA)', sub: true },
            { href: '/guide/nvc', text: '2: NVC' },
            { href: '/guide/waiting', text: '3: Waiting for your interview letter' },
            { href: '/guide/interview-letter', text: '4: Interview letter received' },
            { href: '/guide/medical', text: '5: Medical' },
            { href: '/guide/interview', text: '6: Interview' },
            { href: '/guide/after-interview', text: '7: After the interview' },
            { href: '/guide/before-you-leave', text: '8: Before you leave the UK' },
            { href: '/guide/us-entry', text: '9: US entry' },
            { href: '/life', text: 'Life in the USA →' },
          ],
        },
        {
          heading: 'Related',
          links: [
            { href: '/interview', text: 'Interview: start here' },
            { href: '/interview/221g', text: 'Avoiding a 221(g)' },
            { href: '/tools', text: 'Tools' },
            { href: '/glossary', text: 'Glossary' },
            { href: '/about#resources', text: 'Official resources' },
          ],
        },
      ],
    },
    naturalization: {
      label: 'Naturalization',
      groups: [
        {
          links: [
            { href: '/naturalization', text: 'Naturalization overview' },
          ],
        },
        {
          heading: 'Steps',
          links: [
            { href: '/naturalization/paths', text: 'Start: Which path are you on?' },
            { href: '/naturalization/eligibility', text: '1: Check if you can apply' },
            { href: '/naturalization/good-moral-character', text: '2: Good moral character' },
            { href: '/naturalization/file-n400', text: '3: Fill in and file Form N-400' },
            { href: '/naturalization/biometrics', text: '4: Biometrics' },
            { href: '/naturalization/test', text: '5: English and civics test' },
            { href: '/naturalization/english-test', text: 'English test practice', sub: true },
            { href: '/naturalization/interview', text: '6: Interview' },
            { href: '/naturalization/oath', text: '7: Oath ceremony' },
            { href: '/naturalization/after-citizenship', text: '8: After you become a citizen' },
          ],
        },
        {
          heading: 'Tools and help',
          links: [
            { href: '/naturalization/when-can-i-apply', text: 'When can I apply? (calculator)' },
            { href: '/naturalization/delays-and-denials', text: 'Delays, denials and your options' },
            { href: '/naturalization/checklist', text: 'N-400 preparation list' },
            { href: '/naturalization/test#flashcards', text: 'Civics flashcards' },
          ],
        },
      ],
    },
    // Same groups, order and names as the Tools page (/tools), so a tool page
    // shows the other tools for its stage. Tools that live in another section
    // (interview, public charge, naturalization) are listed here too.
    tools: {
      label: 'Tools',
      groups: [
        {
          links: [
            { href: '/tools', text: 'All tools, by stage' },
          ],
        },
        {
          heading: 'Every stage',
          links: [
            { href: '/tools/master-checklist', text: 'Master Checklist' },
            { href: '/tools/workbook', text: 'Master workbook' },
          ],
        },
        {
          heading: 'Stage 1: I-130',
          links: [
            { href: '/tools/checklist-i130', text: 'I-130 Pre-Submission Checklist' },
            { href: '/tools/relationship-evidence', text: 'Relationship Evidence Template' },
          ],
        },
        {
          heading: 'Stage 1: Evidence examples',
          links: [
            { group: 'Spouses' },
            { href: '/tools/relationship-evidence/example', text: 'Spouse of a US citizen (CR1, IR1)', sub: true },
            { href: '/tools/relationship-evidence/permanent-resident-spouse-example', text: 'Spouse of a permanent resident (F2A)', sub: true },
            { group: 'Children' },
            { href: '/tools/relationship-evidence/parent-child-example', text: 'Child of unmarried parents', sub: true },
            { href: '/tools/relationship-evidence/stepchild-example', text: 'Stepchild', sub: true },
            { href: '/tools/relationship-evidence/adopted-child-example', text: 'Adopted child', sub: true },
            { href: '/tools/relationship-evidence/unmarried-son-daughter-example', text: 'Unmarried son or daughter (F1)', sub: true },
            { href: '/tools/relationship-evidence/married-son-daughter-example', text: 'Married son or daughter (F3)', sub: true },
            { group: 'Parents and siblings' },
            { href: '/tools/relationship-evidence/parent-example', text: 'Parent (IR5)', sub: true },
            { href: '/tools/relationship-evidence/sibling-example', text: 'Brother or sister (F4)', sub: true },
          ],
        },
        {
          heading: 'Stage 2: NVC',
          links: [
            { href: '/tools/checklist-nvc', text: 'NVC Document Checklist' },
            { href: '/tools/i864-household', text: 'I-864 Household Decision Tree' },
            { href: '/tools/worksheet-i864', text: 'I-864 Affidavit of Support Worksheet' },
            { href: '/tools/worksheet-ds260', text: 'DS-260 Preparation Worksheet' },
          ],
        },
        {
          heading: 'Stage 5: Medical',
          links: [
            { href: '/tools/checklist-medical', text: 'Medical Day Checklist' },
          ],
        },
        {
          heading: 'Stage 6: Interview',
          links: [
            { href: '/tools/checklist-binder', text: 'Interview Binder Layout' },
            { href: '/tools/checklist-interview', text: 'Interview Day Checklist' },
            { href: '/interview/day-sheet', text: 'Interview-day sheet' },
            { href: '/public-charge/statement', text: 'Public charge statement builder' },
            { href: '/interview/questions', text: 'Interview Question Bank' },
            { href: '/interview/dates', text: 'Interview date checker' },
            { href: '/interview/templates', text: 'Interview email templates' },
          ],
        },
        {
          heading: 'Stage 7: After the interview',
          links: [
            { href: '/interview/221g/green-sheet', text: 'Green sheet triage' },
            { href: '/interview/221g/history-worksheet', text: '15-year history worksheet' },
          ],
        },
        {
          heading: 'Naturalization',
          links: [
            { href: '/naturalization/checklist', text: 'N-400 preparation list' },
            { href: '/naturalization/test#flashcards', text: 'Civics flashcards' },
            { href: '/naturalization/english-test', text: 'English test practice' },
          ],
        },
      ],
    },
    'public-charge': {
      label: 'Public charge',
      groups: [
        {
          links: [
            { href: '/public-charge', text: 'Overview: what you must prove' },
            { href: '/public-charge/statement', text: 'Statement builder' },
          ],
        },
        {
          heading: 'Prepare',
          links: [
            { href: '/public-charge/evidence', text: 'The evidence pack' },
            { href: '/public-charge/questions', text: 'Questions to rehearse' },
            { href: '/public-charge/sponsors', text: 'Sponsors and the I-864' },
            { href: '/public-charge/children-and-parents', text: 'Children and parents (IR2, IR5)' },
            { href: '/public-charge/template', text: 'Statement template' },
          ],
        },
        {
          heading: 'After, and background',
          links: [
            { href: '/public-charge/refused', text: 'If refused under 212(a)(4)' },
            { href: '/public-charge/sources', text: 'What is confirmed, and sources' },
          ],
        },
        {
          heading: 'Where it fits',
          links: [
            { href: '/guide/nvc', text: 'Stage 2: NVC (the I-864)' },
            { href: '/guide/interview', text: 'Stage 6: Embassy interview' },
            { href: '/interview', text: 'Interview: start here' },
          ],
        },
      ],
    },
    interview: {
      label: 'Interview',
      groups: [
        {
          links: [
            { href: '/interview', text: 'Start here: your situation' },
          ],
        },
        {
          heading: 'Prepare',
          links: [
            { href: '/guide/interview', text: 'Stage 6: Embassy interview' },
            { href: '/public-charge', text: 'Public charge' },
            { href: '/public-charge/statement', text: 'Statement builder', sub: true },
            { href: '/interview/questions', text: 'Question bank' },
            { href: '/tools/checklist-interview', text: 'Interview day checklist' },
            { href: '/interview/day-sheet', text: 'Interview-day sheet' },
            { href: '/interview/dates', text: 'Date checker' },
            { href: '/interview/templates', text: 'Email templates' },
          ],
        },
        {
          heading: '221(g) and called back',
          links: [
            { href: '/interview/221g', text: '221(g): prevent and resolve' },
            { href: '/interview/221g/green-sheet', text: 'Green sheet triage', sub: true },
            { href: '/interview/221g/administrative-processing', text: 'Administrative processing', sub: true },
            { href: '/interview/221g/history-worksheet', text: '15-year history worksheet', sub: true },
            { href: '/interview/221g/domicile', text: 'Petitioner domicile', sub: true },
            { href: '/interview/reinterview', text: 'Called back: re-interview' },
          ],
        },
        {
          heading: 'After the interview',
          links: [
            { href: '/guide/after-interview', text: 'Stage 7: After the interview' },
            { href: '/interview/visa-pause', text: 'Visa pause ruling' },
          ],
        },
      ],
    },
  };

  // Node (tests): hand over the lists and stop before touching the DOM.
  if (typeof document === 'undefined') {
    if (typeof module !== 'undefined' && module.exports) module.exports = { SECTIONS };
    return;
  }

  const script = document.currentScript;
  const key = script && script.dataset.section;

  function clean(path) {
    return path.replace(/\.html$/, '').replace(/\/+$/, '') || '/';
  }

  function listHTML(section, here) {
    return section.groups.map(function (group) {
      const items = group.links.map(function (link) {
        if (link.group) return '<li class="snav-group">' + link.group + '</li>';
        const current = clean(link.href) === here ? ' aria-current="page"' : '';
        const cls = link.sub ? ' class="snav-sub"' : '';
        return '<li' + cls + '><a href="' + link.href + '"' + current + '>' + link.text + '</a></li>';
      }).join('');
      const heading = group.heading
        ? '<p class="snav-heading">' + group.heading + '</p>'
        : '';
      return heading + '<ul class="snav-list" role="list">' + items + '</ul>';
    }).join('');
  }

  function mount() {
    const section = SECTIONS[key];
    if (!section) return;
    if (document.querySelector('.snav-rail')) return;

    const here = clean(window.location.pathname);
    const list = listHTML(section, here);
    const label = section.label;

    // Wide screens: fixed rail
    const rail = document.createElement('nav');
    rail.className = 'snav-rail';
    rail.setAttribute('aria-label', label + ' section');
    rail.innerHTML = '<p class="snav-label">' + label + '</p>' + list;
    document.body.appendChild(rail);
    document.body.classList.add('has-snav');

    // On short screens the rail scrolls; start it with the current page in
    // view. Only the rail scrolls, never the page.
    const current = rail.querySelector('[aria-current="page"]');
    if (current && rail.scrollHeight > rail.clientHeight) {
      rail.scrollTop = current.offsetTop - rail.clientHeight / 2;
    }

    // Narrower screens: fold-out under the breadcrumb (and its "Part of" line)
    const main = document.querySelector('main');
    if (!main) return;
    const fold = document.createElement('details');
    fold.className = 'snav-fold';
    fold.innerHTML =
      '<summary><span>In this section: <strong>' + label + '</strong></span></summary>' +
      '<nav aria-label="' + label + ' section">' + list + '</nav>';

    let anchor = main.querySelector('.avg-crumbs');
    if (anchor && anchor.nextElementSibling &&
        anchor.nextElementSibling.classList.contains('avg-partof')) {
      anchor = anchor.nextElementSibling;
    }
    if (anchor) {
      anchor.insertAdjacentElement('afterend', fold);
    } else {
      main.insertBefore(fold, main.firstChild);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
