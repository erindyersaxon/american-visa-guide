#!/usr/bin/env node
// Weekly London community report for the #london Discord channel.
//
// Run on a Saturday. It prints two Discord-ready messages:
//   1. Interviews, medicals and flights for the FOLLOWING week (Mon-Sun).
//   2. I-130 approvals and DQs for the week that is ending (Mon-Sun, i.e. the
//      Monday before the Saturday through the Sunday after it).
// They are separate because Discord caps a message at 2,000 characters.
//
// Usage:
//   SUPABASE_URL=... SUPABASE_ANON_KEY=... node scripts/weekly-discord-report.js
//   node scripts/weekly-discord-report.js --date 2026-09-26   (report as of that day)
//   node scripts/weekly-discord-report.js --json rows.json    (offline, from a JSON export)
//
// NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (the names api/data.js
// reads) are accepted as fallbacks.

const fs = require('fs')

const EMBASSY = 'London, United Kingdom'
const FILLOUT_URL = 'https://forms.fillout.com/t/dTRqnkx9uxus'
const GUIDE_URL = 'https://www.americanvisaguide.com/guide'
const DATA_URL = 'https://www.americanvisaguide.com/'
const DISCORD_LIMIT = 2000

// --- Dates (all calendar dates, handled as UTC midnight to avoid DST drift) ---

const parseDate = (s) => {
  const d = new Date(`${s}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) throw new Error(`Invalid date: ${s}`)
  return d
}
const iso = (d) => d.toISOString().slice(0, 10)
const addDays = (d, n) => new Date(d.getTime() + n * 86400000)

// Monday of the ISO week containing d.
const mondayOf = (d) => addDays(d, -((d.getUTCDay() + 6) % 7))

const reportWindows = (runDate) => {
  const thisMonday = mondayOf(runDate)
  const nextMonday = addDays(thisMonday, 7)
  return {
    upcoming: { from: iso(nextMonday), to: iso(addDays(nextMonday, 6)) },
    previous: { from: iso(thisMonday), to: iso(addDays(thisMonday, 6)) },
  }
}

const DAY_NAMES = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY',
  'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']
const titleCase = (s) => s[0] + s.slice(1).toLowerCase()

const dayHeading = (s) => {
  const d = parseDate(s)
  return `${DAY_NAMES[d.getUTCDay()]} ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`
}
const shortDate = (s) => {
  const d = parseDate(s)
  return `${titleCase(MONTHS[d.getUTCMonth()]).slice(0, 3)} ${d.getUTCDate()}`
}

// --- Report building ---

const inWindow = (value, w) => {
  if (!value) return false
  const day = String(value).slice(0, 10)
  return day >= w.from && day <= w.to
}

// Usernames are stored lower-cased by api/submit.js; Discord handles are
// case-insensitive, so the lower-cased form is still the right handle.
const mention = (row) => `@${row.username_raw || 'unknown'}`

// Rows whose `field` falls in the window, sorted by date then username, one
// entry per username (a member can have duplicate rows).
const pick = (rows, field, w) => {
  const seen = new Set()
  return rows
    .filter(r => inWindow(r[field], w))
    .map(r => ({ date: String(r[field]).slice(0, 10), who: mention(r) }))
    .sort((a, b) => a.date.localeCompare(b.date) || a.who.localeCompare(b.who))
    .filter(e => {
      const key = `${e.date}|${e.who}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

// Group by day, in the same layout as the hand-written posts:
//   **WEDNESDAY SEPTEMBER 30**
//   @user1
//   @user2
const byDay = (entries) => {
  if (!entries.length) return '*none noted*'
  const lines = []
  let current = null
  for (const e of entries) {
    if (e.date !== current) {
      if (current) lines.push('')
      lines.push(`**${dayHeading(e.date)}**`)
      current = e.date
    }
    lines.push(e.who)
  }
  return lines.join('\n')
}

const byName = (entries) => entries.length
  ? entries.map(e => `${e.who} (${shortDate(e.date)})`).join('\n')
  : '*none noted*'

const buildReport = (rows, runDate) => {
  const { upcoming, previous } = reportWindows(runDate)
  const london = rows.filter(r => r.embassy === EMBASSY)

  const interviews = pick(london, 'interview', upcoming)
  const medicals = pick(london, 'medical', upcoming)
  const flights = pick(london, 'flight', upcoming)
  const i130s = pick(london, 'i130_approval', previous)
  const dqs = pick(london, 'dq_date', previous)

  const range = (w) => `${shortDate(w.from)} – ${shortDate(w.to)}`

  const thisWeek = [
    `🦩🦩🦩 **Ready steady for another week of adventures!** 🦩🦩🦩`,
    `Everyone cheer for the following!!! (${range(upcoming)})`,
    '',
    '🏁 **INTERVIEWS THIS WEEK** 🏁',
    byDay(interviews),
    '',
    '⛑️ **MEDICALS THIS WEEK** ⛑️',
    byDay(medicals),
    '',
    '🚀 **FLIGHTS THIS WEEK** 🚀',
    byDay(flights),
    '',
    '**Please correct me if your info is missing!!**',
  ].join('\n')

  const lastWeek = [
    `👏 **Last week's excitement** 👏 (${range(previous)})`,
    '',
    '**I-130 APPROVALS**',
    byName(i130s),
    '',
    '**DQ**',
    byName(dqs),
    '',
    '**Please correct me if your info is missing!**',
    '',
    `📝 Add or update your timeline here: ${FILLOUT_URL}`,
    `📖 Step-by-step guide: <${GUIDE_URL}>`,
    `📊 London timelines & stats: <${DATA_URL}>`,
  ].join('\n')

  return {
    windows: { upcoming, previous },
    counts: { interviews: interviews.length, medicals: medicals.length,
      flights: flights.length, i130s: i130s.length, dqs: dqs.length },
    messages: [thisWeek, lastWeek],
  }
}

// --- Data ---

const fetchRows = async () => {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const missing = [!url && 'SUPABASE_URL', !key && 'SUPABASE_ANON_KEY'].filter(Boolean)
  if (missing.length) throw new Error(`Missing environment variables: ${missing.join(', ')}`)

  const select = 'username_raw,embassy,interview,medical,flight,i130_approval,dq_date'
  const res = await fetch(
    `${url}/rest/v1/form_responses?embassy=eq.${encodeURIComponent(EMBASSY)}&select=${select}`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } }
  )
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`)
  return res.json()
}

const parseArgs = (argv) => {
  const args = {}
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--date') args.date = argv[++i]
    else if (argv[i] === '--json') args.json = argv[++i]
    else throw new Error(`Unknown argument: ${argv[i]}`)
  }
  return args
}

const main = async () => {
  const args = parseArgs(process.argv.slice(2))
  const runDate = args.date ? parseDate(args.date) : parseDate(iso(new Date()))
  const rows = args.json ? JSON.parse(fs.readFileSync(args.json, 'utf8')) : await fetchRows()
  const report = buildReport(rows, runDate)

  report.messages.forEach((m, i) => {
    console.log(`===== MESSAGE ${i + 1} of ${report.messages.length} (${m.length} chars) =====`)
    console.log(m)
    console.log('')
    if (m.length > DISCORD_LIMIT) {
      console.error(`WARNING: message ${i + 1} is over Discord's ${DISCORD_LIMIT}-character limit; split it before posting.`)
    }
  })
}

if (require.main === module) {
  main().catch(err => { console.error(err.message); process.exit(1) })
}

module.exports = { buildReport, reportWindows }
