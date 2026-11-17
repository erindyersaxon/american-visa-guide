// Relationship evidence chapters and the timeline builder.
// Used by /tools/relationship-evidence (Chapter field, printed timeline).
// The example page and the "Tell it as a story" table copy these titles and
// layers as static HTML; test/relationship-evidence.test.js keeps them in step.
(function () {
  'use strict';

  var CHAPTERS = [
    { key: 'met', title: 'First meeting', optional: false,
      layers: ['A photo from the day', 'Tickets or a booking for the event', 'Messages from that day or the next'] },
    { key: 'dating', title: 'Getting to know each other', optional: false,
      layers: ['Flights and boarding passes', 'Hotel bookings', 'Photos from each visit'] },
    { key: 'engaged', title: 'Engagement', optional: false,
      layers: ['Photos of the engagement', 'Marriage licence or notice of marriage'] },
    { key: 'wedding', title: 'Wedding', optional: false,
      layers: ['Payments to the venue and suppliers', 'Photos with your guests', 'Marriage certificate'] },
    { key: 'home', title: 'Living together', optional: true,
      layers: ['Lease or mortgage in both names', 'Utility bills at the same address', 'Naming each other as insurance beneficiaries'] },
    { key: 'children', title: 'Children', optional: true,
      layers: ['Birth certificates naming you both', 'Photos', 'Insurance covering the child'] },
    { key: 'after', title: 'After the wedding', optional: false,
      layers: ['Travel records for each visit', 'Photos', 'Messages'] }
  ];

  function isBlank(row) {
    return !row.date && !row.what && !row.backup && !(row.imgs && row.imgs.length);
  }

  function buildTimeline(photos, messages) {
    var groups = {};
    var order = CHAPTERS.map(function (c) { return c.key; });
    var seq = 0;
    function add(kind, rows) {
      (rows || []).forEach(function (row, i) {
        if (isBlank(row)) return;
        var key = order.indexOf(row.chapter) === -1 ? 'other' : row.chapter;
        (groups[key] = groups[key] || []).push({
          kind: kind, n: i + 1, date: row.date || '', what: row.what || '', backup: row.backup || '', _seq: seq++
        });
      });
    }
    add('photo', photos);
    add('message', messages);

    return CHAPTERS.concat([{ key: 'other', title: 'Other' }])
      .filter(function (c) { return groups[c.key]; })
      .map(function (c) {
        var items = groups[c.key].sort(function (a, b) {
          if (a.date !== b.date) {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return a.date < b.date ? -1 : 1;
          }
          return a._seq - b._seq;
        }).map(function (it) {
          return { kind: it.kind, n: it.n, date: it.date, what: it.what, backup: it.backup };
        });
        return { key: c.key, title: c.title, items: items };
      });
  }

  var api = { CHAPTERS: CHAPTERS, buildTimeline: buildTimeline };
  if (typeof window !== 'undefined') window.AVG_STORY = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
