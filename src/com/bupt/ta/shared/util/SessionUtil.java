package com.bupt.ta.shared.util;

import com.bupt.ta.shared.domain.User;
import com.bupt.ta.student.domain.Student;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

/**
 * Session 管理工具类
 */
public class SessionUtil {
    private static final String USER_KEY = "currentUser";
    private static final String USER_ID_KEY = "userId";
    private static final String USER_ROLE_KEY = "userRole";
    
    /**
     * 设置当前用户（学生）
     */
    public static void setCurrentStudent(HttpServletRequest request, Student student) {
        HttpSession session = request.getSession(true);
        session.setAttribute(USER_KEY, student);
        session.setAttribute(USER_ID_KEY, student.getId());
        session.setAttribute(USER_ROLE_KEY, student.getRole());
    }
    
    /**
     * 设置当前用户（MO/Admin）
     */
    public static void setCurrentUser(HttpServletRequest request, User user) {
        HttpSession session = request.getSession(true);
        session.setAttribute(USER_KEY, user);
        session.setAttribute(USER_ID_KEY, user.getId());
        session.setAttribute(USER_ROLE_KEY, user.getRole());
    }
    
    /**
     * 获取当前用户ID
     */
    public static String getCurrentUserId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            return null;
        }
        return (String) session.getAttribute(USER_ID_KEY);
    }
    
    /**
     * 获取当前用户角色
     */
    public static String getCurrentUserRole(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            return null;
        }
        return (String) session.getAttribute(USER_ROLE_KEY);
    }
    
    /**
     * 获取当前用户对象
     */
    public static Object getCurrentUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            return null;
        }
        return session.getAttribute(USER_KEY);
    }
    
    /**
     * 获取当前学生对象
     */
    public static Student getCurrentStudent(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            return null;
        }
        Object user = session.getAttribute(USER_KEY);
        if (user instanceof Student) {
            return (Student) user;
        }
        return null;
    }
    
    /**
     * 获取当前 MO/Admin 用户对象
     */
    public static User getCurrentMOUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            return null;
        }
        Object user = session.getAttribute(USER_KEY);
        if (user instanceof User) {
            return (User) user;
        }
        return null;
    }
    
    /**
     * 检查是否已登录
     */
    public static boolean isLoggedIn(HttpServletRequest request) {
        return getCurrentUserId(request) != null;
    }
    
    /**
     * 检查是否是指定角色
     */
    public static boolean hasRole(HttpServletRequest request, String role) {
        String userRole = getCurrentUserRole(request);
        return userRole != null && userRole.equals(role);
    }
    
    /**
     * 登出
     */
    public static void logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
    }
}
