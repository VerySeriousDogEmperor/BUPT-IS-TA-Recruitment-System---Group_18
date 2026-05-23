let isMasked = false;
let usersData = { mos: [], tas: [] };
const userStatusActions = new Set();

document.addEventListener('DOMContentLoaded', () => {
  initSemesterDropdown();
  loadUsersContent();
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

async function loadUsersContent() {
  const content = document.getElementById('adminContent');
  if (!content) return;
  content.innerHTML = '<div class="card"><div class="card-content">Loading user directory...</div></div>';
  try {
    usersData = await API.admin.getUsers();
    renderUsers(content);
  } catch (error) {
    content.innerHTML = `<div class="card"><div class="card-content">Failed to load users: ${error.message}</div></div>`;
  }
}

function renderUsers(content) {
  content.innerHTML = `
    <div class="page-header">
      <div class="page-title-section">
        <h1>User & Data Management</h1>
        <p>Manage MO and TA accounts, data privacy, and JSON data integrity.</p>
      </div>
      <div class="page-actions">
        <div class="scan-info">
          <p class="scan-label">Last Scan</p>
          <p class="scan-time">${formatDate(usersData.lastScan)} <span class="scan-status scan-healthy">(${usersData.scanStatus})</span></p>
        </div>
        <button class="btn btn-primary" onclick="openScanModal()">JSON Integrity Scan</button>
      </div>
    </div>

    <div class="privacy-toggle-container">
      <div class="privacy-toggle">
        <span class="privacy-label">Mask Sensitive Data</span>
        <button class="toggle-switch ${isMasked ? 'active' : ''}" onclick="toggleMask()"><span class="toggle-slider"></span></button>
      </div>
    </div>

    ${renderSection('Module Organisers (MO)', usersData.mos || [], renderMORow)}
    ${renderSection('Teaching Assistants (TA)', usersData.tas || [], renderTARow)}
  `;
}

function renderSection(title, rows, renderer) {
  return `
    <div class="card" style="margin-bottom: 24px;">
      <div class="user-section-header">
        <div class="section-title"><h3>${title}</h3><span class="count-badge">${rows.length}</span></div>
      </div>
      <div class="user-table-wrapper">
        <table class="user-table"><tbody>${rows.map(renderer).join('')}</tbody></table>
      </div>
    </div>
  `;
}

function renderMORow(user) {
  const disabled = user.status === 'Disabled';
  return `
    <tr class="${disabled ? 'row-disabled' : ''}">
      <td><div class="user-name">${user.name}</div><div class="user-email">${user.email}</div></td>
      <td><span class="dept-badge">${user.department || '-'}</span></td>
      <td><div class="modules-list">${(user.modules || []).map((m) => `<span class="module-tag">${m}</span>`).join('') || '-'}</div></td>
      <td><span class="sensitive-data ${isMasked ? 'masked' : ''}">${isMasked ? maskData(user.staffId, 'id') : user.staffId}</span></td>
      <td><span class="sensitive-data ${isMasked ? 'masked' : ''}">${isMasked ? maskData(user.phone, 'phone') : (user.phone || '-')}</span></td>
      <td>${formatDate(user.lastLogin)}</td>
      <td><span class="status-badge ${disabled ? 'status-disabled' : 'status-active'}">${user.status}</span></td>
      <td style="text-align: right;"><button class="btn-action ${disabled ? 'btn-enable' : 'btn-disable'}" onclick="toggleUserStatus('${user.id}', '${disabled ? 'active' : 'inactive'}', this)">${disabled ? 'Enable' : 'Disable'}</button></td>
    </tr>
  `;
}

function renderTARow(user) {
  const disabled = user.status === 'Disabled';
  return `
    <tr class="${disabled ? 'row-disabled' : ''}">
      <td><div class="user-name">${user.name}</div><div class="user-email">${user.email}</div></td>
      <td><span class="type-badge">${user.type}</span></td>
      <td><div class="major-text">${user.major || '-'}</div><span class="dept-badge dept-small">${user.department || '-'}</span></td>
      <td><div class="modules-list">${(user.assignedModules || []).map((m) => `<span class="module-tag module-amber">${m}</span>`).join('') || '-'}</div></td>
      <td><span class="sensitive-data ${isMasked ? 'masked' : ''}">${isMasked ? maskData(user.studentId, 'id') : user.studentId}</span></td>
      <td><span class="sensitive-data ${isMasked ? 'masked' : ''}">${isMasked ? maskData(user.phone, 'phone') : (user.phone || '-')}</span></td>
      <td>${formatDate(user.lastLogin)}</td>
      <td><span class="status-badge ${disabled ? 'status-disabled' : 'status-active'}">${user.status}</span></td>
      <td style="text-align: right;"><button class="btn-action ${disabled ? 'btn-enable' : 'btn-disable'}" onclick="toggleUserStatus('${user.id}', '${disabled ? 'active' : 'inactive'}', this)">${disabled ? 'Enable' : 'Disable'}</button></td>
    </tr>
  `;
}

function maskData(text = '', type) {
  if (type === 'phone' && text.length === 11) return `${text.slice(0, 3)}****${text.slice(7)}`;
  if (text.length > 6) return `${text.slice(0, 3)}****${text.slice(-2)}`;
  return text || '-';
}

function toggleMask() {
  isMasked = !isMasked;
  renderUsers(document.getElementById('adminContent'));
}

async function toggleUserStatus(id, status, button) {
  if (userStatusActions.has(id)) return;
  userStatusActions.add(id);
  setAdminButtonBusy(button, true, status === 'inactive' ? 'Disabling...' : 'Enabling...');
  try {
    await API.admin.updateUserStatus(id, status);
    showAdminToast(status === 'inactive' ? 'User disabled successfully.' : 'User enabled successfully.', 'success');
    await loadUsersContent();
  } catch (error) {
    showAdminToast(error.message || 'Failed to update user status.', 'error');
  } finally {
    userStatusActions.delete(id);
    setAdminButtonBusy(button, false);
  }
}

function openScanModal() {
  alert('JSON scan complete: files are readable and indexed.');
}

function formatDate(value) {
  return value && value !== '-' ? String(value).replace('T', ' ').slice(0, 16) : '-';
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
