export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Fetch all relevant rows - only London embassy
  const url = `${SUPABASE_URL}/rest/v1/form_responses?embassy=eq.London%2C%20United%20Kingdom&select=*&order=submitted_at.desc`

  const response = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    const error = await response.text()
    return res.status(500).json({ error })
  }

  const rows = await response.json()

  // --- Helper functions ---
  const daysBetween = (a, b) => {
    if (!a || !b) return null
    const diff = new Date(b) - new Date(a)
    return Math.round(diff / (1000 * 60 * 60 * 24))
  }

  const avg = (arr) => {
    const valid = arr.filter(n => n !== null && n > 0)
    if (!valid.length) return null
    return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length)
  }

  const median = (arr) => {
    const valid = arr.filter(n => n !== null && n > 0).sort((a, b) => a - b)
    if (!valid.length) return null
    const mid = Math.floor(valid.length / 2)
    return valid.length % 2 ? valid[mid] : Math.round((valid[mid - 1] + valid[mid]) / 2)
  }

  const statsFromArray = (arr) => {
    const valid = arr.filter(n => n !== null && n > 0).sort((a, b) => a - b)
    if (!valid.length) return null
    const med = valid.length % 2 === 0
      ? Math.round((valid[valid.length/2-1] + valid[valid.length/2]) / 2)
      : valid[Math.floor(valid.length/2)]
    return {
      avg: avg(valid),
      median: med,
      min: valid[0],
      max: valid[valid.length-1],
      n: valid.length
    }
  }

  // Deduplicate by username_raw - keep latest submitted_at per user
  const byUser = {}
  for (const row of rows) {
    const key = (row.username_raw || '').trim().toLowerCase()
    if (!key) continue
    if (!byUser[key] || new Date(row.submitted_at) > new Date(byUser[key].submitted_at)) {
      byUser[key] = row
    }
  }
  const deduped = Object.values(byUser)

  // Drop impossible future dates on past-only milestones — data-entry errors
  // (e.g. an Interview Letter dated next year) otherwise poison the averages.
  // Appointment fields (interview / medical / flight) are intentionally left
  // alone, since those are legitimately future-dated for upcoming events.
  const todayEnd = new Date(); todayEnd.setUTCHours(23, 59, 59, 999)
  const PAST_ONLY = ['dq_date', 'interview_letter', 'i130_approval', 'sent_to_dos',
    'nvc_welcome_letter', 'nvc_fees_paid', 'nvc_docs_submitted', 'passport_in_hand']
  for (const r of deduped) {
    for (const f of PAST_ONLY) {
      if (r[f] && new Date(r[f]) > todayEnd) r[f] = null
    }
  }

  // Standard cases only (exclude expedited for wait time calcs)
  const standard = deduped.filter(r => !r.interview_expedited)

  // --- Compute wait times ---
  const dqToIL = standard
    .filter(r => r.dq_date && r.interview_letter)
    .map(r => daysBetween(r.dq_date, r.interview_letter))

  const ilToInterview = standard
    .filter(r => r.interview_letter && r.interview)
    .map(r => daysBetween(r.interview_letter, r.interview))

  const dqToInterview = standard
    .filter(r => r.dq_date && r.interview)
    .map(r => daysBetween(r.dq_date, r.interview))

  const passportDays = deduped
    .filter(r => r.interview && r.passport_in_hand && r.interview_outcome === 'Approved')
    .map(r => daysBetween(r.interview, r.passport_in_hand))

  // --- Interview outcomes ---
  const withOutcome = deduped.filter(r => r.interview_outcome)
  // Outcome strings vary ("221g", "221(g)/Administrative Processing (AP)"),
  // so strip punctuation before matching 221g.
  const is221gOutcome = (r) => {
    const o = r.interview_outcome?.toLowerCase() || ''
    return o.replace(/[^a-z0-9]/g, '').includes('221g') ||
      o.includes('not approved') || o.includes('administrative processing')
  }
  const approved = withOutcome.filter(r =>
    r.interview_outcome?.toLowerCase() === 'approved'
  ).length
  const cleared = withOutcome.filter(r => {
    const res = r.resolution_outcome?.toLowerCase() || ''
    return is221gOutcome(r) && (res.includes('cleared') || res.includes('approved'))
  }).length
  const notApproved = withOutcome.filter(r => {
    const o = r.interview_outcome?.toLowerCase() || ''
    const res = r.resolution_outcome?.toLowerCase() || ''
    if (res.includes('cleared') || res.includes('approved')) return false
    const notes = r.notes?.toLowerCase() || ''
    if (notes.includes('visa pause')) return false
    if (o === 'denied' || res === 'denied') return false
    return is221gOutcome(r)
  }).length
  const visaPause = withOutcome.filter(r => {
    const o = r.interview_outcome?.toLowerCase() || ''
    const notes = r.notes?.toLowerCase() || ''
    const res = r.resolution_outcome?.toLowerCase() || ''
    return (notes.includes('visa pause') || o.includes('visa pause')) && !res.includes('cleared')
  }).length
  const denied = withOutcome.filter(r => {
    const o = r.interview_outcome?.toLowerCase() || ''
    const res = r.resolution_outcome?.toLowerCase() || ''
    return o === 'denied' || res === 'denied'
  }).length

  // --- Passport by method ---
  const pickupDays = deduped
    .filter(r => {
      if (!r.interview || !r.passport_in_hand) return false
      const m = (r.passport_delivery_method || '').toLowerCase().trim()
      return m.startsWith('pick')
    })
    .map(r => daysBetween(r.interview, r.passport_in_hand))

  const mailDays = deduped
    .filter(r => {
      if (!r.interview || !r.passport_in_hand) return false
      const m = (r.passport_delivery_method || '').toLowerCase().trim()
      return m === 'mail' || m === 'delivery'
    })
    .map(r => daysBetween(r.interview, r.passport_in_hand))

  // --- Stage counts ---
  const counts = {
    i130_approval:      deduped.filter(r => r.i130_approval).length,
    sent_to_dos:        deduped.filter(r => r.sent_to_dos).length,
    nvc_welcome_letter: deduped.filter(r => r.nvc_welcome_letter).length,
    nvc_fees_paid:      deduped.filter(r => r.nvc_fees_paid).length,
    nvc_docs_submitted: deduped.filter(r => r.nvc_docs_submitted).length,
    dq:                 deduped.filter(r => r.dq_date).length,
    interview_letter:   deduped.filter(r => r.interview_letter).length,
    medical:            deduped.filter(r => r.medical).length,
    interview:          deduped.filter(r => r.interview).length,
    passport_in_hand:   deduped.filter(r => r.passport_in_hand).length,
  }

  // --- Stage averages (days between stages) ---
  const stageAvg = (rows, f1, f2, maxDays) => {
    const vals = rows
      .filter(r => r[f1] && r[f2])
      .map(r => daysBetween(r[f1], r[f2]))
      .filter(v => v !== null && v > 0 && v <= maxDays)
    return avg(vals)
  }
  const stageStats = (rows, f1, f2, maxDays) => {
    const vals = rows
      .filter(r => r[f1] && r[f2])
      .map(r => daysBetween(r[f1], r[f2]))
      .filter(v => v !== null && v > 0 && v <= maxDays)
      .sort((a, b) => a - b)
    if (!vals.length) return null
    const median = vals.length % 2 === 0
      ? Math.round((vals[vals.length/2-1] + vals[vals.length/2]) / 2)
      : vals[Math.floor(vals.length/2)]
    return {
      avg: avg(vals),
      median,
      min: vals[0],
      max: vals[vals.length-1],
      n: vals.length
    }
  }

  const stageAvgs = {
    pd_to_approval:            stageAvg(deduped, 'i130_priority_date', 'i130_approval', 730),
    pd_to_approval_med:        stageStats(deduped, 'i130_priority_date', 'i130_approval', 730),
    approval_to_welcome:       stageAvg(deduped, 'i130_approval', 'nvc_welcome_letter', 90),
    approval_to_welcome_med:   stageStats(deduped, 'i130_approval', 'nvc_welcome_letter', 90),
    welcome_to_fees:           stageAvg(deduped, 'nvc_welcome_letter', 'nvc_fees_paid', 90),
    welcome_to_fees_med:       stageStats(deduped, 'nvc_welcome_letter', 'nvc_fees_paid', 90),
    fees_to_docs:              stageAvg(deduped, 'nvc_fees_paid', 'nvc_docs_submitted', 180),
    fees_to_docs_med:          stageStats(deduped, 'nvc_fees_paid', 'nvc_docs_submitted', 180),
    docs_to_dq:                stageAvg(deduped, 'nvc_docs_submitted', 'dq_date', 180),
    docs_to_dq_med:            stageStats(deduped, 'nvc_docs_submitted', 'dq_date', 180),
    approval_to_dq:            stageAvg(deduped, 'i130_approval', 'dq_date', 120),
    approval_to_dq_stats:      stageStats(deduped, 'i130_approval', 'dq_date', 120),
    il_to_medical:             stageAvg(standard, 'interview_letter', 'medical', 180),
    il_to_medical_med:         stageStats(standard, 'interview_letter', 'medical', 180),
    medical_to_interview:      stageAvg(standard, 'medical', 'interview', 60),
    medical_to_interview_med:  stageStats(standard, 'medical', 'interview', 60),
    interview_to_passport:     stageAvg(deduped, 'interview', 'passport_in_hand', 60),
    interview_to_passport_med: stageStats(deduped, 'interview', 'passport_in_hand', 60),
  }

  // --- Entry airport distribution ---
  // entry_location is free text and arrives in several shapes:
  //   "Boston (BOS)", "Boston, MA (BOS)", '["Austin, TX (AUS)"]', "[]",
  //   "Dublin (pre-clearance)", "Dublin, Ireland (DUB); Cleveland, OH (CLE)",
  //   "Phoenix Sky Harbor, Arizona"
  // Normalise to a canonical "City (CODE)" label. Where multiple locations are
  // listed, the first is where entry was cleared — pre-clearance (Dublin,
  // Shannon, Montreal etc.) counts as the official port of entry.
  const AIRPORT_NAMES = {
    DUB: 'Dublin pre-clearance', SNN: 'Shannon pre-clearance', YUL: 'Montreal pre-clearance',
    ATL: 'Atlanta', AUS: 'Austin', BNA: 'Nashville', BOS: 'Boston', BWI: 'Baltimore',
    CLE: 'Cleveland', CLT: 'Charlotte', CVG: 'Cincinnati', DEN: 'Denver',
    DFW: 'Dallas/Fort Worth', DTW: 'Detroit', EWR: 'Newark', IAD: 'Washington Dulles',
    IAH: 'Houston', JFK: 'New York JFK', LAS: 'Las Vegas', LAX: 'Los Angeles',
    MCO: 'Orlando', MIA: 'Miami', MSP: 'Minneapolis', ORD: "Chicago O'Hare",
    PDX: 'Portland', PHL: 'Philadelphia', PHX: 'Phoenix', PIT: 'Pittsburgh',
    RDU: 'Raleigh-Durham', SAN: 'San Diego', SEA: 'Seattle', SFO: 'San Francisco',
    SJU: 'San Juan', SLC: 'Salt Lake City', STL: 'St Louis', TPA: 'Tampa',
  }
  // Fallbacks for entries with no IATA code in the text
  const AIRPORT_KEYWORDS = [
    ['dublin', 'DUB'], ['shannon', 'SNN'], ['montreal', 'YUL'],
    ['boston', 'BOS'], ['seattle', 'SEA'], ['phoenix', 'PHX'], ['atlanta', 'ATL'],
    ['los angeles', 'LAX'], ['chicago', 'ORD'], ['dulles', 'IAD'], ['newark', 'EWR'],
    ['jfk', 'JFK'], ['dallas', 'DFW'], ['denver', 'DEN'], ['orlando', 'MCO'],
    ['san juan', 'SJU'], ['austin', 'AUS'], ['philadelphia', 'PHL'], ['houston', 'IAH'],
    ['miami', 'MIA'], ['san francisco', 'SFO'],
  ]

  const normalizeEntryLocation = (raw) => {
    if (!raw) return null
    let s = String(raw).trim()
    // Some submissions arrive as a JSON array string
    if (s.startsWith('[')) {
      try {
        const arr = JSON.parse(s)
        s = Array.isArray(arr) ? String(arr[0] || '') : s
      } catch { /* keep raw string */ }
      s = s.trim()
    }
    if (!s) return null
    // Multiple locations: first one is where entry was cleared
    s = s.split(';')[0].trim()
    const codeMatch = s.toUpperCase().match(/\(([A-Z]{3})\)/)
    let code = codeMatch ? codeMatch[1] : null
    if (!code) {
      const lower = s.toLowerCase()
      for (const [kw, c] of AIRPORT_KEYWORDS) {
        if (lower.includes(kw)) { code = c; break }
      }
    }
    if (!code) return s // unrecognised — keep the raw text so it still counts
    return AIRPORT_NAMES[code] ? `${AIRPORT_NAMES[code]} (${code})` : code
  }

  const entryAirports = {}
  for (const r of deduped) {
    const label = normalizeEntryLocation(r.entry_location)
    if (label) entryAirports[label] = (entryAirports[label] || 0) + 1
  }

  // --- IL drop dates — derived from member interview_letter timestamps ---
  // Cluster members into drops: any ILs within 2 days of each other = same drop.
  // interview_letter is timestamptz so we have exact time of each drop from the data.
  const membersWithIL = standard
    .filter(r => r.interview_letter && r.dq_date)
    .sort((a, b) => new Date(a.interview_letter) - new Date(b.interview_letter))

  // Group into clusters: start a new cluster if gap from previous IL > 2 days
  const clusters = []
  for (const r of membersWithIL) {
    const ilTime = new Date(r.interview_letter).getTime()
    const last = clusters[clusters.length - 1]
    if (!last || ilTime - last.latestTime > 2 * 86400000) {
      clusters.push({ members: [r], latestTime: ilTime })
    } else {
      last.members.push(r)
      last.latestTime = Math.max(last.latestTime, ilTime)
    }
  }

  // For each cluster, derive date, time, DQ range, count.
  // clusters is oldest-first; reversed at end for newest-first API response.
  const clusterDates = clusters.map(c =>
    new Date(Math.min(...c.members.map(r => new Date(r.interview_letter)))).toISOString().split('T')[0]
  )

  // Observed UK drop times — community-sourced.
  // Historic imports stored date-only so timestamp defaults to midnight UTC;
  // these entries supply the correct displayed time for those drops.
  const observedTimes = {
    '2026-06-29': '15:02',
    '2026-05-29': '14:52',
    '2026-05-28': '14:52',
    '2026-04-17': '16:02',
    '2026-03-31': '15:16',
    '2026-03-04': '14:08',
    '2026-02-13': '13:51',
    '2026-01-15': '13:53',
    '2026-01-01': '13:59',
    '2025-12-11': '13:55',
    '2025-11-26': '15:03',
    '2025-11-11': '14:02',
    '2025-10-10': '15:03',
    '2025-09-11': '15:38',
    '2025-09-10': '15:03',
    '2025-08-11': '15:09',
    '2025-07-21': '15:00',
    '2025-06-06': '15:31',
  }

  const ilDropsAsc = clusters.map((cluster, i) => {
    const earliestIL = new Date(Math.min(...cluster.members.map(r => new Date(r.interview_letter))))
    const date = clusterDates[i]

    const time = observedTimes[date] || (() => {
      const month = earliestIL.getUTCMonth()
      const isBST = month >= 3 && month <= 9
      const ukHours = (earliestIL.getUTCHours() + (isBST ? 1 : 0)) % 24
      const ukMins = earliestIL.getUTCMinutes()
      return String(ukHours).padStart(2,'0') + ':' + String(ukMins).padStart(2,'0')
    })()

    // Gap = days since previous drop (previous entry in oldest-first order)
    const prevDate = i > 0 ? clusterDates[i - 1] : null
    const gap = prevDate ? daysBetween(prevDate, date) : null

    const dqDates = cluster.members
      .map(r => r.dq_date)
      .filter(Boolean)
      .sort()

    const dq_from  = dqDates.length ? dqDates[0] : null
    const dq_to    = dqDates.length ? dqDates[dqDates.length - 1] : null
    const dq_days  = (dq_from && dq_to) ? daysBetween(dq_from, dq_to) + 1 : null
    const il_count = cluster.members.length

    // Interview dates assigned in this drop's ILs (members report them after
    // scheduling, so recent drops may have fewer reported than il_count).
    // An interview can't predate its IL — such rows are data-entry errors
    // and would poison the min–max range.
    const ivDates = cluster.members
      .filter(r => r.interview && String(r.interview).slice(0, 10) > String(r.interview_letter).slice(0, 10))
      .map(r => String(r.interview).slice(0, 10))
      .sort()

    const iv_from  = ivDates.length ? ivDates[0] : null
    const iv_to    = ivDates.length ? ivDates[ivDates.length - 1] : null
    const iv_count = ivDates.length

    return { date, time, gap, dq_from, dq_to, dq_days, il_count, iv_from, iv_to, iv_count }
  })

  // Include all clusters with at least 1 member — the clustering logic (2-day
  // gap) already separates real drops from noise; a count threshold is not needed
  // and would hide new drops before all recipients have submitted.
  const ilDrops = ilDropsAsc.filter(d => d.il_count >= 1).slice().reverse() // newest first

  // --- IL to Interview month lookup (observed pattern) ---
  const ilToInterviewMonths = [
    { il_month: '2026-07', interview_month: '2026-09' },
    { il_month: '2026-06', interview_month: '2026-08' },
    { il_month: '2026-05', interview_month: '2026-07' },
    { il_month: '2026-04', interview_month: '2026-06' },
    { il_month: '2026-03-late', interview_month: '2026-05' },
    { il_month: '2026-03-early', interview_month: '2026-04' },
    { il_month: '2026-02', interview_month: '2026-04' },
    { il_month: '2026-01', interview_month: '2026-03' },
    { il_month: '2025-12', interview_month: '2026-02' },
    { il_month: '2025-11', interview_month: '2026-01' },
    { il_month: '2025-10', interview_month: '2025-12' },
    { il_month: '2025-09', interview_month: '2025-11' },
    { il_month: '2025-08', interview_month: '2025-10' },
    { il_month: '2025-07', interview_month: '2025-09' },
    { il_month: '2025-06', interview_month: '2025-08' },
    { il_month: '2025-05', interview_month: '2025-07' },
    { il_month: '2025-04', interview_month: '2025-06' },
    { il_month: '2025-03', interview_month: '2025-05' },
  ]

  // Latest DQ that has received an IL (standard cases only)
  const latestDQWithIL = standard
    .filter(r => r.dq_date && r.interview_letter)
    .sort((a, b) => new Date(b.dq_date) - new Date(a.dq_date))[0]?.dq_date || null

  // Latest scheduled interview
  const latestInterview = deduped
    .filter(r => r.interview)
    .sort((a, b) => new Date(b.interview) - new Date(a.interview))[0]?.interview || null

  // --- DQ backlog: members awaiting an Interview Letter ---
  // A row with a DQ date but no IL means either genuinely waiting, or the
  // member received their IL and never updated their submission. DQ dates
  // on/before the IL frontier (latest DQ known to have an IL) were covered
  // by past drops, so those rows count as stale rather than waiting.
  const frontierDq = latestDQWithIL ? String(latestDQWithIL).slice(0, 10) : null
  const dqNoIl = standard
    .filter(r => r.dq_date && !r.interview_letter)
    .map(r => String(r.dq_date).slice(0, 10))
  const waitingDqs = frontierDq ? dqNoIl.filter(dq => dq > frontierDq) : dqNoIl
  const staleDqNoIl = dqNoIl.length - waitingDqs.length

  const awaitingByMonth = {}
  for (const dq of waitingDqs) {
    const m = dq.slice(0, 7)
    const cur = awaitingByMonth[m]
    if (!cur) {
      awaitingByMonth[m] = { month: m, count: 1, dq_from: dq, dq_to: dq }
    } else {
      cur.count++
      if (dq < cur.dq_from) cur.dq_from = dq
      if (dq > cur.dq_to) cur.dq_to = dq
    }
  }
  const awaitingMonths = Object.values(awaitingByMonth)
    .sort((a, b) => a.month.localeCompare(b.month))

  // --- Trend calculation ---
  const now = new Date()
  const windowFilter = (months) => {
    const cutoff = new Date(now)
    cutoff.setMonth(cutoff.getMonth() - months)
    return standard.filter(r => r.dq_date && new Date(r.dq_date) >= cutoff)
  }

  const MIN_TREND_N = 5
  const windowedAvg = (months, mapFn, filterFn) => {
    const v = windowFilter(months).filter(filterFn).map(mapFn).filter(n => n != null && n > 0)
    return v.length >= MIN_TREND_N ? avg(v) : null
  }
  const windowedMedian = (months, mapFn, filterFn) => {
    const v = windowFilter(months).filter(filterFn).map(mapFn).filter(n => n != null && n > 0)
    return v.length >= MIN_TREND_N ? median(v) : null
  }
  const trendDqToIL = (months) => windowedAvg(months,
    r => daysBetween(r.dq_date, r.interview_letter), r => r.interview_letter)
  const trendDqToILMedian = (months) => windowedMedian(months,
    r => daysBetween(r.dq_date, r.interview_letter), r => r.interview_letter)
  const trendILToInterview = (months) => windowedAvg(months,
    r => daysBetween(r.interview_letter, r.interview), r => r.interview_letter && r.interview)
  const trendILToInterviewMedian = (months) => windowedMedian(months,
    r => daysBetween(r.interview_letter, r.interview), r => r.interview_letter && r.interview)
  const trendDqToInterview = (months) => windowedAvg(months,
    r => daysBetween(r.dq_date, r.interview), r => r.interview)
  const trendDqToInterviewMedian = (months) => windowedMedian(months,
    r => daysBetween(r.dq_date, r.interview), r => r.interview)

  // --- Estimated next IL drop ---
  // Derived entirely from live clusters — no hardcoded dates needed.
  // Exclude outlier gaps (>40 days) from average to match spreadsheet behaviour.
  const normalGaps = ilDrops.filter(d => d.gap && d.gap <= 40)
  const avgGap = normalGaps.length
    ? Math.round(normalGaps.reduce((a, b) => a + b.gap, 0) / normalGaps.length)
    : 28
  const lastILDate = ilDrops.length ? ilDrops[0].date : null
  // Fixed offsets matching spreadsheet formula: last_drop + 23 to last_drop + 33
  const estimatedNextEarly = lastILDate
    ? new Date(new Date(lastILDate).getTime() + 23 * 86400000).toISOString().split('T')[0]
    : null
  const estimatedNextLate = lastILDate
    ? new Date(new Date(lastILDate).getTime() + 33 * 86400000).toISOString().split('T')[0]
    : null

  // --- This week's activity ---
  // Two windows, both Mon-Sun:
  //   Upcoming week  (interviews, medicals, flights)
  //   Previous week  (DQ submissions, I-130 approvals)
  const now2 = new Date()
  const dayOfWeek = now2.getUTCDay() // 0=Sun, 1=Mon...

  // Mon-Sat: week starting on the most recent Monday.
  // Sunday: week starting tomorrow (next Monday).
  const daysToNextMonday = dayOfWeek === 0 ? 1 : 1 - dayOfWeek
  const upcomingStart = new Date(now2)
  upcomingStart.setUTCDate(now2.getUTCDate() + daysToNextMonday)
  upcomingStart.setUTCHours(0,0,0,0)
  const upcomingEnd = new Date(upcomingStart)
  upcomingEnd.setUTCDate(upcomingStart.getUTCDate() + 6)
  upcomingEnd.setUTCHours(23,59,59,999)

  const previousStart = new Date(upcomingStart)
  previousStart.setUTCDate(upcomingStart.getUTCDate() - 7)
  const previousEnd = new Date(upcomingStart)
  previousEnd.setUTCDate(upcomingStart.getUTCDate() - 1)
  previousEnd.setUTCHours(23,59,59,999)

  const inWindow = (dateStr, start, end) => {
    if (!dateStr) return false
    const d = new Date(dateStr + 'T12:00:00Z')
    return d >= start && d <= end
  }
  const inUpcoming = (dateStr) => inWindow(dateStr, upcomingStart, upcomingEnd)
  const inPrevious = (dateStr) => inWindow(dateStr, previousStart, previousEnd)

  const weekInterviews = deduped
    .filter(r => r.username_raw && inUpcoming(r.interview))
    .map(r => ({ name: r.username_raw, date: r.interview }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  const weekMedicals = deduped
    .filter(r => r.username_raw && inUpcoming(r.medical))
    .map(r => ({ name: r.username_raw, date: r.medical }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  const weekFlights = deduped
    .filter(r => r.username_raw && inUpcoming(r.flight))
    .map(r => ({ name: r.username_raw, date: r.flight }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  const weekDQs = deduped
    .filter(r => r.username_raw && inPrevious(r.dq_date))
    .map(r => ({ name: r.username_raw, date: r.dq_date }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  const weekApproved = deduped
    .filter(r => r.username_raw && inPrevious(r.i130_approval))
    .map(r => ({ name: r.username_raw, date: r.i130_approval }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  const upcomingWeekOf = upcomingStart.toISOString().split('T')[0]
  const previousWeekOf = previousStart.toISOString().split('T')[0]

  // --- Assemble response ---
  return res.status(200).json({
    meta: {
      total_members: deduped.length,
      total_submissions: rows.length,
      last_updated: new Date().toISOString(),
    },
    key_stats: {
      avg_dq_to_il:         avg(dqToIL),
      avg_il_to_interview:  avg(ilToInterview),
      avg_dq_to_interview:  avg(dqToInterview),
      avg_passport_days:    avg(passportDays),
      median_passport_days: median(passportDays),
      avg_pickup_days:      avg(pickupDays),
      median_pickup_days:   median(pickupDays),
      avg_mail_days:        avg(mailDays),
      median_mail_days:     median(mailDays),
    },
    trends: {
      dq_to_il: {
        all_time: { avg: avg(dqToIL),     median: median(dqToIL) },
        last_12m: { avg: trendDqToIL(12), median: trendDqToILMedian(12) },
        last_6m:  { avg: trendDqToIL(6),  median: trendDqToILMedian(6) },
        last_3m:  { avg: trendDqToIL(3),  median: trendDqToILMedian(3) },
        last_1m:  { avg: trendDqToIL(1),  median: trendDqToILMedian(1) },
      },
      il_to_interview: {
        all_time: { avg: avg(ilToInterview),     median: median(ilToInterview) },
        last_12m: { avg: trendILToInterview(12), median: trendILToInterviewMedian(12) },
        last_6m:  { avg: trendILToInterview(6),  median: trendILToInterviewMedian(6) },
        last_3m:  { avg: trendILToInterview(3),  median: trendILToInterviewMedian(3) },
        last_1m:  { avg: trendILToInterview(1),  median: trendILToInterviewMedian(1) },
      },
      dq_to_interview: {
        all_time: { avg: avg(dqToInterview),     median: median(dqToInterview) },
        last_12m: { avg: trendDqToInterview(12), median: trendDqToInterviewMedian(12) },
        last_6m:  { avg: trendDqToInterview(6),  median: trendDqToInterviewMedian(6) },
        last_3m:  { avg: trendDqToInterview(3),  median: trendDqToInterviewMedian(3) },
        last_1m:  { avg: trendDqToInterview(1),  median: trendDqToInterviewMedian(1) },
      },
    },
    outcomes: {
      approved,
      cleared,
      not_approved: notApproved,
      visa_pause:   visaPause,
      denied,
      total: withOutcome.length,
      approval_pct: withOutcome.length
        ? Math.round(((approved + cleared) / withOutcome.length) * 100)
        : null,
    },
    stage_counts: counts,
    stage_avgs:   stageAvgs,
    calculator: {
      dq_to_interview_stats: statsFromArray(dqToInterview),
      passport_pickup_stats: statsFromArray(pickupDays),
      passport_mail_stats:   statsFromArray(mailDays),
    },
    awaiting_il: {
      total:       waitingDqs.length,
      stale_count: staleDqNoIl,
      frontier:    frontierDq,
      months:      awaitingMonths,
    },
    il_schedule: {
      latest_dq_with_il:     latestDQWithIL,
      last_il_drop:          lastILDate,
      estimated_next_window: estimatedNextEarly && estimatedNextLate
        ? `${estimatedNextEarly} to ${estimatedNextLate}`
        : null,
      avg_gap_days:          avgGap,
      recent_drops:          ilDrops,
    },
    expedited: {
      count: deduped.filter(r => r.interview_expedited).length,
    },

    entry_airports: entryAirports,
    state_distribution: deduped
      .filter(r => r.us_state && r.us_state.trim())
      .reduce((acc, r) => {
        const state = r.us_state.trim()
        acc[state] = (acc[state] || 0) + 1
        return acc
      }, {}),
    il_to_interview_lookup: ilToInterviewMonths,
    latest_interview:       latestInterview,
    this_week: {
      week_of:          upcomingWeekOf,
      previous_week_of: previousWeekOf,
      interviews:       weekInterviews,
      medicals:         weekMedicals,
      flights:          weekFlights,
      dqs:              weekDQs,
      approved:         weekApproved,
    },
  })
}
