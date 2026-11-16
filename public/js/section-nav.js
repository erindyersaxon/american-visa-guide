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
     link under the one before it ("only if this applies"). */
  const SECTIONS = {
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

  const script = document.currentScript;
  const key = script && script.dataset.section;

  function clean(path) {
    return path.replace(/\.html$/, '').replace(/\/+$/, '') || '/';
  }

  function listHTML(section, here) {
    return section.groups.map(function (group) {
      const items = group.links.map(function (link) {
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
