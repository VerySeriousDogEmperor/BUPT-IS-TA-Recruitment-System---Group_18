/**
 * Shared authentication helpers for student-facing pages.
 */

function clearAuthState() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('csrfToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAuthenticated');
}

function isAuthenticated() {
    try {
        const userData = localStorage.getItem('user');
        if (!userData || userData === 'undefined' || userData === 'null') {
            return false;
        }
        const user = JSON.parse(userData);
        return Boolean(user && user.name && user.email);
    } catch (error) {
        console.error('Error checking authentication:', error);
        return false;
    }
}

function getCurrentUser() {
    try {
        const userData = localStorage.getItem('user');
        if (!userData || userData === 'undefined' || userData === 'null') {
            return null;
        }
        return JSON.parse(userData);
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

async function logout(redirectUrl = '/login.html') {
    try {
        if (typeof API !== 'undefined' && API.auth?.logout) {
            await API.auth.logout();
        } else if (typeof fetch !== 'undefined') {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
        }
    } catch (error) {
        console.warn('Logout fell back to local cleanup:', error);
    }

    clearAuthState();
    window.location.href = redirectUrl;
}

let isTogglingDropdown = false;
function toggleUserDropdown(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    }

    if (isTogglingDropdown) {
        return;
    }

    isTogglingDropdown = true;
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }

    setTimeout(() => {
        isTogglingDropdown = false;
    }, 100);
}

async function handleLogout(event) {
    if (event) {
        event.preventDefault();
    }
    await logout();
}

window.toggleUserDropdown = toggleUserDropdown;
window.handleLogout = handleLogout;

function updateHeaderAuth() {
    const loggedIn = isAuthenticated();
    const user = getCurrentUser();

    const notificationBtn = document.getElementById('notificationBtn');
    const userMenu = document.querySelector('.header-user-menu');
    const authButtons = document.querySelector('.header-auth-buttons');

    if (loggedIn && user) {
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

        const userName = document.querySelector('.user-name');
        const userEmail = document.querySelector('.user-email');
        if (userName) userName.textContent = user.name || 'Guest User';
        if (userEmail) userEmail.textContent = user.email || 'guest@bupt.edu.cn';
    } else {
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

async function syncAuthWithSession() {
    if (typeof fetch === 'undefined') {
        updateHeaderAuth();
        return;
    }

    try {
        const response = await fetch('/api/auth/me', {
            credentials: 'include'
        });
        const result = await response.json();

        if (result.code === 200 && result.data) {
            localStorage.setItem('user', JSON.stringify(result.data));
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userRole', result.data.role || '');
        } else {
            clearAuthState();
        }
    } catch (error) {
        clearAuthState();
    }

    updateHeaderAuth();
    document.dispatchEvent(new CustomEvent('auth-state-changed'));
}

document.addEventListener('DOMContentLoaded', () => {
    syncAuthWithSession();

    document.addEventListener('click', (event) => {
        const dropdown = document.getElementById('userDropdown');
        const userMenuBtn = document.getElementById('userMenuBtn');
        if (!dropdown || !userMenuBtn) {
            return;
        }
        if (!userMenuBtn.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.classList.remove('show');
        }
    });

    const logoutLinks = document.querySelectorAll('a[href="/login.html"].dropdown-item, a[href="#"].dropdown-item');
    logoutLinks.forEach((link) => {
        if (link.textContent.trim() === 'Logout') {
            link.addEventListener('click', async (event) => {
                event.preventDefault();
                await logout();
            });
        }
    });
});
