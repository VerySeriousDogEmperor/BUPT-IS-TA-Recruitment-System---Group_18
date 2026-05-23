let postJobState = {
    currentUser: null,
    modules: [],
    jobs: [],
    activeTab: 'all',
    editingJobId: null
};
const postJobActions = new Set();

document.addEventListener('DOMContentLoaded', async () => {
    postJobState.currentUser = await ensureMOAuth();
    if (!postJobState.currentUser) {
        return;
    }

    setupPostJobEvents();
    await loadPostJobData();
});

function setupPostJobEvents() {
    document.querySelectorAll('.tab-btn').forEach((button) => {
        button.addEventListener('click', () => switchPostJobTab(button.dataset.tab));
    });

    document.getElementById('btnNewPosting').addEventListener('click', () => {
        postJobState.editingJobId = null;
        resetPostJobForm();
        openPostJobDrawer();
    });

    document.getElementById('btnCloseDrawer').addEventListener('click', closePostJobDrawer);
    document.getElementById('drawerOverlay').addEventListener('click', closePostJobDrawer);
    document.getElementById('btnCancel').addEventListener('click', closePostJobDrawer);

    document.getElementById('btnPositionsDown').addEventListener('click', () => changeCounter('positionsValue', -1, 1));
    document.getElementById('btnPositionsUp').addEventListener('click', () => changeCounter('positionsValue', 1, 1));
    document.getElementById('btnHoursDown').addEventListener('click', () => changeCounter('hoursValue', -1, 1, 'h'));
    document.getElementById('btnHoursUp').addEventListener('click', () => changeCounter('hoursValue', 1, 1, 'h'));

    const saveDraftButton = document.getElementById('btnSaveDraft');
    const submitButton = document.getElementById('btnSubmitForm');
    saveDraftButton.addEventListener('click', () => savePostJob(false, saveDraftButton));
    submitButton.addEventListener('click', () => savePostJob(true, submitButton));
    document.getElementById('toastClose').addEventListener('click', () => {
        document.getElementById('toast').style.display = 'none';
    });
}

async function loadPostJobData() {
    try {
        const [modules, jobs] = await Promise.all([
            API.mo.getModules(),
            API.mo.getJobs()
        ]);

        postJobState.modules = modules || [];
        postJobState.jobs = jobs || [];

        populatePostJobModules();
        renderPostJobStats();
        renderPostings();
        updatePostJobCounts();

        const params = new URLSearchParams(window.location.search);
        const jobId = params.get('jobId');
        const moduleCode = params.get('module');

        if (jobId) {
            await openExistingJob(jobId);
        } else if (moduleCode) {
            resetPostJobForm(moduleCode);
            openPostJobDrawer();
        }
    } catch (error) {
        console.error('Failed to load post-job page:', error);
        document.getElementById('postingsList').innerHTML = `<div class="empty-state">${moEscapeHtml(error.message || 'Failed to load job posts.')}</div>`;
    }
}

function populatePostJobModules() {
    const select = document.getElementById('selectModule');
    select.innerHTML = '<option value="">Select a module...</option>' + postJobState.modules.map((module) => {
        const code = module.code || module.moduleCode || module.id;
        const name = module.name || module.moduleName || 'Untitled module';
        return `<option value="${moEscapeHtml(code)}">${moEscapeHtml(code)} - ${moEscapeHtml(name)}</option>`;
    }).join('');
}

function renderPostJobStats() {
    const statsGrid = document.getElementById('statsGrid');
    const stats = [
        { label: 'Total Posts', value: postJobState.jobs.length, icon: 'briefcase-business' },
        { label: 'Drafts', value: postJobState.jobs.filter((job) => job.status === 'draft').length, icon: 'file-text' },
        { label: 'Admin Review', value: postJobState.jobs.filter((job) => job.status === 'pending').length, icon: 'clock-3' },
        { label: 'Published', value: postJobState.jobs.filter((job) => job.status === 'published').length, icon: 'badge-check' },
        { label: 'Closed', value: postJobState.jobs.filter((job) => job.status === 'closed').length, icon: 'archive' }
    ];

    statsGrid.innerHTML = stats.map((stat) => `
        <div class="stat-card">
            <div class="stat-icon">${moIcon(stat.icon)}</div>
            <div>
                <div class="stat-value">${moEscapeHtml(stat.value)}</div>
                <div class="stat-label">${moEscapeHtml(stat.label)}</div>
            </div>
        </div>
    `).join('');

    if (window.lucide) {
        lucide.createIcons();
    }
}

function getFilteredPostings() {
    if (postJobState.activeTab === 'all') {
        return [...postJobState.jobs];
    }
    return postJobState.jobs.filter((job) => job.status === postJobState.activeTab);
}

function renderPostings() {
    const container = document.getElementById('postingsList');
    const jobs = getFilteredPostings();

    if (!jobs.length) {
        container.innerHTML = '<div class="empty-state">No job posts in this category.</div>';
        if (window.lucide) {
            lucide.createIcons();
        }
        return;
    }

    container.innerHTML = jobs.map((job) => `
        <div class="posting-card">
            <div class="posting-header">
                <div class="posting-main">
                    <div class="posting-icon">${moIcon('briefcase-business')}</div>
                    <div class="posting-content">
                        <div class="posting-badges">
                            <span class="posting-badge code">${moEscapeHtml(job.moduleCode || '-')}</span>
                            <span class="posting-status ${moEscapeHtml(job.status || 'draft')}">${moEscapeHtml(getPostingStatusLabel(job))}</span>
                        </div>
                        <div class="posting-title">${moEscapeHtml(job.title || 'Untitled job')}</div>
                        <div class="posting-meta">${moEscapeHtml(job.moduleName || 'Unknown module')} · ${moEscapeHtml(job.positions || job.slots || 0)} positions · ${moEscapeHtml(moFormatHours(job.hoursPerWeek || 0))}/week</div>
                    </div>
                    <div class="posting-right">
                        <div class="deadline-info ${job.status === 'draft' ? 'normal' : 'urgent'}">
                            ${moIcon('calendar-range')}
                            <span>${moEscapeHtml(getJobDeadline(job) ? `Apply by ${moFormatDate(getJobDeadline(job))}` : 'Deadline not set')}</span>
                        </div>
                    </div>
                </div>
                <div class="posting-dates">
                    <span>Created ${moEscapeHtml(moFormatDate(job.createdAt))}</span>
                    <span>Updated ${moEscapeHtml(moFormatDate(job.updatedAt || job.createdAt))}</span>
                    <button class="btn-details" onclick="${getPostingDetailAction(job)}">
                        ${moIcon(getPostingDetailIcon(job))}
                        <span class="details-text">${moEscapeHtml(getPostingDetailLabel(job))}</span>
                        <i class="chevron" data-lucide="chevron-right"></i>
                    </button>
                </div>
            </div>

            <div class="posting-expanded visible">
                <div class="posting-description">
                    <div class="posting-description-label">Job Description</div>
                    <div class="posting-description-text">${moEscapeHtml(job.description || 'No description yet.')}</div>
                </div>
                <div class="posting-requirements">
                    <div class="posting-requirements-label">Requirements</div>
                    <div class="requirements-list">
                        ${(job.requirements?.length ? job.requirements : ['No requirements set']).map((req) => `
                            <span class="requirement-tag">${moEscapeHtml(req)}</span>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div class="posting-footer">
                ${job.status === 'draft' ? `
                        <button class="btn-edit" onclick="editJobPosting('${job.id}')">
                        ${moIcon('square-pen')}
                        <span>Edit Draft</span>
                    </button>
                    <button class="btn-submit" onclick="publishDraftJob('${job.id}', this)">
                        ${moIcon('send')}
                        <span>Submit for Review</span>
                    </button>
                ` : `
                    <div class="posting-status-text published">
                        ${moIcon(getPostingStatusIcon(job))}
                        <span>${moEscapeHtml(getPostingStatusText(job))}</span>
                    </div>
                    ${job.status === 'published' ? `
                        <button class="btn-view-applicants" onclick="closePublishedJob('${job.id}', this)">
                            ${moIcon('archive')}
                            <span>Close Posting</span>
                        </button>
                    ` : ''}
                    ${job.status === 'pending' ? '' : `
                        <button class="btn-view-applicants" onclick="window.location.href='/mo/applicants.html?module=${encodeURIComponent(job.moduleCode || '')}'">
                            ${moIcon('users')}
                            <span>View Applicants</span>
                        </button>
                    `}
                `}
            </div>
        </div>
    `).join('');

    if (window.lucide) {
        lucide.createIcons();
    }
}

function updatePostJobCounts() {
    document.getElementById('draftCount').textContent = postJobState.jobs.filter((job) => job.status === 'draft').length;
    document.getElementById('pendingCount').textContent = postJobState.jobs.length;
    document.getElementById('adminReviewCount').textContent = postJobState.jobs.filter((job) => job.status === 'pending').length;
    document.getElementById('publishedCount').textContent = postJobState.jobs.filter((job) => job.status === 'published').length;
    document.getElementById('closedCount').textContent = postJobState.jobs.filter((job) => job.status === 'closed').length;
}

function getPostingDetailAction(job) {
    if (job.status === 'draft') {
        return `editJobPosting('${job.id}')`;
    }
    if (job.status === 'pending') {
        return `showPostJobToast('This job is waiting for Admin review.')`;
    }
    return `window.location.href='/mo/applicants.html?module=${encodeURIComponent(job.moduleCode || '')}'`;
}

function getPostingDetailIcon(job) {
    if (job.status === 'draft') return 'square-pen';
    if (job.status === 'pending') return 'clock-3';
    return 'users';
}

function getPostingDetailLabel(job) {
    if (job.status === 'draft') return 'Edit Draft';
    if (job.status === 'pending') return 'Awaiting Review';
    return 'View Applicants';
}

function getPostingStatusIcon(job) {
    if (job.status === 'pending') return 'clock-3';
    if (job.status === 'published') return 'badge-check';
    if (job.status === 'closed') return 'archive';
    return 'archive';
}

function getPostingStatusLabel(job) {
    if (job.status === 'pending') return 'Pending Admin Review';
    return moStatusLabel(job.status);
}

function getPostingStatusText(job) {
    if (job.status === 'pending') return 'Waiting for Admin review before students can see it';
    if (job.status === 'published') return 'Visible to students now';
    if (job.status === 'closed') return 'Closed to new applications';
    return 'Recruitment cycle completed';
}

function getJobDeadline(job) {
    return job.applicationDeadline || job.endDate || '';
}

function switchPostJobTab(tab) {
    postJobState.activeTab = tab;
    document.querySelectorAll('.tab-btn').forEach((button) => {
        button.classList.toggle('active', button.dataset.tab === tab);
    });
    renderPostings();
}

function changeCounter(elementId, delta, min, suffix = '') {
    const element = document.getElementById(elementId);
    const current = Number(element.textContent.replace(/[^0-9.]/g, '')) || 0;
    const next = Math.max(min, current + delta);
    element.textContent = `${next}${suffix}`;
}

function openPostJobDrawer() {
    document.getElementById('formDrawer').classList.add('open');
    document.getElementById('drawerOverlay').classList.add('open');
}

function closePostJobDrawer() {
    document.getElementById('formDrawer').classList.remove('open');
    document.getElementById('drawerOverlay').classList.remove('open');
}

function resetPostJobForm(preselectedModule = '') {
    postJobState.editingJobId = null;
    document.getElementById('selectModule').value = preselectedModule;
    document.getElementById('inputRole').value = 'Teaching Assistant';
    document.getElementById('positionsValue').textContent = '1';
    document.getElementById('hoursValue').textContent = '6h';
    document.getElementById('inputDeadline').value = '';
    document.getElementById('inputDescription').value = '';
    document.getElementById('inputRequirements').value = '';
}

async function openExistingJob(jobId) {
    const job = postJobState.jobs.find((item) => item.id === jobId);
    if (!job) {
        return;
    }

    if (job.status !== 'draft') {
        if (job.status === 'pending') {
            switchPostJobTab('pending');
            showPostJobToast('This job is waiting for Admin review.');
            return;
        }
        showPostJobToast('This job is not editable. Opening applicant review.');
        window.location.href = `/mo/applicants.html?module=${encodeURIComponent(job.moduleCode || '')}`;
        return;
    }

    await editJobPosting(jobId);
}

async function editJobPosting(jobId) {
    const job = postJobState.jobs.find((item) => item.id === jobId);
    if (!job) {
        return;
    }

    if (job.status !== 'draft') {
        showPostJobToast('Only draft jobs can be edited.');
        return;
    }

    postJobState.editingJobId = jobId;
    document.getElementById('selectModule').value = job.moduleCode || '';
    document.getElementById('inputRole').value = job.title || 'Teaching Assistant';
    document.getElementById('positionsValue').textContent = String(job.positions || job.slots || 1);
    document.getElementById('hoursValue').textContent = `${Number(job.hoursPerWeek || 6)}h`;
    document.getElementById('inputDeadline').value = moParseDateInput(getJobDeadline(job));
    document.getElementById('inputDescription').value = job.description || '';
    document.getElementById('inputRequirements').value = (job.requirements || []).join('\n');
    openPostJobDrawer();
}

function buildJobPayload() {
    const moduleCode = document.getElementById('selectModule').value;
    const module = postJobState.modules.find((item) => (item.code || item.moduleCode || item.id) === moduleCode);
    const title = document.getElementById('inputRole').value.trim();
    const positions = Number(document.getElementById('positionsValue').textContent.replace(/[^0-9.]/g, '')) || 1;
    const hoursPerWeek = Number(document.getElementById('hoursValue').textContent.replace(/[^0-9.]/g, '')) || 0;
    const deadline = document.getElementById('inputDeadline').value;
    const description = document.getElementById('inputDescription').value.trim();
    const requirements = moParseList(document.getElementById('inputRequirements').value);

    if (!moduleCode || !title || !deadline || !description) {
        throw new Error('Please complete module, role, deadline, and description.');
    }
    if (!isValidPostJobDate(deadline)) {
        throw new Error('Please choose a valid application deadline.');
    }

    const moduleName = module?.name || module?.moduleName || '';

    return {
        moduleId: module?.id || null,
        moduleCode,
        moduleName,
        title,
        description,
        requirements,
        responsibilities: requirements,
        hoursPerWeek,
        positions,
        slots: positions,
        applicationDeadline: deadline,
        duration: `Apply by ${deadline}`,
        type: 'TA',
        department: module?.department || 'International School'
    };
}

function isValidPostJobDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) {
        return false;
    }
    const date = new Date(`${value}T00:00:00`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

async function savePostJob(publishAfterSave, button) {
    const actionKey = publishAfterSave ? 'save-submit' : 'save-draft';
    if (postJobActions.has(actionKey)) {
        return;
    }
    postJobActions.add(actionKey);
    setPostJobButtonBusy(button, true, publishAfterSave ? 'Submitting...' : 'Saving...');
    try {
        const payload = buildJobPayload();
        let savedJob;

        if (postJobState.editingJobId) {
            savedJob = await API.mo.updateJob(postJobState.editingJobId, payload);
        } else {
            savedJob = await API.mo.createJob(payload);
            postJobState.editingJobId = savedJob.id;
        }

        if (publishAfterSave) {
            await API.mo.submitJob(savedJob.id || postJobState.editingJobId);
            showPostJobToast('Job submitted for Admin review.');
        } else {
            showPostJobToast('Draft saved successfully.');
        }

        closePostJobDrawer();
        await loadPostJobData();
        switchPostJobTab(publishAfterSave ? 'pending' : 'draft');
    } catch (error) {
        showPostJobToast(error.message || 'Failed to save job post.', 'error');
    } finally {
        postJobActions.delete(actionKey);
        setPostJobButtonBusy(button, false);
    }
}

async function publishDraftJob(jobId, button) {
    const actionKey = `publish:${jobId}`;
    if (postJobActions.has(actionKey)) {
        return;
    }
    postJobActions.add(actionKey);
    setPostJobButtonBusy(button, true, 'Submitting...');
    try {
        await API.mo.submitJob(jobId);
        showPostJobToast('Draft submitted for Admin review.');
        await loadPostJobData();
        switchPostJobTab('pending');
    } catch (error) {
        showPostJobToast(error.message || 'Failed to publish draft.', 'error');
    } finally {
        postJobActions.delete(actionKey);
        setPostJobButtonBusy(button, false);
    }
}

async function closePublishedJob(jobId, button) {
    if (!window.confirm('Close this published job? Students will no longer be able to apply.')) {
        return;
    }
    const actionKey = `close:${jobId}`;
    if (postJobActions.has(actionKey)) {
        return;
    }
    postJobActions.add(actionKey);
    setPostJobButtonBusy(button, true, 'Closing...');
    try {
        await API.mo.closeJob(jobId);
        showPostJobToast('Job closed to new applications.');
        await loadPostJobData();
        switchPostJobTab('closed');
    } catch (error) {
        showPostJobToast(error.message || 'Failed to close job post.', 'error');
    } finally {
        postJobActions.delete(actionKey);
        setPostJobButtonBusy(button, false);
    }
}

function setPostJobButtonBusy(button, busy, label) {
    if (!button) return;
    if (busy) {
        if (!button.dataset.originalHtml) button.dataset.originalHtml = button.innerHTML;
        button.disabled = true;
        button.textContent = label || 'Working...';
        return;
    }
    if (button.dataset.originalHtml) {
        button.innerHTML = button.dataset.originalHtml;
        delete button.dataset.originalHtml;
    }
    button.disabled = false;
}

function showPostJobToast(message, type = 'success') {
    document.getElementById('toastMessage').textContent = message;
    document.getElementById('toast').style.borderLeft = type === 'error' ? '4px solid #dc2626' : '4px solid #059669';
    document.getElementById('toast').style.display = 'flex';
    setTimeout(() => {
        document.getElementById('toast').style.display = 'none';
    }, 3000);
}
