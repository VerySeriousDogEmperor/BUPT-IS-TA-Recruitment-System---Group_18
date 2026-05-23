package com.bupt.ta.shared.util;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * 统一响应工具类
 */
public class ResponseUtil {
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    
    private static final Gson gson = new GsonBuilder()
            .setPrettyPrinting()
            .registerTypeAdapter(LocalDateTime.class, (com.google.gson.JsonSerializer<LocalDateTime>) 
                (src, typeOfSrc, context) -> new com.google.gson.JsonPrimitive(src.format(DATE_TIME_FORMATTER)))
            .registerTypeAdapter(LocalDateTime.class, (com.google.gson.JsonDeserializer<LocalDateTime>) 
                (json, typeOfT, context) -> LocalDateTime.parse(json.getAsString(), DATE_TIME_FORMATTER))
            .create();
    
    /**
     * 发送成功响应
     */
    public static void sendSuccess(HttpServletResponse response, Object data) throws IOException {
        sendResponse(response, 200, "success", data);
    }
    
    /**
     * 发送成功响应（自定义消息）
     */
    public static void sendSuccess(HttpServletResponse response, String message, Object data) throws IOException {
        sendResponse(response, 200, message, data);
    }
    
    /**
     * 发送错误响应
     */
    public static void sendError(HttpServletResponse response, int code, String message) throws IOException {
        sendResponse(response, code, message, null);
    }
    
    /**
     * 发送响应
     */
    private static void sendResponse(HttpServletResponse response, int code, String message, Object data) throws IOException {
        response.setStatus(code);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, X-CSRF-Token");
        
        Map<String, Object> result = new HashMap<>();
        result.put("code", code);
        result.put("message", message);
        result.put("data", data);
        
        PrintWriter out = response.getWriter();
        out.print(gson.toJson(result));
        out.flush();
    }
}
