let selectedRows = new Set();
let currentJobs = [];
let recruitmentStatusFilter = 'all';
let applicationFilters = { job: '', student: '', status: '' };
let recruitmentActionInProgress = false;
const reviewingJobs = new Set();
const closingJobs = new Set();

document.addEventListener('DOMContentLoaded', () => {
  initSemesterDropdown();
  loadRecruitmentContent();
});

function initSemesterDropdown() {
  const button = document.getElementById('semesterButton');
  const menu = document.getElementById('semesterMenu');
  if (!button || !menu) return;
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    menu.classList.toggle('active');
  });
  document.addEventListener('click', () => menu.classList.remove('active'));
}

async function loadRecruitmentContent() {
  const content = document.getElementById('adminContent');
  if (!content) return;
  content.innerHTML = '<div class="card"><div class="card-content">Loading recruitment and application records...</div></div>';

  try {
    const recruitment = await API.admin.getRecruitment();
    currentJobs = recruitment.jobs || [];
    let applications = null;
    let applicationsError = null;
    try {
      applications = await API.admin.getApplications(applicationFilters);
    } catch (error) {
      applicationsError = error;
    }
    renderRecruitment(content, recruitment, applications, applicationsError);
  } catch (error) {
    content.innerHTML = `<div class="card"><div class="card-content">Failed to load recruitment data: ${escapeHtml(error.message)}</div></div>`;
  }
}

function renderRecruitment(content, data, applications, applicationsError) {
  selectedRows = new Set([...selectedRows].filter((id) => currentJobs.some((job) => job.id === id && job.status === 'pending')));
  const rows = getFilteredJobs();

  content.innerHTML = `
    <div class="page-header">
      <div class="page-title-section">
        <h1>Recruitment & Approvals</h1>
        <p>Review submitted postings, manage published jobs, and monitor applications.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" id="batchApproveBtn" onclick="batchApprove(this)" disabled>Batch Approve</button>
      </div>
    </div>

    <div class="filters-bar">
      <div class="search-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8" stroke-width="2"/><path d="m21 21-4.35-4.35" stroke-width="2"/></svg>
        <input type="text" placeholder="Search by course, code, MO, or status..." id="searchInput">
      </div>
      <select id="statusFilter" class="filter-select" onchange="setRecruitmentStatusFilter(this.value)">
        ${['all', 'draft', 'pending', 'published', 'closed', 'rejected', 'completed'].map((status) => `
          <option value="${status}" ${status === recruitmentStatusFilter ? 'selected' : ''}>${formatStatus(status)} (${countJobs(status)})</option>
        `).join('')}
      </select>
      <div class="filter-info">Showing <span class="filter-count">${rows.length}</span> posting(s)</div>
    </div>

    ${rows.length ? renderTable(rows, data) : renderEmptyView()}
    ${renderApplicationsPanel(applications, applicationsError)}
  `;

  updateBatchButton();
  bindSearchFilter();
}

function getFilteredJobs() {
  return currentJobs.filter((job) => recruitmentStatusFilter === 'all' || job.status === recruitmentStatusFilter);
}

function countJobs(status) {
  if (status === 'all') return currentJobs.length;
  return currentJobs.filter((job) => job.status === status).length;
}

function setRecruitmentStatusFilter(status) {
  recruitmentStatusFilter = status || 'all';
  selectedRows.clear();
  const content = document.getElementById('adminContent');
  if (!content) return;
  renderRecruitment(content, {
    totalSlots: currentJobs.reduce((sum, job) => sum + Number(job.taSlots || 0), 0),
    warningCount: currentJobs.filter((job) => job.budgetStatus !== 'within').length
  }, window.lastAdminApplications || null, window.lastAdminApplicationsError || null);
}

function renderTable(rows, data) {
  return `
    <div class="card">
      <div class="recruitment-table-wrapper">
        <table class="recruitment-table">
          <thead>
            <tr>
              <th style="width: 40px;"><input type="checkbox" id="selectAll" onchange="toggleSelectAll(this)"></th>
              <th>Module Name</th>
              <th>Requesting MO</th>
              <th>TA Slots</th>
              <th>Proposed Workload</th>
              <th>Budget Status</th>
              <th>Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody id="postingsTableBody">${rows.map(renderPostingsRow).join('')}</tbody>
        </table>
      </div>
      <div class="table-footer">
        <span>Total requested TA slots: <strong>${data.totalSlots || 0}</strong></span>
        <span>Budget warnings: <strong style="color: #d97706;">${data.warningCount || 0}</strong></span>
      </div>
    </div>
  `;
}

function renderPostingsRow(posting) {
  const canReview = posting.status === 'pending';
  const canClose = posting.status === 'published';
  return `
    <tr data-status="${escapeHtml(posting.status)}">
      <td>${canReview ? `<input type="checkbox" onchange="toggleRow('${escapeHtml(posting.id)}', this)" ${selectedRows.has(posting.id) ? 'checked' : ''}>` : ''}</td>
      <td><div class="module-name">${escapeHtml(posting.moduleName)}</div><div class="module-code">${escapeHtml(posting.moduleCode || '')}</div></td>
      <td><div class="mo-name">${escapeHtml(posting.requestingMO)}</div><div class="mo-dept">${escapeHtml(posting.department)}</div></td>
      <td><span class="ta-slots-badge">${escapeHtml(posting.taSlots)}</span></td>
      <td><span class="workload-text">${escapeHtml(posting.proposedWorkload)}</span></td>
      <td>${renderBudgetStatus(posting.budgetStatus)}</td>
      <td><span class="status-badge">${escapeHtml(formatStatus(posting.status))}</span></td>
      <td style="text-align: right;">
        <div class="action-buttons">
          ${canReview ? `
            <button class="icon-btn icon-btn-success" title="Approve" onclick="reviewJob('${escapeHtml(posting.id)}', 'approve', this)">OK</button>
            <button class="icon-btn icon-btn-danger" title="Reject" onclick="reviewJob('${escapeHtml(posting.id)}', 'reject', this)">No</button>
          ` : ''}
          ${canClose ? `<button class="icon-btn icon-btn-danger" title="Close published job" onclick="closeAdminJob('${escapeHtml(posting.id)}', this)">Close</button>` : ''}
          ${!canReview && !canClose ? '<span style="color:#9ca3af;font-size:12px;">No action</span>' : ''}
        </div>
      </td>
    </tr>
  `;
}

function renderBudgetStatus(status) {
  const config = {
    within: ['status-success', 'Within Budget'],
    warning: ['status-warning', 'Budget Warning'],
    exceeded: ['status-danger', 'Over Budget']
  }[status] || ['status-success', status || 'Within Budget'];
  return `<span class="status-badge ${config[0]}">${escapeHtml(config[1])}</span>`;
}

function renderEmptyView() {
  return '<div class="empty-state"><h3>No postings found</h3><p>Try another status filter or search term.</p></div>';
}

function renderApplicationsPanel(data, error) {
  window.lastAdminApplications = data;
  window.lastAdminApplicationsError = error;
  if (error) {
    return `
      <div class="card" style="margin-top:24px;">
        <div class="card-content">
          <h2 style="margin:0 0 8px;">Applications</h2>
          <p style="color:#dc2626;">Failed to load applications: ${escapeHtml(error.message)}</p>
        </div>
      </div>
    `;
  }
  const items = data?.items || [];
  return `
    <div class="card" style="margin-top:24px;">
      <div class="card-content">
        <div class="page-title-section" style="margin-bottom:16px;">
          <h2 style="margin:0;">Applications</h2>
          <p>All student applications across jobs. Total: ${escapeHtml(data?.total ?? 0)}</p>
        </div>
        <div class="filters-bar" style="margin-bottom:16px;">
          <input id="applicationJobFilter" class="filter-select" placeholder="Filter job/code" value="${escapeHtml(applicationFilters.job)}">
          <input id="applicationStudentFilter" class="filter-select" placeholder="Filter student/name" value="${escapeHtml(applicationFilters.student)}">
          <select id="applicationStatusFilter" class="filter-select">
            ${['', 'pending', 'approved', 'rejected', 'withdrawn'].map((status) => `
              <option value="${status}" ${status === applicationFilters.status ? 'selected' : ''}>${status ? formatStatus(status) : 'All statuses'}</option>
            `).join('')}
          </select>
          <button class="btn btn-secondary" onclick="applyApplicationFilters(this)">Apply Filters</button>
        </div>
        ${items.length ? renderApplicationsTable(items) : '<div class="empty-state"><h3>No applications found</h3><p>No records match the current filters.</p></div>'}
      </div>
    </div>
  `;
}

function renderApplicationsTable(items) {
  return `
    <div class="recruitment-table-wrapper">
      <table class="recruitment-table">
        <thead>
          <tr>
            <th>Application</th>
            <th>Student</th>
            <th>Job</th>
            <th>MO</th>
            <th>Status</th>
            <th>Applied</th>
            <th>Review Note</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item) => `
            <tr>
              <td>${escapeHtml(item.id)}</td>
              <td><div class="module-name">${escapeHtml(item.studentName)}</div><div class="module-code">${escapeHtml(item.studentEmail || item.studentNumber || '')}</div></td>
              <td><div class="module-name">${escapeHtml(item.jobTitle)}</div><div class="module-code">${escapeHtml(item.moduleCode || item.jobId)} · ${escapeHtml(formatStatus(item.jobStatus))}</div></td>
              <td>${escapeHtml(item.moName || '-')}</td>
              <td><span class="status-badge">${escapeHtml(formatStatus(item.status))}</span></td>
              <td>${escapeHtml(item.appliedAt || '-')}</td>
              <td>${escapeHtml(item.reviewNote || '-')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function bindSearchFilter() {
  const search = document.getElementById('searchInput');
  if (!search) return;
  search.addEventListener('input', () => {
    const term = search.value.toLowerCase();
    document.querySelectorAll('#postingsTableBody tr').forEach((row) => {
      row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none';
    });
  });
}

function toggleSelectAll(checkbox) {
  selectedRows.clear();
  document.querySelectorAll('#postingsTableBody input[type="checkbox"]').forEach((input) => {
    const row = input.closest('tr');
    const visible = !row || row.style.display !== 'none';
    input.checked = checkbox.checked && visible;
    if (input.checked) {
      const match = input.getAttribute('onchange')?.match(/'([^']+)'/);
      if (match) selectedRows.add(match[1]);
    }
  });
  updateBatchButton();
}

function toggleRow(id, checkbox) {
  if (checkbox.checked) selectedRows.add(id);
  else selectedRows.delete(id);
  updateBatchButton();
}

function updateBatchButton() {
  const button = document.getElementById('batchApproveBtn');
  if (!button) return;
  button.disabled = selectedRows.size === 0;
  button.textContent = selectedRows.size ? `Batch Approve (${selectedRows.size})` : 'Batch Approve';
}

async function reviewJob(id, action, button) {
  if (reviewingJobs.has(id)) return;
  const comment = action === 'reject' ? prompt('Reason for rejection?', '') || '' : '';
  reviewingJobs.add(id);
  setAdminButtonBusy(button, true, action === 'approve' ? 'Approving...' : 'Rejecting...');
  try {
    await API.admin.reviewJob(id, action, comment);
    selectedRows.delete(id);
    showAdminToast(action === 'approve' ? 'Job approved successfully.' : 'Job rejected successfully.', 'success');
    await loadRecruitmentContent();
  } catch (error) {
    showAdminToast(error.message || 'Failed to review job posting.', 'error');
  } finally {
    reviewingJobs.delete(id);
    setAdminButtonBusy(button, false);
  }
}

async function closeAdminJob(id, button) {
  if (closingJobs.has(id)) return;
  if (!window.confirm('Close this published job? Students will no longer be able to apply.')) return;
  closingJobs.add(id);
  setAdminButtonBusy(button, true, 'Closing...');
  try {
    await API.admin.closeJob(id);
    showAdminToast('Job closed successfully.', 'success');
    await loadRecruitmentContent();
  } catch (error) {
    showAdminToast(error.message || 'Failed to close job.', 'error');
  } finally {
    closingJobs.delete(id);
    setAdminButtonBusy(button, false);
  }
}

async function batchApprove(button) {
  if (recruitmentActionInProgress || selectedRows.size === 0) return;
  const ids = Array.from(selectedRows);
  recruitmentActionInProgress = true;
  setAdminButtonBusy(button, true, 'Approving...');
  try {
    for (const id of ids) {
      await API.admin.reviewJob(id, 'approve', '');
    }
    selectedRows.clear();
    showAdminToast(`${ids.length} job posting(s) approved successfully.`, 'success');
    await loadRecruitmentContent();
  } catch (error) {
    showAdminToast(error.message || 'Failed to batch approve selected jobs.', 'error');
    await loadRecruitmentContent();
  } finally {
    recruitmentActionInProgress = false;
    setAdminButtonBusy(button, false);
  }
}

async function applyApplicationFilters(button) {
  applicationFilters = {
    job: document.getElementById('applicationJobFilter')?.value.trim() || '',
    student: document.getElementById('applicationStudentFilter')?.value.trim() || '',
    status: document.getElementById('applicationStatusFilter')?.value || ''
  };
  setAdminButtonBusy(button, true, 'Loading...');
  try {
    await loadRecruitmentContent();
  } finally {
    setAdminButtonBusy(button, false);
  }
}

function setAdminButtonBusy(button, busy, label) {
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

function showAdminToast(message, type = 'info') {
  let toast = document.getElementById('adminActionToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'adminActionToast';
    toast.style.cssText = 'position:fixed;right:24px;bottom:24px;z-index:10000;max-width:360px;background:#111827;color:#fff;padding:12px 16px;border-radius:8px;box-shadow:0 16px 40px rgba(15,23,42,.22);font-size:14px;line-height:1.4;';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.borderLeft = type === 'error' ? '4px solid #dc2626' : '4px solid #059669';
  toast.style.display = 'block';
  window.clearTimeout(showAdminToast.timer);
  showAdminToast.timer = window.setTimeout(() => {
    toast.style.display = 'none';
  }, 3200);
}

function formatStatus(status) {
  if (!status) return 'Unknown';
  if (status === 'all') return 'All';
  return String(status).replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
