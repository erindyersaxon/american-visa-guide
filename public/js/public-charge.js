/*
   American Visa Guide: public charge pages (/public-charge and its children).
   - Copy buttons on the statement templates.
   - Opens folded <details> when a link lands on something inside one, so
     links like /public-charge/questions#asked show the text. #template opens
     the template text itself.
 */

// Called from onclick="copyTemplate(this)". The copy is taken from the
// rendered template, so the visible text and the copied text never drift.
function copyTemplate(btn) {
  'use strict';
  var prev = btn.previousElementSibling;
  var templateEl = prev && prev.classList.contains('email-template') ? prev : document.querySelector('.email-template');
  if (!templateEl) return;
  navigator.clipboard.writeText(templateEl.textContent).then(function () {
    var originalText = btn.textContent;
    btn.textContent = '✓ Copied to clipboard';
    setTimeout(function () { btn.textContent = originalText; }, 2500);
  }).catch(function () {
    alert('Failed to copy. Please try again or use your browser’s native copy function.');
  });
}

(function () {
  'use strict';
  function openForHash() {
    var id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    var target = id === 'template' ? document.getElementById('template-text') : document.getElementById(id);
    if (!target) return;
    var d = target.closest('details');
    while (d) { d.open = true; d = d.parentElement && d.parentElement.closest('details'); }
    if (id !== 'template') target.scrollIntoView({ behavior: 'instant' });
  }
  window.addEventListener('hashchange', openForHash);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', openForHash);
  } else {
    openForHash();
  }
})();
