// Mock Data - Modules
const mockModules = [
    {
        id: "m1",
        code: "COMP101",
        title: "Introduction to Computer Science",
        semester: "Sem 1, 2026",
        totalSlots: 4,
        filledSlots: 2,
        budgetHours: 160,
        usedHours: 72,
        status: "active",
        applicantCount: 12
    },
    {
        id: "m2",
        code: "DATA201",
        title: "Data Analysis & Statistics",
        semester: "Sem 1, 2026",
        totalSlots: 3,
        filledSlots: 1,
        budgetHours: 120,
        usedHours: 38,
        status: "active",
        applicantCount: 7
    },
    {
        id: "m3",
        code: "MATH201",
        title: "Calculus & Linear Algebra",
        semester: "Sem 1, 2026",
        totalSlots: 2,
        filledSlots: 1,
        budgetHours: 80,
        usedHours: 28,
        status: "active",
        applicantCount: 5
    },
    {
        id: "m4",
        code: "COMP305",
        title: "Algorithm Design",
        semester: "Sem 1, 2026",
        totalSlots: 2,
        filledSlots: 0,
        budgetHours: 80,
        usedHours: 0,
        status: "draft",
        applicantCount: 0
    }
];

// Mock Data - Requests
const mockRequests = [
    {
        id: "req1",
        type: "new_module",
        status: "pending",
        moduleCode: "COMP402",
        moduleTitle: "Advanced Machine Learning",
        semester: "Sem 1, 2026",
        totalSlots: 3,
        budgetHours: 120,
        reason: "New module added to curriculum requiring TA support for lab sessions.",
        submittedDate: "2026-03-10",
        createdDate: "2026-03-09"
    },
    {
        id: "req2",
        type: "edit_module",
        status: "rejected",
        moduleCode: "COMP101",
        moduleTitle: "Introduction to Computer Science",
        semester: "Sem 1, 2026",
        totalSlots: 5,
        budgetHours: 200,
        reason: "Increased enrolment requires more TA slots and budget.",
        submittedDate: "2026-03-01",
        reviewedDate: "2026-03-05",
        reviewNote: "Budget cap exceeded for this semester. Please revise.",
        createdDate: "2026-03-01",
        sourceModuleId: "m1"
    }
];

// State
let modules = [...mockModules];
let requests = [...mockRequests];
let activeTab = 'modules';
let formData = {
    type: 'new_module',
    moduleCode: '',
    moduleTitle: '',
    semester: 'Sem 1, 2026',
    totalSlots: 2,
    budgetHours: 80,
    reason: ''
};
let editTarget = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderStats();
    renderModules();
    renderRequests();
    updateCounts();
    attachEventListeners();
});

// Render Stats
function renderStats() {
    const totalModules = modules.length;
    const totalFilled = modules.reduce((sum, m) => sum + m.filledSlots, 0);
    const totalSlots = modules.reduce((sum, m) => sum + m.totalSlots, 0);
    const totalBudget = modules.reduce((sum, m) => sum + m.budgetHours, 0);
    const totalApplicants = modules.reduce((sum, m) => sum + m.applicantCount, 0);

    const stats = [
        { label: 'Total Modules', value: totalModules, icon: '📚', color: '#3B82F6', bg: '#EFF6FF' },
        { label: 'Slots Filled', value: `${totalFilled}/${totalSlots}`, icon: '✓', color: '#22C55E', bg: '#F0FDF4' },
        { label: 'Total Budget', value: `${totalBudget}h`, icon: '⏰', color: '#D97706', bg: '#FEF3C7' },
        { label: 'Total Applicants', value: totalApplicants, icon: '👥', color: '#8B5CF6', bg: '#F5F3FF' }
    ];

    const statsGrid = document.getElementById('statsGrid');
    statsGrid.innerHTML = stats.map(stat => `
        <div class="stat-card">
            <div class="stat-icon" style="background: ${stat.bg};">
                <i style="color: ${stat.color};">${stat.icon}</i>
            </div>
            <div>
                <div class="stat-label">${stat.label}</div>
                <div class="stat-value">${stat.value}</div>
            </div>
        </div>
    `).join('');
}

// Render Modules
function renderModules() {
    const container = document.getElementById('modulesContent');
    
    if (modules.length === 0) {
        container.innerHTML = '<div class="empty-state">No modules found.</div>';
        return;
    }

    container.innerHTML = modules.map(module => {
        const isFull = module.filledSlots >= module.totalSlots;
        const slotsPct = Math.round((module.filledSlots / module.totalSlots) * 100);
        const budgetPct = Math.round((module.usedHours / module.budgetHours) * 100);
        const budgetRemaining = module.budgetHours - module.usedHours;
        
        const slotsColor = isFull ? '#EF4444' : slotsPct >= 80 ? '#F97316' : '#3B82F6';
        const budgetColor = budgetPct >= 95 ? '#EF4444' : budgetPct >= 80 ? '#F97316' : '#22C55E';
        const budgetWarning = budgetPct >= 80;
        
        return `
            <div class="module-card">
                <div class="module-header">
                    <div class="module-info">
                        <div class="module-icon">
                            <i>📚</i>
                        </div>
                        <div>
                            <div class="module-code">${module.code}</div>
                            <div class="module-badges">
                                <span class="status-badge ${module.status}">${module.status === 'active' ? 'Active' : 'Draft'}</span>
                                ${isFull ? '<span class="status-badge full">Full</span>' : ''}
                            </div>
                            <div class="module-title">${module.title}</div>
                            <div class="module-semester">${module.semester}</div>
                        </div>
                    </div>
                    <button class="btn-edit" onclick="handleRequestEdit('${module.id}')">
                        <i>✏️</i>
                        <span>Request Edit</span>
                    </button>
                </div>
                
                <div class="module-stats">
                    <div class="stat-box">
                        <div class="stat-box-value">${module.applicantCount}</div>
                        <div class="stat-box-label">Applicants</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-box-value">${module.filledSlots}</div>
                        <div class="stat-box-label">Filled</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-box-value">${module.totalSlots - module.filledSlots}</div>
                        <div class="stat-box-label">Remaining</div>
                    </div>
                </div>
                
                <div class="progress-section">
                    <div class="progress-label">
                        <i>👥</i>
                        <span>TA Slots</span>
                    </div>
                    <div class="progress-info">
                        <span class="progress-info-left">${module.filledSlots}/${module.totalSlots} slots</span>
                        <span class="progress-info-right" style="color: ${slotsColor};">${slotsPct}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${slotsPct}%; background: ${slotsColor};"></div>
                    </div>
                </div>
                
                <div class="progress-section">
                    <div class="progress-label">
                        <i>⏰</i>
                        <span>Budget Hours</span>
                    </div>
                    <div class="progress-info">
                        <span class="progress-info-left">${module.usedHours}h used / ${module.budgetHours}h budget</span>
                        <span class="progress-info-right" style="color: ${budgetColor};">${budgetRemaining}h left</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${budgetPct}%; background: ${budgetColor};"></div>
                    </div>
                    ${budgetWarning ? `
                        <div class="progress-warning" style="color: ${budgetColor};">
                            <i>⚠️</i>
                            <span>${budgetPct >= 95 ? '⚠️ Budget critical — request increase now' : 'Budget ≥ 80% — review recommended'}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="module-footer">
                    <button class="module-link">
                        View Applicants
                        <i>→</i>
                    </button>
                    <button class="module-link secondary">
                        <i>📈</i>
                        Analytics
                    </button>
                </div>
            </div>
        `;
    }).join('');
}


// Render Requests
function renderRequests() {
    const container = document.getElementById('requestsContent');
    
    if (requests.length === 0) {
        container.innerHTML = '<div class="empty-state">No requests found.</div>';
        return;
    }

    container.innerHTML = requests.map(req => {
        const daysAgo = (dateStr) => {
            const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
            return diff === 0 ? 'today' : `${diff}d ago`;
        };

        return `
            <div class="request-card">
                <div class="request-header">
                    <div class="request-main">
                        <div class="request-icon ${req.type === 'new_module' ? 'new' : 'edit'}">
                            <i>${req.type === 'new_module' ? '➕' : '✏️'}</i>
                        </div>
                        <div class="request-content">
                            <div class="request-badges">
                                <span class="request-badge code">${req.moduleCode}</span>
                                <span class="request-badge ${req.type === 'new_module' ? 'type-new' : 'type-edit'}">
                                    ${req.type === 'new_module' ? 'New Module' : 'Edit Request'}
                                </span>
                                <span class="request-status ${req.status}">
                                    ${req.status === 'pending' ? '<span class="pulse"></span>' : ''}
                                    ${req.status === 'draft' ? 'Draft' : req.status === 'pending' ? 'Pending Review' : req.status === 'approved' ? 'Approved' : 'Rejected'}
                                </span>
                            </div>
                            <div class="request-title">${req.moduleTitle}</div>
                            <div class="request-meta">${req.semester} · ${req.totalSlots} TA slots · ${req.budgetHours}h budget</div>
                        </div>
                    </div>
                    <div class="request-dates">
                        <span>Created ${daysAgo(req.createdDate)}</span>
                        ${req.submittedDate ? `<span>· Submitted ${daysAgo(req.submittedDate)}</span>` : ''}
                        ${req.reviewedDate && req.status === 'approved' ? `<span class="approved-text">· Approved ${daysAgo(req.reviewedDate)}</span>` : ''}
                        ${req.reviewedDate && req.status === 'rejected' ? `<span class="rejected-text">· Rejected ${daysAgo(req.reviewedDate)}</span>` : ''}
                        <button class="btn-details" onclick="toggleRequestDetails('${req.id}')">
                            <i>👁️</i>
                            <span>Details</span>
                            <i class="chevron">→</i>
                        </button>
                    </div>
                </div>
                
                <div class="request-expanded" id="expanded-${req.id}">
                    <div class="request-reason">
                        <div class="request-reason-label">Reason for Request</div>
                        <div class="request-reason-text">${req.reason}</div>
                    </div>
                    ${req.reviewNote ? `
                        <div class="admin-note ${req.status}">
                            <div class="admin-note-label">Admin Note</div>
                            <div class="admin-note-text">${req.reviewNote}</div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="request-footer">
                    ${req.status === 'draft' ? `
                        <button class="btn-submit" onclick="handleSubmitDraft('${req.id}')">
                            <i>📤</i>
                            <span>Submit for Review</span>
                        </button>
                    ` : req.status === 'pending' ? `
                        <div class="request-status-text pending">
                            <i>⏱️</i>
                            <span>Awaiting Admin review</span>
                        </div>
                    ` : req.status === 'approved' ? `
                        <div class="request-status-text approved">
                            <i>✓</i>
                            <span>${req.type === 'new_module' ? 'Module is now active in My Modules' : 'Module has been updated'}</span>
                        </div>
                    ` : `
                        <div class="request-status-text rejected">
                            <i>✕</i>
                            <span>Request rejected — please revise and resubmit</span>
                        </div>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

// Update Counts
function updateCounts() {
    const activeModules = modules.filter(m => m.status === 'active').length;
    const draftModules = modules.filter(m => m.status === 'draft').length;
    const pendingRequests = requests.filter(r => r.status === 'pending').length;
    const draftRequests = requests.filter(r => r.status === 'draft').length;
    
    document.getElementById('pageSubtitle').textContent = 
        `${activeModules} active · ${draftModules} draft · ${pendingRequests} pending approval`;
    
    document.getElementById('modulesCount').textContent = activeModules + draftModules;
    document.getElementById('requestsCount').textContent = requests.length;
    
    const badge = document.getElementById('requestsBadge');
    const badgeCount = pendingRequests + draftRequests;
    if (badgeCount > 0) {
        badge.textContent = badgeCount;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

// Toggle Request Details
function toggleRequestDetails(id) {
    const expanded = document.getElementById(`expanded-${id}`);
    const btn = event.currentTarget;
    const chevron = btn.querySelector('.chevron');
    
    if (expanded.classList.contains('visible')) {
        expanded.classList.remove('visible');
        btn.classList.remove('expanded');
        btn.querySelector('span').textContent = 'Details';
    } else {
        expanded.classList.add('visible');
        btn.classList.add('expanded');
        btn.querySelector('span').textContent = 'Collapse';
    }
}

// Handle Request Edit
function handleRequestEdit(moduleId) {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;
    
    editTarget = module;
    formData = {
        type: 'edit_module',
        moduleCode: module.code,
        moduleTitle: module.title,
        semester: module.semester,
        totalSlots: module.totalSlots,
        budgetHours: module.budgetHours,
        reason: ''
    };
    
    updateFormUI();
    openDrawer();
}

// Handle Submit Draft
function handleSubmitDraft(id) {
    const today = new Date().toISOString().split('T')[0];
    requests = requests.map(r => 
        r.id === id ? { ...r, status: 'pending', submittedDate: today } : r
    );
    renderRequests();
    updateCounts();
    console.log('Submitted draft request:', id);
}

// Attach Event Listeners
function attachEventListeners() {
    // Tab switching
    document.getElementById('tabModules').addEventListener('click', () => switchTab('modules'));
    document.getElementById('tabRequests').addEventListener('click', () => switchTab('requests'));
    
    // Request new module button
    document.getElementById('btnRequestNew').addEventListener('click', () => {
        editTarget = null;
        formData = {
            type: 'new_module',
            moduleCode: '',
            moduleTitle: '',
            semester: 'Sem 1, 2026',
            totalSlots: 2,
            budgetHours: 80,
            reason: ''
        };
        updateFormUI();
        openDrawer();
    });
    
    // Drawer controls
    document.getElementById('btnCloseDrawer').addEventListener('click', closeDrawer);
    document.getElementById('drawerOverlay').addEventListener('click', closeDrawer);
    document.getElementById('btnCancel').addEventListener('click', closeDrawer);
    
    // Form type buttons
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            formData.type = btn.dataset.type;
        });
    });
    
    // Form inputs
    document.getElementById('inputModuleCode').addEventListener('input', (e) => {
        formData.moduleCode = e.target.value;
    });
    
    document.getElementById('inputModuleTitle').addEventListener('input', (e) => {
        formData.moduleTitle = e.target.value;
    });
    
    document.getElementById('inputSemester').addEventListener('input', (e) => {
        formData.semester = e.target.value;
    });
    
    document.getElementById('inputReason').addEventListener('input', (e) => {
        formData.reason = e.target.value;
    });
    
    // Number inputs
    document.getElementById('btnSlotsDown').addEventListener('click', () => {
        formData.totalSlots = Math.max(1, formData.totalSlots - 1);
        document.getElementById('slotsValue').textContent = formData.totalSlots;
    });
    
    document.getElementById('btnSlotsUp').addEventListener('click', () => {
        formData.totalSlots++;
        document.getElementById('slotsValue').textContent = formData.totalSlots;
    });
    
    document.getElementById('btnBudgetDown').addEventListener('click', () => {
        formData.budgetHours = Math.max(10, formData.budgetHours - 10);
        document.getElementById('budgetValue').textContent = formData.budgetHours + 'h';
    });
    
    document.getElementById('btnBudgetUp').addEventListener('click', () => {
        formData.budgetHours += 10;
        document.getElementById('budgetValue').textContent = formData.budgetHours + 'h';
    });
    
    // Form submission
    document.getElementById('btnSaveDraft').addEventListener('click', () => handleFormSubmit(true));
    document.getElementById('btnSubmitForm').addEventListener('click', () => handleFormSubmit(false));
}

// Switch Tab
function switchTab(tab) {
    activeTab = tab;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    // Update content visibility
    document.getElementById('modulesContent').style.display = tab === 'modules' ? 'grid' : 'none';
    document.getElementById('requestsContent').style.display = tab === 'requests' ? 'flex' : 'none';
}

// Open Drawer
function openDrawer() {
    document.getElementById('formDrawer').classList.add('open');
    document.getElementById('drawerOverlay').classList.add('open');
}

// Close Drawer
function closeDrawer() {
    document.getElementById('formDrawer').classList.remove('open');
    document.getElementById('drawerOverlay').classList.remove('open');
}

// Update Form UI
function updateFormUI() {
    // Update type buttons
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === formData.type);
    });
    
    // Update inputs
    document.getElementById('inputModuleCode').value = formData.moduleCode;
    document.getElementById('inputModuleTitle').value = formData.moduleTitle;
    document.getElementById('inputSemester').value = formData.semester;
    document.getElementById('slotsValue').textContent = formData.totalSlots;
    document.getElementById('budgetValue').textContent = formData.budgetHours + 'h';
    document.getElementById('inputReason').value = formData.reason;
}

// Handle Form Submit
function handleFormSubmit(asDraft) {
    // Validate
    if (!formData.moduleCode || !formData.moduleTitle || !formData.reason) {
        alert('Please fill in all required fields.');
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const newRequest = {
        id: `req${Date.now()}`,
        type: formData.type,
        status: asDraft ? 'draft' : 'pending',
        moduleCode: formData.moduleCode,
        moduleTitle: formData.moduleTitle,
        semester: formData.semester,
        totalSlots: formData.totalSlots,
        budgetHours: formData.budgetHours,
        reason: formData.reason,
        createdDate: today,
        submittedDate: asDraft ? undefined : today,
        sourceModuleId: editTarget?.id
    };
    
    requests.unshift(newRequest);
    renderRequests();
    updateCounts();
    closeDrawer();
    switchTab('requests');
    
    console.log(asDraft ? 'Saved draft request' : 'Submitted request for review', newRequest);
}


// Logout function
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
        sessionStorage.clear();
        window.location.href = '/login.html';
    }
}
