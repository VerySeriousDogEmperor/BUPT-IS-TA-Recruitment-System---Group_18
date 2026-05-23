document.addEventListener('DOMContentLoaded', () => {
  initSemesterDropdown();
  loadDashboardContent();
});

let adminDashboardData = null;
const reportFilters = {
  department: '',
  status: '',
  from: '',
  to: ''
};

function initSemesterDropdown() {
  const button = document.getElementById('semesterButton');
  const menu = document.getElementById('semesterMenu');
  if (!button || !menu) return;
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    menu.classList.toggle('active');
  });
  document.addEventListener('click', () => menu.classList.remove('active'));
  menu.querySelectorAll('.semester-option').forEach((option) => {
    option.addEventListener('click', () => {
      button.querySelector('.semester-label').textContent = `Current Semester: ${option.textContent.trim().replace('Current', '')}`;
      menu.querySelectorAll('.semester-option').forEach((item) => item.classList.remove('active'));
      option.classList.add('active');
      menu.classList.remove('active');
    });
  });
}

async function loadDashboardContent() {
  const content = document.getElementById('adminContent');
  if (!content) return;
  content.innerHTML = renderLoading();

  try {
    const data = await API.admin.getDashboard();
    adminDashboardData = data;
    content.innerHTML = `
      <div class="page-header">
        <div class="page-title-section">
          <h1>Global Overview</h1>
          <p>Live overview of recruitment approvals, hiring progress, and workload consumption.</p>
        </div>
        <button class="btn btn-primary" onclick="exportAdminReport()">Export CSV Report</button>
      </div>

      <div class="card" style="margin-bottom: 24px;">
        <div class="card-header"><h3 class="card-title">Report Filters</h3></div>
        <div class="card-content">
          <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px;">
            <input id="reportDepartment" class="search-input" style="width: 100%;" placeholder="Department" value="${escapeHtml(reportFilters.department)}">
            <input id="reportStatus" class="search-input" style="width: 100%;" placeholder="Job status" value="${escapeHtml(reportFilters.status)}">
            <input id="reportFrom" class="search-input" style="width: 100%;" type="date" value="${escapeHtml(reportFilters.from)}">
            <input id="reportTo" class="search-input" style="width: 100%;" type="date" value="${escapeHtml(reportFilters.to)}">
          </div>
          <div style="display: flex; gap: 8px; margin-top: 12px;">
            <button class="btn btn-secondary" onclick="applyReportFilters()">Apply to Export</button>
            <button class="btn btn-secondary" onclick="clearReportFilters()">Clear</button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-3" style="margin-bottom: 24px;">
        ${renderKpi('Active Job Openings', `${data.activeJobs}<span class="kpi-max">/ ${data.totalJobs}</span>`, 'Current Fill Rate', data.fillRate, '#2563eb')}
        ${renderKpi('Total Workload (Hrs)', `${formatNumber(data.workloadHours)}<span class="kpi-max">/ ${formatNumber(data.budgetHours)}</span>`, 'Budget Consumption', data.budgetUsage, '#f59e0b', 'kpi-card-warning')}
        ${renderKpi('Total TAs Hired', data.hired, 'Pending Admin Reviews', data.pendingJobs, '#4f46e5')}
      </div>

      <div class="grid grid-cols-2" style="margin-bottom: 24px;">
        <div class="card">
          <div class="card-header"><h3 class="card-title">Recruitment Pipeline</h3></div>
          <div class="card-content">${renderBars([
            ['Applications', data.totalApplications],
            ['Approved', data.hired],
            ['Pending jobs', data.pendingJobs],
            ['Open jobs', data.activeJobs]
          ])}</div>
        </div>
        <div class="card">
          <div class="card-header"><h3 class="card-title">Workload Allocation by Dept</h3></div>
          <div class="card-content">${renderDepartmentRows(data.departmentHours)}</div>
        </div>
      </div>
    `;
  } catch (error) {
    content.innerHTML = renderError(error);
  }
}

function renderKpi(label, value, progressLabel, percent, color, extraClass = '') {
  const width = Math.max(0, Math.min(100, Number(percent) || 0));
  return `
    <div class="kpi-card ${extraClass}">
      <div class="kpi-header">
        <div class="kpi-info">
          <p class="kpi-label">${label}</p>
          <h3 class="kpi-value">${value}</h3>
        </div>
      </div>
      <div class="kpi-progress">
        <div class="kpi-progress-info">
          <span>${progressLabel}</span>
          <span class="kpi-progress-value">${percent}${typeof percent === 'number' ? '%' : ''}</span>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width: ${width}%; background: ${color};"></div></div>
      </div>
    </div>
  `;
}

function renderBars(items) {
  const max = Math.max(1, ...items.map((item) => Number(item[1]) || 0));
  return `<div class="chart-placeholder" style="height: 288px; padding: 24px;">${items.map(([label, value]) => `
    <div style="margin-bottom: 18px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #374151; font-size: 13px;">
        <span>${label}</span><strong>${value}</strong>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width: ${(value / max) * 100}%; background: #1e293b;"></div></div>
    </div>
  `).join('')}</div>`;
}

function renderDepartmentRows(departments = {}) {
  const entries = Object.entries(departments);
  if (!entries.length) return '<p class="chart-note">No workload records yet.</p>';
  const max = Math.max(1, ...entries.map(([, value]) => Number(value) || 0));
  return `<div class="chart-placeholder" style="height: 288px; padding: 24px;">${entries.map(([department, hours]) => `
    <div style="margin-bottom: 18px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #374151; font-size: 13px;">
        <span>${department}</span><strong>${formatNumber(hours)}h</strong>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width: ${(hours / max) * 100}%; background: #2563eb;"></div></div>
    </div>
  `).join('')}</div>`;
}

function renderLoading() {
  return '<div class="card"><div class="card-content">Loading admin dashboard...</div></div>';
}

function renderError(error) {
  return `<div class="card"><div class="card-content">Failed to load admin data: ${error.message}</div></div>`;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 1 });
}

async function exportAdminReport() {
  collectReportFilters();
  const [dashboard, recruitment, workload, users, auditLogs, report] = await Promise.all([
    adminDashboardData || API.admin.getDashboard(),
    API.admin.getRecruitment(),
    API.admin.getWorkload(),
    API.admin.getUsers({}),
    API.admin.getAuditLogs(),
    API.admin.getReport(reportFilters)
  ]);

  const rows = [
    ['Section', 'Metric', 'Value', 'Extra'],
    ['Overview', 'Active Job Openings', dashboard.activeJobs, `Total jobs: ${dashboard.totalJobs}`],
    ['Overview', 'Fill Rate', `${dashboard.fillRate}%`, ''],
    ['Overview', 'Total Workload Hours', dashboard.workloadHours, `Budget hours: ${dashboard.budgetHours}`],
    ['Overview', 'Budget Usage', `${dashboard.budgetUsage}%`, ''],
    ['Overview', 'Total TAs Hired', dashboard.hired, ''],
    ['Overview', 'Pending Admin Reviews', dashboard.pendingJobs, ''],
    ['Filtered Report', 'Jobs', report.summary.jobs, JSON.stringify(report.filters)],
    ['Filtered Report', 'Applications', report.summary.applications, ''],
    ['Filtered Report', 'Approved Applications', report.summary.approved, ''],
    ['Filtered Report', 'Timesheet Hours', report.summary.hours, ''],
    ...((report.rows || []).map(row => ['Filtered Job', row.title, `${row.hours || 0}h`, `${row.department} / ${row.status} / applicants ${row.applicants}`])),
    ...Object.entries(dashboard.departmentHours || {}).map(([department, hours]) => ['Department Hours', department, hours, '']),
    ...((recruitment.jobs || []).map(job => ['Recruitment', job.moduleName || job.title, job.status, `Slots: ${job.taSlots || 0}`])),
    ...((workload.rows || []).map(row => ['Workload', row.name, `${row.weeklyHours || 0}h`, row.status || ''])),
    ...((workload.exceptions || []).map(item => ['Workload Exception', item.studentName || item.name || item.id, item.aiRecommendation || item.reason || '', item.status || ''])),
    ...((users.mos || []).map(user => ['User', user.name, 'mo', user.status])),
    ...((users.tas || []).map(user => ['User', user.name, 'student', user.status])),
    ...((auditLogs || []).slice(0, 20).map(log => ['Audit', log.action, log.actorName, log.detail || '']))
  ];

  downloadCsv(rows, `admin-report-${new Date().toISOString().slice(0, 10)}.csv`);
}

function collectReportFilters() {
  reportFilters.department = document.getElementById('reportDepartment')?.value.trim() || reportFilters.department || '';
  reportFilters.status = document.getElementById('reportStatus')?.value.trim() || reportFilters.status || '';
  reportFilters.from = document.getElementById('reportFrom')?.value || reportFilters.from || '';
  reportFilters.to = document.getElementById('reportTo')?.value || reportFilters.to || '';
}

function applyReportFilters() {
  collectReportFilters();
  loadDashboardContent();
}

function clearReportFilters() {
  reportFilters.department = '';
  reportFilters.status = '';
  reportFilters.from = '';
  reportFilters.to = '';
  loadDashboardContent();
}

function downloadCsv(rows, filename) {
  const csv = rows.map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
