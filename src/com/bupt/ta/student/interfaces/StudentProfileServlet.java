package com.bupt.ta.student.interfaces;

import com.bupt.ta.shared.interfaces.BaseServlet;
import com.bupt.ta.shared.infrastructure.StudentRepository;
import com.bupt.ta.shared.util.ResponseUtil;
import com.bupt.ta.student.domain.Student;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;

/**
 * 学生个人信息接口
 * GET /api/student/profile - 获取个人信息
 * PUT /api/student/profile - 更新个人信息
 */
@WebServlet("/api/student/profile")
public class StudentProfileServlet extends BaseServlet {
    private final StudentRepository studentRepo = new StudentRepository();
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!requireLogin(request, response)) {
            return;
        }
        
        if (!requireRole(request, response, "student")) {
            return;
        }
        
        try {
            String studentId = getCurrentUserId(request);
            Optional<Student> studentOpt = studentRepo.findById(studentId);
            
            if (!studentOpt.isPresent()) {
                ResponseUtil.sendError(response, 404, "学生信息不存在");
                return;
            }
            
            Student student = studentOpt.get();
            // 不返回密码
            student.setPassword(null);
            
            ResponseUtil.sendSuccess(response, student);
            
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "服务器错误: " + e.getMessage());
        }
    }
    
    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!requireLogin(request, response)) {
            return;
        }
        
        if (!requireRole(request, response, "student")) {
            return;
        }
        
        try {
            String studentId = getCurrentUserId(request);
            Optional<Student> studentOpt = studentRepo.findById(studentId);
            
            if (!studentOpt.isPresent()) {
                ResponseUtil.sendError(response, 404, "学生信息不存在");
                return;
            }
            
            Student existingStudent = studentOpt.get();
            Student updateData = readRequestBody(request, Student.class);
            
            // 更新允许修改的字段
            if (updateData.getPhone() != null) {
                existingStudent.setPhone(updateData.getPhone());
            }
            if (updateData.getMajor() != null) {
                existingStudent.setMajor(updateData.getMajor());
            }
            if (updateData.getGrade() != null) {
                existingStudent.setGrade(updateData.getGrade());
            }
            if (updateData.getGpa() != null) {
                existingStudent.setGpa(updateData.getGpa());
            }
            if (updateData.getAvatar() != null) {
                existingStudent.setAvatar(updateData.getAvatar());
            }
            if (updateData.getSkills() != null) {
                existingStudent.setSkills(updateData.getSkills());
            }
            if (updateData.getResume() != null) {
                existingStudent.setResume(updateData.getResume());
            }
            if (updateData.getSchedule() != null) {
                existingStudent.setSchedule(updateData.getSchedule());
            }
            
            studentRepo.save(existingStudent);
            
            // 不返回密码
            existingStudent.setPassword(null);
            
            ResponseUtil.sendSuccess(response, "更新成功", existingStudent);
            
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "服务器错误: " + e.getMessage());
        }
    }
}
