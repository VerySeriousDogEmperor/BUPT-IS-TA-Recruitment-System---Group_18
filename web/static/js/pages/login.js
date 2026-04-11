let authMode = 'student';
let staffRole = null;
let studentAuthView = 'login';

function updateVisualPanel() {
  const body = document.body;
  const visualRoleChip = document.getElementById('visualRoleChip');
  const visualTitle = document.getElementById('visualTitle');
  const visualSubtitle = document.getElementById('visualSubtitle');
  const visualCardLabel = document.getElementById('visualCardLabel');
  const visualCardText = document.getElementById('visualCardText');
  const visualPillTop = document.getElementById('visualPillTop');
  const visualPillBottom = document.getElementById('visualPillBottom');
  const visualFeatureList = document.getElementById('visualFeatureList');
  const visualRoleIcon = document.getElementById('visualRoleIcon');
  const visualCardIcon = document.getElementById('visualCardIcon');
  const demoAccountNote = document.getElementById('demoAccountNote');

  if (!visualRoleChip) return;

  body.dataset.authMode = authMode;
  body.dataset.staffRole = staffRole || '';

  let config;
  if (authMode === 'staff' && staffRole === 'admin') {
    config = {
      chip: 'Admin Console',
      title: 'Oversee the TA Recruitment Flow',
      subtitle: 'Review openings, monitor approvals, and keep the hiring pipeline coordinated across the demo site.',
      cardLabel: 'Approval Workspace',
      cardText: 'Use the preset admin account to monitor the recruitment flow and demo data.',
      pillTop: 'Policy Aligned',
      pillBottom: 'Recruitment Oversight',
      note: 'Preset admin account: admin@bupt.edu.cn / 123456',
      icon: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>`,
      features: [
        'Audit openings and user activity from one controlled workspace.',
        'Keep approvals, staffing balance, and timelines visible.',
        'Use the preset admin account for the demo environment.'
      ]
    };
  } else if (authMode === 'staff' && staffRole === 'mo') {
    config = {
      chip: 'MO Workspace',
      title: 'Manage Modules with Less Friction',
      subtitle: 'Publish TA roles, review applicants, and coordinate course support from one MO-owned workflow.',
      cardLabel: 'Module Operations',
      cardText: 'All modules, jobs, applications, and timesheets are grouped under the preset MO account.',
      pillTop: 'Applicant Review',
      pillBottom: 'Module Focus',
      note: 'Preset MO account: mo@bupt.edu.cn / 123456',
      icon: `<path d="M12 3l9 4.5-9 4.5-9-4.5 9-4.5z"></path><path d="M7 10.5v4c0 1.7 2.2 3 5 3s5-1.3 5-3v-4"></path><path d="M19 9v5"></path>`,
      features: [
        'Create and adjust TA positions around real course needs.',
        'Review every student application from the same MO workspace.',
        'Coordinate timesheets and student support from one panel.'
      ]
    };
  } else if (authMode === 'staff') {
    config = {
      chip: 'Staff Entrance',
      title: 'Choose a Staff Workspace',
      subtitle: 'Use the preset admin or MO account to enter the corresponding demo workspace.',
      cardLabel: 'Demo Access',
      cardText: 'Select Admin for oversight tasks or MO for module operations under the shared dataset.',
      pillTop: 'Preset Accounts',
      pillBottom: 'Role Based Access',
      note: 'Preset staff accounts: mo@bupt.edu.cn / 123456 and admin@bupt.edu.cn / 123456',
      icon: `<path d="M12 3l7 4v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V7l7-4z"></path><path d="M9 12h6"></path><path d="M12 9v6"></path>`,
      features: [
        'One admin account for platform oversight.',
        'One MO account owning every module and recruitment post.',
        'Shared demo data keeps the workflow easy to review end to end.'
      ]
    };
  } else if (studentAuthView === 'register') {
    config = {
      chip: 'Student Registration',
      title: 'Create a Student Account',
      subtitle: 'Register a new student account, then enter the portal with your own profile data.',
      cardLabel: 'New Student Onboarding',
      cardText: 'Registration creates a student record directly in the project data store and signs you in immediately.',
      pillTop: 'Self Registration',
      pillBottom: 'Profile First',
      note: 'You can still use the preset student account: student@bupt.edu.cn / 123456',
      icon: `<path d="M12 3l9 4.5-9 4.5-9-4.5 9-4.5z"></path><path d="M7 10.5v4c0 1.7 2.2 3 5 3s5-1.3 5-3v-4"></path>`,
      features: [
        'Create a dedicated student account with your own email and student ID.',
        'Start with a clean profile and complete resume, schedule, and applications later.',
        'Registration signs you in so you can continue directly into the portal.'
      ]
    };
  } else {
    config = {
      chip: 'Student Portal',
      title: 'Access the Student Portal',
      subtitle: 'Sign in to browse positions, submit applications, manage your resume, and update your schedule.',
      cardLabel: 'Student Workspace',
      cardText: 'Track profile readiness, schedule fit, favorite positions, applications, and timesheets in one place.',
      pillTop: 'Application Ready',
      pillBottom: 'Conflict Checked',
      note: 'Demo student account: student@bupt.edu.cn / 123456',
      icon: `<path d="M12 3l9 4.5-9 4.5-9-4.5 9-4.5z"></path><path d="M7 10.5v4c0 1.7 2.2 3 5 3s5-1.3 5-3v-4"></path>`,
      features: [
        'Keep your resume, schedule, and applications aligned in one place.',
        'Move from browsing to application without losing context.',
        'Use your own account or the preset demo student account.'
      ]
    };
  }

  visualRoleChip.textContent = config.chip;
  visualTitle.textContent = config.title;
  visualSubtitle.textContent = config.subtitle;
  visualCardLabel.textContent = config.cardLabel;
  visualCardText.textContent = config.cardText;
  visualPillTop.textContent = config.pillTop;
  visualPillBottom.textContent = config.pillBottom;
  if (demoAccountNote) demoAccountNote.textContent = config.note;

  visualRoleIcon.innerHTML = `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${config.icon}</svg>`;
  visualCardIcon.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${config.icon}</svg>`;
  visualFeatureList.innerHTML = config.features.map((text) => `
    <div class="feature-item">
      <div class="feature-dot"></div>
      <p>${text}</p>
    </div>
  `).join('');
}

function updateUI() {
  const formTitle = document.getElementById('formTitle');
  const formSubtitle = document.getElementById('formSubtitle');
  const roleSelection = document.getElementById('roleSelection');
  const loginOptions = document.getElementById('loginOptions');
  const toggleSection = document.getElementById('toggleSection');
  const backToStudent = document.getElementById('backToStudent');
  const submitBtn = document.getElementById('submitBtn');
  const toggleText = document.getElementById('toggleText');
  const toggleBtn = document.getElementById('toggleBtn');
  const nameField = document.getElementById('nameField');
  const studentIdField = document.getElementById('studentIdField');
  const confirmPasswordField = document.getElementById('confirmPasswordField');
  const nameInput = document.querySelector('input[name="name"]');
  const studentIdInput = document.querySelector('input[name="studentId"]');
  const confirmPasswordInput = document.querySelector('input[name="confirmPassword"]');

  const isRegisterView = authMode === 'student' && studentAuthView === 'register';

  if (authMode === 'staff') {
    formTitle.textContent = 'Staff Entrance';
    formSubtitle.textContent = 'Select the workspace, then sign in with the preset account';
    roleSelection.style.display = 'grid';
    loginOptions.style.display = 'none';
    toggleSection.style.display = 'none';
    backToStudent.style.display = 'block';
    submitBtn.textContent = 'Select Role';
    submitBtn.disabled = true;
    submitBtn.classList.remove('admin', 'mo');
    nameField.style.display = 'none';
    studentIdField.style.display = 'none';
    confirmPasswordField.style.display = 'none';
    nameInput.required = false;
    studentIdInput.required = false;
    confirmPasswordInput.required = false;
  } else {
    formTitle.textContent = isRegisterView ? 'Student Registration' : 'Student Login';
    formSubtitle.textContent = isRegisterView
      ? 'Create your student account to enter the recruitment portal'
      : 'Sign in with your own account or the preset demo student account';
    roleSelection.style.display = 'none';
    loginOptions.style.display = isRegisterView ? 'none' : 'flex';
    toggleSection.style.display = 'block';
    backToStudent.style.display = 'none';
    submitBtn.textContent = isRegisterView ? 'Create Account' : 'Sign In';
    submitBtn.disabled = false;
    submitBtn.classList.remove('admin', 'mo');

    nameField.style.display = isRegisterView ? 'block' : 'none';
    studentIdField.style.display = isRegisterView ? 'block' : 'none';
    confirmPasswordField.style.display = isRegisterView ? 'block' : 'none';
    nameInput.required = isRegisterView;
    studentIdInput.required = isRegisterView;
    confirmPasswordInput.required = isRegisterView;

    toggleText.textContent = isRegisterView ? 'Already have an account?' : 'New here?';
    toggleBtn.textContent = isRegisterView ? 'Back to Login' : 'Create Student Account';
  }

  updateVisualPanel();
}

function selectRole(role) {
  staffRole = role;
  document.querySelectorAll('.role-btn').forEach((btn) => {
    btn.classList.remove('active', 'admin', 'mo');
    if (btn.dataset.role === role) {
      btn.classList.add('active', role);
    }
  });

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.classList.remove('admin', 'mo');
  submitBtn.classList.add(role);
  submitBtn.textContent = role === 'admin' ? 'Login as Admin' : 'Login as MO';
  submitBtn.disabled = false;
  updateVisualPanel();
}

async function handleSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');

  try {
    if (authMode === 'staff') {
      if (!staffRole) {
        showToast('Please select a role', 'error');
        return;
      }

      const userData = await API.auth.login(email, password, staffRole);
      localStorage.setItem('userRole', staffRole);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(userData));
      showToast('Login successful!', 'success');
      setTimeout(() => {
        window.location.href = staffRole === 'admin' ? '/admin/index.html' : '/mo/index.html';
      }, 800);
      return;
    }

    if (studentAuthView === 'register') {
      const name = String(formData.get('name') || '').trim();
      const studentId = String(formData.get('studentId') || '').trim();
      const confirmPassword = String(formData.get('confirmPassword') || '');

      if (!name || !studentId || !email || !password) {
        showToast('Please complete all registration fields', 'error');
        return;
      }
      if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
      }

      const userData = await API.auth.register({
        name,
        email,
        password,
        studentId
      });

      localStorage.setItem('userRole', 'student');
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(userData));
      showToast('Registration successful!', 'success');
      setTimeout(() => {
        window.location.href = '/index.html';
      }, 800);
      return;
    }

    const userData = await API.auth.login(email, password, 'student');
    localStorage.setItem('userRole', 'student');
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify(userData));
    showToast('Login successful!', 'success');
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 800);
  } catch (error) {
    showToast(error.message || 'Authentication failed', 'error');
  }
}

function bindEvents() {
  document.querySelectorAll('.role-btn').forEach((btn) => {
    btn.addEventListener('click', () => selectRole(btn.dataset.role));
  });

  const toggleBtn = document.getElementById('toggleBtn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (authMode !== 'student') return;
      studentAuthView = studentAuthView === 'login' ? 'register' : 'login';
      document.getElementById('authForm').reset();
      updateUI();
    });
  }

  document.getElementById('authForm').addEventListener('submit', handleSubmit);
}

function initPage() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('mode') === 'staff') {
    authMode = 'staff';
  }

  bindEvents();
  updateUI();
}

document.addEventListener('DOMContentLoaded', initPage);
