// Mock Data
const mockPostings = [
    {
        id: "jp1",
        moduleCode: "COMP101",
        moduleTitle: "Introduction to Computer Science",
        role: "Teaching Assistant",
        positions: 2,
        hoursPerWeek: 8,
        requirements: ["Python proficiency", "GPA ≥ 3.5", "No schedule conflicts on Tue/Thu"],
        description: "We are looking for enthusiastic TAs to support lab sessions, grade assignments, and hold office hours for COMP101. Prior TA experience is a plus.",
        deadline: "2026-04-01",
        status: "pending_review",
        createdDate: "2026-03-10",
        submittedDate: "2026-03-12",
        urgeCount: 1,
        lastUrgedAt: "2026-03-15",
        applicantCount: 0
    },
    {
        id: "jp2",
        moduleCode: "DATA201",
        moduleTitle: "Data Analysis & Statistics",
        role: "Teaching Assistant",
        positions: 1,
        hoursPerWeek: 6,
        requirements: ["R or Python", "Statistics background", "GPA ≥ 3.3"],
        description: "TA for DATA201 will assist with weekly lab sessions covering statistical analysis using R/Python, help students with assignments, and support exam preparation.",
        deadline: "2026-04-05",
        status: "pending_review",
        createdDate: "2026-03-11",
        submittedDate: "2026-03-13",
        urgeCount: 0,
        applicantCount: 0
    },
    {
        id: "jp3",
        moduleCode: "MATH201",
        moduleTitle: "Calculus & Linear Algebra",
        role: "Teaching Assistant",
        positions: 2,
        hoursPerWeek: 6,
        requirements: ["Strong calculus & linear algebra", "LaTeX preferred", "GPA ≥ 3.5"],
        description: "Support tutorial sessions and grading for MATH201. Candidates should be comfortable explaining abstract mathematical concepts to students.",
        deadline: "2026-03-28",
        status: "published",
        createdDate: "2026-03-01",
        submittedDate: "2026-03-03",
        publishedDate: "2026-03-06",
        urgeCount: 0,
        applicantCount: 5
    },
    {
        id: "jp4",
        moduleCode: "COMP305",
        moduleTitle: "Algorithm Design",
        role: "Teaching Assistant",
        positions: 2,
        hoursPerWeek: 8,
        requirements: ["Algorithm & complexity theory", "C++ or Java", "GPA ≥ 3.7"],
        description: "TA for COMP305 will run weekly tutorials on algorithm design, assist with grading programming assignments, and provide one-on-one consultations.",
        deadline: "2026-04-10",
        status: "draft",
        createdDate: "2026-03-16",
        urgeCount: 0,
        applicantCount: 0
    },
    {
        id: "jp5",
        moduleCode: "COMP101",
        moduleTitle: "Introduction to Computer Science",
        role: "Teaching Assistant",
        positions: 3,
        hoursPerWeek: 8,
        requirements: ["Python proficiency", "GPA ≥ 3.5"],
        description: "Previous semester TA recruitment for COMP101. Successfully hired 3 TAs.",
        deadline: "2025-09-15",
        status: "completed",
        createdDate: "2025-08-20",
        submittedDate: "2025-08-22",
        publishedDate: "2025-08-25",
        completedDate: "2025-09-20",
        urgeCount: 0,
        applicantCount: 12
    }
];

// Module titles mapping
const moduleTitles = {
    'COMP101': 'Introduction to Computer Science',
    'DATA201': 'Data Analysis & Statistics',
    'MATH201': 'Calculus & Linear Algebra',
    'COMP305': 'Algorithm Design'
};

// State
let postings = [...mockPostings];
let activeTab = 'pending';
let formData = {
    moduleCode: '',
    moduleTitle: '',
    role: 'Teaching Assistant',
    positions: 1,
    hoursPerWeek: 6,
    deadline: '',
    description: '',
    requirements: ''
};
let editingPosting = null;
let urgeCooldowns = {}; // Track cooldown timers per posting

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderStats();
    renderPostings();
    updateCounts();
    attachEventListeners();
});

// Render Stats
function renderStats() {
    const totalPostings = postings.length;
    const pendingCount = postings.filter(p => p.status === 'pending_review').length;
    const publishedCount = postings.filter(p => p.status === 'published').length;
    const completedCount = postings.filter(p => p.status === 'completed').length;

    const stats = [
        { label: 'Total Postings', value: totalPostings, icon: '💼', color: '#3B82F6', bg: '#EFF6FF' },
        { label: 'Pending Review', value: pendingCount, icon: '⏰', color: '#D97706', bg: '#FEF3C7' },
        { label: 'Published', value: publishedCount, icon: '📢', color: '#16A34A', bg: '#DCFCE7' },
        { label: 'Completed', value: completedCount, icon: '✓', color: '#6366F1', bg: '#EEF2FF' }
    ];

    const statsGrid = document.getElementById('statsGrid');
    statsGrid.innerHTML = stats.map(stat => `
        <div class="stat-card">
            <div class="stat-icon" style="background: ${stat.bg};">
                <i style="color: ${stat.color};">${stat.icon}</i>
            </div>
            <div>
                <div class="stat-value">${stat.value}</div>
                <div class="stat-label">${stat.label}</div>
            </div>
        </div>
    `).join('');
}

// Render Postings
function renderPostings() {
    const container = document.getElementById('postingsList');
    const filtered = postings.filter(p => {
        if (activeTab === 'draft') return p.status === 'draft';
        if (activeTab === 'pending') return p.status === 'pending_review';
        if (activeTab === 'published') return p.status === 'published';
        if (activeTab === 'completed') return p.status === 'completed';
        return false;
    });

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state">No postings in this category.</div>';
        return;
    }

    container.innerHTML = filtered.map(posting => {
        const daysAgo = (dateStr) => {
            const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
            return diff === 0 ? 'today' : `${diff}d ago`;
        };

        const daysUntil = (dateStr) => {
            const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
            if (diff < 0) return { label: 'Closed', urgent: true };
            if (diff === 0) return { label: 'Closes today', urgent: true };
            if (diff <= 7) return { label: `${diff}d left`, urgent: true };
            return { label: `${diff}d left`, urgent: false };
        };

        const deadline = daysUntil(posting.deadline);
        const cooldown = urgeCooldowns[posting.id] || 0;

        return `
            <div class="posting-card">
                <div class="posting-header">
                    <div class="posting-main">
                        <div class="posting-icon">
                            <i>📚</i>
                        </div>
                        <div class="posting-content">
                            <div class="posting-badges">
                                <span class="posting-badge code">${posting.moduleCode}</span>
                                <span class="posting-status ${posting.status === 'draft' ? 'draft' : posting.status === 'pending_review' ? 'pending' : posting.status === 'published' ? 'published' : 'completed'}">
                                    ${posting.status === 'pending_review' ? '<span class="pulse"></span>' : ''}
                                    ${posting.status === 'published' ? '<span class="dot"></span>' : ''}
                                    ${posting.status === 'draft' ? 'Draft' : posting.status === 'pending_review' ? 'Pending Review' : posting.status === 'published' ? 'Published' : 'Completed'}
                                </span>
                                ${posting.urgeCount > 0 ? `
                                    <span class="urge-badge">
                                        <i>🔔</i>
                                        Reminded ${posting.urgeCount}×
                                    </span>
                                ` : ''}
                            </div>
                            <div class="posting-title">${posting.moduleTitle}</div>
                            <div class="posting-meta">${posting.role} · ${posting.positions} position${posting.positions > 1 ? 's' : ''} · ${posting.hoursPerWeek}h/wk</div>
                        </div>
                        <div class="posting-right">
                            <div class="deadline-info ${deadline.urgent ? 'urgent' : 'normal'}">
                                <i>📅</i>
                                <span>${deadline.label}</span>
                            </div>
                            ${posting.applicantCount > 0 ? `
                                <div class="applicant-count">
                                    <i>👥</i>
                                    <span>${posting.applicantCount} applicant${posting.applicantCount > 1 ? 's' : ''}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="posting-dates">
                        <span>Created ${daysAgo(posting.createdDate)}</span>
                        ${posting.submittedDate ? `<span>· Submitted ${daysAgo(posting.submittedDate)}</span>` : ''}
                        ${posting.publishedDate ? `<span class="success-text">· Published ${daysAgo(posting.publishedDate)}</span>` : ''}
                        ${posting.completedDate ? `<span class="info-text">· Completed ${daysAgo(posting.completedDate)}</span>` : ''}
                        <button class="btn-details" onclick="togglePostingDetails('${posting.id}')">
                            <i>👁️</i>
                            <span class="details-text">View Details</span>
                            <i class="chevron">→</i>
                        </button>
                    </div>
                </div>
                
                <div class="posting-expanded" id="expanded-${posting.id}">
                    <div class="posting-description">
                        <div class="posting-description-label">Job Description</div>
                        <div class="posting-description-text">${posting.description}</div>
                    </div>
                    ${posting.requirements.length > 0 ? `
                        <div class="posting-requirements">
                            <div class="posting-requirements-label">Requirements</div>
                            <div class="requirements-list">
                                ${posting.requirements.map(req => `
                                    <span class="requirement-tag">${req}</span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="posting-footer">
                    ${posting.status === 'draft' ? `
                        <button class="btn-edit" onclick="handleEdit('${posting.id}')">
                            <i>✏️</i>
                            <span>Edit Draft</span>
                        </button>
                        <button class="btn-submit" onclick="handleSubmitDraft('${posting.id}')">
                            <i>📤</i>
                            <span>Submit for Review</span>
                        </button>
                    ` : posting.status === 'pending_review' ? `
                        <div class="posting-status-text pending">
                            <i>⏱️</i>
                            <span>Awaiting Admin review${posting.lastUrgedAt ? ` · Last reminded ${daysAgo(posting.lastUrgedAt)}` : ''}</span>
                        </div>
                        <button class="btn-urge" onclick="handleUrge('${posting.id}')" ${cooldown > 0 ? 'disabled' : ''}>
                            <i>🔔</i>
                            <span>${cooldown > 0 ? `Remind Admin (${cooldown}s)` : 'Remind Admin'}</span>
                        </button>
                    ` : posting.status === 'published' ? `
                        <div class="posting-status-text published">
                            <i>✓</i>
                            <span>Visible to students · ${posting.applicantCount} applicant${posting.applicantCount !== 1 ? 's' : ''}</span>
                        </div>
                        <button class="btn-view-applicants">
                            <i>👥</i>
                            <span>View Applicants</span>
                        </button>
                    ` : `
                        <div class="posting-status-text completed">
                            <i>📦</i>
                            <span>Recruitment closed · ${posting.applicantCount} total application${posting.applicantCount !== 1 ? 's' : ''}</span>
                        </div>
                    `}
                </div>
            </div>
        `;
    }).join('');
}


// Update Counts
function updateCounts() {
    document.getElementById('draftCount').textContent = postings.filter(p => p.status === 'draft').length;
    document.getElementById('pendingCount').textContent = postings.filter(p => p.status === 'pending_review').length;
    document.getElementById('publishedCount').textContent = postings.filter(p => p.status === 'published').length;
    document.getElementById('completedCount').textContent = postings.filter(p => p.status === 'completed').length;
}

// Toggle Posting Details
function togglePostingDetails(id) {
    const expanded = document.getElementById(`expanded-${id}`);
    const btn = event.currentTarget;
    const detailsText = btn.querySelector('.details-text');
    
    if (expanded.classList.contains('visible')) {
        expanded.classList.remove('visible');
        btn.classList.remove('expanded');
        detailsText.textContent = 'View Details';
    } else {
        expanded.classList.add('visible');
        btn.classList.add('expanded');
        detailsText.textContent = 'Collapse';
    }
}

// Handle Edit
function handleEdit(id) {
    const posting = postings.find(p => p.id === id);
    if (!posting) return;
    
    editingPosting = posting;
    formData = {
        moduleCode: posting.moduleCode,
        moduleTitle: posting.moduleTitle,
        role: posting.role,
        positions: posting.positions,
        hoursPerWeek: posting.hoursPerWeek,
        deadline: posting.deadline,
        description: posting.description,
        requirements: posting.requirements.join('\n')
    };
    
    updateFormUI();
    openDrawer();
}

// Handle Submit Draft
function handleSubmitDraft(id) {
    const today = new Date().toISOString().split('T')[0];
    postings = postings.map(p => 
        p.id === id ? { ...p, status: 'pending_review', submittedDate: today } : p
    );
    renderStats();
    renderPostings();
    updateCounts();
    switchTab('pending');
    console.log('Submitted draft posting:', id);
}

// Handle Urge
function handleUrge(id) {
    const today = new Date().toISOString().split('T')[0];
    postings = postings.map(p => 
        p.id === id ? { ...p, urgeCount: p.urgeCount + 1, lastUrgedAt: today } : p
    );
    
    const posting = postings.find(p => p.id === id);
    if (posting) {
        showToast(`${posting.moduleCode} · ${posting.role}`);
        
        // Set cooldown
        urgeCooldowns[id] = 30;
        const interval = setInterval(() => {
            urgeCooldowns[id]--;
            if (urgeCooldowns[id] <= 0) {
                clearInterval(interval);
                delete urgeCooldowns[id];
            }
            renderPostings();
        }, 1000);
    }
    
    renderPostings();
    console.log('Urged posting:', id);
}

// Show Toast
function showToast(postingName) {
    const toast = document.getElementById('toast');
    const message = document.getElementById('toastMessage');
    message.textContent = `Review request for ${postingName} has been pushed to Admin`;
    toast.style.display = 'flex';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 4000);
}

// Attach Event Listeners
function attachEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });
    
    // New posting button
    document.getElementById('btnNewPosting').addEventListener('click', () => {
        editingPosting = null;
        formData = {
            moduleCode: '',
            moduleTitle: '',
            role: 'Teaching Assistant',
            positions: 1,
            hoursPerWeek: 6,
            deadline: '',
            description: '',
            requirements: ''
        };
        updateFormUI();
        openDrawer();
    });
    
    // Drawer controls
    document.getElementById('btnCloseDrawer').addEventListener('click', closeDrawer);
    document.getElementById('drawerOverlay').addEventListener('click', closeDrawer);
    document.getElementById('btnCancel').addEventListener('click', closeDrawer);
    
    // Toast close
    document.getElementById('toastClose').addEventListener('click', () => {
        document.getElementById('toast').style.display = 'none';
    });
    
    // Form inputs
    document.getElementById('selectModule').addEventListener('change', (e) => {
        formData.moduleCode = e.target.value;
        formData.moduleTitle = moduleTitles[e.target.value] || '';
    });
    
    document.getElementById('inputRole').addEventListener('input', (e) => {
        formData.role = e.target.value;
    });
    
    document.getElementById('inputDeadline').addEventListener('change', (e) => {
        formData.deadline = e.target.value;
    });
    
    document.getElementById('inputDescription').addEventListener('input', (e) => {
        formData.description = e.target.value;
    });
    
    document.getElementById('inputRequirements').addEventListener('input', (e) => {
        formData.requirements = e.target.value;
    });
    
    // Number inputs
    document.getElementById('btnPositionsDown').addEventListener('click', () => {
        formData.positions = Math.max(1, formData.positions - 1);
        document.getElementById('positionsValue').textContent = formData.positions;
    });
    
    document.getElementById('btnPositionsUp').addEventListener('click', () => {
        formData.positions++;
        document.getElementById('positionsValue').textContent = formData.positions;
    });
    
    document.getElementById('btnHoursDown').addEventListener('click', () => {
        formData.hoursPerWeek = Math.max(1, formData.hoursPerWeek - 1);
        document.getElementById('hoursValue').textContent = formData.hoursPerWeek + 'h';
    });
    
    document.getElementById('btnHoursUp').addEventListener('click', () => {
        formData.hoursPerWeek++;
        document.getElementById('hoursValue').textContent = formData.hoursPerWeek + 'h';
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
    
    renderPostings();
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
    document.getElementById('selectModule').value = formData.moduleCode;
    document.getElementById('inputRole').value = formData.role;
    document.getElementById('positionsValue').textContent = formData.positions;
    document.getElementById('hoursValue').textContent = formData.hoursPerWeek + 'h';
    document.getElementById('inputDeadline').value = formData.deadline;
    document.getElementById('inputDescription').value = formData.description;
    document.getElementById('inputRequirements').value = formData.requirements;
}

// Handle Form Submit
function handleFormSubmit(asDraft) {
    // Validate
    if (!formData.moduleCode || !formData.role || !formData.deadline || !formData.description) {
        alert('Please fill in all required fields.');
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const requirements = formData.requirements
        .split('\n')
        .map(r => r.trim())
        .filter(r => r.length > 0);
    
    if (editingPosting) {
        // Update existing posting
        postings = postings.map(p => 
            p.id === editingPosting.id ? {
                ...p,
                moduleCode: formData.moduleCode,
                moduleTitle: formData.moduleTitle,
                role: formData.role,
                positions: formData.positions,
                hoursPerWeek: formData.hoursPerWeek,
                deadline: formData.deadline,
                description: formData.description,
                requirements: requirements,
                status: asDraft ? 'draft' : 'pending_review',
                submittedDate: asDraft ? undefined : today
            } : p
        );
    } else {
        // Create new posting
        const newPosting = {
            id: `jp${Date.now()}`,
            moduleCode: formData.moduleCode,
            moduleTitle: formData.moduleTitle,
            role: formData.role,
            positions: formData.positions,
            hoursPerWeek: formData.hoursPerWeek,
            deadline: formData.deadline,
            description: formData.description,
            requirements: requirements,
            status: asDraft ? 'draft' : 'pending_review',
            createdDate: today,
            submittedDate: asDraft ? undefined : today,
            urgeCount: 0,
            applicantCount: 0
        };
        postings.unshift(newPosting);
    }
    
    renderStats();
    renderPostings();
    updateCounts();
    closeDrawer();
    switchTab(asDraft ? 'draft' : 'pending');
    
    console.log(asDraft ? 'Saved draft posting' : 'Submitted posting for review');
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
