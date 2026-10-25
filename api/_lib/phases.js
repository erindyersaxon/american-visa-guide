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
