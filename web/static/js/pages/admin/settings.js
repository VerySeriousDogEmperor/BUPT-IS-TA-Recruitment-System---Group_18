// RAG Settings Page Logic

let recruitmentOpen = true;
let showArchiveModal = false;
let confirmText = '';

const CONFIRM_CODE = 'SP26';

const PUBLIC_FILES = [
    { id: 'pub-1', name: 'TA_Handbook_2026.pdf', syncedAt: '2 hours ago', status: 'Vectorized' },
    { id: 'pub-2', name: 'Grading_Policy_v3.pdf', syncedAt: '1 day ago', status: 'Vectorized' }
];

const INTERNAL_FILES = [
    { id: 'int-1', name: 'Admin_Approval_SOP.pdf', syncedAt: '12 days ago', status: 'Vectorized' },
    { id: 'int-2', name: 'Budget_Allocation_Rules.pdf', syncedAt: '5 days ago', status: 'Processing' }
];

document.addEventListener('DOMContentLoaded', function() {
    initSemesterDropdown();
    loadSettingsContent();
});

function initSemesterDropdown() {
    const button = document.getElementById('semesterButton');
    const menu = document.getElementById('semesterMenu');
    
    if (!button || !menu) return;

    button.addEventListener('click', function(e) {
        e.stopPropagation();
        menu.classList.toggle('active');
    });

    document.addEventListener('click', function() {
        menu.classList.remove('active');
    });

    const options = menu.querySelectorAll('.semester-option');
    options.forEach(option => {
        option.addEventListener('click', function() {
            const label = this.textContent.trim();
            button.querySelector('.semester-label').textContent = `Current Semester: ${label}`;
            options.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            menu.classList.remove('active');
        });
    });
}

function loadSettingsContent() {
    const content = document.getElementById('adminContent');
    if (!content) return;

    content.innerHTML = `
        <div class="page-header">
            <div class="page-title-section">
                <h1>System Configuration</h1>
                <p>Manage global settings, RAG knowledge bases, and semester lifecycle.</p>
            </div>
            <button class="btn btn-danger" onclick="openArchiveModal()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="21 8 21 21 3 21 3 8" stroke-width="2"/>
                    <rect x="1" y="3" width="22" height="5" stroke-width="2"/>
                    <line x1="10" y1="12" x2="14" y2="12" stroke-width="2"/>
                </svg>
                Archive Current Semester
            </button>
        </div>

        <!-- Recruitment Window Toggle -->
        <div class="recruitment-toggle ${recruitmentOpen ? 'toggle-open' : 'toggle-closed'}">
            <div class="toggle-content">
                <div class="toggle-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        ${recruitmentOpen ? 
                            '<line x1="8" y1="6" x2="21" y2="6" stroke-width="2"/><line x1="8" y1="12" x2="21" y2="12" stroke-width="2"/><line x1="8" y1="18" x2="21" y2="18" stroke-width="2"/><line x1="3" y1="6" x2="3.01" y2="6" stroke-width="2"/><line x1="3" y1="12" x2="3.01" y2="12" stroke-width="2"/><line x1="3" y1="18" x2="3.01" y2="18" stroke-width="2"/>' :
                            '<circle cx="12" cy="12" r="10" stroke-width="2"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke-width="2"/>'
                        }
                    </svg>
                </div>
                <div class="toggle-info">
                    <h3>Recruitment Window</h3>
                    <p>${recruitmentOpen ? 
                        'Application portal is currently open. Students can submit TA applications.' :
                        'Application portal is closed. No new submissions are accepted.'
                    }</p>
                </div>
            </div>
            <button class="btn ${recruitmentOpen ? 'btn-danger' : 'btn-success'}" onclick="toggleRecruitment()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    ${recruitmentOpen ?
                        '<rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke-width="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke-width="2"/>' :
                        '<line x1="8" y1="6" x2="21" y2="6" stroke-width="2"/><line x1="8" y1="12" x2="21" y2="12" stroke-width="2"/><line x1="8" y1="18" x2="21" y2="18" stroke-width="2"/><line x1="3" y1="6" x2="3.01" y2="6" stroke-width="2"/><line x1="3" y1="12" x2="3.01" y2="12" stroke-width="2"/><line x1="3" y1="18" x2="3.01" y2="18" stroke-width="2"/>'
                    }
                </svg>
                ${recruitmentOpen ? 'Close Applications' : 'Open Applications'}
            </button>
        </div>

        <!-- Main Grid -->
        <div class="settings-grid">
            <!-- RAG Knowledge Base -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">RAG Knowledge Base</h3>
                    <p class="card-subtitle">Upload PDF guidelines for the AI assistant. Files are auto-vectorised for semantic search.</p>
                </div>
                <div class="card-content">
                    <!-- Public DB -->
                    <div class="kb-section">
                        <div class="kb-header">
                            <span class="kb-label kb-public">Public DB (Visible to TAs)</span>
                            <span class="kb-count">${PUBLIC_FILES.length} file(s)</span>
                        </div>
                        <div class="upload-zone">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke-width="2"/>
                                <polyline points="17 8 12 3 7 8" stroke-width="2"/>
                                <line x1="12" y1="3" x2="12" y2="15" stroke-width="2"/>
                            </svg>
                            <p class="upload-text">Click or drag PDF to upload</p>
                            <p class="upload-hint">e.g., TA_Handbook_2026.pdf</p>
                        </div>
                        <div class="file-list">
                            ${PUBLIC_FILES.map(f => renderFileRow(f, 'public')).join('')}
                        </div>
                    </div>

                    <!-- Internal DB -->
                    <div class="kb-section">
                        <div class="kb-header">
                            <span class="kb-label kb-internal">Internal DB (MO Only)</span>
                            <span class="kb-count">${INTERNAL_FILES.length} file(s)</span>
                        </div>
                        <div class="upload-zone upload-internal">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke-width="2"/>
                                <polyline points="17 8 12 3 7 8" stroke-width="2"/>
                                <line x1="12" y1="3" x2="12" y2="15" stroke-width="2"/>
                            </svg>
                            <p class="upload-text">Upload internal MO document</p>
                            <p class="upload-hint">e.g., Admin_Approval_SOP.pdf</p>
                        </div>
                        <div class="file-list">
                            ${INTERNAL_FILES.map(f => renderFileRow(f, 'internal')).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Hourly Rates -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Hierarchical Hourly Rates</h3>
                    <p class="card-subtitle">Set granular pricing models for workload budgeting.</p>
                </div>
                <div class="card-content">
                    <div class="rate-list">
                        <div class="rate-item rate-general">
                            <div class="rate-info">
                                <h4>General TA</h4>
                                <p>Standard grading and lab sessions</p>
                            </div>
                            <div class="rate-input-group">
                                <span class="rate-currency">¥</span>
                                <input type="number" value="40" class="rate-input">
                                <span class="rate-unit">/ hr</span>
                            </div>
                        </div>

                        <div class="rate-item rate-senior">
                            <div class="rate-info">
                                <h4>Senior Seminar TA</h4>
                                <p>Discussion lead & advanced tutoring</p>
                            </div>
                            <div class="rate-input-group">
                                <span class="rate-currency">¥</span>
                                <input type="number" value="65" class="rate-input">
                                <span class="rate-unit">/ hr</span>
                            </div>
                        </div>

                        <div class="rate-item rate-supervisor">
                            <div class="rate-info">
                                <h4>Lab Supervisor</h4>
                                <p>Equipment oversight & safety protocols</p>
                            </div>
                            <div class="rate-input-group">
                                <span class="rate-currency">¥</span>
                                <input type="number" value="55" class="rate-input">
                                <span class="rate-unit">/ hr</span>
                            </div>
                        </div>
                    </div>

                    <p class="rate-note">Changes will affect future workload calculations. Existing records remain unchanged.</p>

                    <div class="save-section">
                        <button class="btn btn-primary btn-full">Save Configurations</button>
                    </div>
                </div>
            </div>
        </div>

        ${showArchiveModal ? renderArchiveModal() : ''}
    `;
}

function renderFileRow(file, type) {
    const iconColor = type === 'internal' ? '#f59e0b' : '#f43f5e';
    
    return `
        <div class="file-row">
            <div class="file-info">
                <svg class="file-icon" viewBox="0 0 24 24" fill="none" stroke="${iconColor}">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" stroke-width="2"/>
                    <polyline points="13 2 13 9 20 9" stroke-width="2"/>
                </svg>
                <div class="file-details">
                    <p class="file-name">${file.name}</p>
                    <p class="file-sync">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke-width="2"/>
                            <line x1="16" y1="2" x2="16" y2="6" stroke-width="2"/>
                            <line x1="8" y1="2" x2="8" y2="6" stroke-width="2"/>
                            <line x1="3" y1="10" x2="21" y2="10" stroke-width="2"/>
                        </svg>
                        Last synced: ${file.syncedAt}
                    </p>
                </div>
            </div>
            <div class="file-actions">
                ${renderFileStatus(file.status)}
                <button class="file-remove" onclick="removeFile('${file.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <polyline points="3 6 5 6 21 6" stroke-width="2"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke-width="2"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
}

function renderFileStatus(status) {
    if (status === 'Vectorized') {
        return `
            <span class="file-status status-vectorized">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" stroke-width="2"/>
                </svg>
                Vectorized
            </span>
        `;
    } else if (status === 'Processing') {
        return `
            <span class="file-status status-processing">
                <span class="spinner"></span>
                Processing
            </span>
        `;
    }
    return `<span class="file-status status-pending">Pending</span>`;
}

function renderArchiveModal() {
    return `
        <div class="modal-overlay" onclick="closeArchiveModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-warning-stripe"></div>
                <div class="modal-body">
                    <div class="modal-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke-width="2"/>
                            <line x1="12" y1="9" x2="12" y2="13" stroke-width="2"/>
                            <line x1="12" y1="17" x2="12.01" y2="17" stroke-width="2"/>
                        </svg>
                    </div>
                    <h3>Archive Semester Data?</h3>
                    <div class="modal-warning">
                        <p>This action will lock all JSON records and is irreversible.</p>
                    </div>
                    <p class="modal-description">
                        All recruitment data, workload records, and user activity for the current semester will be archived and made read-only.
                    </p>
                    <p class="modal-confirm-text">
                        To confirm, type <code>${CONFIRM_CODE}</code> below.
                    </p>
                    <input 
                        type="text" 
                        id="confirmInput" 
                        placeholder='Type "${CONFIRM_CODE}" to confirm'
                        class="modal-input ${confirmText === CONFIRM_CODE ? 'input-valid' : ''}"
                        value="${confirmText}"
                        oninput="updateConfirmText(this.value)"
                    >
                    <div class="modal-actions">
                        <button class="btn btn-secondary" onclick="closeArchiveModal()">Cancel</button>
                        <button class="btn btn-danger" ${confirmText !== CONFIRM_CODE ? 'disabled' : ''} onclick="confirmArchive()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <polyline points="21 8 21 21 3 21 3 8" stroke-width="2"/>
                                <rect x="1" y="3" width="22" height="5" stroke-width="2"/>
                                <line x1="10" y1="12" x2="14" y2="12" stroke-width="2"/>
                            </svg>
                            Confirm Archive
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function toggleRecruitment() {
    recruitmentOpen = !recruitmentOpen;
    loadSettingsContent();
}

function removeFile(id) {
    alert(`Remove file: ${id}`);
}

function openArchiveModal() {
    showArchiveModal = true;
    confirmText = '';
    loadSettingsContent();
}

function closeArchiveModal() {
    showArchiveModal = false;
    confirmText = '';
    loadSettingsContent();
}

function updateConfirmText(value) {
    confirmText = value;
    loadSettingsContent();
}

function confirmArchive() {
    if (confirmText === CONFIRM_CODE) {
        alert('Semester archived successfully!');
        closeArchiveModal();
    }
}
