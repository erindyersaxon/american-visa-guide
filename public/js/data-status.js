/*
   American Visa Guide: the one-line interview letter status on /data.

   statusLine(drops, stats, today) -> { lead, rest }
     drops  newest first, each { drop_date, dq_date_to } (ISO dates), as
            fromApiData builds them in js/data-pages.js
     stats  { next_drop_window_start, next_drop_window_end } (ISO or null)
     today  a Date at UTC midnight

   The window states follow renderBanner (delayed, in range, approaching,
   outside). A drop in the last 7 days, inclusive, wins over all of them.
   Wording: docs/superpowers/specs/2026-11-26-data-section-split-design.md.
 */
(function () {
  'use strict';

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];
  const DAY = 86400000;

  function parse(iso) { return iso ? new Date(iso + 'T00:00:00Z') : null; }
  function long(date) {
    return date.getUTCDate() + ' ' + MONTHS[date.getUTCMonth()] + ' ' + date.getUTCFullYear();
  }
  function daysBetween(a, b) { return Math.round((b - a) / DAY); }

  /* Whole days from an ISO date (or date-time) to today's UTC midnight.
     js/data-pages.js uses this too, so every page counts the same way. */
  function daysSince(iso, today) {
    if (!iso) return null;
    return daysBetween(parse(String(iso).slice(0, 10)), today);
  }

  function statusLine(drops, stats, today) {
    const s = stats || {};
    const last = (drops || [])[0];
    const lastDate = parse(last && last.drop_date);
    const start = parse(s.next_drop_window_start);
    const end = parse(s.next_drop_window_end) || start;

    if (lastDate && daysBetween(lastDate, today) <= 7) {
      const dq = parse(last.dq_date_to);
      return {
        lead: 'New interview letters went out on ' + long(lastDate) + '.',
        rest: dq ? 'They covered cases ready by ' + long(dq) + '.' : '',
      };
    }

    let ago;
    if (lastDate) {
      const n = daysBetween(lastDate, today);
      ago = 'London last sent letters on ' + long(lastDate) + ', ' + n + (n === 1 ? ' day ago.' : ' days ago.');
    } else {
      ago = "We don't have a date for London's last letters yet.";
    }
    const expect = start ? 'Members expect the next batch from ' + long(start) + '.' : '';

    if (start) {
      const untilStart = daysBetween(today, start);
      const noDropInWindow = !lastDate || lastDate < start;
      if (today > end && noDropInWindow) {
        return { lead: 'No new interview letters yet.', rest: ago };
      }
      if (today >= start && today <= end) {
        return { lead: 'Letters could go out any day.', rest: ago };
      }
      if (untilStart > 0 && untilStart <= 7) {
        const lastShort = lastDate ? 'London last sent letters on ' + long(lastDate) + '.' : ago;
        return { lead: 'Letters may go out soon.', rest: expect + ' ' + lastShort };
      }
    }
    return { lead: 'No letters expected yet.', rest: expect ? ago + ' ' + expect : ago };
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { statusLine, daysSince };
  if (typeof window !== 'undefined') window.AVGDataStatus = { statusLine, daysSince };
})();
