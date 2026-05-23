package com.bupt.ta.shared.interfaces;

import com.bupt.ta.shared.domain.Job;
import com.bupt.ta.shared.infrastructure.ApplicationRepository;
import com.bupt.ta.shared.infrastructure.JobRepository;
import com.bupt.ta.shared.util.ResponseUtil;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 职位接口（公开）
 * GET /api/jobs - 获取职位列表
 * GET /api/jobs/{id} - 获取职位详情
 */
@WebServlet("/api/jobs/*")
public class JobServlet extends BaseServlet {
    private final JobRepository jobRepo = new JobRepository();
    private final ApplicationRepository appRepo = new ApplicationRepository();
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String pathInfo = request.getPathInfo();
        
        if (pathInfo == null || "/".equals(pathInfo)) {
            // 获取职位列表
            handleGetJobList(request, response);
        } else {
            // 获取职位详情
            String jobId = pathInfo.substring(1);
            handleGetJobDetail(request, response, jobId);
        }
    }
    
    /**
     * 获取职位列表
     */
    private void handleGetJobList(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            // 获取查询参数
            String department = request.getParameter("department");
            String type = request.getParameter("type");
            String keyword = request.getParameter("keyword");
            String pageStr = request.getParameter("page");
            String sizeStr = request.getParameter("size");
            
            int page = parsePositiveInt(pageStr, 1, "page");
            int size = Math.min(parsePositiveInt(sizeStr, 10, "size"), 100);
            
            // 获取所有已发布的职位
            List<Job> jobs = jobRepo.findPublished();
            
            // 筛选
            if (department != null && !department.isEmpty()) {
                jobs = jobs.stream()
                        .filter(j -> department.equals(j.getDepartment()))
                        .collect(Collectors.toList());
            }
            
            if (type != null && !type.isEmpty()) {
                jobs = jobs.stream()
                        .filter(j -> type.equals(j.getType()))
                        .collect(Collectors.toList());
            }
            
            if (keyword != null && !keyword.isEmpty()) {
                String normalizedKeyword = keyword.toLowerCase();
                jobs = jobs.stream()
                        .filter(j -> containsIgnoreCase(j.getTitle(), normalizedKeyword) ||
                                   containsIgnoreCase(j.getDescription(), normalizedKeyword) ||
                                   containsIgnoreCase(j.getModuleCode(), normalizedKeyword) ||
                                   containsIgnoreCase(j.getModuleName(), normalizedKeyword))
                        .collect(Collectors.toList());
            }
            
            // 统计申请人数
            for (Job job : jobs) {
                int applicants = appRepo.findByJobId(job.getId()).size();
                // 这里可以添加一个临时字段，但为了简单，我们在返回时处理
            }
            
            // 分页
            int total = jobs.size();
            int start = (page - 1) * size;
            int end = Math.min(start + size, total);
            
            List<Job> pagedJobs = start >= total ? Collections.emptyList() : jobs.subList(start, end);
            
            // 构建响应
            Map<String, Object> result = new HashMap<>();
            result.put("items", pagedJobs);
            result.put("total", total);
            result.put("page", page);
            result.put("size", size);
            
            ResponseUtil.sendSuccess(response, result);
            
        } catch (IllegalArgumentException e) {
            ResponseUtil.sendError(response, 400, e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "服务器错误: " + e.getMessage());
        }
    }

    
    /**
     * 获取职位详情
     */
    private boolean containsIgnoreCase(String value, String normalizedKeyword) {
        return value != null && value.toLowerCase().contains(normalizedKeyword);
    }

    private int parsePositiveInt(String value, int fallback, String fieldName) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        try {
            int parsed = Integer.parseInt(value.trim());
            if (parsed < 1) {
                throw new NumberFormatException("negative or zero");
            }
            return parsed;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(fieldName + " must be a positive number");
        }
    }

    private void handleGetJobDetail(HttpServletRequest request, HttpServletResponse response, String jobId) throws IOException {
        try {
            Optional<Job> jobOpt = jobRepo.findById(jobId);
            
            if (!jobOpt.isPresent()) {
                ResponseUtil.sendError(response, 404, "职位不存在");
                return;
            }
            
            Job job = jobOpt.get();
            
            // 只返回已发布的职位
            if (!"published".equals(job.getStatus())) {
                ResponseUtil.sendError(response, 404, "职位不存在");
                return;
            }
            
            ResponseUtil.sendSuccess(response, job);
            
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "服务器错误: " + e.getMessage());
        }
    }
}
