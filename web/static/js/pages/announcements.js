/**
 * Announcements Page - 公告页面逻辑
 */

const announcements = [
  {
    id: '1',
    title: 'Spring 2026 TA Recruitment Now Open',
    date: '2026-03-18',
    category: 'Important',
    isPinned: true,
    content: 'We are excited to announce that applications for Spring 2026 Teaching Assistant positions are now open. This semester, we have over 50 positions available across Computer Science, Mathematics, and Engineering departments.'
  },
  {
    id: '2',
    title: 'Interview Schedule for Java Programming TA',
    date: '2026-03-15',
    category: 'Interview',
    isPinned: true,
    content: 'Interview rounds for Java Programming TA positions will be conducted from March 25-30, 2026. Selected candidates will be notified via email with specific time slots.'
  },
  {
    id: '3',
    title: 'TA Training Workshop - April 2026',
    date: '2026-03-12',
    category: 'Training',
    isPinned: false,
    content: 'All newly selected TAs are required to attend the mandatory training workshop on April 5, 2026. Topics include teaching methodologies, grading policies, and student interaction best practices.'
  },
  {
    id: '4',
    title: 'Updated Work Hour Policies',
    date: '2026-03-10',
    category: 'Policy',
    isPinned: false,
    content: 'Please note the updated work hour policies: Students may work up to 20 hours per week across all TA positions. Proper time management and academic performance must be maintained.'
  },
  {
    id: '5',
    title: 'Final Exam Invigilator Positions Available',
    date: '2026-03-08',
    category: 'Recruitment',
    isPinned: false,
    content: 'We are hiring invigilators for the June 2026 final examination period. Flexible schedules available. Applications close on May 15, 2026.'
  }
];

const categoryClasses = {
  'Important': 'badge-important',
  'Interview': 'badge-interview',
  'Training': 'badge-training',
  'Policy': 'badge-policy',
  'Recruitment': 'badge-recruitment'
};

/**
 * 格式化日期
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * 渲染公告列表
 */
function renderAnnouncements() {
  const container = document.getElementById('announcementsList');
  
  container.innerHTML = announcements.map(announcement => `
    <div class="announcement-card">
      <div class="announcement-content">
        ${announcement.isPinned ? `
          <div class="pin-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 17v5"></path>
              <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"></path>
            </svg>
          </div>
        ` : ''}
        
        <div class="announcement-body">
          <div class="announcement-meta">
            <span class="badge ${categoryClasses[announcement.category]}">
              ${announcement.category}
            </span>
            <div class="announcement-date">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              ${formatDate(announcement.date)}
            </div>
          </div>
          
          <h2 class="announcement-title">${announcement.title}</h2>
          <p class="announcement-text">${announcement.content}</p>
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * 初始化
 */
document.addEventListener('DOMContentLoaded', () => {
  renderAnnouncements();
});
