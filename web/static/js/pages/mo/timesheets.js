const timesheetQuickComments = [
    'Looks good',
    'Approved as submitted',
    'Please keep task notes concise',
    'Need clearer description',
    'Hours adjusted after review'
];

let timesheetsState = {
    currentUser: null,
    timesheets: [],
    activeTab: 'pending',
    expandedCards: new Set()
};

document.addEventListener('DOMContentLoaded', async () => {
    timesheetsState.currentUser = await ensureMOAuth();
    if (!timesheetsState.currentUser) {
        return;
    }

    setupTimesheetTabs();
    await loadTimesheetsData();
});

function setupTimesheetTabs() {
    document.querySelectorAll('.tab-btn').forEach((button) => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach((item) => item.classList.remove('active'));
            button.classList.add('active');
            timesheetsState.activeTab = button.dataset.tab;
            renderTimesheets();
        });
    });

    const exportButton = document.getElementById('exportTimesheetsBtn');
    if (exportButton) {
        exportButton.addEventListener('click', exportTimesheetsCsv);
    }
}

async function loadTimesheetsData() {
    try {
        const data = await API.mo.getTimesheets();
        timesheetsState.timesheets = (data || []).map(normalizeTimesheetRecord);
        updateTimesheetStats();
        renderTimesheets();
    } catch (error) {
        console.error('Failed to load timesheets:', error);
        document.getElementById('timesheetsList').innerHTML = `<div class="empty-state">${moEscapeHtml(error.message || 'Failed to load timesheets.')}</div>`;
    }
}

function normalizeTimesheetRecord(item) {
    const timesheet = item.timesheet || {};
    const student = item.student || {};
    const job = item.job || {};
    const hoursWorked = Number(timesheet.hoursWorked ?? timesheet.hours ?? 0);
    return {
        id: timesheet.id,
        timesheet,
        taName: student.name || 'Unknown Student',
        taId: student.studentId || student.id || '-',
        moduleCode: job.moduleCode || '-',
        week: timesheet.date || 'No date',
        hoursLogged: hoursWorked,
        submittedDate: moFormatDateTime(timesheet.submittedAt),
        status: timesheet.status || 'pending',
        tasks: moParseList(timesheet.description || ''),
        rating: 0,
        comment: timesheet.reviewComment || '',
        hoursApproved: Number(timesheet.approvedHours ?? 0),
        hasAnomaly: Boolean(timesheet.hasAnomaly),
        anomalyReason: timesheet.anomalyReason || '',
        reviewedAt: timesheet.reviewedAt
    };
}

function updateTimesheetStats() {
    const pending = timesheetsState.timesheets.filter((item) => item.status === 'pending');
    const approved = timesheetsState.timesheets.filter((item) => item.status === 'approved');
    const activeTAs = new Set(timesheetsState.timesheets.map((item) => item.taId));

    document.getElementById('pendingCount').textContent = pending.length;
    document.getElementById('pendingHours').textContent = moFormatHours(pending.reduce((sum, item) => sum + item.hoursLogged, 0));
    document.getElementById('approvedHours').textContent = moFormatHours(approved.reduce((sum, item) => sum + (item.hoursApproved || 0), 0));
    document.getElementById('activeTAs').textContent = activeTAs.size;
    document.getElementById('pendingBadge').textContent = pending.length;
}

function renderTimesheets() {
    const container = document.getElementById('timesheetsList');
    const emptyState = document.getElementById('emptyState');

    const filtered = timesheetsState.activeTab === 'all'
        ? timesheetsState.timesheets
        : timesheetsState.timesheets.filter((item) => item.status === timesheetsState.activeTab);

    if (!filtered.length) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    container.style.display = 'flex';
    emptyState.style.display = 'none';
    container.innerHTML = filtered.map(renderTimesheetCard).join('');
    if (window.lucide) {
        lucide.createIcons();
    }
    attachTimesheetCardEvents();
}

function renderTimesheetCard(sheet) {
    const initials = moInitials(sheet.taName);
    const isExpanded = timesheetsState.expandedCards.has(sheet.id);
    const statusText = moStatusLabel(sheet.status);

    return `
        <div class="timesheet-card ${moEscapeHtml(sheet.status)}" data-id="${sheet.id}">
            <div class="timesheet-header" onclick="toggleTimesheetCard('${sheet.id}')">
                <div class="ta-info">
                    <div class="ta-avatar">${moEscapeHtml(initials)}</div>
                    <div class="ta-details">
                        <div class="ta-name-row">
                            <span class="ta-name">${moEscapeHtml(sheet.taName)}</span>
                            <span class="ta-id">${moEscapeHtml(sheet.taId)}</span>
                            ${sheet.hasAnomaly ? `
                                <span class="anomaly-badge">
                                    <i data-lucide="triangle-alert"></i>
                                    Check Hours
                                </span>
                            ` : ''}
                        </div>
                        <div class="ta-meta">
                            <span class="ta-meta-item"><i data-lucide="book-open"></i>${moEscapeHtml(sheet.moduleCode)}</span>
                            <span class="ta-meta-item"><i data-lucide="calendar"></i>${moEscapeHtml(sheet.week)}</span>
                        </div>
                    </div>
                </div>
                <div class="timesheet-right">
                    <div class="hours-info">
                        <div class="hours-logged"><i data-lucide="clock"></i>${moEscapeHtml(moFormatHours(sheet.hoursLogged))} logged</div>
                        <div class="submitted-date">Submitted ${moEscapeHtml(sheet.submittedDate)}</div>
                    </div>
                    <div class="status-badge ${moEscapeHtml(sheet.status)}">
                        <i data-lucide="${sheet.status === 'approved' ? 'check-circle-2' : sheet.status === 'rejected' ? 'x-circle' : 'alert-circle'}"></i>
                        ${moEscapeHtml(statusText)}
                    </div>
                    <i data-lucide="chevron-down" class="expand-icon ${isExpanded ? 'expanded' : ''}"></i>
                </div>
            </div>

            <div class="timesheet-body ${isExpanded ? 'expanded' : ''}">
                ${sheet.hasAnomaly ? `
                    <div class="anomaly-alert">
                        <i data-lucide="triangle-alert"></i>
                        <p><strong>Review note:</strong> ${moEscapeHtml(sheet.anomalyReason || 'This entry was flagged for manual review.')}</p>
                    </div>
                ` : ''}

                <div class="tasks-section">
                    <div class="section-label">
                        <i data-lucide="message-square"></i>
                        Tasks Completed
                    </div>
                    <div class="tasks-list">
                        ${(sheet.tasks.length ? sheet.tasks : ['No task details provided']).map((task) => `<span class="task-tag">${moEscapeHtml(task)}</span>`).join('')}
                    </div>
                </div>

                ${sheet.status === 'pending' ? `
                    <div class="comment-section">
                        <div class="section-label">Quick Comment</div>
                        <div class="quick-comments">
                            ${timesheetQuickComments.map((comment) => `
                                <button class="quick-comment-btn ${sheet.comment === comment ? 'selected' : ''}" onclick="selectTimesheetQuickComment('${sheet.id}', ${JSON.stringify(comment)})">
                                    ${moEscapeHtml(comment)}
                                </button>
                            `).join('')}
                        </div>
                        <input type="text" class="comment-input" placeholder="Or type a custom comment..." value="${moEscapeHtml(sheet.comment)}" onchange="setTimesheetComment('${sheet.id}', this.value)">
                        <div class="action-buttons">
                            <button class="btn-reject" onclick="reviewTimesheet('${sheet.id}', 'reject')">
                                <i data-lucide="x-circle"></i>
                                Reject
                            </button>
                            <button class="btn-approve" onclick="reviewTimesheet('${sheet.id}', 'approve')">
                                <i data-lucide="check-circle-2"></i>
                                Approve ${moEscapeHtml(moFormatHours(sheet.hoursLogged))}
                            </button>
                        </div>
                    </div>
                ` : `
                    <div class="approved-rating">
                        <span class="rating-comment">${moEscapeHtml(sheet.comment || 'No review comment provided.')}</span>
                        <span class="approved-hours">${sheet.status === 'approved' ? `Approved ${moEscapeHtml(moFormatHours(sheet.hoursApproved || sheet.hoursLogged))}` : 'Rejected'}</span>
                    </div>
                `}
            </div>
        </div>
    `;
}

function attachTimesheetCardEvents() {
    document.querySelectorAll('.star-rating').forEach(() => {});
}

function toggleTimesheetCard(id) {
    if (timesheetsState.expandedCards.has(id)) {
        timesheetsState.expandedCards.delete(id);
    } else {
        timesheetsState.expandedCards.add(id);
    }
    renderTimesheets();
}

function selectTimesheetQuickComment(id, comment) {
    const sheet = timesheetsState.timesheets.find((item) => item.id === id);
    if (!sheet) {
        return;
    }
    sheet.comment = comment;
    renderTimesheets();
}

function setTimesheetComment(id, comment) {
    const sheet = timesheetsState.timesheets.find((item) => item.id === id);
    if (!sheet) {
        return;
    }
    sheet.comment = comment;
}

async function reviewTimesheet(id, action) {
    const sheet = timesheetsState.timesheets.find((item) => item.id === id);
    if (!sheet) {
        return;
    }

    let approvedHours = null;
    if (action === 'approve') {
        const input = window.prompt('Approved hours:', String(sheet.hoursLogged));
        if (input === null) {
            return;
        }

        approvedHours = Number(input);
        if (!Number.isFinite(approvedHours)) {
            alert('Approved hours must be a valid number.');
            return;
        }
        if (approvedHours < 0) {
            alert('Approved hours cannot be negative.');
            return;
        }
        if (approvedHours > sheet.hoursLogged) {
            alert('Approved hours cannot exceed logged hours.');
            return;
        }
    }

    try {
        await API.mo.reviewTimesheet(id, {
            action,
            comment: sheet.comment,
            approvedHours: action === 'approve' ? approvedHours : 0
        });
        timesheetsState.expandedCards.delete(id);
        await loadTimesheetsData();
    } catch (error) {
        alert(error.message || 'Failed to review timesheet.');
    }
}

function exportTimesheetsCsv() {
    const visibleTimesheets = timesheetsState.activeTab === 'all'
        ? timesheetsState.timesheets
        : timesheetsState.timesheets.filter((item) => item.status === timesheetsState.activeTab);

    const rows = [
        ['TA Name', 'TA ID', 'Module', 'Date', 'Hours Logged', 'Hours Approved', 'Status', 'Submitted At', 'Reviewed At', 'Review Comment'],
        ...visibleTimesheets.map((item) => [
            item.taName,
            item.taId,
            item.moduleCode,
            item.week,
            item.hoursLogged,
            item.hoursApproved,
            item.status,
            item.submittedDate,
            item.reviewedAt ? moFormatDateTime(item.reviewedAt) : '',
            item.comment || ''
        ])
    ];

    const csv = rows
        .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mo-timesheets-${timesheetsState.activeTab}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
}
