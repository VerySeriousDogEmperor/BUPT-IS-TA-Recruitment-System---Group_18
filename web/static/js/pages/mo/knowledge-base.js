const suggestedQuestions = [
  'What is the TA budget per module?',
  'How do I submit a module edit request?',
  'What are the recruitment deadlines?',
  'What happens if my budget is overrun?'
];

let documents = [];
let messages = [];
let activeTab = 'internal';
let searchQuery = '';
let isStreaming = false;

document.addEventListener('DOMContentLoaded', async () => {
  const currentUser = await ensureMOAuth();
  if (!currentUser) return;

  setupEventListeners();
  await loadDocuments();
  renderSuggestedQuestions();
});

function setupEventListeners() {
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-button').forEach(item => item.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.dataset.tab;
      document.getElementById('internalPanel').style.display = activeTab === 'internal' ? 'flex' : 'none';
      document.getElementById('publicPanel').style.display = activeTab === 'public' ? 'block' : 'none';
      renderDocuments();
    });
  });

  document.getElementById('searchInput').addEventListener('input', event => {
    searchQuery = event.target.value.toLowerCase();
    renderDocuments();
  });

  const uploadZone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('fileInput');
  uploadZone.addEventListener('click', () => fileInput.click());
  uploadZone.addEventListener('dragover', event => {
    event.preventDefault();
    uploadZone.classList.add('dragging');
  });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragging'));
  uploadZone.addEventListener('drop', event => {
    event.preventDefault();
    uploadZone.classList.remove('dragging');
    if (event.dataTransfer.files[0]) handleFileUpload(event.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', event => {
    if (event.target.files[0]) handleFileUpload(event.target.files[0]);
  });

  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  chatInput.addEventListener('input', () => {
    sendBtn.disabled = !chatInput.value.trim() || isStreaming;
  });
  chatInput.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (chatInput.value.trim() && !isStreaming) sendMessage(chatInput.value.trim());
    }
  });
  sendBtn.addEventListener('click', () => {
    if (chatInput.value.trim() && !isStreaming) sendMessage(chatInput.value.trim());
  });
  document.getElementById('clearChat').addEventListener('click', () => {
    messages = [];
    renderMessages();
  });
  document.getElementById('previewModal').addEventListener('click', event => {
    if (event.target.id === 'previewModal') closePreview();
  });
}

async function loadDocuments() {
  try {
    documents = await API.knowledge.getList();
    renderDocuments();
  } catch (error) {
    showToast(`Failed to load documents: ${error.message}`);
  }
}

function updateCounts() {
  const internal = documents.filter(doc => doc.db === 'internal');
  const publicDocs = documents.filter(doc => doc.db === 'public');
  const vectorized = documents.filter(doc => doc.status === 'vectorized');
  setText('internalValue', internal.length);
  setText('publicValue', publicDocs.length);
  setText('vectorizedValue', vectorized.length);
  setText('indexedCount', vectorized.length);
  setText('internalCountTab', internal.length);
  setText('publicCountTab', publicDocs.length);
  setText('internalListCount', internal.filter(matchesSearch).length);
  setText('vectorizedCountChat', internal.filter(doc => doc.status === 'vectorized').length);
}

function renderDocuments() {
  const internal = documents.filter(doc => doc.db === 'internal' && matchesSearch(doc));
  const publicDocs = documents.filter(doc => doc.db === 'public' && matchesSearch(doc));
  document.getElementById('internalDocsList').innerHTML = internal.length ? internal.map(doc => renderDocRow(doc, false)).join('') : emptyDocs('No internal documents found');
  document.getElementById('publicDocsList').innerHTML = publicDocs.length ? publicDocs.map(doc => renderDocRow(doc, true)).join('') : emptyDocs('No public documents found');
  updateCounts();
  if (window.lucide) lucide.createIcons();
}

function renderDocRow(doc, canDelete) {
  return `
    <div class="doc-row" onclick="previewDocument('${doc.id}')">
      <div class="doc-icon ${doc.db}"><i data-lucide="file-text"></i></div>
      <div class="doc-info">
        <div class="doc-name">${doc.name}</div>
        <div class="doc-meta">${formatSyncedAt(doc.syncedAt)} - ${doc.size || '-'}</div>
      </div>
      <div class="status-chip ${doc.status}">${doc.status}</div>
      <div class="doc-actions" onclick="event.stopPropagation()">
        <button class="doc-action-btn" onclick="previewDocument('${doc.id}')" title="Preview"><i data-lucide="eye"></i></button>
        ${canDelete ? `<button class="doc-action-btn delete" onclick="deleteDocument('${doc.id}')" title="Delete"><i data-lucide="trash-2"></i></button>` : ''}
      </div>
    </div>
  `;
}

async function handleFileUpload(file) {
  const documentData = {
    name: file.name,
    size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
    db: activeTab === 'internal' ? 'internal' : 'public',
    status: 'vectorized',
    preview: `Uploaded file ${file.name}. Content extraction is represented by metadata in this JSON-backed demo.`
  };
  try {
    const created = await API.knowledge.create(documentData);
    documents.unshift(created);
    renderDocuments();
    showToast(`${file.name} was added to the knowledge base`);
  } catch (error) {
    showToast(`Upload failed: ${error.message}`);
  }
}

function previewDocument(id) {
  const doc = documents.find(item => item.id === id);
  if (!doc) return;
  setText('modalTitle', doc.name);
  setText('modalSubtitle', `${doc.size || '-'} - ${formatSyncedAt(doc.syncedAt)}`);
  document.getElementById('modalStatus').innerHTML = `<div class="status-chip ${doc.status}">${doc.status}</div>`;
  document.getElementById('modalBody').innerHTML = doc.preview
    ? `<div class="preview-label">Excerpt Preview</div><div class="preview-content">${doc.preview}</div>`
    : '<div class="processing-state"><p>No preview available.</p></div>';
  document.getElementById('previewModal').style.display = 'flex';
}

function closePreview() {
  document.getElementById('previewModal').style.display = 'none';
}

async function deleteDocument(id) {
  if (!confirm('Delete this document from the knowledge base?')) return;
  try {
    await API.knowledge.delete(id);
    documents = documents.filter(doc => doc.id !== id);
    renderDocuments();
  } catch (error) {
    showToast(`Delete failed: ${error.message}`);
  }
}

function renderSuggestedQuestions() {
  const container = document.getElementById('suggestedQuestions');
  if (!container) return;
  container.innerHTML = suggestedQuestions.map(question => `
    <button class="suggested-question" onclick="sendMessage('${question.replace(/'/g, "\\'")}')">
      <i data-lucide="corner-down-right"></i>${question}
    </button>
  `).join('');
  if (window.lucide) lucide.createIcons();
}

async function sendMessage(text) {
  const chatInput = document.getElementById('chatInput');
  chatInput.value = '';
  document.getElementById('sendBtn').disabled = true;
  messages.push({ id: `u-${Date.now()}`, role: 'user', content: text });
  isStreaming = true;
  renderMessages();

  try {
    const response = await API.ai.chat(text, 'mo-knowledge');
    messages.push({
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: response.answer || 'No answer was generated.',
      sources: response.sources || []
    });
  } catch (error) {
    messages.push({ id: `a-${Date.now()}`, role: 'assistant', content: `AI request failed: ${error.message}`, sources: [] });
  } finally {
    isStreaming = false;
    renderMessages();
  }
}

function renderMessages() {
  const container = document.getElementById('chatMessages');
  const clearBtn = document.getElementById('clearChat');
  if (!messages.length) {
    container.innerHTML = `
      <div class="empty-chat">
        <div class="empty-icon"><i data-lucide="sparkles"></i></div>
        <p>Ask me anything about internal policies</p>
        <p class="subtitle">I'll search across indexed documents</p>
        <div class="suggested-questions" id="suggestedQuestions"></div>
      </div>
    `;
    clearBtn.style.display = 'none';
    renderSuggestedQuestions();
    return;
  }
  clearBtn.style.display = 'block';
  container.innerHTML = messages.map(message => `
    <div class="message ${message.role}">
      <div class="message-avatar"><i data-lucide="${message.role === 'user' ? 'user' : 'sparkles'}"></i></div>
      <div class="message-content">
        <div class="message-bubble">${formatMarkdown(message.content)}</div>
        ${message.sources && message.sources.length ? `<div class="message-sources">${message.sources.map(source => `<span class="source-tag">${source}</span>`).join('')}</div>` : ''}
      </div>
    </div>
  `).join('');
  if (isStreaming) {
    container.innerHTML += '<div class="message assistant"><div class="message-bubble">Searching...</div></div>';
  }
  if (window.lucide) lucide.createIcons();
  container.scrollTop = container.scrollHeight;
}

function showToast(message) {
  setText('toastMessage', message);
  document.getElementById('toast').style.display = 'flex';
  setTimeout(closeToast, 4000);
}

function closeToast() {
  document.getElementById('toast').style.display = 'none';
}

function matchesSearch(doc) {
  return !searchQuery || (doc.name || '').toLowerCase().includes(searchQuery);
}

function emptyDocs(message) {
  return `<div class="empty-docs"><i data-lucide="database"></i><p>${message}</p></div>`;
}

function formatMarkdown(text) {
  return String(text || '').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
}

function formatSyncedAt(value) {
  return value ? String(value).replace('T', ' ').slice(0, 16) : 'just now';
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}
