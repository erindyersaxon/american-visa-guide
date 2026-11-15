/*
   Is a Reddit post about immigrant visa movement at US Embassy London?
   Shared by research.mjs (at fetch time) and digest.mjs (re-checked on
   saved runs, so tightening this also cleans older output).
*/

// Must place itself in London / the UK.
const LONDON_RE = /\b(london|nine elms|uk|united kingdom|britain|british|belfast)\b/i;

// Must be about the immigrant visa process. Bare "reschedule" is too loose
// (concerts get rescheduled too), so it only counts next to "interview".
const IV_RE = new RegExp(
  [
    'immigrant visa', 'immigrant/fianc', '\\bIVs?\\b', 'fianc[eé]e? visa', 'IR-?[125]', 'CR-?1', 'K-?1', 'F2[AB]', 'F[34]\\b', 'DV-?20\\d\\d', 'diversity visa',
    'EB-?[2-5]\\b', 'NVC', '\\bDQ\\b', 'DS-?260', 'DCF', 'interview letter', '\\bIL\\b',
    '221\\s?\\(?g\\)?', 'administrative processing', '\\bAP\\b', 'public charge', '212\\s?\\(?a\\)?\\s?\\(?4',
    '(reschedul\\w*|cancel+ed|moved) (my |our |his |her |the )?interview', 'interview (was |been )?(reschedul|cancel|moved)',
  ].join('|'),
  'i',
);

// Never in scope: non-immigrant US visas, UK visas, planning questions.
const EXCLUDE_RE = /\b(F-1 (visa|student)|F-1 administrative|student visa|standard visitor|UKVI|B1\/B2|ESTA|tourist visa|EB-?1C)\b|^F-1\b/i;
const EXCLUDE_SUBS = new Set(['ukvisa', 'interpol']);

/** @param {{title: string, selftext: string, subreddit?: string}} post */
export function isLondonIV(post) {
  if (EXCLUDE_SUBS.has((post.subreddit ?? '').toLowerCase())) return false;
  const text = `${post.title}\n${post.selftext}`;
  if (EXCLUDE_RE.test(text)) return false;
  return LONDON_RE.test(text) && IV_RE.test(text);
}
