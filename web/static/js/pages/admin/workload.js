let activeTab = 'monitor';
let workloadData = { rows: [], exceptions: [], blockedCount: 0 };
const workloadReviewActions = new Set();

document.addEventListener('DOMContentLoaded', () => {
  initSemesterDropdown();
  loadWorkloadContent();
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

async function loadWorkloadContent() {
  const content = document.getElementById('adminContent');
  if (!content) return;
  content.innerHTML = '<div class="card"><div class="card-content">Loading workload monitor...</div></div>';
  try {
    workloadData = await API.admin.getWorkload();
    renderWorkload(content);
  } catch (error) {
    content.innerHTML = `<div class="card"><div class="card-content">Failed to load workload data: ${error.message}</div></div>`;
  }
}

function renderWorkload(content) {
  content.innerHTML = `
    <div class="page-header">
      <div class="page-title-section">
        <h1>Workload Compliance Control</h1>
        <p>Monitor working hours and review exception signals.</p>
      </div>
      <div class="page-actions">
        <button class="btn ${activeTab === 'monitor' ? 'btn-primary' : 'btn-secondary'}" onclick="switchTab('monitor')">Real-time Monitor</button>
        <button class="btn ${activeTab === 'exceptions' ? 'btn-primary' : 'btn-secondary'}" onclick="switchTab('exceptions')" style="position: relative;">
          Pending Exceptions <span class="exception-badge">${(workloadData.exceptions || []).length}</span>
        </button>
      </div>
    </div>
    ${activeTab === 'monitor' ? renderMonitorTab() : renderExceptionsTab()}
  `;
}

function renderMonitorTab() {
  const rows = workloadData.rows || [];
  return `
    <div class="card">
      <div class="workload-toolbar">
        <div class="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8" stroke-width="2"/><path d="m21 21-4.35-4.35" stroke-width="2"/></svg>
          <input type="text" placeholder="Search by name or course..." id="workloadSearch">
        </div>
        <div class="workload-stats">
          <span class="stat-item"><span class="stat-dot stat-red"></span>Blocked (${workloadData.blockedCount || 0})</span>
          <span class="stat-item"><span class="stat-dot stat-amber"></span>Overload Risk</span>
          <span class="stat-item"><span class="stat-dot stat-green"></span>Normal</span>
        </div>
      </div>
      <div class="workload-table-wrapper">
        <table class="workload-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Course Assignment</th>
              <th>Weekly Hours Usage</th>
              <th>Violation Source</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${rows.map(renderWorkloadRow).join('') || '<tr><td colspan="5">No approved TA workload yet.</td></tr>'}</tbody>
        </table>
      </div>
      <div class="table-footer">
        <span>Total monitored: <strong>${rows.length}</strong> personnel</span>
        <span>Active circuit breakers: <strong style="color: #dc2626;">${workloadData.blockedCount || 0}</strong></span>
      </div>
    </div>
  `;
}

function renderWorkloadRow(row) {
  const pct = Math.min((Number(row.weeklyHours || 0) / Math.max(1, Number(row.maxHours || 1))) * 100, 100);
  const progressColor = pct >= 100 ? 'progress-red' : pct >= 80 ? 'progress-amber' : 'progress-green';
  return `
    <tr class="${row.status === 'Blocked' ? 'row-blocked' : ''}">
      <td><div class="person-name">${row.name}</div><div class="person-role">${row.role}</div></td>
      <td><div class="course-primary">${(row.courses || []).join(', ') || '-'}</div></td>
      <td>
        <div class="hours-info">
          <span class="hours-current">${formatNumber(row.weeklyHours)}h</span>
          <span class="hours-separator">/</span>
          <span class="hours-max">${formatNumber(row.maxHours)}h</span>
          <span class="hours-percent">${Math.round(pct)}%</span>
        </div>
        <div class="progress-bar-small"><div class="progress-fill-small ${progressColor}" style="width: ${pct}%;"></div></div>
      </td>
      <td>${row.violationSource ? `<span class="violation-badge violation-orange">${row.violationSource}</span>` : '<span class="text-muted">-</span>'}</td>
      <td>${renderStatusBadge(row.status)}</td>
    </tr>
  `;
}

function renderStatusBadge(status) {
  const className = status === 'Blocked' ? 'status-blocked' : status === 'Overload Risk' ? 'status-risk' : 'status-normal';
  return `<span class="status-badge ${className}">${status}</span>`;
}

function renderExceptionsTab() {
  const exceptions = workloadData.exceptions || [];
  return `
    <div class="exceptions-summary">
      <div class="summary-content"><span><strong>${exceptions.length}</strong> override/anomaly item(s) pending Admin review</span></div>
    </div>
    <div class="exceptions-list">${exceptions.map(renderExceptionCard).join('') || '<div class="empty-state"><h3>No exceptions</h3><p>Current workload records are within normal bounds.</p></div>'}</div>
  `;
}

function renderExceptionCard(item) {
  return `
    <div class="exception-card verdict-caution">
      <div class="exception-content">
        <div class="exception-details">
          <div class="exception-header">
            <h4>Workload Review - ${item.studentName}</h4>
            <span class="verdict-badge verdict-caution">${item.aiVerdict}</span>
          </div>
          <p class="exception-summary">
            MO <strong>${item.requestingMO}</strong> reported ${formatNumber(item.currentHours)}h against ${formatNumber(item.maxHours)}h guidance.
          </p>
          <div class="exception-reason"><strong>Reason:</strong> "${item.reason || '-'}"</div>
          <div class="ai-recommendation verdict-caution"><div><strong>AI Analysis</strong><p>${item.aiRecommendation}</p></div></div>
        </div>
      </div>
      <div class="exception-actions">
        <button class="btn btn-primary" onclick="reviewException('${item.id}', 'approve', this)">Approve Override</button>
        <button class="btn btn-secondary" onclick="reviewException('${item.id}', 'reject', this)">Reject</button>
      </div>
    </div>
  `;
}

function switchTab(tab) {
  activeTab = tab;
  renderWorkload(document.getElementById('adminContent'));
}

async function reviewException(id, action, button) {
  if (workloadReviewActions.has(id)) return;
  workloadReviewActions.add(id);
  setAdminButtonBusy(button, true, action === 'approve' ? 'Approving...' : 'Rejecting...');
  try {
    await API.admin.reviewWorkloadException(id, { action, comment: `${action} by Admin` });
    showAdminToast(action === 'approve' ? 'Workload exception approved.' : 'Workload exception rejected.', 'success');
    await loadWorkloadContent();
  } catch (error) {
    showAdminToast(error.message || 'Failed to review workload exception.', 'error');
  } finally {
    workloadReviewActions.delete(id);
    setAdminButtonBusy(button, false);
  }
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 1 });
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
