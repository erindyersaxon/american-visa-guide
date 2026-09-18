/*
   Stage page behaviour: extracted verbatim from the inline <script> blocks
   at the foot of guide.html (Phase 0 of the stage-page restructure).
   Sidebar active-link tracking, back-to-top button, accordion toggles
   (toggleSubAcc / subAccGroup are called from onclick attributes, so they
   must stay global) and the mobile navigation drawer.

   Load as a classic script at the end of <body>, not deferred or as a module.
 */

let sections = document.querySelectorAll('.section');
let navLinks = document.querySelectorAll('.sidebar-nav a');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.sidebar-nav a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-20% 0px -70% 0px' });

sections.forEach(s => observer.observe(s));

// Back-to-top button (formerly an inline onclick on the button)
const backTopBtn = document.getElementById('back-top')
if (backTopBtn) backTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }))
window.addEventListener('scroll', () => {
  const btn = document.getElementById('back-top')
  if (btn) btn.style.opacity = window.scrollY > 400 ? '1' : '0'
})

function toggleSubAcc(id) {
  const item = document.getElementById(id)
  if (!item) return
  const wasOpen = item.classList.contains('open')
  item.classList.toggle('open', !wasOpen)
  if (!wasOpen) setTimeout(() => item.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
}
function subAccGroup(group, expand) {
  document.querySelectorAll('[data-sub-group="' + group + '"]').forEach(el => el.classList.toggle('open', expand))
}

// Mobile navigation
const mobileNavToggle = document.getElementById('mobileNavToggle')
const mobileNavDrawer = document.getElementById('mobileNavDrawer')
const mobileNavClose = document.getElementById('mobileNavClose')

if (mobileNavToggle) {
  mobileNavToggle.addEventListener('click', () => {
    mobileNavDrawer.classList.add('open')
    mobileNavToggle.setAttribute('aria-expanded', 'true')
  })
}

if (mobileNavClose) {
  mobileNavClose.addEventListener('click', () => {
    mobileNavDrawer.classList.remove('open')
    mobileNavToggle.setAttribute('aria-expanded', 'false')
  })
}

if (mobileNavDrawer) {
  mobileNavDrawer.addEventListener('click', (e) => {
    if (e.target === mobileNavDrawer) {
      mobileNavDrawer.classList.remove('open')
      mobileNavToggle.setAttribute('aria-expanded', 'false')
    }
  })

  mobileNavDrawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNavDrawer.classList.remove('open')
      mobileNavToggle.setAttribute('aria-expanded', 'false')
    })
  })
}

// Mobile nav auto-hide on scroll down, show on scroll up
if (mobileNavToggle) {
  let lastScrollY = 0
  let ticking = false
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY
        const isScrollingDown = currentScrollY > lastScrollY
        const isAtTop = currentScrollY < 100
        if (isScrollingDown && currentScrollY > 100) {
          mobileNavToggle.classList.add('hidden')
        } else {
          mobileNavToggle.classList.remove('hidden')
        }
        lastScrollY = currentScrollY
        ticking = false
      })
      ticking = true
    }
  })
}

// Highlight active section in sidebar navigation as user scrolls
const sectionLinks = document.querySelectorAll('.sidebar-nav a[href^="#"]')
const sectionElements = document.querySelectorAll('.section[id]')

function updateActiveLink() {
  let current = ''
  sectionElements.forEach(section => {
    const sectionTop = section.offsetTop
    if (window.scrollY >= sectionTop - 100) {
      current = section.getAttribute('id')
    }
  })

  sectionLinks.forEach(link => {
    link.classList.remove('active')
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active')
    }
  })
}

window.addEventListener('scroll', updateActiveLink)
updateActiveLink()
