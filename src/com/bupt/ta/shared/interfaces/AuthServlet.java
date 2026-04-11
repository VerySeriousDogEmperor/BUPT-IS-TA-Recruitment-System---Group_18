package com.bupt.ta.shared.interfaces;

import com.bupt.ta.shared.domain.User;
import com.bupt.ta.shared.infrastructure.StudentRepository;
import com.bupt.ta.shared.infrastructure.UserRepository;
import com.bupt.ta.shared.util.ResponseUtil;
import com.bupt.ta.shared.util.SessionUtil;
import com.bupt.ta.student.domain.Student;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Authentication endpoints.
 * POST /api/auth/login
 * POST /api/auth/register
 * POST /api/auth/logout
 * GET /api/auth/me
 */
@WebServlet("/api/auth/*")
public class AuthServlet extends BaseServlet {
    private final StudentRepository studentRepo = new StudentRepository();
    private final UserRepository userRepo = new UserRepository();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String pathInfo = request.getPathInfo();

        if (pathInfo == null) {
            ResponseUtil.sendError(response, 404, "Endpoint not found");
            return;
        }

        switch (pathInfo) {
            case "/login":
                handleLogin(request, response);
                break;
            case "/register":
                handleRegister(request, response);
                break;
            case "/logout":
                handleLogout(request, response);
                break;
            default:
                ResponseUtil.sendError(response, 404, "Endpoint not found");
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String pathInfo = request.getPathInfo();

        if ("/me".equals(pathInfo)) {
            handleGetCurrentUser(request, response);
        } else {
            ResponseUtil.sendError(response, 404, "Endpoint not found");
        }
    }

    private void handleLogin(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            LoginRequest loginReq = readRequestBody(request, LoginRequest.class);

            if (loginReq.email == null || loginReq.password == null || loginReq.role == null) {
                ResponseUtil.sendError(response, 400, "Email, password, and role are required");
                return;
            }

            if ("student".equals(loginReq.role)) {
                Optional<Student> studentOpt = studentRepo.findByEmail(loginReq.email);
                if (!studentOpt.isPresent()) {
                    ResponseUtil.sendError(response, 400, "Invalid email or password");
                    return;
                }

                Student student = studentOpt.get();
                if (!student.getPassword().equals(loginReq.password)) {
                    ResponseUtil.sendError(response, 400, "Invalid email or password");
                    return;
                }

                student.setLastLoginAt(LocalDateTime.now());
                studentRepo.save(student);
                SessionUtil.setCurrentStudent(request, student);
                student.setPassword(null);
                ResponseUtil.sendSuccess(response, "Login successful", student);
                return;
            }

            Optional<User> userOpt = userRepo.findByEmail(loginReq.email);
            if (!userOpt.isPresent()) {
                ResponseUtil.sendError(response, 400, "Invalid email or password");
                return;
            }

            User user = userOpt.get();
            if (!user.getPassword().equals(loginReq.password)) {
                ResponseUtil.sendError(response, 400, "Invalid email or password");
                return;
            }

            if (!user.getRole().equals(loginReq.role)) {
                ResponseUtil.sendError(response, 400, "Role does not match this account");
                return;
            }

            user.setLastLoginAt(LocalDateTime.now());
            userRepo.save(user);
            SessionUtil.setCurrentUser(request, user);

            Map<String, Object> userData = new HashMap<>();
            userData.put("id", user.getId());
            userData.put("name", user.getName());
            userData.put("email", user.getEmail());
            userData.put("role", user.getRole());

            ResponseUtil.sendSuccess(response, "Login successful", userData);
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "Server error: " + e.getMessage());
        }
    }

    private void handleRegister(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            RegisterRequest registerReq = readRequestBody(request, RegisterRequest.class);

            if (registerReq == null
                    || isBlank(registerReq.name)
                    || isBlank(registerReq.email)
                    || isBlank(registerReq.password)
                    || isBlank(registerReq.studentId)) {
                ResponseUtil.sendError(response, 400, "Name, email, password, and student ID are required");
                return;
            }

            if (registerReq.password.length() < 6) {
                ResponseUtil.sendError(response, 400, "Password must be at least 6 characters");
                return;
            }

            if (studentRepo.findByEmail(registerReq.email).isPresent()) {
                ResponseUtil.sendError(response, 409, "This email is already registered");
                return;
            }

            if (studentRepo.findByStudentId(registerReq.studentId).isPresent()) {
                ResponseUtil.sendError(response, 409, "This student ID is already registered");
                return;
            }

            Student student = new Student();
            student.setId(studentRepo.generateId());
            student.setName(registerReq.name.trim());
            student.setEmail(registerReq.email.trim());
            student.setPassword(registerReq.password);
            student.setStudentId(registerReq.studentId.trim());
            student.setMajor(registerReq.major != null ? registerReq.major.trim() : "");
            student.setGrade(registerReq.grade != null ? registerReq.grade.trim() : "");
            student.setPhone(registerReq.phone != null ? registerReq.phone.trim() : "");
            student.setBio("");
            student.setCreatedAt(LocalDateTime.now());
            student.setLastLoginAt(LocalDateTime.now());

            studentRepo.save(student);
            SessionUtil.setCurrentStudent(request, student);

            student.setPassword(null);
            ResponseUtil.sendSuccess(response, "Registration successful", student);
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "Server error: " + e.getMessage());
        }
    }

    private void handleLogout(HttpServletRequest request, HttpServletResponse response) throws IOException {
        SessionUtil.logout(request);
        ResponseUtil.sendSuccess(response, "Logout successful", null);
    }

    private void handleGetCurrentUser(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!requireLogin(request, response)) {
            return;
        }

        String userId = getCurrentUserId(request);
        String role = SessionUtil.getCurrentUserRole(request);

        try {
            Map<String, Object> userData = new HashMap<>();

            if ("student".equals(role)) {
                Optional<Student> studentOpt = studentRepo.findById(userId);
                if (studentOpt.isPresent()) {
                    Student student = studentOpt.get();
                    student.setPassword(null);
                    ResponseUtil.sendSuccess(response, student);
                    return;
                }
            } else {
                Optional<User> userOpt = userRepo.findById(userId);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    userData.put("id", user.getId());
                    userData.put("name", user.getName());
                    userData.put("email", user.getEmail());
                    userData.put("role", user.getRole());
                    ResponseUtil.sendSuccess(response, userData);
                    return;
                }
            }

            ResponseUtil.sendError(response, 404, "User not found");
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "Server error: " + e.getMessage());
        }
    }

    private static class LoginRequest {
        String email;
        String password;
        String role;
    }

    private static class RegisterRequest {
        String name;
        String email;
        String password;
        String studentId;
        String major;
        String grade;
        String phone;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
