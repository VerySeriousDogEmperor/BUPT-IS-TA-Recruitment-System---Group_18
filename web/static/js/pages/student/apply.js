/**
 * Apply page logic
 */

let jobs = [];
let favorites = new Set();
let studentSchedule = [];
let studentProfileCache = null;
const filters = {
  keyword: '',
  types: [],
  categories: []
};

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch (error) {
    return {};
  }
}

function getStoredRole() {
  const user = getStoredUser();
  return localStorage.getItem('userRole') || user.role || '';
}

function isStudentAuthenticated() {
  return localStorage.getItem('isAuthenticated') === 'true' && getStoredRole() === 'student';
}

function studentLoginUrl() {
  const currentPath = window.location.pathname + window.location.search;
  return `/login.html?redirect=${encodeURIComponent(currentPath)}`;
}

function requireStudentAccountForApply() {
  if (isStudentAuthenticated()) {
    return true;
  }

  const role = getStoredRole();
  if (role && role !== 'student') {
    showToast('Please sign in with a student account to apply for positions.', 'error');
    return false;
  }

  window.location.href = studentLoginUrl();
  return false;
}

function getFavoriteStorageKey() {
  try {
    const user = getStoredUser();
    return user.id ? `student-favorites-${user.id}` : 'student-favorites';
  } catch (error) {
    return 'student-favorites';
  }
}

function loadFavorites() {
  try {
    const stored = JSON.parse(localStorage.getItem(getFavoriteStorageKey()) || '[]');
    favorites = new Set(Array.isArray(stored) ? stored : []);
  } catch (error) {
    console.error('Failed to load favorites:', error);
    favorites = new Set();
  }
}

function saveFavorites() {
  localStorage.setItem(getFavoriteStorageKey(), JSON.stringify(Array.from(favorites)));
}

function loadStudentSchedule() {
  try {
    if (!isStudentAuthenticated()) {
      studentSchedule = [];
      return;
    }

    const user = studentProfileCache || getStoredUser();
    const schedule = user?.schedule || {};
    const dayLabels = {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday'
    };

    studentSchedule = Object.entries(dayLabels).flatMap(([key, label]) => {
      const slots = Array.isArray(schedule[key]) ? schedule[key] : [];
      return slots.map((slot) => {
        const value = String(slot || '').trim();
        const [range = ''] = value.split(' ');
        const [start = '', end = ''] = range.split('-');
        return start && end ? { day: label, start, end } : null;
      }).filter(Boolean);
    });
  } catch (error) {
    studentSchedule = [];
  }
}

function hasResumeReady(user) {
  const resume = user?.resume;
  const hasEducation = Array.isArray(resume?.education) && resume.education.some((item) => (
    String(item?.major || '').trim() ||
    item?.gpa !== null && item?.gpa !== undefined
  ));
  const hasExperience = Array.isArray(resume?.experience) && resume.experience.some((item) => String(item?.description || '').trim());
  const hasAward = Array.isArray(resume?.awards) && resume.awards.some((item) => (
    String(item?.name || '').trim() ||
    String(item?.description || '').trim()
  ));
  return Boolean(
    user?.resumePdfData ||
    hasEducation ||
    hasExperience ||
    hasAward
  );
}

async function getStudentProfile() {
  if (!isStudentAuthenticated()) {
    return {};
  }

  if (studentProfileCache) {
    return studentProfileCache;
  }
  try {
    studentProfileCache = await API.student.getProfile();
    localStorage.setItem('user', JSON.stringify(studentProfileCache));
    return studentProfileCache;
  } catch (error) {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch (parseError) {
      return {};
    }
  }
}

async function ensureResumeReady() {
  const profile = await getStudentProfile();
  if (hasResumeReady(profile)) {
    return true;
  }
  showResumePreparationModal();
  return false;
}

function showResumePreparationModal() {
  let modal = document.getElementById('resumeRequiredModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'resumeRequiredModal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:10000;display:none;align-items:center;justify-content:center;background:rgba(15,23,42,.45);padding:24px;';
    modal.innerHTML = `
      <div style="width:min(440px,100%);background:#fff;border-radius:8px;box-shadow:0 24px 70px rgba(15,23,42,.25);padding:26px;">
        <h3 style="margin:0 0 10px;color:#111827;font-size:22px;">Resume required before applying</h3>
        <p style="margin:0 0 18px;color:#4b5563;line-height:1.6;">Please upload a PDF resume or complete the standard resume form in your personal center before submitting a TA application.</p>
        <div style="display:flex;gap:12px;justify-content:flex-end;flex-wrap:wrap;">
          <button type="button" id="resumeRequiredCancel" class="btn btn-outline">Not Now</button>
          <button type="button" id="resumeRequiredGo" class="btn btn-primary">Prepare Resume</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('resumeRequiredCancel').addEventListener('click', () => {
      modal.style.display = 'none';
    });
    document.getElementById('resumeRequiredGo').addEventListener('click', () => {
      window.location.href = '/student/dashboard.html#resume';
    });
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
  modal.style.display = 'flex';
}

function parseTimeToMinutes(value) {
  const [hours = '0', minutes = '0'] = String(value || '').split(':');
  return Number(hours) * 60 + Number(minutes);
}

function normalizeJobSchedule(schedule) {
  if (!schedule || typeof schedule !== 'object') {
    return [];
  }

  const dayLabels = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  return Object.entries(dayLabels).flatMap(([key, label]) => {
    const slots = Array.isArray(schedule[key]) ? schedule[key] : [];
    return slots.map((slot) => {
      const [start = '', end = ''] = String(slot || '').split('-');
      return start && end ? { day: label, start: start.trim(), end: end.trim() } : null;
    }).filter(Boolean);
  });
}

function hasScheduleConflict(job) {
  if (!studentSchedule.length) {
    return false;
  }

  const jobSlots = normalizeJobSchedule(job.schedule);
  return jobSlots.some((jobSlot) => {
    const jobStart = parseTimeToMinutes(jobSlot.start);
    const jobEnd = parseTimeToMinutes(jobSlot.end);

    return studentSchedule.some((studentSlot) => {
      if (studentSlot.day !== jobSlot.day) {
        return false;
      }
      const studentStart = parseTimeToMinutes(studentSlot.start);
      const studentEnd = parseTimeToMinutes(studentSlot.end);
      return jobStart < studentEnd && studentStart < jobEnd;
    });
  });
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getJobProjectType(job) {
  const title = String(job.title || '').toLowerCase();
  if (title.includes('invigilator') || title.includes('event') || title.includes('coordinator')) {
    return 'Activities';
  }
  return 'Academic';
}

function getJobCategory(job) {
  const title = String(job.title || '').toLowerCase();
  if (title.includes('invigilator') || title.includes('exam')) {
    return 'Invigilator';
  }
  return job.type || 'TA';
}

function applyClientFilters(items) {
  return items.filter((job) => {
    const projectType = getJobProjectType(job);
    const category = getJobCategory(job);

    if (filters.types.length && !filters.types.includes(projectType)) {
      return false;
    }
    if (filters.categories.length && !filters.categories.includes(category)) {
      return false;
    }
    return true;
  }).map((job) => ({
    ...job,
    hasConflict: hasScheduleConflict(job)
  }));
}

function getJobIcon(job) {
  const title = (job.title || '').toLowerCase();
  if (title.includes('java') || title.includes('programming')) {
    return { color: 'bg-blue', icon: 'code' };
  }
  if (title.includes('data') || title.includes('algorithm')) {
    return { color: 'bg-purple', icon: 'database' };
  }
  if (title.includes('invigilator') || title.includes('exam')) {
    return { color: 'bg-green', icon: 'check' };
  }
  if (title.includes('event') || title.includes('coordinator')) {
    return { color: 'bg-orange', icon: 'calendar' };
  }
  if (title.includes('web') || title.includes('react')) {
    return { color: 'bg-cyan', icon: 'lightbulb' };
  }
  return { color: 'bg-indigo', icon: 'graduation' };
}

const icons = {
  code: '<polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>',
  check: '<path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>',
  lightbulb: '<line x1="9" y1="18" x2="15" y2="18"></line><line x1="10" y1="22" x2="14" y2="22"></line><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>',
  graduation: '<path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path>'
};

async function loadJobs() {
  try {
    const data = await API.jobs.getList({
      keyword: filters.keyword,
      page: 1,
      size: 100
    });
    jobs = applyClientFilters(data.items || []);
    renderJobs();
    updateResultsCount();
  } catch (error) {
    console.error('Failed to load jobs:', error);
    showToast('Failed to load jobs', 'error');
  }
}

function renderJobs() {
  const container = document.getElementById('jobsList');
  const emptyState = document.getElementById('emptyState');

  if (jobs.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  container.innerHTML = jobs.map((job) => {
    const { color, icon } = getJobIcon(job);
    const isFavorite = favorites.has(job.id);
    const tags = Array.isArray(job.requiredSkills) ? job.requiredSkills : [];
    const category = job.moduleCode || job.moduleName || job.department || 'General';
    const location = job.location || 'BUPT Campus';
    const salary = job.hourlyRate ? `CNY ${job.hourlyRate}/hour` : 'Salary negotiable';
    const safeTitle = escapeHtml(job.title || 'Untitled Position');

    return `
      <div class="job-card-apply">
        <div class="job-card-grid">
          <div class="job-card-icon">
            <div class="job-icon-wrapper ${color}">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                ${icons[icon]}
              </svg>
            </div>
          </div>

          <div class="job-card-content">
            <div class="job-card-header">
              <div class="job-card-title-section">
                <h3 class="job-card-title" onclick="viewJob('${escapeHtml(job.id)}')">${safeTitle}</h3>
                <p class="job-card-department">${escapeHtml(job.department || 'Department not specified')}</p>
              </div>
              <button class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="toggleFavorite('${escapeHtml(job.id)}', event)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>

            <div class="job-card-badges">
              <span class="badge badge-secondary">${escapeHtml(job.type || 'TA')}</span>
              <span class="badge badge-outline">${escapeHtml(category)}</span>
              ${tags.slice(0, 3).map((tag) => `<span class="badge badge-outline">${escapeHtml(tag)}</span>`).join('')}
            </div>

            <p class="job-card-description">${escapeHtml(job.description || 'No description provided.')}</p>

            <div class="job-card-meta">
              <div class="job-meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                ${escapeHtml(location)}
              </div>
              <div class="job-meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                ${escapeHtml(job.hoursPerWeek || 0)} hrs/week
              </div>
              <div class="job-meta-item job-meta-salary">
                ${escapeHtml(salary)}
              </div>
            </div>

            ${job.hasConflict ? `
              <div class="job-conflict-warning">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <span class="job-conflict-text">Time Conflict with your schedule</span>
              </div>
            ` : ''}

            <div class="job-card-actions">
              <button class="btn btn-primary" onclick="viewJob('${escapeHtml(job.id)}')">View Details</button>
              <button class="btn btn-outline" ${job.hasConflict ? 'disabled' : ''} onclick="quickApply('${escapeHtml(job.id)}')">Quick Apply</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function updateResultsCount() {
  const count = jobs.length;
  document.getElementById('resultsCount').textContent = `${count} position${count !== 1 ? 's' : ''} found`;
}

function viewJob(jobId) {
  window.location.href = `/job-detail.html?id=${jobId}`;
}

function toggleFavorite(jobId, event) {
  event.stopPropagation();

  if (favorites.has(jobId)) {
    favorites.delete(jobId);
  } else {
    favorites.add(jobId);
  }

  saveFavorites();
  renderJobs();
}

async function quickApply(jobId) {
  try {
    if (!requireStudentAccountForApply()) {
      return;
    }
    if (!(await ensureResumeReady())) {
      return;
    }
    await API.student.applyJob(jobId);
    showToast('Application submitted successfully!', 'success');
  } catch (error) {
    showToast(error.message || 'Failed to apply for this position', 'error');
  }
}

function clearFilters() {
  filters.keyword = '';
  filters.types = [];
  filters.categories = [];
  document.getElementById('searchInput').value = '';
  document.querySelectorAll('.filter-checkbox input').forEach((checkbox) => {
    checkbox.checked = false;
  });
  loadJobs();
}

document.addEventListener('DOMContentLoaded', () => {
  loadFavorites();
  loadStudentSchedule();
  if (isStudentAuthenticated()) {
    getStudentProfile().then(() => loadStudentSchedule());
  }
  loadJobs();

  const searchInput = document.getElementById('searchInput');
  let searchTimeout;
  searchInput.addEventListener('input', (event) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      filters.keyword = event.target.value.trim();
      loadJobs();
    }, 250);
  });

  document.getElementById('type-academic')?.addEventListener('change', (event) => {
    if (event.target.checked) {
      filters.types.push('Academic');
    } else {
      filters.types = filters.types.filter((type) => type !== 'Academic');
    }
    loadJobs();
  });

  document.getElementById('type-activities')?.addEventListener('change', (event) => {
    if (event.target.checked) {
      filters.types.push('Activities');
    } else {
      filters.types = filters.types.filter((type) => type !== 'Activities');
    }
    loadJobs();
  });

  document.getElementById('cat-ta')?.addEventListener('change', (event) => {
    if (event.target.checked) {
      filters.categories.push('TA');
    } else {
      filters.categories = filters.categories.filter((category) => category !== 'TA');
    }
    loadJobs();
  });

  document.getElementById('cat-invigilator')?.addEventListener('change', (event) => {
    if (event.target.checked) {
      filters.categories.push('Invigilator');
    } else {
      filters.categories = filters.categories.filter((category) => category !== 'Invigilator');
    }
    loadJobs();
  });

  document.addEventListener('auth-state-changed', () => {
    studentProfileCache = null;
    loadStudentSchedule();
    if (isStudentAuthenticated()) {
      getStudentProfile().then(() => loadStudentSchedule());
    }
    loadFavorites();
    loadJobs();
  });
});
