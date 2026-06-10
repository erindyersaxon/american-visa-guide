/* American Visa Guide — Shared Checklist Functionality */

function initializeChecklist(checklistId) {
  const checkboxes = document.querySelectorAll(`[data-checklist="${checklistId}"] input[type="checkbox"]`);
  const progressDisplay = document.getElementById(`progress-${checklistId}`);
  const resetBtn = document.getElementById(`reset-${checklistId}`);

  // Load saved state from localStorage
  function loadChecklist() {
    try {
      const saved = localStorage.getItem(`checklist-${checklistId}`);
      if (saved) {
        const checkedItems = JSON.parse(saved);
        checkboxes.forEach(checkbox => {
          const itemId = checkbox.parentElement.getAttribute('data-item-id');
          if (checkedItems.includes(itemId)) {
            checkbox.checked = true;
          }
        });
      }
    } catch (e) {
      console.warn('Could not load checklist from localStorage:', e);
    }
    updateProgress();
  }

  // Save state to localStorage
  function saveChecklist() {
    try {
      const checkedItems = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.parentElement.getAttribute('data-item-id'));
      localStorage.setItem(`checklist-${checklistId}`, JSON.stringify(checkedItems));
    } catch (e) {
      console.warn('Could not save checklist to localStorage:', e);
    }
  }

  // Update progress indicator
  function updateProgress() {
    const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
    const total = checkboxes.length;
    if (progressDisplay) {
      progressDisplay.textContent = `${checked} of ${total} items checked`;
    }
  }

  // Reset checklist
  function resetChecklist() {
    if (confirm('Reset this checklist? This action cannot be undone.')) {
      checkboxes.forEach(cb => cb.checked = false);
      try {
        localStorage.removeItem(`checklist-${checklistId}`);
      } catch (e) {
        console.warn('Could not clear localStorage:', e);
      }
      updateProgress();
    }
  }

  // Event listeners
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      saveChecklist();
      updateProgress();
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', resetChecklist);
  }

  // Initial load
  loadChecklist();
}

/* Copy the checklist as text so it can be pasted into Google Docs, Word, etc. */
function copyChecklistForDocs(btn) {
  const container = document.querySelector('[data-checklist]');
  if (!container) return;

  const title = document.querySelector('h1')?.textContent.trim() || 'Checklist';
  const lines = [title, '='.repeat(title.length), ''];

  container.querySelectorAll('h3, .checklist-item, .content-item').forEach(el => {
    if (el.tagName === 'H3') {
      lines.push('', el.textContent.trim(), '');
    } else {
      const label = el.querySelector('label');
      const checkbox = el.querySelector('input[type="checkbox"]');
      if (label) {
        lines.push(`${checkbox && checkbox.checked ? '☑' : '☐'} ${label.textContent.trim()}`);
      }
    }
  });
  lines.push('', `From americanvisaguide.com${window.location.pathname}`);

  const finish = ok => {
    const original = btn.textContent;
    btn.textContent = ok ? '✓ Copied — paste into Google Docs' : 'Copy failed — try selecting the page text';
    setTimeout(() => { btn.textContent = original; }, 3000);
  };

  navigator.clipboard.writeText(lines.join('\n')).then(() => finish(true), () => finish(false));
}

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all checklists on the page
  const checklistElements = document.querySelectorAll('[data-checklist]');
  const checklistIds = new Set();

  checklistElements.forEach(el => {
    const id = el.getAttribute('data-checklist');
    checklistIds.add(id);
  });

  checklistIds.forEach(id => initializeChecklist(id));

  // Load progress for checklist cards on landing page
  const cards = document.querySelectorAll('[data-checklist-id]');
  cards.forEach(card => {
    try {
      const checklistId = card.getAttribute('data-checklist-id');
      const saved = localStorage.getItem(`checklist-${checklistId}`);
      const progressEl = card.querySelector('.card-progress');

      if (progressEl && saved) {
        const checkedItems = JSON.parse(saved);
        // Note: we don't know the total here, so just show the count
        progressEl.textContent = `${checkedItems.length} items checked`;
        progressEl.style.display = 'block';
      }
    } catch (e) {
      console.warn('Could not load card progress:', e);
    }
  });
});
