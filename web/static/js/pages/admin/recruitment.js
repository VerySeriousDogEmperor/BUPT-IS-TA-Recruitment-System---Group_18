// Recruitment Status Page Logic

const MOCK_POSTINGS = [
    { id: 'jp-001', moduleName: 'Java Programming', moduleCode: 'COMP101', requestingMO: 'Prof. Wang Lei', department: 'CS', taSlots: 5, proposedWorkload: '10h/week', budgetStatus: 'within', submittedAt: '2026-03-15' },
    { id: 'jp-002', moduleName: 'Advanced Calculus', moduleCode: 'MATH301', requestingMO: 'Prof. Zhang Hua', department: 'Math', taSlots: 3, proposedWorkload: '15h/week', budgetStatus: 'warning', submittedAt: '2026-03-14' },
    { id: 'jp-003', moduleName: 'Data Structures', moduleCode: 'COMP201', requestingMO: 'Prof. Li Ming', department: 'CS', taSlots: 8, proposedWorkload: '12h/week', budgetStatus: 'within', submittedAt: '2026-03-13' },
    { id: 'jp-004', moduleName: 'Circuit Analysis', moduleCode: 'EE102', requestingMO: 'Prof. Chen Wei', department: 'EE', taSlots: 4, proposedWorkload: '20h/week', budgetStatus: 'exceeded', submittedAt: '2026-03-12' },
    { id: 'jp-005', moduleName: 'Academic English', moduleCode: 'ENG200', requestingMO: 'Prof. Sarah Liu', department: 'English', taSlots: 2, proposedWorkload: '8h/week', budgetStatus: 'within', submittedAt: '2026-03-11' }
];

let selectedRows = new Set();
let viewMode = 'pending';

document.addEventListener('DOMContentLoaded', function() {
    initSemesterDropdown();
    loadRecruitmentContent();
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

function loadRecruitmentContent() {
    const content = document.getElementById('adminContent');
    if (!content) return;

    if (viewMode === 'pending') {
        renderPendingView(content);
    } else {
        renderEmptyView(content);
    }
}

function renderPendingView(content) {
    const totalSlots = MOCK_POSTINGS.reduce((sum, p) => sum + p.taSlots, 0);
    const warningCount = MOCK_POSTINGS.filter(p => p.budgetStatus !== 'within').length;

    content.innerHTML = `
        <div class="page-header">
            <div class="page-title-section">
                <h1>Recruitment & Approvals</h1>
                <p>Final review pipeline for MO-submitted <span style="font-weight: 500; color: #374151;">job postings</span> — verify TA slots, workload, and budget compliance.</p>
            </div>
            <div class="page-actions">
                <button class="btn btn-secondary" onclick="toggleViewMode()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke-width="2"/><polyline points="12 6 12 12 16 14" stroke-width="2"/></svg>
                    Show Empty State
                </button>
                <button class="btn btn-secondary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke-width="2"/><polyline points="12 6 12 12 16 14" stroke-width="2"/></svg>
                    Post History
                </button>
                <button class="btn btn-primary" id="batchApproveBtn" disabled>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="9 11 12 14 22 4" stroke-width="2"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke-width="2"/></svg>
                    Batch Approve
                </button>
            </div>
        </div>

        <div class="filters-bar">
            <div class="search-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8" stroke-width="2"/><path d="m21 21-4.35-4.35" stroke-width="2"/></svg>
                <input type="text" placeholder="Search by course name or code..." id="searchInput">
            </div>
            <div class="filter-info">
                Showing <span class="filter-count">${MOCK_POSTINGS.length}</span> pending posting${MOCK_POSTINGS.length !== 1 ? 's' : ''}
            </div>
        </div>

        <div class="card">
            <div class="recruitment-table-wrapper">
                <table class="recruitment-table">
                    <thead>
                        <tr>
                            <th style="width: 40px;">
                                <input type="checkbox" id="selectAll" onchange="toggleSelectAll(this)">
                            </th>
                            <th>Module Name</th>
                            <th>Requesting MO</th>
                            <th>TA Slots</th>
                            <th>Proposed Workload</th>
                            <th>Budget Status</th>
                            <th>Submitted</th>
                            <th style="text-align: right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="postingsTableBody">
                        ${renderPostingsRows()}
                    </tbody>
                </table>
            </div>
            <div class="table-footer">
                <span>Total requested TA slots: <strong>${totalSlots}</strong></span>
                <span>Budget warnings: <strong style="color: #d97706;">${warningCount}</strong></span>
            </div>
        </div>
    `;

    attachEventListeners();
}

function renderPostingsRows() {
    return MOCK_POSTINGS.map(posting => `
        <tr class="${selectedRows.has(posting.id) ? 'selected' : ''}">
            <td>
                <input type="checkbox" ${selectedRows.has(posting.id) ? 'checked' : ''} onchange="toggleRow('${posting.id}', this)">
            </td>
            <td>
                <div class="module-name">${posting.moduleName}</div>
                <div class="module-code">${posting.moduleCode}</div>
            </td>
            <td>
                <div class="mo-name">${posting.requestingMO}</div>
                <div class="mo-dept">${posting.department} Dept</div>
            </td>
            <td>
                <span class="ta-slots-badge">${posting.taSlots}</span>
            </td>
            <td>
                <span class="workload-text">${posting.proposedWorkload}</span>
            </td>
            <td>
                ${renderBudgetStatus(posting.budgetStatus)}
            </td>
            <td class="submitted-date">${posting.submittedAt}</td>
            <td style="text-align: right;">
                <div class="action-buttons">
                    <button class="icon-btn" title="Review Details">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke-width="2"/></svg>
                    </button>
                    <button class="icon-btn icon-btn-success" title="Approve">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke-width="2"/><polyline points="22 4 12 14.01 9 11.01" stroke-width="2"/></svg>
                    </button>
                    <button class="icon-btn icon-btn-danger" title="Reject">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke-width="2"/><line x1="15" y1="9" x2="9" y2="15" stroke-width="2"/><line x1="9" y1="9" x2="15" y2="15" stroke-width="2"/></svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderBudgetStatus(status) {
    const statusConfig = {
        'within': { class: 'status-success', icon: 'check-circle', text: 'Within Budget' },
        'warning': { class: 'status-warning', icon: 'alert', text: 'Budget Warning' },
        'exceeded': { class: 'status-danger', icon: 'x-circle', text: 'Over Budget' }
    };
    
    const config = statusConfig[status];
    return `<span class="status-badge ${config.class}">${config.text}</span>`;
}

function renderEmptyView(content) {
    content.innerHTML = `
        <div class="page-header">
            <div class="page-title-section">
                <h1>Recruitment & Approvals</h1>
                <p>Final review pipeline for MO-submitted job postings.</p>
            </div>
            <div class="page-actions">
                <button class="btn btn-secondary" onclick="toggleViewMode()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke-width="2"/><polyline points="12 6 12 12 16 14" stroke-width="2"/></svg>
                    Show Pending
                </button>
                <button class="btn btn-secondary">Post History</button>
                <button class="btn btn-primary" disabled>Batch Approve</button>
            </div>
        </div>

        <div class="empty-state">
            <div class="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" stroke-width="2"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke-width="2"/>
                </svg>
                <div class="empty-check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <polyline points="9 11 12 14 22 4" stroke-width="2"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke-width="2"/></svg>
                </div>
            </div>
            <h3>All caught up!</h3>
            <p>No pending job postings from MOs. The system is running smoothly — all submitted postings have been reviewed and processed.</p>
            <div class="empty-actions">
                <button class="btn btn-primary" disabled>Batch Approve</button>
                <button class="btn btn-secondary">View Post History</button>
            </div>
        </div>
    `;
}

function toggleViewMode() {
    viewMode = viewMode === 'pending' ? 'empty' : 'pending';
    loadRecruitmentContent();
}

function toggleSelectAll(checkbox) {
    if (checkbox.checked) {
        MOCK_POSTINGS.forEach(p => selectedRows.add(p.id));
    } else {
        selectedRows.clear();
    }
    updateBatchButton();
    loadRecruitmentContent();
}

function toggleRow(id, checkbox) {
    if (checkbox.checked) {
        selectedRows.add(id);
    } else {
        selectedRows.delete(id);
    }
    updateBatchButton();
}

function updateBatchButton() {
    const btn = document.getElementById('batchApproveBtn');
    if (btn) {
        btn.disabled = selectedRows.size === 0;
        btn.textContent = selectedRows.size > 0 ? `Batch Approve (${selectedRows.size})` : 'Batch Approve';
    }
}

function attachEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            // Implement search filtering
        });
    }
}
