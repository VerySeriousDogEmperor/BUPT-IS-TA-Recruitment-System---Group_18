// Mock Data
const quickComments = [
    "非常准时", "沟通顺畅", "工作认真", "需要改进", 
    "表现优秀", "Very Punctual", "Excellent Communication", "Hard Working"
];

const mockTimesheets = [
    {
        id: "ts1",
        taName: "Zhang Wei",
        taId: "2021110001",
        moduleCode: "COMP3011",
        week: "Week 8",
        hoursLogged: 12,
        submittedDate: "2 hours ago",
        status: "pending",
        tasks: ["Lab Session 1", "Lab Session 2", "Office Hours", "Grading Assignments"],
        rating: 0,
        comment: ""
    },
    {
        id: "ts2",
        taName: "Li Ming",
        taId: "2021110002",
        moduleCode: "COMP3012",
        week: "Week 8",
        hoursLogged: 8,
        submittedDate: "5 hours ago",
        status: "pending",
        tasks: ["Lab Session", "Office Hours", "Email Support"],
        rating: 0,
        comment: ""
    },
    {
        id: "ts3",
        taName: "Wang Fang",
        taId: "2021110003",
        moduleCode: "COMP3011",
        week: "Week 8",
        hoursLogged: 10,
        submittedDate: "1 day ago",
        status: "approved",
        tasks: ["Lab Session 1", "Lab Session 2", "Grading"],
        rating: 5,
        comment: "表现优秀",
        hoursApproved: 10
    },
    {
        id: "ts4",
        taName: "Chen Jie",
        taId: "2021110004",
        moduleCode: "COMP3013",
        week: "Week 8",
        hoursLogged: 6,
        submittedDate: "1 day ago",
        status: "approved",
        tasks: ["Lab Session", "Office Hours"],
        rating: 4,
        comment: "Very Punctual",
        hoursApproved: 6
    },
    {
        id: "ts5",
        taName: "Liu Yang",
        taId: "2021110005",
        moduleCode: "COMP3012",
        week: "Week 8",
        hoursLogged: 15,
        submittedDate: "3 hours ago",
        status: "pending",
        tasks: ["Lab Session 1", "Lab Session 2", "Lab Session 3", "Office Hours", "Grading", "Email Support"],
        rating: 0,
        comment: ""
    },
    {
        id: "ts6",
        taName: "Zhao Min",
        taId: "2021110006",
        moduleCode: "COMP3011",
        week: "Week 8",
        hoursLogged: 7,
        submittedDate: "2 days ago",
        status: "rejected",
        tasks: ["Lab Session", "Office Hours"],
        rating: 0,
        comment: ""
    }
];

// State
let timesheets = [...mockTimesheets];
let activeTab = "pending";
let expandedCards = new Set();

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    updateStats();
    renderTimesheets();
});

// Setup Tabs
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTab = btn.dataset.tab;
            renderTimesheets();
        });
    });
}

// Update Stats
function updateStats() {
    const pending = timesheets.filter(t => t.status === 'pending');
    const approved = timesheets.filter(t => t.status === 'approved');
    const uniqueTAs = new Set(timesheets.map(t => t.taId));
    
    const pendingHours = pending.reduce((sum, t) => sum + t.hoursLogged, 0);
    const approvedHours = approved.reduce((sum, t) => sum + (t.hoursApproved || 0), 0);
    
    document.getElementById('pendingCount').textContent = pending.length;
    document.getElementById('pendingHours').textContent = pendingHours + 'h';
    document.getElementById('approvedHours').textContent = approvedHours + 'h';
    document.getElementById('activeTAs').textContent = uniqueTAs.size;
    document.getElementById('pendingBadge').textContent = pending.length;
}

// Detect Anomalies
function detectAnomalies() {
    const pending = timesheets.filter(t => t.status === 'pending');
    if (pending.length === 0) return new Set();
    
    const avgHours = pending.reduce((sum, t) => sum + t.hoursLogged, 0) / pending.length;
    const threshold = avgHours * 1.5;
    
    return new Set(
        pending
            .filter(t => t.hoursLogged > threshold)
            .map(t => t.id)
    );
}

// Render Timesheets
function renderTimesheets() {
    const container = document.getElementById('timesheetsList');
    const emptyState = document.getElementById('emptyState');
    
    let filtered = timesheets;
    if (activeTab !== 'all') {
        filtered = timesheets.filter(t => t.status === activeTab);
    }
    
    if (filtered.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    container.style.display = 'flex';
    emptyState.style.display = 'none';
    
    const anomalies = detectAnomalies();
    const pending = timesheets.filter(t => t.status === 'pending');
    const avgHours = pending.length > 0 
        ? pending.reduce((sum, t) => sum + t.hoursLogged, 0) / pending.length 
        : 0;
    
    container.innerHTML = filtered.map(sheet => 
        renderTimesheetCard(sheet, anomalies.has(sheet.id), avgHours)
    ).join('');
    
    // Re-initialize Lucide icons
    lucide.createIcons();
    
    // Setup event listeners
    setupCardListeners();
}

// Render Timesheet Card
function renderTimesheetCard(sheet, isAnomaly, avgHours) {
    const initials = sheet.taName.split(' ').map(n => n[0]).join('');
    const isExpanded = expandedCards.has(sheet.id);
    
    let statusClass = '';
    let statusIcon = '';
    let statusText = '';
    
    if (sheet.status === 'approved') {
        statusClass = 'approved';
        statusIcon = 'check-circle-2';
        statusText = 'Approved';
    } else if (sheet.status === 'rejected') {
        statusClass = 'rejected';
        statusIcon = 'x-circle';
        statusText = 'Rejected';
    } else {
        statusClass = 'pending';
        statusIcon = 'alert-circle';
        statusText = 'Pending';
    }
    
    return `
        <div class="timesheet-card ${statusClass}" data-id="${sheet.id}">
            <div class="timesheet-header" onclick="toggleCard('${sheet.id}')">
                <div class="ta-info">
                    <div class="ta-avatar">${initials}</div>
                    <div class="ta-details">
                        <div class="ta-name-row">
                            <span class="ta-name">${sheet.taName}</span>
                            <span class="ta-id">${sheet.taId}</span>
                            ${isAnomaly ? `
                                <span class="anomaly-badge">
                                    <i data-lucide="sparkles"></i>
                                    Anomaly Detected
                                </span>
                            ` : ''}
                        </div>
                        <div class="ta-meta">
                            <span class="ta-meta-item">
                                <i data-lucide="book-open"></i>
                                ${sheet.moduleCode}
                            </span>
                            <span class="ta-meta-item">
                                <i data-lucide="calendar"></i>
                                ${sheet.week}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="timesheet-right">
                    <div class="hours-info">
                        <div class="hours-logged">
                            <i data-lucide="clock"></i>
                            ${sheet.hoursLogged}h logged
                        </div>
                        <div class="submitted-date">Submitted ${sheet.submittedDate}</div>
                    </div>
                    
                    <div class="status-badge ${statusClass}">
                        <i data-lucide="${statusIcon}"></i>
                        ${statusText}
                    </div>
                    
                    <i data-lucide="chevron-down" class="expand-icon ${isExpanded ? 'expanded' : ''}"></i>
                </div>
            </div>
            
            <div class="timesheet-body ${isExpanded ? 'expanded' : ''}">
                ${isAnomaly ? `
                    <div class="anomaly-alert">
                        <i data-lucide="sparkles"></i>
                        <p><strong>AI 工时异常检测：</strong>该 TA 本次提交 <strong>${sheet.hoursLogged}h</strong>，超过当前批次平均工时 (${avgHours.toFixed(1)}h) 的 150%，请重点核实任务清单是否与实际相符。</p>
                    </div>
                ` : ''}
                
                <div class="tasks-section">
                    <div class="section-label">
                        <i data-lucide="message-square"></i>
                        Tasks Completed
                    </div>
                    <div class="tasks-list">
                        ${sheet.tasks.map(task => `<span class="task-tag">${task}</span>`).join('')}
                    </div>
                </div>
                
                ${sheet.status === 'pending' ? `
                    <div class="rating-section">
                        <div class="rating-row">
                            <div class="section-label">
                                <i data-lucide="star"></i>
                                Performance Rating
                            </div>
                            <div class="star-rating" data-sheet-id="${sheet.id}">
                                ${[1, 2, 3, 4, 5].map(star => `
                                    <i data-lucide="star" class="star ${sheet.rating >= star ? 'filled' : ''}" 
                                       data-star="${star}" onclick="setRating('${sheet.id}', ${star})"></i>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="comment-section">
                            <div class="section-label">Quick Comment</div>
                            <div class="quick-comments">
                                ${quickComments.map(comment => `
                                    <button class="quick-comment-btn ${sheet.comment === comment ? 'selected' : ''}" 
                                            onclick="selectQuickComment('${sheet.id}', '${comment}')">
                                        ${comment}
                                    </button>
                                `).join('')}
                            </div>
                            <input type="text" class="comment-input" 
                                   placeholder="Or type a custom comment..." 
                                   value="${sheet.comment}"
                                   onchange="setComment('${sheet.id}', this.value)">
                        </div>
                        
                        <div class="action-buttons">
                            <button class="btn-reject" onclick="rejectTimesheet('${sheet.id}')">
                                <i data-lucide="x-circle"></i>
                                Reject
                            </button>
                            <button class="btn-approve" onclick="approveTimesheet('${sheet.id}')">
                                <i data-lucide="check-circle-2"></i>
                                Approve ${sheet.hoursLogged}h
                            </button>
                        </div>
                    </div>
                ` : ''}
                
                ${sheet.status === 'approved' && sheet.rating ? `
                    <div class="approved-rating">
                        <div class="rating-stars">
                            ${[1, 2, 3, 4, 5].map(star => `
                                <i data-lucide="star" style="color: ${sheet.rating >= star ? '#F59E0B' : '#CBD5E1'}; 
                                   fill: ${sheet.rating >= star ? '#F59E0B' : 'none'};"></i>
                            `).join('')}
                        </div>
                        ${sheet.comment ? `<span class="rating-comment">"${sheet.comment}"</span>` : ''}
                        <span class="approved-hours">Approved ${sheet.hoursApproved}h</span>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Setup Card Listeners
function setupCardListeners() {
    // Star hover effects
    document.querySelectorAll('.star-rating').forEach(container => {
        const stars = container.querySelectorAll('.star');
        stars.forEach((star, index) => {
            star.addEventListener('mouseenter', () => {
                stars.forEach((s, i) => {
                    if (i <= index) {
                        s.style.color = '#F59E0B';
                        s.style.fill = '#F59E0B';
                    } else {
                        s.style.color = '#CBD5E1';
                        s.style.fill = 'none';
                    }
                });
            });
        });
        
        container.addEventListener('mouseleave', () => {
            const sheetId = container.dataset.sheetId;
            const sheet = timesheets.find(t => t.id === sheetId);
            stars.forEach((s, i) => {
                if (i < sheet.rating) {
                    s.style.color = '#F59E0B';
                    s.style.fill = '#F59E0B';
                } else {
                    s.style.color = '#CBD5E1';
                    s.style.fill = 'none';
                }
            });
        });
    });
}

// Toggle Card Expansion
function toggleCard(id) {
    if (expandedCards.has(id)) {
        expandedCards.delete(id);
    } else {
        expandedCards.add(id);
    }
    renderTimesheets();
}

// Set Rating
function setRating(id, rating) {
    const sheet = timesheets.find(t => t.id === id);
    if (sheet) {
        sheet.rating = rating;
        renderTimesheets();
    }
}

// Select Quick Comment
function selectQuickComment(id, comment) {
    const sheet = timesheets.find(t => t.id === id);
    if (sheet) {
        sheet.comment = comment;
        renderTimesheets();
    }
}

// Set Comment
function setComment(id, comment) {
    const sheet = timesheets.find(t => t.id === id);
    if (sheet) {
        sheet.comment = comment;
    }
}

// Approve Timesheet
function approveTimesheet(id) {
    const sheet = timesheets.find(t => t.id === id);
    if (sheet) {
        sheet.status = 'approved';
        sheet.hoursApproved = sheet.hoursLogged;
        expandedCards.delete(id);
        updateStats();
        renderTimesheets();
    }
}

// Reject Timesheet
function rejectTimesheet(id) {
    const sheet = timesheets.find(t => t.id === id);
    if (sheet) {
        sheet.status = 'rejected';
        expandedCards.delete(id);
        updateStats();
        renderTimesheets();
    }
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
