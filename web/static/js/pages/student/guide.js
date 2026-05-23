const steps = [
  ['1. Register & Login', 'Create your account using your BUPT email or student ID. Complete your profile with basic information.'],
  ['2. Prepare Your Resume', 'Upload your PDF resume or maintain the structured resume form in your profile.'],
  ['3. Browse & Search Positions', 'Explore available TA positions using filters and search.'],
  ['4. Upload Your Schedule', 'Keep your weekly schedule current so the system can flag conflicts.'],
  ['5. Submit Applications', 'Apply to published positions and track application status in your dashboard.'],
  ['6. Interview & Selection', 'Watch for interview invitations and review offer decisions in the portal.']
];

let messages = [];
let isTyping = false;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatMessageContent(msg) {
  const body = escapeHtml(msg.content || '').replace(/\n/g, '<br>');
  const sources = Array.isArray(msg.sources) && msg.sources.length
    ? `<br><br>Sources: ${msg.sources.map(escapeHtml).join(', ')}`
    : '';
  return body + sources;
}

function renderSteps() {
  const container = document.getElementById('stepsContainer');
  if (!container) return;
  container.innerHTML = steps.map(([title, description]) => `
    <div class="step-card">
      <div class="step-content">
        <div class="step-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
        </div>
        <div class="step-body">
          <h3 class="step-title">${escapeHtml(title)}</h3>
          <p class="step-description">${escapeHtml(description)}</p>
        </div>
      </div>
    </div>
  `).join('');
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function renderMessages() {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  container.innerHTML = messages.map(msg => `
    <div class="message ${msg.role}">
      <div class="message-avatar ${msg.role === 'user' ? 'user' : 'bot'}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          ${msg.role === 'user'
            ? '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>'
            : '<rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path>'}
        </svg>
      </div>
      <div class="message-content">
        <div class="message-bubble">${formatMessageContent(msg)}</div>
        <span class="message-time">${formatTime(msg.timestamp)}</span>
      </div>
    </div>
  `).join('');

  if (isTyping) {
    container.innerHTML += `
      <div class="typing-indicator">
        <div class="typing-bubble">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
  }
  container.scrollTop = container.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const message = input.value.trim();
  if (!message || isTyping) return;

  messages.push({ role: 'user', content: message, timestamp: new Date() });
  input.value = '';
  input.disabled = true;
  sendBtn.disabled = true;
  isTyping = true;
  renderMessages();

  try {
    const response = await API.ai.chat(message, 'student-guide');
    messages.push({
      role: 'assistant',
      content: response.answer || 'No answer was generated.',
      sources: response.sources || [],
      timestamp: new Date()
    });
  } catch (error) {
    messages.push({ role: 'assistant', content: `I could not reach the assistant service: ${error.message}`, timestamp: new Date() });
  } finally {
    isTyping = false;
    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
    renderMessages();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderSteps();
  messages.push({
    role: 'assistant',
    content: 'Hello! I can answer questions using the current TA recruitment knowledge base.',
    timestamp: new Date()
  });
  renderMessages();

  const sendBtn = document.getElementById('sendBtn');
  const input = document.getElementById('chatInput');
  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  });
});
