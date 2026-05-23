import com.sun.net.httpserver.*;
import com.bupt.ta.shared.interfaces.*;
import com.bupt.ta.student.interfaces.*;
import com.bupt.ta.admin.interfaces.*;
import jakarta.servlet.http.*;
import java.io.*;
import java.net.InetSocketAddress;
import java.nio.file.*;
import java.util.*;

/**
 * 嵌入式服务器 - 集成所有 Servlet
 */
public class EmbeddedServer {
    private static final int DEFAULT_PORT = 9191;
    private static final String WEB_ROOT = "web";
    private static Map<String, HttpSession> sessions = new HashMap<>();
    
    public static void main(String[] args) throws Exception {
        int port = resolvePort(args);

        // 初始化数据（直接调用静态块）
        try {
            Class.forName("com.bupt.ta.shared.infrastructure.DataStore");
        } catch (Exception e) {
            System.out.println("数据初始化失败: " + e.getMessage());
        }
        
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        
        // API 路由 - 使用实际的 Servlet
        // 认证和共享接口
        server.createContext("/api/auth", new ServletAdapter(new AuthServlet(), "/api/auth"));
        server.createContext("/api/jobs", new ServletAdapter(new JobServlet(), "/api/jobs"));
        server.createContext("/api/announcements", new ServletAdapter(new AnnouncementServlet(), "/api/announcements"));
        server.createContext("/api/notifications", new ServletAdapter(new NotificationServlet(), "/api/notifications"));
        server.createContext("/api/ai", new ServletAdapter(new AIServlet(), "/api/ai"));
        server.createContext("/api/knowledge", new ServletAdapter(new KnowledgeServlet(), "/api/knowledge"));
        
        // 学生端接口
        server.createContext("/api/student/profile", new ServletAdapter(new StudentProfileServlet(), "/api/student/profile"));
        server.createContext("/api/student/applications", new ServletAdapter(new StudentApplicationServlet(), "/api/student/applications"));
        server.createContext("/api/student/timesheets", new ServletAdapter(new StudentTimesheetServlet(), "/api/student/timesheets"));
        
        // MO 端接口
        server.createContext("/api/mo/jobs", new ServletAdapter(new com.bupt.ta.mo.interfaces.MOJobServlet(), "/api/mo/jobs"));
        server.createContext("/api/mo/applicants", new ServletAdapter(new com.bupt.ta.mo.interfaces.MOApplicantServlet(), "/api/mo/applicants"));
        server.createContext("/api/mo/timesheets", new ServletAdapter(new com.bupt.ta.mo.interfaces.MOTimesheetServlet(), "/api/mo/timesheets"));
        server.createContext("/api/mo/modules", new ServletAdapter(new com.bupt.ta.mo.interfaces.MOModuleServlet(), "/api/mo/modules"));

        // Admin 绔帴鍙?
        server.createContext("/api/admin", new ServletAdapter(new AdminServlet(), "/api/admin"));
        
        // 静态文件（最后注册，优先级最低）
        server.createContext("/", new StaticHandler());
        
        server.setExecutor(null);
        server.start();
        
        System.out.println("========================================");
        System.out.println("✓ 服务器已启动");
        System.out.println("");
        System.out.println("访问地址:");
        System.out.println("  主页:   http://localhost:" + port);
        System.out.println("  登录:   http://localhost:" + port + "/login.html");
        System.out.println("");
        System.out.println("测试账号:");
        System.out.println("  学生:   zhangsan@bupt.edu.cn / 123456");
        System.out.println("  MO:     mo1@bupt.edu.cn / 123456");
        System.out.println("  管理员: admin@bupt.edu.cn / 123456");
        System.out.println("");
        System.out.println("按 Ctrl+C 停止服务器");
        System.out.println("========================================");
    }
    
    // Servlet 适配器 - 将 Servlet 适配到 HttpServer
    private static int resolvePort(String[] args) {
        if (args != null && args.length > 0) {
            try {
                return Integer.parseInt(args[0]);
            } catch (NumberFormatException ignored) {
                System.out.println("Invalid port argument, using default " + DEFAULT_PORT);
            }
        }
        return DEFAULT_PORT;
    }

    static class ServletAdapter implements HttpHandler {
        private jakarta.servlet.http.HttpServlet servlet;
        private String contextPath;
        
        public ServletAdapter(jakarta.servlet.http.HttpServlet servlet, String contextPath) {
            this.servlet = servlet;
            this.contextPath = contextPath;
        }
        
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            try {
                // 创建适配的 Request 和 Response
                HttpServletRequestAdapter request = new HttpServletRequestAdapter(exchange, contextPath);
                HttpServletResponseAdapter response = new HttpServletResponseAdapter(exchange);
                
                // 调用 Servlet 的 service 方法（public）
                servlet.service(request, response);
                
                response.finish();
            } catch (Exception e) {
                e.printStackTrace();
                String error = "{\"error\":\"" + e.getMessage() + "\"}";
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                exchange.sendResponseHeaders(500, error.length());
                OutputStream os = exchange.getResponseBody();
                os.write(error.getBytes());
                os.close();
            }
        }
    }
    
    // 静态文件处理器
    static class StaticHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            if (path.equals("/")) path = "/index.html";
            
            File file = new File(WEB_ROOT + path);
            
            if (file.exists() && file.isFile()) {
                exchange.getResponseHeaders().set("Content-Type", getContentType(path));
                byte[] bytes = Files.readAllBytes(file.toPath());
                exchange.sendResponseHeaders(200, bytes.length);
                OutputStream os = exchange.getResponseBody();
                os.write(bytes);
                os.close();
            } else {
                String response = "404 Not Found";
                exchange.sendResponseHeaders(404, response.length());
                OutputStream os = exchange.getResponseBody();
                os.write(response.getBytes());
                os.close();
            }
        }
        
        private String getContentType(String path) {
            if (path.endsWith(".html")) return "text/html; charset=UTF-8";
            if (path.endsWith(".css")) return "text/css; charset=UTF-8";
            if (path.endsWith(".js")) return "application/javascript; charset=UTF-8";
            if (path.endsWith(".json")) return "application/json; charset=UTF-8";
            if (path.endsWith(".png")) return "image/png";
            if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
            return "text/plain";
        }
    }
}
