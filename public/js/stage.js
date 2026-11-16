/*
   Stage page behaviour: extracted verbatim from the inline <script> blocks
   at the foot of guide.html (Phase 0 of the stage-page restructure).
   Back-to-top button and accordion toggles (toggleSubAcc / subAccGroup are
   called from onclick attributes, so they must stay global). The section
   sidebar now comes from /js/section-nav.js.

   Load as a classic script at the end of <body>, not deferred or as a module.
 */

// Back-to-top button (formerly an inline onclick on the button)
const backTopBtn = document.getElementById('back-top')
if (backTopBtn) backTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }))
window.addEventListener('scroll', () => {
  const btn = document.getElementById('back-top')
  if (btn) btn.style.opacity = window.scrollY > 400 ? '1' : '0'
})

// Keep each accordion trigger's aria-expanded in step with its item's open state
function syncSubAccAria(item) {
  const trigger = item.querySelector('.sub-acc-trigger')
  if (trigger) trigger.setAttribute('aria-expanded', item.classList.contains('open') ? 'true' : 'false')
}
function toggleSubAcc(id) {
  const item = document.getElementById(id)
  if (!item) return
  const wasOpen = item.classList.contains('open')
  item.classList.toggle('open', !wasOpen)
  syncSubAccAria(item)
  if (!wasOpen) setTimeout(() => item.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
}
function subAccGroup(group, expand) {
  document.querySelectorAll('[data-sub-group="' + group + '"]').forEach(el => {
    el.classList.toggle('open', expand)
    syncSubAccAria(el)
  })
}
document.querySelectorAll('.sub-acc-item').forEach(syncSubAccAria)

// Deep links (e.g. /guide/i130#uscis-api-check, /guide/nvc#dq-notice) should
// open the accordion that is, or contains, the target, not just scroll to a
// collapsed heading, and land below the sticky header.
// Height of the sticky nav, from the --sticky-offset that css/nav.css defines; falls back to the nav.
function stickyOffset() {
  const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sticky-offset'))
  if (v) return v
  const header = document.querySelector('header, .site-header, .site-nav, nav')
  return header && getComputedStyle(header).position.match(/sticky|fixed/) ? header.offsetHeight : 0
}

function openSubAccFromHash() {
  const id = decodeURIComponent(window.location.hash.slice(1))
  if (!id) return
  const target = document.getElementById(id)
  if (!target) return
  let item = target.closest('.sub-acc-item')
  while (item) {
    item.classList.add('open')
    syncSubAccAria(item)
    item = item.parentElement && item.parentElement.closest('.sub-acc-item')
  }
  // Clear the sticky site header rather than tucking the heading under it
  const offset = stickyOffset() + 16
  window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset })
}
openSubAccFromHash()
// The browser's own fragment scroll can run after this script, so repeat once the page has loaded
window.addEventListener('load', openSubAccFromHash)
window.addEventListener('hashchange', openSubAccFromHash)
