package com.bupt.ta.mo.interfaces;

import com.bupt.ta.shared.domain.CourseModule;
import com.bupt.ta.shared.domain.Job;
import com.bupt.ta.shared.domain.User;
import com.bupt.ta.shared.infrastructure.JobRepository;
import com.bupt.ta.shared.infrastructure.ModuleRepository;
import com.bupt.ta.shared.interfaces.BaseServlet;
import com.bupt.ta.shared.util.ResponseUtil;
import com.bupt.ta.shared.util.SessionUtil;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
    private final ModuleRepository moduleRepo = new ModuleRepository();
    private static final int MAX_POSITIONS = 100;
    private static final int MAX_HOURS_PER_WEEK = 20;
    private static final int MAX_TEXT_LENGTH = 4000;
    private static final int MAX_SKILLS = 20;
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        User currentUser = SessionUtil.getCurrentMOUser(request);
        if (currentUser == null || !"mo".equals(currentUser.getRole())) {
            ResponseUtil.sendError(response, 401, "未授权");
            return;
        }
        
        if (!requireCsrf(request, response)) {
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
            if (!requireCsrf(request, response)) {
                return;
            }
            handleCreateJob(request, response, currentUser);
        } else if (pathInfo.endsWith("/submit")) {
            // 提交职位
            String jobId = pathInfo.substring(1, pathInfo.indexOf("/submit"));
            if (!requireCsrf(request, response)) {
                return;
            }
            handleSubmitJob(response, jobId, currentUser);
        } else if (pathInfo.endsWith("/close") || pathInfo.endsWith("/unpublish")) {
            String suffix = pathInfo.endsWith("/close") ? "/close" : "/unpublish";
            String jobId = pathInfo.substring(1, pathInfo.indexOf(suffix));
            if (!requireCsrf(request, response)) {
                return;
            }
            handleCloseJob(response, jobId, currentUser);
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
        if (!requireCsrf(request, response)) {
            return;
        }
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
        if (!requireCsrf(request, response)) {
            return;
        }
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
            
            ResponseUtil.sendSuccess(response, "获取成功", collectionResponse(jobs));
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
            if (job == null) {
                ResponseUtil.sendError(response, 400, "Job payload is required");
                return;
            }
            
            // 验证必填字段
            if (job.getTitle() == null || job.getTitle().isEmpty()) {
                ResponseUtil.sendError(response, 400, "职位标题不能为空");
                return;
            }
            
            // 生成 ID
            Optional<CourseModule> moduleOpt = resolveOwnedModule(job, currentUser);
            if (!moduleOpt.isPresent()) {
                ResponseUtil.sendError(response, 403, "Selected module is not assigned to this MO");
                return;
            }
            applyModuleFields(job, moduleOpt.get());
            normalizeJobNumbers(job);
            String validationError = validateJob(job, false);
            if (validationError != null) {
                ResponseUtil.sendError(response, 400, validationError);
                return;
            }

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
            if (updatedJob == null) {
                ResponseUtil.sendError(response, 400, "Job payload is required");
                return;
            }
            Optional<CourseModule> moduleOpt = resolveOwnedModule(updatedJob, currentUser);
            if (!moduleOpt.isPresent()) {
                ResponseUtil.sendError(response, 403, "Selected module is not assigned to this MO");
                return;
            }
            
            // 更新字段
            if (updatedJob.getTitle() != null) existingJob.setTitle(updatedJob.getTitle());
            if (updatedJob.getDescription() != null) existingJob.setDescription(updatedJob.getDescription());
            applyModuleFields(existingJob, moduleOpt.get());
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
            if (updatedJob.getApplicationDeadline() != null) existingJob.setApplicationDeadline(updatedJob.getApplicationDeadline());
            if (updatedJob.getPositions() != null) existingJob.setPositions(updatedJob.getPositions());
            if (updatedJob.getSlots() != null) existingJob.setSlots(updatedJob.getSlots());

            if (updatedJob.getSlots() != null && updatedJob.getPositions() == null) {
                existingJob.setPositions(updatedJob.getSlots());
            }
            if (updatedJob.getPositions() != null && updatedJob.getSlots() == null) {
                existingJob.setSlots(updatedJob.getPositions());
            }
            normalizeJobNumbers(existingJob);
            String validationError = validateJob(existingJob, false);
            if (validationError != null) {
                ResponseUtil.sendError(response, 400, validationError);
                return;
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
    private Optional<CourseModule> resolveOwnedModule(Job job, User currentUser) throws IOException {
        String requestedModuleId = trimToNull(job.getModuleId());
        String requestedModuleCode = trimToNull(job.getModuleCode());

        if (requestedModuleId == null && requestedModuleCode == null) {
            return Optional.empty();
        }

        return moduleRepo.findAll().stream()
                .filter(module -> currentUser.getId().equals(module.getMoId())
                        || currentUser.getId().equals(module.getCoordinatorId()))
                .filter(module -> (requestedModuleId != null && requestedModuleId.equals(module.getId()))
                        || (requestedModuleCode != null && requestedModuleCode.equals(module.getCode())))
                .findFirst();
    }

    private void applyModuleFields(Job job, CourseModule module) {
        job.setModuleId(module.getId());
        job.setModuleCode(module.getCode());
        job.setModuleName(module.getName());
        job.setDepartment(module.getDepartment());
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private void normalizeJobNumbers(Job job) {
        Integer positions = job.getPositions() != null ? job.getPositions() : job.getSlots();
        if (positions != null) {
            job.setPositions(positions);
            job.setSlots(positions);
        }
    }

    private String validateJob(Job job, boolean requireComplete) {
        if (job == null) {
            return "Job payload is required";
        }
        if (isBlank(job.getTitle())) {
            return "Job title is required";
        }
        if (job.getTitle().trim().length() > 160) {
            return "Job title is too long";
        }
        if (requireComplete && isBlank(job.getModuleId()) && isBlank(job.getModuleCode())) {
            return "Module is required";
        }
        Integer positions = job.getPositions() != null ? job.getPositions() : job.getSlots();
        if (positions == null || positions < 1 || positions > MAX_POSITIONS) {
            return "Positions must be between 1 and " + MAX_POSITIONS;
        }
        if (job.getHoursPerWeek() == null || job.getHoursPerWeek() < 1 || job.getHoursPerWeek() > MAX_HOURS_PER_WEEK) {
            return "Hours per week must be between 1 and " + MAX_HOURS_PER_WEEK;
        }
        if (job.getHourlyRate() != null && (job.getHourlyRate() < 0 || job.getHourlyRate() > 1000)) {
            return "Hourly rate is out of range";
        }
        if (tooLong(job.getDescription()) || tooLong(job.getRequirements()) || tooLong(job.getResponsibilities())) {
            return "Job text fields are too long";
        }
        if (job.getRequiredSkills() != null) {
            if (job.getRequiredSkills().size() > MAX_SKILLS) {
                return "Too many required skills";
            }
            boolean invalidSkill = job.getRequiredSkills().stream()
                    .anyMatch(skill -> skill == null || skill.trim().isEmpty() || skill.length() > 80);
            if (invalidSkill) {
                return "Required skills contain invalid values";
            }
        }
        String dateError = validateDates(job);
        if (dateError != null) {
            return dateError;
        }
        return validateSchedule(job);
    }

    private boolean tooLong(String value) {
        return value != null && value.length() > MAX_TEXT_LENGTH;
    }

    private boolean tooLong(List<String> values) {
        return values != null && values.stream()
                .anyMatch(value -> value != null && value.length() > MAX_TEXT_LENGTH);
    }

    private Map<String, Object> collectionResponse(List<?> items) {
        Map<String, Object> result = new HashMap<>();
        result.put("items", items);
        result.put("total", items.size());
        return result;
    }

    private String validateDates(Job job) {
        LocalDate start = parseDate(job.getStartDate());
        LocalDate end = parseDate(job.getEndDate());
        LocalDate deadline = parseDate(job.getApplicationDeadline());
        if ((job.getStartDate() != null && start == null)
                || (job.getEndDate() != null && end == null)
                || (job.getApplicationDeadline() != null && deadline == null)) {
            return "Dates must use YYYY-MM-DD format";
        }
        if (start != null && end != null && end.isBefore(start)) {
            return "End date cannot be before start date";
        }
        if (deadline != null && end != null && deadline.isAfter(end)) {
            return "Application deadline cannot be after the job end date";
        }
        return null;
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(value);
        } catch (Exception ex) {
            return null;
        }
    }

    private String validateSchedule(Job job) {
        if (job.getSchedule() == null) {
            return null;
        }
        String error = validateSlots("Monday", job.getSchedule().getMonday());
        if (error != null) return error;
        error = validateSlots("Tuesday", job.getSchedule().getTuesday());
        if (error != null) return error;
        error = validateSlots("Wednesday", job.getSchedule().getWednesday());
        if (error != null) return error;
        error = validateSlots("Thursday", job.getSchedule().getThursday());
        if (error != null) return error;
        error = validateSlots("Friday", job.getSchedule().getFriday());
        if (error != null) return error;
        error = validateSlots("Saturday", job.getSchedule().getSaturday());
        if (error != null) return error;
        return validateSlots("Sunday", job.getSchedule().getSunday());
    }

    private String validateSlots(String day, List<String> slots) {
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
            int[] range = parseRange(slot);
            if (range == null || range[0] >= range[1]) {
                return "Invalid schedule time on " + day + ": " + slot;
            }
        }
        return null;
    }

    private int[] parseRange(String value) {
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

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private boolean ownsJob(Job job, User currentUser) {
        return job != null
                && currentUser != null
                && (currentUser.getId().equals(job.getCreatedBy())
                || currentUser.getId().equals(job.getMoId()));
    }

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
            normalizeJobNumbers(job);
            String validationError = validateJob(job, true);
            if (validationError != null) {
                ResponseUtil.sendError(response, 400, validationError);
                return;
            }

            job.setStatus("pending");
            job.setUpdatedAt(LocalDateTime.now());
            
            jobRepo.save(job);
            
            ResponseUtil.sendSuccess(response, "Submitted for admin review", job);
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "服务器错误: " + e.getMessage());
        }
    }

    private void handleCloseJob(HttpServletResponse response, String jobId, User currentUser) throws IOException {
        try {
            Optional<Job> jobOpt = jobRepo.findById(jobId);
            if (!jobOpt.isPresent()) {
                ResponseUtil.sendError(response, 404, "Job not found");
                return;
            }

            Job job = jobOpt.get();
            if (!ownsJob(job, currentUser)) {
                ResponseUtil.sendError(response, 403, "No permission to close this job");
                return;
            }

            if ("closed".equals(job.getStatus())) {
                ResponseUtil.sendSuccess(response, "Job already closed", job);
                return;
            }

            if (!"published".equals(job.getStatus())) {
                ResponseUtil.sendError(response, 400, "Only published jobs can be closed");
                return;
            }

            job.setStatus("closed");
            job.setUpdatedAt(LocalDateTime.now());
            jobRepo.save(job);

            ResponseUtil.sendSuccess(response, "Job closed", job);
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "Server error: " + e.getMessage());
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
