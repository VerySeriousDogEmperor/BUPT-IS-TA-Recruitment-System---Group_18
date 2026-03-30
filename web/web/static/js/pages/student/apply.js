/**
 * Apply Page - 职位申请页面逻辑
 */

let jobs = [];
let favorites = new Set();
let filters = {
  keyword: '',
  types: [],
  categories: []
};

// 图标映射
function getJobIcon(job) {
  const title = (job.title || '').toLowerCase();
  if (title.includes('java') || title.includes('programming')) {
    return { color: 'bg-blue', icon: 'code' };
  } else if (title.includes('data') || title.includes('algorithm')) {
    return { color: 'bg-purple', icon: 'database' };
  } else if (title.includes('invigilator') || title.includes('exam')) {
    return { color: 'bg-green', icon: 'check' };
  } else if (title.includes('event') || title.includes('coordinator')) {
    return { color: 'bg-orange', icon: 'calendar' };
  } else if (title.includes('web') || title.includes('react')) {
    return { color: 'bg-cyan', icon: 'lightbulb' };
  } else {
    return { color: 'bg-indigo', icon: 'graduation' };
  }
}

// SVG 图标
const icons = {
  code: '<polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>',
  check: '<path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>',
  lightbulb: '<line x1="9" y1="18" x2="15" y2="18"></line><line x1="10" y1="22" x2="14" y2="22"></line><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>',
  graduation: '<path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path>'
};

/**
 * 加载职位列表
 */
async function loadJobs() {
  try {
    const data = await API.jobs.getList(filters);
    jobs = data.list || [];
    renderJobs();
    updateResultsCount();
  } catch (error) {
    console.error('加载失败:', error);
    showToast('Failed to load jobs', 'error');
  }
}

/**
 * 渲染职位列表
 */
function renderJobs() {
  const container = document.getElementById('jobsList');
  const emptyState = document.getElementById('emptyState');
  
  if (jobs.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }
  
  emptyState.style.display = 'none';
  
  container.innerHTML = jobs.map(job => {
    const { color, icon } = getJobIcon(job);
    const isFavorite = favorites.has(job.id);
    
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
                <h3 class="job-card-title" onclick="viewJob('${job.id}')">${job.title}</h3>
                <p class="job-card-department">${job.department}</p>
              </div>
              <button class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="toggleFavorite('${job.id}', event)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>
            
            <div class="job-card-badges">
              <span class="badge badge-secondary">${job.type}</span>
              <span class="badge badge-outline">${job.category}</span>
              ${job.tags.slice(0, 3).map(tag => `<span class="badge badge-outline">${tag}</span>`).join('')}
            </div>
            
            <p class="job-card-description">${job.description}</p>
            
            <div class="job-card-meta">
              <div class="job-meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                ${job.location}
              </div>
              <div class="job-meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                ${job.hoursPerWeek} hrs/week
              </div>
              <div class="job-meta-item job-meta-salary">
                ${job.salary}
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
              <button class="btn btn-primary" onclick="viewJob('${job.id}')">View Details</button>
              <button class="btn btn-outline" ${job.hasConflict ? 'disabled' : ''} onclick="quickApply('${job.id}')">Quick Apply</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * 更新结果计数
 */
function updateResultsCount() {
  const count = jobs.length;
  const text = `${count} position${count !== 1 ? 's' : ''} found`;
  document.getElementById('resultsCount').textContent = text;
}

/**
 * 查看职位详情
 */
function viewJob(jobId) {
  window.location.href = `/job-detail.html?id=${jobId}`;
}

/**
 * 切换收藏
 */
function toggleFavorite(jobId, event) {
  event.stopPropagation();
  
  if (favorites.has(jobId)) {
    favorites.delete(jobId);
  } else {
    favorites.add(jobId);
  }
  
  renderJobs();
}

/**
 * 快速申请
 */
async function quickApply(jobId) {
  try {
    await API.student.applyJob(jobId);
    showToast('Application submitted successfully!', 'success');
  } catch (error) {
    if (error.message.includes('未登录')) {
      if (confirm('Please login first to apply')) {
        window.location.href = '/login.html';
      }
    } else {
      showToast(error.message, 'error');
    }
  }
}

/**
 * 清除筛选
 */
function clearFilters() {
  filters = { keyword: '', types: [], categories: [] };
  document.getElementById('searchInput').value = '';
  document.querySelectorAll('.filter-checkbox input').forEach(cb => cb.checked = false);
  loadJobs();
}

/**
 * 初始化
 */
document.addEventListener('DOMContentLoaded', () => {
  loadJobs();
  
  // 搜索
  const searchInput = document.getElementById('searchInput');
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      filters.keyword = e.target.value;
      loadJobs();
    }, 500);
  });
  
  // 类型筛选
  document.getElementById('type-academic')?.addEventListener('change', (e) => {
    if (e.target.checked) {
      filters.types.push('Academic');
    } else {
      filters.types = filters.types.filter(t => t !== 'Academic');
    }
    loadJobs();
  });
  
  document.getElementById('type-activities')?.addEventListener('change', (e) => {
    if (e.target.checked) {
      filters.types.push('Activities');
    } else {
      filters.types = filters.types.filter(t => t !== 'Activities');
    }
    loadJobs();
  });
  
  // 类别筛选
  document.getElementById('cat-ta')?.addEventListener('change', (e) => {
    if (e.target.checked) {
      filters.categories.push('TA');
    } else {
      filters.categories = filters.categories.filter(c => c !== 'TA');
    }
    loadJobs();
  });
  
  document.getElementById('cat-invigilator')?.addEventListener('change', (e) => {
    if (e.target.checked) {
      filters.categories.push('Invigilator');
    } else {
      filters.categories = filters.categories.filter(c => c !== 'Invigilator');
    }
    loadJobs();
  });
});
