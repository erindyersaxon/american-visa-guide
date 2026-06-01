# Vercel Deployment Guide
**Last Updated:** 30 May 2026

---

## Pre-Deployment Checklist

### ✅ Configuration Files
- [x] `vercel.json` — Complete with security headers, caching, and redirects
- [x] `public/js/env.js` — Template with placeholders for Supabase credentials
- [x] Build command — Includes env variable injection via sed

### ✅ HTML Pages
- [x] All pages load `/js/env.js` as first script in `<head>`
- [x] Environment variables accessible via `window.ENV` object
- [x] All external links have `rel="noopener noreferrer"`
- [x] Images have width/height attributes (prevents layout shift)
- [x] Images use `loading="lazy"` or `loading="eager"` as appropriate

### ✅ Security
- [x] No hardcoded credentials in source code
- [x] No personal data exposed in HTML
- [x] HTTPS enforced by Vercel
- [x] Security headers configured (X-Frame-Options, X-Content-Type-Options, etc.)
- [x] Referrer Policy configured for privacy

### ✅ GDPR & Privacy
- [x] Privacy policy page (`/privacy`)
- [x] Cookie notice on all pages
- [x] Worksheet data isolation (form fields only)
- [x] Microsoft Clarity loads asynchronously

### ✅ Accessibility (WCAG 2.1 AA)
- [x] Skip links on all pages
- [x] Focus indicators visible
- [x] Keyboard navigation supported
- [x] Reduced motion support

---

## Deployment Steps

### Step 1: Add Environment Variables to Vercel

1. Go to Vercel project settings
2. Navigate to **Settings → Environment Variables**
3. Add the following variables:

```
SUPABASE_URL = https://[your-project].supabase.co
SUPABASE_ANON_KEY = [your-anon-key]
```

⚠️ **Important:** These are **NOT** committed to the repository. They exist only in Vercel's secure environment.

### Step 2: Verify vercel.json Configuration

The build command will:
1. Run `node scripts/generate-config.js` (generates config.json)
2. Substitute environment variables in `js/env.js`
3. Replace `%%SUPABASE_URL%%` and `%%SUPABASE_ANON_KEY%%` with actual values

```json
"buildCommand": "node scripts/generate-config.js && sed -i 's|%%SUPABASE_URL%%|'${SUPABASE_URL}'|g; s|%%SUPABASE_ANON_KEY%%|'${SUPABASE_ANON_KEY}'|g' public/js/env.js"
```

### Step 3: Configure Security Headers

Already configured in `vercel.json`:

| Header | Value | Purpose |
|--------|-------|---------|
| X-Frame-Options | DENY | Prevent clickjacking |
| X-Content-Type-Options | nosniff | Prevent MIME sniffing |
| X-XSS-Protection | 1; mode=block | XSS attack prevention |
| Referrer-Policy | strict-origin-when-cross-origin | Privacy protection |
| Permissions-Policy | camera/microphone/geolocation denied | API access restriction |

### Step 4: Configure Asset Caching

Already configured for 1-year immutable caching:
- `/css/*` — 1 year (max-age=31536000)
- `/js/*` — 1 year (max-age=31536000)
- `/images/*` — 1 year (max-age=31536000)

### Step 5: Configure Clean URLs

Already configured:
- `cleanUrls: true` — Removes `.html` extensions
- `trailingSlash: false` — No trailing slashes
- Redirects configured for all .html files to clean URLs

---

## How Environment Variables Work

### Build Time Flow

```
1. Developer pushes to GitHub
   ↓
2. Vercel detects changes
   ↓
3. Vercel runs build command:
   a. node scripts/generate-config.js
      → Creates public/config.json with credentials
   b. sed substitution on public/js/env.js
      → Replaces %%SUPABASE_URL%% with actual value
      → Replaces %%SUPABASE_ANON_KEY%% with actual value
   ↓
4. public/js/env.js now contains actual credentials
   ↓
5. All HTML pages load env.js as first script
   ↓
6. window.ENV available to all JavaScript code
```

### Runtime Flow

```
1. User visits site
   ↓
2. HTML page loads with <script src="/js/env.js"></script>
   ↓
3. window.ENV = {
     SUPABASE_URL: "https://[...].supabase.co",
     SUPABASE_ANON_KEY: "[...]"
   }
   ↓
4. Other scripts (supabase.js, etc.) use window.ENV for connection
   ↓
5. Data loads from Supabase
```

### Security Model

- **Source Repository:** No credentials stored ✅
- **Local Development:** Use .env.example as template ✅
- **Build Process:** Vercel injects at build time ✅
- **Runtime:** window.ENV available to client-side code ✅
- **Network:** HTTPS only ✅

---

## URL Routing Configuration

### Clean URL Redirects

All `.html` files redirect to clean URLs (permanent 301):

| Source | Destination | Purpose |
|--------|---|---------|
| /index.html | / | Homepage |
| /guide.html | /guide | Guide page |
| /life.html | /life | Post-arrival guide |
| /worksheet-ds260.html | /worksheet-ds260 | DS-260 form |
| /worksheet-i864.html | /worksheet-i864 | I-864 form |
| /public-charge.html | /public-charge | Public charge statement |
| /workbook.html | /workbook | Immigration workbook |
| /checklist-*.html | /checklist-* | Checklists |

### Legacy GitHub Pages Redirects

Users on old GitHub Pages URLs are automatically redirected:

| Source | Destination |
|--------|---|
| /erindyersaxon.github.io/london-visa-tracker/* | americanvisaguide.com/* |
| /erindyersaxon.github.io/american-visa-guide/* | americanvisaguide.com/* |

---

## Post-Deployment Testing

### Test 1: URL Routing

**Test clean URLs:**
```bash
# All should work:
https://americanvisaguide.com/
https://americanvisaguide.com/guide
https://americanvisaguide.com/worksheet-ds260

# All should redirect to clean URLs:
https://americanvisaguide.com/index.html → /
https://americanvisaguide.com/guide.html → /guide
https://americanvisaguide.com/worksheet-ds260.html → /worksheet-ds260
```

**Test GitHub Pages redirects:**
```bash
# Should redirect to americanvisaguide.com:
https://americanvisaguide.com/erindyersaxon.github.io/london-visa-tracker/
→ https://americanvisaguide.com/
```

### Test 2: Environment Variables

**Check console in browser DevTools:**
```javascript
// Should return the Supabase URL
console.log(window.ENV.SUPABASE_URL);

// Should return the Anon Key
console.log(window.ENV.SUPABASE_ANON_KEY);
```

### Test 3: Data Loading

**Verify Supabase connection on homepage:**
1. Open https://americanvisaguide.com
2. Check that community data loads (IL drop table, stats, etc.)
3. Check Console for no 401/403 errors from Supabase
4. Verify skeleton loaders appear while loading
5. Verify fallback data displays if Supabase is unavailable

### Test 4: Security Headers

**Check with curl:**
```bash
curl -I https://americanvisaguide.com

# Should show:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Referrer-Policy: strict-origin-when-cross-origin
# Permissions-Policy: camera=(), microphone=(), geolocation=()
# X-XSS-Protection: 1; mode=block
```

### Test 5: Browser Cache

**Test with Chrome DevTools:**
1. Open DevTools → Network tab
2. Reload page
3. Check CSS/JS files show `Cache-Control: public, max-age=31536000, immutable`
4. Reload again — files should load from browser cache (disk cache)

### Test 6: Mobile Testing

**Test on actual iPhone (not just DevTools):**
1. Open Safari on iPhone
2. Visit https://americanvisaguide.com
3. Test navigation (hamburger menu opens/closes)
4. Test data cards display correctly
5. Test worksheet form inputs
6. Test print functionality
7. Test copy-to-clipboard on worksheet

**Focus on:**
- Navigation menu works on iOS Safari
- Buttons are tappable (44px minimum)
- Form inputs don't zoom on focus
- Keyboard doesn't cover critical content
- Scrolling is smooth

### Test 7: Lighthouse Audit

**Run on live site:**
```bash
# Using PageSpeed Insights or Lighthouse CLI
lighthouse https://americanvisaguide.com
```

**Target scores:**
- ✅ Performance: 90+
- ✅ Accessibility: 100
- ✅ Best Practices: 95+
- ✅ SEO: 90+

**Common issues to watch:**
- Largest Contentful Paint (LCP) — should be < 2.5s
- Cumulative Layout Shift (CLS) — should be < 0.1
- First Input Delay (FID) — should be < 100ms

### Test 8: GDPR Features

1. **Cookie Notice:**
   - ✅ Appears on first visit
   - ✅ Dismissal persists in sessionStorage (clears on browser close)
   - ✅ Links to /privacy

2. **Privacy Policy:**
   - ✅ Accessible from footer on all pages
   - ✅ Contains UK GDPR compliance information
   - ✅ Contact email for privacy requests

3. **Worksheet Privacy:**
   - ✅ Refresh page — worksheet data gone
   - ✅ Close tab — worksheet data gone
   - ✅ No data in Network tab requests to backend

4. **Analytics:**
   - ✅ Microsoft Clarity script loads
   - ✅ No console errors from analytics
   - ✅ Session replays working in Clarity dashboard

---

## Rollback Procedure

If issues occur after deployment:

1. **Via Vercel Dashboard:**
   - Go to Deployments
   - Click on previous successful deployment
   - Click "Promote to Production"

2. **Via Git:**
   - Revert problematic commit: `git revert HEAD`
   - Push to main: `git push origin main`
   - Vercel auto-deploys from main branch

---

## Monitoring

### Set up alerts for:
1. Build failures (email from Vercel)
2. Performance degradation (Vercel Analytics)
3. High error rates (Vercel Function logs)
4. Supabase connection failures (check /js/supabase.js console output)

### Regular checks:
- Weekly: Lighthouse score monitoring
- Weekly: User traffic and page load times (Vercel Analytics)
- Monthly: GDPR compliance audit
- Monthly: Security header verification

---

## Troubleshooting

### Issue: Environment variables not loading
**Solution:**
1. Check Vercel project Settings → Environment Variables
2. Verify variable names are exact: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
3. Trigger new deployment from Vercel dashboard
4. Check build logs for sed substitution errors

### Issue: Homepage shows "Data unavailable"
**Solution:**
1. Check browser console for 401/403 from Supabase
2. Verify environment variables are correct
3. Check Supabase project is active and credentials are valid
4. Fallback data should display if Supabase is down

### Issue: Old GitHub Pages URLs not redirecting
**Solution:**
1. Verify redirects in vercel.json are correct
2. Ensure deployed version has latest vercel.json
3. Clear browser cache (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

### Issue: High Cumulative Layout Shift score
**Solution:**
1. Ensure all images have width/height attributes
2. Ensure images use `loading="lazy"` or `loading="eager"` appropriately
3. Use CSS `aspect-ratio` for dynamic content
4. Avoid inserting content above-the-fold after load

---

## Documentation

- **GDPR_COMPLIANCE.md** — Complete GDPR documentation
- **GDPR_IMPLEMENTATION_SUMMARY.md** — Privacy implementation details
- **This file** — Deployment and testing guide

---

**Status: ✅ READY FOR DEPLOYMENT**
