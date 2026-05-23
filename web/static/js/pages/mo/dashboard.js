const dashboardStageLabels = {
    pending: 'Pending Review',
    approved: 'Approved',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn'
};

const dashboardStageOrder = ['pending', 'approved', 'rejected', 'withdrawn'];

const dashboardStageColors = {
    pending: { bg: '#fef3c7', badge: '#b45309' },
    approved: { bg: '#dcfce7', badge: '#15803d' },
    rejected: { bg: '#fee2e2', badge: '#b91c1c' },
    withdrawn: { bg: '#e2e8f0', badge: '#475569' }
};

let dashboardState = {
    currentUser: null,
    applicants: [],
    modules: [],
    jobs: [],
    filterPendingOnly: false,
    filterApprovedOnly: false,
    filterModule: 'all',
    selectedApplicantId: null
};

document.addEventListener('DOMContentLoaded', async () => {
    dashboardState.currentUser = await ensureMOAuth();
    if (!dashboardState.currentUser) {
        return;
    }

    setupDashboardEvents();
    await loadDashboardData();
});

function setupDashboardEvents() {
    const focusFiltersBtn = document.getElementById('focusFiltersBtn');
    if (focusFiltersBtn) {
        focusFiltersBtn.addEventListener('click', () => {
            const filterBar = document.querySelector('.filter-bar');
            if (filterBar) {
                filterBar.scrollIntoView({ behavior: 'smooth', block: 'center' });
                filterBar.classList.add('focused');
                window.setTimeout(() => filterBar.classList.remove('focused'), 1200);
            }
        });
    }

    const exportDashboardBtn = document.getElementById('exportDashboardBtn');
    if (exportDashboardBtn) {
        exportDashboardBtn.addEventListener('click', exportDashboardReport);
    }

    document.getElementById('filterPendingOnly').addEventListener('click', () => {
        dashboardState.filterPendingOnly = !dashboardState.filterPendingOnly;
        document.getElementById('filterPendingOnly').classList.toggle('active', dashboardState.filterPendingOnly);
        if (dashboardState.filterPendingOnly) {
            dashboardState.filterApprovedOnly = false;
            document.getElementById('filterApprovedOnly').classList.remove('active', 'green');
        }
        renderDashboardBoard();
    });

    document.getElementById('filterApprovedOnly').addEventListener('click', () => {
        dashboardState.filterApprovedOnly = !dashboardState.filterApprovedOnly;
        const button = document.getElementById('filterApprovedOnly');
        button.classList.toggle('active', dashboardState.filterApprovedOnly);
        button.classList.toggle('green', dashboardState.filterApprovedOnly);
        if (dashboardState.filterApprovedOnly) {
            dashboardState.filterPendingOnly = false;
            document.getElementById('filterPendingOnly').classList.remove('active');
        }
        renderDashboardBoard();
    });

    document.getElementById('filterModule').addEventListener('change', (event) => {
        dashboardState.filterModule = event.target.value;
        renderDashboardBoard();
    });

    document.getElementById('clearFilters').addEventListener('click', () => {
        dashboardState.filterPendingOnly = false;
        dashboardState.filterApprovedOnly = false;
        dashboardState.filterModule = 'all';
        document.getElementById('filterPendingOnly').classList.remove('active');
        document.getElementById('filterApprovedOnly').classList.remove('active', 'green');
        document.getElementById('filterModule').value = 'all';
        renderDashboardBoard();
    });
}

async function loadDashboardData() {
    try {
        const [modules, jobs, applicants] = await Promise.all([
            API.mo.getModules(),
            API.mo.getJobs(),
            API.mo.getApplicants()
        ]);

        dashboardState.modules = modules || [];
        dashboardState.jobs = jobs || [];
        dashboardState.applicants = (applicants || []).map(normalizeDashboardApplicant);

        populateDashboardModuleFilter();
        updateDashboardStats();
        renderDashboardBoard();
    } catch (error) {
        console.error('Failed to load MO dashboard:', error);
        document.getElementById('kanbanBoard').innerHTML = `
            <div class="column-empty">
                <i data-lucide="triangle-alert"></i>
                <p>${moEscapeHtml(error.message || 'Failed to load dashboard data.')}</p>
            </div>
        `;
        lucide.createIcons();
    }
}

function normalizeDashboardApplicant(item) {
    const application = item.application || {};
    const student = item.student || {};
    const job = item.job || {};

    return {
        id: application.id,
        status: application.status || 'pending',
        appliedAt: application.appliedAt,
        reviewComment: application.reviewComment || application.reviewNote || '',
        timeline: application.timeline || [],
        student,
        job,
        name: student.name || 'Unknown Student',
        studentId: student.studentId || student.id || '-',
        email: student.email || '-',
        gpa: student.gpa ?? 'N/A',
        moduleCode: job.moduleCode || '-',
        moduleName: job.moduleName || job.title || 'Untitled job',
        avatar: moInitials(student.name),
        major: student.major || 'Not provided'
    };
}

function populateDashboardModuleFilter() {
    const select = document.getElementById('filterModule');
    const options = dashboardState.modules.map((module) => {
        const code = module.code || module.moduleCode || module.id;
        const name = module.name || module.moduleName || '';
        return `<option value="${moEscapeHtml(code)}">${moEscapeHtml(code)}${name ? ` - ${moEscapeHtml(name)}` : ''}</option>`;
    });

    select.innerHTML = '<option value="all">All Modules</option>' + options.join('');
}

function getFilteredDashboardApplicants() {
    return dashboardState.applicants.filter((applicant) => {
        if (dashboardState.filterPendingOnly && applicant.status !== 'pending') return false;
        if (dashboardState.filterApprovedOnly && applicant.status !== 'approved') return false;
        if (dashboardState.filterModule !== 'all' && applicant.moduleCode !== dashboardState.filterModule) return false;
        return true;
    });
}

function updateDashboardStats() {
    const total = dashboardState.applicants.length;
    const pending = dashboardState.applicants.filter((item) => item.status === 'pending').length;
    const rejected = dashboardState.applicants.filter((item) => item.status === 'rejected').length;
    const approved = dashboardState.applicants.filter((item) => item.status === 'approved').length;

    document.getElementById('totalApplicants').textContent = total;
    document.getElementById('pendingReviewCount').textContent = pending;
    document.getElementById('pendingReviewHint').textContent = pending ? `${pending} awaiting your decision` : 'No pending reviews';
    document.getElementById('rejectedCount').textContent = rejected;
    document.getElementById('finalCount').textContent = approved;
}

function renderDashboardBoard() {
    const filtered = getFilteredDashboardApplicants();
    const board = document.getElementById('kanbanBoard');
    const clearVisible = dashboardState.filterPendingOnly || dashboardState.filterApprovedOnly || dashboardState.filterModule !== 'all';

    document.getElementById('clearFilters').style.display = clearVisible ? 'flex' : 'none';
    document.getElementById('filterCount').textContent = `Showing ${filtered.length} of ${dashboardState.applicants.length} applications`;

    if (!filtered.length) {
        board.innerHTML = `
            <div class="column-empty">
                <i data-lucide="inbox"></i>
                <p>No applications match the selected filters.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    const grouped = {};
    dashboardStageOrder.forEach((status) => {
        grouped[status] = filtered.filter((applicant) => applicant.status === status);
    });

    board.innerHTML = dashboardStageOrder.map((status) => renderDashboardColumn(status, grouped[status])).join('');
    lucide.createIcons();
}

function exportDashboardReport() {
    const filtered = getFilteredDashboardApplicants();
    const rows = [
        ['Student', 'Student ID', 'Email', 'Module Code', 'Module Name', 'Status', 'Applied At', 'Review Comment'],
        ...filtered.map((item) => [
            item.name,
            item.studentId,
            item.email,
            item.moduleCode,
            item.moduleName,
            item.status,
            item.appliedAt || '',
            item.reviewComment || ''
        ])
    ];

    const csv = rows
        .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'mo-dashboard-report.csv';
    link.click();
    URL.revokeObjectURL(link.href);
}

function renderDashboardColumn(status, applicants) {
    const colors = dashboardStageColors[status];
    return `
        <div class="kanban-column">
            <div class="column-header" style="background: ${colors.bg};">
                <div class="column-header-left">
                    <div class="column-dot" style="background: ${colors.badge};"></div>
                    <span class="column-title">${dashboardStageLabels[status]}</span>
                </div>
                <div class="column-header-right">
                    <span class="column-count">${applicants.length}</span>
                </div>
            </div>
            <div class="column-cards">
                ${applicants.length ? applicants.map(renderDashboardCard).join('') : `
                    <div class="column-empty">
                        <i data-lucide="users"></i>
                        <p>No applications in this stage</p>
                    </div>
                `}
            </div>
        </div>
    `;
}

function renderDashboardCard(applicant) {
    const reviewNote = applicant.reviewComment
        ? `<div class="card-tags"><span class="card-tag skill">${moEscapeHtml(applicant.reviewComment)}</span></div>`
        : '';
    const fill = getDashboardJobFill(applicant.job || {});

    const actionButtons = applicant.status === 'pending'
        ? `
            <div class="card-actions" onclick="event.stopPropagation()">
                <button class="card-btn-reject" onclick="handleDashboardDecision('${applicant.id}', 'reject')">
                    <i data-lucide="x"></i>
                    Reject
                </button>
                ${fill.full ? `
                    <button class="card-btn-move" disabled title="This job has reached its approved capacity." style="opacity:.55;cursor:not-allowed;">
                        Full
                        <i data-lucide="circle-alert"></i>
                    </button>
                ` : `
                    <button class="card-btn-move" onclick="handleDashboardDecision('${applicant.id}', 'accept')">
                        Approve
                        <i data-lucide="check-circle-2"></i>
                    </button>
                `}
            </div>
        `
        : '';

    return `
        <div class="candidate-card" onclick="openDashboardDrawer('${applicant.id}')">
            <div class="card-top">
                <div class="card-avatar-section">
                    <div class="card-avatar">${moEscapeHtml(applicant.avatar)}</div>
                    <div>
                        <div class="card-name">${moEscapeHtml(applicant.name)}</div>
                        <div class="card-id">${moEscapeHtml(applicant.studentId)}</div>
                    </div>
                </div>
                <div class="card-ai-score">
                    <span class="card-ai-label">GPA</span>
                    <span class="card-ai-value">${moEscapeHtml(applicant.gpa)}</span>
                </div>
            </div>
            <div class="card-module-row">
                <span class="card-module-badge">${moEscapeHtml(applicant.moduleCode)}</span>
                <span class="card-gpa">${moEscapeHtml(moFormatDate(applicant.appliedAt))}</span>
            </div>
            <div class="card-tags">
                <span class="card-tag matched">
                    <i data-lucide="book-open"></i>
                    ${moEscapeHtml(applicant.moduleName)}
                </span>
            </div>
            ${reviewNote}
            ${actionButtons}
        </div>
    `;
}

function calculateDashboardFit(student, job) {
    const gpa = Number(student.gpa || 0);
    const skills = Array.isArray(student.skills) ? student.skills.map((item) => String(item).toLowerCase()) : [];
    const requirements = [
        ...(Array.isArray(job.requiredSkills) ? job.requiredSkills : []),
        ...(Array.isArray(job.requirements) ? job.requirements : [])
    ].map((item) => String(item).toLowerCase());
    const resume = student.resume || {};
    const hasResume = Boolean(
        student.resumePdfName ||
        student.resumePdfUploadedAt ||
        resume.education?.length ||
        resume.experience?.length ||
        resume.awards?.length
    );
    const matchedSkills = requirements.filter((req) => skills.some((skill) => req.includes(skill) || skill.includes(req)));
    let score = 20;
    if (gpa >= 3.7) score += 25;
    else if (gpa >= 3.5) score += 18;
    else if (gpa > 0) score += 8;
    if (hasResume) score += 25;
    if (matchedSkills.length) score += Math.min(25, matchedSkills.length * 8);
    if (student.major) score += 10;
    if (student.phone || student.bio) score += 5;
    score = Math.min(100, score);
    return {
        score,
        label: score >= 80 ? 'Strong Fit' : score >= 60 ? 'Good Fit' : score >= 40 ? 'Needs Review' : 'Weak Evidence',
        hasResume,
        matchedSkills
    };
}

function getDashboardJobFill(job) {
    const slots = Number(job.positions || job.slots || 0);
    const approved = dashboardState.applicants.filter((item) =>
        item.job?.id === job.id && item.status === 'approved'
    ).length;
    return { approved, slots, full: slots > 0 && approved >= slots };
}

async function openDashboardDrawer(applicationId) {
    dashboardState.selectedApplicantId = applicationId;

    try {
        const detail = await request(`/mo/applicants/${applicationId}`);
        const application = detail.application || {};
        const student = detail.student || {};
        const job = detail.job || {};
        const reviewComment = application.reviewComment || application.reviewNote || 'No review comment yet';
        const timeline = Array.isArray(application.timeline) ? application.timeline : [];
        const fit = calculateDashboardFit(student, job);
        const fill = getDashboardJobFill(job);

        document.getElementById('drawerHeaderContent').innerHTML = `
            <div style="display:flex;align-items:center;gap:16px;">
                <div class="card-avatar" style="width:48px;height:48px;font-size:16px;">${moEscapeHtml(moInitials(student.name))}</div>
                <div>
                    <div style="font-size:18px;font-weight:600;margin-bottom:4px;">${moEscapeHtml(student.name || 'Unknown Student')}</div>
                    <div style="font-size:14px;opacity:0.8;">${moEscapeHtml(student.studentId || '-')} · ${moEscapeHtml(student.email || '-')}</div>
                </div>
            </div>
        `;

        document.getElementById('drawerBody').innerHTML = `
            <div style="display:flex;flex-direction:column;gap:20px;">
                <div>
                    <h3 style="font-size:14px;color:#64748B;margin-bottom:10px;">Application Overview</h3>
                    <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;">
                        <div style="background:#F8FAFC;border-radius:12px;padding:14px;">
                            <div style="font-size:12px;color:#64748B;">Module</div>
                            <div style="font-size:14px;font-weight:600;color:#17312f;">${moEscapeHtml(job.moduleCode || '-')}</div>
                            <div style="font-size:13px;color:#5e7a74;">${moEscapeHtml(job.moduleName || job.title || 'Untitled job')}</div>
                        </div>
                        <div style="background:#F8FAFC;border-radius:12px;padding:14px;">
                            <div style="font-size:12px;color:#64748B;">Status</div>
                            <div style="font-size:14px;font-weight:600;color:#17312f;">${moEscapeHtml(moStatusLabel(application.status))}</div>
                            <div style="font-size:13px;color:#5e7a74;">Applied ${moEscapeHtml(moFormatDateTime(application.appliedAt))}</div>
                        </div>
                        <div style="background:#F8FAFC;border-radius:12px;padding:14px;">
                            <div style="font-size:12px;color:#64748B;">Capacity</div>
                            <div style="font-size:14px;font-weight:600;color:${fill.full ? '#b91c1c' : '#17312f'};">${moEscapeHtml(fill.approved)} approved${fill.slots ? ` / ${moEscapeHtml(fill.slots)}` : ''}</div>
                            <div style="font-size:13px;color:#5e7a74;">${fill.full ? 'Position full' : 'Slots available'}</div>
                        </div>
                        <div style="background:#F8FAFC;border-radius:12px;padding:14px;">
                            <div style="font-size:12px;color:#64748B;">Major</div>
                            <div style="font-size:14px;font-weight:600;color:#17312f;">${moEscapeHtml(student.major || 'Not provided')}</div>
                        </div>
                        <div style="background:#F8FAFC;border-radius:12px;padding:14px;">
                            <div style="font-size:12px;color:#64748B;">GPA</div>
                            <div style="font-size:14px;font-weight:600;color:#17312f;">${moEscapeHtml(student.gpa ?? 'N/A')}</div>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 style="font-size:14px;color:#64748B;margin-bottom:10px;">Skills</h3>
                    <div style="display:flex;flex-wrap:wrap;gap:8px;">
                        ${(Array.isArray(student.skills) && student.skills.length ? student.skills : ['No skills recorded']).map((skill) => `
                            <span style="padding:6px 12px;background:#d7f2ee;color:#0f766e;border-radius:999px;font-size:12px;">${moEscapeHtml(skill)}</span>
                        `).join('')}
                    </div>
                </div>
                <div>
                    <h3 style="font-size:14px;color:#64748B;margin-bottom:10px;">Fit Summary</h3>
                    <div style="background:#F8FAFC;border-radius:12px;padding:14px;font-size:13px;color:#334155;line-height:1.7;">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                            <span>${moEscapeHtml(fit.label)}</span>
                            <strong style="font-size:20px;color:#0f766e;">${moEscapeHtml(fit.score)}%</strong>
                        </div>
                        <div style="height:8px;background:#e2e8f0;border-radius:999px;overflow:hidden;margin-bottom:8px;">
                            <div style="height:100%;width:${fit.score}%;background:#0f766e;"></div>
                        </div>
                        <div>Resume: ${fit.hasResume ? 'ready' : 'missing'} · Skill signals: ${fit.matchedSkills.length}</div>
                    </div>
                </div>
                <div>
                    <h3 style="font-size:14px;color:#64748B;margin-bottom:10px;">Resume Snapshot</h3>
                    <div style="background:#F8FAFC;border-radius:12px;padding:14px;font-size:13px;color:#334155;line-height:1.7;">
                        <div>PDF Resume: ${moEscapeHtml(student.resumePdfName || 'Not uploaded')}</div>
                        <div>PDF Uploaded: ${moEscapeHtml(student.resumePdfUploadedAt ? moFormatDateTime(student.resumePdfUploadedAt) : 'N/A')}</div>
                        <div>Education entries: ${moEscapeHtml(student.resume?.education?.length || 0)}</div>
                        <div>Experience entries: ${moEscapeHtml(student.resume?.experience?.length || 0)}</div>
                        <div>Awards: ${moEscapeHtml(student.resume?.awards?.length || 0)}</div>
                    </div>
                </div>
                <div>
                    <h3 style="font-size:14px;color:#64748B;margin-bottom:10px;">Review Comment</h3>
                    <div style="background:#F8FAFC;border-radius:12px;padding:14px;font-size:13px;color:#334155;">${moEscapeHtml(reviewComment)}</div>
                </div>
                <div>
                    <h3 style="font-size:14px;color:#64748B;margin-bottom:10px;">Application Timeline</h3>
                    <div style="display:flex;flex-direction:column;gap:10px;">
                        ${timeline.length ? timeline.map((item) => `
                            <div style="background:#F8FAFC;border-radius:12px;padding:12px;">
                                <div style="font-size:13px;font-weight:600;color:#17312f;">${moEscapeHtml(moStatusLabel(item.status))}</div>
                                <div style="font-size:12px;color:#5e7a74;margin:4px 0;">${moEscapeHtml(moFormatDateTime(item.time))}</div>
                                <div style="font-size:13px;color:#334155;">${moEscapeHtml(item.note || 'No note')}</div>
                            </div>
                        `).join('') : '<div style="font-size:13px;color:#5e7a74;">No timeline available.</div>'}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('drawerFooter').innerHTML = application.status === 'pending'
            ? `
                <button class="drawer-btn drawer-btn-reject" onclick="handleDashboardDecision('${application.id}', 'reject', true)">
                    <i data-lucide="x"></i>
                    Reject
                </button>
                ${fill.full ? `
                    <button class="drawer-btn drawer-btn-move" disabled title="This job has reached its approved capacity." style="opacity:.55;cursor:not-allowed;">
                        <i data-lucide="circle-alert"></i>
                        Capacity Full
                    </button>
                ` : `
                    <button class="drawer-btn drawer-btn-move" onclick="handleDashboardDecision('${application.id}', 'accept', true)">
                        <i data-lucide="check-circle-2"></i>
                        Approve
                    </button>
                `}
            `
            : `
                <button class="drawer-btn drawer-btn-move" onclick="closeDrawer()">
                    <i data-lucide="arrow-left"></i>
                    Close
                </button>
            `;

        document.getElementById('drawerOverlay').classList.add('open');
        document.getElementById('drawer').classList.add('open');
        lucide.createIcons();
    } catch (error) {
        alert(error.message || 'Failed to load application detail.');
    }
}

async function handleDashboardDecision(applicationId, action, closeAfter = false) {
    const comment = window.prompt(
        action === 'accept' ? 'Optional approval note:' : 'Optional rejection note:',
        ''
    );

    if (comment === null) {
        return;
    }

    try {
        await API.mo.updateApplicationStatus(applicationId, {
            action,
            comment
        });
        await loadDashboardData();
        if (closeAfter) {
            closeDrawer();
        }
    } catch (error) {
        alert(error.message || 'Failed to update application.');
    }
}

function closeDrawer() {
    document.getElementById('drawerOverlay').classList.remove('open');
    document.getElementById('drawer').classList.remove('open');
    dashboardState.selectedApplicantId = null;
}
