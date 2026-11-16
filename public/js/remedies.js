/*
   American Visa Guide: the escalation steps on /guide/delayed-i130
   (merged from the old /delayed-i130-remedies page, 15 Nov 2026).
   - Each step card folds open and shut.
   - A link to a step (#mandamus) or to anything inside one (#expedite,
     #demand-tpl) opens that card and scrolls to it.
   - Copy buttons on the letter templates call copyTpl(id, btn).
 */
(function () {
  'use strict';

  function setOpen(btn, open) {
    btn.setAttribute('aria-expanded', String(open));
    var body = document.getElementById(btn.getAttribute('aria-controls'));
    if (body) body.hidden = !open;
  }

  document.querySelectorAll('.remedy-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setOpen(btn, btn.getAttribute('aria-expanded') !== 'true');
    });
  });

  function openFromHash() {
    var id = decodeURIComponent(location.hash.slice(1));
    var target = id && document.getElementById(id);
    if (!target) return;
    var card = target.closest('.remedy-card');
    var btn = card && card.querySelector('.remedy-toggle');
    if (!btn) return;
    if (btn.getAttribute('aria-expanded') !== 'true') setOpen(btn, true);
    target.scrollIntoView({ behavior: 'instant' });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', openFromHash);
  } else {
    openFromHash();
  }
  window.addEventListener('hashchange', openFromHash);
})();

function copyTpl(id, btn) {
  'use strict';
  var el = document.getElementById(id);
  if (!el) return;
  navigator.clipboard.writeText(el.textContent).then(function () {
    var orig = btn.textContent;
    btn.textContent = 'Copied';
    setTimeout(function () { btn.textContent = orig; }, 1800);
  });
}
