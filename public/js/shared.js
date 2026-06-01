/* American Visa Guide — Shared Components */

const NAV_HTML = `
  <nav role="navigation" aria-label="Main navigation">
    <div class="container" style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-4);">
      <a href="/" style="font-family: var(--font-display); font-weight: var(--weight-bold); font-size: var(--size-2xl); color: var(--color-text-on-dark); text-decoration: none;">
        AVG
      </a>
      <ul style="display: flex; gap: var(--space-6); list-style: none; margin: 0; padding: 0; flex-wrap: wrap; align-items: center;">
        <li><a href="/tracker.html" class="nav-link">Data Tracker</a></li>
        <li><a href="/guide.html" class="nav-link">Visa Guide</a></li>
        <li><a href="/checklists.html" class="nav-link">Checklists</a></li>
        <li><a href="/life.html" class="nav-link">Life in the USA</a></li>
        <li><a href="https://forms.fillout.com/t/dTRqnkx9uxus" class="nav-link" target="_blank" rel="noopener">Submit Data</a></li>
        <li><a href="/about.html" class="nav-link">About</a></li>
        <li><a href="https://ko-fi.com/erinsaidwhat" class="nav-link" target="_blank" rel="noopener">Support</a></li>
      </ul>
    </div>
  </nav>
`;

const FOOTER_HTML = `
  <footer>
    <div class="container">
      <div style="max-width: var(--max-width-prose); margin-bottom: var(--space-8);">
        <p style="font-size: var(--size-sm); color: var(--color-text-on-dark); margin: 0 0 var(--space-4) 0;">
          <strong>This is not legal advice.</strong> American Visa Guide is a community resource created independently. Always consult official sources and immigration attorneys for your specific situation.
        </p>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-8); padding-top: var(--space-8); border-top: 1px solid rgba(255, 255, 255, 0.2);">
        <div>
          <h4 style="margin-top: 0; color: var(--color-text-on-dark);">Contact</h4>
          <p style="margin: 0; font-size: var(--size-sm);">
            <a href="mailto:AmericanVisaGuideInfo@gmail.com">AmericanVisaGuideInfo@gmail.com</a>
          </p>
        </div>
        <div>
          <h4 style="margin-top: 0; color: var(--color-text-on-dark);">Legal</h4>
          <p style="margin: 0; font-size: var(--size-sm);">
            <a href="/privacy.html">Privacy Policy</a>
          </p>
        </div>
        <div>
          <h4 style="margin-top: 0; color: var(--color-text-on-dark);">Support</h4>
          <p style="margin: 0; font-size: var(--size-sm);">
            <a href="https://ko-fi.com/erinsaidwhat" target="_blank" rel="noopener">Ko-fi</a>
          </p>
        </div>
      </div>
      <div style="padding-top: var(--space-8); border-top: 1px solid rgba(255, 255, 255, 0.2); text-align: center; font-size: var(--size-xs); color: rgba(255, 255, 255, 0.7); margin-top: var(--space-8);">
        <p style="margin: 0;">© American Visa Guide. Community-powered immigration resource.</p>
      </div>
    </div>
  </footer>
`;

function injectAnalytics() {
  // Cookiebot
  const cookiebot = document.createElement("script");
  cookiebot.id = "Cookiebot";
  cookiebot.src =
    "https://consent.cookiebot.com/uc.js?cbid=ab078a21-a012-4558-9efa-0c068d1e4366&c=abcedf&l=en";
  cookiebot.async = true;
  cookiebot.type = "text/javascript";
  document.head.appendChild(cookiebot);

  // Microsoft Clarity
  const clarity = document.createElement("script");
  clarity.type = "text/plain";
  clarity.setAttribute("data-cookieconsent", "statistics");
  clarity.textContent = `(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "wlfs757o2n");`;
  document.head.appendChild(clarity);
}

function renderPage(config) {
  const { title, description, activePage } = config;

  // Set page title and meta description
  document.title = title + " — American Visa Guide";
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute("content", description);
  }

  // Inject nav and footer
  const navElement = document.querySelector("nav");
  const footerElement = document.querySelector("footer");

  if (navElement) {
    navElement.outerHTML = NAV_HTML;
  }

  if (footerElement) {
    footerElement.outerHTML = FOOTER_HTML;
  }

  // Mark active nav item
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll("nav a.nav-link");

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    const isActive =
      (currentPath === "/" && href === "/") ||
      (currentPath !== "/" && currentPath.endsWith(href));

    if (isActive) {
      link.setAttribute("aria-current", "page");
      link.style.color = "var(--color-gold)";
      link.style.fontWeight = "var(--weight-semibold)";
    }
  });

  // Inject analytics
  injectAnalytics();
}
