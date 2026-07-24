/* American Visa Guide — Data Tracker JS */

async function renderTracker() {
  try {
    const response = await window._dataPromise;
    if (!response.ok) throw new Error("API error");
    const data = await response.json();

    renderThisWeek(data);
    renderKeyStats(data);
    renderPipeline(data);
    renderWaitingForIL(data);
    renderILDropHistory(data);
    renderTrends(data);
    renderOutcomes(data);
    renderPassportReturn(data);
    renderStageTimes(data);
  } catch (err) {
    console.error("Data fetch error:", err);
    showErrorState();
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateShort(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

function safeDays(num) {
  return num ? Math.round(num) : "—";
}

function renderThisWeek(data) {
  const widget = document.getElementById("weekWidget");
  const label = document.getElementById("weekLabel");

  if (!data.this_week) {
    widget.innerHTML = '<div class="week-empty">Nothing recorded this week yet.</div>';
    return;
  }

  const thisWeek = data.this_week;
  const weekDate = new Date();
  weekDate.setDate(weekDate.getDate() - weekDate.getDay());
  label.textContent = `Week commencing ${formatDate(weekDate.toISOString())}`;

  let html = "";

  // Interviews
  if (thisWeek.interviews && thisWeek.interviews.length > 0) {
    html += '<div class="week-column">';
    html += '<h3>Interviews</h3>';
    thisWeek.interviews.forEach((item) => {
      html += `<div class="week-item"><strong>${item.date || "—"}</strong></div>`;
    });
    html += "</div>";
  }

  // Medicals
  if (thisWeek.medicals && thisWeek.medicals.length > 0) {
    html += '<div class="week-column">';
    html += '<h3>Medicals</h3>';
    thisWeek.medicals.forEach((item) => {
      html += `<div class="week-item"><strong>${item.date || "—"}</strong></div>`;
    });
    html += "</div>";
  }

  // Flights
  if (thisWeek.flights && thisWeek.flights.length > 0) {
    html += '<div class="week-column">';
    html += '<h3>Flights</h3>';
    thisWeek.flights.forEach((item) => {
      html += `<div class="week-item"><strong>${item.date || "—"}</strong></div>`;
    });
    html += "</div>";
  }

  if (!html) {
    html = '<div class="week-empty">Nothing recorded this week yet.</div>';
  }

  widget.innerHTML = html;
}

function renderKeyStats(data) {
  const statsCards = document.querySelectorAll("#key-stats .stat-card");

  if (statsCards[0]) {
    statsCards[0].innerHTML = `<p class="stat-value">${safeDays(data.key_stats?.avg_dq_to_il)}</p><p class="stat-label">DQ to interview letter (avg days)</p>`;
  }
  if (statsCards[1]) {
    statsCards[1].innerHTML = `<p class="stat-value">${safeDays(data.key_stats?.avg_il_to_interview)}</p><p class="stat-label">IL to interview (avg days)</p>`;
  }
  if (statsCards[2]) {
    const approvalPct = data.outcomes?.approval_pct ? Math.round(data.outcomes.approval_pct) : "—";
    statsCards[2].innerHTML = `<p class="stat-value">${approvalPct}${approvalPct !== "—" ? "%" : ""}</p><p class="stat-label">Interview approval rate</p>`;
  }
  if (statsCards[3]) {
    const count = data.meta?.total_members || "—";
    statsCards[3].innerHTML = `<p class="stat-value">${count}</p><p class="stat-label">Community members</p>`;
  }

  document.getElementById("memberCount").textContent = data.meta?.total_members || "—";
}

function renderPipeline(data) {
  const grid = document.getElementById("pipelineGrid");
  let html = "";

  const stages = [
    {
      name: "I-130 at USCIS",
      count: data.stage_counts?.i130_approval,
      avgDays: data.stage_avgs?.pd_to_approval,
      warning:
        data.stage_counts?.i130_approval < 50
          ? '<p style="color: var(--color-error); font-size: var(--size-sm); margin-top: var(--space-2);">⚠️ Significantly slowed. <a href="https://www.trackmy visa.com/" target="_blank" rel="noopener" style="color: var(--color-error);">Track My Visa</a></p>'
          : "",
    },
    {
      name: "National Visa Center",
      count: data.stage_counts?.nvc_welcome_letter,
      avgDays: data.stage_avgs?.approval_to_welcome,
      info: '<p style="font-size: var(--size-sm); color: var(--color-text-muted); margin-top: var(--space-2);">Operating normally. Your petition has been approved and is being processed for consular interview.</p>',
    },
    {
      name: "London Embassy",
      count: data.stage_counts?.dq,
      avgDays: data.stage_avgs?.docs_to_dq,
      info: '<p style="font-size: var(--size-sm); color: var(--color-text-muted); margin-top: var(--space-2);">Interview letters are continuing to be issued. Document check typically takes 11:45 AM to 1:00 PM.</p>',
    },
  ];

  stages.forEach((stage) => {
    html += `<div class="pipeline-card">`;
    html += `<h3>${stage.name}</h3>`;
    html += `<div class="pipeline-stat"><span>Members</span><span class="pipeline-value">${stage.count || "—"}</span></div>`;
    html += `<div class="pipeline-stat"><span>Avg days</span><span class="pipeline-value">${safeDays(stage.avgDays)}</span></div>`;
    if (stage.warning) html += stage.warning;
    if (stage.info) html += stage.info;
    html += `</div>`;
  });

  grid.innerHTML = html;
}

function renderWaitingForIL(data) {
  // Latest DQ with IL
  if (data.il_schedule?.latest_dq_with_il) {
    document.getElementById("latestDQWithIL").textContent = formatDate(
      data.il_schedule.latest_dq_with_il
    );
    document.getElementById("latestDQLabel").textContent = "Date of document check";
  }

  // Next window
  if (data.il_schedule?.estimated_next_window) {
    document.getElementById("nextWindow").textContent =
      data.il_schedule.estimated_next_window;
  }

  // IL to Interview lookup table
  if (data.il_to_interview_lookup && data.il_to_interview_lookup.length > 0) {
    const tbody = document.getElementById("ilLookupBody");
    let html = "";

    data.il_to_interview_lookup.forEach((item, idx) => {
      const isCurrent = idx === 0;
      html += `<tr${isCurrent ? ' style="background: var(--color-gold-xlight);"' : ""}>`;
      html += `<td>${item.il_month || "—"}${isCurrent ? ' <span class="badge">Current</span>' : ""}</td>`;
      html += `<td>${item.interview_month || "—"}</td>`;
      html += `</tr>`;
    });

    tbody.innerHTML = html;
  }
}

function renderILDropHistory(data) {
  const container = document.getElementById("dropHistory");

  if (!data.il_schedule?.recent_drops || data.il_schedule.recent_drops.length === 0) {
    container.innerHTML =
      '<div style="width: 100%; text-align: center; padding: var(--space-8); color: var(--color-text-muted);">No recent drops recorded.</div>';
    return;
  }

  let html = "";
  data.il_schedule.recent_drops.forEach((drop, idx) => {
    const isLatest = idx === 0;
    html += `<div class="drop-chip${isLatest ? " latest" : ""}">`;
    if (isLatest) html += '<span class="badge" style="margin-right: var(--space-2);">Latest</span>';
    html += `<div class="drop-date">${formatDate(drop.date)}</div>`;
    if (drop.uk_time) html += `<div class="drop-detail">${drop.uk_time}</div>`;
    if (drop.gap_days)
      html += `<div class="drop-detail">Gap: ${Math.round(drop.gap_days)} days</div>`;
    if (drop.dq_range) html += `<div class="drop-detail">${drop.dq_range}</div>`;
    if (drop.il_count) html += `<div class="drop-detail">${drop.il_count} ILs</div>`;
    html += `</div>`;
  });

  container.innerHTML = html;
}

function renderTrends(data) {
  const tbody = document.getElementById("trendsBody");
  const trends = data.trends || {};

  let html = "";

  const metrics = [
    {
      label: "DQ to IL",
      all_time: trends.dq_to_il?.all_time,
      last_12m: trends.dq_to_il?.last_12m,
      last_6m: trends.dq_to_il?.last_6m,
      last_3m: trends.dq_to_il?.last_3m,
    },
    {
      label: "IL to Interview",
      all_time: trends.il_to_interview?.all_time,
      last_12m: trends.il_to_interview?.last_12m,
      last_6m: trends.il_to_interview?.last_6m,
      last_3m: trends.il_to_interview?.last_3m,
    },
    {
      label: "DQ to Interview",
      all_time: trends.dq_to_interview?.all_time,
      last_12m: trends.dq_to_interview?.last_12m,
      last_6m: trends.dq_to_interview?.last_6m,
      last_3m: trends.dq_to_interview?.last_3m,
    },
  ];

  metrics.forEach((metric) => {
    html += `<tr>`;
    html += `<td>${metric.label}</td>`;
    html += `<td>${safeDays(metric.all_time)}</td>`;
    html += `<td>${safeDays(metric.last_12m)}</td>`;
    html += `<td>${safeDays(metric.last_6m)}</td>`;
    html += `<td>${metric.last_3m === null ? "Not enough data" : safeDays(metric.last_3m)}</td>`;

    // Trend indicator
    let trend = '<span class="trend-indicator trend-neutral">—<span class="sr-only">Stable</span></span>';
    if (metric.last_3m !== null && metric.last_6m !== null) {
      const isGettingLonger = metric.last_3m > metric.last_6m;
      if (isGettingLonger) {
        trend = '<span class="trend-indicator trend-up"><span class="trend-arrow">↑</span><span class="sr-only">Getting longer</span></span>';
      } else if (metric.last_3m < metric.last_6m) {
        trend = '<span class="trend-indicator trend-down"><span class="trend-arrow">↓</span><span class="sr-only">Getting shorter</span></span>';
      }
    }
    html += `<td>${trend}</td>`;
    html += `</tr>`;
  });

  tbody.innerHTML = html;
}

function renderOutcomes(data) {
  const outcomes = data.outcomes || {};
  const approvalPct = outcomes.approval_pct || 0;

  // Approval bar
  const bar = document.getElementById("approvalBar");
  bar.innerHTML = `<div class="approval-fill" style="width: ${approvalPct}%; background: linear-gradient(90deg, var(--color-gold), var(--color-navy));">
    <span>${Math.round(approvalPct)}%</span>
  </div>`;

  // Outcome grid
  const grid = document.getElementById("outcomeGrid");
  const outcomeTypes = [
    { label: "Approved", key: "approved", outcomes },
    { label: "Cleared", key: "cleared", outcomes },
    { label: "Not approved", key: "not_approved", outcomes },
    { label: "Denied", key: "denied", outcomes },
  ];

  let html = "";
  outcomeTypes.forEach((outcome) => {
    const count = outcomes[outcome.key] || 0;
    html += `<div class="outcome-item">`;
    html += `<p class="outcome-count">${count}</p>`;
    html += `<p class="outcome-label">${outcome.label}</p>`;
    html += `</div>`;
  });

  grid.innerHTML = html;

  // Note
  const total = outcomes.total || 0;
  document.getElementById("outcomesNote").textContent = `Based on ${total} interviews reported.`;
}

function renderPassportReturn(data) {
  const statsCards = document.querySelectorAll("#passport .stat-card");

  if (statsCards[0]) {
    statsCards[0].innerHTML = `<p class="stat-value">${safeDays(data.key_stats?.avg_mail_days)}</p><p class="stat-label">Mail return (avg days)</p>`;
  }
  if (statsCards[1]) {
    statsCards[1].innerHTML = `<p class="stat-value">${safeDays(data.key_stats?.avg_pickup_days)}</p><p class="stat-label">In-person pickup (avg days)</p>`;
  }
  if (statsCards[2]) {
    statsCards[2].innerHTML = `<p class="stat-value">${safeDays(data.key_stats?.avg_passport_days)}</p><p class="stat-label">Overall average (avg days)</p>`;
  }
  if (statsCards[3]) {
    statsCards[3].innerHTML = `<p class="stat-value">${safeDays(data.key_stats?.median_passport_days)}</p><p class="stat-label">Overall median (days)</p>`;
  }
}

function renderStageTimes(data) {
  const container = document.getElementById("stageTimes");
  const stageAvgs = data.stage_avgs || {};

  const stages = [
    { name: "Petition to I-130 Approval", days: stageAvgs.pd_to_approval },
    { name: "Approval to NVC Welcome", days: stageAvgs.approval_to_welcome },
    { name: "NVC Welcome to Fees Paid", days: stageAvgs.welcome_to_fees },
    { name: "Fees to Docs Submitted", days: stageAvgs.fees_to_docs },
    { name: "Docs Submitted to Document Check", days: stageAvgs.docs_to_dq },
    { name: "I-130 Approval to Document Check", days: stageAvgs.approval_to_dq },
    { name: "Interview Letter to Medical", days: stageAvgs.il_to_medical },
    { name: "Interview to Passport Collection", days: stageAvgs.interview_to_passport },
  ];

  let html = "";
  stages.forEach((stage) => {
    html += `<div class="stage-card-tracker">`;
    html += `<h4>${stage.name}</h4>`;
    html += `<p class="stat-value" style="margin: var(--space-4) 0; color: var(--color-gold);">${safeDays(stage.days)}</p>`;
    html += `<p class="stat-label">days (average)</p>`;
    html += `</div>`;
  });

  container.innerHTML = html;
}

function showErrorState() {
  document.getElementById("weekWidget").innerHTML =
    '<div class="error-message">Live data is temporarily unavailable. Check back shortly.</div>';
}

document.addEventListener("DOMContentLoaded", renderTracker);
