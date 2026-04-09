package com.bupt.ta.mo.interfaces;

import com.bupt.ta.shared.domain.Application;
import com.bupt.ta.shared.domain.Job;
import com.bupt.ta.shared.domain.Timesheet;
import com.bupt.ta.shared.domain.User;
import com.bupt.ta.shared.infrastructure.ApplicationRepository;
import com.bupt.ta.shared.infrastructure.JobRepository;
import com.bupt.ta.shared.infrastructure.StudentRepository;
import com.bupt.ta.shared.infrastructure.TimesheetRepository;
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
 * MO 工时审核接口
 * GET /api/mo/timesheets - 获取工时表列表
 * GET /api/mo/timesheets/{id} - 获取工时表详情
 * PUT /api/mo/timesheets/{id}/review - 审核工时表
 */
@WebServlet("/api/mo/timesheets/*")
public class MOTimesheetServlet extends BaseServlet {
    private final TimesheetRepository timesheetRepo = new TimesheetRepository();
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
            // 获取工时表列表
            handleGetTimesheets(request, response, currentUser);
        } else {
            // 获取工时表详情
            String timesheetId = pathInfo.substring(1);
            handleGetTimesheetDetail(response, timesheetId, currentUser);
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
        if (pathInfo == null || !pathInfo.contains("/review")) {
            ResponseUtil.sendError(response, 400, "无效的请求路径");
            return;
        }
        
        String timesheetId = pathInfo.substring(1, pathInfo.indexOf("/review"));
        handleReviewTimesheet(request, response, timesheetId, currentUser);
    }
    
    /**
     * 获取工时表列表
     */
    private void handleGetTimesheets(HttpServletRequest request, HttpServletResponse response, User currentUser) throws IOException {
        try {
            String status = request.getParameter("status");
            String jobId = request.getParameter("jobId");
            
            List<Timesheet> timesheets = timesheetRepo.findAll();
            
            // 过滤：只显示当前 MO 职位相关的工时表
            List<Job> myJobs = jobRepo.findAll().stream()
                    .filter(job -> currentUser.getId().equals(job.getCreatedBy()))
                    .collect(Collectors.toList());
            
            Set<String> myJobIds = myJobs.stream()
                    .map(Job::getId)
                    .collect(Collectors.toSet());
            
            // 获取这些职位的所有申请
            List<Application> applications = applicationRepo.findAll().stream()
                    .filter(app -> myJobIds.contains(app.getJobId()))
                    .collect(Collectors.toList());
            
            Set<String> applicationIds = applications.stream()
                    .map(Application::getId)
                    .collect(Collectors.toSet());
            
            timesheets = timesheets.stream()
                    .filter(ts -> applicationIds.contains(ts.getApplicationId()))
                    .collect(Collectors.toList());
            
            // 按状态过滤
            if (status != null && !status.isEmpty()) {
                timesheets = timesheets.stream()
                        .filter(ts -> status.equals(ts.getStatus()))
                        .collect(Collectors.toList());
            }
            
            // 按职位过滤
            if (jobId != null && !jobId.isEmpty()) {
                Set<String> jobApplicationIds = applications.stream()
                        .filter(app -> jobId.equals(app.getJobId()))
                        .map(Application::getId)
                        .collect(Collectors.toSet());
                
                timesheets = timesheets.stream()
                        .filter(ts -> jobApplicationIds.contains(ts.getApplicationId()))
                        .collect(Collectors.toList());
            }
            
            // 补充学生和职位信息
            List<Map<String, Object>> result = new ArrayList<>();
            for (Timesheet ts : timesheets) {
                Map<String, Object> item = new HashMap<>();
                item.put("timesheet", ts);
                
                // 添加申请信息
                try {
                    Optional<Application> appOpt = applicationRepo.findById(ts.getApplicationId());
                    if (appOpt.isPresent()) {
                        Application app = appOpt.get();
                        
                        // 添加学生信息
                        Optional<Student> studentOpt = studentRepo.findById(app.getStudentId());
                        if (studentOpt.isPresent()) {
                            Student student = studentOpt.get();
                            Map<String, Object> studentInfo = new HashMap<>();
                            studentInfo.put("id", student.getId());
                            studentInfo.put("name", student.getName());
                            studentInfo.put("studentId", student.getStudentId());
                            item.put("student", studentInfo);
                        }
                        
                        // 添加职位信息
                        Optional<Job> jobOpt = jobRepo.findById(app.getJobId());
                        if (jobOpt.isPresent()) {
                            Job job = jobOpt.get();
                            Map<String, Object> jobInfo = new HashMap<>();
                            jobInfo.put("id", job.getId());
                            jobInfo.put("title", job.getTitle());
                            jobInfo.put("moduleCode", job.getModuleCode());
                            item.put("job", jobInfo);
                        }
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
     * 获取工时表详情
     */
    private void handleGetTimesheetDetail(HttpServletResponse response, String timesheetId, User currentUser) throws IOException {
        try {
            Optional<Timesheet> tsOpt = timesheetRepo.findById(timesheetId);
            if (!tsOpt.isPresent()) {
                ResponseUtil.sendError(response, 404, "工时表不存在");
                return;
            }
            
            Timesheet ts = tsOpt.get();
            
            // 验证权限：检查是否属于当前 MO 的职位
            Optional<Application> appOpt = applicationRepo.findById(ts.getApplicationId());
            if (!appOpt.isPresent()) {
                ResponseUtil.sendError(response, 404, "申请不存在");
                return;
            }
            
            Application app = appOpt.get();
            Optional<Job> jobOpt = jobRepo.findById(app.getJobId());
            if (!jobOpt.isPresent() || !currentUser.getId().equals(jobOpt.get().getCreatedBy())) {
                ResponseUtil.sendError(response, 403, "无权访问");
                return;
            }
            
            // 构建详细信息
            Map<String, Object> result = new HashMap<>();
            result.put("timesheet", ts);
            result.put("application", app);
            result.put("job", jobOpt.get());
            
            Optional<Student> studentOpt = studentRepo.findById(app.getStudentId());
            if (studentOpt.isPresent()) {
                result.put("student", studentOpt.get());
            }
            
            ResponseUtil.sendSuccess(response, "获取成功", result);
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "服务器错误: " + e.getMessage());
        }
    }
    
    /**
     * 审核工时表
     */
    private void handleReviewTimesheet(HttpServletRequest request, HttpServletResponse response, String timesheetId, User currentUser) throws IOException {
        try {
            Optional<Timesheet> tsOpt = timesheetRepo.findById(timesheetId);
            if (!tsOpt.isPresent()) {
                ResponseUtil.sendError(response, 404, "工时表不存在");
                return;
            }
            
            Timesheet ts = tsOpt.get();
            
            // 验证权限
            Optional<Application> appOpt = applicationRepo.findById(ts.getApplicationId());
            if (!appOpt.isPresent()) {
                ResponseUtil.sendError(response, 404, "申请不存在");
                return;
            }
            
            Application app = appOpt.get();
            Optional<Job> jobOpt = jobRepo.findById(app.getJobId());
            if (!jobOpt.isPresent() || !currentUser.getId().equals(jobOpt.get().getCreatedBy())) {
                ResponseUtil.sendError(response, 403, "无权操作");
                return;
            }
            
            // 读取审核请求
            Map<String, Object> requestData = readRequestBody(request, Map.class);
            String action = (String) requestData.get("action"); // "approve" or "reject"
            String comment = (String) requestData.get("comment");
            Double approvedHours = requestData.get("approvedHours") != null ? 
                    ((Number) requestData.get("approvedHours")).doubleValue() : null;
            
            if (action == null || (!action.equals("approve") && !action.equals("reject"))) {
                ResponseUtil.sendError(response, 400, "无效的操作");
                return;
            }
            
            // 只能审核 pending 状态的工时表
            if (!"pending".equals(ts.getStatus())) {
                ResponseUtil.sendError(response, 400, "只能审核待审核的工时表");
                return;
            }
            
            // 更新状态
            if ("approve".equals(action)) {
                ts.setStatus("approved");
                if (approvedHours != null) {
                    ts.setApprovedHours(approvedHours);
                } else {
                    ts.setApprovedHours(ts.getHoursWorked());
                }
            } else {
                ts.setStatus("rejected");
                ts.setApprovedHours(0.0);
            }
            
            ts.setReviewedBy(currentUser.getId());
            ts.setReviewedAt(LocalDateTime.now());
            ts.setReviewComment(comment);
            ts.setUpdatedAt(LocalDateTime.now());
            
            timesheetRepo.save(ts);
            
            ResponseUtil.sendSuccess(response, "审核成功", ts);
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "服务器错误: " + e.getMessage());
        }
    }
}
