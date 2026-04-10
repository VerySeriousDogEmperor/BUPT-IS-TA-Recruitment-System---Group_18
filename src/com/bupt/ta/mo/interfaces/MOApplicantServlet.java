package com.bupt.ta.mo.interfaces;

import com.bupt.ta.shared.domain.Application;
import com.bupt.ta.shared.domain.Job;
import com.bupt.ta.shared.domain.User;
import com.bupt.ta.shared.infrastructure.ApplicationRepository;
import com.bupt.ta.shared.infrastructure.JobRepository;
import com.bupt.ta.shared.infrastructure.StudentRepository;
import com.bupt.ta.shared.interfaces.BaseServlet;
import com.bupt.ta.shared.util.ResponseUtil;
import com.bupt.ta.shared.util.SessionUtil;
import com.bupt.ta.student.domain.Student;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * MO 申请人管理接口
 * GET /api/mo/applicants - 获取申请人列表
 * GET /api/mo/applicants/{id} - 获取申请详情
 * PUT /api/mo/applicants/{id}/status - 更新申请状态
 */
@WebServlet("/api/mo/applicants/*")
public class MOApplicantServlet extends BaseServlet {
    private final ApplicationRepository applicationRepo = new ApplicationRepository();
    private final JobRepository jobRepo = new JobRepository();
    private final StudentRepository studentRepo = new StudentRepository();
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        User currentUser = SessionUtil.getCurrentMOUser(request);
        if (currentUser == null || !"mo".equals(currentUser.getRole())) {
            ResponseUtil.sendError(response, 401, "未授权");
            return;
        }
        
        String pathInfo = request.getPathInfo();
        
        if (pathInfo == null || "/".equals(pathInfo)) {
            // 获取申请人列表
            handleGetApplicants(request, response, currentUser);
        } else {
            // 获取申请详情
            String applicationId = pathInfo.substring(1);
            handleGetApplicantDetail(response, applicationId, currentUser);
        }
    }
    
    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws IOException {
        User currentUser = SessionUtil.getCurrentMOUser(request);
        if (currentUser == null || !"mo".equals(currentUser.getRole())) {
            ResponseUtil.sendError(response, 401, "未授权");
            return;
        }
        
        String pathInfo = request.getPathInfo();
        if (pathInfo == null || !pathInfo.contains("/status")) {
            ResponseUtil.sendError(response, 400, "无效的请求路径");
            return;
        }
        
        String applicationId = pathInfo.substring(1, pathInfo.indexOf("/status"));
        handleUpdateStatus(request, response, applicationId, currentUser);
    }
    
    /**
     * 获取申请人列表
     */
    private void handleGetApplicants(HttpServletRequest request, HttpServletResponse response, User currentUser) throws IOException {
        try {
            String jobId = request.getParameter("jobId");
            String status = request.getParameter("status");
            
            List<Application> applications = applicationRepo.findAll();
            
            // 过滤：只显示当前 MO 职位的申请
            List<Job> myJobs = jobRepo.findAll().stream()
                    .filter(job -> currentUser.getId().equals(job.getCreatedBy()))
                    .collect(Collectors.toList());
            
            Set<String> myJobIds = myJobs.stream()
                    .map(Job::getId)
                    .collect(Collectors.toSet());
            
            applications = applications.stream()
                    .filter(app -> myJobIds.contains(app.getJobId()))
                    .collect(Collectors.toList());
            
            // 按职位过滤
            if (jobId != null && !jobId.isEmpty()) {
                applications = applications.stream()
                        .filter(app -> jobId.equals(app.getJobId()))
                        .collect(Collectors.toList());
            }
            
            // 按状态过滤
            if (status != null && !status.isEmpty()) {
                applications = applications.stream()
                        .filter(app -> status.equals(app.getStatus()))
                        .collect(Collectors.toList());
            }
            
            // 补充学生和职位信息
            List<Map<String, Object>> result = new ArrayList<>();
            for (Application app : applications) {
                Map<String, Object> item = new HashMap<>();
                item.put("application", app);
                
                // 添加学生信息
                try {
                    Optional<Student> studentOpt = studentRepo.findById(app.getStudentId());
                    if (studentOpt.isPresent()) {
                        Student student = studentOpt.get();
                        Map<String, Object> studentInfo = new HashMap<>();
                        studentInfo.put("id", student.getId());
                        studentInfo.put("name", student.getName());
                        studentInfo.put("email", student.getEmail());
                        studentInfo.put("studentId", student.getStudentId());
                        studentInfo.put("major", student.getMajor());
                        studentInfo.put("gpa", student.getGpa());
                        item.put("student", studentInfo);
                    }
                } catch (Exception e) {
                    // 忽略
                }
                
                // 添加职位信息
                try {
                    Optional<Job> jobOpt = jobRepo.findById(app.getJobId());
                    if (jobOpt.isPresent()) {
                        Job job = jobOpt.get();
                        Map<String, Object> jobInfo = new HashMap<>();
                        jobInfo.put("id", job.getId());
                        jobInfo.put("title", job.getTitle());
                        jobInfo.put("moduleCode", job.getModuleCode());
                        jobInfo.put("moduleName", job.getModuleName());
                        item.put("job", jobInfo);
                    }
                } catch (Exception e) {
                    // 忽略
                }
                
                result.add(item);
            }
            
            ResponseUtil.sendSuccess(response, "获取成功", result);
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "服务器错误: " + e.getMessage());
        }
    }
    
    /**
     * 获取申请详情
     */
    private void handleGetApplicantDetail(HttpServletResponse response, String applicationId, User currentUser) throws IOException {
        try {
            Optional<Application> appOpt = applicationRepo.findById(applicationId);
            if (!appOpt.isPresent()) {
                ResponseUtil.sendError(response, 404, "申请不存在");
                return;
            }
            
            Application app = appOpt.get();
            
            // 验证权限：检查职位是否属于当前 MO
            Optional<Job> jobOpt = jobRepo.findById(app.getJobId());
            if (!jobOpt.isPresent() || !currentUser.getId().equals(jobOpt.get().getCreatedBy())) {
                ResponseUtil.sendError(response, 403, "无权访问");
                return;
            }
            
            // 构建详细信息
            Map<String, Object> result = new HashMap<>();
            result.put("application", app);
            
            // 添加学生详细信息
            Optional<Student> studentOpt = studentRepo.findById(app.getStudentId());
            if (studentOpt.isPresent()) {
                result.put("student", studentOpt.get());
            }
            
            // 添加职位信息
            result.put("job", jobOpt.get());
            
            ResponseUtil.sendSuccess(response, "获取成功", result);
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "服务器错误: " + e.getMessage());
        }
    }
    
    /**
     * 更新申请状态
     */
    private void handleUpdateStatus(HttpServletRequest request, HttpServletResponse response, String applicationId, User currentUser) throws IOException {
        try {
            Optional<Application> appOpt = applicationRepo.findById(applicationId);
            if (!appOpt.isPresent()) {
                ResponseUtil.sendError(response, 404, "申请不存在");
                return;
            }
            
            Application app = appOpt.get();
            
            // 验证权限
            Optional<Job> jobOpt = jobRepo.findById(app.getJobId());
            if (!jobOpt.isPresent() || !currentUser.getId().equals(jobOpt.get().getCreatedBy())) {
                ResponseUtil.sendError(response, 403, "无权操作");
                return;
            }
            
            // 读取状态更新请求
            Map<String, String> requestData = readRequestBody(request, Map.class);
            String action = requestData.get("action"); // "accept" or "reject"
            String comment = requestData.get("comment");
            
            if (action == null || (!action.equals("accept") && !action.equals("reject"))) {
                ResponseUtil.sendError(response, 400, "无效的操作");
                return;
            }
            
            // 只能处理 pending 状态的申请
            if (!"pending".equals(app.getStatus())) {
                ResponseUtil.sendError(response, 400, "只能处理待审核的申请");
                return;
            }
            
            // 更新状态
            if ("accept".equals(action)) {
                app.setStatus("accepted");
            } else {
                app.setStatus("rejected");
            }
            
            app.setReviewedBy(currentUser.getId());
            app.setReviewedAt(LocalDateTime.now());
            app.setReviewComment(comment);
            app.setUpdatedAt(LocalDateTime.now());
            
            applicationRepo.save(app);
            
            ResponseUtil.sendSuccess(response, "操作成功", app);
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "服务器错误: " + e.getMessage());
        }
    }
}
