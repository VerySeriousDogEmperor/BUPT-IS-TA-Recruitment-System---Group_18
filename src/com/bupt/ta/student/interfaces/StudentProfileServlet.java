package com.bupt.ta.student.interfaces;

import com.bupt.ta.shared.domain.Resume;
import com.bupt.ta.shared.domain.Schedule;
import com.bupt.ta.shared.interfaces.BaseServlet;
import com.bupt.ta.shared.infrastructure.StudentRepository;
import com.bupt.ta.shared.util.PasswordUtil;
import com.bupt.ta.shared.util.ResponseUtil;
import com.bupt.ta.shared.util.SessionUtil;
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
    private static final int MAX_AVATAR_BYTES = 2 * 1024 * 1024;
    private static final int MAX_RESUME_PDF_BYTES = 5 * 1024 * 1024;
    private static final int MAX_PROFILE_TEXT_LENGTH = 2000;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!requireLogin(request, response)) {
            return;
        }

        if (!requireRole(request, response, "student")) {
            return;
        }

        if (!requireCsrf(request, response)) {
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
            student.setCsrfToken(SessionUtil.ensureCsrfToken(request));
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

        if (!requireCsrf(request, response)) {
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
                existingStudent.setPhone(trimLimit(updateData.phone, 80));
            }
            if (updateData.major != null) {
                existingStudent.setMajor(trimLimit(updateData.major, 120));
            }
            if (updateData.grade != null) {
                existingStudent.setGrade(trimLimit(updateData.grade, 80));
            }
            if (updateData.bio != null) {
                existingStudent.setBio(trimLimit(updateData.bio, MAX_PROFILE_TEXT_LENGTH));
            }
            if (updateData.gpa != null) {
                if (updateData.gpa < 0 || updateData.gpa > 4.0) {
                    ResponseUtil.sendError(response, 400, "GPA must be between 0 and 4.0");
                    return;
                }
                existingStudent.setGpa(updateData.gpa);
            }
            if (updateData.avatar != null) {
                String avatarError = validateDataUrl(updateData.avatar, "data:image/", MAX_AVATAR_BYTES, "Avatar");
                if (avatarError != null) {
                    ResponseUtil.sendError(response, 400, avatarError);
                    return;
                }
                existingStudent.setAvatar(updateData.avatar);
            }
            if (updateData.skills != null) {
                if (updateData.skills.size() > 30) {
                    ResponseUtil.sendError(response, 400, "No more than 30 skills are allowed");
                    return;
                }
                existingStudent.setSkills(updateData.skills.stream()
                        .filter(skill -> skill != null && !skill.isBlank())
                        .map(skill -> trimLimit(skill, 80))
                        .collect(java.util.stream.Collectors.toList()));
            }
            if (updateData.resume != null) {
                existingStudent.setResume(updateData.resume);
            }
            if (updateData.schedule != null) {
                String scheduleError = validateSchedule(updateData.schedule);
                if (scheduleError != null) {
                    ResponseUtil.sendError(response, 400, scheduleError);
                    return;
                }
                existingStudent.setSchedule(updateData.schedule);
            }
            if (updateData.resumePdfName != null) {
                existingStudent.setResumePdfName(trimLimit(updateData.resumePdfName, 160));
            }
            if (updateData.resumePdfData != null) {
                String pdfError = validateDataUrl(updateData.resumePdfData, "data:application/pdf;base64,", MAX_RESUME_PDF_BYTES, "Resume PDF");
                if (pdfError != null) {
                    ResponseUtil.sendError(response, 400, pdfError);
                    return;
                }
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
                if (updateData.currentPassword == null || !PasswordUtil.verify(updateData.currentPassword, existingStudent.getPassword())) {
                    ResponseUtil.sendError(response, 400, "当前密码不正确");
                    return;
                }
                if (updateData.newPassword.length() < 6) {
                    ResponseUtil.sendError(response, 400, "新密码至少 6 位");
                    return;
                }
                existingStudent.setPassword(PasswordUtil.hash(updateData.newPassword));
            }

            if ((updateData.newPassword == null || updateData.newPassword.isBlank())
                    && PasswordUtil.needsRehash(existingStudent.getPassword())
                    && updateData.currentPassword != null
                    && PasswordUtil.verify(updateData.currentPassword, existingStudent.getPassword())) {
                existingStudent.setPassword(PasswordUtil.hash(updateData.currentPassword));
            }

            studentRepo.save(existingStudent);
            existingStudent.setPassword(null);
            existingStudent.setCsrfToken(SessionUtil.ensureCsrfToken(request));
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

    private String trimLimit(String value, int maxLength) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.length() <= maxLength ? trimmed : trimmed.substring(0, maxLength);
    }

    private String validateDataUrl(String value, String requiredPrefix, int maxBytes, String label) {
        if (value == null || value.isBlank()) {
            return null;
        }
        if (!value.startsWith(requiredPrefix)) {
            return label + " must use a valid data URL";
        }
        if ("data:image/".equals(requiredPrefix)
                && !(value.startsWith("data:image/png;base64,")
                || value.startsWith("data:image/jpeg;base64,")
                || value.startsWith("data:image/jpg;base64,")
                || value.startsWith("data:image/webp;base64,")
                || value.startsWith("data:image/gif;base64,"))) {
            return label + " must be PNG, JPG, WebP, or GIF";
        }
        int commaIndex = value.indexOf(',');
        if (commaIndex < 0) {
            return label + " data is malformed";
        }
        String payload = value.substring(commaIndex + 1).replaceAll("\\s", "");
        int estimatedBytes = payload.length() * 3 / 4;
        if (estimatedBytes > maxBytes) {
            return label + " exceeds the allowed size";
        }
        return null;
    }

    private String validateSchedule(Schedule schedule) {
        String error = validateScheduleSlots("Monday", schedule.getMonday());
        if (error != null) return error;
        error = validateScheduleSlots("Tuesday", schedule.getTuesday());
        if (error != null) return error;
        error = validateScheduleSlots("Wednesday", schedule.getWednesday());
        if (error != null) return error;
        error = validateScheduleSlots("Thursday", schedule.getThursday());
        if (error != null) return error;
        error = validateScheduleSlots("Friday", schedule.getFriday());
        if (error != null) return error;
        error = validateScheduleSlots("Saturday", schedule.getSaturday());
        if (error != null) return error;
        return validateScheduleSlots("Sunday", schedule.getSunday());
    }

    private String validateScheduleSlots(String day, List<String> slots) {
        if (slots == null) {
            return null;
        }
        if (slots.size() > 20) {
            return day + " has too many schedule entries";
        }
        for (String slot : slots) {
            if (slot == null || slot.isBlank()) {
                continue;
            }
            int[] range = parseScheduleRange(slot);
            if (range == null || range[0] >= range[1]) {
                return "Invalid schedule time on " + day + ": " + slot;
            }
        }
        return null;
    }

    private int[] parseScheduleRange(String value) {
        String[] parts = value.trim().split("\\s+")[0].split("-");
        if (parts.length != 2) {
            return null;
        }
        Integer start = parseMinutes(parts[0]);
        Integer end = parseMinutes(parts[1]);
        return start == null || end == null ? null : new int[]{start, end};
    }

    private Integer parseMinutes(String value) {
        String[] parts = value.trim().split(":");
        if (parts.length != 2) {
            return null;
        }
        try {
            int hours = Integer.parseInt(parts[0]);
            int minutes = Integer.parseInt(parts[1]);
            if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
                return null;
            }
            return hours * 60 + minutes;
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
