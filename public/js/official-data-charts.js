/* Charts for the "National Picture" section of /data.
   The tables in #official-data are the single source: every chart reads its
   numbers from them, so updating a table row updates the chart. Plain SVG,
   no library. Colours come from the --viz-* tokens defined in data.html. */
(function () {
  'use strict';

  var SVG = 'http://www.w3.org/2000/svg';
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var QUARTER_OF = { Jan: 'Q1', Apr: 'Q2', Jul: 'Q3', Oct: 'Q4' };

  function num(td) { return Number(td.textContent.replace(/[^0-9.]/g, '')); }

  function compact(n) {
    if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'K';
    return String(n);
  }

  function el(name, attrs, parent) {
    var node = document.createElementNS(SVG, name);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }

  function text(parent, x, y, str, cls, anchor) {
    var t = el('text', { x: x, y: y, class: cls, 'text-anchor': anchor || 'middle' }, parent);
    t.textContent = str;
    return t;
  }

  /* Column path: square at the baseline, 4px rounded data-end. */
  function columnPath(x, y, w, h, rounded) {
    var r = rounded ? Math.min(4, w / 2, h) : 0;
    return 'M' + x + ',' + (y + h) + 'V' + (y + r) +
      (r ? 'Q' + x + ',' + y + ' ' + (x + r) + ',' + y : '') +
      'H' + (x + w - r) +
      (r ? 'Q' + (x + w) + ',' + y + ' ' + (x + w) + ',' + (y + r) : '') +
      'V' + (y + h) + 'Z';
  }

  function niceMax(v, step) { return Math.ceil(v / step) * step; }

  /* ---------- data ---------- */

  function readQuarters(tableId) {
    var rows = document.querySelectorAll('#' + tableId + ' tbody tr');
    return Array.prototype.map.call(rows, function (tr) {
      var label = tr.querySelector('th').firstChild.textContent.trim(); // "Oct–Dec 2023"
      var tds = tr.querySelectorAll('td');
      var year = label.slice(-4);
      return {
        label: label,
        q: QUARTER_OF[label.slice(0, 3)],
        year: year,
        received: num(tds[0]),
        approved: num(tds[1]),
        denied: num(tds[2]),
        rate: Number(tds[3].textContent.replace('%', ''))
      };
    });
  }

  function readMonths(tableId) {
    var rows = document.querySelectorAll('#' + tableId + ' tbody tr');
    return Array.prototype.map.call(rows, function (tr) {
      var label = tr.querySelector('th').textContent.trim(); // "Feb 2026"
      var tds = tr.querySelectorAll('td');
      return { label: label, m: label.slice(0, 3), year: label.slice(-4), pause: num(tds[0]), other: num(tds[1]) };
    });
  }

  /* ---------- tooltip ---------- */

  var tip;
  function showTip(target, title, lines) {
    if (!tip) {
      tip = document.createElement('div');
      tip.className = 'od-tip';
      tip.setAttribute('role', 'presentation');
      document.body.appendChild(tip);
    }
    tip.textContent = '';
    var h = document.createElement('div');
    h.className = 'od-tip__title';
    h.textContent = title;
    tip.appendChild(h);
    lines.forEach(function (l) {
      var row = document.createElement('div');
      row.className = 'od-tip__row';
      if (l.key) {
        var k = document.createElement('span');
        k.className = 'od-tip__key';
        k.style.background = 'var(' + l.key + ')';
        row.appendChild(k);
      }
      var v = document.createElement('strong');
      v.textContent = l.value;
      row.appendChild(v);
      var n = document.createElement('span');
      n.textContent = ' ' + l.name;
      row.appendChild(n);
      tip.appendChild(row);
    });
    tip.style.display = 'block';
    var r = target.getBoundingClientRect();
    var tw = tip.offsetWidth;
    var left = Math.max(8, Math.min(window.innerWidth - tw - 8, r.left + r.width / 2 - tw / 2));
    var top = r.top - tip.offsetHeight - 8;
    if (top < 8) top = r.bottom + 8;
    tip.style.left = left + window.scrollX + 'px';
    tip.style.top = top + window.scrollY + 'px';
  }
  function hideTip() { if (tip) tip.style.display = 'none'; }

  function bindHover(node, container, title, lines) {
    node.setAttribute('tabindex', '0');
    node.setAttribute('role', 'img');
    node.setAttribute('aria-label', title + ': ' + lines.map(function (l) { return l.value + ' ' + l.name; }).join(', '));
    var on = function () { container.classList.add('is-hovering'); node.classList.add('is-active'); showTip(node, title, lines); };
    var off = function () { container.classList.remove('is-hovering'); node.classList.remove('is-active'); hideTip(); };
    node.addEventListener('pointerenter', on);
    node.addEventListener('pointerleave', off);
    node.addEventListener('focus', on);
    node.addEventListener('blur', off);
  }

  /* ---------- shared frame ---------- */

  function frame(host, height, padLeft) {
    host.textContent = '';
    var w = Math.max(280, host.clientWidth);
    var pad = { top: 22, right: 8, bottom: 38, left: padLeft };
    var svg = el('svg', { width: w, height: height, viewBox: '0 0 ' + w + ' ' + height, class: 'od-svg', 'aria-hidden': 'false' }, host);
    return { svg: svg, w: w, h: height, pad: pad, iw: w - pad.left - pad.right, ih: height - pad.top - pad.bottom };
  }

  function yAxis(f, max, ticks, fmt) {
    var g = el('g', { class: 'od-axis' }, f.svg);
    ticks.forEach(function (t) {
      var y = f.pad.top + f.ih - (t / max) * f.ih;
      el('line', { x1: f.pad.left, x2: f.w - f.pad.right, y1: y, y2: y, class: t === 0 ? 'od-baseline' : 'od-grid' }, g);
      text(g, f.pad.left - 6, y + 4, fmt(t), 'od-tick', 'end');
    });
  }

  /* x labels: quarter on line 1, year on line 2 only where the year changes */
  function xLabels(f, items, slot, top, bottom) {
    var g = el('g', {}, f.svg);
    var lastYear = null;
    items.forEach(function (d, i) {
      var cx = f.pad.left + slot * i + slot / 2;
      text(g, cx, f.pad.top + f.ih + 15, top(d), 'od-tick');
      var yr = bottom(d);
      // A year starting on the first column would collide with the next year's label one slot over
      var crowded = i === 0 && items[1] && bottom(items[1]) !== yr;
      if (yr !== lastYear && !crowded) { text(g, cx, f.pad.top + f.ih + 29, yr, 'od-tick od-tick--year'); lastYear = yr; }
    });
  }

  /* ---------- chart 1: approvals ---------- */

  function approvalsChart(host, data) {
    var f = frame(host, 240, 40);
    var max = niceMax(Math.max.apply(null, data.map(function (d) { return d.approved; })), 50000);
    var ticks = []; for (var t = 0; t <= max; t += 50000) ticks.push(t);
    yAxis(f, max, ticks, compact);
    var slot = f.iw / data.length;
    var bw = Math.min(24, slot - 6);
    var peak = data.reduce(function (a, d) { return d.approved > a.approved ? d : a; }, data[0]);
    var last = data[data.length - 1];
    data.forEach(function (d, i) {
      var h = (d.approved / max) * f.ih;
      var x = f.pad.left + slot * i + (slot - bw) / 2;
      var y = f.pad.top + f.ih - h;
      var g = el('g', { class: 'od-hit' }, f.svg);
      el('rect', { x: f.pad.left + slot * i, y: f.pad.top, width: slot, height: f.ih, class: 'od-hitarea' }, g);
      el('path', { d: columnPath(x, y, bw, h, true), class: 'od-mark', style: 'fill: var(--viz-s1)' }, g);
      if (d === peak || d === last) text(f.svg, x + bw / 2, y - 6, compact(d.approved), 'od-value');
      bindHover(g, host, d.label, [
        { key: '--viz-s1', value: d.approved.toLocaleString('en-US'), name: 'approved' },
        { value: d.denied.toLocaleString('en-US'), name: 'denied' }
      ]);
    });
    xLabels(f, data, slot, function (d) { return d.q; }, function (d) { return d.year; });
  }

  /* ---------- chart 2: denial rate ---------- */

  function denialChart(host, data) {
    var f = frame(host, 240, 40);
    var max = niceMax(Math.max.apply(null, data.map(function (d) { return d.rate; })) + 1, 5);
    var ticks = []; for (var t = 0; t <= max; t += 5) ticks.push(t);
    yAxis(f, max, ticks, function (v) { return v + '%'; });
    var slot = f.iw / data.length;
    var pts = data.map(function (d, i) {
      return [f.pad.left + slot * i + slot / 2, f.pad.top + f.ih - (d.rate / max) * f.ih];
    });
    el('path', { d: 'M' + pts.map(function (p) { return p.join(','); }).join('L'), class: 'od-line', style: 'stroke: var(--viz-s1)' }, f.svg);
    var first = 0, lastI = data.length - 1;
    data.forEach(function (d, i) {
      var g = el('g', { class: 'od-hit' }, f.svg);
      el('rect', { x: f.pad.left + slot * i, y: f.pad.top, width: slot, height: f.ih, class: 'od-hitarea' }, g);
      el('circle', { cx: pts[i][0], cy: pts[i][1], r: 4, class: 'od-dot', style: 'fill: var(--viz-s1)' }, g);
      if (i === first || i === lastI) text(f.svg, pts[i][0], pts[i][1] - 10, d.rate.toFixed(1) + '%', 'od-value', i === lastI ? 'end' : 'start');
      bindHover(g, host, d.label, [
        { key: '--viz-s1', value: d.rate.toFixed(1) + '%', name: 'denial rate' },
        { value: d.denied.toLocaleString('en-US'), name: 'denied' }
      ]);
    });
    xLabels(f, data, slot, function (d) { return d.q; }, function (d) { return d.year; });
  }

  /* ---------- chart 3: monthly visas, stacked ---------- */

  function visasChart(host, data) {
    var f = frame(host, 280, 40);
    f.pad.top = 30; f.ih = f.h - f.pad.top - f.pad.bottom;
    var max = niceMax(Math.max.apply(null, data.map(function (d) { return d.pause + d.other; })), 10000);
    var ticks = []; for (var t = 0; t <= max; t += 10000) ticks.push(t);
    yAxis(f, max, ticks, compact);
    var slot = f.iw / data.length;
    var bw = Math.min(24, slot - 4);
    var GAP = 2;
    var pauseStart = -1;
    data.forEach(function (d, i) {
      if (pauseStart < 0 && d.m === 'Jan' && d.year === '2026') pauseStart = i;
      var x = f.pad.left + slot * i + (slot - bw) / 2;
      var hOther = (d.other / max) * f.ih;
      var hPause = (d.pause / max) * f.ih;
      var base = f.pad.top + f.ih;
      var g = el('g', { class: 'od-hit' }, f.svg);
      el('rect', { x: f.pad.left + slot * i, y: f.pad.top, width: slot, height: f.ih, class: 'od-hitarea' }, g);
      var topIsPause = hPause > GAP + 1;
      el('path', { d: columnPath(x, base - hOther, bw, hOther, !topIsPause), class: 'od-mark', style: 'fill: var(--viz-s1)' }, g);
      if (topIsPause) {
        el('path', { d: columnPath(x, base - hOther - hPause, bw, hPause - GAP, true), class: 'od-mark', style: 'fill: var(--viz-s2)' }, g);
      }
      bindHover(g, host, d.label, [
        { key: '--viz-s2', value: d.pause.toLocaleString('en-US'), name: '75 pause countries' },
        { key: '--viz-s1', value: d.other.toLocaleString('en-US'), name: 'all other countries' },
        { value: (d.pause + d.other).toLocaleString('en-US'), name: 'total' }
      ]);
    });
    if (pauseStart > 0) {
      var px = f.pad.left + slot * pauseStart + slot * 0.6; // 21 January sits ~two-thirds into January
      el('line', { x1: px, x2: px, y1: f.pad.top - 14, y2: f.pad.top + f.ih, class: 'od-annot' }, f.svg);
      text(f.svg, px - 4, f.pad.top - 18, 'Pause from 21 Jan 2026', 'od-annot-label', 'end');
    }
    var last = data[data.length - 1];
    var lx = f.pad.left + slot * (data.length - 1) + slot / 2;
    var prev = data[data.length - 2];
    // Sit the label above the taller of the last two columns so it never overlaps a neighbour
    var ly = f.pad.top + f.ih - (Math.max(last.pause + last.other, prev.pause + prev.other) / max) * f.ih;
    text(f.svg, lx + bw / 2, ly - 6, compact(last.pause + last.other), 'od-value', 'end');
    xLabels(f, data, slot, function (d) { return d.m.charAt(0); }, function (d) { return d.year; });
  }

  /* ---------- mount ---------- */

  function render() {
    var q = readQuarters('od-ir-table');
    var m = readMonths('od-iv-table');
    var a = document.getElementById('od-chart-approvals');
    var r = document.getElementById('od-chart-denials');
    var v = document.getElementById('od-chart-visas');
    if (a && q.length) approvalsChart(a, q);
    if (r && q.length) denialChart(r, q);
    if (v && m.length) visasChart(v, m);
  }

  function init() {
    if (!document.getElementById('official-data')) return;
    render();
    var lastW = window.innerWidth, timer;
    window.addEventListener('resize', function () {
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      clearTimeout(timer);
      timer = setTimeout(render, 150);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
