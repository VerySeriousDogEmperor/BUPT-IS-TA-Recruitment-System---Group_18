/**
 * Authentication Utilities
 * 统一的认证状态管理
 */

// 检查用户是否已登录
function isAuthenticated() {
    try {
        const userData = localStorage.getItem('user');
        if (!userData || userData === 'undefined' || userData === 'null') {
            return false;
        }
        const user = JSON.parse(userData);
        return user && user.name && user.email;
    } catch (e) {
        console.error('Error checking authentication:', e);
        return false;
    }
}

// 获取当前用户信息
function getCurrentUser() {
    try {
        const userData = localStorage.getItem('user');
        if (!userData || userData === 'undefined' || userData === 'null') {
            return null;
        }
        return JSON.parse(userData);
    } catch (e) {
        console.error('Error getting current user:', e);
        return null;
    }
}

// 登出
function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/login.html';
}

// 更新Header显示
function updateHeaderAuth() {
    const isLoggedIn = isAuthenticated();
    const user = getCurrentUser();
    
    console.log('Auth check:', { isLoggedIn, user }); // Debug log
    
    // 获取header元素
    const notificationBtn = document.getElementById('notificationBtn');
    const userMenu = document.querySelector('.header-user-menu');
    const authButtons = document.querySelector('.header-auth-buttons');
    
    console.log('Header elements:', { notificationBtn, userMenu, authButtons }); // Debug log
    
    if (isLoggedIn && user) {
        console.log('User is logged in, showing user menu'); // Debug log
        // 已登录：显示用户菜单和通知
        if (notificationBtn) {
            notificationBtn.style.display = 'block';
            notificationBtn.style.visibility = 'visible';
        }
        if (userMenu) {
            userMenu.style.display = 'block';
            userMenu.style.visibility = 'visible';
        }
        if (authButtons) {
            authButtons.style.display = 'none';
            authButtons.style.visibility = 'hidden';
        }
        
        // 更新用户信息
        const userName = document.querySelector('.user-name');
        const userEmail = document.querySelector('.user-email');
        if (userName) userName.textContent = user.name || 'Guest User';
        if (userEmail) userEmail.textContent = user.email || 'guest@bupt.edu.cn';
    } else {
        console.log('User is not logged in, showing login buttons'); // Debug log
        // 未登录：显示登录按钮
        if (notificationBtn) {
            notificationBtn.style.display = 'none';
            notificationBtn.style.visibility = 'hidden';
        }
        if (userMenu) {
            userMenu.style.display = 'none';
            userMenu.style.visibility = 'hidden';
        }
        if (authButtons) {
            authButtons.style.display = 'flex';
            authButtons.style.visibility = 'visible';
        }
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    updateHeaderAuth();
    
    // 绑定用户菜单下拉
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
        
        document.addEventListener('click', () => {
            userDropdown.classList.remove('show');
        });
    }
    
    // 绑定登出按钮
    const logoutLinks = document.querySelectorAll('a[href="/login.html"].dropdown-item');
    logoutLinks.forEach(link => {
        if (link.textContent.trim() === 'Logout') {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        }
    });
});
