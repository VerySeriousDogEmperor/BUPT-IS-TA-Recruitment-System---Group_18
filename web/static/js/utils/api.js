/**
 * API 工具类 - 统一封装所有后端接口调用
 */

// 自动检测部署路径（开发环境用 /api，生产环境用 /web/api）
const API_BASE = window.location.pathname.startsWith('/web/') ? '/web/api' : '/api';

/**
 * 通用请求函数
 */
async function request(url, options = {}) {
  try {
    const method = String(options.method || 'GET').toUpperCase();
    const csrfToken = getCsrfToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    const response = await fetch(API_BASE + url, {
      credentials: 'include', // 携带 Cookie（Session）
      ...options,
      headers
    });

    const data = await response.json();
    persistCsrfToken(data.data);

    // 401 未登录，跳转到登录页
    if (data.code === 401) {
      const currentPath = window.location.pathname + window.location.search;
      const shouldReturnAfterLogin = window.location.pathname.endsWith('/apply.html')
        || window.location.pathname.endsWith('/job-detail.html')
        || window.location.pathname.includes('/student/');
      window.location.href = shouldReturnAfterLogin
        ? `/login.html?redirect=${encodeURIComponent(currentPath)}`
        : '/login.html';
      throw new Error('未登录');
    }

    // 其他错误
    if (data.code !== 200) {
      throw new Error(data.message || '请求失败');
    }

    return data.data;
  } catch (error) {
    console.error('API 请求失败:', error);
    throw error;
  }
}

function getCsrfToken() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return localStorage.getItem('csrfToken') || user.csrfToken || '';
  } catch (error) {
    return localStorage.getItem('csrfToken') || '';
  }
}

function persistCsrfToken(payload) {
  if (payload && payload.csrfToken) {
    localStorage.setItem('csrfToken', payload.csrfToken);
  }
}

function extractItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.items)) return payload.items;
  return [];
}

/**
 * API 接口集合
 */
const API = {
  // 认证模块
  auth: {
    login: (email, password, role) => request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role })
    }),
    
    register: (userData) => request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
    
    logout: () => request('/auth/logout', {
      method: 'POST'
    }).finally(clearLocalAuthState),
    
    me: () => request('/auth/me')
  },

  // 职位模块（公开）
  jobs: {
    getList: (params) => {
      const query = new URLSearchParams(params).toString();
      return request('/jobs' + (query ? '?' + query : ''));
    },
    
    getById: (id) => request(`/jobs/${id}`)
  },

  // 公告模块（公开）
  announcements: {
    getList: () => request('/announcements')
  },

  notifications: {
    getList: () => request('/notifications'),
    markRead: (ids) => request('/notifications/read', {
      method: 'POST',
      body: JSON.stringify({ ids })
    })
  },

  knowledge: {
    getList: (params) => {
      const query = new URLSearchParams(params || {}).toString();
      return request('/knowledge' + (query ? '?' + query : ''));
    },
    create: (data) => request('/knowledge', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    delete: (id) => request(`/knowledge/${id}`, {
      method: 'DELETE'
    })
  },

  // 学生端
  student: {
    getProfile: () => request('/student/profile'),
    
    updateProfile: (data) => request('/student/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    
    getApplications: () => request('/student/applications'),
    
    applyJob: (jobId) => request('/student/applications', {
      method: 'POST',
      body: JSON.stringify({ jobId })
    }),
    
    withdrawApplication: (applicationId) => request(`/student/applications/${applicationId}`, {
      method: 'DELETE'
    }),
    
    getTimesheets: () => request('/student/timesheets'),
    
    submitTimesheet: (data) => request('/student/timesheets', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // MO 端
  mo: {
    getModules: () => request('/mo/modules').then(extractItems),
    
    getModuleById: (id) => request(`/mo/modules/${id}`),
    
    getJobs: (params) => {
      const query = new URLSearchParams(params).toString();
      return request('/mo/jobs' + (query ? '?' + query : '')).then(extractItems);
    },
    
    createJob: (data) => request('/mo/jobs', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    
    updateJob: (jobId, data) => request(`/mo/jobs/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    
    submitJob: (jobId) => request(`/mo/jobs/${jobId}/submit`, {
      method: 'POST'
    }),

    closeJob: (jobId) => request(`/mo/jobs/${jobId}/close`, {
      method: 'POST'
    }),
    
    deleteJob: (jobId) => request(`/mo/jobs/${jobId}`, {
      method: 'DELETE'
    }),
    
    getApplicants: (params) => {
      const query = new URLSearchParams(params).toString();
      return request('/mo/applicants' + (query ? '?' + query : '')).then(extractItems);
    },
    
    updateApplicationStatus: (applicationId, data) => request(`/mo/applicants/${applicationId}/status`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    
    getTimesheets: (params) => {
      const query = new URLSearchParams(params).toString();
      return request('/mo/timesheets' + (query ? '?' + query : '')).then(extractItems);
    },
    
    reviewTimesheet: (timesheetId, data) => request(`/mo/timesheets/${timesheetId}/review`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  // Admin 端
  admin: {
    getDashboard: () => request('/admin/dashboard'),

    getReport: (params) => {
      const query = new URLSearchParams(params || {}).toString();
      return request('/admin/report' + (query ? '?' + query : ''));
    },
    
    getJobs: (params) => {
      const query = new URLSearchParams(params).toString();
      return request('/admin/jobs' + (query ? '?' + query : ''));
    },
    
    reviewJob: (jobId, action, comment) => request(`/admin/jobs/${jobId}/review`, {
      method: 'PUT',
      body: JSON.stringify({ action, comment })
    }),

    closeJob: (jobId) => request(`/admin/jobs/${jobId}/close`, {
      method: 'POST'
    }),

    getApplications: (params) => {
      const query = new URLSearchParams(params || {}).toString();
      return request('/admin/applications' + (query ? '?' + query : ''));
    },
    
    getUsers: (params) => {
      const query = new URLSearchParams(params).toString();
      return request('/admin/users' + (query ? '?' + query : ''));
    },
    
    createUser: (data) => request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    
    updateUserStatus: (userId, status) => request(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),
    
    getRecruitment: () => request('/admin/recruitment'),
    
    getWorkload: () => request('/admin/workload')
    ,

    getSettings: () => request('/admin/settings'),

    updateSettings: (data) => request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

    archiveSemester: (confirmation) => request('/admin/settings/archive', {
      method: 'POST',
      body: JSON.stringify({ confirmation })
    }),

    createKnowledgeDocument: (data) => request('/admin/knowledge', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

    deleteKnowledgeDocument: (id) => request(`/admin/knowledge/${id}`, {
      method: 'DELETE'
    }),

    reviewWorkloadException: (timesheetId, data) => request(`/admin/workload/exceptions/${timesheetId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

    getAnnouncements: () => request('/admin/announcements'),

    createAnnouncement: (data) => request('/admin/announcements', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

    updateAnnouncement: (id, data) => request(`/admin/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

    deleteAnnouncement: (id) => request(`/admin/announcements/${id}`, {
      method: 'DELETE'
    }),

    getAuditLogs: (params) => {
      const query = new URLSearchParams(params || {}).toString();
      return request('/admin/audit-logs' + (query ? '?' + query : ''));
    }
  },

  // AI 模块
  ai: {
    match: (studentId, jobId) => request('/ai/match', {
      method: 'POST',
      body: JSON.stringify({ studentId, jobId })
    }),
    
    rank: (jobId) => request(`/ai/rank/${jobId}`),
    
    chat: (message, sessionId) => request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId })
    }),
    
    anomaly: () => request('/ai/anomaly')
  }
};

document.addEventListener('DOMContentLoaded', () => {
  enforceRoleGuard();
  window.setTimeout(initNotificationCenter, 250);
});
document.addEventListener('auth-state-changed', initNotificationCenter);

async function enforceRoleGuard() {
  const path = window.location.pathname;
  const expectedRole = path.includes('/admin/') ? 'admin'
    : path.includes('/mo/') ? 'mo'
    : path.includes('/student/') ? 'student'
    : null;
  if (!expectedRole) return;

  const loginTarget = expectedRole === 'student' ? '/login.html' : `/login.html?mode=staff&role=${expectedRole}`;
  try {
    const user = await API.auth.me();
    if (!user || user.role !== expectedRole) {
      clearLocalAuthState();
      window.location.replace(loginTarget);
      return;
    }
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userRole', user.role || '');
    localStorage.setItem('isAuthenticated', 'true');
    document.dispatchEvent(new CustomEvent('auth-state-changed'));
  } catch (error) {
    clearLocalAuthState();
    if (!window.location.pathname.endsWith('/login.html')) {
      window.location.replace(loginTarget);
    }
  }
}

function clearLocalAuthState() {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('csrfToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('isAuthenticated');
}

async function handleAdminLogout(event) {
  if (event) {
    event.preventDefault();
  }
  const button = event?.currentTarget;
  if (button) {
    button.disabled = true;
  }
  try {
    await API.auth.logout();
  } catch (error) {
    clearLocalAuthState();
  }
  window.location.href = '/login.html?mode=staff';
}

window.handleAdminLogout = handleAdminLogout;

async function initNotificationCenter() {
  const button = document.querySelector('.notification-button, #notificationBtn');
  if (!button || button.dataset.bound === 'true') return;
  if (localStorage.getItem('isAuthenticated') !== 'true') return;

  button.dataset.bound = 'true';
  button.setAttribute('type', 'button');
  button.style.position = button.style.position || 'relative';
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const panel = document.getElementById('notificationPanel');
    if (panel) panel.classList.toggle('show');
  });
  document.addEventListener('click', () => {
    const panel = document.getElementById('notificationPanel');
    if (panel) panel.classList.remove('show');
  });

  try {
    const data = await API.notifications.getList();
    renderNotificationCenter(button, data || { unreadCount: 0, items: [] });
  } catch (error) {
    console.warn('Notifications unavailable:', error.message);
  }
}

function renderNotificationCenter(button, data) {
  ensureNotificationStyles();
  const items = data.items || [];
  const unreadItems = items.filter(item => !item.read);
  const count = unreadItems.length;
  const attentionCount = unreadItems.filter(item => ['danger', 'warning'].includes(item.severity)).length;
  const badge = button.querySelector('.notification-badge');
  if (badge) {
    badge.textContent = count > 9 ? '9+' : String(count || '');
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
  }
  const statusValue = document.querySelector('.status-value');
  if (statusValue) {
    statusValue.textContent = attentionCount > 0 ? `${attentionCount} Attention Item${attentionCount === 1 ? '' : 's'}` : 'Healthy';
  }

  let panel = document.getElementById('notificationPanel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'notificationPanel';
    panel.className = 'notification-panel';
    button.insertAdjacentElement('afterend', panel);
  }
  panel.innerHTML = `
    <div class="notification-panel-header">
      <strong>Notifications</strong>
      <button type="button" class="notification-mark-read" onclick="markAllNotificationsRead(event)">Mark all read</button>
    </div>
    <div class="notification-panel-list">
      ${items.length ? items.map(item => renderNotificationItem(item, Boolean(item.read))).join('') : '<div class="notification-empty">No updates right now.</div>'}
    </div>
  `;
  panel.addEventListener('click', (event) => event.stopPropagation());
  button.dataset.notificationIds = JSON.stringify(items.map(item => item.id));
}

function renderNotificationItem(item, isRead) {
  return `
    <a class="notification-item notification-${escapeNotificationHtml(item.severity || 'info')} ${isRead ? 'notification-read' : ''}" href="${escapeNotificationHtml(item.href || '#')}" onclick="markNotificationRead('${escapeNotificationHtml(item.id)}')">
      <span class="notification-dot"></span>
      <span class="notification-copy">
        <strong>${escapeNotificationHtml(item.title)}</strong>
        <span>${escapeNotificationHtml(item.message)}</span>
        <small>${formatNotificationTime(item.time)} · ${escapeNotificationHtml(item.type || 'Update')}</small>
      </span>
    </a>
  `;
}

function ensureNotificationStyles() {
  if (document.getElementById('notificationCenterStyles')) return;
  const style = document.createElement('style');
  style.id = 'notificationCenterStyles';
  style.textContent = `
    .notification-panel {
      position: absolute;
      top: 58px;
      right: 24px;
      z-index: 1000;
      width: min(360px, calc(100vw - 32px));
      max-height: 440px;
      overflow: auto;
      background: #fff;
      border: 1px solid #e5e7eb;
      box-shadow: 0 18px 45px rgba(15, 23, 42, 0.16);
      border-radius: 8px;
      display: none;
    }
    .notification-panel.show { display: block; }
    .notification-panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      border-bottom: 1px solid #e5e7eb;
      color: #111827;
      font-size: 14px;
    }
    .notification-panel-header span { color: #6b7280; font-size: 12px; }
    .notification-item {
      display: grid;
      grid-template-columns: 10px 1fr;
      gap: 10px;
      padding: 13px 16px;
      color: inherit;
      text-decoration: none;
      border-bottom: 1px solid #f3f4f6;
    }
    .notification-item:hover { background: #f8fafc; }
    .notification-item.notification-read { opacity: 0.62; }
    .notification-dot {
      width: 8px;
      height: 8px;
      margin-top: 5px;
      border-radius: 999px;
      background: #2563eb;
    }
    .notification-danger .notification-dot { background: #dc2626; }
    .notification-warning .notification-dot { background: #d97706; }
    .notification-success .notification-dot { background: #059669; }
    .notification-copy { display: grid; gap: 4px; min-width: 0; }
    .notification-copy strong { color: #111827; font-size: 13px; line-height: 1.25; }
    .notification-copy span { color: #4b5563; font-size: 12px; line-height: 1.4; }
    .notification-copy small { color: #9ca3af; font-size: 11px; }
    .notification-empty { padding: 18px 16px; color: #6b7280; font-size: 13px; }
    .notification-mark-read {
      border: none;
      background: none;
      color: #2563eb;
      cursor: pointer;
      font-size: 12px;
      padding: 0;
    }
    .notification-badge {
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      line-height: 1;
    }
  `;
  document.head.appendChild(style);
}

function getReadNotificationIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem('readNotificationIds') || '[]'));
  } catch (error) {
    return new Set();
  }
}

function setReadNotificationIds(ids) {
  localStorage.setItem('readNotificationIds', JSON.stringify(Array.from(ids).slice(-200)));
}

async function markNotificationRead(id) {
  try {
    await API.notifications.markRead([id]);
  } catch (error) {
    console.warn('Failed to mark notification read:', error.message);
  }
}

async function markAllNotificationsRead(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  const button = document.querySelector('.notification-button, #notificationBtn');
  let ids = [];
  try {
    ids = JSON.parse(button?.dataset.notificationIds || '[]');
  } catch (error) {
    // ignore malformed local UI state
  }
  try {
    await API.notifications.markRead(ids);
    renderNotificationCenter(button, await API.notifications.getList());
  } catch (error) {
    console.warn('Failed to refresh notifications:', error.message);
  }
}

function formatNotificationTime(value) {
  if (!value) return 'Just now';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).replace('T', ' ').slice(0, 16);
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function escapeNotificationHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
