/*
   American Visa Guide: Embassy and visa news
   Single source of truth for the news list on /news.

   HOW ITEMS GET HERE
     A daily job (scripts/news/collect.mjs) finds candidate items and puts
     them in a review queue (data/news-queue.json). Nothing reaches this
     file until it is approved:

       npm run news:review                         list pending items
       npm run news:review -- approve <id> --note "What it means for you"
       npm run news:review -- reject <id> [<id> ...]
       npm run news:review -- add --type community --source "r/NationalVisaCenter" \
           --title "..." --url "https://..." --date 2026-10-23 --note "..."

     Use `add` for things no feed can reach: Reddit threads, Instagram
     posts, emails members forward.

   EDITING BY HAND
     The ITEMS block below is rewritten by review.mjs, so it must stay
     valid JSON (double quotes, no trailing commas). Fields:
       id      any unique string
       date    YYYY-MM-DD, the date the source published it
       type    'official' | 'press' | 'community'
       source  who published it, e.g. "US Embassy London"
       title   headline, as published
       url     link to the original
       note    optional: one or two plain-English sentences on what it
               means for a family visa applicant at London

   Mounts: <div data-news></div> on /news (full list with filters), and
   <div data-news data-news-limit="3" data-news-compact></div> on the
   homepage (headlines only, each linking to its full entry on /news). Bump ?v= on the script tag in BOTH pages after edits.
 */
(function () {
  'use strict';

  // BEGIN NEWS ITEMS
  const ITEMS = [
    {
      "id": "visa-bulletin-2026-12",
      "date": "2026-11-13",
      "type": "official",
      "source": "US Department of State",
      "title": "Visa Bulletin for December 2026",
      "url": "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html",
      "note": "For F2A (spouses and children of green card holders), the final action date is 22 November 2026 for every country except Mexico (22 May 2026), and F2A filing dates are current. The State Department warns that dates may move backwards in the coming months to keep visa numbers within the annual limits. Below is what each part of the bulletin means if you hold a green card and are sponsoring family, using the words you will see on forums. See also the [glossary](/glossary) and [what changes when you become a citizen](/naturalization/after-citizenship#f2b).",
      "points": [
        {
          "label": "Priority date (PD)",
          "text": "Your place in the queue. It is the date USCIS received the I-130, printed on the receipt notice (NOA1). Each month the bulletin gives a cut-off date for every category and country. When forum posts say \"my PD is current\", they mean their priority date is earlier than the cut-off date in their row."
        },
        {
          "label": "Final Action Date (FAD)",
          "text": "The chart that decides when a visa can actually be issued. Your case can only be scheduled for an interview once your priority date is earlier than this date. December: F2A 22 November 2026 (Mexico 22 May 2026); F2B 22 August 2020 (Mexico 15 May 2010, Philippines 1 October 2013)."
        },
        {
          "label": "Dates for Filing (DFF)",
          "text": "The earlier chart. Once your priority date is earlier than this date, NVC invites you to pay the fees and submit the DS-260 and documents, so the case is ready when the final action date reaches you. December: F2A is \"C\" for every country; F2B 1 September 2020 (Mexico 22 March 2011, Philippines 1 October 2014). Relatives already in the US who are applying to adjust status check uscis.gov/visabulletininfo, where USCIS says each month which of the two charts it accepts."
        },
        {
          "label": "Current (\"C\")",
          "text": "\"C\" means there is no waiting line in that chart this month: any priority date qualifies. Because F2A filing dates are current, every F2A case can start its NVC paperwork as soon as the I-130 is approved."
        },
        {
          "label": "Chargeability and ROW",
          "text": "Which column you use is set by the beneficiary's country of birth, not their nationality or where they live. This is called chargeability. Only China (mainland born), India, Mexico and the Philippines have their own columns. Everyone else uses the column headed \"All Chargeability Areas Except Those Listed\", which forums call ROW (rest of world). Someone born in the UK uses ROW."
        },
        {
          "label": "Exempt from and subject to the per-country limit",
          "text": "This applies only to F2A. Three quarters of F2A visa numbers ignore the cap on how many visas one country can use (exempt); the rest count towards it (subject). In December, applicants from every country can use the exempt numbers if their priority date is before 22 May 2026. Applicants from every country except Mexico can also use the remaining numbers up to 22 November 2026. That is why Mexico's F2A date is earlier."
        },
        {
          "label": "Retrogression",
          "text": "When a date moves backwards. The bulletin says dates were moved forward in recent months because fewer immigrant visas are being issued under Proclamations 10949 and 10998, and that retrogression may be needed in the coming months. A case that is current one month can fall behind the next, so being current is not a promise of a visa. If your date is current, finish your NVC documents promptly."
        },
        {
          "label": "If you become a US citizen",
          "text": "When a green card holder naturalises, the petition converts automatically. An F2A spouse or child under 21 becomes an immediate relative, with no bulletin wait; children listed only as derivatives on a spouse's F2A petition need their own I-130. An F2B son or daughter moves to F1, unmarried son or daughter of a citizen, and can ask to stay in F2B if that line is faster. In December, F1 (22 January 2021) is ahead of F2B (22 August 2020) for ROW."
        }
      ],
      "sources": [
        {
          "label": "Visa Bulletin (US Department of State)",
          "url": "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html"
        },
        {
          "label": "Adjustment of status filing charts (USCIS)",
          "url": "https://www.uscis.gov/visabulletininfo"
        }
      ]
    },
    {
      "id": "c21373f918",
      "date": "2026-11-26",
      "type": "community",
      "source": "Reddit: r/K1VisaInfo, r/NationalVisaCenter",
      "title": "London: 16–26 November. Rebooked interviews keep getting approved; no first interview letters yet",
      "url": "",
      "note": "London is still working through the interviews it cancelled in the autumn, and most that went ahead this fortnight ended in approval. No one has reported a first interview letter for a case waiting at NVC. These are member reports, not an embassy announcement.",
      "period": {
        "from": "2026-11-16",
        "to": "2026-11-26"
      },
      "points": [
        {
          "label": "Interview letters and scheduling",
          "text": "Still no reports of a first interview letter. Applicants DQ'd in June and July 2026 posted on 20 and 25 November that they are still waiting. K-1 cases newly sent to London (shown as Ready in CEAC from 13 November) have no dates, and one commenter passed on a report that there are no new appointment slots through February; that is unconfirmed. One applicant said NVC is taking about 70 days to DQ."
        },
        {
          "label": "Reschedules",
          "text": "Interviews first set for September and rebooked for 13 November mostly went ahead, though some were moved again to January, as reported last week. One applicant whose 13 October interview was rebooked for 10 December is still waiting to see if it holds."
        },
        {
          "label": "Outcomes",
          "text": "Approvals continue for rebooked interviews, including a spouse visa on 17 November (collected from the courier three days later) and K-1 visas issued around 24 and 25 November. After approval, CEAC often flips between Administrative Processing and Approved for several days before Issued: one 13 November interview showed Issued about a week later. One applicant who resent their passport on 10 November after a 221(g) was still in administrative processing nine days later."
        },
        {
          "label": "Public charge and 221(g)",
          "text": "Officers are asking about job, education, work history, debts, savings and assets, and US health insurance plans, and asking for proof of each answer. A K-1 was refused under 221(g) around 24 November for more detail on the sponsor's assets and a budgeted plan for the beneficiary's education. Commenters report UK applicants previously on Universal Credit and out of work receiving 212(a)(4) refusals. Cases held in 221(g) since June still have no decision, and some expect a second interview under the new rules."
        }
      ],
      "sources": [
        {
          "label": "Visa interview questions: London Embassy",
          "url": "https://www.reddit.com/r/NationalVisaCenter/comments/1y18egy/"
        },
        {
          "label": "K-1 interview: embassy needs more documentation",
          "url": "https://www.reddit.com/r/K1VisaInfo/comments/1y4aoxr/"
        },
        {
          "label": "K-1 fiancé visa: London embassy appointment",
          "url": "https://www.reddit.com/r/K1VisaInfo/comments/1y3sp7j/"
        },
        {
          "label": "London 221(g) passport return timeline",
          "url": "https://www.reddit.com/r/NationalVisaCenter/comments/1y0hcap/"
        },
        {
          "label": "Second interview: London Embassy",
          "url": "https://www.reddit.com/r/NationalVisaCenter/comments/1xzse3v/"
        },
        {
          "label": "Concerns about being denied: US petitioner, UK beneficiary",
          "url": "https://www.reddit.com/r/K1VisaInfo/comments/1y597ee/"
        }
      ]
    },
    {
      "id": "8065982780",
      "date": "2026-11-23",
      "type": "official",
      "source": "CLINIC v. Rubio (S.D.N.Y.)",
      "title": "CLINIC plaintiffs ask the court to pause the public charge cables while the case goes on",
      "url": "https://storage.courtlistener.com/recap/gov.uscourts.nysd.657161/gov.uscourts.nysd.657161.140.0.pdf",
      "note": "On 23 November the plaintiffs asked the court for a preliminary injunction and a stay (ECF 140–142). They want the November 2025 public charge cable, the 2026 cables requiring the public charge worksheet and training (26 STATE 80666, 86164, 88862 and 89798) and the extra manager review of approvals paused until the case is decided. Their proposed order would also stop officers discounting an I-864 because a sponsor has received benefits, bar repeat interviews and delays based only on those cables, and require affected refusals to be reconsidered. The government's response is due 17 December and the plaintiffs' reply 30 December, so no decision is likely before January. Nothing changes for applicants until the court rules. See [public charge](/public-charge) and [why new interviews are waiting](/visa-pause#training)."
    },
    {
      "id": "i130-signs-of-recovery",
      "date": "2026-11-16",
      "type": "community",
      "source": "Track My Visa",
      "title": "I-130 Immediate Relative Consular Processing shows signs of recovery",
      "url": "https://trackmyvisa.com/blog/i130-ir-consular-processing-shows-signs-of-recovery",
      "note": "After about nine months stuck at priority dates around 25 February 2025, [Track My Visa](https://trackmyvisa.com/) now sees steady USCIS activity on IR consular I-130s. Among cases filed 1 January to 15 March 2025, weekly moves out of Received went from 0–6 in September to 22 and 19 in the first two weeks of November. That is still well below normal. By 19 November Track My Visa reported the front of the line had moved, with USCIS approving priority dates around 6 March 2025. Unofficial reports say USCIS field offices have started deciding these petitions, and recent approvals came from members near 16 field offices; USCIS has not confirmed this. Estimates stay broad for now, so keep planning around a long wait. If you have an IR consular I-130 pending, add your field office (find it with the [USCIS field office locator](https://www.uscis.gov/about-us/find-a-uscis-office/field-offices)) to your [Track My Visa](https://trackmyvisa.com/) dashboard. See [the I-130 stage](/guide/i130#i130-status)."
    },
    {
      "id": "8d5f5a83f1",
      "date": "2026-11-15",
      "type": "community",
      "source": "Reddit: r/NationalVisaCenter, r/K1VisaInfo and others",
      "title": "London this week: 8–15 November. Some rebooked interviews pushed again to January",
      "url": "",
      "note": "London is still working through interviews it cancelled in September. This week some of those rebooked November dates were moved again, to early January. Interviews that went ahead mostly ended in approval, with public charge now a regular topic. These are member reports, not an embassy announcement.",
      "period": {
        "from": "2026-11-08",
        "to": "2026-11-15"
      },
      "points": [
        {
          "label": "Interview letters and scheduling",
          "text": "London has not sent new interview letters since 14 July 2026, and no one reported one this week for a case waiting at NVC. State's court filings say each post must finish in-person public charge training before it processes new cases. Applicants DQ'd in June 2026 say they are still waiting, even though the scheduling tool lists June DQs for immediate relatives. Direct consular filing petitioners expect London to clear its rebooking backlog before it takes new filings."
        },
        {
          "label": "Reschedules and cancellations",
          "text": "Several K-1 and spousal applicants whose September interviews had been rebooked for 12 or 13 November were emailed, a day or two before, that the date had moved again to early January 2027. Others with 13 November dates still had their interviews and said only one window was open. Two applicants were turned away or rescheduled because their medical results had not reached the embassy. The panel physician allows 5 working days for results to arrive, so leave at least that between the medical and the interview."
        },
        {
          "label": "Outcomes",
          "text": "Applicants with rebooked September interviews reported approvals this week, including an IR-1 on 9 November. Approved cases typically spend 2 to 5 working days in administrative processing before CEAC shows Issued. One applicant interviewed on 6 November had their passport posted on 12 November."
        },
        {
          "label": "Public charge and 221(g)",
          "text": "Officers are asking about housing plans, health insurance, savings and work plans. One IR-1 applicant was approved with only a savings statement. At least two applicants were refused on public charge grounds (212(a)(4)), including an IR-1 family of five relying on a joint sponsor near the minimum. One K-1 was given a 221(g) for insurance and job-search evidence. Cases put in 221(g) in June to August report little movement after 4 to 5 months, though one August K-1 was automatically scheduled for a re-interview in late November."
        }
      ],
      "sources": [
        {
          "label": "It was moved.... again",
          "url": "https://www.reddit.com/r/K1VisaInfo/comments/1xsn3lj/it_was_moved_again/"
        },
        {
          "label": "London new interviews",
          "url": "https://www.reddit.com/r/NationalVisaCenter/comments/1xv9p6m/london_new_interviews/"
        },
        {
          "label": "London IR1 interview complete",
          "url": "https://www.reddit.com/r/NationalVisaCenter/comments/1xrrpwy/london_ir1_interview_complete/"
        },
        {
          "label": "Husband's IR-1 refused due to public charge",
          "url": "https://www.reddit.com/r/NationalVisaCenter/comments/1xssq6h/husbands_ir1_refused_due_to_public_charge/"
        },
        {
          "label": "Fiancé went to London K-1 interview, turned away",
          "url": "https://www.reddit.com/r/K1VisaInfo/comments/1xro25n/fiance_went_to_london_k1_interview_turned_away/"
        },
        {
          "label": "London IR1/CR1: latest DQ dates receiving interview letters",
          "url": "https://www.reddit.com/r/NationalVisaCenter/comments/1xwa498/london_ir1cr1_latest_dq_dates_receiving_interview/"
        }
      ]
    },
    {
      "id": "i130-renewed-activity",
      "date": "2026-11-11",
      "type": "community",
      "source": "Track My Visa",
      "title": "Early signs of renewed I-130 activity at the front of the line",
      "url": "https://trackmyvisa.com/i130",
      "note": "[Track My Visa](https://trackmyvisa.com/) reports more case activity on IR consular I-130s at the old front of the line (priority dates around 25 February 2025), though many of those cases still have no decision. It has heard unofficially that some USCIS field offices have started processing them; USCIS has not confirmed this, and [Track My Visa](https://trackmyvisa.com/) has not moved its front-of-line estimate, so plan around the stall. If you have an IR consular I-130 pending, add your USCIS field office to your [Track My Visa](https://trackmyvisa.com/) dashboard to help. See [the I-130 stage](/guide/i130#i130-status)."
    },
    {
      "id": "34a0db3234",
      "date": "2026-11-06",
      "type": "official",
      "source": "CLINIC v. Rubio (S.D.N.Y.)",
      "title": "CLINIC lawsuit now challenges the public charge cables behind interview delays",
      "url": "https://storage.courtlistener.com/recap/gov.uscourts.nysd.657161/gov.uscourts.nysd.657161.134.0.pdf",
      "note": "On 6 November the plaintiffs filed an amended complaint (ECF 134), which the court allowed on 21 October. Beyond the 75-country pause, it now challenges the November 2025 cable that set the State Department's public charge standards, the August and September 2026 cables requiring the public charge worksheet and the in-person training (26 STATE 80666, 86164, 88862 and 89798), and the extra manager review of approvals. It asks the court to set these aside and order posts to resume case-by-case decisions. Eleven plaintiffs joined and three withdrew. Nothing changes for applicants yet: the court has not ruled on the new claims. See [public charge](/public-charge) and [why new interviews are waiting](/interview/visa-pause#training)."
    },
    {
      "id": "reddit-2026-10-23-reschedules",
      "date": "2026-10-23",
      "type": "community",
      "source": "r/NationalVisaCenter",
      "title": "London emails new dates for interviews canceled in September and October",
      "url": "https://www.reddit.com/r/NationalVisaCenter/",
      "note": "Applicants report September interviews moved to November and October interviews moved to December. These are member reports, not an embassy announcement."
    },
    {
      "id": "clinic-defer",
      "date": "2026-10-23",
      "type": "official",
      "source": "CLINIC v. Rubio (S.D.N.Y.)",
      "title": "Department asks the court to hold off on deadlines",
      "url": "https://www.courtlistener.com/docket/72218277/catholic-legal-immigration-network-inc-v-rubio/",
      "note": "The Department told the court its review instructions have not changed and asked it not to set deadlines during the stay (ECF 132). The court has not ruled."
    },
    {
      "id": "london-pc-refusal",
      "date": "2026-10-22",
      "type": "community",
      "source": "Applicant report",
      "title": "London issues a public charge refusal under 212(a)(4)",
      "url": "/public-charge/refused#refused",
      "note": "A London applicant received a 212(a)(4) refusal form, so London has refused at least one applicant as likely to become a public charge. The form gives no reason. These are member reports, not an embassy announcement."
    },
    {
      "id": "ca2-stay",
      "date": "2026-10-19",
      "type": "official",
      "source": "CLINIC v. Rubio (2d Cir.)",
      "title": "Second Circuit temporarily stays the order on individual refusals",
      "url": "https://www.courtlistener.com/docket/74793181/catholic-legal-immigration-network-inc-v-rubio/",
      "note": "The Second Circuit temporarily stayed the part of the judgment that set aside individual refusals, while it decides the government's stay motion (ECF 126). The policy itself stays vacated: no post may apply the pause."
    },
    {
      "id": "clinic-deadline-hearing",
      "date": "2026-10-14",
      "type": "official",
      "source": "CLINIC v. Rubio (S.D.N.Y.)",
      "title": "Court hears argument on a deadline for pause cases",
      "url": "https://www.courtlistener.com/docket/72218277/catholic-legal-immigration-network-inc-v-rubio/",
      "note": "The court heard argument on whether to set a deadline for deciding pause cases."
    },
    {
      "id": "pause-resumed",
      "date": "2026-10-05",
      "type": "official",
      "source": "CLINIC v. Rubio (S.D.N.Y.)",
      "title": "All posts have resumed pause cases, which skip in-person training",
      "url": "https://www.courtlistener.com/docket/72218277/catholic-legal-immigration-network-inc-v-rubio/",
      "note": "The Department told the court that every immigrant visa post has resumed pause cases, and that pause cases are exempt from the in-person part of the public charge training. Between 21 August and 30 September officers decided about 706 pause cases again: roughly 318 approved, 388 refused (status report, ECF 96)."
    },
    {
      "id": "london-pause-approval",
      "date": "2026-10-02",
      "type": "official",
      "source": "CLINIC v. Rubio (S.D.N.Y.)",
      "title": "London approves a pause case refused in May",
      "url": "https://www.courtlistener.com/docket/72218277/catholic-legal-immigration-network-inc-v-rubio/",
      "note": "A London pause case refused on 15 May 2026 was approved after being called back, as reported in the CLINIC filings."
    },
    {
      "id": "ca2-stay-motion",
      "date": "2026-09-28",
      "type": "official",
      "source": "CLINIC v. Rubio (2d Cir.)",
      "title": "Government asks the Second Circuit for a stay",
      "url": "https://www.courtlistener.com/docket/74793181/catholic-legal-immigration-network-inc-v-rubio/",
      "note": "The government asked the Second Circuit to stay the CLINIC judgment while it appeals."
    },
    {
      "id": "clinic-no-pause",
      "date": "2026-09-25",
      "type": "official",
      "source": "CLINIC v. Rubio (S.D.N.Y.)",
      "title": "Court refuses to pause its judgment and asks about deadlines",
      "url": "https://www.courtlistener.com/docket/72218277/catholic-legal-immigration-network-inc-v-rubio/",
      "note": "On 24 September the court ordered the government to explain why it should not set a deadline for deciding pause cases (ECF 108). On 25 September it refused to pause its judgment (ECF 109)."
    },
    {
      "id": "london-first-pause-callback",
      "date": "2026-09-23",
      "type": "community",
      "source": "Applicant reports",
      "title": "London emails the first reported pause case an interview date",
      "url": "",
      "note": "The first reported London pause case was emailed a new interview date. These are member reports, not an embassy announcement."
    },
    {
      "id": "pause-queue",
      "date": "2026-09-21",
      "type": "official",
      "source": "Visa Office",
      "title": "Queue order set for pause cases",
      "url": "https://www.courtlistener.com/docket/72218277/catholic-legal-immigration-network-inc-v-rubio/",
      "note": "Cable 26 STATE 89798 (14 September) expanded daily manager review, and a Visa Office message of 21 September set the order: named plaintiffs and Chief of Mission exception cases first, then everyone else by refusal date. Approved cases get a further review (IVAR) before the visa prints. Both were filed in CLINIC (ECF 114-2, 114-3). See [who goes first](/interview/visa-pause#later)."
    },
    {
      "id": "pause-rescinded",
      "date": "2026-09-10",
      "type": "official",
      "source": "Cable 26 STATE 88862",
      "title": "State Department rescinds the pause; government appeals",
      "url": "https://www.courtlistener.com/docket/73529774/medani-v-trump/",
      "note": "Cable 26 STATE 88862 rescinds the pause in full: no one may be refused under 221(g) because of it. Posts must work pause refusals oldest first, write to applicants for anything missing (including new medicals), give the specific reason for any fresh 221(g), and complete the public charge worksheet in every case. The same day the government appealed CLINIC to the Second Circuit. The cable was filed in Medani v. Trump (ECF 95-1)."
    },
    {
      "id": "pause-43000",
      "date": "2026-09-08",
      "type": "official",
      "source": "CLINIC v. Rubio (S.D.N.Y.)",
      "title": "Department reports more than 43,000 pause refusals",
      "url": "https://www.courtlistener.com/docket/72218277/catholic-legal-immigration-network-inc-v-rubio/",
      "note": "The Department told the court that more than 43,000 applications were refused under the pause. It has given no date for finishing them."
    },
    {
      "id": "training-cable",
      "date": "2026-09-01",
      "type": "official",
      "source": "Cable 26 STATE 86164",
      "title": "Every consular section must finish in-person public charge training",
      "url": "https://www.courtlistener.com/docket/73529774/medani-v-trump/",
      "note": "Cable 26 STATE 86164 sets four public charge training requirements, and each consular section must finish in-person training before it processes immigrant visas. This is why new interviews are waiting. The cable was filed in Medani v. Trump (ECF 115-2). See [why pause cases move and new interviews do not](/interview/visa-pause#training)."
    },
    {
      "id": "clinic-aug31",
      "date": "2026-08-31",
      "type": "official",
      "source": "CLINIC v. Rubio (S.D.N.Y.)",
      "title": "Status conference: remanded cases should not face new public charge requirements",
      "url": "https://www.courtlistener.com/docket/72218277/catholic-legal-immigration-network-inc-v-rubio/",
      "note": "Judge Vargas said remanded cases should not face new public charge requirements. Government counsel agreed, but said some cases need re-evaluation and many will need new interviews, medicals and police certificates. This account paraphrases notes of the public call, checked against the filings."
    },
    {
      "id": "clinic-enforce",
      "date": "2026-08-26",
      "type": "official",
      "source": "CLINIC v. Rubio (S.D.N.Y.)",
      "title": "Plaintiffs ask the court to enforce the judgment",
      "url": "https://democracyforward.org/wp-content/uploads/2026/08/ECF-86-Mem.-iso-Motion-to-Enforce-1.pdf",
      "note": "The CLINIC plaintiffs filed an emergency motion to enforce the judgment (ECF 86)."
    },
    {
      "id": "clinic-vacated",
      "date": "2026-08-21",
      "type": "official",
      "source": "CLINIC v. Rubio (S.D.N.Y.)",
      "title": "Court strikes down the 75-country immigrant visa pause",
      "url": "https://storage.courtlistener.com/recap/gov.uscourts.nysd.657161/gov.uscourts.nysd.657161.83.0.pdf",
      "note": "In CLINIC v. Rubio the Southern District of New York vacated the pause. Vacatur removes the policy for everyone, not only the plaintiffs, and sets aside refusals made only because of it. Final judgment followed on 24 August. A separate pause on diversity visas was also struck down; it does not affect family immigrant visas. Full explanation: [the nationality visa pause, struck down](/interview/visa-pause)."
    },
    {
      "id": "pc-worksheet",
      "date": "2026-08-15",
      "type": "official",
      "source": "Cable 26 STATE 80666",
      "title": "Public charge worksheet made mandatory; interviews cancelled for training",
      "url": "https://www.courtlistener.com/docket/73529774/medani-v-trump/",
      "note": "Cable 26 STATE 80666 makes a public charge worksheet mandatory in every immigrant visa case. In early August the Department also launched global public charge training and began cancelling and rescheduling interviews. The cable was filed in Medani v. Trump (ECF 115-3)."
    },
    {
      "id": "pause-announced",
      "date": "2026-01-14",
      "type": "official",
      "source": "Department of State",
      "title": "State Department announces a 75-country immigrant visa pause",
      "url": "/interview/visa-pause#what",
      "note": "From 21 January 2026, officers were told to refuse under 221(g) every immigrant visa applicant from 75 countries the Department rated high risk for public charge. Nationality triggered it, not the embassy, so a non-UK passport holder interviewing in London could be caught."
    }
  ];
  // END NEWS ITEMS

  const TYPES = {
    official: { label: 'Official', hint: 'From a US government source' },
    press: { label: 'Press', hint: 'From a news outlet' },
    community: { label: 'Community', hint: 'Reported by applicants; not confirmed by the embassy' },
  };

  const CSS = `
    .news-filters { display:flex; flex-wrap:wrap; gap:0.5rem; margin:0 0 1.25rem; }
    .news-filters button { font:inherit; font-size:15px; padding:0.35rem 0.85rem; border-radius:var(--radius-md, 0.375rem); border:1px solid #cbd5e1; background:#fff; color:#1e293b; cursor:pointer; }
    .news-filters button[aria-pressed="true"] { background:#1e293b; border-color:#1e293b; color:#fff; }
    .news-list { list-style:none; margin:0; padding:0; }
    .news-item { padding:1rem 0; border-bottom:1px solid #e3ddd0; }
    .news-item:first-child { padding-top:0; }
    .news-item { scroll-margin-top:5rem; }
    .news-item--target { background:#fdf8e8; box-shadow:0 0 0 0.6rem #fdf8e8; border-radius:2px; }
    .news-meta { display:flex; flex-wrap:wrap; align-items:center; gap:0.5rem; font-size:14px; color:#334155; margin:0 0 0.3rem; }
    .news-tag { font-size:13px; font-weight:700; padding:0.1rem 0.5rem; border-radius:4px; }
    .news-tag--official { background:#e1ecf2; color:#24485a; }
    .news-tag--press { background:#efe9dc; color:#5a4a26; }
    .news-tag--community { background:#ece4f2; color:#4d2f6b; }
    .news-title { font-size:17px; font-weight:600; line-height:1.4; margin:0 0 0.3rem; }
    .news-title a { color:#1e293b; text-decoration:underline; text-underline-offset:2px; }
    .news-note { margin:0; line-height:1.55; max-width:none; }
    .news-note a { color:#1e293b; text-decoration:underline; text-underline-offset:2px; }
    .news-points { margin:0.5rem 0 0; padding-left:1.25rem; line-height:1.55; }
    .news-points li { margin:0 0 0.35rem; }
    .news-sources { margin:0.5rem 0 0; font-size:14px; color:#334155; line-height:1.55; }
    .news-sources a { color:#1e293b; text-decoration:underline; text-underline-offset:2px; }
    .news-empty { color:#334155; }
    .news-more { margin:1rem 0 0; }
    .news-more a { color:#1e293b; font-weight:600; text-decoration:underline; text-underline-offset:2px; }`;

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];

  function formatDate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return `${d} ${MONTHS[m - 1]} ${y}`;
  }

  // Weekly roundups cover a period: "8–15 November 2026".
  function formatRange({ from, to }) {
    const [fy, fm, fd] = from.split('-').map(Number);
    const [ty, tm, td] = to.split('-').map(Number);
    if (fy === ty && fm === tm) return `${fd}–${td} ${MONTHS[tm - 1]} ${ty}`;
    if (fy === ty) return `${fd} ${MONTHS[fm - 1]} – ${td} ${MONTHS[tm - 1]} ${ty}`;
    return `${formatDate(from)} – ${formatDate(to)}`;
  }

  function el(tagName, attrs, text) {
    const node = document.createElement(tagName);
    Object.entries(attrs || {}).forEach(([k, v]) => node.setAttribute(k, v));
    if (text != null) node.textContent = text;
    return node;
  }

  // Notes are plain text plus [label](/path or https://...) links.
  function noteNode(text) {
    const p = el('p', { class: 'news-note' });
    const rx = /\[([^\]]+)\]\((\/[^)\s]*|https?:\/\/[^)\s]+)\)/g;
    let last = 0, m;
    while ((m = rx.exec(text))) {
      p.append(document.createTextNode(text.slice(last, m.index)));
      const ext = /^https?:/.test(m[2]);
      p.append(el('a', ext ? { href: m[2], target: '_blank', rel: 'noopener noreferrer' } : { href: m[2] }, m[1]));
      last = rx.lastIndex;
    }
    p.append(document.createTextNode(text.slice(last)));
    return p;
  }

  function itemNode(item, compact) {
    const type = TYPES[item.type] || TYPES.press;
    // The id lets other pages link to one item: /news#<id>.
    const li = el('li', { class: 'news-item', 'data-type': item.type, id: item.id });

    const meta = el('p', { class: 'news-meta' });
    meta.append(
      el('span', { class: `news-tag news-tag--${item.type}`, title: type.hint }, type.label),
      el('time', { datetime: item.date }, item.period ? formatRange(item.period) : formatDate(item.date)),
      document.createTextNode('·'),
      el('span', null, item.source)
    );

    const title = el('p', { class: 'news-title' });
    if (compact) {
      // Headline only: link to the full entry on /news, where the summary,
      // points and source threads are.
      title.append(el('a', { href: '/news#' + item.id }, item.title));
      li.append(meta, title);
      return li;
    }
    if (/^https?:\/\//.test(item.url)) {
      title.append(el('a', { href: item.url, target: '_blank', rel: 'noopener noreferrer' }, item.title));
    } else if (/^\/[^/]/.test(item.url || '')) {
      title.append(el('a', { href: item.url }, item.title)); // a page on this site
    } else {
      title.textContent = item.title;
    }

    li.append(meta, title);
    if (item.note) li.append(noteNode(item.note));

    // Weekly roundup: one point per topic, then the threads it draws on.
    if (Array.isArray(item.points) && item.points.length) {
      const ul = el('ul', { class: 'news-points' });
      item.points.forEach((pt) => {
        const row = el('li');
        if (pt.label) row.append(el('strong', null, `${pt.label}: `));
        row.append(document.createTextNode(pt.text));
        ul.append(row);
      });
      li.append(ul);
    }
    if (Array.isArray(item.sources) && item.sources.length) {
      const p = el('p', { class: 'news-sources' }, 'From these threads: ');
      item.sources.filter((s) => /^https?:\/\//.test(s.url)).forEach((s, i) => {
        if (i) p.append(document.createTextNode(' · '));
        p.append(el('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer' }, s.label));
      });
      li.append(p);
    }
    return li;
  }

  function render(mount) {
    // data-news-limit="3" shows the newest three, without filters, plus a
    // link to the full list (the homepage). No limit: everything (/news).
    // data-news-compact shows headlines only.
    const limit = parseInt(mount.dataset.newsLimit, 10) || 0;
    const all = ITEMS.slice().sort((a, b) => b.date.localeCompare(a.date));
    const items = limit ? all.slice(0, limit) : all;
    const compact = mount.hasAttribute('data-news-compact');
    mount.replaceChildren();

    if (!items.length) {
      mount.append(el('p', { class: 'news-empty' }, 'No news yet.'));
      return;
    }

    const list = el('ul', { class: 'news-list' });
    items.forEach(i => list.append(itemNode(i, compact)));

    if (limit) {
      mount.append(list);
      const more = el('p', { class: 'news-more' });
      more.append(el('a', { href: '/news' }, all.length > limit ? `All ${all.length} news items →` : 'Embassy and visa news →'));
      mount.append(more);
      return;
    }

    const present = Object.keys(TYPES).filter(t => items.some(i => i.type === t));
    if (present.length > 1) {
      const bar = el('div', { class: 'news-filters', role: 'group', 'aria-label': 'Filter by source' });
      ['all', ...present].forEach(t => {
        const btn = el('button', { type: 'button', 'data-filter': t, 'aria-pressed': String(t === 'all') },
          t === 'all' ? 'All' : TYPES[t].label);
        btn.addEventListener('click', () => {
          bar.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
          list.querySelectorAll('.news-item').forEach(li => {
            li.hidden = t !== 'all' && li.dataset.type !== t;
          });
        });
        bar.append(btn);
      });
      mount.append(bar);
    }
    mount.append(list);
  }

  function init() {
    const mounts = document.querySelectorAll('[data-news]');
    if (!mounts.length) return;
    if (!document.getElementById('news-css')) {
      const st = el('style', { id: 'news-css' });
      st.textContent = CSS;
      document.head.append(st);
    }
    mounts.forEach(render);
    // Items render after load, so the browser's own jump to /news#<id>
    // has already happened (and missed). Do it now.
    const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target && target.classList.contains('news-item')) {
      target.classList.add('news-item--target');
      target.scrollIntoView();
    }
  }

  window.AVG_NEWS = { items: ITEMS, render: init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
