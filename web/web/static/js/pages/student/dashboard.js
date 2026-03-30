// Dashboard Page JavaScript
// Version: 2.2 - Fixed JSON parse error

console.log('Dashboard JS loaded - Version 2.2');

// Mock applications data
const mockApplications = [
    {
        id: '1',
        jobTitle: 'Java Programming Course TA',
        status: 'interview',
        date: '2026-03-15',
        department: 'Computer Science'
    },
    {
        id: '2',
        jobTitle: 'Data Structures TA',
        status: 'reviewing',
        date: '2026-03-12',
        department: 'Computer Science'
    },
    {
        id: '3',
        jobTitle: 'Database Systems TA',
        status: 'offered',
        date: '2026-03-10',
        department: 'Computer Science'
    },
    {
        id: '4',
        jobTitle: 'Web Development Workshop TA',
        status: 'submitted',
        date: '2026-03-18',
        department: 'Computer Science'
    },
    {
        id: '5',
        jobTitle: 'Campus Event Coordinator',
        status: 'rejected',
        date: '2026-03-08',
        department: 'Student Affairs'
    }
];

// Mock schedule data
const mockSchedule = [
    { day: 'Monday', startTime: '08:00', endTime: '10:00', course: 'Advanced Algorithms' },
    { day: 'Monday', startTime: '14:00', endTime: '16:00', course: 'Software Engineering' },
    { day: 'Wednesday', startTime: '08:00', endTime: '10:00', course: 'Advanced Algorithms' },
    { day: 'Wednesday', startTime: '14:00', endTime: '16:00', course: 'Database Systems' },
    { day: 'Friday', startTime: '10:00', endTime: '12:00', course: 'Computer Networks' }
];

// Mock favorites data
const mockFavorites = [
    {
        id: '1',
        title: 'Java Programming Course TA',
        department: 'Computer Science',
        location: 'Main Campus',
        hoursPerWeek: '10-15',
        salary: '¥80/hour',
        tags: ['Programming', 'Teaching', 'Java'],
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400'
    },
    {
        id: '2',
        title: 'Data Structures TA',
        department: 'Computer Science',
        location: 'Main Campus',
        hoursPerWeek: '8-12',
        salary: '¥75/hour',
        tags: ['Algorithms', 'Teaching', 'C++'],
        image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400'
    }
];

const statusConfig = {
    submitted: {
        label: 'Submitted',
        icon: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline>`,
        color: 'status-submitted'
    },
    reviewing: {
        label: 'Under Review',
        icon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
        color: 'status-reviewing'
    },
    interview: {
        label: 'Interview Stage',
        icon: `<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline>`,
        color: 'status-interview'
    },
    offered: {
        label: 'Offer Received',
        icon: `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>`,
        color: 'status-offered'
    },
    rejected: {
        label: 'Not Selected',
        icon: `<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>`,
        color: 'status-rejected'
    }
};

// Load user data
function loadUserData() {
    let user = null;
    
    try {
        const userData = localStorage.getItem('user');
        if (userData && userData !== 'undefined' && userData !== 'null') {
            user = JSON.parse(userData);
        }
    } catch (e) {
        console.error('Error parsing user data:', e);
        user = null;
    }
    
    // If no user data, show message and redirect after delay
    if (!user || !user.name) {
        document.getElementById('userName').textContent = 'Not Logged In';
        document.getElementById('userMeta').textContent = 'Please login to view your dashboard';
        document.getElementById('gpaBadge').textContent = 'GPA: N/A';
        document.getElementById('idBadge').textContent = 'ID: N/A';
        
        // Show alert and redirect
        setTimeout(() => {
            alert('Please login to access your dashboard');
            window.location.href = '/login.html';
        }, 1000);
        return;
    }
    
    // Update header
    document.getElementById('userName').textContent = user.name || 'Guest User';
    document.getElementById('userMeta').textContent = user.major ? `${user.major} · ${user.year || 'N/A'}` : 'Student';
    document.getElementById('gpaBadge').textContent = `GPA: ${user.gpa || 'N/A'}`;
    document.getElementById('idBadge').textContent = `ID: ${user.studentId || 'N/A'}`;
    
    // Update form fields
    const form = document.getElementById('profileForm');
    if (form) {
        form.elements.name.value = user.name || '';
        form.elements.email.value = user.email || '';
        form.elements.phone.value = user.phone || '';
        form.elements.studentId.value = user.studentId || '';
        form.elements.major.value = user.major || '';
        form.elements.year.value = user.year || '';
        form.elements.gpa.value = user.gpa || '';
        form.elements.bio.value = user.bio || '';
    }
}

// Tab switching
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            button.classList.add('active');
            document.getElementById(`tab-${tabName}`).classList.add('active');
        });
    });
}

// Edit profile functionality
function initEditProfile() {
    const editBtn = document.getElementById('editProfileBtn');
    const cancelBtn = document.getElementById('cancelEditBtn');
    const form = document.getElementById('profileForm');
    const formActions = document.getElementById('formActions');
    const inputs = form.querySelectorAll('input, textarea');
    
    let isEditing = false;
    
    editBtn.addEventListener('click', () => {
        isEditing = !isEditing;
        
        if (isEditing) {
            // Enable editing
            inputs.forEach(input => input.disabled = false);
            formActions.style.display = 'flex';
            editBtn.textContent = 'Cancel';
        } else {
            // Cancel editing
            inputs.forEach(input => input.disabled = true);
            formActions.style.display = 'none';
            editBtn.textContent = 'Edit Profile';
            loadUserData(); // Reload original data
        }
    });
    
    cancelBtn.addEventListener('click', () => {
        inputs.forEach(input => input.disabled = true);
        formActions.style.display = 'none';
        editBtn.textContent = 'Edit Profile';
        isEditing = false;
        loadUserData(); // Reload original data
    });
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: form.elements.name.value,
            email: form.elements.email.value,
            phone: form.elements.phone.value,
            studentId: form.elements.studentId.value,
            major: form.elements.major.value,
            year: form.elements.year.value,
            gpa: form.elements.gpa.value,
            bio: form.elements.bio.value
        };
        
        try {
            // Update localStorage
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const updatedUser = { ...user, ...formData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            // Update UI
            loadUserData();
            
            // Disable editing
            inputs.forEach(input => input.disabled = true);
            formActions.style.display = 'none';
            editBtn.textContent = 'Edit Profile';
            isEditing = false;
            
            showToast('Profile updated successfully!', 'success');
        } catch (error) {
            console.error('Error updating profile:', error);
            showToast('Failed to update profile', 'error');
        }
    });
}

// Render application timeline
function renderTimeline() {
    const timeline = document.getElementById('applicationTimeline');
    if (!timeline) return;
    
    const recentApps = mockApplications.slice(0, 3);
    
    timeline.innerHTML = recentApps.map((app, index) => {
        const config = statusConfig[app.status];
        const date = new Date(app.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        return `
            <div class="timeline-item">
                <div class="timeline-icon ${config.color}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        ${config.icon}
                    </svg>
                </div>
                <div class="timeline-content">
                    <div class="timeline-info">
                        <h4 class="timeline-title">${app.jobTitle}</h4>
                        <p class="timeline-dept">${app.department}</p>
                        <p class="timeline-date">Applied on ${formattedDate}</p>
                    </div>
                    <span class="badge badge-${app.status === 'offered' ? 'success' : app.status === 'rejected' ? 'danger' : app.status === 'reviewing' ? 'warning' : 'secondary'}">
                        ${config.label}
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

// Render applications list
function renderApplicationsList() {
    const list = document.getElementById('applicationsList');
    if (!list) return;
    
    list.innerHTML = mockApplications.map(app => {
        const config = statusConfig[app.status];
        const date = new Date(app.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        return `
            <div class="application-card">
                <div class="application-header">
                    <div>
                        <h4 class="application-title">${app.jobTitle}</h4>
                        <p class="application-dept">${app.department}</p>
                    </div>
                    <span class="badge badge-${app.status === 'offered' ? 'success' : app.status === 'rejected' ? 'danger' : app.status === 'reviewing' ? 'warning' : 'secondary'}">
                        ${config.label}
                    </span>
                </div>
                <p class="application-date">Applied on ${formattedDate}</p>
            </div>
        `;
    }).join('');
}

// Logout functionality
function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    const signOutBtn = document.getElementById('signOutBtn');
    
    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    };
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    if (signOutBtn) {
        signOutBtn.addEventListener('click', handleLogout);
    }
}

// Toast notification
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add CSS animations
const dashboardStyle = document.createElement('style');
dashboardStyle.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(dashboardStyle);


// Resume tabs functionality
function initResumeTabs() {
    const resumeTabBtns = document.querySelectorAll('.resume-tab-btn');
    const resumeTabContents = document.querySelectorAll('.resume-tab-content');
    
    resumeTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.resumeTab;
            
            // Remove active class
            resumeTabBtns.forEach(b => b.classList.remove('active'));
            resumeTabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class
            btn.classList.add('active');
            document.getElementById(`resume-tab-${tabName}`).classList.add('active');
        });
    });
    
    // PDF upload
    const uploadArea = document.getElementById('pdfUploadArea');
    const fileInput = document.getElementById('resumeUpload');
    const fileInfo = document.getElementById('uploadedFileInfo');
    
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type === 'application/pdf') {
                uploadArea.style.display = 'none';
                fileInfo.style.display = 'block';
                fileInfo.innerHTML = `
                    <div class="uploaded-file-card">
                        <div class="uploaded-file-info">
                            <svg class="uploaded-file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <div>
                                <p class="uploaded-file-name">${file.name}</p>
                                <p class="uploaded-file-size">${(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                        <button class="btn btn-outline btn-sm">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            View
                        </button>
                    </div>
                `;
                showToast('Resume uploaded successfully!', 'success');
            } else {
                showToast('Please upload a PDF file', 'error');
            }
        });
    }
    
    // AI Polish
    const polishBtn = document.getElementById('polishBtn');
    if (polishBtn) {
        polishBtn.addEventListener('click', () => {
            polishBtn.disabled = true;
            polishBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> Polishing...';
            
            setTimeout(() => {
                polishBtn.disabled = false;
                polishBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> Polish with AI';
                showToast('Resume polished with AI suggestions!', 'success');
            }, 2000);
        });
    }
}

// Render schedule table
function renderScheduleTable() {
    const tbody = document.getElementById('scheduleTableBody');
    if (!tbody) return;
    
    const timeSlots = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    tbody.innerHTML = timeSlots.map(time => {
        return `
            <tr>
                <td style="font-weight: 500; color: #374151;">${time}</td>
                ${daysOfWeek.map(day => {
                    const slot = mockSchedule.find(s => s.day === day && s.startTime === time);
                    return `
                        <td>
                            ${slot ? `
                                <div class="schedule-slot">
                                    <p class="schedule-slot-title">${slot.course}</p>
                                    <p class="schedule-slot-time">${slot.startTime} - ${slot.endTime}</p>
                                </div>
                            ` : ''}
                        </td>
                    `;
                }).join('')}
            </tr>
        `;
    }).join('');
}

// Render favorites list
function renderFavoritesList() {
    const list = document.getElementById('favoritesList');
    if (!list) return;
    
    if (mockFavorites.length === 0) {
        list.innerHTML = `
            <div class="favorites-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <p>No saved positions yet</p>
                <a href="/apply.html" class="btn btn-primary">Browse Positions</a>
            </div>
        `;
        return;
    }
    
    list.innerHTML = mockFavorites.map(job => `
        <div class="favorite-card">
            <div class="favorite-card-grid">
                <div class="favorite-card-image">
                    <img src="${job.image}" alt="${job.title}">
                </div>
                <div class="favorite-card-content">
                    <div class="favorite-card-header">
                        <div>
                            <h4 class="favorite-card-title">${job.title}</h4>
                            <p class="favorite-card-dept">${job.department}</p>
                        </div>
                        <button class="favorite-delete-btn" onclick="removeFavorite('${job.id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="favorite-card-tags">
                        ${job.tags.map(tag => `<span class="badge badge-secondary">${tag}</span>`).join('')}
                    </div>
                    <div class="favorite-card-meta">
                        <div class="favorite-card-meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            ${job.location}
                        </div>
                        <div class="favorite-card-meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            ${job.hoursPerWeek} hours/week
                        </div>
                        <div class="favorite-card-meta-item favorite-card-salary">
                            ${job.salary}
                        </div>
                    </div>
                    <div class="favorite-card-actions">
                        <a href="/job-detail.html?id=${job.id}" class="btn btn-primary btn-sm">View Details</a>
                        <button class="btn btn-outline btn-sm">Apply Now</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Remove favorite
function removeFavorite(id) {
    const index = mockFavorites.findIndex(f => f.id === id);
    if (index > -1) {
        mockFavorites.splice(index, 1);
        renderFavoritesList();
        showToast('Removed from favorites', 'success');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired');
    
    try {
        // Load user data (will create mock data if not exists)
        console.log('Loading user data...');
        loadUserData();
        console.log('User data loaded');
        
        console.log('Initializing tabs...');
        initTabs();
        
        console.log('Initializing edit profile...');
        initEditProfile();
        
        console.log('Initializing logout...');
        initLogout();
        
        console.log('Rendering timeline...');
        renderTimeline();
        
        console.log('Rendering applications list...');
        renderApplicationsList();
        
        console.log('Initializing resume tabs...');
        initResumeTabs();
        
        console.log('Rendering schedule table...');
        renderScheduleTable();
        
        console.log('Rendering favorites list...');
        renderFavoritesList();
        
        console.log('Dashboard initialization complete!');
    } catch (error) {
        console.error('Dashboard initialization error:', error);
    }
});
