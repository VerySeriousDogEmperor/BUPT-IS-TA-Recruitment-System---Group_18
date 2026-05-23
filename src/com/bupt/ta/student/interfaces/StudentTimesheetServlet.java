package com.bupt.ta.student.interfaces;

import com.bupt.ta.shared.domain.Application;
import com.bupt.ta.shared.domain.Job;
import com.bupt.ta.shared.domain.Timesheet;
import com.bupt.ta.shared.infrastructure.ApplicationRepository;
import com.bupt.ta.shared.infrastructure.JobRepository;
import com.bupt.ta.shared.infrastructure.TimesheetRepository;
import com.bupt.ta.shared.interfaces.BaseServlet;
import com.bupt.ta.shared.util.ResponseUtil;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 学生工时管理接口
 * GET /api/student/timesheets - 获取我的工时记录
 * POST /api/student/timesheets - 提交工时
 */
@WebServlet("/api/student/timesheets")
public class StudentTimesheetServlet extends BaseServlet {
    private final TimesheetRepository timesheetRepo = new TimesheetRepository();
    private final JobRepository jobRepo = new JobRepository();
    private final ApplicationRepository appRepo = new ApplicationRepository();
    private static final int MAX_DESCRIPTION_LENGTH = 1000;
    
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
            
            // 获取学生的所有工时记录
            List<Timesheet> timesheets = timesheetRepo.findByStudentId(studentId);
            
            // 按状态筛选
            if (status != null && !status.isEmpty()) {
                timesheets = timesheets.stream()
                        .filter(t -> t.getStatus().equals(status))
                        .collect(Collectors.toList());
            }
            
            // 补充职位信息
            List<Map<String, Object>> result = new ArrayList<>();
            for (Timesheet ts : timesheets) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", ts.getId());
                item.put("jobId", ts.getJobId());
                item.put("date", ts.getDate());
                item.put("hours", ts.getHours());
                item.put("description", ts.getDescription());
                item.put("status", ts.getStatus());
                item.put("submittedAt", ts.getSubmittedAt());
                item.put("reviewedAt", ts.getReviewedAt());
                item.put("reviewNote", firstText(ts.getReviewNote(), ts.getReviewComment()));
                item.put("reviewComment", ts.getReviewComment());
                item.put("approvedHours", ts.getApprovedHours());
                
                // 获取职位信息
                Optional<Job> jobOpt = jobRepo.findById(ts.getJobId());
                if (jobOpt.isPresent()) {
                    Job job = jobOpt.get();
                    item.put("jobTitle", job.getTitle());
                }
                
                result.add(item);
            }
            
            // 按提交时间倒序排序
            result.sort((a, b) -> {
                Object timeA = a.get("submittedAt");
                Object timeB = b.get("submittedAt");
                if (timeA == null || timeB == null) return 0;
                return ((Comparable) timeB).compareTo(timeA);
            });
            
            ResponseUtil.sendSuccess(response, result);
            
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
            TimesheetRequest tsReq = readRequestBody(request, TimesheetRequest.class);
            
            // 验证参数
            if (tsReq == null || isBlank(tsReq.jobId) || isBlank(tsReq.date) || tsReq.hours == null || isBlank(tsReq.description)) {
                ResponseUtil.sendError(response, 400, "所有字段都不能为空");
                return;
            }
            
            // 检查职位是否存在
            if (tsReq.hours <= 0 || tsReq.hours > 24) {
                ResponseUtil.sendError(response, 400, "Hours must be greater than 0 and no more than 24");
                return;
            }

            LocalDate workDate;
            try {
                workDate = LocalDate.parse(tsReq.date);
            } catch (Exception ex) {
                ResponseUtil.sendError(response, 400, "Date must use YYYY-MM-DD format");
                return;
            }
            if (workDate.isAfter(LocalDate.now())) {
                ResponseUtil.sendError(response, 400, "Future timesheets cannot be submitted");
                return;
            }

            Optional<Job> jobOpt = jobRepo.findById(tsReq.jobId);
            if (!jobOpt.isPresent()) {
                ResponseUtil.sendError(response, 404, "职位不存在");
                return;
            }
            
            // 检查学生是否被该职位录用
            Optional<Application> appOpt = appRepo.findByStudentId(studentId).stream()
                    .filter(application -> tsReq.jobId.equals(application.getJobId()))
                    .filter(application -> "approved".equals(application.getStatus()))
                    .findFirst();
            if (!appOpt.isPresent() || !"approved".equals(appOpt.get().getStatus())) {
                ResponseUtil.sendError(response, 403, "您未被该职位录用，无法提交工时");
                return;
            }
            
            // 创建工时记录
            if (hasDuplicateTimesheet(studentId, tsReq.jobId, tsReq.date)) {
                ResponseUtil.sendError(response, 409, "A timesheet for this position and date already exists");
                return;
            }
            if (dailySubmittedHours(studentId, tsReq.date) + tsReq.hours > 24) {
                ResponseUtil.sendError(response, 400, "Total submitted hours for one day cannot exceed 24");
                return;
            }

            Timesheet timesheet = new Timesheet();
            timesheet.setId(timesheetRepo.generateId());
            timesheet.setStudentId(studentId);
            timesheet.setJobId(tsReq.jobId);
            timesheet.setApplicationId(appOpt.get().getId());
            timesheet.setDate(tsReq.date);
            timesheet.setHours(tsReq.hours);
            timesheet.setHoursWorked(tsReq.hours);
            timesheet.setDescription(limitText(tsReq.description, MAX_DESCRIPTION_LENGTH));
            
            timesheetRepo.save(timesheet);
            
            Map<String, Object> result = new HashMap<>();
            result.put("id", timesheet.getId());
            result.put("status", timesheet.getStatus());
            
            ResponseUtil.sendSuccess(response, "工时提交成功", result);
            
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "服务器错误: " + e.getMessage());
        }
    }
    
    // 请求对象
    private static class TimesheetRequest {
        String jobId;
        String date;
        Double hours;
        String description;
    }

    private boolean hasDuplicateTimesheet(String studentId, String jobId, String date) throws IOException {
        return timesheetRepo.findByStudentId(studentId).stream()
                .filter(timesheet -> jobId.equals(timesheet.getJobId()))
                .filter(timesheet -> date.equals(timesheet.getDate()))
                .anyMatch(timesheet -> !"rejected".equals(timesheet.getStatus()));
    }

    private double dailySubmittedHours(String studentId, String date) throws IOException {
        return timesheetRepo.findByStudentId(studentId).stream()
                .filter(timesheet -> date.equals(timesheet.getDate()))
                .filter(timesheet -> !"rejected".equals(timesheet.getStatus()))
                .mapToDouble(timesheet -> timesheet.getHours() == null ? 0 : timesheet.getHours())
                .sum();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String limitText(String value, int maxLength) {
        String trimmed = value == null ? "" : value.trim();
        return trimmed.length() <= maxLength ? trimmed : trimmed.substring(0, maxLength);
    }

    private String firstText(String primary, String fallback) {
        if (primary != null && !primary.isBlank()) {
            return primary;
        }
        return fallback;
    }
}
