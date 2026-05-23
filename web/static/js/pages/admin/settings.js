let settingsData = null;
let announcementsData = [];
let auditLogsData = [];
let showArchiveModal = false;
let editingAnnouncementId = null;
let confirmText = '';
const auditFilters = {
  action: '',
  actor: '',
  targetType: '',
  search: ''
};

document.addEventListener('DOMContentLoaded', () => {
  initSemesterDropdown();
  loadSettingsContent();
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

async function loadSettingsContent() {
  const content = document.getElementById('adminContent');
  if (!content) return;
  content.innerHTML = '<div class="card"><div class="card-content">Loading system settings...</div></div>';
  try {
    [settingsData, announcementsData, auditLogsData] = await Promise.all([
      API.admin.getSettings(),
      API.admin.getAnnouncements(),
      API.admin.getAuditLogs(auditFilters)
    ]);
    renderSettings(content);
  } catch (error) {
    content.innerHTML = `<div class="card"><div class="card-content">Failed to load settings: ${error.message}</div></div>`;
  }
}

function renderSettings(content) {
  const recruitmentOpen = Boolean(settingsData.recruitmentOpen);
  content.innerHTML = `
    <div class="page-header">
      <div class="page-title-section">
        <h1>System Settings</h1>
        <p>Manage semester lifecycle, recruitment controls, announcements, audit records, and the RAG knowledge base.</p>
      </div>
      <button class="btn btn-danger" onclick="openArchiveModal()">Archive Current Semester</button>
    </div>

    <div class="recruitment-toggle ${recruitmentOpen ? 'toggle-open' : 'toggle-closed'}">
      <div class="toggle-content">
        <div class="toggle-info">
          <h3>Recruitment Window</h3>
          <p>${recruitmentOpen ? 'Application portal is currently open.' : 'Application portal is closed.'}</p>
        </div>
      </div>
      <button class="btn ${recruitmentOpen ? 'btn-danger' : 'btn-success'}" onclick="toggleRecruitment()">
        ${recruitmentOpen ? 'Close Applications' : 'Open Applications'}
      </button>
    </div>

    <div class="settings-grid">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Semester Lifecycle</h3>
          <p class="card-subtitle">Archive snapshots are copied under resources/data/archives.</p>
        </div>
        <div class="card-content">
          <div class="rate-list">
            <input id="currentSemester" class="modal-input" style="text-align: left; margin-bottom: 0;" placeholder="Current semester" value="${escapeHtml(settingsData.currentSemester || '2026 Spring')}">
            <button class="btn btn-secondary btn-full" onclick="saveSemester()">Save Semester Label</button>
          </div>
          <div class="file-list" style="margin-top: 12px;">${(settingsData.archiveHistory || []).slice(0, 5).map(renderArchiveRow).join('') || '<p class="card-subtitle">No archived snapshots yet.</p>'}</div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">RAG Knowledge Base</h3>
          <p class="card-subtitle">Track public and internal guidance files.</p>
        </div>
        <div class="card-content">
          ${renderKbSection('Public DB (Visible to TAs)', settingsData.publicFiles || [], 'public')}
          ${renderKbSection('Internal DB (MO Only)', settingsData.internalFiles || [], 'internal')}
        </div>
      </div>
    </div>
    <div class="settings-grid" style="margin-top: 24px;">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Hierarchical Hourly Rates</h3>
          <p class="card-subtitle">Current pricing model for workload budgeting.</p>
        </div>
        <div class="card-content">
          ${renderRates(settingsData.rates || {})}
          <div class="save-section"><button class="btn btn-primary btn-full" onclick="saveRates()">Save Configurations</button></div>
        </div>
      </div>
    </div>
    <div class="settings-grid" style="margin-top: 24px;">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Announcement Management</h3>
          <p class="card-subtitle">Create notices shown on the student announcements page.</p>
        </div>
        <div class="card-content">
          ${renderAnnouncementForm()}
          <div class="file-list">${announcementsData.map(renderAnnouncementRow).join('')}</div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Audit Trail</h3>
          <p class="card-subtitle">Recent Admin actions and system changes.</p>
        </div>
        <div class="card-content">
          ${renderAuditFilters()}
          <div class="file-list">${auditLogsData.slice(0, 12).map(renderAuditLogRow).join('') || '<p class="card-subtitle">No audit events yet.</p>'}</div>
        </div>
      </div>
    </div>
    ${showArchiveModal ? renderArchiveModal() : ''}
`;
}

function renderArchiveRow(item) {
  return `
    <div class="file-row">
      <div class="file-info">
        <div class="file-details">
          <p class="file-name">${escapeHtml(item.semester || item.id)}</p>
          <p class="file-sync">${formatDateTime(item.archivedAt)} by ${escapeHtml(item.archivedBy || 'Admin')} - ${escapeHtml(item.path || '')}</p>
        </div>
      </div>
    </div>
  `;
}

function renderAuditFilters() {
  return `
    <div class="rate-list" style="margin-bottom: 16px;">
      <input id="auditSearch" class="modal-input" style="text-align: left; margin-bottom: 0;" placeholder="Search audit logs" value="${escapeHtml(auditFilters.search)}">
      <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px;">
        <input id="auditAction" class="modal-input" style="text-align: left; margin-bottom: 0;" placeholder="Action" value="${escapeHtml(auditFilters.action)}">
        <input id="auditActor" class="modal-input" style="text-align: left; margin-bottom: 0;" placeholder="Actor" value="${escapeHtml(auditFilters.actor)}">
        <input id="auditTargetType" class="modal-input" style="text-align: left; margin-bottom: 0;" placeholder="Target type" value="${escapeHtml(auditFilters.targetType)}">
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-primary" onclick="applyAuditFilters()">Apply Filters</button>
        <button class="btn btn-secondary" onclick="clearAuditFilters()">Clear</button>
        <button class="btn btn-secondary" onclick="exportAuditLogs()">Export CSV</button>
      </div>
    </div>
  `;
}

function renderAnnouncementForm() {
  const editing = announcementsData.find(item => item.id === editingAnnouncementId) || {};
  return `
    <div class="rate-list" style="margin-bottom: 16px;">
      <input id="announcementTitle" class="modal-input" style="text-align: left; margin-bottom: 0;" placeholder="Announcement title" value="${escapeHtml(editing.title || '')}">
      <input id="announcementCategory" class="modal-input" style="text-align: left; margin-bottom: 0;" placeholder="Category" value="${escapeHtml(editing.category || 'Important')}">
      <textarea id="announcementContent" class="modal-input" style="text-align: left; min-height: 88px; margin-bottom: 0;" placeholder="Announcement content">${escapeHtml(editing.content || '')}</textarea>
      <label style="display: flex; gap: 8px; align-items: center; font-size: 13px; color: #374151;">
        <input id="announcementPinned" type="checkbox" ${editing.pinned ? 'checked' : ''}> Pin this announcement
      </label>
      <button class="btn btn-primary btn-full" onclick="saveAnnouncement()">${editingAnnouncementId ? 'Update Announcement' : 'Publish Announcement'}</button>
      ${editingAnnouncementId ? '<button class="btn btn-secondary btn-full" onclick="cancelAnnouncementEdit()">Cancel Editing</button>' : ''}
    </div>
  `;
}

function renderAnnouncementRow(item) {
  return `
    <div class="file-row">
      <div class="file-info">
        <div class="file-details">
          <p class="file-name">${escapeHtml(item.title)}</p>
          <p class="file-sync">${escapeHtml(item.category)} - ${escapeHtml(item.date)}${item.pinned ? ' - pinned' : ''}</p>
        </div>
      </div>
      <div class="file-actions">
        <button class="file-remove" style="opacity: 1; color: #2563eb;" onclick="editAnnouncement('${item.id}')">Edit</button>
        <button class="file-remove" style="opacity: 1;" onclick="deleteAnnouncement('${item.id}')">Delete</button>
      </div>
    </div>
  `;
}

function renderAuditLogRow(log) {
  return `
    <div class="file-row">
      <div class="file-info">
        <div class="file-details">
          <p class="file-name">${escapeHtml(log.action)} - ${escapeHtml(log.targetType)}:${escapeHtml(log.targetId)}</p>
          <p class="file-sync">${formatDateTime(log.createdAt)} by ${escapeHtml(log.actorName)} - ${escapeHtml(log.detail || '')}</p>
        </div>
      </div>
    </div>
  `;
}

async function applyAuditFilters() {
  auditFilters.search = document.getElementById('auditSearch')?.value.trim() || '';
  auditFilters.action = document.getElementById('auditAction')?.value.trim() || '';
  auditFilters.actor = document.getElementById('auditActor')?.value.trim() || '';
  auditFilters.targetType = document.getElementById('auditTargetType')?.value.trim() || '';
  auditLogsData = await API.admin.getAuditLogs(auditFilters);
  renderSettings(document.getElementById('adminContent'));
}

async function clearAuditFilters() {
  auditFilters.search = '';
  auditFilters.action = '';
  auditFilters.actor = '';
  auditFilters.targetType = '';
  auditLogsData = await API.admin.getAuditLogs(auditFilters);
  renderSettings(document.getElementById('adminContent'));
}

function exportAuditLogs() {
  const rows = [
    ['Time', 'Actor', 'Action', 'Target Type', 'Target ID', 'Detail'],
    ...auditLogsData.map(log => [
      formatDateTime(log.createdAt),
      log.actorName || '',
      log.action || '',
      log.targetType || '',
      log.targetId || '',
      log.detail || ''
    ])
  ];
  downloadCsv(rows, `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`);
}

function renderKbSection(label, files, type) {
  const uploadId = `kbUpload-${type}`;
  const uploadClass = type === 'internal' ? ' upload-internal' : '';
  return `
    <div class="kb-section">
      <div class="kb-header"><span class="kb-label kb-${type}">${label}</span><span class="kb-count">${files.length} file(s)</span></div>
      <input id="${uploadId}" type="file" accept=".pdf,.txt,.md,.doc,.docx" style="display: none;" onchange="uploadKnowledgeFile('${type}', this.files[0]); this.value = '';">
      <div class="upload-zone${uploadClass}" onclick="document.getElementById('${uploadId}').click()" ondragover="handleKnowledgeDrag(event)" ondragleave="handleKnowledgeDragLeave(event)" ondrop="handleKnowledgeDrop(event, '${type}')">
        <p class="upload-text">Click or drag a document to upload</p>
        <p class="upload-hint">Stored as a JSON-backed knowledge record.</p>
      </div>
      <div class="file-list">${files.map(renderFileRow).join('') || '<p class="card-subtitle">No files yet.</p>'}</div>
    </div>
  `;
}

function renderFileRow(file) {
  return `
    <div class="file-row">
      <div class="file-info"><div class="file-details"><p class="file-name">${escapeHtml(file.name)}</p><p class="file-sync">Last synced: ${formatDateTime(file.syncedAt)}</p></div></div>
      <div class="file-actions">
        <span class="file-status status-vectorized">${escapeHtml(file.status || 'vectorized')}</span>
        <button class="file-remove" style="opacity: 1;" onclick="deleteKnowledgeDocument('${escapeJs(file.id)}')">Delete</button>
      </div>
    </div>
  `;
}

function handleKnowledgeDrag(event) {
  event.preventDefault();
  event.currentTarget.classList.add('dragging');
}

function handleKnowledgeDragLeave(event) {
  event.currentTarget.classList.remove('dragging');
}

function handleKnowledgeDrop(event, db) {
  event.preventDefault();
  event.currentTarget.classList.remove('dragging');
  const file = event.dataTransfer?.files?.[0];
  if (file) uploadKnowledgeFile(db, file);
}

async function uploadKnowledgeFile(db, file) {
  if (!file) return;
  const document = {
    name: file.name,
    size: formatFileSize(file.size),
    status: 'vectorized',
    db,
    preview: `${file.name} uploaded to the ${db} knowledge base from Admin settings.`
  };
  await API.admin.createKnowledgeDocument(document);
  await loadSettingsContent();
}

async function deleteKnowledgeDocument(id) {
  if (!id || !confirm('Delete this knowledge document?')) return;
  await API.admin.deleteKnowledgeDocument(id);
  await loadSettingsContent();
}

function formatFileSize(bytes) {
  const size = Number(bytes || 0);
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  if (size >= 1024) return `${Math.round(size / 1024)} KB`;
  return `${size} B`;
}

function renderRates(rates) {
  return Object.entries(rates).map(([name, value]) => `
    <div class="rate-item">
      <div class="rate-info"><h4>${name}</h4><p>Hourly rate</p></div>
      <div class="rate-input-group"><span class="rate-currency">RMB</span><input type="number" value="${value}" class="rate-input" data-rate="${name}"><span class="rate-unit">/ hr</span></div>
    </div>
  `).join('');
}

async function toggleRecruitment() {
  settingsData = await API.admin.updateSettings({ recruitmentOpen: !settingsData.recruitmentOpen });
  renderSettings(document.getElementById('adminContent'));
}

async function saveRates() {
  const rates = {};
  document.querySelectorAll('[data-rate]').forEach(input => {
    rates[input.dataset.rate] = Number(input.value || 0);
  });
  settingsData = await API.admin.updateSettings({ rates });
  renderSettings(document.getElementById('adminContent'));
}

async function saveSemester() {
  const currentSemester = document.getElementById('currentSemester')?.value.trim();
  if (!currentSemester) {
    alert('Semester label is required.');
    return;
  }
  settingsData = await API.admin.updateSettings({ currentSemester });
  renderSettings(document.getElementById('adminContent'));
}

async function saveAnnouncement() {
  const title = document.getElementById('announcementTitle').value.trim();
  const category = document.getElementById('announcementCategory').value.trim() || 'Notice';
  const content = document.getElementById('announcementContent').value.trim();
  const pinned = document.getElementById('announcementPinned').checked;
  if (!title || !content) {
    alert('Title and content are required.');
    return;
  }
  const payload = {
    title,
    category,
    content,
    pinned,
    date: editingAnnouncementId
      ? (announcementsData.find(item => item.id === editingAnnouncementId)?.date || new Date().toISOString().slice(0, 10))
      : new Date().toISOString().slice(0, 10)
  };
  if (editingAnnouncementId) {
    await API.admin.updateAnnouncement(editingAnnouncementId, payload);
    editingAnnouncementId = null;
  } else {
    await API.admin.createAnnouncement(payload);
  }
  await loadSettingsContent();
}

function editAnnouncement(id) {
  editingAnnouncementId = id;
  renderSettings(document.getElementById('adminContent'));
}

function cancelAnnouncementEdit() {
  editingAnnouncementId = null;
  renderSettings(document.getElementById('adminContent'));
}

async function deleteAnnouncement(id) {
  if (!confirm('Delete this announcement?')) return;
  await API.admin.deleteAnnouncement(id);
  if (editingAnnouncementId === id) {
    editingAnnouncementId = null;
  }
  await loadSettingsContent();
}

function openArchiveModal() {
  showArchiveModal = true;
  confirmText = '';
  renderSettings(document.getElementById('adminContent'));
}

function closeArchiveModal() {
  showArchiveModal = false;
  confirmText = '';
  renderSettings(document.getElementById('adminContent'));
}

function updateConfirmText(value) {
  confirmText = value;
  const confirmCode = getArchiveConfirmCode();
  const input = document.getElementById('confirmInput');
  const button = document.getElementById('confirmArchiveButton');
  if (input) {
    input.classList.toggle('input-valid', confirmText === confirmCode);
  }
  if (button) {
    button.disabled = confirmText !== confirmCode;
  }
}

async function confirmArchive(button) {
  const confirmCode = getArchiveConfirmCode();
  if (confirmText !== confirmCode) {
    showSettingsToast(`Type ${confirmCode} to confirm semester archive.`, 'error');
    return;
  }
  setSettingsButtonBusy(button, true, 'Archiving...');
  try {
    const result = await API.admin.archiveSemester(confirmText);
    settingsData = result.settings || settingsData;
    showSettingsToast('Semester archived successfully.', 'success');
    showArchiveModal = false;
    confirmText = '';
    await loadSettingsContent();
  } catch (error) {
    showSettingsToast(error.message || 'Failed to archive semester.', 'error');
  } finally {
    setSettingsButtonBusy(button, false);
  }
}

function renderArchiveModal() {
  const confirmCode = getArchiveConfirmCode();
  return `
    <div class="modal-overlay" onclick="closeArchiveModal()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-warning-stripe"></div>
        <div class="modal-body">
          <h3>Archive Semester Data?</h3>
          <div class="modal-warning"><p>This action will lock current semester records.</p></div>
          <p class="modal-confirm-text">To confirm, type <code>${confirmCode}</code> below.</p>
          <input type="text" id="confirmInput" placeholder='Type "${confirmCode}" to confirm' class="modal-input ${confirmText === confirmCode ? 'input-valid' : ''}" value="${escapeHtml(confirmText)}" oninput="updateConfirmText(this.value)">
          <div class="modal-actions">
            <button class="btn btn-secondary" onclick="closeArchiveModal()">Cancel</button>
            <button class="btn btn-danger" id="confirmArchiveButton" ${confirmText !== confirmCode ? 'disabled' : ''} onclick="confirmArchive(this)">Confirm Archive</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function getArchiveConfirmCode() {
  return 'ARCHIVE';
}

function setSettingsButtonBusy(button, busy, label) {
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
  button.disabled = confirmText !== getArchiveConfirmCode();
}

function showSettingsToast(message, type = 'info') {
  let toast = document.getElementById('settingsActionToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'settingsActionToast';
    toast.style.cssText = 'position:fixed;right:24px;bottom:24px;z-index:10000;max-width:360px;background:#111827;color:#fff;padding:12px 16px;border-radius:8px;box-shadow:0 16px 40px rgba(15,23,42,.22);font-size:14px;line-height:1.4;';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.borderLeft = type === 'error' ? '4px solid #dc2626' : '4px solid #059669';
  toast.style.display = 'block';
  window.clearTimeout(showSettingsToast.timer);
  showSettingsToast.timer = window.setTimeout(() => {
    toast.style.display = 'none';
  }, 3200);
}

function formatDateTime(value) {
  return value ? String(value).replace('T', ' ').slice(0, 16) : '-';
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

function escapeJs(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}
