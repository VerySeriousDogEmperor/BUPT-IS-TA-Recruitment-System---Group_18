/**
 * 认证工具类
 */

/**
 * 检查是否已登录
 */
async function checkAuth() {
  try {
    const user = await API.auth.me();
    return user;
  } catch (error) {
    return null;
  }
}

/**
 * 要求登录（未登录则跳转）
 */
async function requireAuth(requiredRole = null) {
  const user = await checkAuth();
  
  if (!user) {
    window.location.href = '/login.html';
    return null;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    alert('无权限访问');
    window.location.href = '/';
    return null;
  }
  
  return user;
}

/**
 * 登出
 */
async function logout() {
  try {
    await API.auth.logout();
    window.location.href = '/login.html';
  } catch (error) {
    console.error('登出失败:', error);
  }
}

/**
 * 根据角色跳转到对应的首页
 */
function redirectByRole(role) {
  const routes = {
    student: '/student/dashboard',
    mo: '/mo/index',
    admin: '/admin/index'
  };
  window.location.href = routes[role] || '/';
}
