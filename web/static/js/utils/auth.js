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

// 全局函数：切换用户下拉菜单
let isTogglingDropdown = false; // 防止重复触发
function toggleUserDropdown(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation(); // 阻止所有其他监听器
    }
    
    // 防止重复触发
    if (isTogglingDropdown) {
        console.log('Already toggling, skipping...'); // Debug
        return;
    }
    
    isTogglingDropdown = true;
    
    const dropdown = document.getElementById('userDropdown');
    console.log('Toggle dropdown clicked, dropdown element:', dropdown); // Debug
    
    if (dropdown) {
        const isShowing = dropdown.classList.contains('show');
        console.log('Current state:', isShowing ? 'showing' : 'hidden'); // Debug
        dropdown.classList.toggle('show');
        console.log('New state:', dropdown.classList.contains('show') ? 'showing' : 'hidden'); // Debug
    } else {
        console.error('Dropdown element not found!'); // Debug
    }
    
    // 重置标志
    setTimeout(() => {
        isTogglingDropdown = false;
    }, 100);
}

// 全局函数：处理登出
function handleLogout(event) {
    if (event) {
        event.preventDefault();
    }
    logout();
}

// 将函数暴露到全局作用域
window.toggleUserDropdown = toggleUserDropdown;
window.handleLogout = handleLogout;

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
            userMenu.style.opacity = '1';
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
        
        // 不再调用initUserMenu，完全依赖内联事件处理器
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

// 初始化用户菜单下拉
function initUserMenu() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    console.log('Initializing user menu:', { userMenuBtn, userDropdown }); // Debug
    
    if (userMenuBtn && userDropdown) {
        // 检查是否已经有内联事件处理器
        if (userMenuBtn.onclick) {
            console.log('User menu already has inline onclick handler, skipping addEventListener'); // Debug
            return; // 如果已经有内联事件，就不再添加监听器
        }
        
        // 移除旧的事件监听器（如果有）
        const newUserMenuBtn = userMenuBtn.cloneNode(true);
        userMenuBtn.parentNode.replaceChild(newUserMenuBtn, userMenuBtn);
        
        // 添加新的事件监听器
        newUserMenuBtn.addEventListener('click', (e) => {
            console.log('User menu button clicked'); // Debug
            e.preventDefault();
            e.stopPropagation();
            
            const dropdown = document.getElementById('userDropdown');
            if (dropdown) {
                const isShowing = dropdown.classList.contains('show');
                console.log('Dropdown current state:', isShowing ? 'showing' : 'hidden'); // Debug
                dropdown.classList.toggle('show');
                console.log('Dropdown new state:', dropdown.classList.contains('show') ? 'showing' : 'hidden'); // Debug
            }
        });
        
        // 点击其他地方关闭下拉菜单
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('userDropdown');
            if (dropdown && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
        
        console.log('User menu initialized successfully'); // Debug
    } else {
        console.warn('User menu elements not found'); // Debug
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing auth'); // Debug
    updateHeaderAuth();
    
    // 点击页面其他地方关闭下拉菜单
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('userDropdown');
        const userMenuBtn = document.getElementById('userMenuBtn');
        
        if (dropdown && userMenuBtn) {
            // 如果点击的不是按钮也不是下拉菜单内部，则关闭下拉菜单
            if (!userMenuBtn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        }
    });
    
    // 绑定登出按钮（备用方案）
    const logoutLinks = document.querySelectorAll('a[href="/login.html"].dropdown-item, a[href="#"].dropdown-item');
    logoutLinks.forEach(link => {
        if (link.textContent.trim() === 'Logout') {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        }
    });
});
