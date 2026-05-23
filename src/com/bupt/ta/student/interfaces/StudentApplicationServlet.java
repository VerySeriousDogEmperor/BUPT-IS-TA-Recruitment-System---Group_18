package com.bupt.ta.student.interfaces;

import com.bupt.ta.shared.domain.Application;
import com.bupt.ta.shared.domain.Job;
import com.bupt.ta.shared.domain.Resume;
import com.bupt.ta.shared.domain.Schedule;
import com.bupt.ta.shared.infrastructure.ApplicationRepository;
import com.bupt.ta.shared.infrastructure.JobRepository;
import com.bupt.ta.shared.infrastructure.SettingsRepository;
import com.bupt.ta.shared.infrastructure.StudentRepository;
import com.bupt.ta.shared.interfaces.BaseServlet;
import com.bupt.ta.shared.util.ResponseUtil;
import com.bupt.ta.student.domain.Student;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 学生申请管理接口
 * GET /api/student/applications - 获取我的申请列表
 * POST /api/student/applications - 申请职位
 * DELETE /api/student/applications/{id} - 撤回申请
 */
@WebServlet("/api/student/applications/*")
public class StudentApplicationServlet extends BaseServlet {
    private final ApplicationRepository appRepo = new ApplicationRepository();
    private final JobRepository jobRepo = new JobRepository();
    private final SettingsRepository settingsRepo = new SettingsRepository();
    private final StudentRepository studentRepo = new StudentRepository();
    private static final int MAX_WEEKLY_APPLICATION_HOURS = 20;
    
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
            String status = request.getParameter("status");
            
            // 获取学生的所有申请
            List<Application> applications = appRepo.findByStudentId(studentId);
            
            // 按状态筛选
            if (status != null && !status.isEmpty()) {
                applications = applications.stream()
                        .filter(a -> a.getStatus().equals(status))
                        .collect(Collectors.toList());
            }
            
            // 补充职位信息
            List<Map<String, Object>> result = new ArrayList<>();
            for (Application app : applications) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", app.getId());
                item.put("jobId", app.getJobId());
                item.put("status", app.getStatus());
                item.put("coverLetter", app.getCoverLetter());
                item.put("appliedAt", app.getAppliedAt());
                item.put("updatedAt", app.getUpdatedAt());
                item.put("reviewNote", firstText(app.getReviewNote(), app.getReviewComment()));
                item.put("reviewComment", app.getReviewComment());
                item.put("timeline", app.getTimeline());
                
                // 获取职位信息
                Optional<Job> jobOpt = jobRepo.findById(app.getJobId());
                if (jobOpt.isPresent()) {
                    Job job = jobOpt.get();
                    item.put("jobTitle", job.getTitle());
                    item.put("department", job.getDepartment());
                }
                
                result.add(item);
            }
            
            // 按申请时间倒序排序
            result.sort((a, b) -> {
                LocalDateTime timeA = (LocalDateTime) a.get("appliedAt");
                LocalDateTime timeB = (LocalDateTime) b.get("appliedAt");
                return timeB.compareTo(timeA);
            });
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("items", result);
            responseData.put("total", result.size());
            
            ResponseUtil.sendSuccess(response, responseData);
            
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "服务器错误: " + e.getMessage());
        }
    }

    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
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
            ApplyRequest applyReq = readRequestBody(request, ApplyRequest.class);

            if (!Boolean.TRUE.equals(settingsRepo.get().getRecruitmentOpen())) {
                ResponseUtil.sendError(response, 403, "Application portal is closed");
                return;
            }
            
            if (applyReq == null || applyReq.jobId == null || applyReq.jobId.isBlank()) {
                ResponseUtil.sendError(response, 400, "职位ID不能为空");
                return;
            }
            
            // 检查职位是否存在且已发布
            Optional<Job> jobOpt = jobRepo.findById(applyReq.jobId);
            if (!jobOpt.isPresent()) {
                ResponseUtil.sendError(response, 404, "职位不存在");
                return;
            }
            
            Job job = jobOpt.get();
            if (!"published".equals(job.getStatus())) {
                ResponseUtil.sendError(response, 400, "该职位未发布");
                return;
            }
            
            // 检查是否已申请
            if (isPastApplicationDeadline(job)) {
                ResponseUtil.sendError(response, 400, "Application deadline has passed");
                return;
            }

            if (hasActiveApplication(studentId, applyReq.jobId)) {
                ResponseUtil.sendError(response, 409, "您已申请过该职位");
                return;
            }
            
            // 创建申请
            Optional<Student> studentOpt = studentRepo.findById(studentId);
            if (!studentOpt.isPresent()) {
                ResponseUtil.sendError(response, 404, "Student profile not found");
                return;
            }

            Student student = studentOpt.get();
            if (!hasResumeReady(student)) {
                ResponseUtil.sendError(response, 400, "Please upload a PDF resume or complete the standard resume form before applying");
                return;
            }

            if (hasScheduleConflict(student.getSchedule(), job.getSchedule())) {
                ResponseUtil.sendError(response, 409, "Schedule conflict: this position overlaps with your existing timetable");
                return;
            }

            int committedHours = currentApplicationHours(studentId);
            int requestedHours = value(job.getHoursPerWeek());
            if (committedHours + requestedHours > MAX_WEEKLY_APPLICATION_HOURS) {
                ResponseUtil.sendError(response, 409,
                        "Weekly workload limit exceeded: current applications use " + committedHours
                                + "h/week and this position adds " + requestedHours
                                + "h/week (limit " + MAX_WEEKLY_APPLICATION_HOURS + "h/week)");
                return;
            }

            Application application = new Application();
            application.setId(appRepo.generateId());
            application.setStudentId(studentId);
            application.setJobId(applyReq.jobId);
            application.setCoverLetter(limitText(applyReq.coverLetter, 3000));
            
            appRepo.save(application);
            
            Map<String, Object> result = new HashMap<>();
            result.put("id", application.getId());
            result.put("jobId", application.getJobId());
            result.put("status", application.getStatus());
            result.put("appliedAt", application.getAppliedAt());
            
            ResponseUtil.sendSuccess(response, "申请成功", result);
            
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "服务器错误: " + e.getMessage());
        }
    }
    
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {
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
            String pathInfo = request.getPathInfo();
            if (pathInfo == null || pathInfo.length() <= 1) {
                ResponseUtil.sendError(response, 400, "申请ID不能为空");
                return;
            }
            
            String applicationId = pathInfo.substring(1);
            String studentId = getCurrentUserId(request);
            
            // 检查申请是否存在
            Optional<Application> appOpt = appRepo.findById(applicationId);
            if (!appOpt.isPresent()) {
                ResponseUtil.sendError(response, 404, "申请不存在");
                return;
            }
            
            Application application = appOpt.get();
            
            // 检查是否是本人的申请
            if (!application.getStudentId().equals(studentId)) {
                ResponseUtil.sendError(response, 403, "无权限");
                return;
            }
            
            // 只能撤回待审核的申请
            if (!"pending".equals(application.getStatus())) {
                ResponseUtil.sendError(response, 400, "只能撤回待审核的申请");
                return;
            }
            
            // 更新状态为已撤回
            application.setStatus("withdrawn");
            application.setUpdatedAt(LocalDateTime.now());
            
            Application.TimelineItem item = new Application.TimelineItem();
            item.setStatus("withdrawn");
            item.setTime(LocalDateTime.now());
            item.setNote("申请已撤回");
            application.getTimeline().add(item);
            
            appRepo.save(application);
            
            ResponseUtil.sendSuccess(response, "申请已撤回", null);
            
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "服务器错误: " + e.getMessage());
        }
    }
    
    // 请求对象
    private static class ApplyRequest {
        String jobId;
        String coverLetter;
    }

    private int currentApplicationHours(String studentId) throws IOException {
        int total = 0;
        for (Application application : appRepo.findByStudentId(studentId)) {
            if ("withdrawn".equals(application.getStatus()) || "rejected".equals(application.getStatus())) {
                continue;
            }
            Optional<Job> job = jobRepo.findById(application.getJobId());
            if (job.isPresent()) {
                total += value(job.get().getHoursPerWeek());
            }
        }
        return total;
    }

    private boolean hasActiveApplication(String studentId, String jobId) throws IOException {
        return appRepo.findByStudentId(studentId).stream()
                .filter(application -> jobId.equals(application.getJobId()))
                .anyMatch(application -> !"withdrawn".equals(application.getStatus())
                        && !"rejected".equals(application.getStatus()));
    }

    private boolean hasResumeReady(Student student) {
        if (student == null) {
            return false;
        }
        if (student.getResumePdfData() != null && !student.getResumePdfData().isBlank()) {
            return true;
        }
        Resume resume = student.getResume();
        return resume != null
                && ((resume.getEducation() != null && resume.getEducation().stream().anyMatch(this::hasEducationContent))
                || (resume.getExperience() != null && resume.getExperience().stream().anyMatch(this::hasExperienceContent))
                || (resume.getAwards() != null && resume.getAwards().stream().anyMatch(this::hasAwardContent)));
    }

    private boolean hasEducationContent(Resume.Education education) {
        return education != null
                && (hasText(education.getMajor()) || education.getGpa() != null);
    }

    private boolean hasExperienceContent(Resume.Experience experience) {
        return experience != null && hasText(experience.getDescription());
    }

    private boolean hasAwardContent(Resume.Award award) {
        return award != null && (hasText(award.getName()) || hasText(award.getDescription()));
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private boolean hasScheduleConflict(Schedule studentSchedule, Schedule jobSchedule) {
        if (studentSchedule == null || jobSchedule == null) {
            return false;
        }
        return overlaps(studentSchedule.getMonday(), jobSchedule.getMonday())
                || overlaps(studentSchedule.getTuesday(), jobSchedule.getTuesday())
                || overlaps(studentSchedule.getWednesday(), jobSchedule.getWednesday())
                || overlaps(studentSchedule.getThursday(), jobSchedule.getThursday())
                || overlaps(studentSchedule.getFriday(), jobSchedule.getFriday())
                || overlaps(studentSchedule.getSaturday(), jobSchedule.getSaturday())
                || overlaps(studentSchedule.getSunday(), jobSchedule.getSunday());
    }

    private boolean overlaps(List<String> studentSlots, List<String> jobSlots) {
        if (studentSlots == null || jobSlots == null) {
            return false;
        }
        for (String studentSlot : studentSlots) {
            int[] studentRange = parseRange(studentSlot);
            if (studentRange == null) continue;
            for (String jobSlot : jobSlots) {
                int[] jobRange = parseRange(jobSlot);
                if (jobRange == null) continue;
                if (jobRange[0] < studentRange[1] && studentRange[0] < jobRange[1]) {
                    return true;
                }
            }
        }
        return false;
    }

    private int[] parseRange(String value) {
        if (value == null || !value.contains("-")) {
            return null;
        }
        String[] parts = value.trim().split("\\s+")[0].split("-");
        if (parts.length != 2) {
            return null;
        }
        Integer start = parseMinutes(parts[0]);
        Integer end = parseMinutes(parts[1]);
        if (start == null || end == null || start >= end) {
            return null;
        }
        return new int[]{start, end};
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

    private int value(Integer number) {
        return number == null ? 0 : number;
    }

    private boolean isPastApplicationDeadline(Job job) {
        String deadline = firstText(job.getApplicationDeadline(), job.getEndDate());
        if (deadline == null) {
            return false;
        }
        try {
            return LocalDate.parse(deadline).isBefore(LocalDate.now());
        } catch (Exception ignored) {
            return false;
        }
    }

    private String firstText(String primary, String fallback) {
        if (primary != null && !primary.isBlank()) {
            return primary;
        }
        return fallback;
    }

    private String limitText(String value, int maxLength) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.length() <= maxLength ? trimmed : trimmed.substring(0, maxLength);
    }
}
