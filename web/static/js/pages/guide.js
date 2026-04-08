/**
 * Guide Page - 应用指南页面逻辑
 */

const steps = [
  {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="8.5" cy="7" r="4"></circle>
      <line x1="20" y1="8" x2="20" y2="14"></line>
      <line x1="23" y1="11" x2="17" y2="11"></line>
    </svg>`,
    title: '1. Register & Login',
    description: 'Create your account using your BUPT email or student ID. Complete your profile with basic information.',
    tips: [
      'Use your official BUPT email for verification',
      'Choose a strong password',
      'Complete profile setup for better job matching'
    ]
  },
  {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>`,
    title: '2. Prepare Your Resume',
    description: 'Upload your PDF resume or use our standard form builder. Optionally, use AI to polish your experience descriptions.',
    tips: [
      'Highlight relevant coursework and grades',
      'Include teaching or tutoring experience',
      'Use the AI polish feature for professional language'
    ]
  },
  {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8"></circle>
      <path d="m21 21-4.35-4.35"></path>
    </svg>`,
    title: '3. Browse & Search Positions',
    description: 'Explore available TA positions using filters and search. Save your favorite positions for later review.',
    tips: [
      'Use filters to narrow down positions by type and category',
      'Check the time conflict warnings',
      'Read job descriptions carefully'
    ]
  },
  {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 11l3 3L22 4"></path>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
    </svg>`,
    title: '4. Upload Your Schedule',
    description: 'Import your course schedule to enable automatic conflict detection. The system will warn you about time conflicts.',
    tips: [
      'Export your schedule in CSV format',
      'Update schedule when courses change',
      'System automatically marks conflicting positions'
    ]
  },
  {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>`,
    title: '5. Submit Applications',
    description: 'Apply to positions that match your skills and schedule. Track application status in your dashboard.',
    tips: [
      'Apply to multiple positions to increase chances',
      'Use AI assistant for questions about policies',
      'Practice with mock interviews'
    ]
  },
  {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="8" r="7"></circle>
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
    </svg>`,
    title: '6. Interview & Selection',
    description: 'If selected, you\'ll receive an interview invitation. Prepare using our AI mock interview feature.',
    tips: [
      'Check your notification center regularly',
      'Use mock interview feature to practice',
      'Respond to interview invitations promptly'
    ]
  }
];

const mockResponses = [
  "Based on the TA recruitment policy, you need to maintain a GPA above 3.5 and have completed the relevant course with grade A or above.",
  "For schedule conflicts, our system automatically detects overlaps between your course schedule and TA shift times. You can upload your schedule in the Profile page.",
  "The application deadline varies by position. Most positions for the Spring 2026 semester close in early April. I recommend applying as early as possible.",
  "TA positions typically require 8-12 hours per week. The exact hours depend on the specific position and are listed in the job description.",
  "You can apply to multiple positions simultaneously. However, make sure you don't have time conflicts and can commit to the required hours.",
  "Interview invitations are sent via email and displayed in your notification center. Most interviews are conducted in early March.",
  "The salary ranges from 100-160 CNY per hour depending on the position complexity and required qualifications.",
  "Yes, you can use the Mock Interview feature in the AI Assistant section to practice common TA interview questions."
];

let messages = [];
let isTyping = false;

/**
 * 渲染步骤
 */
function renderSteps() {
  const container = document.getElementById('stepsContainer');
  
  container.innerHTML = steps.map(step => `
    <div class="step-card">
      <div class="step-content">
        <div class="step-icon">
          ${step.icon}
        </div>
        <div class="step-body">
          <h3 class="step-title">${step.title}</h3>
          <p class="step-description">${step.description}</p>
          <div class="step-tips">
            <p class="step-tips-title">Pro Tips:</p>
            <ul class="step-tips-list">
              ${step.tips.map(tip => `
                <li class="step-tip-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                  <span>${tip}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * 格式化时间
 */
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * 渲染消息
 */
function renderMessages() {
  const container = document.getElementById('chatMessages');
  
  container.innerHTML = messages.map(msg => `
    <div class="message ${msg.role}">
      <div class="message-avatar ${msg.role === 'user' ? 'user' : 'bot'}">
        ${msg.role === 'user' ? `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        ` : `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="10" rx="2"></rect>
            <circle cx="12" cy="5" r="2"></circle>
            <path d="M12 7v4"></path>
            <line x1="8" y1="16" x2="8" y2="16"></line>
            <line x1="16" y1="16" x2="16" y2="16"></line>
          </svg>
        `}
      </div>
      <div class="message-content">
        <div class="message-bubble">${msg.content}</div>
        <span class="message-time">${formatTime(msg.timestamp)}</span>
      </div>
    </div>
  `).join('');
  
  // 添加打字指示器
  if (isTyping) {
    container.innerHTML += `
      <div class="typing-indicator">
        <div class="message-avatar bot">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="10" rx="2"></rect>
            <circle cx="12" cy="5" r="2"></circle>
            <path d="M12 7v4"></path>
            <line x1="8" y1="16" x2="8" y2="16"></line>
            <line x1="16" y1="16" x2="16" y2="16"></line>
          </svg>
        </div>
        <div class="typing-bubble">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
  }
  
  // 滚动到底部
  container.scrollTop = container.scrollHeight;
}

/**
 * 发送消息
 */
function sendMessage() {
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const message = input.value.trim();
  
  if (!message || isTyping) return;
  
  // 添加用户消息
  messages.push({
    role: 'user',
    content: message,
    timestamp: new Date()
  });
  
  input.value = '';
  input.disabled = true;
  sendBtn.disabled = true;
  isTyping = true;
  
  renderMessages();
  
  // 模拟AI响应延迟
  setTimeout(() => {
    const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    
    messages.push({
      role: 'assistant',
      content: response,
      timestamp: new Date()
    });
    
    isTyping = false;
    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
    
    renderMessages();
  }, 1000 + Math.random() * 1000);
}

/**
 * 初始化
 */
document.addEventListener('DOMContentLoaded', () => {
  // 渲染步骤
  renderSteps();
  
  // 添加初始消息
  messages.push({
    role: 'assistant',
    content: 'Hello! I\'m your TA application assistant. I can help you with questions about the application process, requirements, deadlines, and more. How can I assist you today?',
    timestamp: new Date()
  });
  
  renderMessages();
  
  // 绑定发送按钮
  const sendBtn = document.getElementById('sendBtn');
  const input = document.getElementById('chatInput');
  
  sendBtn.addEventListener('click', sendMessage);
  
  // 绑定回车键
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
});
