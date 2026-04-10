package com.bupt.ta.shared.interfaces;

import com.bupt.ta.shared.util.ResponseUtil;
import com.bupt.ta.shared.util.SessionUtil;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonSyntaxException;

import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Servlet 基类
 * 提供通用功能
 */
public abstract class BaseServlet extends HttpServlet {
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    
    protected static final Gson gson = new GsonBuilder()
            .registerTypeAdapter(LocalDateTime.class, (com.google.gson.JsonSerializer<LocalDateTime>) 
                (src, typeOfSrc, context) -> new com.google.gson.JsonPrimitive(src.format(DATE_TIME_FORMATTER)))
            .registerTypeAdapter(LocalDateTime.class, (com.google.gson.JsonDeserializer<LocalDateTime>) 
                (json, typeOfT, context) -> LocalDateTime.parse(json.getAsString(), DATE_TIME_FORMATTER))
            .create();
    
    /**
     * 处理 OPTIONS 请求（CORS 预检）
     */
    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setStatus(HttpServletResponse.SC_OK);
    }
    
    /**
     * 读取请求体并解析为对象
     */
    protected <T> T readRequestBody(HttpServletRequest request, Class<T> clazz) throws IOException {
        StringBuilder sb = new StringBuilder();
        BufferedReader reader = request.getReader();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
        
        try {
            return gson.fromJson(sb.toString(), clazz);
        } catch (JsonSyntaxException e) {
            throw new IOException("Invalid JSON format", e);
        }
    }
    
    /**
     * 检查是否已登录
     */
    protected boolean requireLogin(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!SessionUtil.isLoggedIn(request)) {
            ResponseUtil.sendError(response, 401, "未登录");
            return false;
        }
        return true;
    }
    
    /**
     * 检查是否有指定角色
     */
    protected boolean requireRole(HttpServletRequest request, HttpServletResponse response, String role) throws IOException {
        if (!SessionUtil.hasRole(request, role)) {
            ResponseUtil.sendError(response, 403, "无权限");
            return false;
        }
        return true;
    }
    
    /**
     * 获取当前用户ID
     */
    protected String getCurrentUserId(HttpServletRequest request) {
        return SessionUtil.getCurrentUserId(request);
    }
}
