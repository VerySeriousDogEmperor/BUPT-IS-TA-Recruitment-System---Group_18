// Workload Control Page Logic

const MOCK_WORKLOAD_DATA = [
    { id: 'wl-1', name: 'Wang Lei', role: 'Instructor', courses: ['Advanced Calculus'], weeklyHours: 24, maxHours: 25, status: 'Overload Risk', violationSource: 'Single Module Excess' },
    { id: 'wl-2', name: 'Chen Ming', role: 'Lead TA', courses: ['Data Structures', 'Algo Lab'], weeklyHours: 32, maxHours: 30, status: 'Blocked', violationSource: 'Multi-Module Overflow' },
    { id: 'wl-3', name: 'Sarah Connor', role: 'Instructor', courses: ['Machine Learning'], weeklyHours: 15, maxHours: 30, status: 'Normal', violationSource: null },
    { id: 'wl-4', name: 'Li Hua', role: 'TA', courses: ['Physics Lab'], weeklyHours: 28, maxHours: 25, status: 'Blocked', violationSource: 'Single Module Excess' },
    { id: 'wl-5', name: 'Zhang Wei', role: 'TA', courses: ['Java Prog', 'OS Lab', 'Network'], weeklyHours: 35, maxHours: 30, status: 'Blocked', violationSource: 'Multi-Module Overflow' },
    { id: 'wl-6', name: 'Liu Fang', role: 'Graduate TA', courses: ['Linear Algebra'], weeklyHours: 18, maxHours: 25, status: 'Normal', violationSource: null }
];

const MOCK_EXCEPTIONS = [
    {
        id: 'ex-1',
        studentName: 'Chen Ming',
        requestingMO: 'Admin_CS (Prof. Li)',
        reason: 'Exceptional candidate, required for both Data Structures labs due to sudden faculty leave.',
        currentHours: 32,
        maxHours: 30,
        overBy: 2,
        aiRecommendation: '该学生 GPA 3.9，过往评教评分 4.8/5.0。当前超限 2h 系因期中阅卷突增，属临时性因素。历史记录显示该生工时管理良好，建议通过。',
        aiVerdict: 'approve',
        aiConfidence: 92
    },
    {
        id: 'ex-2',
        studentName: 'Zhang Wei',
        requestingMO: 'Admin_CS (Prof. Wang)',
        reason: 'Student is handling three courses this semester due to staff shortages. Temporary arrangement until Week 10.',
        currentHours: 35,
        maxHours: 30,
        overBy: 5,
        aiRecommendation: '该学生同时承担 3 门课助教，超限 5h 较为严重。虽然 GPA 3.6 尚可，但跨课程负荷过高可能影响其学业表现。建议仅批准至 Week 10，并设置自动复查提醒。',
        aiVerdict: 'caution',
        aiConfidence: 78
    },
    {
        id: 'ex-3',
        studentName: 'Li Hua',
        requestingMO: 'Admin_Phys (Prof. Chen)',
        reason: 'Physics lab requires extended hours for equipment setup. Student volunteered for extra shifts.',
        currentHours: 28,
        maxHours: 25,
        overBy: 3,
        aiRecommendation: '该生本学期已有 2 次工时预警记录。"自愿加班" 不构成合规豁免理由。建议驳回，要求 MO 重新分配实验室值班人员。',
        aiVerdict: 'deny',
        aiConfidence: 88
    }
];

let activeTab = 'monitor';
let selectedBlocked = new Set();
let expandedAI = new Set();

document.addEventListener('DOMContentLoaded', function() {
    initSemesterDropdown();
    loadWorkloadContent();
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

function loadWorkloadContent() {
    const content = document.getElementById('adminContent');
    if (!content) return;

    const blockedCount = MOCK_WORKLOAD_DATA.filter(r => r.status === 'Blocked').length;

    content.innerHTML = `
        <div class="page-header">
            <div class="page-title-section">
                <h1>Workload Compliance Control</h1>
                <p>Monitor working hours and manage automatic circuit breakers (熔断机制).</p>
            </div>
            <div class="page-actions">
                <button class="btn ${activeTab === 'monitor' ? 'btn-primary' : 'btn-secondary'}" onclick="switchTab('monitor')">
                    Real-time Monitor
                </button>
                <button class="btn ${activeTab === 'exceptions' ? 'btn-primary' : 'btn-secondary'}" onclick="switchTab('exceptions')" style="position: relative;">
                    Pending Exceptions
                    <span class="exception-badge">${MOCK_EXCEPTIONS.length}</span>
                </button>
            </div>
        </div>

        ${activeTab === 'monitor' ? renderMonitorTab(blockedCount) : renderExceptionsTab()}
    `;

    attachEventListeners();
}

function renderMonitorTab(blockedCount) {
    return `
        <div class="card">
            <div class="workload-toolbar">
                <div class="search-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="11" cy="11" r="8" stroke-width="2"/>
                        <path d="m21 21-4.35-4.35" stroke-width="2"/>
                    </svg>
                    <input type="text" placeholder="Search by name or course..." id="workloadSearch">
                </div>
                <div class="workload-stats">
                    <span class="stat-item"><span class="stat-dot stat-red"></span>Blocked (${blockedCount})</span>
                    <span class="stat-item"><span class="stat-dot stat-amber"></span>Overload Risk</span>
                    <span class="stat-item"><span class="stat-dot stat-green"></span>Normal</span>
                </div>
                <button class="btn btn-secondary" id="batchUnlockBtn" disabled>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke-width="2"/>
                        <path d="M7 11V7a5 5 0 0 1 9.9-1" stroke-width="2"/>
                    </svg>
                    Batch Unlock
                </button>
            </div>

            <div class="workload-table-wrapper">
                <table class="workload-table">
                    <thead>
                        <tr>
                            <th style="width: 40px;"></th>
                            <th>Name</th>
                            <th>Course Assignment</th>
                            <th>Weekly Hours Usage</th>
                            <th>Violation Source</th>
                            <th>Status</th>
                            <th style="text-align: right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${renderWorkloadRows()}
                    </tbody>
                </table>
            </div>

            <div class="table-footer">
                <span>Total monitored: <strong>${MOCK_WORKLOAD_DATA.length}</strong> personnel</span>
                <span>Active circuit breakers: <strong style="color: #dc2626;">${blockedCount}</strong></span>
            </div>
        </div>
    `;
}

function renderWorkloadRows() {
    return MOCK_WORKLOAD_DATA.map(row => {
        const isBlocked = row.status === 'Blocked';
        const pct = Math.min((row.weeklyHours / row.maxHours) * 100, 100);
        const progressColor = pct >= 100 ? 'progress-red' : pct >= 80 ? 'progress-amber' : 'progress-green';
        
        return `
            <tr class="${isBlocked ? 'row-blocked' : ''}">
                <td>
                    ${isBlocked ? `<input type="checkbox" ${selectedBlocked.has(row.id) ? 'checked' : ''} onchange="toggleBlocked('${row.id}', this)">` : ''}
                </td>
                <td>
                    <div class="person-name">${row.name}</div>
                    <div class="person-role">${row.role}</div>
                </td>
                <td>
                    <div class="course-primary">${row.courses[0]}</div>
                    ${row.courses.length > 1 ? `<div class="course-more">+${row.courses.length - 1} more (${row.courses.slice(1).join(', ')})</div>` : ''}
                </td>
                <td>
                    <div class="hours-info">
                        <span class="hours-current ${pct >= 100 ? 'hours-danger' : pct >= 80 ? 'hours-warning' : 'hours-normal'}">${row.weeklyHours}h</span>
                        <span class="hours-separator">/</span>
                        <span class="hours-max">${row.maxHours}h</span>
                        <span class="hours-percent ${pct >= 100 ? 'percent-danger' : pct >= 80 ? 'percent-warning' : 'percent-normal'}">${Math.round(pct)}%</span>
                    </div>
                    <div class="progress-bar-small">
                        <div class="progress-fill-small ${progressColor}" style="width: ${pct}%;"></div>
                    </div>
                </td>
                <td>
                    ${row.violationSource ? `<span class="violation-badge ${row.violationSource === 'Multi-Module Overflow' ? 'violation-purple' : 'violation-orange'}">${row.violationSource === 'Multi-Module Overflow' ? '跨课程超限' : '单课超限'}</span>` : '<span class="text-muted">—</span>'}
                </td>
                <td>
                    ${renderStatusBadge(row.status)}
                </td>
                <td style="text-align: right;">
                    <div class="action-buttons">
                        <button class="icon-btn" title="Audit Details">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke-width="2"/>
                                <polyline points="14 2 14 8 20 8" stroke-width="2"/>
                            </svg>
                        </button>
                        ${isBlocked ? `
                            <button class="btn-unlock" onclick="unlockSingle('${row.id}')">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke-width="2"/>
                                    <path d="M7 11V7a5 5 0 0 1 9.9-1" stroke-width="2"/>
                                </svg>
                                Unlock
                            </button>
                        ` : `
                            <button class="icon-btn icon-btn-danger" title="Revoke">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <circle cx="12" cy="12" r="10" stroke-width="2"/>
                                    <line x1="15" y1="9" x2="9" y2="15" stroke-width="2"/>
                                    <line x1="9" y1="9" x2="15" y2="15" stroke-width="2"/>
                                </svg>
                            </button>
                        `}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function renderStatusBadge(status) {
    const statusConfig = {
        'Blocked': { class: 'status-blocked', text: 'Blocked (熔断)', icon: 'lock' },
        'Overload Risk': { class: 'status-risk', text: 'Overload Risk', icon: 'alert' },
        'Normal': { class: 'status-normal', text: 'Normal', icon: 'check' }
    };
    
    const config = statusConfig[status];
    return `<span class="status-badge ${config.class}">${config.text}</span>`;
}

function renderExceptionsTab() {
    return `
        <div class="exceptions-summary">
            <div class="summary-content">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" stroke-width="2"/>
                    <line x1="12" y1="8" x2="12" y2="12" stroke-width="2"/>
                    <line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2"/>
                </svg>
                <span><strong>${MOCK_EXCEPTIONS.length}</strong> override requests pending Admin review</span>
            </div>
            <div class="summary-legend">
                <span class="legend-item"><span class="legend-dot legend-green"></span>AI: Approve</span>
                <span class="legend-item"><span class="legend-dot legend-amber"></span>AI: Caution</span>
                <span class="legend-item"><span class="legend-dot legend-red"></span>AI: Deny</span>
            </div>
        </div>

        <div class="exceptions-list">
            ${MOCK_EXCEPTIONS.map(ex => renderExceptionCard(ex)).join('')}
        </div>
    `;
}

function renderExceptionCard(ex) {
    const verdictConfig = {
        'approve': { class: 'verdict-approve', label: 'Approval Suggested', color: 'green' },
        'caution': { class: 'verdict-caution', label: 'Conditional Approval', color: 'amber' },
        'deny': { class: 'verdict-deny', label: 'Denial Suggested', color: 'red' }
    };
    
    const verdict = verdictConfig[ex.aiVerdict];
    const isExpanded = expandedAI.has(ex.id);
    
    return `
        <div class="exception-card ${verdict.class}">
            <div class="exception-content">
                <div class="exception-icon ${verdict.class}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" stroke-width="2"/>
                        <line x1="12" y1="8" x2="12" y2="12" stroke-width="2"/>
                        <line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2"/>
                    </svg>
                </div>
                <div class="exception-details">
                    <div class="exception-header">
                        <h4>Workload Override — ${ex.studentName}</h4>
                        <span class="verdict-badge ${verdict.class}">${verdict.label}</span>
                    </div>
                    <p class="exception-summary">
                        MO <strong>${ex.requestingMO}</strong> requested override:
                        currently at <span class="hours-danger">${ex.currentHours}h</span> / ${ex.maxHours}h limit
                        (over by <strong>${ex.overBy}h</strong>).
                    </p>
                    <div class="exception-reason">
                        <strong>MO Reason:</strong> "${ex.reason}"
                    </div>
                    
                    <button class="ai-toggle" onclick="toggleAI('${ex.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" stroke-width="2"/>
                        </svg>
                        ${isExpanded ? 'Hide' : 'Show'} AI Recommendation
                        <span class="confidence">(Confidence: ${ex.aiConfidence}%)</span>
                    </button>
                    
                    ${isExpanded ? `
                        <div class="ai-recommendation ${verdict.class}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" stroke-width="2"/>
                            </svg>
                            <div>
                                <strong>AI Analysis</strong>
                                <p>${ex.aiRecommendation}</p>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="exception-actions">
                <button class="btn btn-primary">Approve Override</button>
                <button class="btn btn-secondary">Reject</button>
            </div>
        </div>
    `;
}

function switchTab(tab) {
    activeTab = tab;
    loadWorkloadContent();
}

function toggleBlocked(id, checkbox) {
    if (checkbox.checked) {
        selectedBlocked.add(id);
    } else {
        selectedBlocked.delete(id);
    }
    updateBatchUnlockButton();
}

function updateBatchUnlockButton() {
    const btn = document.getElementById('batchUnlockBtn');
    if (btn) {
        btn.disabled = selectedBlocked.size === 0;
        const text = selectedBlocked.size > 0 ? `Batch Unlock (${selectedBlocked.size})` : 'Batch Unlock';
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke-width="2"/>
                <path d="M7 11V7a5 5 0 0 1 9.9-1" stroke-width="2"/>
            </svg>
            ${text}
        `;
    }
}

function unlockSingle(id) {
    console.log('Unlock single:', id);
    alert(`Unlocking workload for ID: ${id}`);
}

function toggleAI(id) {
    if (expandedAI.has(id)) {
        expandedAI.delete(id);
    } else {
        expandedAI.add(id);
    }
    loadWorkloadContent();
}

function attachEventListeners() {
    const searchInput = document.getElementById('workloadSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            // Implement search filtering
        });
    }
}
