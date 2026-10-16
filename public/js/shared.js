/* American Visa Guide: Shared Components */

function renderPage(config) {
  const { title, description, activePage } = config;

  // Set page title and meta description.
  // Pages are inconsistent about whether the title they pass already
  // carries the site suffix, so only append it when it is missing.
  const SITE_SUFFIX = " | American Visa Guide";
  document.title = title.endsWith(SITE_SUFFIX) ? title : title + SITE_SUFFIX;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute("content", description);
  }

  // Nav and footer are injected by /js/nav.js

}
