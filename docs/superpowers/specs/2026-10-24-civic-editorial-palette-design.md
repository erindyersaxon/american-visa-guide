# Civic Editorial palette: design

Date: 2026-10-24
Status: approved section by section in brainstorming; awaiting spec review

## Goal

Replace the cream and steel-blue palette (approved June 2026) with a "Civic
Editorial" look: deep slate structure, off-white pages, crisp 1px borders,
modest radii, and red used only as a sparing editorial mark. The site should
read as a sober civic reference, not a template.

What Erin asked for: palette slate `#0F172A`, red `#991B1B`, off-white
`#F8FAFC`, border `#E2E8F0`; a serif heading font with a clean sans body;
borders instead of drop shadows; `rounded-md` on cards and buttons; tokens
updated and applied to the layout chrome.

Context that shaped the design:

- The site has no Tailwind. Styling is plain CSS with custom properties
  (`public/css/*.css`) plus inline `<style>` blocks in pages. "Tailwind
  config" in the brief means the CSS tokens.
- Gradients, backdrop blurs and glows were already removed in `d7ec490`.
  What remains is 42 `box-shadow` uses and pill radii on buttons and chips.
- The audience is anxious applicants. Red must not read as an alarm, so it
  never fills buttons or links.

## Out of scope

- Renaming legacy tokens (`--color-gold` meaning slate is confusing; that is a
  separate mechanical follow-up).
- Chart and choropleth colours on `/data` (they encode data, not brand).
- Role colours: Petitioner `#1A5FB4`, Beneficiary `#1E6B34`, Either `#6A3D9A`
  stay exactly as they are.
- `print.css` rules, except hex values the static check flags.
- The stale `american-visa-guide/` snapshot folder.

## Approach

Approach A: keep the legacy token names and change their values in
`public/css/design-system.css` (and the token block in `public/css/main.css`).
A one-off script, `scripts/civic-palette-swap.py`, rewrites hardcoded hex
values (about 290 in CSS files, 195 in inline page styles) using an explicit
old-to-new map, the same way `scripts/palette-swap.py` did in June. New
concepts get new tokens. A comment block at the top of the token file maps
each legacy name to its real role.

## 1. Palette tokens

Contrast figures are against `#F8FAFC` unless noted.

| Role | Legacy token(s) | New value | Notes |
|---|---|---|---|
| Page background | `--color-bg` | `#F8FAFC` | |
| Card surface | `--color-surface` | `#FFFFFF` | |
| Alt section | `--color-surface-alt`, `--color-bg-alt` | `#F1F5F9` | |
| Border | `--color-border` | `#E2E8F0` | Decorative only (about 1.2:1) |
| Strong border, inputs | `--color-border-strong` | `#64748B` | 4.6:1, meets 3:1 for controls |
| Text | `--color-text` | `#0F172A` | 17:1 |
| Secondary text | `--color-text-secondary` | `#334155` | |
| Muted text | `--color-text-muted` | `#475569` | Slate-500 fails AA, so stop at 600 |
| Structural | `--color-navy` / `-dark` / `-light` / `-xlight` | `#0F172A` / `#020617` / `#334155` / `#F1F5F9` | Nav, footer, primary buttons |
| Primary hover | `--color-primary-hover` | `#1E293B` | |
| Links, old accent | `--color-gold`, `--accent`, `--teal` (and variants) | `#0F172A`, links underlined | Link hover turns `#991B1B` |
| Red mark (new) | `--color-mark` | `#991B1B` | 7.6:1 |
| Red mark on slate (new) | `--color-mark-on-dark` | `#F87171` | 6:1 on `#0F172A` |
| Error, destructive | `--color-error`, `--color-destructive` | `#7F1D1D`, tint `#FEF2F2` | Always with an icon and the word "Error" |
| Success | `--color-success` | `#4A6B50` | Unchanged; `--color-success-subtle` becomes `#EFF5F0` |
| Warning | `--color-warning` | `#875325` | Unchanged; `-subtle` `#FBF5EC`, `-border` `#E5CFA8` |
| Info | `--color-info`, `--color-info-subtle` | `#0F172A`, `#F1F5F9` | Follows the old accent to slate |
| Shadows | `--shadow-sm` / `-md` / `-lg` | `none` | |
| Overlay shadow (new) | `--shadow-overlay` | `0 1px 2px rgba(15,23,42,.08)` | Menus and tooltips only |

The red mark is allowed in exactly these places: the `h1 em` / `h1 span`
highlight word, section eyebrows, section top rules, link hover, the active
nav indicator, the "Visa" word in the nav brand, and the skip-link outline.

## 2. Typography and components

**Type.** (Revised 2026-10-24 during planning: `public/css/readability.css`,
added 22 Oct, loads last on every page and sets `--font-display` to Public
Sans on purpose, following GOV.UK and USWDS. Erin chose to keep that.)

- Headings and body stay Public Sans. `readability.css` typography is not
  changed, and neither are the `--font-display` definitions it overrides.
- Source Serif 4 replaces Georgia on the nav wordmark (`.nav-brand-text` in
  `public/css/nav.css`) only, at weight 600. It is loaded by an `@import` at
  the top of `nav.css`, subset with the Google Fonts `text=` parameter to the
  characters of "American Visa Guide", with `display=swap`.
- The wordmark stack is `'Source Serif 4', Georgia, 'Iowan Old Style', serif`.

**Radius.**

- Buttons, CTAs, filter chips and cards use `--radius-md` (0.375rem).
- Small status pills and tags use `--radius-sm` (0.25rem).
- Radii of 10px or more drop to `--radius-md`.
- Rule for exceptions: an element keeps `50%` or `--radius-full` only if it is
  drawn as a circle or a line (equal width and height, such as step markers
  and indicator dots, or a 2px bar such as the nav toggle lines). Every other
  `--radius-full`, `9999px` or `999px` use moves.

**Shadows.** Each of the 42 uses goes into one of three groups:

1. Elevation (cards, panels, stat tiles): removed; the element gets
   `1px solid var(--color-border)`. Hover changes the border to
   `--color-border-strong` instead of lifting the element.
2. Floating layers (nav dropdown, mobile menu, tooltips): a 1px border plus
   `--shadow-overlay`.
3. Focus rings: the GOV.UK yellow focus in `readability.css` (links, buttons,
   inputs) stays exactly as it is. Component focus halos in
   `components.css` are recoloured to a 2px `#0F172A` ring with a 2px offset
   (`#7F1D1D` for the destructive variant).

**Buttons.**

- Primary: `#0F172A` fill, white text, `--radius-md`; hover `#1E293B`.
- Secondary: off-white with a 1px `--color-border-strong` border and slate
  text.
- Destructive: `#7F1D1D`.
- Red never fills a button outside error and destructive states.

## 3. Nav, banner, footer, brand mark

These files: `public/js/nav.js`, `public/css/nav.css`.

**Brand mark.**

- The tile goes from `#ece5d6` to `#F8FAFC`.
- The chevrons stay red `#bf3b3b` then flag-blue `#2e4a7d`.
- Make the same edit in all three places: `public/favicon.svg`, the
  `.nav-brand-mark` SVG in `public/js/nav.js`, and
  `scripts/og-image-source.html`. Then re-render `public/images/og-home.png`
  (1200x630, headless Chrome).

**Nav (`.site-nav`).**

| Part | Treatment |
|---|---|
| Bar | Background `#0F172A`, 1px bottom border `#1E293B`, no shadow |
| Links | `#CBD5E1` (about 12:1); hover text `#F8FAFC` on `#1E293B` |
| Active link (`aria-current`, `--active`) | White on `#1E293B`, 2px `#F87171` bottom bar |
| Brand text | Off-white; the "Visa" span is `#F87171` |
| Support link | `--radius-md`, 1px `#475569` border, off-white text |
| Focus outline (`.nav-link:focus-visible`) | 2px `#F8FAFC`; the GOV.UK yellow fill from `readability.css` still applies |

**Banner (`.site-banner`).** `#1E293B`, one step lighter than the nav. Links
are off-white and underlined.

**Mobile menu and toggle.**

- The panel is `#0F172A` with a `#334155` top border and `--shadow-overlay`.
  The `0 10px 20px` shadow is removed.
- The toggle has a 1px `#334155` border, `#CBD5E1` bars, and `--radius-md`.

**Skip link.** Off-white background, slate text, 2px `#991B1B` outline.

**Footer (`.avg-footer`).**

- Background `#0F172A`; text `#CBD5E1`; muted text `#94A3B8` (about 7:1).
- Links are off-white and underlined; hover `#F87171`.
- Separators are `#1E293B` hairlines.

## 4. Verification and rollout

The repo has no test suite, so verification is three layers.

**Static checks.** A script in `scripts/`, run before the browser pass, fails
on any of these:

- An old-palette hex value (a key of the swap map) appears in `public/`. The
  only allowed exceptions are the brand chevrons `#bf3b3b` and `#2e4a7d`.
- A `box-shadow` appears outside `--shadow-overlay`, focus rings,
  `readability.css` and `print.css`.
- A full radius (`--radius-full`, `9999px`, `999px`, `50%`) appears on
  anything other than the circle and line elements listed in the plan.
- A token pair in section 1 or section 3 misses WCAG AA: 4.5:1 for text,
  3:1 for UI borders.
- `nav.css` does not import Source Serif 4, or `.nav-brand-text` does not
  use it.

**Browser pass.** All 52 pages, at 1280px and 375px.

- No horizontal overflow and no console errors.
- The nav, mobile menu, banner and footer render.
- Role colour labels are unchanged.
- Keyboard: the focus ring is visible on the nav and on the page, and the skip
  link appears on Tab.
- Closer screenshot review of:
  - home
  - the `/guide` hub and one stage page
  - `/data` (confirm chart colours still read on `#F8FAFC`)
  - `/interview-dates`
  - one checklist
  - the I-864 decision tree
  - `/news`

**Print.** Print preview of one checklist and the interview-day sheet: black on
white, no shadows.

**Cache busting.** Bump `?v=` to the ship date on every page for each CSS or
JS file that changes. For example, `nav.css` and `nav.js` are on 50 pages, and
`design-system.css` is on 14.

**Rollout.** Pushing to `main` deploys production on Vercel, so the steps run
in this order:

1. Build and verify locally on a branch.
2. Erin reviews the screenshots.
3. Push only after Erin approves.
4. Afterwards, update the palette memory note to describe Civic Editorial.
