/* American Visa Guide — Shared Components */

function renderPage(config) {
  const { title, description, activePage } = config;

  // Set page title and meta description
  document.title = title + " — American Visa Guide";
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute("content", description);
  }

  // Nav and footer are injected by /js/nav.js

}
