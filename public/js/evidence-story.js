// Relationship evidence chapters and the timeline builder.
// Used by /tools/relationship-evidence (Chapter field, printed timeline).
// Three sets: spouse (CHAPTERS, DOC_TYPES) and parent and child
// (PARENT_CHAPTERS, PARENT_DOC_TYPES), and brother or sister
// (SIBLING_CHAPTERS, SIBLING_DOC_TYPES); setFor(kind) picks one.
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

  // Parent and child (IR2, F1, F2A, F2B, F3, IR5, and F4 through a parent).
  // Themed on what 8 CFR 204.2(d)(2)(iii) asks a father to show: support,
  // instruction and general welfare, and that parent and child lived together
  // or the parent held the child out as their own.
  var PARENT_CHAPTERS = [
    { key: 'birth', title: 'Birth', optional: false,
      layers: ['Full birth certificate naming the parent', 'Parents\u2019 marriage certificate or legitimation record, if any', 'Photos from the first weeks'] },
    { key: 'step', title: 'Step relationship', optional: true,
      layers: ['Marriage certificate dated before the child turned 18', 'Divorce or death records ending both spouses\u2019 earlier marriages', 'Photos of the family together'] },
    { key: 'adopted', title: 'Adoption', optional: true,
      layers: ['Adoption decree from before the child turned 16', 'Court or government custody order', 'Records showing where the child and the birth parents lived'] },
    { key: 'support', title: 'Financial support', optional: false,
      layers: ['Bank transfers or money order receipts', 'Receipts for school fees or medical bills', 'Messages about money for the child'] },
    { key: 'school', title: 'Schooling', optional: false,
      layers: ['School records naming the parent', 'Reports or letters sent to the parent', 'Photos from school events'] },
    { key: 'together', title: 'Living together', optional: true,
      layers: ['School, doctor or tenancy records at the same address', 'Photos at home', 'Affidavits from neighbors'] },
    { key: 'visits', title: 'Visits and contact', optional: true,
      layers: ['Travel records for each visit', 'Photos from each visit', 'Messages and call logs'] },
    { key: 'welfare', title: 'Care and welfare', optional: false,
      layers: ['Insurance or medical records naming the child', 'Letters and cards between you', 'Affidavits from people who saw it'] }
  ];

  // Brother or sister (F4). A chain of civil records, one chapter per link:
  // the petitioner's status, each birth, the shared parent's marriages, and
  // the cases that need more (8 CFR 204.2(g)(1)-(2), (g)(5)).
  var SIBLING_CHAPTERS = [
    { key: 'status', title: 'Your US citizenship', optional: false,
      layers: ['US passport, naturalization certificate or US birth certificate', 'A date of birth showing you were 21 or older when you filed'] },
    { key: 'pet-birth', title: 'Your birth', optional: false,
      layers: ['Your full birth certificate naming the parent you share', 'Your parents\u2019 marriage certificate, if you share a father'] },
    { key: 'ben-birth', title: 'Your sibling\u2019s birth', optional: false,
      layers: ['Your sibling\u2019s full birth certificate naming the parent you share', 'Their parents\u2019 marriage certificate, if you share a father'] },
    { key: 'marriages', title: 'Parents\u2019 marriages and divorces', optional: true,
      layers: ['Marriage certificate for each marriage of the shared father', 'Divorce or death record ending each earlier marriage'] },
    { key: 'names', title: 'Name changes', optional: true,
      layers: ['Marriage certificate', 'Deed poll or court order'] },
    { key: 'father', title: 'Relationship with your father', optional: true,
      layers: ['Legitimation record, or the parents\u2019 later marriage', 'Records made at the time showing his support', 'Affidavits from people who knew the family'] },
    { key: 'adoption', title: 'Adoption or step relationship', optional: true,
      layers: ['Adoption decree and custody records', 'Marriage creating the step relationship, before the child turned 18'] }
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
  // The records 8 CFR 204.2(d)(2) names for a parent and child, primary
  // evidence first, then the contemporaneous records that show a bona fide
  // parent-child relationship.
  var PARENT_DOC_TYPES = [
    { key: 'birthcert', title: 'Birth certificate naming the parent', examples: 'Full certificate from the civil registry' },
    { key: 'legitimation', title: 'Legitimation or parents\u2019 marriage', examples: 'Parents\u2019 marriage certificate, or a court or registry record' },
    { key: 'adoption', title: 'Adoption or custody record', examples: 'Adoption decree, court custody order' },
    { key: 'step', title: 'Marriage creating the step relationship', examples: 'Stepparent\u2019s marriage certificate, dated before the child turned 18' },
    { key: 'divorce', title: 'Divorce or death record', examples: 'Decree ending an earlier marriage, or a death certificate' },
    { key: 'support', title: 'Financial support', examples: 'Bank transfers, money order receipts, canceled checks' },
    { key: 'school', title: 'School record', examples: 'Admission forms or reports naming the parent' },
    { key: 'medical', title: 'Medical or insurance record', examples: 'Records listing the child as a dependent or beneficiary' },
    { key: 'other', title: 'Other record made at the time', examples: 'Tax returns, letters between you, court or benefit records' }
  ];

  var SIBLING_DOC_TYPES = [
    { key: 'status', title: 'Proof of US citizenship', examples: 'US passport, naturalization certificate, US birth certificate' },
    { key: 'birthcert', title: 'Full birth certificate', examples: 'From the civil registry, naming the parents' },
    { key: 'marriage', title: 'Parents\u2019 marriage certificate', examples: 'One for each marriage of the shared father' },
    { key: 'divorce', title: 'Divorce or death record', examples: 'Decree ending an earlier marriage, or a death certificate' },
    { key: 'namechange', title: 'Name change record', examples: 'Marriage certificate, deed poll, court order' },
    { key: 'legitimation', title: 'Legitimation or parent-child record', examples: 'Legitimation record, or records showing the father\u2019s support' },
    { key: 'adoption', title: 'Adoption or custody record', examples: 'Adoption decree, court custody order' },
    { key: 'other', title: 'Other record made at the time', examples: 'Religious, school or census record when a certificate is missing' }
  ];

  // kind is 'spouse' (the default), 'parent' or 'sibling'.
  function setFor(kind) {
    if (kind === 'parent') return { chapters: PARENT_CHAPTERS, docTypes: PARENT_DOC_TYPES };
    if (kind === 'sibling') return { chapters: SIBLING_CHAPTERS, docTypes: SIBLING_DOC_TYPES };
    return { chapters: CHAPTERS, docTypes: DOC_TYPES };
  }
  function docTitle(key, kind) {
    var types = setFor(kind).docTypes;
    for (var i = 0; i < types.length; i++) if (types[i].key === key) return types[i].title;
    return '';
  }

  // A row counts once anything besides its chapter is filled in.
  function isBlank(row) {
    if (row.imgs && row.imgs.length) return false;
    return !Object.keys(row).some(function (k) { return k !== 'chapter' && k !== 'imgs' && row[k]; });
  }

  function buildTimeline(photos, messages, docs, relation) {
    var groups = {};
    var chapters = setFor(relation).chapters;
    var order = chapters.map(function (c) { return c.key; });
    var seq = 0;
    function add(kind, rows) {
      (rows || []).forEach(function (row, i) {
        if (isBlank(row)) return;
        var key = order.indexOf(row.chapter) === -1 ? 'other' : row.chapter;
        var what = row.what || (kind === 'document' ? docTitle(row.type, relation) : '');
        (groups[key] = groups[key] || []).push({
          kind: kind, n: i + 1, date: row.date || '', what: what, backup: row.backup || '', _seq: seq++
        });
      });
    }
    // Documents first, so on a shared date the strongest evidence leads.
    add('document', docs);
    add('photo', photos);
    add('message', messages);

    return chapters.concat([{ key: 'other', title: 'Other' }])
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

  var api = { CHAPTERS: CHAPTERS, DOC_TYPES: DOC_TYPES, PARENT_CHAPTERS: PARENT_CHAPTERS,
    PARENT_DOC_TYPES: PARENT_DOC_TYPES, SIBLING_CHAPTERS: SIBLING_CHAPTERS,
    SIBLING_DOC_TYPES: SIBLING_DOC_TYPES, setFor: setFor, buildTimeline: buildTimeline };
  if (typeof window !== 'undefined') window.AVG_STORY = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
