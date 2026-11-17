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

  // The kinds of proof USCIS lists that a marriage is bona fide (6 USCIS-PM B.6;
  // 8 CFR 204.2). A record made at the time by a bank, landlord, insurer or
  // registrar outweighs a photo, so these stand alone with no photo beside them.
  var DOC_TYPES = [
    { key: 'property', title: 'Property you own together', examples: 'Deed or mortgage in both names' },
    { key: 'lease', title: 'Lease showing you live together', examples: 'Tenancy agreement in both names' },
    { key: 'finances', title: 'Shared finances', examples: 'Joint bank account, joint tax return, bills in both names' },
    { key: 'children', title: 'Birth certificate of your child', examples: 'Long-form certificate naming you both' },
    { key: 'other', title: 'Other record made at the time', examples: 'Insurance naming each other, wedding invoices, bookings in both names' }
  ];
  function docTitle(key) {
    for (var i = 0; i < DOC_TYPES.length; i++) if (DOC_TYPES[i].key === key) return DOC_TYPES[i].title;
    return '';
  }

  // A row counts once anything besides its chapter is filled in.
  function isBlank(row) {
    if (row.imgs && row.imgs.length) return false;
    return !Object.keys(row).some(function (k) { return k !== 'chapter' && k !== 'imgs' && row[k]; });
  }

  function buildTimeline(photos, messages, docs) {
    var groups = {};
    var order = CHAPTERS.map(function (c) { return c.key; });
    var seq = 0;
    function add(kind, rows) {
      (rows || []).forEach(function (row, i) {
        if (isBlank(row)) return;
        var key = order.indexOf(row.chapter) === -1 ? 'other' : row.chapter;
        var what = row.what || (kind === 'document' ? docTitle(row.type) : '');
        (groups[key] = groups[key] || []).push({
          kind: kind, n: i + 1, date: row.date || '', what: what, backup: row.backup || '', _seq: seq++
        });
      });
    }
    // Documents first, so on a shared date the strongest evidence leads.
    add('document', docs);
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

  var api = { CHAPTERS: CHAPTERS, DOC_TYPES: DOC_TYPES, buildTimeline: buildTimeline };
  if (typeof window !== 'undefined') window.AVG_STORY = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
