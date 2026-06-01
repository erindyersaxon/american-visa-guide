// Cookie Notice — GDPR Compliance
// Displays once per session, stored in sessionStorage only (cleared on browser close)

function initCookieNotice() {
  // Check if notice has already been dismissed this session
  if (sessionStorage.getItem('cookieNoticeDismissed')) {
    return;
  }

  // Create notice element
  const notice = document.createElement('div');
  notice.id = 'cookie-notice';
  notice.setAttribute('role', 'alert');
  notice.setAttribute('aria-live', 'polite');
  notice.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--color-surface);
    border-top: 1px solid var(--color-border);
    padding: var(--space-4) var(--space-5);
    z-index: 999;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    line-height: var(--leading-relaxed);
  `;

  notice.innerHTML = `
    <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); flex-wrap: wrap;">
      <div>
        This site uses Microsoft Clarity for analytics. No advertising or tracking cookies are used. 
        <a href="/privacy" style="color: var(--color-primary); text-decoration: underline;">See our Privacy Policy</a> for details.
      </div>
      <button id="cookie-ok-button" style="
        flex-shrink: 0;
        padding: var(--space-2) var(--space-4);
        background: var(--color-primary);
        color: white;
        border: none;
        border-radius: var(--radius-md);
        font-family: var(--font-body);
        font-size: var(--text-sm);
        font-weight: var(--font-semibold);
        cursor: pointer;
        white-space: nowrap;
      ">OK</button>
    </div>
  `;

  // Add to page
  document.body.appendChild(notice);

  // Handle dismiss
  document.getElementById('cookie-ok-button').addEventListener('click', function() {
    sessionStorage.setItem('cookieNoticeDismissed', 'true');
    notice.style.display = 'none';
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCookieNotice);
} else {
  initCookieNotice();
}
