package com.bupt.ta.mo.interfaces;

import com.bupt.ta.shared.domain.CourseModule;
import com.bupt.ta.shared.domain.User;
import com.bupt.ta.shared.infrastructure.ModuleRepository;
import com.bupt.ta.shared.interfaces.BaseServlet;
import com.bupt.ta.shared.util.ResponseUtil;
import com.bupt.ta.shared.util.SessionUtil;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * MO 课程模块接口
 * GET /api/mo/modules - 获取 MO 的课程列表
 * GET /api/mo/modules/{id} - 获取课程详情
 */
@WebServlet("/api/mo/modules/*")
public class MOModuleServlet extends BaseServlet {
    private final ModuleRepository moduleRepo = new ModuleRepository();
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        User currentUser = SessionUtil.getCurrentMOUser(request);
        if (currentUser == null || !"mo".equals(currentUser.getRole())) {
            ResponseUtil.sendError(response, 401, "未授权");
            return;
        }
        
        String pathInfo = request.getPathInfo();
        
        if (pathInfo == null || "/".equals(pathInfo)) {
            // 获取课程列表
            handleGetModules(response, currentUser);
        } else {
            // 获取课程详情
            String moduleId = pathInfo.substring(1);
            handleGetModuleDetail(response, moduleId, currentUser);
        }
    }
    
    /**
     * 获取 MO 的课程列表
     */
    private void handleGetModules(HttpServletResponse response, User currentUser) throws IOException {
        try {
            List<CourseModule> modules = moduleRepo.findAll();
            
            // 过滤：只显示当前 MO 负责的课程
            // 假设 CourseModule 有 coordinatorId 字段
            modules = modules.stream()
                    .filter(module -> currentUser.getId().equals(module.getCoordinatorId()))
                    .collect(Collectors.toList());
            
            ResponseUtil.sendSuccess(response, "获取成功", modules);
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "服务器错误: " + e.getMessage());
        }
    }
    
    /**
     * 获取课程详情
     */
    private void handleGetModuleDetail(HttpServletResponse response, String moduleId, User currentUser) throws IOException {
        try {
            Optional<CourseModule> moduleOpt = moduleRepo.findById(moduleId);
            if (!moduleOpt.isPresent()) {
                ResponseUtil.sendError(response, 404, "课程不存在");
                return;
            }
            
            CourseModule module = moduleOpt.get();
            
            // 验证权限：只能查看自己负责的课程
            if (!currentUser.getId().equals(module.getCoordinatorId())) {
                ResponseUtil.sendError(response, 403, "无权访问");
                return;
            }
            
            ResponseUtil.sendSuccess(response, "获取成功", module);
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "服务器错误: " + e.getMessage());
        }
    }
}
