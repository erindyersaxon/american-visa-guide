# Post-Deployment Testing Checklist
**Site:** americanvisaguide.com  
**Deployment Date:** [DATE]  
**Tested By:** [NAME]

---

## 🌐 URL Routing & Clean URLs

### Test Clean URL Redirects
- [ ] https://americanvisaguide.com/index.html → redirects to /
- [ ] https://americanvisaguide.com/guide.html → redirects to /guide
- [ ] https://americanvisaguide.com/life.html → redirects to /life
- [ ] https://americanvisaguide.com/worksheet-ds260.html → redirects to /worksheet-ds260
- [ ] https://americanvisaguide.com/worksheet-i864.html → redirects to /worksheet-i864
- [ ] https://americanvisaguide.com/public-charge.html → redirects to /public-charge
- [ ] https://americanvisaguide.com/workbook.html → redirects to /workbook
- [ ] https://americanvisaguide.com/checklist-medical.html → redirects to /checklist-medical

### Test Clean URLs Work
- [ ] https://americanvisaguide.com/ loads homepage
- [ ] https://americanvisaguide.com/guide loads guide page
- [ ] https://americanvisaguide.com/worksheet-ds260 loads DS-260 form
- [ ] https://americanvisaguide.com/life loads post-arrival guide
- [ ] https://americanvisaguide.com/privacy loads privacy policy

### Test GitHub Pages Redirects (Legacy)
- [ ] https://americanvisaguide.com/erindyersaxon.github.io/london-visa-tracker/ redirects to americanvisaguide.com/
- [ ] https://americanvisaguide.com/erindyersaxon.github.io/american-visa-guide/ redirects to americanvisaguide.com/

---

## 🔐 Environment Variables & Supabase

### Environment Variables Setup
- [ ] SUPABASE_URL added to Vercel Environment Variables
- [ ] SUPABASE_ANON_KEY added to Vercel Environment Variables
- [ ] Build log shows successful sed substitution of env vars
- [ ] Variables NOT visible in source code (no .env file in repo)

### Test Environment Variables Loading
Open browser DevTools Console and run:
```javascript
console.log(window.ENV.SUPABASE_URL);
console.log(window.ENV.SUPABASE_ANON_KEY);
```
- [ ] Both log valid values (not %%PLACEHOLDER%% format)
- [ ] No 404 errors for /js/env.js

### Test Supabase Connection
- [ ] Homepage loads IL drop statistics table
- [ ] Community data displays (member stats, settlement data)
- [ ] Timeline data renders on /life page
- [ ] No 401/403 errors in Network tab from Supabase
- [ ] No CORS errors in Console

### Test Fallback Behavior
Intentionally break Supabase key in Vercel:
- [ ] "Data unavailable" message displays gracefully
- [ ] Static fallback data shows instead
- [ ] No console errors blocking page
- [ ] Page is still usable without data

---

## 📱 Mobile Testing (iPhone Safari)

### Navigation & Layout
- [ ] Hamburger menu opens/closes
- [ ] Mobile nav menu items are tappable (44px+)
- [ ] No horizontal scrolling
- [ ] All text readable (font size 16px+)
- [ ] Images scale responsively

### Forms (Worksheets)
- [ ] DS-260 form inputs are tappable
- [ ] I-864 form inputs don't zoom on focus
- [ ] Keyboard doesn't cover form inputs
- [ ] Copy button works and provides visual feedback
- [ ] Print button opens print dialog

### Data Display
- [ ] Community data cards stack vertically
- [ ] Tables scroll horizontally if needed
- [ ] Expandable sections (accordions) work
- [ ] Collapsible sections work with tap

### Performance
- [ ] Page loads in < 3 seconds
- [ ] Scrolling is smooth (no jank)
- [ ] Images load without layout shift
- [ ] No console errors visible

---

## 💻 Desktop Browser Testing (Chrome, Safari, Firefox)

### Chrome
- [ ] All pages load correctly
- [ ] Console has no errors
- [ ] Data loads from Supabase
- [ ] Print preview works

### Safari
- [ ] All pages load correctly
- [ ] Clarity analytics visible in Network tab
- [ ] localStorage working for theme toggle
- [ ] Print preview works

### Firefox
- [ ] All pages load correctly
- [ ] Console has no errors
- [ ] External links open in new tabs

---

## 🔒 Security Headers

### Verify Headers with curl
```bash
curl -I https://americanvisaguide.com
```

Check for:
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Permissions-Policy: camera=(), microphone=(), geolocation=()
- [ ] X-XSS-Protection: 1; mode=block

### Verify SSL/TLS
- [ ] HTTPS enforced (not HTTP)
- [ ] SSL certificate valid
- [ ] No mixed content warnings in console

---

## ⚡ Performance & Lighthouse

### Run Lighthouse Audit
```bash
lighthouse https://americanvisaguide.com --view
```

**Target Scores:**
- [ ] Performance: ≥90 (target: actual score ___)
- [ ] Accessibility: 100 (actual: ___)
- [ ] Best Practices: ≥95 (actual: ___)
- [ ] SEO: ≥90 (actual: ___)

### Key Metrics
- [ ] Largest Contentful Paint (LCP): < 2.5s
- [ ] Cumulative Layout Shift (CLS): < 0.1
- [ ] First Input Delay (FID): < 100ms

### Network Tab Analysis
- [ ] CSS files cached (Cache-Control: max-age=31536000)
- [ ] JS files cached (Cache-Control: max-age=31536000)
- [ ] Images cached (Cache-Control: max-age=31536000)
- [ ] Total page load < 2 seconds

---

## 🎨 Visual & Functionality

### Homepage (/index.html)
- [ ] Hero section displays correctly
- [ ] IL system diagram visible
- [ ] Community data table loads
- [ ] Stats cards display (members, avg time, etc.)
- [ ] Navigation menu works
- [ ] Footer displays with privacy link

### Worksheets (DS-260 & I-864)
- [ ] Form inputs clear on page refresh
- [ ] Copy button works
- [ ] Copy includes section headers and labels
- [ ] Print button works
- [ ] Form validation messages display

### Public Charge Page
- [ ] Template sections display
- [ ] Email template shows
- [ ] Placeholders in [brackets] visible
- [ ] Copy button works

### Life/Post-Arrival Guide
- [ ] Expandable sections work
- [ ] Community data loads (settlement table)
- [ ] Signal group links work
- [ ] Forms-at-a-glance grid displays

### Privacy Policy
- [ ] All sections readable
- [ ] External links work
- [ ] Email link (mailto:) works

---

## 🍪 GDPR & Privacy

### Cookie Notice
- [ ] Appears on first page visit
- [ ] Message mentions Microsoft Clarity
- [ ] "OK" button dismisses notice
- [ ] Notice doesn't reappear (sessionStorage)
- [ ] Notice reappears after closing browser

### Privacy Policy
- [ ] Footer link to /privacy works on all pages
- [ ] Privacy page loads correctly
- [ ] Contains all required GDPR information
- [ ] Email for privacy requests is functional

### Worksheet Privacy
- [ ] Enter data into DS-260
- [ ] Refresh page
- [ ] Data is cleared (not in form fields)
- [ ] Close tab and reopen
- [ ] Data is not restored

### Analytics
- [ ] Microsoft Clarity script loads (check Network tab)
- [ ] No personal data visible in Clarity recordings
- [ ] Session replays available in Clarity dashboard

---

## ♿ Accessibility (WCAG 2.1 AA)

### Keyboard Navigation
- [ ] Tab key navigates through form fields
- [ ] Shift+Tab navigates backward
- [ ] Enter key activates buttons
- [ ] Esc closes modals/menus
- [ ] Focus outline visible on all interactive elements

### Screen Reader (macOS VoiceOver)
- [ ] Skip link announced first
- [ ] Headings announced with level (H1, H2, etc.)
- [ ] Form labels associated with inputs
- [ ] Button purposes announced
- [ ] External links indicated

### Visual
- [ ] Text color contrast ≥4.5:1 for normal text
- [ ] External link underlines visible
- [ ] Focus outlines 2px and visible
- [ ] Links distinguishable by more than color

### Motion
On Mac: System Preferences → Accessibility → Display → Reduce motion
- [ ] Animations disabled
- [ ] Transitions disabled
- [ ] Page still usable with reduced motion

---

## 📊 Analytics

### Vercel Analytics
- [ ] Dashboard shows traffic
- [ ] Page load times displayed
- [ ] Top pages listed
- [ ] Real User Monitoring active

### Microsoft Clarity
- [ ] Dashboard shows session count
- [ ] Heatmaps available
- [ ] Session replays working
- [ ] No PII visible in recordings

---

## 🧪 Edge Cases

### Old Browsers (if supporting IE11)
- [ ] Graceful degradation
- [ ] No JavaScript errors
- [ ] Content still accessible

### Slow Network (Throttle to 3G in DevTools)
- [ ] Page loads completely
- [ ] Skeleton loaders appear
- [ ] Data eventually loads
- [ ] Fallback displays if connection lost

### Offline (Use DevTools offline mode)
- [ ] Worksheet page still works (no network request)
- [ ] Data page shows fallback message
- [ ] Navigation still works

### Large Worksheets (Fill in all fields)
- [ ] Form doesn't break
- [ ] Copy functionality still works
- [ ] Print layout still works

---

## 🚀 Final Sign-Off

| Item | Status | Notes |
|------|--------|-------|
| URL Routing | ✅ / ❌ | |
| Environment Variables | ✅ / ❌ | |
| Supabase Connection | ✅ / ❌ | |
| Mobile Testing | ✅ / ❌ | |
| Security Headers | ✅ / ❌ | |
| Lighthouse Scores | ✅ / ❌ | |
| GDPR Compliance | ✅ / ❌ | |
| Accessibility | ✅ / ❌ | |
| Analytics | ✅ / ❌ | |

**Overall Status:** 
- [ ] ✅ All tests passed — READY FOR PRODUCTION
- [ ] ⚠️ Minor issues — Document below
- [ ] ❌ Critical issues — Do not deploy

**Issues Found:**
```
[List any issues and resolution]
```

**Tested By:** ________________  
**Date:** ________________  
**Sign-Off:** ________________

---

**Deploy with confidence! 🚀**
