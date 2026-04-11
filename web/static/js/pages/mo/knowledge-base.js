// Mock Data
const suggestedQuestions = [
    "What is the TA budget per module?",
    "How do I submit a module edit request?",
    "What are the recruitment deadlines for Sem 1 2026?",
    "What happens if my budget is overrun?"
];

const mockDocuments = [
    {
        id: "d1",
        name: "TA_Handbook_2026.pdf",
        size: "2.4 MB",
        lastSynced: "2 hours ago",
        status: "vectorized",
        db: "public",
        preview: "This handbook outlines the responsibilities, expectations, and guidelines for all Teaching Assistants at BUPT IS. TAs are expected to attend all scheduled lab sessions, provide timely feedback on assignments, and maintain a professional standard of conduct..."
    },
    {
        id: "d2",
        name: "Grading_Policy_v3.pdf",
        size: "1.1 MB",
        lastSynced: "1 day ago",
        status: "vectorized",
        db: "public",
        preview: "Grading rubrics must be submitted to the module organiser no later than Week 2 of term. All assignment scores should be normalised against the module mean. Appeals must be lodged within 5 business days of grade release..."
    },
    {
        id: "d3",
        name: "Lab_Safety_Guidelines.pdf",
        size: "0.8 MB",
        lastSynced: "3 days ago",
        status: "processing",
        db: "public",
        preview: ""
    },
    {
        id: "d4",
        name: "Admin_Approval_SOP.pdf",
        size: "1.7 MB",
        lastSynced: "12 days ago",
        status: "vectorized",
        db: "internal",
        preview: "Standard Operating Procedure for Module Organisers — Admin Approval Workflow. Step 1: MO submits module creation or edit request via the portal. Step 2: Admin reviews the request within 3 business days. Step 3: Upon approval, the module becomes active and visible to students..."
    },
    {
        id: "d5",
        name: "Budget_Allocation_Rules.pdf",
        size: "0.9 MB",
        lastSynced: "5 days ago",
        status: "vectorized",
        db: "internal",
        preview: "Each module is allocated a base TA budget of 80 hours per semester. Additional hours may be requested via the Module Edit Request form, subject to departmental budget availability. Budget overruns must be flagged to Admin within 48 hours of detection..."
    },
    {
        id: "d6",
        name: "Recruitment_Timeline_2026.pdf",
        size: "0.5 MB",
        lastSynced: "8 days ago",
        status: "vectorized",
        db: "internal",
        preview: "Semester 1 2026 recruitment opens on 1 March and closes 31 March. MOs must post all positions by Week 2. Shortlisting should be completed by Week 4, and offers made no later than Week 6. Late postings require Dean's Office approval..."
    }
];

const ragResponses = [
    {
        keywords: ["budget", "hours", "allocation", "cost", "overrun", "预算"],
        answer: "Each module is allocated a **base budget of 80 TA hours per semester**.\n\nKey rules:\n- Additional hours must be requested via the **Module Edit Request** form\n- Requests are subject to departmental budget availability and require Admin approval\n- Budget overruns must be reported to Admin **within 48 hours** of detection\n- Unused hours do not carry over to the next semester\n\nTo request a budget increase, navigate to **My Modules → Request Edit** and specify the additional hours needed with a justification.",
        sources: ["Budget_Allocation_Rules.pdf"]
    },
    {
        keywords: ["approval", "sop", "workflow", "submit", "process", "admin", "审批", "流程"],
        answer: "The **Admin Approval Workflow** for module changes follows this SOP:\n\n1. **MO submits** a module creation or edit request via the portal\n2. **Admin reviews** within **3 business days**\n3. On approval → module becomes **Active** and visible in My Modules\n4. On rejection → MO receives an Admin note explaining the reason\n\n**Important:** MOs cannot directly create or edit modules. All changes must go through this approval process. Draft requests are visible under **My Modules → My Requests** tab.",
        sources: ["Admin_Approval_SOP.pdf"]
    },
    {
        keywords: ["recruitment", "timeline", "deadline", "posting", "shortlist", "offer", "招聘", "时间"],
        answer: "**Semester 1 2026 Recruitment Timeline:**\n\n| Milestone | Date |\n|-----------|------|\n| Recruitment opens | 1 March 2026 |\n| Recruitment closes | 31 March 2026 |\n| All positions posted by | End of Week 2 |\n| Shortlisting complete | End of Week 4 |\n| Offers made | No later than Week 6 |\n\n⚠️ Late postings require **Dean's Office approval**. Make sure to submit your job postings early to avoid complications.",
        sources: ["Recruitment_Timeline_2026.pdf"]
    },
    {
        keywords: ["request", "module", "edit", "new", "create", "add", "申请"],
        answer: "To **request a new module or edit an existing one**:\n\n1. Go to **My Modules** in the sidebar\n2. Click **\"Request New Module\"** (top-right) or **\"Request Edit\"** on an existing module card\n3. Fill in the required details and submit\n4. Your request enters **Pending Review** status\n5. Admin will process it within 3 business days\n\nYou can track all your requests under the **\"My Requests\"** tab on the My Modules page. Approved requests will automatically appear as Active modules.",
        sources: ["Admin_Approval_SOP.pdf", "Budget_Allocation_Rules.pdf"]
    }
];

// State
let documents = [...mockDocuments];
let messages = [];
let activeTab = "internal";
let searchQuery = "";
let isStreaming = false;
let streamTimer = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updateCounts();
    renderDocuments();
    renderSuggestedQuestions();
});

// Setup Event Listeners
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTab = btn.dataset.tab;
            
            // Toggle panels
            if (activeTab === 'internal') {
                document.getElementById('internalPanel').style.display = 'flex';
                document.getElementById('publicPanel').style.display = 'none';
            } else {
                document.getElementById('internalPanel').style.display = 'none';
                document.getElementById('publicPanel').style.display = 'block';
            }
            
            renderDocuments();
        });
    });

    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderDocuments();
    });

    // Upload zone
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');

    uploadZone.addEventListener('click', () => fileInput.click());
    
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragging');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragging');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragging');
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleFileUpload(file);
    });

    // Chat input
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');

    chatInput.addEventListener('input', () => {
        sendBtn.disabled = !chatInput.value.trim() || isStreaming;
        lucide.createIcons();
    });

    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (chatInput.value.trim() && !isStreaming) {
                sendMessage(chatInput.value.trim());
            }
        }
    });

    sendBtn.addEventListener('click', () => {
        if (chatInput.value.trim() && !isStreaming) {
            sendMessage(chatInput.value.trim());
        }
    });

    // Clear chat
    document.getElementById('clearChat').addEventListener('click', () => {
        messages = [];
        renderMessages();
    });

    // Modal overlay click
    document.getElementById('previewModal').addEventListener('click', (e) => {
        if (e.target.id === 'previewModal') {
            closePreview();
        }
    });
}

// Update Counts
function updateCounts() {
    const internal = documents.filter(d => d.db === 'internal');
    const publicDocs = documents.filter(d => d.db === 'public');
    const vectorized = documents.filter(d => d.status === 'vectorized');

    document.getElementById('internalValue').textContent = internal.length;
    document.getElementById('publicValue').textContent = publicDocs.length;
    document.getElementById('vectorizedValue').textContent = vectorized.length;
    document.getElementById('indexedCount').textContent = vectorized.length;
    
    document.getElementById('internalCountTab').textContent = internal.length;
    document.getElementById('publicCountTab').textContent = publicDocs.length;
    document.getElementById('internalListCount').textContent = internal.filter(d => d.name.toLowerCase().includes(searchQuery)).length;
    document.getElementById('vectorizedCountChat').textContent = internal.filter(d => d.status === 'vectorized').length;
}

// Render Documents
function renderDocuments() {
    const internalFiltered = documents.filter(d => d.db === 'internal' && d.name.toLowerCase().includes(searchQuery));
    const publicFiltered = documents.filter(d => d.db === 'public' && d.name.toLowerCase().includes(searchQuery));
    
    // Render internal docs
    const internalContainer = document.getElementById('internalDocsList');
    if (internalFiltered.length === 0) {
        internalContainer.innerHTML = `
            <div class="empty-docs">
                <i data-lucide="database"></i>
                <p>No documents found</p>
            </div>
        `;
    } else {
        internalContainer.innerHTML = internalFiltered.map(doc => renderDocRow(doc, false)).join('');
    }
    
    // Render public docs
    const publicContainer = document.getElementById('publicDocsList');
    if (publicFiltered.length === 0) {
        publicContainer.innerHTML = `
            <div class="empty-docs">
                <i data-lucide="book-open"></i>
                <p>No public documents yet</p>
            </div>
        `;
    } else {
        publicContainer.innerHTML = publicFiltered.map(doc => renderDocRow(doc, true)).join('');
    }
    
    updateCounts();
    lucide.createIcons();
}

// Handle File Upload
function handleFileUpload(file) {
    const newDoc = {
        id: `d${Date.now()}`,
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        lastSynced: "just now",
        status: "processing",
        db: "public",
        preview: ""
    };

    documents.unshift(newDoc);
    updateCounts();
    renderDocuments();
    showToast(`${file.name} is being vectorized`);

    // Simulate processing completion
    setTimeout(() => {
        const doc = documents.find(d => d.id === newDoc.id);
        if (doc) {
            doc.status = "vectorized";
            renderDocuments();
        }
    }, 3000);
}

// Preview Document
function previewDocument(id) {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;

    document.getElementById('modalTitle').textContent = doc.name;
    document.getElementById('modalSubtitle').textContent = `${doc.size} · ${doc.lastSynced}`;
    
    const statusHTML = `
        <div class="status-chip ${doc.status}">
            <i data-lucide="${doc.status === 'vectorized' ? 'check-circle-2' : doc.status === 'processing' ? 'refresh-cw' : 'alert-circle'}"></i>
            ${doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
        </div>
    `;
    document.getElementById('modalStatus').innerHTML = statusHTML;

    const bodyHTML = doc.preview ? `
        <div class="preview-label">
            <i data-lucide="zoom-in"></i>
            Excerpt Preview
        </div>
        <div class="preview-content">${doc.preview}</div>
    ` : `
        <div class="processing-state">
            <i data-lucide="refresh-cw"></i>
            <p>Still being processed…</p>
        </div>
    `;
    document.getElementById('modalBody').innerHTML = bodyHTML;

    document.getElementById('previewModal').style.display = 'flex';
    lucide.createIcons();
}

// Close Preview
function closePreview() {
    document.getElementById('previewModal').style.display = 'none';
}

// Delete Document
function deleteDocument(id) {
    if (confirm('Are you sure you want to delete this document?')) {
        documents = documents.filter(d => d.id !== id);
        updateCounts();
        renderDocuments();
    }
}

// Show Toast
function showToast(message) {
    document.getElementById('toastMessage').textContent = message;
    document.getElementById('toast').style.display = 'flex';
    lucide.createIcons();

    setTimeout(() => {
        closeToast();
    }, 4000);
}

// Close Toast
function closeToast() {
    document.getElementById('toast').style.display = 'none';
}

// Render Suggested Questions
function renderSuggestedQuestions() {
    const container = document.getElementById('suggestedQuestions');
    container.innerHTML = suggestedQuestions.map(q => `
        <button class="suggested-question" onclick="sendMessage('${q}')">
            <i data-lucide="corner-down-right"></i>
            ${q}
        </button>
    `).join('');
    lucide.createIcons();
}

// Send Message
function sendMessage(text) {
    const chatInput = document.getElementById('chatInput');
    chatInput.value = '';
    document.getElementById('sendBtn').disabled = true;

    // Add user message
    messages.push({
        id: `u-${Date.now()}`,
        role: 'user',
        content: text
    });

    // Add assistant placeholder
    const assistantId = `a-${Date.now()}`;
    messages.push({
        id: assistantId,
        role: 'assistant',
        content: '',
        streaming: true,
        sources: []
    });

    isStreaming = true;
    renderMessages();

    // Get response
    const response = getMockResponse(text);
    
    // Simulate streaming
    setTimeout(() => {
        streamText(response.answer, response.sources, assistantId);
    }, 600);
}

// Get Mock Response
function getMockResponse(query) {
    const lower = query.toLowerCase();
    for (const r of ragResponses) {
        if (r.keywords.some(k => lower.includes(k))) {
            return { answer: r.answer, sources: r.sources };
        }
    }

    const internalDocs = documents.filter(d => d.db === 'internal');
    return {
        answer: `I searched across all **${internalDocs.length} internal documents** but couldn't find a specific answer to your query.\n\nYou might want to:\n- Rephrase your question with more specific keywords\n- Check the **document list** on the left and preview relevant files directly\n- Contact Admin for clarification on policies not covered in current documentation\n\nIndexed documents: Admin_Approval_SOP.pdf, Budget_Allocation_Rules.pdf, Recruitment_Timeline_2026.pdf`,
        sources: []
    };
}

// Stream Text
function streamText(fullText, sources, msgId) {
    let index = 0;
    const chars = fullText.split('');

    const tick = () => {
        index += Math.floor(Math.random() * 5) + 3;
        const partial = chars.slice(0, Math.min(index, chars.length)).join('');
        const done = index >= chars.length;

        const msg = messages.find(m => m.id === msgId);
        if (msg) {
            msg.content = partial;
            msg.streaming = !done;
            if (done) msg.sources = sources;
        }

        renderMessages();

        if (!done) {
            streamTimer = setTimeout(tick, 18);
        } else {
            isStreaming = false;
            document.getElementById('sendBtn').disabled = false;
            lucide.createIcons();
        }
    };

    tick();
}

// Render Messages
function renderMessages() {
    const container = document.getElementById('chatMessages');
    const clearBtn = document.getElementById('clearChat');

    if (messages.length === 0) {
        container.innerHTML = `
            <div class="empty-chat">
                <div class="empty-icon">
                    <i data-lucide="sparkles"></i>
                </div>
                <p>Ask me anything about internal policies</p>
                <p class="subtitle">I'll search across all indexed internal documents</p>
                <div class="suggested-questions" id="suggestedQuestions"></div>
            </div>
        `;
        clearBtn.style.display = 'none';
        renderSuggestedQuestions();
        lucide.createIcons();
        return;
    }

    clearBtn.style.display = 'block';

    container.innerHTML = messages.map(msg => {
        if (msg.role === 'user') {
            return `
                <div class="message user">
                    <div class="message-avatar">
                        <i data-lucide="user"></i>
                    </div>
                    <div class="message-content">
                        <div class="message-bubble">${msg.content}</div>
                    </div>
                </div>
            `;
        } else {
            let content = msg.content;
            if (msg.streaming && content === '') {
                content = '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';
            } else {
                content = formatMarkdown(content);
                if (msg.streaming) {
                    content += '<span class="cursor"></span>';
                }
            }

            return `
                <div class="message assistant">
                    <div class="message-avatar">
                        <i data-lucide="sparkles"></i>
                    </div>
                    <div class="message-content">
                        <div class="message-bubble">${content}</div>
                        ${!msg.streaming && msg.sources && msg.sources.length > 0 ? `
                            <div class="message-sources">
                                ${msg.sources.map(s => `
                                    <span class="source-tag" onclick="previewDocumentByName('${s}')">
                                        <i data-lucide="file-text"></i>
                                        ${s}
                                    </span>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }
    }).join('');

    lucide.createIcons();
    container.scrollTop = container.scrollHeight;
}

// Format Markdown (simplified)
function formatMarkdown(text) {
    // Bold
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Code
    text = text.replace(/`([^`]+)`/g, '<code style="background: #F1F5F9; color: #7C3AED; padding: 2px 4px; border-radius: 4px; font-size: 11px;">$1</code>');
    
    // Line breaks
    text = text.replace(/\n/g, '<br>');
    
    return text;
}

// Preview Document by Name
function previewDocumentByName(name) {
    const doc = documents.find(d => d.name === name);
    if (doc) {
        previewDocument(doc.id);
    }
}


// Render Document Row
function renderDocRow(doc, canDelete) {
    const statusIcon = doc.status === 'vectorized' ? 'check-circle-2' : doc.status === 'processing' ? 'refresh-cw' : 'alert-circle';
    
    return `
        <div class="doc-row" onclick="previewDocument('${doc.id}')">
            <div class="doc-icon ${doc.db}">
                <i data-lucide="file-text"></i>
            </div>
            <div class="doc-info">
                <div class="doc-name">${doc.name}</div>
                <div class="doc-meta">
                    <i data-lucide="clock"></i>
                    ${doc.lastSynced} · ${doc.size}
                </div>
            </div>
            <div class="status-chip ${doc.status}">
                <i data-lucide="${statusIcon}"></i>
                ${doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
            </div>
            <div class="doc-actions" onclick="event.stopPropagation()">
                <button class="doc-action-btn" onclick="previewDocument('${doc.id}')" title="Preview">
                    <i data-lucide="eye"></i>
                </button>
                <button class="doc-action-btn" title="Download">
                    <i data-lucide="download"></i>
                </button>
                ${canDelete ? `
                    <button class="doc-action-btn delete" onclick="deleteDocument('${doc.id}')" title="Delete">
                        <i data-lucide="trash-2"></i>
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}


// Logout function
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
        sessionStorage.clear();
        window.location.href = '/login.html';
    }
}
