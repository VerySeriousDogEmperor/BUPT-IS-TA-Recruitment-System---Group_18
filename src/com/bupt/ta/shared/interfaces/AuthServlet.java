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
 * 认证接口
 * POST /api/auth/login - 登录
 * POST /api/auth/register - 注册
 * POST /api/auth/logout - 登出
 * GET /api/auth/me - 获取当前用户信息
 */
@WebServlet("/api/auth/*")
public class AuthServlet extends BaseServlet {
    private final StudentRepository studentRepo = new StudentRepository();
    private final UserRepository userRepo = new UserRepository();
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String pathInfo = request.getPathInfo();
        
        if (pathInfo == null) {
            ResponseUtil.sendError(response, 404, "接口不存在");
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
                ResponseUtil.sendError(response, 404, "接口不存在");
        }
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String pathInfo = request.getPathInfo();
        
        if ("/me".equals(pathInfo)) {
            handleGetCurrentUser(request, response);
        } else {
            ResponseUtil.sendError(response, 404, "接口不存在");
        }
    }

    
    /**
     * 处理登录
     */
    private void handleLogin(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            LoginRequest loginReq = readRequestBody(request, LoginRequest.class);
            
            // 验证参数
            if (loginReq.email == null || loginReq.password == null) {
                ResponseUtil.sendError(response, 400, "邮箱和密码不能为空");
                return;
            }
            
            // 根据角色查找用户
            if ("student".equals(loginReq.role)) {
                // 学生登录
                Optional<Student> studentOpt = studentRepo.findByEmail(loginReq.email);
                if (!studentOpt.isPresent()) {
                    ResponseUtil.sendError(response, 400, "邮箱或密码错误");
                    return;
                }
                
                Student student = studentOpt.get();
                if (!student.getPassword().equals(loginReq.password)) {
                    ResponseUtil.sendError(response, 400, "邮箱或密码错误");
                    return;
                }
                
                // 更新最后登录时间
                student.setLastLoginAt(LocalDateTime.now());
                studentRepo.save(student);
                
                // 设置 Session
                SessionUtil.setCurrentStudent(request, student);
                
                // 返回完整的用户信息（不包含密码）
                student.setPassword(null);
                
                ResponseUtil.sendSuccess(response, "登录成功", student);
                
            } else {
                // MO/Admin 登录
                Optional<User> userOpt = userRepo.findByEmail(loginReq.email);
                if (!userOpt.isPresent()) {
                    ResponseUtil.sendError(response, 400, "邮箱或密码错误");
                    return;
                }
                
                User user = userOpt.get();
                if (!user.getPassword().equals(loginReq.password)) {
                    ResponseUtil.sendError(response, 400, "邮箱或密码错误");
                    return;
                }
                
                if (!user.getRole().equals(loginReq.role)) {
                    ResponseUtil.sendError(response, 400, "角色不匹配");
                    return;
                }
                
                // 更新最后登录时间
                user.setLastLoginAt(LocalDateTime.now());
                userRepo.save(user);
                
                // 设置 Session
                SessionUtil.setCurrentUser(request, user);
                
                // 返回用户信息
                Map<String, Object> userData = new HashMap<>();
                userData.put("id", user.getId());
                userData.put("name", user.getName());
                userData.put("email", user.getEmail());
                userData.put("role", user.getRole());
                
                ResponseUtil.sendSuccess(response, "登录成功", userData);
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "服务器错误: " + e.getMessage());
        }
    }

    
    /**
     * 处理注册
     */
    private void handleRegister(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            RegisterRequest regReq = readRequestBody(request, RegisterRequest.class);
            
            // 验证参数
            if (regReq.name == null || regReq.email == null || regReq.password == null ||
                regReq.studentId == null || regReq.phone == null || regReq.major == null) {
                ResponseUtil.sendError(response, 400, "所有字段都不能为空");
                return;
            }
            
            // 验证邮箱格式
            if (!regReq.email.endsWith("@bupt.edu.cn")) {
                ResponseUtil.sendError(response, 400, "邮箱必须是 @bupt.edu.cn 结尾");
                return;
            }
            
            // 检查邮箱是否已存在
            if (studentRepo.findByEmail(regReq.email).isPresent()) {
                ResponseUtil.sendError(response, 409, "该邮箱已被注册");
                return;
            }
            
            // 检查学号是否已存在
            if (studentRepo.findByStudentId(regReq.studentId).isPresent()) {
                ResponseUtil.sendError(response, 409, "该学号已被注册");
                return;
            }
            
            // 创建学生
            Student student = new Student();
            student.setId(studentRepo.generateId());
            student.setName(regReq.name);
            student.setEmail(regReq.email);
            student.setPassword(regReq.password);
            student.setStudentId(regReq.studentId);
            student.setPhone(regReq.phone);
            student.setMajor(regReq.major);
            
            studentRepo.save(student);
            
            // 自动登录
            SessionUtil.setCurrentStudent(request, student);
            
            // 返回完整的用户信息（不包含密码）
            student.setPassword(null);
            
            ResponseUtil.sendSuccess(response, "注册成功", student);
            
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "服务器错误: " + e.getMessage());
        }
    }
    
    /**
     * 处理登出
     */
    private void handleLogout(HttpServletRequest request, HttpServletResponse response) throws IOException {
        SessionUtil.logout(request);
        ResponseUtil.sendSuccess(response, "登出成功", null);
    }
    
    /**
     * 获取当前用户信息
     */
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
            
            ResponseUtil.sendError(response, 404, "用户不存在");
            
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "服务器错误: " + e.getMessage());
        }
    }
    
    // 请求对象
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
        String phone;
        String major;
    }
}
