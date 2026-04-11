// Mock Data
const mockCandidates = [
    {
        id: "c1",
        name: "Zhang Wei",
        studentId: "S1023045",
        email: "zhangwei@university.edu",
        avatar: "ZW",
        gpa: 3.92,
        aiMatchScore: 94,
        hasConflict: false,
        skillsMatched: true,
        stage: "new",
        appliedFor: "Teaching Assistant",
        moduleCode: "COMP101",
        skills: ["Python", "Data Structures", "Communication", "Grading"],
        aiInsights: {
            topSkills: [
                { label: "Python Programming", score: 96 },
                { label: "Algorithm Design", score: 91 },
                { label: "Student Mentoring", score: 88 }
            ],
            taExperience: "2 semesters as TA for COMP101 where student received consistent 4.8/5.0 ratings. Proactively created supplementary materials used by 120+ students.",
            interviewQuestions: [
                "How would you explain recursion to a student who has never encountered it before?",
                "Describe a situation where a student was struggling — how did you handle it?"
            ],
            strengthSummary: "Exceptional technical foundation combined with strong communication. AI analysis indicates 94% role compatibility."
        },
        resumeData: {
            education: "B.Sc. Computer Science, Year 3 — GPA 3.92/4.0",
            experience: [
                { role: "TA Intern", org: "COMP101", duration: "Sem 1, 2024", desc: "Conducted 3 weekly lab sessions" }
            ],
            awards: ["Dean's List 2023", "Best TA Award (Sem 2, 2023)"]
        },
        appliedDate: "2026-03-10"
    },
    {
        id: "c2",
        name: "Priya Sharma",
        studentId: "S1034512",
        email: "priya.s@university.edu",
        avatar: "PS",
        gpa: 3.87,
        aiMatchScore: 88,
        hasConflict: true,
        conflictDetails: "Thursday 2–4pm lecture overlap with MATH201",
        skillsMatched: true,
        stage: "new",
        appliedFor: "Teaching Assistant",
        moduleCode: "COMP101",
        skills: ["Java", "OOP", "Python", "Peer Tutoring"],
        aiInsights: {
            topSkills: [
                { label: "Java & OOP", score: 93 },
                { label: "Peer Teaching", score: 85 }
            ],
            taExperience: "First-time TA applicant but has 1 year of peer tutoring experience.",
            interviewQuestions: [
                "This role requires Thursday afternoon availability — can you confirm your schedule?"
            ],
            strengthSummary: "Strong Java expertise and proven peer teaching background. Schedule conflict requires resolution."
        },
        resumeData: {
            education: "B.Sc. Computer Science, Year 3 — GPA 3.87/4.0",
            experience: [
                { role: "Peer Tutor", org: "CS Society", duration: "2024", desc: "Weekly Java tutoring sessions" }
            ],
            awards: ["Academic Excellence Award 2024"]
        },
        appliedDate: "2026-03-11"
    }
];


// Add more candidates
mockCandidates.push(
    {
        id: "c3",
        name: "Marcus Tan",
        studentId: "S1019876",
        email: "marcus.t@university.edu",
        avatar: "MT",
        gpa: 3.78,
        aiMatchScore: 82,
        hasConflict: false,
        skillsMatched: true,
        stage: "new",
        appliedFor: "Teaching Assistant",
        moduleCode: "DATA201",
        skills: ["R", "Statistics", "Data Viz", "Jupyter"],
        aiInsights: {
            topSkills: [
                { label: "Statistical Analysis", score: 90 },
                { label: "R Programming", score: 87 }
            ],
            taExperience: "Has conducted 2 data analysis workshops for the Statistics Club.",
            interviewQuestions: [
                "How would you explain p-values to non-statisticians?"
            ],
            strengthSummary: "Solid statistics background with practical workshop experience."
        },
        resumeData: {
            education: "B.Sc. Statistics, Year 4 — GPA 3.78/4.0",
            experience: [
                { role: "Workshop Facilitator", org: "Statistics Club", duration: "2023–2025", desc: "Monthly R & Python workshops" }
            ],
            awards: ["Statistics Department Prize 2024"]
        },
        appliedDate: "2026-03-12"
    },
    {
        id: "c4",
        name: "Aisha Rahman",
        studentId: "S1028734",
        email: "aisha.r@university.edu",
        avatar: "AR",
        gpa: 3.95,
        aiMatchScore: 96,
        hasConflict: false,
        skillsMatched: true,
        stage: "shortlisted",
        appliedFor: "Teaching Assistant",
        moduleCode: "COMP101",
        skills: ["Python", "C++", "Debugging", "Communication", "Leadership"],
        aiInsights: {
            topSkills: [
                { label: "Python & C++", score: 97 },
                { label: "Debugging Mentor", score: 94 },
                { label: "Leadership", score: 91 }
            ],
            taExperience: "Highest-rated TA from last semester with a 4.9/5.0 student satisfaction score.",
            interviewQuestions: [
                "You received the highest satisfaction scores last semester — what's your secret?"
            ],
            strengthSummary: "Top candidate with near-perfect AI match score of 96%. Returning TA with proven track record."
        },
        resumeData: {
            education: "B.Sc. Computer Science, Year 4 — GPA 3.95/4.0",
            experience: [
                { role: "Senior TA", org: "COMP101", duration: "Sem 2, 2025", desc: "Led team of 3 TAs, 4.9/5.0 student rating" }
            ],
            awards: ["Best TA Award (Sem 2, 2025)", "Dean's List 3 consecutive semesters"]
        },
        appliedDate: "2026-03-08"
    },
    {
        id: "c5",
        name: "James Liu",
        studentId: "S1041023",
        email: "james.liu@university.edu",
        avatar: "JL",
        gpa: 3.71,
        aiMatchScore: 76,
        hasConflict: true,
        conflictDetails: "Monday labs conflict with COMP305 mandatory tutorial",
        skillsMatched: false,
        stage: "shortlisted",
        appliedFor: "Teaching Assistant",
        moduleCode: "DATA201",
        skills: ["Python", "SQL", "Tableau"],
        aiInsights: {
            topSkills: [
                { label: "SQL & Databases", score: 85 },
                { label: "Python Scripting", score: 80 }
            ],
            taExperience: "Good SQL and data tooling skills. Missing formal statistics background.",
            interviewQuestions: [
                "DATA201 requires strong statistics — how would you support students?"
            ],
            strengthSummary: "Reasonable technical skills but notable gaps in core statistics knowledge."
        },
        resumeData: {
            education: "B.Sc. Information Systems, Year 3 — GPA 3.71/4.0",
            experience: [
                { role: "Data Analyst Intern", org: "TechCorp", duration: "Summer 2024", desc: "Built dashboards in Tableau" }
            ],
            awards: []
        },
        appliedDate: "2026-03-09"
    },
    {
        id: "c6",
        name: "Sofia Chen",
        studentId: "S1033287",
        email: "sofia.chen@university.edu",
        avatar: "SC",
        gpa: 3.88,
        aiMatchScore: 91,
        hasConflict: false,
        skillsMatched: true,
        stage: "interviewing",
        appliedFor: "Teaching Assistant",
        moduleCode: "MATH201",
        skills: ["Calculus", "Linear Algebra", "LaTeX", "Tutoring"],
        aiInsights: {
            topSkills: [
                { label: "Advanced Calculus", score: 94 },
                { label: "Linear Algebra", score: 91 }
            ],
            taExperience: "Has tutored 15+ students privately in calculus over 2 years.",
            interviewQuestions: [
                "How would you approach teaching the chain rule to a struggling student?"
            ],
            strengthSummary: "Excellent mathematics background with self-demonstrated teaching initiative."
        },
        resumeData: {
            education: "B.Sc. Mathematics, Year 4 — GPA 3.88/4.0",
            experience: [
                { role: "Private Tutor", org: "Self-employed", duration: "2023–2025", desc: "15+ students, calculus and linear algebra" }
            ],
            awards: ["Mathematics Prize 2023", "Dean's List 2024"]
        },
        appliedDate: "2026-03-07"
    },
    {
        id: "c7",
        name: "David Kim",
        studentId: "S1026541",
        email: "david.kim@university.edu",
        avatar: "DK",
        gpa: 3.83,
        aiMatchScore: 89,
        hasConflict: false,
        skillsMatched: true,
        stage: "interviewing",
        appliedFor: "Teaching Assistant",
        moduleCode: "COMP101",
        skills: ["Python", "Algorithms", "Git", "Code Review"],
        aiInsights: {
            topSkills: [
                { label: "Algorithm Design", score: 92 },
                { label: "Code Review", score: 89 }
            ],
            taExperience: "Strong open-source contributor with 500+ GitHub stars.",
            interviewQuestions: [
                "How does your open-source experience prepare you for teaching debugging?"
            ],
            strengthSummary: "Unique blend of industry-adjacent skills and academic performance."
        },
        resumeData: {
            education: "B.Sc. Computer Science, Year 3 — GPA 3.83/4.0",
            experience: [
                { role: "Open Source Contributor", org: "GitHub", duration: "2023–present", desc: "Maintained 3 repos, 500+ stars" }
            ],
            awards: ["Hackathon 1st Place 2024"]
        },
        appliedDate: "2026-03-06"
    },
    {
        id: "c8",
        name: "Lily Nguyen",
        studentId: "S1039012",
        email: "lily.n@university.edu",
        avatar: "LN",
        gpa: 3.96,
        aiMatchScore: 97,
        hasConflict: false,
        skillsMatched: true,
        stage: "final_review",
        appliedFor: "Teaching Assistant",
        moduleCode: "COMP101",
        skills: ["Python", "C", "Teaching", "Curriculum Design", "Leadership"],
        aiInsights: {
            topSkills: [
                { label: "Python & C", score: 98 },
                { label: "Curriculum Design", score: 95 },
                { label: "Student Leadership", score: 93 }
            ],
            taExperience: "Best-in-cohort TA candidate. 3 consecutive semesters as TA with 5.0/5.0 ratings.",
            interviewQuestions: [
                "Your curriculum materials are now used department-wide — walk us through the design process."
            ],
            strengthSummary: "Highest-scored candidate overall with 97% AI match. Department-level impact through curriculum design."
        },
        resumeData: {
            education: "B.Sc. Computer Science, Year 4 — GPA 3.96/4.0",
            experience: [
                { role: "Head TA", org: "COMP101", duration: "Sem 1 & 2, 2025", desc: "5.0/5.0 rating, designed curriculum adopted department-wide" }
            ],
            awards: ["Outstanding TA Award 2025", "Dean's Medal Nominee", "CS Society President"]
        },
        appliedDate: "2026-03-05"
    }
);

// State
let allCandidates = [...mockCandidates];
let filteredCandidates = [...mockCandidates];
let currentSort = 'match';
let selectedCandidate = null;

// Stage labels and colors
const stageLabels = {
    new: "New Applicants",
    shortlisted: "Shortlisted",
    interviewing: "Interviewing",
    final_review: "Pending Admin"
};

const stageColors = {
    new: { bg: "#EFF6FF", text: "#3B82F6" },
    shortlisted: { bg: "#FFF7ED", text: "#F97316" },
    interviewing: { bg: "#F0FDF4", text: "#22C55E" },
    final_review: { bg: "#FAF5FF", text: "#8B5CF6" }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeModuleFilter();
    renderTable();
    attachEventListeners();
});

// Initialize module filter
function initializeModuleFilter() {
    const modules = [...new Set(allCandidates.map(c => c.moduleCode))];
    const moduleFilter = document.getElementById('moduleFilter');
    
    modules.forEach(module => {
        const option = document.createElement('option');
        option.value = module;
        option.textContent = module;
        moduleFilter.appendChild(option);
    });
}

// Filter and sort candidates
function filterAndSort() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const stageFilter = document.getElementById('stageFilter').value;
    const moduleFilter = document.getElementById('moduleFilter').value;
    const matchFilter = document.getElementById('matchFilter').value;
    
    let result = [...allCandidates];
    
    // Search filter
    if (search) {
        result = result.filter(c => 
            c.name.toLowerCase().includes(search) ||
            c.studentId.toLowerCase().includes(search) ||
            c.email.toLowerCase().includes(search)
        );
    }
    
    // Stage filter
    if (stageFilter !== 'all') {
        result = result.filter(c => c.stage === stageFilter);
    }
    
    // Module filter
    if (moduleFilter !== 'all') {
        result = result.filter(c => c.moduleCode === moduleFilter);
    }
    
    // Match filter
    if (matchFilter === 'high') {
        result = result.filter(c => c.aiMatchScore >= 85);
    } else if (matchFilter === 'low') {
        result = result.filter(c => c.aiMatchScore < 75);
    }
    
    // Sort
    result.sort((a, b) => {
        if (currentSort === 'match') {
            return b.aiMatchScore - a.aiMatchScore;
        } else if (currentSort === 'gpa') {
            return b.gpa - a.gpa;
        } else {
            return new Date(b.appliedDate) - new Date(a.appliedDate);
        }
    });
    
    filteredCandidates = result;
    renderTable();
}

// Render table
function renderTable() {
    const tbody = document.getElementById('applicantsTableBody');
    const countEl = document.getElementById('candidateCount');
    
    countEl.textContent = filteredCandidates.length;
    
    if (filteredCandidates.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <p>No candidates match the selected filters.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredCandidates.map(candidate => `
        <tr data-id="${candidate.id}">
            <td>
                <div class="candidate-cell">
                    <div class="candidate-avatar">${candidate.avatar}</div>
                    <div>
                        <div class="candidate-name">${candidate.name}</div>
                        <div class="candidate-id">${candidate.studentId}</div>
                    </div>
                </div>
            </td>
            <td>
                <span class="module-badge">${candidate.moduleCode}</span>
            </td>
            <td>${candidate.gpa}</td>
            <td>
                <div class="ai-match-cell">
                    <div class="ai-progress-bar">
                        <div class="ai-progress-fill" style="width: ${candidate.aiMatchScore}%"></div>
                    </div>
                    <span class="ai-score">${candidate.aiMatchScore}%</span>
                </div>
            </td>
            <td>
                <div class="status-tags">
                    ${candidate.hasConflict ? '<span class="status-tag conflict"><i>⚠️</i>Conflict</span>' : ''}
                    ${candidate.skillsMatched && !candidate.hasConflict ? '<span class="status-tag matched"><i>✓</i>Matched</span>' : ''}
                </div>
            </td>
            <td>
                <span class="stage-badge ${candidate.stage}">${stageLabels[candidate.stage]}</span>
            </td>
            <td>
                <span class="applied-date">${candidate.appliedDate}</span>
            </td>
            <td>
                <span class="view-details">View Details</span>
            </td>
        </tr>
    `).join('');
    
    // Attach row click handlers
    tbody.querySelectorAll('tr').forEach(row => {
        row.addEventListener('click', (e) => {
            const id = row.dataset.id;
            const candidate = allCandidates.find(c => c.id === id);
            if (candidate) {
                openDrawer(candidate);
            }
        });
    });
}

// Attach event listeners
function attachEventListeners() {
    // Search
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');
    
    searchInput.addEventListener('input', (e) => {
        clearSearch.classList.toggle('visible', e.target.value.length > 0);
        filterAndSort();
    });
    
    clearSearch.addEventListener('click', () => {
        searchInput.value = '';
        clearSearch.classList.remove('visible');
        filterAndSort();
    });
    
    // Filters
    document.getElementById('stageFilter').addEventListener('change', filterAndSort);
    document.getElementById('moduleFilter').addEventListener('change', filterAndSort);
    document.getElementById('matchFilter').addEventListener('change', filterAndSort);
    
    // Sort buttons
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.sort-btn').forEach(b => {
                b.classList.remove('active', 'purple');
            });
            btn.classList.add('active');
            if (btn.dataset.sort === 'match') {
                btn.classList.add('purple');
            }
            currentSort = btn.dataset.sort;
            filterAndSort();
        });
    });
    
    // AI Rank button
    document.getElementById('aiRankBtn').addEventListener('click', () => {
        alert('AI Ranking feature would analyze all candidates and update their scores.');
    });
    
    // Drawer
    document.getElementById('drawerClose').addEventListener('click', closeDrawer);
    document.getElementById('drawerOverlay').addEventListener('click', closeDrawer);
}

// Open drawer
function openDrawer(candidate) {
    selectedCandidate = candidate;
    
    const drawer = document.getElementById('candidateDrawer');
    const overlay = document.getElementById('drawerOverlay');
    const headerContent = document.getElementById('drawerHeaderContent');
    const body = document.getElementById('drawerBody');
    const footer = document.getElementById('drawerFooter');
    
    // Header
    headerContent.innerHTML = `
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 12px;">
            <div style="width: 56px; height: 56px; border-radius: 14px; background: linear-gradient(135deg, #3B82F6, #8B5CF6); display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; font-weight: 700;">
                ${candidate.avatar}
            </div>
            <div>
                <h2 style="font-size: 22px; margin-bottom: 4px;">${candidate.name}</h2>
                <p style="font-size: 13px; opacity: 0.8;">${candidate.studentId} · ${candidate.email}</p>
            </div>
        </div>
        <div style="display: flex; gap: 12px;">
            <div style="flex: 1; background: rgba(255,255,255,0.1); padding: 10px; border-radius: 10px; text-align: center;">
                <div style="font-size: 11px; opacity: 0.7; margin-bottom: 4px;">GPA</div>
                <div style="font-size: 18px; font-weight: 700;">${candidate.gpa}</div>
            </div>
            <div style="flex: 1; background: rgba(255,255,255,0.1); padding: 10px; border-radius: 10px; text-align: center;">
                <div style="font-size: 11px; opacity: 0.7; margin-bottom: 4px;">AI Match</div>
                <div style="font-size: 18px; font-weight: 700;">${candidate.aiMatchScore}%</div>
            </div>
            <div style="flex: 1; background: rgba(255,255,255,0.1); padding: 10px; border-radius: 10px; text-align: center;">
                <div style="font-size: 11px; opacity: 0.7; margin-bottom: 4px;">Stage</div>
                <div style="font-size: 13px; font-weight: 600;">${stageLabels[candidate.stage]}</div>
            </div>
        </div>
    `;
    
    // Body
    body.innerHTML = `
        ${candidate.hasConflict ? `
            <div style="background: #FEE2E2; border: 1px solid #FCA5A5; border-radius: 12px; padding: 12px; margin-bottom: 20px; display: flex; gap: 10px;">
                <span style="font-size: 18px;">⚠️</span>
                <div>
                    <div style="font-weight: 600; color: #DC2626; margin-bottom: 4px;">Schedule Conflict Detected</div>
                    <div style="font-size: 13px; color: #991B1B;">${candidate.conflictDetails}</div>
                </div>
            </div>
        ` : ''}
        
        <div style="margin-bottom: 24px;">
            <h3 style="font-size: 14px; font-weight: 600; color: #64748B; margin-bottom: 12px;">AI INSIGHTS</h3>
            <div style="background: #F8FAFC; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="font-size: 13px; color: #475569; line-height: 1.6;">${candidate.aiInsights.strengthSummary}</div>
            </div>
            <div style="background: #F8FAFC; border-radius: 12px; padding: 16px;">
                <div style="font-size: 12px; font-weight: 600; color: #64748B; margin-bottom: 8px;">Top Skills</div>
                ${candidate.aiInsights.topSkills.map(skill => `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-size: 13px; color: #334155;">${skill.label}</span>
                        <span style="font-size: 12px; font-weight: 700; color: #8B5CF6;">${skill.score}%</span>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div style="margin-bottom: 24px;">
            <h3 style="font-size: 14px; font-weight: 600; color: #64748B; margin-bottom: 12px;">TA EXPERIENCE</h3>
            <div style="background: #F8FAFC; border-radius: 12px; padding: 16px;">
                <div style="font-size: 13px; color: #475569; line-height: 1.6;">${candidate.aiInsights.taExperience}</div>
            </div>
        </div>
        
        <div style="margin-bottom: 24px;">
            <h3 style="font-size: 14px; font-weight: 600; color: #64748B; margin-bottom: 12px;">SUGGESTED INTERVIEW QUESTIONS</h3>
            ${candidate.aiInsights.interviewQuestions.map((q, i) => `
                <div style="background: #F8FAFC; border-radius: 12px; padding: 14px; margin-bottom: 8px;">
                    <div style="font-size: 13px; color: #334155;">${i + 1}. ${q}</div>
                </div>
            `).join('')}
        </div>
        
        <div style="margin-bottom: 24px;">
            <h3 style="font-size: 14px; font-weight: 600; color: #64748B; margin-bottom: 12px;">EDUCATION</h3>
            <div style="background: #F8FAFC; border-radius: 12px; padding: 16px;">
                <div style="font-size: 13px; color: #334155;">${candidate.resumeData.education}</div>
            </div>
        </div>
        
        <div style="margin-bottom: 24px;">
            <h3 style="font-size: 14px; font-weight: 600; color: #64748B; margin-bottom: 12px;">EXPERIENCE</h3>
            ${candidate.resumeData.experience.map(exp => `
                <div style="background: #F8FAFC; border-radius: 12px; padding: 16px; margin-bottom: 8px;">
                    <div style="font-weight: 600; font-size: 14px; color: #1E293B; margin-bottom: 4px;">${exp.role} · ${exp.org}</div>
                    <div style="font-size: 12px; color: #64748B; margin-bottom: 6px;">${exp.duration}</div>
                    <div style="font-size: 13px; color: #475569;">${exp.desc}</div>
                </div>
            `).join('')}
        </div>
        
        ${candidate.resumeData.awards.length > 0 ? `
            <div style="margin-bottom: 24px;">
                <h3 style="font-size: 14px; font-weight: 600; color: #64748B; margin-bottom: 12px;">AWARDS & HONORS</h3>
                <div style="background: #F8FAFC; border-radius: 12px; padding: 16px;">
                    ${candidate.resumeData.awards.map(award => `
                        <div style="font-size: 13px; color: #334155; margin-bottom: 6px;">🏆 ${award}</div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
        
        <div>
            <h3 style="font-size: 14px; font-weight: 600; color: #64748B; margin-bottom: 12px;">SKILLS</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${candidate.skills.map(skill => `
                    <span style="padding: 6px 12px; background: #EDE9FE; color: #7C3AED; border-radius: 8px; font-size: 12px;">${skill}</span>
                `).join('')}
            </div>
        </div>
    `;
    
    // Footer
    const stageOrder = ["new", "shortlisted", "interviewing", "final_review"];
    const currentIndex = stageOrder.indexOf(candidate.stage);
    const canMoveForward = currentIndex < stageOrder.length - 1;
    
    footer.innerHTML = `
        <button class="drawer-btn drawer-btn-reject" onclick="handleReject('${candidate.id}')">
            <i>✕</i>
            <span>Reject</span>
        </button>
        ${canMoveForward ? `
            <button class="drawer-btn drawer-btn-move" onclick="handleMoveStage('${candidate.id}')">
                <i>→</i>
                <span>Move to ${stageLabels[stageOrder[currentIndex + 1]]}</span>
            </button>
        ` : `
            <button class="drawer-btn drawer-btn-move" style="opacity: 0.5; cursor: not-allowed;" disabled>
                <span>Final Stage Reached</span>
            </button>
        `}
    `;
    
    drawer.classList.add('open');
    overlay.classList.add('open');
}

// Close drawer
function closeDrawer() {
    document.getElementById('candidateDrawer').classList.remove('open');
    document.getElementById('drawerOverlay').classList.remove('open');
    selectedCandidate = null;
}

// Handle reject
function handleReject(id) {
    if (confirm('Are you sure you want to reject this candidate?')) {
        console.log('Rejecting candidate:', id);
        closeDrawer();
    }
}

// Handle move stage
function handleMoveStage(id) {
    const stageOrder = ["new", "shortlisted", "interviewing", "final_review"];
    const candidateIndex = allCandidates.findIndex(c => c.id === id);
    
    if (candidateIndex !== -1) {
        const candidate = allCandidates[candidateIndex];
        const currentIndex = stageOrder.indexOf(candidate.stage);
        
        if (currentIndex < stageOrder.length - 1) {
            allCandidates[candidateIndex].stage = stageOrder[currentIndex + 1];
            filterAndSort();
            closeDrawer();
            
            console.log(`Moved candidate ${id} to ${stageLabels[stageOrder[currentIndex + 1]]}`);
        }
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
