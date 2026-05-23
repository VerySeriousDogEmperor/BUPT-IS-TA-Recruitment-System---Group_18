package com.bupt.ta.mo.interfaces;

import com.bupt.ta.shared.domain.Job;
import com.bupt.ta.shared.domain.User;
import com.bupt.ta.shared.infrastructure.JobRepository;
import com.bupt.ta.shared.interfaces.BaseServlet;
import com.bupt.ta.shared.util.ResponseUtil;
import com.bupt.ta.shared.util.SessionUtil;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * MO 职位管理接口
 * GET /api/mo/jobs - 获取 MO 的职位列表
 * POST /api/mo/jobs - 创建新职位
 * PUT /api/mo/jobs/{id} - 更新职位
 * DELETE /api/mo/jobs/{id} - 删除职位
 * POST /api/mo/jobs/{id}/submit - 提交职位（发布）
 */
@WebServlet("/api/mo/jobs/*")
public class MOJobServlet extends BaseServlet {
    private final JobRepository jobRepo = new JobRepository();
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        User currentUser = SessionUtil.getCurrentMOUser(request);
        if (currentUser == null || !"mo".equals(currentUser.getRole())) {
            ResponseUtil.sendError(response, 401, "未授权");
            return;
        }
        
        String pathInfo = request.getPathInfo();
        
        if (pathInfo == null || "/".equals(pathInfo)) {
            // 获取 MO 的职位列表
            handleGetJobs(request, response, currentUser);
        } else {
            // 获取单个职位详情
            String jobId = pathInfo.substring(1);
            handleGetJobDetail(response, jobId, currentUser);
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        User currentUser = SessionUtil.getCurrentMOUser(request);
        if (currentUser == null || !"mo".equals(currentUser.getRole())) {
            ResponseUtil.sendError(response, 401, "未授权");
            return;
        }
        
        String pathInfo = request.getPathInfo();
        
        if (pathInfo == null || "/".equals(pathInfo)) {
            // 创建新职位
            handleCreateJob(request, response, currentUser);
        } else if (pathInfo.endsWith("/submit")) {
            // 提交职位
            String jobId = pathInfo.substring(1, pathInfo.indexOf("/submit"));
            handleSubmitJob(response, jobId, currentUser);
        } else {
            ResponseUtil.sendError(response, 404, "接口不存在");
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
        if (pathInfo == null || "/".equals(pathInfo)) {
            ResponseUtil.sendError(response, 400, "缺少职位ID");
            return;
        }
        
        String jobId = pathInfo.substring(1);
        handleUpdateJob(request, response, jobId, currentUser);
    }
    
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {
        User currentUser = SessionUtil.getCurrentMOUser(request);
        if (currentUser == null || !"mo".equals(currentUser.getRole())) {
            ResponseUtil.sendError(response, 401, "未授权");
            return;
        }
        
        String pathInfo = request.getPathInfo();
        if (pathInfo == null || "/".equals(pathInfo)) {
            ResponseUtil.sendError(response, 400, "缺少职位ID");
            return;
        }
        
        String jobId = pathInfo.substring(1);
        handleDeleteJob(response, jobId, currentUser);
    }
    
    /**
     * 获取 MO 的职位列表
     */
    private void handleGetJobs(HttpServletRequest request, HttpServletResponse response, User currentUser) throws IOException {
        try {
            String status = request.getParameter("status");
            
            List<Job> jobs = jobRepo.findAll();
            
            // 过滤：只显示当前 MO 创建的职位
            jobs = jobs.stream()
                    .filter(job -> currentUser.getId().equals(job.getCreatedBy()))
                    .collect(Collectors.toList());
            
            // 按状态过滤
            if (status != null && !status.isEmpty()) {
                jobs = jobs.stream()
                        .filter(job -> status.equals(job.getStatus()))
                        .collect(Collectors.toList());
            }
            
            ResponseUtil.sendSuccess(response, "获取成功", jobs);
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "服务器错误: " + e.getMessage());
        }
    }
    
    /**
     * 获取职位详情
     */
    private void handleGetJobDetail(HttpServletResponse response, String jobId, User currentUser) throws IOException {
        try {
            Optional<Job> jobOpt = jobRepo.findById(jobId);
            if (!jobOpt.isPresent()) {
                ResponseUtil.sendError(response, 404, "职位不存在");
                return;
            }
            
            Job job = jobOpt.get();
            
            // 验证权限：只能查看自己创建的职位
            if (!currentUser.getId().equals(job.getCreatedBy())) {
                ResponseUtil.sendError(response, 403, "无权访问");
                return;
            }
            
            ResponseUtil.sendSuccess(response, "获取成功", job);
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "服务器错误: " + e.getMessage());
        }
    }
    
    /**
     * 创建新职位
     */
    private void handleCreateJob(HttpServletRequest request, HttpServletResponse response, User currentUser) throws IOException {
        try {
            Job job = readRequestBody(request, Job.class);
            
            // 验证必填字段
            if (job.getTitle() == null || job.getTitle().isEmpty()) {
                ResponseUtil.sendError(response, 400, "职位标题不能为空");
                return;
            }
            
            // 生成 ID
            String jobId = jobRepo.generateId();
            job.setId(jobId);
            
            // 设置创建信息
            job.setCreatedBy(currentUser.getId());
            job.setMoId(currentUser.getId());
            job.setMoName(currentUser.getName());
            if (job.getSlots() != null && job.getPositions() == null) {
                job.setPositions(job.getSlots());
            }
            if (job.getPositions() != null && job.getSlots() == null) {
                job.setSlots(job.getPositions());
            }
            job.setCreatedAt(LocalDateTime.now());
            job.setUpdatedAt(LocalDateTime.now());
            
            // 设置初始状态为草稿
            job.setStatus("draft");
            
            // 保存
            jobRepo.save(job);
            
            ResponseUtil.sendSuccess(response, "创建成功", job);
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "服务器错误: " + e.getMessage());
        }
    }
    
    /**
     * 更新职位
     */
    private void handleUpdateJob(HttpServletRequest request, HttpServletResponse response, String jobId, User currentUser) throws IOException {
        try {
            Optional<Job> existingJobOpt = jobRepo.findById(jobId);
            if (!existingJobOpt.isPresent()) {
                ResponseUtil.sendError(response, 404, "职位不存在");
                return;
            }
            
            Job existingJob = existingJobOpt.get();
            
            // 验证权限
            if (!currentUser.getId().equals(existingJob.getCreatedBy())) {
                ResponseUtil.sendError(response, 403, "无权修改");
                return;
            }
            
            // 只有草稿状态可以修改
            if (!"draft".equals(existingJob.getStatus())) {
                ResponseUtil.sendError(response, 400, "只能修改草稿状态的职位");
                return;
            }
            
            // 读取更新数据
            Job updatedJob = readRequestBody(request, Job.class);
            
            // 更新字段
            if (updatedJob.getTitle() != null) existingJob.setTitle(updatedJob.getTitle());
            if (updatedJob.getDescription() != null) existingJob.setDescription(updatedJob.getDescription());
            if (updatedJob.getModuleId() != null) existingJob.setModuleId(updatedJob.getModuleId());
            if (updatedJob.getModuleCode() != null) existingJob.setModuleCode(updatedJob.getModuleCode());
            if (updatedJob.getModuleName() != null) existingJob.setModuleName(updatedJob.getModuleName());
            if (updatedJob.getDepartment() != null) existingJob.setDepartment(updatedJob.getDepartment());
            if (updatedJob.getType() != null) existingJob.setType(updatedJob.getType());
            if (updatedJob.getRequirements() != null) existingJob.setRequirements(updatedJob.getRequirements());
            if (updatedJob.getResponsibilities() != null) existingJob.setResponsibilities(updatedJob.getResponsibilities());
            if (updatedJob.getRequiredSkills() != null) existingJob.setRequiredSkills(updatedJob.getRequiredSkills());
            if (updatedJob.getHoursPerWeek() != null) existingJob.setHoursPerWeek(updatedJob.getHoursPerWeek());
            if (updatedJob.getHourlyRate() != null) existingJob.setHourlyRate(updatedJob.getHourlyRate());
            if (updatedJob.getSchedule() != null) existingJob.setSchedule(updatedJob.getSchedule());
            if (updatedJob.getDuration() != null) existingJob.setDuration(updatedJob.getDuration());
            if (updatedJob.getStartDate() != null) existingJob.setStartDate(updatedJob.getStartDate());
            if (updatedJob.getEndDate() != null) existingJob.setEndDate(updatedJob.getEndDate());
            if (updatedJob.getPositions() != null) existingJob.setPositions(updatedJob.getPositions());
            if (updatedJob.getSlots() != null) existingJob.setSlots(updatedJob.getSlots());

            if (updatedJob.getSlots() != null && updatedJob.getPositions() == null) {
                existingJob.setPositions(updatedJob.getSlots());
            }
            if (updatedJob.getPositions() != null && updatedJob.getSlots() == null) {
                existingJob.setSlots(updatedJob.getPositions());
            }
            
            existingJob.setUpdatedAt(LocalDateTime.now());
            
            // 保存
            jobRepo.save(existingJob);
            
            ResponseUtil.sendSuccess(response, "更新成功", existingJob);
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "服务器错误: " + e.getMessage());
        }
    }
    
    /**
     * 提交职位（发布）
     */
    private void handleSubmitJob(HttpServletResponse response, String jobId, User currentUser) throws IOException {
        try {
            Optional<Job> jobOpt = jobRepo.findById(jobId);
            if (!jobOpt.isPresent()) {
                ResponseUtil.sendError(response, 404, "职位不存在");
                return;
            }
            
            Job job = jobOpt.get();
            
            // 验证权限
            if (!currentUser.getId().equals(job.getCreatedBy())) {
                ResponseUtil.sendError(response, 403, "无权操作");
                return;
            }
            
            // 只有草稿可以提交
            if (!"draft".equals(job.getStatus())) {
                ResponseUtil.sendError(response, 400, "只能提交草稿状态的职位");
                return;
            }
            
            // 直接发布（跳过 Admin 审核）
            job.setStatus("published");
            job.setPublishedAt(LocalDateTime.now());
            job.setUpdatedAt(LocalDateTime.now());
            
            jobRepo.save(job);
            
            ResponseUtil.sendSuccess(response, "发布成功", job);
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "服务器错误: " + e.getMessage());
        }
    }
    
    /**
     * 删除职位
     */
    private void handleDeleteJob(HttpServletResponse response, String jobId, User currentUser) throws IOException {
        try {
            Optional<Job> jobOpt = jobRepo.findById(jobId);
            if (!jobOpt.isPresent()) {
                ResponseUtil.sendError(response, 404, "职位不存在");
                return;
            }
            
            Job job = jobOpt.get();
            
            // 验证权限
            if (!currentUser.getId().equals(job.getCreatedBy())) {
                ResponseUtil.sendError(response, 403, "无权删除");
                return;
            }
            
            // 只有草稿可以删除
            if (!"draft".equals(job.getStatus())) {
                ResponseUtil.sendError(response, 400, "只能删除草稿状态的职位");
                return;
            }
            
            jobRepo.delete(jobId);
            
            ResponseUtil.sendSuccess(response, "删除成功", null);
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "服务器错误: " + e.getMessage());
        }
    }
}
