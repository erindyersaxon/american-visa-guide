/*
   /data "Wait times by phase": card wording and rendering for the phases list
   that /api/data publishes. Cards reuse the .stat-row / .stat-box classes from
   css/guide-article.css. Browser: window.AVGPhaseCards. Node (tests): module.exports.
   Spec: docs/superpowers/specs/2026-10-25-data-phase-cards-design.md
 */
(function (root) {
  'use strict';

  const WINDOWS = { 180: 'last 6 months', 270: 'last 9 months', 365: 'last 12 months', 545: 'last 18 months', 730: 'last 2 years' };

  function formatDays(days) {
    return days === 1 ? '1 day' : days + ' days';
  }

  function formatMonths(days) {
    return '≈ ' + (days / 30.44).toFixed(1) + ' months';
  }

  function windowLabel(windowDays) {
    return windowDays == null ? 'all reports' : (WINDOWS[windowDays] || 'last ' + windowDays + ' days');
  }

  function cardView(phase) {
    const hidden = phase.suppressed || phase.median == null;
    const parts = [];
    if (!hidden && phase.p25 != null && phase.p75 != null) parts.push('most: ' + phase.p25 + '–' + phase.p75 + ' days');
    if (!hidden && phase.median >= 60) parts.push(formatMonths(phase.median));
    parts.push(phase.n + ' members');
    if (phase.still_waiting > 0) parts.push(phase.still_waiting + ' still waiting');
    parts.push(windowLabel(phase.window_days));
    if (phase.all_time_median != null) parts.push('all-time median ' + formatDays(phase.all_time_median));
    if (!hidden && phase.small_sample) parts.push('small sample');
    return { value: hidden ? 'Not enough reports yet' : formatDays(phase.median), source: parts.join(' · ') };
  }

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function render(container, phases, groups) {
    if (!container) return;
    container.replaceChildren();
    if (!Array.isArray(phases) || !phases.length || !Array.isArray(groups)) {
      container.append(el('p', 'phase-cards-empty', 'Phase timings are temporarily unavailable.'));
      return;
    }
    groups.forEach(function (g) {
      const inGroup = phases.filter(function (p) { return p.group === g.key; });
      if (!inGroup.length) return;
      container.append(el('h3', 'phase-group', g.label));
      const row = el('div', 'stat-row');
      inGroup.forEach(function (p) {
        const view = cardView(p);
        const box = el('div', 'stat-box');
        box.dataset.phase = p.key;
        box.append(el('p', 'stat-box__value', view.value), el('p', 'stat-box__label', p.label), el('p', 'stat-box__source', view.source));
        row.append(box);
      });
      container.append(row);
    });
  }

  const api = { formatDays, formatMonths, windowLabel, cardView, render };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AVGPhaseCards = api;
})(typeof window !== 'undefined' ? window : this);
