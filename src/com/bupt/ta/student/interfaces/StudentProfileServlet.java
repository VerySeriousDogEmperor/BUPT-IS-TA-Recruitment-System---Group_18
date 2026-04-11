package com.bupt.ta.student.interfaces;

import com.bupt.ta.shared.domain.Resume;
import com.bupt.ta.shared.domain.Schedule;
import com.bupt.ta.shared.interfaces.BaseServlet;
import com.bupt.ta.shared.infrastructure.StudentRepository;
import com.bupt.ta.shared.util.ResponseUtil;
import com.bupt.ta.student.domain.Student;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 学生个人信息接口
 * GET /api/student/profile - 获取个人信息
 * PUT /api/student/profile - 更新个人信息/密码/简历
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
            UpdateProfileRequest updateData = readRequestBody(request, UpdateProfileRequest.class);

            if (updateData == null) {
                ResponseUtil.sendError(response, 400, "请求体不能为空");
                return;
            }

            if (updateData.phone != null) {
                existingStudent.setPhone(updateData.phone);
            }
            if (updateData.major != null) {
                existingStudent.setMajor(updateData.major);
            }
            if (updateData.grade != null) {
                existingStudent.setGrade(updateData.grade);
            }
            if (updateData.bio != null) {
                existingStudent.setBio(updateData.bio);
            }
            if (updateData.gpa != null) {
                existingStudent.setGpa(updateData.gpa);
            }
            if (updateData.avatar != null) {
                existingStudent.setAvatar(updateData.avatar);
            }
            if (updateData.skills != null) {
                existingStudent.setSkills(updateData.skills);
            }
            if (updateData.resume != null) {
                existingStudent.setResume(updateData.resume);
            }
            if (updateData.schedule != null) {
                existingStudent.setSchedule(updateData.schedule);
            }
            if (updateData.resumePdfName != null) {
                existingStudent.setResumePdfName(updateData.resumePdfName);
            }
            if (updateData.resumePdfData != null) {
                existingStudent.setResumePdfData(updateData.resumePdfData);
            }
            if (updateData.resumePdfUploadedAt != null) {
                existingStudent.setResumePdfUploadedAt(updateData.resumePdfUploadedAt);
            }
            if (Boolean.TRUE.equals(updateData.clearResumePdf)) {
                existingStudent.setResumePdfName(null);
                existingStudent.setResumePdfData(null);
                existingStudent.setResumePdfUploadedAt(null);
            }

            if (updateData.newPassword != null && !updateData.newPassword.isBlank()) {
                if (updateData.currentPassword == null || !updateData.currentPassword.equals(existingStudent.getPassword())) {
                    ResponseUtil.sendError(response, 400, "当前密码不正确");
                    return;
                }
                if (updateData.newPassword.length() < 6) {
                    ResponseUtil.sendError(response, 400, "新密码至少 6 位");
                    return;
                }
                existingStudent.setPassword(updateData.newPassword);
            }

            studentRepo.save(existingStudent);
            existingStudent.setPassword(null);
            ResponseUtil.sendSuccess(response, "更新成功", existingStudent);

        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "服务器错误: " + e.getMessage());
        }
    }

    private static class UpdateProfileRequest {
        String phone;
        String major;
        String grade;
        String bio;
        Double gpa;
        String avatar;
        List<String> skills;
        Resume resume;
        Schedule schedule;
        String currentPassword;
        String newPassword;
        String resumePdfName;
        String resumePdfData;
        LocalDateTime resumePdfUploadedAt;
        Boolean clearResumePdf;
    }
}
