/*
   News sources for the collector (scripts/news/collect.mjs).

   Each source is fetched once per run. `kind` picks the parser:
     'rss'   any RSS 2.0 feed
     'fr'    the Federal Register API (JSON)
     'atom'  an Atom feed (CourtListener docket feeds)

   `type` is the label readers see on the news page:
     'official'  a US government source
     'press'     a news outlet (via Google News)

   `label` is the source name readers see (press items show the outlet
   instead).

   `needs` says how strict the keyword filter is for this source
   (see filter.mjs):
     'visa'           the item must mention a visa topic
     'visa+london'    the item must mention a visa topic AND London/UK
                      (for broad sources, such as general news searches)
     'docket'         a court docket entry: keep orders, opinions, motions,
                      letters, status reports and hearings; drop lawyers'
                      appearances and other housekeeping (see filter.mjs)

   Docket sources also carry `case`, the short case name put in front of
   each entry's description to make its title, and `since`: entries filed
   before it are ignored (everything up to then is already on /news).
*/

const fr = (params) =>
  'https://www.federalregister.gov/api/v1/documents.json?' +
  new URLSearchParams([
    ['per_page', '20'],
    ['order', 'newest'],
    ['fields[]', 'title'],
    ['fields[]', 'abstract'],
    ['fields[]', 'html_url'],
    ['fields[]', 'publication_date'],
    ['fields[]', 'document_number'],
    ['fields[]', 'type'],
    ...params,
  ]).toString();

// CourtListener publishes an Atom feed of new entries for every docket.
const docket = (id) => `https://www.courtlistener.com/docket/${id}/feed/`;

const gnews = (q) =>
  'https://news.google.com/rss/search?' +
  new URLSearchParams({ q: `${q} when:14d`, hl: 'en-GB', gl: 'GB', ceid: 'GB:en' }).toString();

export const SOURCES = [
  {
    id: 'embassy-london',
    name: 'US Embassy London',
    label: 'US Embassy London',
    kind: 'rss',
    type: 'official',
    needs: 'visa',
    url: 'https://uk.usembassy.gov/feed/',
  },
  {
    id: 'fr-state',
    name: 'Federal Register: State Department',
    label: 'Federal Register',
    kind: 'fr',
    type: 'official',
    needs: 'visa',
    url: fr([['conditions[agencies][]', 'state-department'], ['conditions[term]', 'visa']]),
  },
  {
    id: 'fr-uscis',
    name: 'Federal Register: USCIS',
    label: 'Federal Register',
    kind: 'fr',
    type: 'official',
    needs: 'visa',
    url: fr([
      ['conditions[agencies][]', 'u-s-citizenship-and-immigration-services'],
      ['conditions[term]', '"public charge" | "affidavit of support" | "immigrant visa" | fee | "I-130" | "I-864" | "I-551" | "I-90" | "I-751" | "N-400"'],
    ]),
  },
  {
    id: 'uscis-news',
    name: 'USCIS news releases',
    label: 'USCIS',
    kind: 'rss',
    type: 'official',
    needs: 'visa',
    url: 'https://www.uscis.gov/news/rss-feed/59144',
  },
  {
    id: 'state-press',
    name: 'State Department press releases',
    label: 'State Department',
    kind: 'rss',
    type: 'official',
    needs: 'visa',
    url: 'https://www.state.gov/rss-feed/press-releases/feed/',
  },
  // Court cases behind the immigrant visa pause and its rescission. Add a
  // docket here when a new case starts to matter to London applicants.
  // (Medani v. Trump, N.D. Cal., was dropped: it is a diversity visa case,
  // cited on /news only because the government filed cables there.)
  {
    id: 'docket-clinic-sdny',
    name: 'Court docket: CLINIC v. Rubio (S.D.N.Y.)',
    label: 'CLINIC v. Rubio (S.D.N.Y.)',
    case: 'CLINIC v. Rubio',
    kind: 'atom',
    type: 'official',
    needs: 'docket',
    since: '2026-10-24',
    url: docket(72218277),
  },
  {
    id: 'docket-clinic-ca2',
    name: 'Court docket: CLINIC v. Rubio (2d Cir.)',
    label: 'CLINIC v. Rubio (2d Cir.)',
    case: 'CLINIC v. Rubio appeal',
    kind: 'atom',
    type: 'official',
    needs: 'docket',
    since: '2026-10-24',
    url: docket(74793181),
  },
  {
    id: 'gnews-embassy',
    name: 'Google News: US Embassy London',
    kind: 'rss',
    type: 'press',
    needs: 'visa',
    url: gnews('"US Embassy London" OR "American Embassy London" visa'),
  },
  {
    id: 'gnews-family',
    name: 'Google News: family visas',
    kind: 'rss',
    type: 'press',
    needs: 'visa+london',
    url: gnews('"immigrant visa" OR "spouse visa" OR "National Visa Center" OR "visa bulletin" OR "public charge"'),
  },
];
