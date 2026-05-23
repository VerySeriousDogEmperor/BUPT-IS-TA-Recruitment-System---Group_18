package com.bupt.ta.shared.util;

import com.bupt.ta.shared.domain.User;
import com.bupt.ta.shared.infrastructure.StudentRepository;
import com.bupt.ta.shared.infrastructure.UserRepository;
import com.bupt.ta.student.domain.Student;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Optional;

/**
 * Session 管理工具类
 */
public class SessionUtil {
    private static final String USER_KEY = "currentUser";
    private static final String USER_ID_KEY = "userId";
    private static final String USER_ROLE_KEY = "userRole";
    private static final String CSRF_TOKEN_KEY = "csrfToken";
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final StudentRepository STUDENT_REPO = new StudentRepository();
    private static final UserRepository USER_REPO = new UserRepository();
    
    /**
     * 设置当前用户（学生）
     */
    public static void setCurrentStudent(HttpServletRequest request, Student student) {
        HttpSession session = request.getSession(true);
        session.setAttribute(USER_KEY, student);
        session.setAttribute(USER_ID_KEY, student.getId());
        session.setAttribute(USER_ROLE_KEY, student.getRole());
        ensureCsrfToken(request);
    }
    
    /**
     * 设置当前用户（MO/Admin）
     */
    public static void setCurrentUser(HttpServletRequest request, User user) {
        HttpSession session = request.getSession(true);
        session.setAttribute(USER_KEY, user);
        session.setAttribute(USER_ID_KEY, user.getId());
        session.setAttribute(USER_ROLE_KEY, user.getRole());
        ensureCsrfToken(request);
    }
    
    /**
     * 获取当前用户ID
     */
    public static String getCurrentUserId(HttpServletRequest request) {
        if (!ensureActiveSession(request)) {
            return null;
        }
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
        if (!ensureActiveSession(request)) {
            return null;
        }
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
        if (!ensureActiveSession(request)) {
            return null;
        }
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
        if (!ensureActiveSession(request)) {
            return null;
        }
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
        if (!ensureActiveSession(request)) {
            return null;
        }
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
        return ensureActiveSession(request);
    }
    
    /**
     * 检查是否是指定角色
     */
    public static boolean hasRole(HttpServletRequest request, String role) {
        if (!ensureActiveSession(request)) {
            return false;
        }
        String userRole = getCurrentUserRole(request);
        return userRole != null && userRole.equals(role);
    }

    public static String getCsrfToken(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            return null;
        }
        Object token = session.getAttribute(CSRF_TOKEN_KEY);
        return token instanceof String ? (String) token : null;
    }

    public static String ensureCsrfToken(HttpServletRequest request) {
        HttpSession session = request.getSession(true);
        Object existing = session.getAttribute(CSRF_TOKEN_KEY);
        if (existing instanceof String && !((String) existing).isBlank()) {
            return (String) existing;
        }
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        session.setAttribute(CSRF_TOKEN_KEY, token);
        return token;
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

    private static boolean ensureActiveSession(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            return false;
        }

        Object userIdValue = session.getAttribute(USER_ID_KEY);
        Object roleValue = session.getAttribute(USER_ROLE_KEY);
        if (!(userIdValue instanceof String) || !(roleValue instanceof String)) {
            logout(request);
            return false;
        }

        String userId = (String) userIdValue;
        String role = (String) roleValue;
        try {
            if ("student".equals(role)) {
                Optional<Student> studentOpt = STUDENT_REPO.findById(userId);
                if (!studentOpt.isPresent() || !"active".equals(studentOpt.get().getStatus())) {
                    logout(request);
                    return false;
                }
                Student student = studentOpt.get();
                student.setPassword(null);
                session.setAttribute(USER_KEY, student);
                session.setAttribute(USER_ROLE_KEY, student.getRole());
                return true;
            }

            Optional<User> userOpt = USER_REPO.findById(userId);
            if (!userOpt.isPresent()
                    || !"active".equals(userOpt.get().getStatus())
                    || !role.equals(userOpt.get().getRole())) {
                logout(request);
                return false;
            }
            User user = userOpt.get();
            user.setPassword(null);
            session.setAttribute(USER_KEY, user);
            session.setAttribute(USER_ROLE_KEY, user.getRole());
            return true;
        } catch (Exception e) {
            logout(request);
            return false;
        }
    }
}
