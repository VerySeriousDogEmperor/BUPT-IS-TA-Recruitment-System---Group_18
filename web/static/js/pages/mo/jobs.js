let modulesPageState = {
    currentUser: null,
    modules: [],
    jobs: [],
    applicants: [],
    activeTab: 'modules'
};

document.addEventListener('DOMContentLoaded', async () => {
    modulesPageState.currentUser = await ensureMOAuth();
    if (!modulesPageState.currentUser) {
        return;
    }

    setupModulesPageEvents();
    await loadModulesPageData();
});

function setupModulesPageEvents() {
    document.getElementById('tabModules').addEventListener('click', () => switchModulesTab('modules'));
    document.getElementById('tabRequests').addEventListener('click', () => switchModulesTab('requests'));
    document.getElementById('btnRequestNew').addEventListener('click', () => {
        window.location.href = '/mo/post-job.html';
    });

    const overlay = document.getElementById('drawerOverlay');
    const drawer = document.getElementById('formDrawer');
    if (overlay) overlay.style.display = 'none';
    if (drawer) drawer.style.display = 'none';
}

async function loadModulesPageData() {
    try {
        const [modules, jobs, applicants] = await Promise.all([
            API.mo.getModules(),
            API.mo.getJobs(),
            API.mo.getApplicants()
        ]);

        modulesPageState.modules = modules || [];
        modulesPageState.jobs = jobs || [];
        modulesPageState.applicants = applicants || [];

        renderModulesPageStats();
        renderModulesGrid();
        renderModuleJobsList();
        updateModulesPageCounts();
    } catch (error) {
        console.error('Failed to load module overview:', error);
        document.getElementById('modulesContent').innerHTML = `<div class="empty-state">${moEscapeHtml(error.message || 'Failed to load modules.')}</div>`;
        document.getElementById('requestsContent').innerHTML = '<div class="empty-state">Unable to load job posts.</div>';
    }
}

function renderModulesPageStats() {
    const statsGrid = document.getElementById('statsGrid');
    const publishedJobs = modulesPageState.jobs.filter((job) => job.status === 'published').length;
    const draftJobs = modulesPageState.jobs.filter((job) => job.status === 'draft').length;
    const pendingApplicants = modulesPageState.applicants.filter((item) => item.application?.status === 'pending').length;

    const stats = [
        { label: 'My Modules', value: modulesPageState.modules.length, icon: 'book-open' },
        { label: 'Published Jobs', value: publishedJobs, icon: 'badge-check' },
        { label: 'Draft Jobs', value: draftJobs, icon: 'file-text' },
        { label: 'Pending Applicants', value: pendingApplicants, icon: 'users' }
    ];

    statsGrid.innerHTML = stats.map((stat) => `
        <div class="stat-card">
            <div class="stat-icon">${moIcon(stat.icon)}</div>
            <div>
                <div class="stat-label">${moEscapeHtml(stat.label)}</div>
                <div class="stat-value">${moEscapeHtml(stat.value)}</div>
            </div>
        </div>
    `).join('');

    if (window.lucide) {
        lucide.createIcons();
    }
}

function renderModulesGrid() {
    const container = document.getElementById('modulesContent');

    if (!modulesPageState.modules.length) {
        container.innerHTML = '<div class="empty-state">No modules are assigned to this MO account yet.</div>';
        return;
    }

    container.innerHTML = modulesPageState.modules.map((module) => {
        const moduleCode = module.code || module.moduleCode || module.id;
        const relatedJobs = modulesPageState.jobs.filter((job) => job.moduleCode === moduleCode);
        const relatedApplicants = modulesPageState.applicants.filter((item) => item.job?.moduleCode === moduleCode);
        const publishedJobs = relatedJobs.filter((job) => job.status === 'published').length;
        const draftJobs = relatedJobs.filter((job) => job.status === 'draft').length;

        return `
            <div class="module-card">
                <div class="module-header">
                    <div class="module-info">
                        <div class="module-icon">${moIcon('book-open')}</div>
                        <div>
                            <div class="module-code">${moEscapeHtml(moduleCode)}</div>
                            <div class="module-badges">
                                <span class="status-badge active">${publishedJobs} published</span>
                                <span class="status-badge draft">${draftJobs} draft</span>
                            </div>
                            <div class="module-title">${moEscapeHtml(module.name || module.moduleName || 'Untitled module')}</div>
                            <div class="module-semester">${moEscapeHtml(module.semester || 'Semester not set')}</div>
                        </div>
                    </div>
                    <button class="btn-edit" onclick="window.location.href='/mo/post-job.html?module=${encodeURIComponent(moduleCode)}'">
                        ${moIcon('plus-circle')}
                        <span>Create Post</span>
                    </button>
                </div>

                <div class="module-stats">
                    <div class="stat-box">
                        <div class="stat-box-value">${relatedApplicants.length}</div>
                        <div class="stat-box-label">Applicants</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-box-value">${publishedJobs}</div>
                        <div class="stat-box-label">Published</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-box-value">${draftJobs}</div>
                        <div class="stat-box-label">Drafts</div>
                    </div>
                </div>

                <div class="progress-section">
                    <div class="progress-label">
                        ${moIcon('briefcase-business')}
                        <span>Recruitment Activity</span>
                    </div>
                    <div class="progress-info">
                        <span class="progress-info-left">${relatedJobs.length} total job posts</span>
                        <span class="progress-info-right">${relatedApplicants.length} applications</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width:${Math.min(100, relatedApplicants.length * 20 || (relatedJobs.length ? 25 : 0))}%;"></div>
                    </div>
                </div>

                <div class="module-footer">
                    <button class="module-link" onclick="window.location.href='/mo/applicants.html?module=${encodeURIComponent(moduleCode)}'">
                        View Applicants
                        ${moIcon('arrow-right')}
                    </button>
                    <button class="module-link secondary" onclick="window.location.href='/mo/post-job.html?module=${encodeURIComponent(moduleCode)}'">
                        ${moIcon('clipboard-list')}
                        Manage Jobs
                    </button>
                </div>
            </div>
        `;
    }).join('');

    if (window.lucide) {
        lucide.createIcons();
    }
}

function renderModuleJobsList() {
    const container = document.getElementById('requestsContent');

    if (!modulesPageState.jobs.length) {
        container.innerHTML = '<div class="empty-state">No job posts created yet.</div>';
        return;
    }

    const applicantCountByJobId = modulesPageState.applicants.reduce((map, item) => {
        const jobId = item.application?.jobId;
        if (!jobId) {
            return map;
        }
        map[jobId] = (map[jobId] || 0) + 1;
        return map;
    }, {});

    container.innerHTML = modulesPageState.jobs.map((job) => {
        const stateClass = job.status === 'published' || job.status === 'completed' ? 'approved' : 'pending';
        const stateIcon = job.status === 'published'
            ? 'badge-check'
            : job.status === 'completed'
                ? 'archive'
                : 'clock-3';
        const stateText = job.status === 'draft'
            ? 'Draft is ready for editing or publishing'
            : job.status === 'published'
                ? 'Visible to students now'
                : job.status === 'completed'
                    ? 'Recruitment cycle archived'
                    : 'Status available in system';
        const detailTarget = job.status === 'draft'
            ? `/mo/post-job.html?jobId=${encodeURIComponent(job.id)}`
            : `/mo/applicants.html?module=${encodeURIComponent(job.moduleCode || '')}`;
        const detailLabel = job.status === 'draft' ? 'Edit Draft' : 'View Applicants';
        const detailIcon = job.status === 'draft' ? 'square-pen' : 'users';

        return `
            <div class="request-card">
                <div class="request-header">
                    <div class="request-main">
                        <div class="request-icon ${job.status === 'draft' ? 'edit' : 'new'}">
                            ${moIcon(job.status === 'draft' ? 'file-text' : 'badge-check')}
                        </div>
                        <div class="request-content">
                            <div class="request-badges">
                                <span class="request-badge code">${moEscapeHtml(job.moduleCode || '-')}</span>
                                <span class="request-badge type-new">${moEscapeHtml(moStatusLabel(job.status))}</span>
                                <span class="request-status ${moEscapeHtml(job.status || 'draft')}">${moEscapeHtml(moStatusLabel(job.status))}</span>
                            </div>
                            <div class="request-title">${moEscapeHtml(job.title || 'Untitled job')}</div>
                            <div class="request-meta">${moEscapeHtml(job.moduleName || 'Unknown module')} · ${moEscapeHtml(job.positions || job.slots || 0)} positions · ${moEscapeHtml(moFormatHours(job.hoursPerWeek || 0))}/week</div>
                        </div>
                    </div>
                    <div class="request-dates">
                        <span>Updated ${moEscapeHtml(moFormatDate(job.updatedAt || job.createdAt))}</span>
                        <span>Applicants ${moEscapeHtml(applicantCountByJobId[job.id] || 0)}</span>
                        <button class="btn-details" onclick="window.location.href='${detailTarget}'">
                            ${moIcon(detailIcon)}
                            <span>${detailLabel}</span>
                            <i class="chevron" data-lucide="chevron-right"></i>
                        </button>
                    </div>
                </div>
                <div class="request-footer">
                    <div class="request-status-text ${stateClass}">
                        ${moIcon(stateIcon)}
                        <span>${stateText}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    if (window.lucide) {
        lucide.createIcons();
    }
}

function updateModulesPageCounts() {
    document.getElementById('pageSubtitle').textContent = `${modulesPageState.modules.length} modules · ${modulesPageState.jobs.length} job posts · ${modulesPageState.applicants.length} applications`;
    document.getElementById('modulesCount').textContent = modulesPageState.modules.length;
    document.getElementById('requestsCount').textContent = modulesPageState.jobs.length;

    const badge = document.getElementById('requestsBadge');
    const draftJobs = modulesPageState.jobs.filter((job) => job.status === 'draft').length;
    if (draftJobs) {
        badge.textContent = draftJobs;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

function switchModulesTab(tab) {
    modulesPageState.activeTab = tab;
    document.querySelectorAll('.tab-btn').forEach((button) => {
        button.classList.toggle('active', button.dataset.tab === tab);
    });
    document.getElementById('modulesContent').style.display = tab === 'modules' ? 'grid' : 'none';
    document.getElementById('requestsContent').style.display = tab === 'requests' ? 'flex' : 'none';
}
