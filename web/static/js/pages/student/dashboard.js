console.log('Dashboard JS loaded - Version 3.0');

let currentUserProfile = null;
let userApplications = [];
let favoriteJobIds = [];
let favoriteJobs = [];
let scheduleEntries = [];
let studentTimesheets = [];

const statusConfig = {
    pending: { label: 'Under Review', color: 'warning' },
    approved: { label: 'Approved', color: 'success' },
    rejected: { label: 'Not Selected', color: 'danger' },
    withdrawn: { label: 'Withdrawn', color: 'secondary' }
};

const scheduleDayMap = {
    monday: 'Monday',
    mon: 'Monday',
    tuesday: 'Tuesday',
    tue: 'Tuesday',
    tues: 'Tuesday',
    wednesday: 'Wednesday',
    wed: 'Wednesday',
    thursday: 'Thursday',
    thu: 'Thursday',
    thur: 'Thursday',
    thurs: 'Thursday',
    friday: 'Friday',
    fri: 'Friday',
    saturday: 'Saturday',
    sat: 'Saturday',
    sunday: 'Sunday',
    sun: 'Sunday'
};

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position:fixed;top:20px;right:20px;padding:12px 16px;border-radius:10px;color:#fff;
        background:${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#2563eb'};
        box-shadow:0 8px 20px rgba(0,0,0,.15);z-index:9999;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function syncUserToLocalStorage(user) {
    currentUserProfile = user;
    localStorage.setItem('user', JSON.stringify(user));
}

function getFavoriteStorageKey() {
    const user = currentUserProfile || JSON.parse(localStorage.getItem('user') || '{}');
    return user.id ? `student-favorites-${user.id}` : 'student-favorites';
}

function loadFavoriteIds() {
    try {
        const parsed = JSON.parse(localStorage.getItem(getFavoriteStorageKey()) || '[]');
        favoriteJobIds = Array.isArray(parsed) ? [...new Set(parsed)] : [];
    } catch (error) {
        favoriteJobIds = [];
    }
}

function saveFavoriteIds() {
    localStorage.setItem(getFavoriteStorageKey(), JSON.stringify(favoriteJobIds));
}

function flattenSchedule(schedule) {
    if (!schedule) return [];
    return Object.entries(schedule).flatMap(([dayKey, slots]) => {
        const label = scheduleDayMap[dayKey.toLowerCase()];
        if (!label || !Array.isArray(slots)) return [];
        return slots.map((slot) => {
            const value = String(slot || '').trim();
            const firstSpace = value.indexOf(' ');
            const range = firstSpace === -1 ? value : value.slice(0, firstSpace);
            const course = firstSpace === -1 ? 'Class' : value.slice(firstSpace + 1).trim();
            const [startTime = '', endTime = ''] = range.split('-');
            return startTime && endTime ? { day: label, startTime, endTime, course } : null;
        }).filter(Boolean);
    });
}

function buildSchedulePayload(entries) {
    const payload = { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] };
    entries.forEach((entry) => {
        const key = Object.keys(payload).find((item) => scheduleDayMap[item] === entry.day);
        if (key) payload[key].push(`${entry.startTime}-${entry.endTime} ${entry.course}`.trim());
    });
    return payload;
}

function normalizeDay(value) {
    return scheduleDayMap[String(value || '').trim().toLowerCase()] || null;
}

function hasResumeContent(user) {
    const resume = user?.resume;
    const hasEducation = Array.isArray(resume?.education) && resume.education.some((item) => (
        String(item?.major || '').trim() ||
        item?.gpa !== null && item?.gpa !== undefined
    ));
    const hasExperience = Array.isArray(resume?.experience) && resume.experience.some((item) => String(item?.description || '').trim());
    const hasAward = Array.isArray(resume?.awards) && resume.awards.some((item) => (
        String(item?.name || '').trim() ||
        String(item?.description || '').trim()
    ));
    return Boolean(
        user?.resumePdfData ||
        hasEducation ||
        hasExperience ||
        hasAward
    );
}

function hasStandardResume(user) {
    const resume = user?.resume;
    const hasEducation = Array.isArray(resume?.education) && resume.education.some((item) => (
        String(item?.major || '').trim() ||
        item?.gpa !== null && item?.gpa !== undefined
    ));
    const hasExperience = Array.isArray(resume?.experience) && resume.experience.some((item) => String(item?.description || '').trim());
    const hasAward = Array.isArray(resume?.awards) && resume.awards.some((item) => (
        String(item?.name || '').trim() ||
        String(item?.description || '').trim()
    ));
    return Boolean(
        hasEducation ||
        hasExperience ||
        hasAward
    );
}

async function loadProfileFromServer() {
    try {
        const profile = await API.student.getProfile();
        syncUserToLocalStorage(profile);
        loadFavoriteIds();
        scheduleEntries = flattenSchedule(profile.schedule);
        return profile;
    } catch (error) {
        console.error('Failed to load profile:', error);
        return null;
    }
}

function loadUserData() {
    const user = currentUserProfile;
    if (!user) return;

    document.getElementById('userName').textContent = user.name || 'Student';
    document.getElementById('userMeta').textContent = user.major ? `${user.major} · ${user.grade || 'N/A'}` : 'Student';
    document.getElementById('gpaBadge').textContent = `GPA: ${user.gpa ?? 'N/A'}`;
    document.getElementById('idBadge').textContent = `ID: ${user.studentId || user.id || 'N/A'}`;

    const avatarImg = document.getElementById('profileAvatarImg');
    const avatarIcon = document.getElementById('profileAvatarIcon');
    if (user.avatar) {
        avatarImg.src = user.avatar;
        avatarImg.style.display = 'block';
        avatarIcon.style.display = 'none';
    } else {
        avatarImg.style.display = 'none';
        avatarIcon.style.display = 'block';
    }

    const form = document.getElementById('profileForm');
    form.elements.name.value = user.name || '';
    form.elements.email.value = user.email || '';
    form.elements.phone.value = user.phone || '';
    form.elements.studentId.value = user.studentId || '';
    form.elements.major.value = user.major || '';
    form.elements.year.value = user.grade || '';
    form.elements.gpa.value = user.gpa ?? '';
    form.elements.bio.value = user.bio || '';

    populateResumeForm(user);
    renderUploadedResumeInfo(user);
    renderResumeStatus(user);

    if (!user.gpa && user.gpa !== 0) {
        setTimeout(showGPAModal, 300);
    }
}

function populateResumeForm(user) {
    const form = document.getElementById('standardResumeForm');
    const education = user?.resume?.education?.[0] || {};
    const experience = user?.resume?.experience?.[0] || {};
    form.elements.resumeName.value = user?.name || '';
    form.elements.resumeStudentId.value = user?.studentId || '';
    form.elements.resumeEmail.value = user?.email || '';
    form.elements.resumeMajor.value = education.major || user?.major || '';
    form.elements.resumeGpa.value = education.gpa ?? user?.gpa ?? '';
    form.elements.resumeSkills.value = Array.isArray(user?.skills) ? user.skills.join(', ') : '';
    form.elements.resumeExperience.value = experience.description || '';
}

function renderProfileCompletion() {
    const user = currentUserProfile || {};
    const items = document.querySelectorAll('.completion-item .badge');
    const resumeLabel = document.getElementById('resumeCompletionLabel');
    if (items.length < 3) return;
    items[0].className = `badge ${user.name && user.email && user.phone && user.studentId && user.major ? 'badge-success' : 'badge-secondary'}`;
    items[0].textContent = user.name && user.email && user.phone && user.studentId && user.major ? 'Complete' : 'Pending';
    items[1].className = `badge ${hasResumeContent(user) ? 'badge-success' : 'badge-secondary'}`;
    items[1].textContent = hasResumeContent(user) ? (user?.resumePdfData ? 'PDF Saved' : 'Standard Saved') : 'Pending';
    if (resumeLabel) {
        resumeLabel.textContent = user?.resumePdfData ? 'Resume PDF' : 'Resume Ready';
    }
    items[2].className = `badge ${user.gpa || user.gpa === 0 ? 'badge-success' : 'badge-warning'}`;
    items[2].textContent = user.gpa || user.gpa === 0 ? 'Complete' : 'Missing GPA';
}

function renderResumeStatus(user) {
    const storageInfo = document.getElementById('resumeStorageInfo');
    const standardInfo = document.getElementById('standardResumeStatus');
    if (storageInfo) {
        const pdfMessage = user?.resumePdfData
            ? `Your uploaded PDF "${user.resumePdfName || 'Resume.pdf'}" is saved in your profile and can be opened below immediately.`
            : 'No PDF resume uploaded yet. Upload one here and it will appear immediately below.';
        storageInfo.innerHTML = `
            <div>
                <p class="schedule-info-title">Current Resume Status</p>
                <p class="schedule-info-text">${pdfMessage}</p>
            </div>
        `;
    }
    if (standardInfo) {
        const standardMessage = hasStandardResume(user)
            ? 'Your standard resume has been saved to your profile. Use Preview to view the current version.'
            : 'Not generated yet. Fill the form and click Generate Resume to save it.';
        standardInfo.innerHTML = `
            <div>
                <p class="schedule-info-title">Standard Resume</p>
                <p class="schedule-info-text">${standardMessage}</p>
            </div>
        `;
    }
}

async function loadApplications() {
    const result = await API.student.getApplications();
    userApplications = Array.isArray(result?.items) ? result.items : [];
}

async function loadTimesheets() {
    const result = await API.student.getTimesheets();
    studentTimesheets = Array.isArray(result) ? result : [];
}

function renderQuickStats() {
    const items = document.querySelectorAll('.stat-item');
    if (items.length < 3) return;
    const total = userApplications.length;
    const underReview = userApplications.filter((app) => app.status === 'pending').length;
    const approved = userApplications.filter((app) => app.status === 'approved').length;
    items[0].querySelector('.stat-value').textContent = total;
    items[1].querySelector('.stat-value').textContent = underReview;
    items[2].querySelector('.stat-value').textContent = approved;
}

function renderTimeline() {
    const timeline = document.getElementById('applicationTimeline');
    if (!timeline) return;
    if (!userApplications.length) {
        timeline.innerHTML = `<div style="text-align:center;padding:2rem;color:#6b7280;">No applications yet. <a href="/apply.html">Browse Positions</a></div>`;
        return;
    }
    timeline.innerHTML = userApplications.slice(0, 5).map((app) => {
        const config = statusConfig[app.status] || statusConfig.pending;
        const appliedDate = app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-US') : 'Unknown';
        return `
            <div class="timeline-item">
                <div class="timeline-content">
                    <div class="timeline-info">
                        <h4 class="timeline-title">${escapeHtml(app.jobTitle || 'Unknown Position')}</h4>
                        <p class="timeline-dept">${escapeHtml(app.department || 'N/A')}</p>
                        <p class="timeline-date">Applied on ${appliedDate}</p>
                    </div>
                    <span class="badge badge-${config.color}">${config.label}</span>
                </div>
            </div>
        `;
    }).join('');
}

function renderApplicationsList() {
    const list = document.getElementById('applicationsList');
    if (!list) return;
    if (!userApplications.length) {
        list.innerHTML = `<div style="text-align:center;padding:2rem;color:#6b7280;">No applications yet. <a href="/apply.html" class="btn btn-primary" style="margin-top:1rem;">Browse Positions</a></div>`;
        return;
    }
    list.innerHTML = userApplications.map((app) => {
        const config = statusConfig[app.status] || statusConfig.pending;
        const canWithdraw = app.status === 'pending';
        const appliedDate = app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-US') : 'Unknown';
        return `
            <div class="application-card">
                <div class="application-header">
                    <div>
                        <h4 class="application-title">${escapeHtml(app.jobTitle || 'Unknown Position')}</h4>
                        <p class="application-dept">${escapeHtml(app.department || 'N/A')}</p>
                    </div>
                    <span class="badge badge-${config.color}">${config.label}</span>
                </div>
                <p class="application-date">Applied on ${appliedDate}</p>
                ${app.reviewNote ? `<p style="margin:.75rem 0 0;color:#6b7280;">Review note: ${escapeHtml(app.reviewNote)}</p>` : ''}
                <div class="favorite-card-actions" style="margin-top:1rem;">
                    <a href="/job-detail.html?id=${app.jobId}" class="btn btn-outline btn-sm">View Details</a>
                    ${canWithdraw ? `<button class="btn btn-outline btn-sm" onclick="withdrawApplication('${app.id}')">Withdraw</button>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

async function refreshApplicationViews() {
    await loadApplications();
    renderQuickStats();
    renderTimeline();
    renderApplicationsList();
    populateTimesheetJobOptions();
}

async function refreshTimesheetViews() {
    await loadTimesheets();
    renderTimesheetList();
}

window.withdrawApplication = async function withdrawApplication(applicationId) {
    try {
        await API.student.withdrawApplication(applicationId);
        showToast('Application withdrawn successfully', 'success');
        await refreshApplicationViews();
    } catch (error) {
        showToast(error.message || 'Failed to withdraw application', 'error');
    }
};

function initTabs() {
    document.querySelectorAll('.tab-btn').forEach((button) => {
        button.addEventListener('click', () => {
            activateTab(button.dataset.tab);
        });
    });
}

function activateTab(tabName) {
    const button = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    const content = document.getElementById(`tab-${tabName}`);
    if (!button || !content) return;
    document.querySelectorAll('.tab-btn').forEach((item) => item.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    content.classList.add('active');
}

function activateInitialTabFromHash() {
    const tabName = window.location.hash ? window.location.hash.slice(1) : '';
    if (tabName) {
        activateTab(tabName);
    }
}

function populateTimesheetJobOptions() {
    const select = document.getElementById('timesheetJobId');
    if (!select) return;

    const approvedApplications = userApplications.filter((app) => app.status === 'approved');
    if (!approvedApplications.length) {
        select.innerHTML = '<option value="">No approved positions available yet</option>';
        select.disabled = true;
        return;
    }

    select.disabled = false;
    select.innerHTML = '<option value="">Select a position...</option>' + approvedApplications.map((app) => `
        <option value="${app.jobId}">${app.jobTitle || 'Approved Position'}</option>
    `).join('');
}

function renderTimesheetList() {
    const list = document.getElementById('timesheetsList');
    if (!list) return;

    if (!studentTimesheets.length) {
        list.innerHTML = `<div style="text-align:center;padding:2rem;color:#6b7280;">No timesheets submitted yet.</div>`;
        return;
    }

    const statusMap = {
        pending: { label: 'Pending Review', badge: 'badge-warning' },
        approved: { label: 'Approved', badge: 'badge-success' },
        rejected: { label: 'Rejected', badge: 'badge-danger' }
    };

    list.innerHTML = studentTimesheets.map((item) => {
        const status = statusMap[item.status] || statusMap.pending;
        return `
            <div class="application-card">
                <div class="application-header">
                    <div>
                        <h4 class="application-title">${escapeHtml(item.jobTitle || 'Unknown Position')}</h4>
                        <p class="application-dept">${escapeHtml(item.date || 'No date provided')}</p>
                    </div>
                    <span class="badge ${status.badge}">${status.label}</span>
                </div>
                <p class="application-date">${item.hours ?? 0} hours submitted${item.status === 'approved' && item.approvedHours != null ? ` · ${item.approvedHours} hours approved` : ''}</p>
                <p style="margin:.75rem 0 0;color:#374151;white-space:pre-wrap;">${escapeHtml(item.description || 'No description provided.')}</p>
                ${item.reviewNote ? `<p style="margin:.75rem 0 0;color:#6b7280;">Review note: ${escapeHtml(item.reviewNote)}</p>` : ''}
            </div>
        `;
    }).join('');
}

function initTimesheetForm() {
    const form = document.getElementById('timesheetForm');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const jobId = form.elements.jobId.value;
        const date = form.elements.date.value;
        const hours = Number(form.elements.hours.value);
        const description = form.elements.description.value.trim();

        if (!jobId || !date || !Number.isFinite(hours) || hours <= 0 || hours > 24 || !description) {
            showToast('Please complete all timesheet fields', 'error');
            return;
        }

        try {
            await API.student.submitTimesheet({ jobId, date, hours, description });
            form.reset();
            showToast('Timesheet submitted successfully', 'success');
            populateTimesheetJobOptions();
            await refreshTimesheetViews();
        } catch (error) {
            showToast(error.message || 'Failed to submit timesheet', 'error');
        }
    });
}

function initEditProfile() {
    const editBtn = document.getElementById('editProfileBtn');
    const cancelBtn = document.getElementById('cancelEditBtn');
    const form = document.getElementById('profileForm');
    const formActions = document.getElementById('formActions');
    const editable = ['phone', 'major', 'year', 'gpa', 'bio'];

    const setEditing = (editing) => {
        editable.forEach((name) => {
            form.elements[name].disabled = !editing;
        });
        formActions.style.display = editing ? 'flex' : 'none';
        editBtn.textContent = editing ? 'Cancel' : 'Edit Profile';
    };

    editBtn.addEventListener('click', () => {
        const editing = editBtn.textContent === 'Edit Profile';
        setEditing(editing);
        if (!editing) loadUserData();
    });

    cancelBtn.addEventListener('click', () => {
        setEditing(false);
        loadUserData();
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            const updated = await API.student.updateProfile({
                phone: form.elements.phone.value.trim(),
                major: form.elements.major.value.trim(),
                grade: form.elements.year.value.trim(),
                gpa: form.elements.gpa.value ? parseFloat(form.elements.gpa.value) : null,
                bio: form.elements.bio.value.trim()
            });
            syncUserToLocalStorage(updated);
            loadUserData();
            renderProfileCompletion();
            setEditing(false);
            showToast('Profile updated successfully', 'success');
        } catch (error) {
            showToast(error.message || 'Failed to update profile', 'error');
        }
    });
}

function renderUploadedResumeInfo(user) {
    const uploadArea = document.getElementById('pdfUploadArea');
    const info = document.getElementById('uploadedFileInfo');
    if (!uploadArea || !info) return;
    if (!user?.resumePdfData) {
        uploadArea.style.display = 'block';
        info.style.display = 'block';
        info.innerHTML = `
            <div class="uploaded-file-card">
                <div class="uploaded-file-info">
                    <div>
                        <p class="uploaded-file-name">No PDF resume uploaded</p>
                        <p class="uploaded-file-size">Upload a PDF above and it will appear here immediately.</p>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    const uploadedAt = user.resumePdfUploadedAt ? new Date(user.resumePdfUploadedAt).toLocaleString('en-US') : 'Just now';
    info.style.display = 'block';
    info.innerHTML = `
        <div class="uploaded-file-card">
            <div class="uploaded-file-info">
                <div>
                    <p class="uploaded-file-name">${user.resumePdfName || 'Resume.pdf'}</p>
                    <p class="uploaded-file-size">Available now · uploaded at ${uploadedAt}</p>
                </div>
            </div>
            <div class="favorite-card-actions">
                <button class="btn btn-outline btn-sm" id="viewResumePdfBtn">View</button>
                <button class="btn btn-outline btn-sm" id="removeResumePdfBtn">Remove</button>
            </div>
        </div>
        <div style="margin-top:1rem;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;background:#fff;">
            <iframe src="${user.resumePdfData}" title="Uploaded Resume PDF" style="width:100%;height:420px;border:0;"></iframe>
        </div>
    `;
    document.getElementById('viewResumePdfBtn').onclick = () => window.open(user.resumePdfData, '_blank');
    document.getElementById('removeResumePdfBtn').onclick = async () => {
        try {
            const updated = await API.student.updateProfile({ clearResumePdf: true });
            const refreshed = await loadProfileFromServer();
            syncUserToLocalStorage(refreshed || updated);
            renderUploadedResumeInfo(refreshed || updated);
            renderResumeStatus(refreshed || updated);
            renderProfileCompletion();
            showToast('Uploaded PDF removed', 'success');
        } catch (error) {
            showToast('Failed to remove PDF resume', 'error');
        }
    };
}

function buildResumePreviewHtml() {
    const form = document.getElementById('standardResumeForm');
    const skills = form.elements.resumeSkills.value.split(',').map((item) => item.trim()).filter(Boolean);
    return `
        <div class="card">
            <div class="card-body">
                <h3 style="margin-bottom:.5rem;">${escapeHtml(form.elements.resumeName.value || 'Unnamed Student')}</h3>
                <p style="color:#6b7280;margin:0 0 1rem;">${form.elements.resumeStudentId.value} · ${form.elements.resumeEmail.value}</p>
                <p><strong>Major:</strong> ${escapeHtml(form.elements.resumeMajor.value || 'N/A')}</p>
                <p><strong>GPA:</strong> ${escapeHtml(form.elements.resumeGpa.value || 'N/A')}</p>
                <p><strong>Skills:</strong> ${escapeHtml(skills.length ? skills.join(', ') : 'N/A')}</p>
                <p><strong>Experience:</strong></p>
                <p style="white-space:pre-wrap;">${escapeHtml(form.elements.resumeExperience.value || 'N/A')}</p>
            </div>
        </div>
    `;
}

function polishResumeText(input) {
    const text = String(input || '').trim();
    if (!text) {
        return 'Add a concrete experience first, then polish it into a concise resume bullet.';
    }

    const cleaned = text
        .replace(/\s+/g, ' ')
        .replace(/\bi\b/g, 'I')
        .trim()
        .replace(/[.!?]+$/, '');

    const lower = cleaned.toLowerCase();
    let action = 'Supported';
    if (lower.includes('teach') || lower.includes('tutor') || lower.includes('explain')) action = 'Delivered';
    if (lower.includes('organize') || lower.includes('coordinate') || lower.includes('manage')) action = 'Coordinated';
    if (lower.includes('grade') || lower.includes('mark') || lower.includes('feedback')) action = 'Assessed';
    if (lower.includes('code') || lower.includes('program') || lower.includes('debug')) action = 'Developed';

    const withoutFirstPerson = cleaned
        .replace(/^i\s+(was\s+)?/i, '')
        .replace(/^worked on\s+/i, '')
        .replace(/^helped\s+/i, 'helped ');

    return `${action} ${withoutFirstPerson}, strengthening student learning outcomes through clear communication, structured follow-up, and reliable academic support.`;
}

function initResumeTabs() {
    document.querySelectorAll('.resume-tab-btn').forEach((button) => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.resume-tab-btn').forEach((item) => item.classList.remove('active'));
            document.querySelectorAll('.resume-tab-content').forEach((item) => item.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(`resume-tab-${button.dataset.resumeTab}`).classList.add('active');
        });
    });

    const fileInput = document.getElementById('resumeUpload');
    const uploadArea = document.getElementById('pdfUploadArea');
    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (file.type !== 'application/pdf') {
            showToast('Please upload a PDF file', 'error');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showToast('PDF must be smaller than 5MB', 'error');
            return;
        }
        try {
            const dataUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            const optimisticUser = {
                ...(currentUserProfile || {}),
                resumePdfName: file.name,
                resumePdfData: dataUrl,
                resumePdfUploadedAt: new Date().toISOString().slice(0, 19)
            };
            renderUploadedResumeInfo(optimisticUser);
            renderResumeStatus(optimisticUser);
            const updated = await API.student.updateProfile({
                resumePdfName: file.name,
                resumePdfData: dataUrl,
                resumePdfUploadedAt: new Date().toISOString().slice(0, 19)
            });
            const refreshed = await loadProfileFromServer();
            const finalUser = refreshed || updated;
            if (!finalUser?.resumePdfData) {
                throw new Error('The PDF upload response did not include a saved file');
            }
            syncUserToLocalStorage(finalUser);
            renderUploadedResumeInfo(finalUser);
            renderResumeStatus(finalUser);
            renderProfileCompletion();
            showToast('PDF resume uploaded and available immediately', 'success');
        } catch (error) {
            renderUploadedResumeInfo(currentUserProfile);
            renderResumeStatus(currentUserProfile || {});
            showToast(error.message || 'Failed to upload PDF resume', 'error');
        } finally {
            event.target.value = '';
        }
    });

    const form = document.getElementById('standardResumeForm');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            const updated = await API.student.updateProfile({
                skills: form.elements.resumeSkills.value.split(',').map((item) => item.trim()).filter(Boolean),
                resume: {
                    education: [{
                        school: 'BUPT',
                        degree: 'Student',
                        major: form.elements.resumeMajor.value.trim(),
                        startDate: '',
                        endDate: '',
                        gpa: form.elements.resumeGpa.value ? parseFloat(form.elements.resumeGpa.value) : null
                    }],
                    experience: [{
                        company: 'BUPT',
                        position: 'Teaching Assistant Applicant',
                        startDate: '',
                        endDate: '',
                        description: form.elements.resumeExperience.value.trim()
                    }],
                    awards: []
                }
            });
            syncUserToLocalStorage(updated);
            populateResumeForm(updated);
            renderResumeStatus(updated);
            renderProfileCompletion();
            showToast('Resume information saved successfully', 'success');
        } catch (error) {
            showToast('Failed to save resume information', 'error');
        }
    });

    const previewModal = document.getElementById('resumePreviewModal');
    document.getElementById('previewResumeBtn').addEventListener('click', () => {
        document.getElementById('resumePreviewContent').innerHTML = buildResumePreviewHtml();
        previewModal.style.display = 'flex';
    });
    document.getElementById('closeResumePreviewBtn').addEventListener('click', () => {
        previewModal.style.display = 'none';
    });
    previewModal.addEventListener('click', (event) => {
        if (event.target === previewModal) previewModal.style.display = 'none';
    });

    document.getElementById('polishBtn').addEventListener('click', () => {
        const original = document.getElementById('originalText').value
            || document.getElementById('standardResumeForm').elements.resumeExperience.value;
        document.getElementById('polishedText').textContent = polishResumeText(original);
        showToast('Resume text polished', 'success');
    });

    document.getElementById('usePolishedBtn').addEventListener('click', () => {
        const polished = document.getElementById('polishedText').textContent.trim();
        if (!polished || polished === 'Your polished version will appear here.') {
            showToast('Polish a paragraph first', 'error');
            return;
        }
        document.getElementById('standardResumeForm').elements.resumeExperience.value = polished;
        showToast('Polished text copied into the standard resume form', 'success');
    });
}

function renderScheduleTable() {
    const tbody = document.getElementById('scheduleTableBody');
    const slots = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    tbody.innerHTML = slots.map((time) => `
        <tr>
            <td style="font-weight:500;color:#374151;">${time}</td>
            ${days.map((day) => {
                const entry = scheduleEntries.find((item) => item.day === day && item.startTime === time);
                return `<td>${entry ? `<div class="schedule-slot"><p class="schedule-slot-title">${entry.course}</p><p class="schedule-slot-time">${entry.startTime} - ${entry.endTime}</p></div>` : ''}</td>`;
            }).join('')}
        </tr>
    `).join('');
}

function initScheduleUpload() {
    const input = document.getElementById('scheduleUpload');
    input.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        try {
            const lines = (await file.text()).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
            const startIndex = /^day\s*,/i.test(lines[0] || '') ? 1 : 0;
            const entries = lines.slice(startIndex).map((line) => {
                const [rawDay, startTime, endTime, ...courseParts] = line.split(',');
                const day = normalizeDay(rawDay);
                return day && startTime && endTime && courseParts.length ? {
                    day,
                    startTime: startTime.trim(),
                    endTime: endTime.trim(),
                    course: courseParts.join(',').trim()
                } : null;
            }).filter(Boolean);
            if (!entries.length) throw new Error('No valid rows');
            const updated = await API.student.updateProfile({ schedule: buildSchedulePayload(entries) });
            syncUserToLocalStorage(updated);
            scheduleEntries = flattenSchedule(updated.schedule);
            renderScheduleTable();
            showToast('Schedule imported successfully', 'success');
        } catch (error) {
            showToast('Failed to import schedule. Use CSV: day,start,end,course', 'error');
        } finally {
            event.target.value = '';
        }
    });
}

async function loadFavoriteJobs() {
    if (!favoriteJobIds.length) {
        favoriteJobs = [];
        return;
    }
    const jobs = await Promise.all(favoriteJobIds.map(async (jobId) => {
        try {
            return await API.jobs.getById(jobId);
        } catch (error) {
            return null;
        }
    }));
    favoriteJobs = jobs.filter(Boolean);
    const validIds = favoriteJobs.map((job) => job.id);
    if (validIds.length !== favoriteJobIds.length) {
        favoriteJobIds = validIds;
        saveFavoriteIds();
    }
}

function renderFavoritesList() {
    const list = document.getElementById('favoritesList');
    if (!favoriteJobs.length) {
        list.innerHTML = `<div class="favorites-empty"><p>No saved positions yet</p><a href="/apply.html" class="btn btn-primary">Browse Positions</a></div>`;
        return;
    }
    list.innerHTML = favoriteJobs.map((job) => `
        <div class="favorite-card">
            <div class="favorite-card-grid">
                <div class="favorite-card-image"><img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400" alt="${escapeHtml(job.title || 'Position')}"></div>
                <div class="favorite-card-content">
                    <div class="favorite-card-header">
                        <div>
                            <h4 class="favorite-card-title">${escapeHtml(job.title || 'Untitled Position')}</h4>
                            <p class="favorite-card-dept">${escapeHtml(job.department || 'N/A')}</p>
                        </div>
                        <button class="favorite-delete-btn" onclick="removeFavorite('${job.id}')">Remove</button>
                    </div>
                    <div class="favorite-card-tags">${(job.requiredSkills || []).map((tag) => `<span class="badge badge-secondary">${escapeHtml(tag)}</span>`).join('')}</div>
                    <div class="favorite-card-meta">
                        <div class="favorite-card-meta-item">${escapeHtml(job.location || 'BUPT Campus')}</div>
                        <div class="favorite-card-meta-item">${escapeHtml(job.hoursPerWeek || 'N/A')} hours/week</div>
                        <div class="favorite-card-meta-item favorite-card-salary">${escapeHtml(job.hourlyRate ? `CNY ${job.hourlyRate}/hour` : 'Salary negotiable')}</div>
                    </div>
                    <div class="favorite-card-actions">
                        <a href="/job-detail.html?id=${job.id}" class="btn btn-primary btn-sm">View Details</a>
                        <button class="btn btn-outline btn-sm" onclick="applyFromFavorites('${job.id}')">Apply Now</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

window.removeFavorite = function removeFavorite(jobId) {
    favoriteJobIds = favoriteJobIds.filter((item) => item !== jobId);
    favoriteJobs = favoriteJobs.filter((job) => job.id !== jobId);
    saveFavoriteIds();
    renderFavoritesList();
    showToast('Removed from favorites', 'success');
};

window.applyFromFavorites = async function applyFromFavorites(jobId) {
    try {
        if (!hasResumeContent(currentUserProfile)) {
            showResumeRequiredModal();
            return;
        }
        await API.student.applyJob(jobId);
        showToast('Application submitted successfully', 'success');
        await refreshApplicationViews();
    } catch (error) {
        showToast(error.message || 'Failed to apply for this job', 'error');
    }
};

function showResumeRequiredModal() {
    let modal = document.getElementById('resumeRequiredModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'resumeRequiredModal';
        modal.style.cssText = 'position:fixed;inset:0;z-index:10000;display:none;align-items:center;justify-content:center;background:rgba(15,23,42,.45);padding:24px;';
        modal.innerHTML = `
            <div style="width:min(440px,100%);background:#fff;border-radius:8px;box-shadow:0 24px 70px rgba(15,23,42,.25);padding:26px;">
                <h3 style="margin:0 0 10px;color:#111827;font-size:22px;">Resume required before applying</h3>
                <p style="margin:0 0 18px;color:#4b5563;line-height:1.6;">Please upload a PDF resume or complete the standard resume form before submitting a TA application.</p>
                <div style="display:flex;gap:12px;justify-content:flex-end;flex-wrap:wrap;">
                    <button type="button" id="resumeRequiredCancel" class="btn btn-outline">Not Now</button>
                    <button type="button" id="resumeRequiredGo" class="btn btn-primary">Prepare Resume</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('resumeRequiredCancel').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        document.getElementById('resumeRequiredGo').addEventListener('click', () => {
            modal.style.display = 'none';
            activateTab('resume');
            window.location.hash = 'resume';
        });
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    modal.style.display = 'flex';
}

function initAvatarUpload() {
    const input = document.getElementById('avatarUpload');
    document.getElementById('avatarUploadOverlay').addEventListener('click', (event) => {
        event.stopPropagation();
        input.click();
    });
    input.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            showToast('Please upload an image file', 'error');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            showToast('Image must be smaller than 2MB', 'error');
            return;
        }
        const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
        try {
            const updated = await API.student.updateProfile({ avatar: dataUrl });
            syncUserToLocalStorage(updated);
            loadUserData();
            showToast('Avatar uploaded successfully', 'success');
        } catch (error) {
            showToast('Failed to upload avatar', 'error');
        }
    });
}

function showGPAModal() {
    document.getElementById('gpaModal').style.display = 'flex';
}

function hideGPAModal() {
    document.getElementById('gpaModal').style.display = 'none';
}

function initGPAModal() {
    document.getElementById('gpaForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const value = parseFloat(document.getElementById('gpaInput').value);
        if (Number.isNaN(value) || value < 0 || value > 4) {
            showToast('Please enter a valid GPA (0.0 - 4.0)', 'error');
            return;
        }
        try {
            const updated = await API.student.updateProfile({ gpa: value });
            syncUserToLocalStorage(updated);
            loadUserData();
            renderProfileCompletion();
            hideGPAModal();
            showToast('GPA saved successfully', 'success');
        } catch (error) {
            showToast('Failed to save GPA', 'error');
        }
    });
}

function initLogout() {
    const handleLogout = () => {
        API.auth.logout().catch(() => null).finally(() => {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('csrfToken');
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userRole');
            window.location.href = '/login.html';
        });
    };
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('signOutBtn').addEventListener('click', handleLogout);
}

function initSecurityForm() {
    const form = document.getElementById('securityForm');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const currentPassword = form.elements.currentPassword.value;
        const newPassword = form.elements.newPassword.value;
        const confirmPassword = form.elements.confirmPassword.value;
        if (!currentPassword || !newPassword || !confirmPassword) {
            showToast('Please complete all password fields', 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }
        try {
            await API.student.updateProfile({ currentPassword, newPassword });
            form.reset();
            showToast('Password updated successfully', 'success');
        } catch (error) {
            showToast(error.message || 'Failed to update password', 'error');
        }
    });
    document.getElementById('deleteAccountBtn').addEventListener('click', () => {
        showToast('Delete account is not supported yet because related records are still linked to your applications and timesheets.', 'info');
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const profile = await loadProfileFromServer();
    if (!profile) return;
    loadUserData();
    initTabs();
    initEditProfile();
    initLogout();
    initAvatarUpload();
    initGPAModal();
    initResumeTabs();
    initScheduleUpload();
    initSecurityForm();
    initTimesheetForm();
    activateInitialTabFromHash();
    renderProfileCompletion();
    await refreshApplicationViews();
    await refreshTimesheetViews();
    await loadFavoriteJobs();
    renderFavoritesList();
    renderScheduleTable();
});
