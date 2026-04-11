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
    const response = await fetch(API_BASE + url, {
      credentials: 'include', // 携带 Cookie（Session）
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.json();

    // 401 未登录，跳转到登录页
    if (data.code === 401) {
      window.location.href = '/login.html';
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
    }),
    
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
    getModules: () => request('/mo/modules'),
    
    getModuleById: (id) => request(`/mo/modules/${id}`),
    
    getJobs: (params) => {
      const query = new URLSearchParams(params).toString();
      return request('/mo/jobs' + (query ? '?' + query : ''));
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
    
    deleteJob: (jobId) => request(`/mo/jobs/${jobId}`, {
      method: 'DELETE'
    }),
    
    getApplicants: (params) => {
      const query = new URLSearchParams(params).toString();
      return request('/mo/applicants' + (query ? '?' + query : ''));
    },
    
    updateApplicationStatus: (applicationId, data) => request(`/mo/applicants/${applicationId}/status`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    
    getTimesheets: (params) => {
      const query = new URLSearchParams(params).toString();
      return request('/mo/timesheets' + (query ? '?' + query : ''));
    },
    
    reviewTimesheet: (timesheetId, data) => request(`/mo/timesheets/${timesheetId}/review`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  // Admin 端
  admin: {
    getDashboard: () => request('/admin/dashboard'),
    
    getJobs: (params) => {
      const query = new URLSearchParams(params).toString();
      return request('/admin/jobs' + (query ? '?' + query : ''));
    },
    
    reviewJob: (jobId, action, comment) => request(`/admin/jobs/${jobId}/review`, {
      method: 'PUT',
      body: JSON.stringify({ action, comment })
    }),
    
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
