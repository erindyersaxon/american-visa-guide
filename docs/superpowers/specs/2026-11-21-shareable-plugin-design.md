# Shareable American Visa Guide plugin: design

Date: 21 Nov 2026. Size: small project (one new skill, one adapted skill, packaging).

## Intent

Give people whose cases are at US Embassy London a Claude plugin that checks their own
circumstances against (1) official policy and (2) community experience as published in
The Guide on americanvisaguide.com. Recipients have no Supabase access; the plugin is
read-only and uses only the public site.

## Goals

- One entry point: a person describes their situation, the plugin tells them what policy
  says, what The Guide shows for their stage, and what needs an attorney.
- Live data: read The Guide pages and `/api/data` at answer time, so no re-release is
  needed when the site updates.
- Keep naturalization guidance (N-400 eligibility and date math) for people past the
  green card.

## Non-goals

- Any write path: no Supabase, no corrections sent back to Erin, no tracker maintenance.
- Writing copy for the site.

## Anti-goals (a failure even if it works)

- Presenting the Discord or its moderators as connected to Erin or the site. The Discord
  is independent; never "our Discord" or "the site's Discord".
- Showing any member username. `/api/data` includes `username_raw` as `name` in the
  this-week lists (upcoming interviews, medicals, flights, DQ, I-130 approvals); use
  aggregated fields only.
- Analysing anything beyond The Guide's scope (prior refusal, overstay, criminal history,
  long administrative processing, and similar): no odds, no other members' outcomes, no
  workarounds. Point to a US immigration attorney and stop on that part.
- Exposing Erin's surname, employer, or the public repo URL.
- Community experience stated as policy.

## Constraints

- Unknown site URLs return the homepage with HTTP 200. Confirm each fetched page by its
  `<title>`, not its status.
- Timeline stats: median and IQR only, never mean; suppress below n=10, warn for n=10 to
  30, stable at n of 30 or more.
- Credit Track My Visa as an external source if referenced; never claim it.
- US spelling, no em dashes, plain second person.

## Approaches considered

- **A. One "check my case" skill plus naturalization (chosen).** Single entry point, the
  attorney rule lives in one place, and policy and community experience come back together.
- B. Adapt existing skills separately. Less new writing, but "is my case normal?" needs two
  skills firing at once and the attorney rule would be duplicated and could drift.
- C. Minimal edit of today's plugin. Fastest, but policy-check is a pre-publication copy
  reviewer and would answer personal questions like an editor.

## Decided

- Build A. Distribute as a zip file.
- Drop `il-drop-update` and `site-copy-style` from the shared build (copy rules that matter
  for answers move into the new skill).
- Manifest: author "Erin", no repository field, homepage stays americanvisaguide.com.
- Out-of-scope rule applies per issue: answer the in-scope parts, attorney for the rest.

## Shape

```
american-visa-guide-public/
  .claude-plugin/plugin.json
  README.md                       # for recipients: what it does, needs web fetch, not legal advice
  skills/
    case-check/SKILL.md           # new
    case-check/references/
      guide-map.md                # stage -> Guide URL + expected <title>; /api/data fields to use and to never use
      source-map.md               # carried from policy-check
      london-standards.md         # carried, ownership wording removed
      out-of-scope.md             # triggers that route to an attorney
    naturalization/SKILL.md       # carried, "Discord mode" removed, site-ownership wording removed
    naturalization/references/core-rules.md
```

case-check answer, in three parts: **What policy says** (with citations), **What The Guide
shows for your stage** (Guide page link, median, IQR, n), **Talk to an immigration
attorney about** (only if triggered).

## Left to the builder

- Exact trigger phrases in skill descriptions.
- Wording of the README disclaimer.
- Where the zip is built (outside the repo, so it is never pushed).
