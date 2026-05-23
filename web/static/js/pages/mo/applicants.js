let applicantsState = {
    currentUser: null,
    allApplicants: [],
    filteredApplicants: [],
    currentSort: 'date'
};

document.addEventListener('DOMContentLoaded', async () => {
    applicantsState.currentUser = await ensureMOAuth();
    if (!applicantsState.currentUser) {
        return;
    }

    setupApplicantsEvents();
    await loadApplicantsData();
});

function setupApplicantsEvents() {
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');

    searchInput.addEventListener('input', () => {
        clearSearch.classList.toggle('visible', searchInput.value.length > 0);
        filterApplicants();
    });

    clearSearch.addEventListener('click', () => {
        searchInput.value = '';
        clearSearch.classList.remove('visible');
        filterApplicants();
    });

    document.getElementById('stageFilter').addEventListener('change', filterApplicants);
    document.getElementById('moduleFilter').addEventListener('change', filterApplicants);
    document.getElementById('matchFilter').addEventListener('change', filterApplicants);
    document.getElementById('refreshBtn').addEventListener('click', loadApplicantsData);
    document.getElementById('exportBtn').addEventListener('click', exportApplicantsCsv);

    document.querySelectorAll('.sort-btn').forEach((button) => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.sort-btn').forEach((item) => item.classList.remove('active', 'purple'));
            button.classList.add('active', 'purple');
            applicantsState.currentSort = button.dataset.sort;
            filterApplicants();
        });
    });

    document.getElementById('drawerClose').addEventListener('click', closeDrawer);
    document.getElementById('drawerOverlay').addEventListener('click', closeDrawer);
}

async function loadApplicantsData() {
    try {
        const applicants = await API.mo.getApplicants();
        applicantsState.allApplicants = (applicants || []).map(normalizeApplicantRow);
        populateApplicantsModuleFilter();
        applyApplicantQueryDefaults();
        filterApplicants();
    } catch (error) {
        console.error('Failed to load applicants:', error);
        document.getElementById('applicantsTableBody').innerHTML = `
            <tr><td colspan="6" class="empty-state">${moEscapeHtml(error.message || 'Failed to load applicants.')}</td></tr>
        `;
    }
}

function normalizeApplicantRow(item) {
    const application = item.application || {};
    const student = item.student || {};
    const job = item.job || {};
    return {
        id: application.id,
        application,
        student,
        job,
        name: student.name || 'Unknown Student',
        studentId: student.studentId || student.id || '-',
        email: student.email || '-',
        avatar: moInitials(student.name),
        gpa: Number(student.gpa ?? 0),
        major: student.major || 'Not provided',
        moduleCode: job.moduleCode || '-',
        moduleName: job.moduleName || job.title || 'Untitled job',
        status: application.status || 'pending',
        appliedAt: application.appliedAt
    };
}

function populateApplicantsModuleFilter() {
    const moduleFilter = document.getElementById('moduleFilter');
    const modules = [...new Set(applicantsState.allApplicants.map((item) => item.moduleCode))].filter(Boolean);
    moduleFilter.innerHTML = '<option value="all">All Modules</option>' + modules.map((code) => `
        <option value="${moEscapeHtml(code)}">${moEscapeHtml(code)}</option>
    `).join('');
}

function applyApplicantQueryDefaults() {
    const params = new URLSearchParams(window.location.search);
    const moduleCode = params.get('module');
    if (moduleCode) {
        document.getElementById('moduleFilter').value = moduleCode;
    }
}

function filterApplicants() {
    const search = document.getElementById('searchInput').value.trim().toLowerCase();
    const statusFilter = document.getElementById('stageFilter').value;
    const moduleFilter = document.getElementById('moduleFilter').value;
    const gpaFilter = document.getElementById('matchFilter').value;

    let result = [...applicantsState.allApplicants];

    if (search) {
        result = result.filter((item) =>
            item.name.toLowerCase().includes(search)
            || item.studentId.toLowerCase().includes(search)
            || item.email.toLowerCase().includes(search)
        );
    }

    if (statusFilter !== 'all') {
        result = result.filter((item) => item.status === statusFilter);
    }

    if (moduleFilter !== 'all') {
        result = result.filter((item) => item.moduleCode === moduleFilter);
    }

    if (gpaFilter === 'high') {
        result = result.filter((item) => item.gpa >= 3.5);
    } else if (gpaFilter === 'low') {
        result = result.filter((item) => item.gpa > 0 && item.gpa < 3.5);
    }

    result.sort((left, right) => {
        if (applicantsState.currentSort === 'gpa') {
            return right.gpa - left.gpa;
        }
        if (applicantsState.currentSort === 'name') {
            return left.name.localeCompare(right.name);
        }
        return new Date(right.appliedAt || 0) - new Date(left.appliedAt || 0);
    });

    applicantsState.filteredApplicants = result;
    renderApplicantsTable();
}

function renderApplicantsTable() {
    const tbody = document.getElementById('applicantsTableBody');
    document.getElementById('candidateCount').textContent = applicantsState.filteredApplicants.length;

    if (!applicantsState.filteredApplicants.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <p>No candidates match the selected filters.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = applicantsState.filteredApplicants.map((candidate) => `
        <tr data-id="${candidate.id}">
            <td>
                <div class="candidate-cell">
                    <div class="candidate-avatar">${moEscapeHtml(candidate.avatar)}</div>
                    <div>
                        <div class="candidate-name">${moEscapeHtml(candidate.name)}</div>
                        <div class="candidate-id">${moEscapeHtml(candidate.studentId)}</div>
                    </div>
                </div>
            </td>
            <td><span class="module-badge">${moEscapeHtml(candidate.moduleCode)}</span></td>
            <td>${candidate.gpa ? moEscapeHtml(candidate.gpa.toFixed(2)) : 'N/A'}</td>
            <td><span class="stage-badge ${moEscapeHtml(candidate.status)}">${moEscapeHtml(moStatusLabel(candidate.status))}</span></td>
            <td><span class="applied-date">${moEscapeHtml(moFormatDate(candidate.appliedAt))}</span></td>
            <td><span class="view-details">View Details</span></td>
        </tr>
    `).join('');

    tbody.querySelectorAll('tr[data-id]').forEach((row) => {
        row.addEventListener('click', () => openApplicantDrawer(row.dataset.id));
    });
}

function calculateCandidateFit(student, job) {
    const gpa = Number(student.gpa || 0);
    const skills = Array.isArray(student.skills) ? student.skills.map((item) => String(item).toLowerCase()) : [];
    const requirements = [
        ...(Array.isArray(job.requiredSkills) ? job.requiredSkills : []),
        ...(Array.isArray(job.requirements) ? job.requirements : [])
    ].map((item) => String(item).toLowerCase());
    const resume = student.resume || {};
    const hasPdf = Boolean(student.resumePdfName || student.resumePdfUploadedAt);
    const hasStandardResume = Boolean(
        resume.education?.length ||
        resume.experience?.length ||
        resume.awards?.length
    );
    const matchedSkills = requirements.filter((req) => skills.some((skill) => req.includes(skill) || skill.includes(req)));
    let score = 20;
    if (gpa >= 3.7) score += 25;
    else if (gpa >= 3.5) score += 18;
    else if (gpa > 0) score += 8;
    if (hasPdf || hasStandardResume) score += 25;
    if (matchedSkills.length) score += Math.min(25, matchedSkills.length * 8);
    if (student.major) score += 10;
    if (student.phone || student.bio) score += 5;
    score = Math.min(100, score);
    return {
        score,
        label: score >= 80 ? 'Strong Fit' : score >= 60 ? 'Good Fit' : score >= 40 ? 'Needs Review' : 'Weak Evidence',
        resumeReady: hasPdf || hasStandardResume,
        matchedSkills
    };
}

function getApplicantJobFill(job) {
    const slots = Number(job.positions || job.slots || 0);
    const approved = applicantsState.allApplicants.filter((item) =>
        item.application?.jobId === job.id && item.application?.status === 'approved'
    ).length;
    return { approved, slots, full: slots > 0 && approved >= slots };
}

async function openApplicantDrawer(applicationId) {
    try {
        const detail = await request(`/mo/applicants/${applicationId}`);
        const application = detail.application || {};
        const student = detail.student || {};
        const job = detail.job || {};
        const fit = calculateCandidateFit(student, job);
        const fill = getApplicantJobFill(job);

        document.getElementById('drawerHeaderContent').innerHTML = `
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:12px;">
                <div style="width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,#0f766e,#14b8a6);display:flex;align-items:center;justify-content:center;color:white;font-size:20px;font-weight:700;">
                    ${moEscapeHtml(moInitials(student.name))}
                </div>
                <div>
                    <h2 style="font-size:22px;margin-bottom:4px;">${moEscapeHtml(student.name || 'Unknown Student')}</h2>
                    <p style="font-size:13px;opacity:0.8;">${moEscapeHtml(student.studentId || '-')} | ${moEscapeHtml(student.email || '-')}</p>
                </div>
            </div>
            <div style="display:flex;gap:12px;">
                <div style="flex:1;background:rgba(255,255,255,0.1);padding:10px;border-radius:10px;text-align:center;">
                    <div style="font-size:11px;opacity:0.7;margin-bottom:4px;">GPA</div>
                    <div style="font-size:18px;font-weight:700;">${moEscapeHtml(student.gpa ?? 'N/A')}</div>
                </div>
                <div style="flex:1;background:rgba(255,255,255,0.1);padding:10px;border-radius:10px;text-align:center;">
                    <div style="font-size:11px;opacity:0.7;margin-bottom:4px;">Module</div>
                    <div style="font-size:13px;font-weight:700;">${moEscapeHtml(job.moduleCode || '-')}</div>
                </div>
                <div style="flex:1;background:rgba(255,255,255,0.1);padding:10px;border-radius:10px;text-align:center;">
                    <div style="font-size:11px;opacity:0.7;margin-bottom:4px;">Status</div>
                    <div style="font-size:13px;font-weight:600;">${moEscapeHtml(moStatusLabel(application.status))}</div>
                </div>
            </div>
        `;

        document.getElementById('drawerBody').innerHTML = `
            <div style="display:flex;flex-direction:column;gap:20px;">
                <div>
                    <h3 style="font-size:14px;font-weight:600;color:#64748B;margin-bottom:12px;">Application Summary</h3>
                    <div style="background:#F8FAFC;border-radius:12px;padding:16px;">
                        <div style="font-size:13px;color:#475569;line-height:1.6;">Applied for ${moEscapeHtml(job.title || 'this job')} on ${moEscapeHtml(moFormatDateTime(application.appliedAt))}.</div>
                        <div style="font-size:13px;color:#475569;line-height:1.6;margin-top:8px;">Review comment: ${moEscapeHtml(application.reviewComment || application.reviewNote || 'No review comment yet')}</div>
                        <div style="font-size:13px;color:${fill.full ? '#b91c1c' : '#0f766e'};line-height:1.6;margin-top:8px;">Capacity: ${moEscapeHtml(fill.approved)} approved${fill.slots ? ` / ${moEscapeHtml(fill.slots)} slots` : ''}${fill.full ? ' - full' : ''}</div>
                    </div>
                </div>
                <div>
                    <h3 style="font-size:14px;font-weight:600;color:#64748B;margin-bottom:12px;">Fit Summary</h3>
                    <div style="background:#F8FAFC;border-radius:12px;padding:16px;">
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px;">
                            <div style="font-size:13px;color:#475569;">Rule-based candidate fit</div>
                            <div style="font-size:20px;font-weight:700;color:#0f766e;">${moEscapeHtml(fit.score)}%</div>
                        </div>
                        <div style="height:8px;background:#e2e8f0;border-radius:999px;overflow:hidden;margin-bottom:10px;">
                            <div style="height:100%;width:${fit.score}%;background:#0f766e;"></div>
                        </div>
                        <div style="font-size:13px;color:#334155;">${moEscapeHtml(fit.label)} - Resume ${fit.resumeReady ? 'ready' : 'missing'} - ${fit.matchedSkills.length ? `${fit.matchedSkills.length} skill signal(s)` : 'no direct skill match recorded'}</div>
                    </div>
                </div>
                <div>
                    <h3 style="font-size:14px;font-weight:600;color:#64748B;margin-bottom:12px;">Student Profile</h3>
                    <div style="background:#F8FAFC;border-radius:12px;padding:16px;">
                        <div style="font-size:13px;color:#334155;margin-bottom:6px;">Major: ${moEscapeHtml(student.major || 'Not provided')}</div>
                        <div style="font-size:13px;color:#334155;margin-bottom:6px;">Phone: ${moEscapeHtml(student.phone || 'Not provided')}</div>
                        <div style="font-size:13px;color:#334155;">Skills: ${moEscapeHtml((student.skills || []).join(', ') || 'No skills recorded')}</div>
                    </div>
                </div>
                <div>
                    <h3 style="font-size:14px;font-weight:600;color:#64748B;margin-bottom:12px;">Resume Snapshot</h3>
                    <div style="background:#F8FAFC;border-radius:12px;padding:16px;">
                        <div style="font-size:13px;color:#334155;">PDF Resume: ${moEscapeHtml(student.resumePdfName || 'Not uploaded')}</div>
                        <div style="font-size:13px;color:#334155;margin-top:6px;">PDF Uploaded: ${moEscapeHtml(student.resumePdfUploadedAt ? moFormatDateTime(student.resumePdfUploadedAt) : 'N/A')}</div>
                        <div style="font-size:13px;color:#334155;margin-top:6px;">Education entries: ${moEscapeHtml(student.resume?.education?.length || 0)}</div>
                        <div style="font-size:13px;color:#334155;margin-top:6px;">Experience entries: ${moEscapeHtml(student.resume?.experience?.length || 0)}</div>
                        <div style="font-size:13px;color:#334155;margin-top:6px;">Awards: ${moEscapeHtml(student.resume?.awards?.length || 0)}</div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('drawerFooter').innerHTML = application.status === 'pending'
            ? `
                <button class="drawer-btn drawer-btn-reject" onclick="reviewApplicant('${application.id}', 'reject')">
                    ${moIcon('x-circle')}
                    <span>Reject</span>
                </button>
                ${fill.full ? `
                    <button class="drawer-btn drawer-btn-move" disabled title="This job has reached its approved capacity." style="opacity:.55;cursor:not-allowed;">
                        ${moIcon('circle-alert')}
                        <span>Capacity Full</span>
                    </button>
                ` : `
                    <button class="drawer-btn drawer-btn-move" onclick="reviewApplicant('${application.id}', 'accept')">
                        ${moIcon('check-circle-2')}
                        <span>Approve</span>
                    </button>
                `}
            `
            : `
                <button class="drawer-btn drawer-btn-move" onclick="closeDrawer()">
                    <span>Close</span>
                </button>
            `;

        document.getElementById('candidateDrawer').classList.add('open');
        document.getElementById('drawerOverlay').classList.add('open');
        if (window.lucide) {
            lucide.createIcons();
        }
    } catch (error) {
        alert(error.message || 'Failed to load applicant detail.');
    }
}

async function reviewApplicant(applicationId, action) {
    const comment = window.prompt(action === 'accept' ? 'Optional approval note:' : 'Optional rejection note:', '');
    if (comment === null) {
        return;
    }

    try {
        await API.mo.updateApplicationStatus(applicationId, { action, comment });
        closeDrawer();
        await loadApplicantsData();
    } catch (error) {
        alert(error.message || 'Failed to update applicant status.');
    }
}

function closeDrawer() {
    document.getElementById('candidateDrawer').classList.remove('open');
    document.getElementById('drawerOverlay').classList.remove('open');
}

function exportApplicantsCsv() {
    const rows = [
        ['Name', 'Student ID', 'Email', 'Module', 'GPA', 'Status', 'Applied At'],
        ...applicantsState.filteredApplicants.map((item) => [
            item.name,
            item.studentId,
            item.email,
            item.moduleCode,
            item.gpa || '',
            item.status,
            item.appliedAt || ''
        ])
    ];

    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'mo-applicants.csv';
    link.click();
    URL.revokeObjectURL(link.href);
}
