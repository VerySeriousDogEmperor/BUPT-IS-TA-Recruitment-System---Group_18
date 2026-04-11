package com.bupt.ta.student.interfaces;

import com.bupt.ta.shared.domain.Application;
import com.bupt.ta.shared.domain.Job;
import com.bupt.ta.shared.infrastructure.ApplicationRepository;
import com.bupt.ta.shared.infrastructure.JobRepository;
import com.bupt.ta.shared.interfaces.BaseServlet;
import com.bupt.ta.shared.util.ResponseUtil;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
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
                item.put("reviewNote", app.getReviewNote());
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
        
        try {
            String studentId = getCurrentUserId(request);
            ApplyRequest applyReq = readRequestBody(request, ApplyRequest.class);
            
            if (applyReq.jobId == null) {
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
            Optional<Application> existingApp = appRepo.findByStudentAndJob(studentId, applyReq.jobId);
            if (existingApp.isPresent()) {
                ResponseUtil.sendError(response, 409, "您已申请过该职位");
                return;
            }
            
            // 创建申请
            Application application = new Application();
            application.setId(appRepo.generateId());
            application.setStudentId(studentId);
            application.setJobId(applyReq.jobId);
            application.setCoverLetter(applyReq.coverLetter);
            
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
}
