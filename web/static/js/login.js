/**
 * Login Page - 登录页面逻辑
 */

let authMode = 'student'; // 'student' or 'staff'
let staffRole = null; // 'admin' or 'mo'
let isLogin = true; // true for login, false for register

/**
 * 初始化页面
 */
function initPage() {
  // 检查URL参数
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode');
  
  if (mode === 'staff') {
    authMode = 'staff';
    isLogin = true;
    updateUI();
  }
  
  // 绑定事件
  bindEvents();
}

/**
 * 绑定事件
 */
function bindEvents() {
  // 角色选择按钮
  document.querySelectorAll('.role-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const role = btn.dataset.role;
      selectRole(role);
    });
  });
  
  // 切换登录/注册
  document.getElementById('toggleBtn').addEventListener('click', () => {
    isLogin = !isLogin;
    updateUI();
  });
  
  // 表单提交
  document.getElementById('authForm').addEventListener('submit', handleSubmit);
}

/**
 * 选择角色
 */
function selectRole(role) {
  staffRole = role;
  
  // 更新按钮状态
  document.querySelectorAll('.role-btn').forEach(btn => {
    btn.classList.remove('active', 'admin', 'mo');
    if (btn.dataset.role === role) {
      btn.classList.add('active', role);
    }
  });
  
  // 更新提交按钮
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.classList.remove('admin', 'mo');
  submitBtn.classList.add(role);
  
  if (role === 'admin') {
    submitBtn.textContent = 'Login as Admin';
  } else if (role === 'mo') {
    submitBtn.textContent = 'Login as MO';
  }
  
  submitBtn.disabled = false;
}

/**
 * 更新UI
 */
function updateUI() {
  const formTitle = document.getElementById('formTitle');
  const formSubtitle = document.getElementById('formSubtitle');
  const roleSelection = document.getElementById('roleSelection');
  const registerFields = document.getElementById('registerFields');
  const loginOptions = document.getElementById('loginOptions');
  const toggleSection = document.getElementById('toggleSection');
  const backToStudent = document.getElementById('backToStudent');
  const submitBtn = document.getElementById('submitBtn');
  const toggleText = document.getElementById('toggleText');
  const toggleBtn = document.getElementById('toggleBtn');
  
  if (authMode === 'staff') {
    // Staff模式
    formTitle.textContent = 'Staff Entrance';
    formSubtitle.textContent = 'Select your role and enter credentials';
    roleSelection.style.display = 'block';
    registerFields.style.display = 'none';
    loginOptions.style.display = 'none';
    toggleSection.style.display = 'none';
    backToStudent.style.display = 'block';
    
    submitBtn.textContent = 'Select Role';
    submitBtn.disabled = true;
    submitBtn.classList.remove('admin', 'mo');
  } else {
    // Student模式
    roleSelection.style.display = 'none';
    backToStudent.style.display = 'none';
    toggleSection.style.display = 'flex';
    
    if (isLogin) {
      formTitle.textContent = 'Welcome Back';
      formSubtitle.textContent = 'Enter your credentials to access your account';
      registerFields.style.display = 'none';
      loginOptions.style.display = 'flex';
      toggleText.textContent = "Don't have an account?";
      toggleBtn.textContent = 'Sign Up';
      submitBtn.textContent = 'Sign In';
    } else {
      formTitle.textContent = 'Create Account';
      formSubtitle.textContent = 'Fill in your information to get started';
      registerFields.style.display = 'block';
      loginOptions.style.display = 'none';
      toggleText.textContent = 'Already have an account?';
      toggleBtn.textContent = 'Sign In';
      submitBtn.textContent = 'Create Account';
    }
    
    submitBtn.disabled = false;
    submitBtn.classList.remove('admin', 'mo');
  }
}

/**
 * 处理表单提交
 */
async function handleSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const email = formData.get('email');
  const password = formData.get('password');
  
  try {
    if (authMode === 'staff') {
      // Staff登录
      if (!staffRole) {
        showToast('Please select a role', 'error');
        return;
      }
      
      // 调用登录 API
      const userData = await API.auth.login(email, password, staffRole);
      
      localStorage.setItem('userRole', staffRole);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(userData));
      
      showToast('Login successful!', 'success');
      
      setTimeout(() => {
        if (staffRole === 'admin') {
          window.location.href = '/admin/index.html';
        } else if (staffRole === 'mo') {
          window.location.href = '/mo/index.html';
        }
      }, 1000);
    } else {
      // Student登录/注册
      if (isLogin) {
        // 登录
        const userData = await API.auth.login(email, password, 'student');
        
        console.log('Login response:', userData); // Debug log
        
        localStorage.setItem('userRole', 'student');
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(userData));
        
        showToast('Login successful!', 'success');
        
        setTimeout(() => {
          window.location.href = '/index.html';
        }, 1000);
      } else {
        // 注册
        const name = formData.get('name');
        const studentId = formData.get('studentId');
        const phone = formData.get('phone');
        const major = formData.get('major');
        
        if (!name || !studentId || !phone || !major) {
          showToast('Please fill in all fields', 'error');
          return;
        }
        
        const userData = await API.auth.register({
          name,
          email,
          studentId,
          phone,
          major,
          password
        });
        
        console.log('Register response:', userData); // Debug log
        
        localStorage.setItem('userRole', 'student');
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(userData));
        
        showToast('Registration successful!', 'success');
        
        setTimeout(() => {
          window.location.href = '/index.html';
        }, 1000);
      }
    }
  } catch (error) {
    showToast(error.message || 'Authentication failed', 'error');
  }
}

/**
 * 初始化
 */
document.addEventListener('DOMContentLoaded', initPage);


// Header scroll effect
let lastScrollY = 0;
let ticking = false;

function updateHeader() {
    const header = document.getElementById('mainHeader');
    if (!header) return;
    
    const currentScrollY = window.scrollY;
    
    // Change background opacity based on scroll
    if (currentScrollY > 10) {
        header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        header.style.borderBottom = '1px solid rgba(229, 231, 235, 0.8)';
        header.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        header.style.borderBottom = '1px solid rgba(229, 231, 235, 0.8)';
        header.style.boxShadow = 'none';
    }
    
    // Hide/show header based on scroll direction
    if (currentScrollY < lastScrollY || currentScrollY < 10) {
        header.style.transform = 'translateY(0)';
    } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        header.style.transform = 'translateY(-100%)';
    }
    
    lastScrollY = currentScrollY;
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
    }
});
