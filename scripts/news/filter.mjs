/*
   Keyword filter for the news collector.

   An item is scored on its title + summary. Each matching term adds its
   weight once. An item is queued for review when:
     - it is not excluded, and
     - its score reaches MIN_SCORE, and
     - for sources marked needs: 'visa+london', it also mentions London/UK.

   Tune the lists here. A term is matched case-insensitively on word
   boundaries, so 'IR1' will not match 'FIR1'.
*/

export const MIN_SCORE = 3;

// Family immigrant visa topics. 3 = enough on its own; 1-2 = needs company.
export const TERMS = {
  'immigrant visa': 3,
  'immigrant visas': 3,
  'spouse visa': 3,
  'family-based': 3,
  'family based': 3,
  'IR1': 3, 'CR1': 3, 'IR2': 3, 'IR5': 3, 'K-1': 3, 'K1 visa': 3,
  'National Visa Center': 3,
  'NVC': 3,
  'visa bulletin': 3,
  'public charge': 3,
  'affidavit of support': 3,
  'I-130': 3, 'I-864': 3, 'DS-260': 3, 'DS-864': 3,
  '221(g)': 3,
  'administrative processing': 3,
  'visa pause': 3,
  'consular': 2,
  'visa interview': 2,
  'interview waiver': 2,
  'visa appointment': 2,
  'visa fee': 2,
  'fee': 2,
  'fees': 2,
  'visa bond': 3,
  'government benefits': 2,
  'immigration': 1,
  'green card': 1,
  'visa': 1,
  'visas': 1,
};

// Where the item must also be London/UK-specific (needs: 'visa+london').
export const LONDON_TERMS = [
  'London', 'United Kingdom', 'UK', 'Britain', 'British', 'Belfast', 'Nine Elms',
];

// Never queue items whose title matches these. Checked on the title only,
// so a visa article that mentions a student in passing still gets through.
export const EXCLUDE = [
  'Demonstration Alert',
  'Security Alert',
  'Weather Alert',
  'Privacy Act of 1974',
  'student visa', 'F-1', 'J-1', 'H-1B', 'H-2A', 'H-2B', 'L-1', 'O-1',
  'E-2 visa', 'EB-1', 'EB-2', 'EB-3', 'EB-5', 'golden visa', 'gold card', 'ESTA',
  'Sunshine Act',
];

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const re = (term) => new RegExp(`(?<![\\w-])${esc(term)}(?![\\w-])`, 'i');

const TERM_RES = Object.entries(TERMS).map(([t, w]) => [t, w, re(t)]);
const LONDON_RES = LONDON_TERMS.map(re);
const EXCLUDE_RES = EXCLUDE.map((t) => [t, re(t)]);

/**
 * @param {{title: string, summary: string}} item
 * @param {{needs: 'visa' | 'visa+london'}} source
 * @returns {{keep: boolean, score: number, matched: string[], reason?: string}}
 */
export function judge(item, source) {
  const text = `${item.title}\n${item.summary}`;

  const excluded = EXCLUDE_RES.find(([, r]) => r.test(item.title));
  if (excluded) return { keep: false, score: 0, matched: [], reason: `excluded: ${excluded[0]}` };

  const matched = TERM_RES.filter(([, , r]) => r.test(text));
  const score = matched.reduce((sum, [, w]) => sum + w, 0);
  const terms = matched.map(([t]) => t);

  if (score < MIN_SCORE) return { keep: false, score, matched: terms, reason: 'low score' };
  if (source.needs === 'visa+london' && !LONDON_RES.some((r) => r.test(text))) {
    return { keep: false, score, matched: terms, reason: 'not London/UK' };
  }
  return { keep: true, score, matched: terms };
}
