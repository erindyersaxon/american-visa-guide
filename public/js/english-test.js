/*
   American Visa Guide: naturalization English test study data
   Single source of truth for english-test.html and the printable
   English flashcards (PDF and Google Doc). Transcribed verbatim from:

   VOCAB: USCIS, "Reading Vocabulary for the Naturalization Test" and
     "Writing Vocabulary for the Naturalization Test" (rev. 07/14).
     Every word in the reading and writing sentences on the test comes
     from these lists.
   INTERVIEW: USCIS, "Guide to the USCIS Practice Test 'Vocabulary for
     the Naturalization Interview: Self-Test 2'", key words and
     synonyms 1 to 20.
 */
(function () {
  'use strict';

  const VOCAB = {
    reading: [
      {"group": "People", "words": ["Abraham Lincoln", "George Washington"]},
      {"group": "Civics", "words": ["American flag", "Bill of Rights", "capital", "citizen", "city", "Congress", "country", "Father of Our Country", "government", "President", "right", "Senators", "state/states", "White House"]},
      {"group": "Places", "words": ["America", "United States", "U.S."]},
      {"group": "Holidays", "words": ["Presidents’ Day", "Memorial Day", "Flag Day", "Independence Day", "Labor Day", "Columbus Day", "Thanksgiving"]},
      {"group": "Question Words", "words": ["How", "What", "When", "Where", "Who", "Why"]},
      {"group": "Verbs", "words": ["can", "come", "do/does", "elects", "have/has", "is/are/was/be", "lives/lived", "meet", "name", "pay", "vote", "want"]},
      {"group": "Other (function words)", "words": ["a", "for", "here", "in", "of", "on", "the", "to", "we"]},
      {"group": "Other (content words)", "words": ["colors", "dollar bill", "first", "largest", "many", "most", "north", "one", "people", "second", "south"]}
    ],
    writing: [
      {"group": "People", "words": ["Adams", "Lincoln", "Washington"]},
      {"group": "Civics", "words": ["American Indians", "capital", "citizens", "Civil War", "Congress", "Father of Our Country", "flag", "free", "freedom of speech", "President", "right", "Senators", "state/states", "White House"]},
      {"group": "Places", "words": ["Alaska", "California", "Canada", "Delaware", "Mexico", "New York City", "United States", "Washington", "Washington, D.C."]},
      {"group": "Months", "words": ["February", "May", "June", "July", "September", "October", "November"]},
      {"group": "Holidays", "words": ["Presidents’ Day", "Memorial Day", "Flag Day", "Independence Day", "Labor Day", "Columbus Day", "Thanksgiving"]},
      {"group": "Verbs", "words": ["can", "come", "elect", "have/has", "is/was/be", "lives/lived", "meets", "pay", "vote", "want"]},
      {"group": "Other (function words)", "words": ["and", "during", "for", "here", "in", "of", "on", "the", "to", "we"]},
      {"group": "Other (content words)", "words": ["blue", "dollar bill", "fifty/50", "first", "largest", "most", "north", "one", "one hundred/100", "people", "red", "second", "south", "taxes", "white"]}
    ],
  };

  const INTERVIEW = [
    ['habitually', 'often'],
    ['verify', 'prove something is true'],
    ['marital status', 'married, divorced, single, or widowed'],
    ['swear', 'promise'],
    ['registered', 'signed up'],
    ['spouse', 'husband or wife'],
    ['current home address', 'where you live now'],
    ['date of birth', 'when you were born'],
    ['advocated', 'supported'],
    ['failed to', 'did not (do something)'],
    ['federal', 'U.S. government'],
    ['exempt', 'to not have to (do something)'],
    ['prior', 'before'],
    ['pending', 'has not been… yet'],
    ['have you ever', 'in your lifetime, have you…'],
    ['member', 'someone who belongs to…'],
    ['resident', 'someone who lives in…'],
    ['requested', 'asked for'],
    ['disability', 'physical or mental impairment'],
    ['dependents', 'someone you support financially'],
  ];

  window.AVG_ENGLISH_TEST = { VOCAB: VOCAB, INTERVIEW: INTERVIEW };
})();
