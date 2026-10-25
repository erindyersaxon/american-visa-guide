// Robust statistics shared by /api/data: the signature intervals and the
// per-phase list. ES module; the leading underscore keeps Vercel from
// deploying this file as an endpoint.
// Spec: docs/superpowers/specs/2026-10-25-data-phase-cards-design.md

// Robust summary for the signature intervals: median, IQR and p90, plus the
// NCHS-derived display flags (suppress the statistic below n=10, warn below
// n=30). Percentiles use linear interpolation, matching Postgres
// percentile_cont. Means are deliberately not exposed here. The interval
// distributions are right-skewed and a mean is dragged by the long tail.
export const robustStats = (arr) => {
  const valid = arr.filter(n => n !== null && n > 0).sort((a, b) => a - b)
  const n = valid.length
  if (!n) return { n: 0, median: null, p25: null, p75: null, p90: null,
                   min: null, max: null, suppressed: true, small_sample: true }
  const q = (p) => {
    const idx = (n - 1) * p, lo = Math.floor(idx), hi = Math.ceil(idx)
    return Math.round(valid[lo] + (valid[hi] - valid[lo]) * (idx - lo))
  }
  return { n, median: q(0.5), p25: q(0.25), p75: q(0.75), p90: q(0.9),
           min: valid[0], max: valid[n - 1],
           suppressed: n < 10, small_sample: n < 30 }
}

// Headline interval over a rolling window, cohorted by milestone date rather
// than by record insertion. Starts at 180 days and widens automatically until
// the completed count clears the stability floor; window_days reports the
// width actually used so the UI can surface it.
const FLOOR = 30
export const rollingWindow = (rows, cohortField, valueFn, filterFn, now) => {
  for (const days of [180, 270, 365, 545, 730, Infinity]) {
    const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - days)
    const vals = rows
      .filter(r => filterFn(r) && r[cohortField] &&
        (days === Infinity || new Date(r[cohortField]) >= cutoff))
      .map(valueFn).filter(v => v !== null && v > 0)
    if (vals.length >= FLOOR || days === Infinity)
      return { ...robustStats(vals), window_days: days === Infinity ? null : days }
  }
}

// Wait times by phase, in display order (spec §3). Phases whose numbers the
// signature intervals already publish copy them, so a card and a headline
// stat can never disagree. Caps drop impossible gaps (data-entry errors).
export const GROUPS = [
  { key: 'nvc', label: 'NVC' },
  { key: 'waiting', label: 'Waiting for your interview' },
  { key: 'interview', label: 'Interview stage' },
  { key: 'after', label: 'After the interview' },
]

export const PHASES = [
  { key: 'approval_to_welcome', group: 'nvc', label: 'I-130 approval → NVC welcome letter', from: 'i130_approval', to: 'nvc_welcome_letter', rows: 'deduped', cap: 90 },
  { key: 'welcome_to_fees', group: 'nvc', label: 'Welcome letter → fees paid', from: 'nvc_welcome_letter', to: 'nvc_fees_paid', rows: 'deduped', cap: 90 },
  { key: 'fees_to_docs', group: 'nvc', label: 'Fees paid → documents submitted', from: 'nvc_fees_paid', to: 'nvc_docs_submitted', rows: 'deduped', cap: 180 },
  { key: 'docs_to_dq', group: 'nvc', label: 'Documents submitted → DQ', from: 'nvc_docs_submitted', to: 'dq_date', rows: 'deduped', cap: 180 },
  { key: 'dq_to_il', group: 'waiting', label: 'DQ → interview letter', source: 'intervals' },
  { key: 'il_to_interview', group: 'waiting', label: 'Interview letter → interview', source: 'intervals' },
  { key: 'il_to_medical', group: 'interview', label: 'Interview letter → medical', from: 'interview_letter', to: 'medical', rows: 'standard', cap: 180 },
  // to the member's current interview: after a reschedule, `interview` keeps the cancelled date
  { key: 'medical_to_interview', group: 'interview', label: 'Medical → interview', from: 'medical', to: 'next_interview', rows: 'standard', cap: 60 },
  { key: 'interview_to_passport', group: 'after', label: 'Interview → passport back', source: 'intervals' },
]

const FIELDS = ['median', 'p25', 'p75', 'n', 'window_days', 'suppressed', 'small_sample']

// Milestones in process order. A member who has recorded any milestone after a
// step's end has moved on, even if they skipped filling in that end date.
const MILESTONES = ['i130_approval', 'nvc_welcome_letter', 'nvc_fees_paid', 'nvc_docs_submitted',
  'dq_date', 'interview_letter', 'medical', 'next_interview', 'passport_in_hand']

// Members whose step started inside the window used but who haven't reached its end
// or anything after it: the counted medians only see finished cases, so readers need
// to see who is still waiting.
const stillWaiting = (rows, from, to, windowDays, now) => {
  const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - (windowDays ?? Infinity))
  const later = MILESTONES.slice(MILESTONES.indexOf(to) + 1)
  return rows.filter(r => r[from] && !r[to] && !later.some(f => r[f]) &&
    (windowDays == null || new Date(r[from]) >= cutoff)).length
}

export const buildPhases = ({ deduped, standard, intervals }, { now = new Date(), daysBetween }) =>
  PHASES.map(ph => {
    let stats, waiting = null
    if (ph.source === 'intervals') {
      stats = intervals[ph.key]
      // a labelled count (e.g. 'passport not reported') isn't about waiting: leave it out
      waiting = stats && !stats.censored_label ? stats.censored ?? null : null
    } else {
      const rows = ph.rows === 'standard' ? standard : deduped
      const gap = r => daysBetween(r[ph.from], r[ph.to])
      const valid = r => {
        if (!r[ph.from] || !r[ph.to]) return false
        const d = gap(r)
        return d !== null && d > 0 && (ph.cap === null || d <= ph.cap)
      }
      stats = rollingWindow(rows, ph.from, gap, valid, now)
      waiting = stillWaiting(rows, ph.from, ph.to, stats.window_days, now)
    }
    const out = { key: ph.key, group: ph.group, label: ph.label }
    for (const f of FIELDS) out[f] = stats ? stats[f] : null
    out.still_waiting = waiting
    return out
  })
