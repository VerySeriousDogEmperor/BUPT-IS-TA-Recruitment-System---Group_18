// User Management Page Logic

const MOCK_MOS = [
    { id: 'mo-1', name: 'Prof. Wang Lei', staffId: 'T20180042', phone: '18600001111', email: 'wanglei@bupt.edu.cn', department: 'CS', modules: ['Java Programming', 'Data Structures'], lastLogin: '2026-03-18 09:32', status: 'Active' },
    { id: 'mo-2', name: 'Prof. Zhang Hua', staffId: 'T20190015', phone: '18600002222', email: 'zhanghua@bupt.edu.cn', department: 'Math', modules: ['Advanced Calculus'], lastLogin: '2026-03-15 14:10', status: 'Active' },
    { id: 'mo-3', name: 'Prof. Chen Wei', staffId: 'T20170088', phone: '18600003333', email: 'chenwei@bupt.edu.cn', department: 'EE', modules: ['Circuit Analysis', 'Signals'], lastLogin: '2026-02-20 11:05', status: 'Active' },
    { id: 'mo-4', name: 'Prof. Sarah Liu', staffId: 'T20200031', phone: '18600004444', email: 'sarahliu@bupt.edu.cn', department: 'English', modules: ['Academic English'], lastLogin: '—', status: 'Disabled' }
];

const MOCK_TAS = [
    { id: 'ta-1', name: 'Zhang San', type: 'Undergraduate', studentId: '2023211301', phone: '13812345678', email: 'zhangsan@bupt.edu.cn', major: 'Software Engineering', department: 'CS', assignedModules: ['Java Programming'], lastLogin: '2026-03-18 10:15', status: 'Active' },
    { id: 'ta-2', name: 'Li Si', type: 'Graduate', studentId: '2022110502', phone: '13998765432', email: 'lisi@bupt.edu.cn', major: 'Computer Science', department: 'CS', assignedModules: ['Data Structures', 'Algo Lab'], lastLogin: '2026-03-17 16:40', status: 'Active' },
    { id: 'ta-3', name: 'Chen Ming', type: 'Graduate', studentId: '2022110418', phone: '13712349876', email: 'chenming@bupt.edu.cn', major: 'Computer Science', department: 'CS', assignedModules: ['Data Structures'], lastLogin: '2026-03-18 08:55', status: 'Active' },
    { id: 'ta-4', name: 'Liu Fang', type: 'Graduate', studentId: '2021110233', phone: '15867891234', email: 'liufang@bupt.edu.cn', major: 'Applied Math', department: 'Math', assignedModules: ['Linear Algebra'], lastLogin: '2026-03-10 09:20', status: 'Active' },
    { id: 'ta-5', name: 'Zhao Qian', type: 'Undergraduate', studentId: '2024211055', phone: '13511112222', email: 'zhaoqian@bupt.edu.cn', major: 'Electronic Eng.', department: 'EE', assignedModules: ['Circuit Analysis'], lastLogin: '—', status: 'Pending Activation' },
    { id: 'ta-6', name: 'Sun Li', type: 'Undergraduate', studentId: '2023211488', phone: '13699998888', email: 'sunli@bupt.edu.cn', major: 'Software Engineering', department: 'CS', assignedModules: ['Java Programming'], lastLogin: '2026-01-05 13:00', status: 'Disabled' }
];

let isMasked = false;
let showScanModal = false;
let scanStep = -1;
let scanComplete = false;

const SCAN_STEPS = [
    { file: 'users.json', duration: 800 },
    { file: 'jobs.json', duration: 600 },
    { file: 'workload.json', duration: 700 },
    { file: 'applications.json', duration: 500 }
];

document.addEventListener('DOMContentLoaded', function() {
    initSemesterDropdown();
    loadUsersContent();
});

function initSemesterDropdown() {
    const button = document.getElementById('semesterButton');
    const menu = document.getElementById('semesterMenu');
    
    if (!button || !menu) return;

    button.addEventListener('click', function(e) {
        e.stopPropagation();
        menu.classList.toggle('active');
    });

    document.addEventListener('click', function() {
        menu.classList.remove('active');
    });

    const options = menu.querySelectorAll('.semester-option');
    options.forEach(option => {
        option.addEventListener('click', function() {
            const label = this.textContent.trim();
            button.querySelector('.semester-label').textContent = `Current Semester: ${label}`;
            options.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            menu.classList.remove('active');
        });
    });
}

function loadUsersContent() {
    const content = document.getElementById('adminContent');
    if (!content) return;

    content.innerHTML = `
        <div class="page-header">
            <div class="page-title-section">
                <h1>User & Data Management</h1>
                <p>Manage MO and TA accounts, data privacy, and JSON data integrity.</p>
            </div>
            <div class="page-actions">
                <div class="scan-info">
                    <p class="scan-label">Last Scan</p>
                    <p class="scan-time">2026-03-18 14:00 <span class="scan-status scan-healthy">(Healthy)</span></p>
                </div>
                <button class="btn btn-primary" onclick="openScanModal()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke-width="2"/>
                        <polyline points="7.5 4.21 12 6.81 16.5 4.21" stroke-width="2"/>
                        <polyline points="7.5 19.79 7.5 14.6 3 12" stroke-width="2"/>
                        <polyline points="21 12 16.5 14.6 16.5 19.79" stroke-width="2"/>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke-width="2"/>
                        <line x1="12" y1="22.08" x2="12" y2="12" stroke-width="2"/>
                    </svg>
                    JSON Integrity Scan
                </button>
            </div>
        </div>

        <!-- Data Privacy Toggle -->
        <div class="privacy-toggle-container">
            <div class="privacy-toggle">
                <span class="privacy-label">Mask Sensitive Data</span>
                <button class="toggle-switch ${isMasked ? 'active' : ''}" onclick="toggleMask()">
                    <span class="toggle-slider"></span>
                </button>
                <svg class="privacy-icon ${isMasked ? 'active' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    ${isMasked ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke-width="2"/><line x1="1" y1="1" x2="23" y2="23" stroke-width="2"/>' : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke-width="2"/>'}
                </svg>
            </div>
        </div>

        <!-- MO Directory -->
        <div class="card" style="margin-bottom: 24px;">
            <div class="user-section-header">
                <div class="section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke-width="2"/>
                        <circle cx="12" cy="7" r="4" stroke-width="2"/>
                    </svg>
                    <h3>Module Organisers (MO)</h3>
                    <span class="count-badge">${MOCK_MOS.length}</span>
                </div>
            </div>
            <div class="user-table-wrapper">
                <table class="user-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Department</th>
                            <th>Responsible Modules</th>
                            <th>Staff ID</th>
                            <th>Phone</th>
                            <th>Last Login</th>
                            <th>Status</th>
                            <th style="text-align: right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${renderMORows()}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- TA Directory -->
        <div class="card">
            <div class="user-section-header">
                <div class="section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke-width="2"/>
                        <path d="M6 12v5c3 3 9 3 12 0v-5" stroke-width="2"/>
                    </svg>
                    <h3>Teaching Assistants (TA)</h3>
                    <span class="count-badge count-amber">${MOCK_TAS.length}</span>
                </div>
            </div>
            <div class="user-table-wrapper">
                <table class="user-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Major / Dept</th>
                            <th>Assigned Modules</th>
                            <th>Student ID</th>
                            <th>Phone</th>
                            <th>Last Login</th>
                            <th>Status</th>
                            <th style="text-align: right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${renderTARows()}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderMORows() {
    return MOCK_MOS.map(user => {
        const login = getLoginStatus(user.lastLogin);
        const isDisabled = user.status === 'Disabled';
        
        return `
            <tr class="${isDisabled ? 'row-disabled' : ''}">
                <td>
                    <div class="user-name">${user.name}</div>
                    <div class="user-email">${user.email}</div>
                </td>
                <td>
                    <span class="dept-badge">${user.department}</span>
                </td>
                <td>
                    <div class="modules-list">
                        ${user.modules.map(m => `<span class="module-tag">${m}</span>`).join('')}
                    </div>
                </td>
                <td>
                    <span class="sensitive-data ${isMasked ? 'masked' : ''}">${isMasked ? maskData(user.staffId, 'id') : user.staffId}</span>
                </td>
                <td>
                    <span class="sensitive-data ${isMasked ? 'masked' : ''}">${isMasked ? maskData(user.phone, 'phone') : user.phone}</span>
                </td>
                <td>
                    <div class="login-status ${login.class}">${login.label}</div>
                    ${user.lastLogin !== '—' ? `<div class="login-time">${user.lastLogin}</div>` : ''}
                </td>
                <td>
                    <span class="status-badge ${isDisabled ? 'status-disabled' : 'status-active'}">${user.status}</span>
                </td>
                <td style="text-align: right;">
                    ${isDisabled ? 
                        `<button class="btn-action btn-enable" onclick="toggleUserStatus('mo', '${user.id}')">Enable</button>` :
                        `<button class="btn-action btn-disable" onclick="toggleUserStatus('mo', '${user.id}')">Disable</button>`
                    }
                </td>
            </tr>
        `;
    }).join('');
}

function renderTARows() {
    return MOCK_TAS.map(user => {
        const login = getLoginStatus(user.lastLogin);
        const isDisabled = user.status === 'Disabled';
        const isPending = user.status === 'Pending Activation';
        
        return `
            <tr class="${isDisabled ? 'row-disabled' : ''}">
                <td>
                    <div class="user-name">${user.name}</div>
                    <div class="user-email">${user.email}</div>
                </td>
                <td>
                    <span class="type-badge ${user.type === 'Graduate' ? 'type-graduate' : 'type-undergrad'}">${user.type}</span>
                </td>
                <td>
                    <div class="major-text">${user.major}</div>
                    <span class="dept-badge dept-small">${user.department}</span>
                </td>
                <td>
                    <div class="modules-list">
                        ${user.assignedModules.map(m => `<span class="module-tag module-amber">${m}</span>`).join('')}
                    </div>
                </td>
                <td>
                    <span class="sensitive-data ${isMasked ? 'masked' : ''}">${isMasked ? maskData(user.studentId, 'id') : user.studentId}</span>
                </td>
                <td>
                    <span class="sensitive-data ${isMasked ? 'masked' : ''}">${isMasked ? maskData(user.phone, 'phone') : user.phone}</span>
                </td>
                <td>
                    <div class="login-status ${login.class}">${login.label}</div>
                    ${user.lastLogin !== '—' ? `<div class="login-time">${user.lastLogin}</div>` : ''}
                </td>
                <td>
                    <span class="status-badge ${isPending ? 'status-pending' : isDisabled ? 'status-disabled' : 'status-active'}">${user.status}</span>
                </td>
                <td style="text-align: right;">
                    ${isPending ? 
                        `<span class="text-muted">Awaiting</span>` :
                        isDisabled ? 
                            `<button class="btn-action btn-enable" onclick="toggleUserStatus('ta', '${user.id}')">Enable</button>` :
                            `<button class="btn-action btn-disable" onclick="toggleUserStatus('ta', '${user.id}')">Disable</button>`
                    }
                </td>
            </tr>
        `;
    }).join('');
}

function getLoginStatus(lastLogin) {
    if (lastLogin === '—') return { label: 'Never', class: 'login-never' };
    
    const d = new Date(lastLogin);
    const now = new Date('2026-03-18T15:00:00');
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return { label: 'Today', class: 'login-recent' };
    if (diffDays <= 7) return { label: `${diffDays}d ago`, class: 'login-week' };
    if (diffDays <= 30) return { label: `${diffDays}d ago`, class: 'login-month' };
    return { label: `${diffDays}d ago`, class: 'login-old' };
}

function maskData(text, type) {
    if (!text) return '';
    if (type === 'id') {
        return text.length > 8 ? `${text.substring(0, 4)}****${text.substring(text.length - 2)}` : text;
    }
    if (type === 'phone') {
        return text.length === 11 ? `${text.substring(0, 3)}****${text.substring(7)}` : text;
    }
    return text;
}

function toggleMask() {
    isMasked = !isMasked;
    loadUsersContent();
}

function toggleUserStatus(type, id) {
    alert(`Toggle ${type} user status: ${id}`);
    // In real implementation, update the user status
}

function openScanModal() {
    alert('JSON Integrity Scan would open here');
    // In real implementation, show modal with scanning animation
}
