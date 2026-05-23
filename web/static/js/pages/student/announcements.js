const categoryClasses = {
  Important: 'badge-important',
  Interview: 'badge-interview',
  Training: 'badge-training',
  Policy: 'badge-policy',
  Recruitment: 'badge-recruitment'
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

document.addEventListener('DOMContentLoaded', () => {
  loadAnnouncements();
});

async function loadAnnouncements() {
  const container = document.getElementById('announcementsList');
  if (!container) return;
  container.innerHTML = '<div class="announcement-card"><p class="announcement-text">Loading announcements...</p></div>';

  try {
    const announcements = await API.announcements.getList();
    renderAnnouncements(announcements || []);
  } catch (error) {
    container.innerHTML = `<div class="announcement-card"><p class="announcement-text">Failed to load announcements: ${escapeHtml(error.message)}</p></div>`;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? dateString : date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

function renderAnnouncements(announcements) {
  const container = document.getElementById('announcementsList');
  if (!announcements.length) {
    container.innerHTML = '<div class="announcement-card"><p class="announcement-text">No announcements yet.</p></div>';
    return;
  }

  container.innerHTML = announcements.map(announcement => `
    <div class="announcement-card">
      <div class="announcement-content">
        ${announcement.pinned ? `
          <div class="pin-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 17v5"></path>
              <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"></path>
            </svg>
          </div>
        ` : ''}
        <div class="announcement-body">
          <div class="announcement-meta">
            <span class="badge ${categoryClasses[announcement.category] || 'badge-policy'}">${escapeHtml(announcement.category || 'Notice')}</span>
            <div class="announcement-date">${escapeHtml(formatDate(announcement.date))}</div>
          </div>
          <h2 class="announcement-title">${escapeHtml(announcement.title)}</h2>
          <p class="announcement-text">${escapeHtml(announcement.content)}</p>
        </div>
      </div>
    </div>
  `).join('');
}
