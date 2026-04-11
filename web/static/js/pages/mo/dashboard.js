// Mock Data
const stageLabels = {
    new: "New Applicants",
    shortlisted: "Shortlisted",
    interviewing: "Interviewing",
    final_review: "Pending Admin"
};

const stageOrder = ["new", "shortlisted", "interviewing", "final_review"];

const stageColors = {
    new: { bg: "#EFF6FF", badge: "#3B82F6", dot: "#BFDBFE" },
    shortlisted: { bg: "#FFF7ED", badge: "#F97316", dot: "#FED7AA" },
    interviewing: { bg: "#F0FDF4", badge: "#22C55E", dot: "#BBF7D0" },
    final_review: { bg: "#FAF5FF", badge: "#8B5CF6", dot: "#DDD6FE" }
};

const mockCandidates = [
    {
        id: "c1",
        name: "Zhang Wei",
        studentId: "S1023045",
        avatar: "ZW",
        gpa: 3.92,
        aiMatchScore: 94,
        hasConflict: false,
        skillsMatched: true,
        stage: "new",
        moduleCode: "COMP101",
        skills: ["Python", "Data Structures"],
        aiInsights: {
            topSkills: [
                { label: "Python Programming", score: 96 },
                { label: "Algorithm Design", score: 91 }
            ]
        }
    },
    {
        id: "c2",
        name: "Priya Sharma",
        studentId: "S1034512",
        avatar: "PS",
        gpa: 3.87,
        aiMatchScore: 88,
        hasConflict: true,
        skillsMatched: true,
        stage: "new",
        moduleCode: "COMP101",
        skills: ["Java", "OOP"],
        aiInsights: {
            topSkills: [
                { label: "Java & OOP", score: 93 }
            ]
        }
    },
    {
        id: "c3",
        name: "Marcus Tan",
        studentId: "S1019876",
        avatar: "MT",
        gpa: 3.78,
        aiMatchScore: 82,
        hasConflict: false,
        skillsMatched: true,
        stage: "new",
        moduleCode: "DATA201",
        skills: ["R", "Statistics"],
        aiInsights: {
            topSkills: [
                { label: "Statistical Analysis", score: 90 }
            ]
        }
    },
    {
        id: "c4",
        name: "Aisha Rahman",
        studentId: "S1028734",
        avatar: "AR",
        gpa: 3.95,
        aiMatchScore: 96,
        hasConflict: false,
        skillsMatched: true,
        stage: "shortlisted",
        moduleCode: "COMP101",
        skills: ["Python", "C++"],
        aiInsights: {
            topSkills: [
                { label: "Python & C++", score: 97 }
            ]
        }
    },
    {
        id: "c5",
        name: "James Liu",
        studentId: "S1041023",
        avatar: "JL",
        gpa: 3.71,
        aiMatchScore: 76,
        hasConflict: true,
        skillsMatched: false,
        stage: "shortlisted",
        moduleCode: "DATA201",
        skills: ["Python", "SQL"],
        aiInsights: {
            topSkills: [
                { label: "SQL & Databases", score: 85 }
            ]
        }
    },
    {
        id: "c6",
        name: "Sofia Chen",
        studentId: "S1033287",
        avatar: "SC",
        gpa: 3.88,
        aiMatchScore: 91,
        hasConflict: false,
        skillsMatched: true,
        stage: "interviewing",
        moduleCode: "MATH201",
        skills: ["Calculus", "Linear Algebra"],
        aiInsights: {
            topSkills: [
                { label: "Advanced Calculus", score: 94 }
            ]
        }
    },
    {
        id: "c7",
        name: "David Kim",
        studentId: "S1026541",
        avatar: "DK",
        gpa: 3.83,
        aiMatchScore: 89,
        hasConflict: false,
        skillsMatched: true,
        stage: "interviewing",
        moduleCode: "COMP101",
        skills: ["Python", "Algorithms"],
        aiInsights: {
            topSkills: [
                { label: "Algorithm Design", score: 92 }
            ]
        }
    },
    {
        id: "c8",
        name: "Lily Nguyen",
        studentId: "S1039012",
        avatar: "LN",
        gpa: 3.96,
        aiMatchScore: 97,
        hasConflict: false,
        skillsMatched: true,
        stage: "final_review",
        moduleCode: "COMP101",
        skills: ["Python", "C"],
        aiInsights: {
            topSkills: [
                { label: "Python & C", score: 98 }
            ]
        }
    }
];

// State
let candidates = [...mockCandidates];
let selectedCandidate = null;
let filterHighMatch = false;
let filterNoConflict = false;
let filterModule = "all";
let newColumnRanked = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    populateModuleFilter();
    updateStats();
    renderKanban();
});

// Setup Event Listeners
function setupEventListeners() {
    document.getElementById('filterHighMatch').addEventListener('click', () => {
        filterHighMatch = !filterHighMatch;
        document.getElementById('filterHighMatch').classList.toggle('active');
        updateFilters();
    });

    document.getElementById('filterNoConflict').addEventListener('click', () => {
        filterNoConflict = !filterNoConflict;
        const btn = document.getElementById('filterNoConflict');
        btn.classList.toggle('active');
        btn.classList.toggle('green');
        updateFilters();
    });

    document.getElementById('filterModule').addEventListener('change', (e) => {
        filterModule = e.target.value;
        updateFilters();
    });

    document.getElementById('clearFilters').addEventListener('click', () => {
        filterHighMatch = false;
        filterNoConflict = false;
        filterModule = "all";
        document.getElementById('filterHighMatch').classList.remove('active');
        document.getElementById('filterNoConflict').classList.remove('active', 'green');
        document.getElementById('filterModule').value = "all";
        updateFilters();
    });
}

// Populate Module Filter
function populateModuleFilter() {
    const modules = [...new Set(candidates.map(c => c.moduleCode))];
    const select = document.getElementById('filterModule');
    modules.forEach(m => {
        const option = document.createElement('option');
        option.value = m;
        option.textContent = m;
        select.appendChild(option);
    });
}

// Update Stats
function updateStats() {
    const total = candidates.length;
    const highMatch = candidates.filter(c => c.aiMatchScore >= 80).length;
    const conflicts = candidates.filter(c => c.hasConflict).length;
    const finalReview = candidates.filter(c => c.stage === 'final_review').length;

    document.getElementById('totalApplicants').textContent = total;
    document.getElementById('highMatchCount').textContent = highMatch;
    document.getElementById('highMatchPercent').textContent = `${Math.round((highMatch / total) * 100)}% of pool`;
    document.getElementById('conflictCount').textContent = conflicts;
    document.getElementById('finalCount').textContent = finalReview;
}

// Update Filters
function updateFilters() {
    const hasFilters = filterHighMatch || filterNoConflict || filterModule !== 'all';
    document.getElementById('clearFilters').style.display = hasFilters ? 'flex' : 'none';
    renderKanban();
}

// Get Filtered Candidates
function getFilteredCandidates() {
    return candidates.filter(c => {
        if (filterHighMatch && c.aiMatchScore < 80) return false;
        if (filterNoConflict && c.hasConflict) return false;
        if (filterModule !== 'all' && c.moduleCode !== filterModule) return false;
        return true;
    });
}

// Render Kanban Board
function renderKanban() {
    const filtered = getFilteredCandidates();
    const board = document.getElementById('kanbanBoard');
    
    // Update filter count
    document.getElementById('filterCount').textContent = 
        `Showing ${filtered.length} of ${candidates.length} candidates`;
    
    // Group by stage
    const grouped = {};
    stageOrder.forEach(stage => {
        grouped[stage] = filtered.filter(c => c.stage === stage);
        // Sort new column by AI score if ranked
        if (stage === 'new' && newColumnRanked) {
            grouped[stage].sort((a, b) => b.aiMatchScore - a.aiMatchScore);
        }
    });
    
    // Render columns
    board.innerHTML = stageOrder.map(stage => renderColumn(stage, grouped[stage])).join('');
    
    lucide.createIcons();
}

// Render Column
function renderColumn(stage, candidates) {
    const colors = stageColors[stage];
    const isNewColumn = stage === 'new';
    
    return `
        <div class="kanban-column">
            <div class="column-header" style="background: ${colors.bg};">
                <div class="column-header-left">
                    <div class="column-dot" style="background: ${colors.badge};"></div>
                    <span class="column-title">${stageLabels[stage]}</span>
                </div>
                <div class="column-header-right">
                    ${isNewColumn ? `
                        <button class="ai-rank-btn ${newColumnRanked ? 'active' : 'inactive'}" 
                                onclick="toggleAIRank()" 
                                title="Sort by AI Match Score">
                            <i data-lucide="${newColumnRanked ? 'sparkles' : 'arrow-up-down'}"></i>
                            ${newColumnRanked ? 'AI Ranked ✓' : '✨ AI Rank All'}
                        </button>
                    ` : ''}
                    <span class="column-count" style="background: ${colors.badge};">
                        ${candidates.length}
                    </span>
                </div>
            </div>
            <div class="column-cards">
                ${candidates.length === 0 ? `
                    <div class="column-empty">
                        <i data-lucide="users"></i>
                        <p>No candidates in this stage</p>
                    </div>
                ` : candidates.map((c, idx) => renderCandidateCard(c, isNewColumn && newColumnRanked ? idx + 1 : null)).join('')}
            </div>
        </div>
    `;
}

// Render Candidate Card
function renderCandidateCard(candidate, rank) {
    const currentIdx = stageOrder.indexOf(candidate.stage);
    const nextStage = currentIdx < stageOrder.length - 1 ? stageOrder[currentIdx + 1] : null;
    const isFinal = candidate.stage === 'final_review';
    
    return `
        <div class="candidate-card" onclick="openDrawer('${candidate.id}')">
            ${rank ? `<div class="rank-badge">${rank}</div>` : ''}
            
            <div class="card-top">
                <div class="card-avatar-section">
                    <div class="card-avatar">${candidate.avatar}</div>
                    <div>
                        <div class="card-name">${candidate.name}</div>
                        <div class="card-id">${candidate.studentId}</div>
                    </div>
                </div>
                <div class="card-ai-score">
                    <span class="card-ai-label">AI</span>
                    <span class="card-ai-value">${candidate.aiMatchScore}%</span>
                </div>
            </div>
            
            <div class="card-module-row">
                <span class="card-module-badge">${candidate.moduleCode}</span>
                <span class="card-gpa">GPA ${candidate.gpa}</span>
            </div>
            
            <div class="card-tags">
                ${candidate.hasConflict ? `
                    <span class="card-tag conflict">
                        <i data-lucide="alert-triangle"></i>
                        Conflict
                    </span>
                ` : ''}
                ${candidate.skillsMatched && !candidate.hasConflict ? `
                    <span class="card-tag matched">
                        <i data-lucide="check-circle-2"></i>
                        Full Match
                    </span>
                ` : ''}
                ${candidate.aiInsights.topSkills[0] ? `
                    <span class="card-tag skill">
                        <i data-lucide="sparkles"></i>
                        ${candidate.aiInsights.topSkills[0].label.split(' ')[0]}
                    </span>
                ` : ''}
            </div>
            
            <div class="card-actions" onclick="event.stopPropagation()">
                <button class="card-btn-reject" onclick="rejectCandidate('${candidate.id}')">
                    <i data-lucide="x"></i>
                    Reject
                </button>
                ${nextStage ? `
                    <button class="card-btn-move" onclick="moveCandidate('${candidate.id}', 'forward')">
                        Move to ${stageLabels[nextStage]}
                        <i data-lucide="chevron-right"></i>
                    </button>
                ` : `
                    <button class="card-btn-move final" onclick="moveCandidate('${candidate.id}', 'forward')">
                        <i data-lucide="check-circle-2"></i>
                        Send Offer
                    </button>
                `}
            </div>
        </div>
    `;
}

// Toggle AI Rank
function toggleAIRank() {
    newColumnRanked = !newColumnRanked;
    renderKanban();
}

// Move Candidate
function moveCandidate(id, direction) {
    const candidate = candidates.find(c => c.id === id);
    if (!candidate) return;
    
    if (direction === 'forward') {
        const currentIdx = stageOrder.indexOf(candidate.stage);
        if (currentIdx < stageOrder.length - 1) {
            candidate.stage = stageOrder[currentIdx + 1];
        }
    }
    
    renderKanban();
    updateStats();
}

// Reject Candidate
function rejectCandidate(id) {
    if (confirm('Are you sure you want to reject this candidate?')) {
        candidates = candidates.filter(c => c.id !== id);
        renderKanban();
        updateStats();
    }
}

// Open Drawer
function openDrawer(id) {
    const candidate = candidates.find(c => c.id === id);
    if (!candidate) return;
    
    selectedCandidate = candidate;
    
    // Render drawer content
    document.getElementById('drawerHeaderContent').innerHTML = `
        <div style="display: flex; align-items: center; gap: 16px;">
            <div class="card-avatar" style="width: 48px; height: 48px; font-size: 16px;">
                ${candidate.avatar}
            </div>
            <div>
                <div style="font-size: 18px; font-weight: 600; margin-bottom: 4px;">
                    ${candidate.name}
                </div>
                <div style="font-size: 14px; opacity: 0.8;">
                    ${candidate.studentId} · ${candidate.moduleCode} · GPA ${candidate.gpa}
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('drawerBody').innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 24px;">
            <div>
                <h3 style="font-size: 14px; color: #64748B; margin-bottom: 12px;">AI Match Score</h3>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="flex: 1; height: 8px; background: #F1F5F9; border-radius: 999px; overflow: hidden;">
                        <div style="width: ${candidate.aiMatchScore}%; height: 100%; background: linear-gradient(90deg, #8B5CF6, #6D28D9);"></div>
                    </div>
                    <span style="font-size: 18px; font-weight: 700; color: #7C3AED;">${candidate.aiMatchScore}%</span>
                </div>
            </div>
            
            <div>
                <h3 style="font-size: 14px; color: #64748B; margin-bottom: 12px;">Top Skills</h3>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${candidate.aiInsights.topSkills.map(skill => `
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 13px; color: #475569;">${skill.label}</span>
                            <span style="font-size: 13px; font-weight: 600; color: #8B5CF6;">${skill.score}%</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div>
                <h3 style="font-size: 14px; color: #64748B; margin-bottom: 12px;">Skills</h3>
                <div style="display: flex; flex-wrap: gap: 8px;">
                    ${candidate.skills.map(skill => `
                        <span style="padding: 6px 12px; background: #F5F3FF; color: #7C3AED; border-radius: 8px; font-size: 12px;">
                            ${skill}
                        </span>
                    `).join('')}
                </div>
            </div>
            
            ${candidate.hasConflict ? `
                <div style="padding: 12px; background: #FEE2E2; border: 1px solid #FCA5A5; border-radius: 12px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                        <i data-lucide="alert-triangle" style="width: 16px; height: 16px; color: #DC2626;"></i>
                        <span style="font-size: 14px; font-weight: 600; color: #DC2626;">Schedule Conflict Detected</span>
                    </div>
                    <p style="font-size: 13px; color: #991B1B;">This candidate has scheduling conflicts that need to be resolved.</p>
                </div>
            ` : ''}
        </div>
    `;
    
    const currentIdx = stageOrder.indexOf(candidate.stage);
    const nextStage = currentIdx < stageOrder.length - 1 ? stageOrder[currentIdx + 1] : null;
    
    document.getElementById('drawerFooter').innerHTML = `
        <button class="drawer-btn drawer-btn-reject" onclick="rejectCandidate('${candidate.id}'); closeDrawer();">
            <i data-lucide="x"></i>
            Reject
        </button>
        ${nextStage ? `
            <button class="drawer-btn drawer-btn-move" onclick="moveCandidate('${candidate.id}', 'forward'); closeDrawer();">
                Move to ${stageLabels[nextStage]}
                <i data-lucide="chevron-right"></i>
            </button>
        ` : `
            <button class="drawer-btn drawer-btn-move" onclick="moveCandidate('${candidate.id}', 'forward'); closeDrawer();">
                <i data-lucide="check-circle-2"></i>
                Send Offer
            </button>
        `}
    `;
    
    document.getElementById('drawerOverlay').classList.add('open');
    document.getElementById('drawer').classList.add('open');
    
    lucide.createIcons();
}

// Close Drawer
function closeDrawer() {
    document.getElementById('drawerOverlay').classList.remove('open');
    document.getElementById('drawer').classList.remove('open');
    selectedCandidate = null;
}


// Logout function
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear any stored auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
        sessionStorage.clear();
        
        // Redirect to login page
        window.location.href = '/login.html';
    }
}
