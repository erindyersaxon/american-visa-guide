/* American Visa Guide — Sidebar Navigation & Back-to-Top */

document.addEventListener('DOMContentLoaded', function() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.guide-nav a');
  const backToTopBtn = document.getElementById('backToTop');
  const jumpToggle = document.getElementById('jumpToggle');
  const jumpMenu = document.getElementById('jumpMenu');

  // Mobile jump menu toggle
  if (jumpToggle) {
    jumpToggle.addEventListener('click', function() {
      jumpMenu.classList.toggle('open');
    });

    // Close menu when a link is clicked
    jumpMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', function() {
        jumpMenu.classList.remove('open');
      });
    });
  }

  // IntersectionObserver for active section highlighting
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -66% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`.guide-nav a[href="#${entry.target.id}"]`);
        if (activeLink) {
          activeLink.classList.add('active');
        }
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));

  // Back-to-top button
  window.addEventListener('scroll', function() {
    if (window.scrollY > 400) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });

  backToTopBtn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Accordion functionality
  const accordionTriggers = document.querySelectorAll('.accordion-trigger');
  accordionTriggers.forEach(trigger => {
    trigger.addEventListener('click', function() {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !isExpanded);
    });
  });
});
