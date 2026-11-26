/*
   American Visa Guide: live member data for every /data page.
   Fetches /api/data (aggregated server-side) and falls back to FB, a frozen
   snapshot in the same shape, if the API can't be reached. Each render
   function skips quietly when its element isn't on the page, so one file
   serves the landing page and all three member pages.
   Moved from an inline module in data.html (26 Nov 2026).
   Needs js/data-status.js loaded first.
 */
(function () {
  'use strict';
  /* Live data comes from the /api/data serverless endpoint, which aggregates
     the community submissions server-side. FB is a frozen last-known snapshot
     in the same shape, shown only if /api/data is unreachable. */
  const FB = {
    meta: { total_members: 219 },
    key_stats: { avg_dq_to_il:66, avg_il_to_interview:60, avg_dq_to_interview:123, avg_passport_days:7, median_passport_days:5, avg_pickup_days:4, avg_mail_days:12 },
    trends: {
      dq_to_il:        { all_time:63, last_6m:77, last_3m:null },
      il_to_interview: { all_time:60, last_6m:53, last_3m:60 },
      dq_to_interview: { all_time:123, last_6m:132, last_3m:135 },
    },
    intervals: {
      dq_to_il:              { median:86, p25:70, p75:95, p90:100, n:46, window_days:180, censored:14, suppressed:false, small_sample:false },
      il_to_interview:       { median:50, p25:42, p75:59, p90:73,  n:84, window_days:180, censored:13, suppressed:false, small_sample:false },
      interview_to_passport: { median:5,  p25:3,  p75:7,  p90:9,   n:62, window_days:180, censored:96, censored_label:'passport not reported', suppressed:false, small_sample:false },
    },
    // Phase timings copied from production /api/data on 25 Oct 2026 (255 members);
    // still-waiting counts left out because they go out of date fastest.
    phases: [
      { key:"approval_to_welcome", group:"nvc", label:"I-130 approval → NVC welcome letter", median:5, p25:4, p75:6, n:56, window_days:365, suppressed:false, small_sample:false, still_waiting:null },
      { key:"welcome_to_fees", group:"nvc", label:"Welcome letter → fees paid", median:1, p25:1, p75:5, n:34, window_days:365, suppressed:false, small_sample:false, still_waiting:null },
      { key:"fees_to_docs", group:"nvc", label:"Fees paid → documents submitted", median:10, p25:6, p75:20, n:63, window_days:365, suppressed:false, small_sample:false, still_waiting:null },
      { key:"docs_to_dq", group:"nvc", label:"Documents submitted → DQ", median:10, p25:7, p75:19, n:39, window_days:270, suppressed:false, small_sample:false, still_waiting:null },
      { key:"dq_to_il", group:"waiting", label:"DQ → interview letter", median:94, p25:79, p75:98, n:44, window_days:270, suppressed:false, small_sample:false, still_waiting:null },
      { key:"il_to_interview", group:"waiting", label:"Interview letter → interview", median:47, p25:39, p75:54, n:47, window_days:180, suppressed:false, small_sample:false, still_waiting:null },
      { key:"il_to_medical", group:"interview", label:"Interview letter → medical", median:33, p25:25, p75:40, n:41, window_days:180, suppressed:false, small_sample:false, still_waiting:null },
      { key:"medical_to_interview", group:"interview", label:"Medical → interview", median:14, p25:14, p75:16, n:65, window_days:180, suppressed:false, small_sample:false, still_waiting:null },
      { key:"interview_to_passport", group:"after", label:"Interview → passport back", median:5, p25:3, p75:7, n:47, window_days:180, suppressed:false, small_sample:false, still_waiting:null },
    ],
    phase_groups: [ { key:"nvc", label:"NVC" }, { key:"waiting", label:"Waiting for your interview" }, { key:"interview", label:"Interview stage" }, { key:"after", label:"After the interview" } ],
    outcomes: { approved:98, not_approved:3, cleared:5, denied:1, visa_pause:3, total:110, approval_pct:94 },
    stage_avgs: { approval_to_welcome:6, welcome_to_fees:8, fees_to_docs:19, docs_to_dq:19, il_to_medical:46, interview_to_passport:6 },
    il_schedule: {
      last_il_drop:'2026-07-14', latest_dq_with_il:'2026-04-13', estimated_next_window:'2026-08-06 to 2026-08-16', avg_gap_days:19,
      recent_drops: [
        { date:'2026-07-14', time:'14:53', gap:15, dq_from:'2026-04-03', dq_to:'2026-04-13', dq_days:11, il_count:4, iv_from:'2026-09-02', iv_to:'2026-09-16', iv_count:4 },
        { date:'2026-06-29', time:'15:02', gap:31, dq_from:'2026-03-19', dq_to:'2026-03-26', dq_days:8, il_count:3, iv_from:'2026-08-13', iv_to:'2026-08-19', iv_count:3 },
        { date:'2026-05-29', time:'14:52', gap:35, dq_from:'2025-11-17', dq_to:'2026-03-26', dq_days:130, il_count:22, iv_from:'2026-07-01', iv_to:'2026-07-29', iv_count:21 },
        { date:'2026-04-17', time:'16:02', gap:17, dq_from:'2025-09-30', dq_to:'2026-02-14', dq_days:138, il_count:11, iv_from:'2026-06-01', iv_to:'2026-06-29', iv_count:12 },
        { date:'2026-03-31', time:'15:16', gap:27, dq_from:'2025-12-30', dq_to:'2026-01-27', dq_days:29, il_count:16, iv_from:'2026-05-01', iv_to:'2026-07-23', iv_count:16 },
        { date:'2026-03-04', time:'14:08', gap:15, dq_from:'2025-12-17', dq_to:'2025-12-22', dq_days:6, il_count:3, iv_from:'2026-04-08', iv_to:'2026-04-29', iv_count:3 },
        { date:'2026-02-13', time:'13:51', gap:29, dq_from:'2025-10-24', dq_to:'2026-01-26', dq_days:95, il_count:13, iv_from:'2026-04-01', iv_to:'2026-04-29', iv_count:12 },
      ],
    },
  };

  /* Editorial pipeline narrative: current processing conditions, not in the DB */
  const PIPELINE = {
    uscis:  { status:'slow', text:'Community tracking shows USCIS deciding consular I-130s again after a stall from February to October 2026 (USCIS has not acknowledged a pause). In November the front of the line reached priority dates of around 6 March 2025. Weekly approvals run at about half the January 2026 pace. <a href="/news">Latest updates on embassy and visa news →</a>' },
    nvc:    { status:'delayed', text:'As of 26 October 2026, NVC is reviewing documents submitted on 18 August, a 69-day wait. Plan on DQ about 10 weeks after you submit complete documents. NVC is creating cases USCIS sent on 17 October and answering Public Inquiry Forms received on 16 October. Send a second inquiry only if NVC has not replied within that window. <a href="https://travel.state.gov/content/travel/en/us-visas/immigrate/nvc-timeframes.html" target="_blank" rel="noopener noreferrer">NVC timeframes →</a>' },
    london: { status:'paused', text:'London has sent no Interview Letters since 14 July 2026, and other posts report the same. The only applicants interviewing now have a rescheduled interview or a re-interview. London canceled immigrant visa interviews and same-day document checks booked for August to October 2026 for public charge training; medicals appear unaffected. So far, September interviews have moved to October and November, and October ones to December. After the court vacated the 75-country pause, London started emailing applicants refused under it or under 221(g) to book a re-interview. <a href="/interview">What to do if you have a new date →</a> <a href="/interview/reinterview">Re-interview after a 221(g) →</a>' },
  };

  /* Editorial caveats under phase cards whose member data conflicts with official figures */
  const PHASE_NOTES = {
    docs_to_dq: 'Conflicts with NVC\u2019s current 69-day review wait (see the NVC row above). These member reports span 9 months, so plan on the NVC figure.',
  };

  /* Map the /api/data response into the shapes the render functions consume */
  function fromApiData(d) {
    const sched = d.il_schedule || {};
    const drops = (sched.recent_drops || []).map(r => ({
      drop_date: r.date, gap_days: r.gap, drop_time: r.time,
      dq_date_from: r.dq_from, dq_date_to: r.dq_to, il_count: r.il_count,
      iv_date_from: r.iv_from, iv_date_to: r.iv_to, iv_count: r.iv_count,
    }));
    const win = (sched.estimated_next_window || '').split(' to ').map(s => s.trim());
    const o = d.outcomes || {};
    const pct = n => (o.total ? Math.round((n || 0) / o.total * 100) : null);
    const stats = {
      members_waiting: d.meta?.total_members ?? null,
      il_system_status: 'active', // renderBanner upgrades to delayed/paused from the drop date
      next_drop_window_start: win[0] || null,
      next_drop_window_end:   win[1] || null,
      uscis_status:  PIPELINE.uscis.status,  uscis_summary:  PIPELINE.uscis.text,
      nvc_status:    PIPELINE.nvc.status,    nvc_summary:    PIPELINE.nvc.text,
      london_status: PIPELINE.london.status, london_summary: PIPELINE.london.text,
      approved_pct: o.approval_pct ?? null,
      // Unresolved 221(g) plus cases attributed to the 2025 visa pause
      // both are pending AP, so together they make the three cards cover
      // every reported outcome.
      rejected_221g_pct: pct((o.not_approved ?? 0) + (o.visa_pause ?? 0)),
      denied_pct: pct(o.denied),
      median_pickup_days: d.key_stats?.median_pickup_days ?? null,
      median_mail_days:   d.key_stats?.median_mail_days ?? null,
      latest_dq_with_il:  sched.latest_dq_with_il ?? null,
    };
    return { drops, stats };
  }

  /* Helpers */
  function fmtDate(s) {
    if (!s) return 'n/a';
    const d = new Date(s.length === 10 ? s + 'T00:00:00Z' : s);
    return d.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric', timeZone:'UTC' });
  }
  function fmtRange(from, to) {
    if (!from && !to) return 'n/a';
    if (!from || !to || from === to) return fmtDate(from || to);
    const a = new Date(from + 'T00:00:00Z');
    const b = new Date(to + 'T00:00:00Z');
    // Same year: "15 Jul – 2 Aug 2026"; otherwise full dates on both sides
    if (a.getUTCFullYear() === b.getUTCFullYear()) {
      const short = a.toLocaleDateString('en-GB', { day:'numeric', month:'short', timeZone:'UTC' });
      return `${short} – ${fmtDate(to)}`;
    }
    return `${fmtDate(from)} – ${fmtDate(to)}`;
  }
  function fmtMonth(s) {
    if (!s) return 'n/a';
    const d = new Date(s.length === 10 ? s + 'T00:00:00Z' : s);
    return d.toLocaleDateString('en-GB', { month:'long', year:'numeric', timeZone:'UTC' });
  }
  function daysAgo(s) {
    if (!s) return null;
    const today = new Date(); today.setUTCHours(0, 0, 0, 0);
    return window.AVGDataStatus.daysSince(s, today);
  }
  function avgOf(arr, field) {
    const vals = arr.map(r => r[field]).filter(v => v != null && !isNaN(Number(v)));
    if (!vals.length) return null;
    return Math.round(vals.reduce((s, v) => s + Number(v), 0) / vals.length);
  }
  function set(id, html) { const el = document.getElementById(id); if (el) el.innerHTML = html; }
  function txt(id, t)    { const el = document.getElementById(id); if (el) el.textContent = t; }

  function statusBadge(status) {
    const map = {
      active:  ['badge--success',     '●', 'Active'],
      normal:  ['badge--success',     '●', 'Normal'],
      delayed: ['badge--warning',     '▲', 'Delayed'],
      slow:    ['badge--warning',     '▲', 'Slow'],
      halted:  ['badge--destructive', '■', 'Stopped'],
      paused:  ['badge--destructive', '✕', 'Paused'],
    };
    const [cls, icon, label] = map[status] || map.normal;
    return `<span class="badge ${cls}" aria-label="Status: ${label}"><span aria-hidden="true">${icon}</span> ${label}</span>`;
  }

  /* Renderers */
  function renderBanner(drops, stats) {
    const banner = document.getElementById('il-banner');
    if (!banner) return;
    const last = drops?.[0];
    const lastDate = last?.drop_date || last?.recorded_at;
    const ns = stats?.next_drop_window_start;
    const ne = stats?.next_drop_window_end;

    // Determine range status from today vs. next expected window
    let cfg;
    let missedWindow = false;   // window has passed with no drop in it
    if (ns) {
      const today = new Date(); today.setUTCHours(0,0,0,0);
      const start = new Date(ns + 'T00:00:00Z');
      const end   = ne ? new Date(ne + 'T00:00:00Z') : start;
      const lastDropDate = lastDate ? new Date(lastDate + 'T00:00:00Z') : null;
      const daysUntilStart = Math.round((start - today) / 86400000);
      const pastWindow = today > end;
      const noDropInWindow = !lastDropDate || lastDropDate < start;
      if (pastWindow && noDropInWindow) {
        missedWindow = true;
        cfg = { cls:'il-banner--delayed',     dot:'delayed',     chip:'No new interview letters yet' };
      } else if (today >= start && today <= end) {
        cfg = { cls:'il-banner--in-range',    dot:'in-range',    chip:'Letters could go out any day' };
      } else if (daysUntilStart > 0 && daysUntilStart <= 7) {
        cfg = { cls:'il-banner--approaching', dot:'approaching', chip:'Letters may go out soon' };
      } else {
        cfg = { cls:'il-banner--outside',     dot:'outside',     chip:'No letters expected yet' };
      }
    } else {
      cfg = { cls:'il-banner--outside', dot:'outside', chip:'No letters expected yet' };
    }

    // Once the window has passed with nothing in it, the estimate is a missed
    // forecast rather than an upcoming one. It stays put until a drop lands
    // and the API recomputes it from that date.
    const title = ns
      ? `${missedWindow ? 'Was expected' : 'Next expected'}: ${fmtDate(ns)}${ne ? ' – ' + fmtDate(ne) : ''}`
      : 'Next drop window not yet estimated';

    banner.className = `il-banner ${cfg.cls}`;
    banner.innerHTML = `
      <div class="il-banner__chip">
        <span class="status-dot status-dot--${cfg.dot}" aria-hidden="true"></span>
        <span>${cfg.chip}</span>
      </div>
      <div class="il-banner__title">${title}</div>
    `;
  }

  function renderMetrics(drops, stats, snapshot) {
    const last = drops?.[0];
    const lastDate = last?.drop_date || last?.recorded_at;
    const days = daysAgo(lastDate);
    set('m-last-drop', fmtDate(lastDate));
    txt('m-last-drop-sub', lastDate ? 'Most recent drop' : '');
    set('m-days-since', days != null ? String(days) : 'n/a');
    txt('m-days-since-sub', days != null ? (days === 1 ? 'day ago' : 'days ago') : '');
    const ns = stats?.next_drop_window_start;
    const ne = stats?.next_drop_window_end;
    set('m-next-window', ns ? fmtDate(ns) : 'n/a');
    txt('m-next-window-sub', ns ? (ne ? `to ${fmtDate(ne)}` : 'Estimated') : 'Not yet estimated');
    const tn = document.getElementById('tn-days-since');
    if (tn) tn.textContent = days != null ? `, ${days} days ago` : '';
    const w = stats?.members_waiting;
    const note = document.getElementById('m-members-note');
    if (note) note.classList.add('freshness-badge');
    txt('m-members-note', w != null
      ? (snapshot
        ? `From ${w.toLocaleString('en-GB')} London Embassy applicant submissions (snapshot).`
        : `Updated continuously from ${w.toLocaleString('en-GB')} London Embassy applicant submissions.`)
      : '');
    set('il-latest-dq', fmtDate(stats?.latest_dq_with_il));
    // Interview date range from the most recent drop with reported interviews
    const ivDrop = drops?.find(d => d.iv_date_from);
    set('m-interview-range', ivDrop ? fmtRange(ivDrop.iv_date_from, ivDrop.iv_date_to) : 'n/a');
    // London canceled Aug/Sept 2026 interviews for public charge training and moved them to October
    const canceled = ivDrop && ivDrop.iv_date_from >= '2026-08-01' && ivDrop.iv_date_from <= '2026-09-30';
    txt('m-interview-range-sub', ivDrop
      ? `From the ${fmtDate(ivDrop.drop_date || ivDrop.recorded_at)} IL drop.${canceled ? ' London has since canceled and rescheduled these dates.' : ''}`
      : 'Not yet reported');
  }

  function renderPipeline(stats) {
    [
      { badge:'p-uscis-badge',   summary:'p-uscis-summary',   status: stats?.uscis_status   || 'normal', text: stats?.uscis_summary   || 'I-130 petition processing for immediate relatives of US citizens. Stalled from February to October 2026; in November the front of the line reached priority dates of around 6 March 2025.' },
      { badge:'p-nvc-badge',     summary:'p-nvc-summary',     status: stats?.nvc_status     || 'normal', text: stats?.nvc_summary     || 'Document review and fee payment. Most cases completing NVC in 2–3 months once received.' },
      { badge:'p-london-badge',  summary:'p-london-summary',  status: stats?.london_status  || 'active', text: stats?.london_summary  || 'IL drops are the bottleneck. Once you have an IL, interview scheduling is typically 6–10 weeks out.' },
    ].forEach(s => { set(s.badge, statusBadge(s.status)); set(s.summary, s.text); });
  }

  function renderDropTable(drops) {
    const tbody = document.getElementById('drops-tbody');
    if (!tbody || !drops?.length) return;
    tbody.innerHTML = drops.map(d => {
      const ds = d.drop_date || d.recorded_at;
      const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      const dayName = ds ? DAYS[new Date(ds + 'T00:00:00Z').getUTCDay()] : 'n/a';
      return `<tr>
        <td>${fmtDate(ds)}</td>
        <td>${dayName}</td>
        <td>${d.drop_time || 'n/a'}</td>
        <td>${d.dq_date_from ? fmtDate(d.dq_date_from) : 'n/a'} – ${d.dq_date_to ? fmtDate(d.dq_date_to) : 'n/a'}</td>
        <td>${fmtRange(d.iv_date_from, d.iv_date_to)}</td>
        <td>${d.gap_days != null ? d.gap_days + ' days' : 'n/a'}</td>
        <td>${d.il_count != null ? Number(d.il_count).toLocaleString('en-GB') : 'n/a'}</td>
      </tr>`;
    }).join('');
  }

  function renderAwaiting(d) {
    const a = d.awaiting_il;
    const tbody = document.getElementById('backlog-tbody');
    if (!a || !Array.isArray(a.months)) {
      set('bk-total', 'n/a');
      txt('bk-total-sub', 'Needs live data');
      set('bk-oldest', 'n/a');
      if (tbody) tbody.innerHTML = '<tr><td colspan="3">Backlog counts need live data. Check back shortly.</td></tr>';
      return;
    }

    set('bk-total', a.total.toLocaleString('en-GB'));
    txt('bk-total-sub', a.frontier
      ? `DQ dates after ${fmtDate(a.frontier)}, the latest DQ with an IL`
      : 'Tracked members without an IL');
    set('bk-oldest', a.months.length ? fmtDate(a.months[0].dq_from) : 'n/a');

    if (tbody) {
      if (!a.months.length) {
        tbody.innerHTML = '<tr><td colspan="3">No tracked members are currently waiting, every recorded DQ has an Interview Letter.</td></tr>';
      } else {
        tbody.innerHTML = a.months.map(m => `<tr>
          <td>${fmtMonth(m.month + '-01')}</td>
          <td class="num">${m.count.toLocaleString('en-GB')}</td>
          <td>${fmtRange(m.dq_from, m.dq_to)}</td>
        </tr>`).join('');
      }
    }

    const note = document.getElementById('bk-note');
    if (note) {
      const stale = a.stale_count
        ? ` ${a.stale_count.toLocaleString('en-GB')} other member${a.stale_count === 1 ? ' has a DQ date' : 's have DQ dates'} already covered by past drops but no IL recorded: likely just not updated yet, so they're excluded from the counts above.`
        : '';
      note.textContent = `Counts cover tracked community members only. The embassy's real queue is larger.${stale}`;
    }
  }

  function renderOutcomes(stats) {
    if (!stats) return;
    set('o-approved', stats.approved_pct      != null ? `${stats.approved_pct}%`      : 'n/a');
    set('o-221g',     stats.rejected_221g_pct != null ? `${stats.rejected_221g_pct}%` : 'n/a');
    set('o-denied',   stats.denied_pct        != null ? `${stats.denied_pct}%`        : 'n/a');
  }

  function renderPassport(stats) {
    if (!stats) return;
    set('pp-pickup', stats.median_pickup_days != null ? String(stats.median_pickup_days) : 'n/a');
    set('pp-mail',   stats.median_mail_days   != null ? String(stats.median_mail_days)   : 'n/a');
  }

  /* The one-line status on the /data landing page (js/data-status.js) */
  function renderStatus(drops, stats, usedFallback) {
    const host = document.getElementById('data-status');
    if (!host || !window.AVGDataStatus) return;
    const textEl = host.querySelector('.dsx-status__text');
    if (!textEl) return;
    const today = new Date(); today.setUTCHours(0, 0, 0, 0);
    const line = window.AVGDataStatus.statusLine(drops, stats, today);
    const lead = document.createElement('strong');
    lead.textContent = line.lead;
    const rest = (line.rest ? ' ' + line.rest : '') +
      (usedFallback ? ' These are the last figures we could load.' : '');
    textEl.replaceChildren(lead, document.createTextNode(rest));
  }

  /* "Where the numbers come from" line on member topic pages */
  function renderSource(usedFallback) {
    document.querySelectorAll('.dsx-source[data-live]').forEach((el) => {
      el.textContent = 'Live from timelines members share. These figures load each time you open the page.' +
        (usedFallback ? ' These are the last figures we could load.' : '');
    });
  }

  /* Boot */
  async function boot() {
    let d, usedFallback = false;
    try {
      const res = await fetch('/api/data');
      if (!res.ok) throw new Error('http ' + res.status);
      d = await res.json();
      if (!d || !d.meta) throw new Error('empty');
    } catch {
      d = FB;
      usedFallback = true;
    }
    if (usedFallback) document.getElementById('data-notice')?.classList.add('is-visible');

    const { drops, stats } = fromApiData(d);
    renderStatus(drops, stats, usedFallback);
    renderSource(usedFallback);
    renderBanner(drops, stats);
    renderMetrics(drops, stats, usedFallback);
    const dqIl = (d.phases || []).find(p => p.key === 'dq_to_il');
    if (dqIl) dqIl.all_time_median = d.trends?.dq_to_il?.all_time?.median ?? null;
    if (window.AVGPhaseCards && document.getElementById('phase-cards')) AVGPhaseCards.render(document.getElementById('phase-cards'), d.phases, d.phase_groups, PHASE_NOTES);
    renderPipeline(stats);
    renderDropTable(drops);
    renderAwaiting(d);
    renderOutcomes(stats);
    renderPassport(stats);
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', boot)
    : boot();
})();
