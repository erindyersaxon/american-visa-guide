/*
   News sources for the collector (scripts/news/collect.mjs).

   Each source is fetched once per run. `kind` picks the parser:
     'rss'  any RSS 2.0 feed
     'fr'   the Federal Register API (JSON)

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
