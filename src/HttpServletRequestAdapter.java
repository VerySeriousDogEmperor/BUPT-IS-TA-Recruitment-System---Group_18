import com.sun.net.httpserver.HttpExchange;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.*;
import java.security.Principal;
import java.util.*;

public class HttpServletRequestAdapter implements HttpServletRequest {
    private HttpExchange exchange;
    private Map<String, Object> attributes = new HashMap<>();
    private HttpSession session;
    private String contextPath = ""; // 上下文路径，如 /api/auth
    
    public HttpServletRequestAdapter(HttpExchange exchange) {
        this(exchange, "");
    }
    
    public HttpServletRequestAdapter(HttpExchange exchange, String contextPath) {
        this.exchange = exchange;
        this.contextPath = contextPath;
    }
    
    @Override
    public String getMethod() {
        return exchange.getRequestMethod();
    }
    
    @Override
    public String getRequestURI() {
        return exchange.getRequestURI().getPath();
    }
    
    @Override
    public StringBuffer getRequestURL() {
        return new StringBuffer("http://localhost:9191" + getRequestURI());
    }
    
    @Override
    public String getQueryString() {
        return exchange.getRequestURI().getQuery();
    }
    
    @Override
    public BufferedReader getReader() throws IOException {
        return new BufferedReader(new InputStreamReader(exchange.getRequestBody(), "UTF-8"));
    }
    
    @Override
    public String getParameter(String name) {
        String query = getQueryString();
        if (query == null) return null;
        for (String param : query.split("&")) {
            String[] pair = param.split("=");
            if (pair.length == 2 && pair[0].equals(name)) {
                return pair[1];
            }
        }
        return null;
    }
    
    @Override
    public HttpSession getSession(boolean create) {
        if (session == null && create) {
            session = new HttpSessionAdapter();
        }
        return session;
    }
    
    @Override
    public HttpSession getSession() {
        return getSession(true);
    }
    
    @Override
    public void setAttribute(String name, Object value) {
        attributes.put(name, value);
    }
    
    @Override
    public Object getAttribute(String name) {
        return attributes.get(name);
    }
    
    @Override
    public String getHeader(String name) {
        List<String> headers = exchange.getRequestHeaders().get(name);
        return headers != null && !headers.isEmpty() ? headers.get(0) : null;
    }
    
    // 未实现的方法返回默认值
    @Override public String getAuthType() { return null; }
    @Override public Cookie[] getCookies() { return new Cookie[0]; }
    @Override public long getDateHeader(String name) { return -1; }
    @Override public Enumeration<String> getHeaders(String name) { return Collections.emptyEnumeration(); }
    @Override public Enumeration<String> getHeaderNames() { return Collections.emptyEnumeration(); }
    @Override public int getIntHeader(String name) { return -1; }
    @Override public String getPathInfo() { 
        String uri = getRequestURI();
        if (contextPath.isEmpty() || !uri.startsWith(contextPath)) {
            return uri;
        }
        String pathInfo = uri.substring(contextPath.length());
        return pathInfo.isEmpty() ? null : pathInfo;
    }
    @Override public String getPathTranslated() { return null; }
    @Override public String getContextPath() { return ""; }
    @Override public String getRemoteUser() { return null; }
    @Override public boolean isUserInRole(String role) { return false; }
    @Override public Principal getUserPrincipal() { return null; }
    @Override public String getRequestedSessionId() { return null; }
    @Override public String getServletPath() { return contextPath; }
    @Override public boolean isRequestedSessionIdValid() { return false; }
    @Override public boolean isRequestedSessionIdFromCookie() { return false; }
    @Override public boolean isRequestedSessionIdFromURL() { return false; }
    @Override public boolean authenticate(HttpServletResponse response) { return false; }
    @Override public void login(String username, String password) {}
    @Override public void logout() {}
    @Override public Collection<Part> getParts() { return Collections.emptyList(); }
    @Override public Part getPart(String name) { return null; }
    @Override public <T extends HttpUpgradeHandler> T upgrade(Class<T> handlerClass) { return null; }
    @Override public Enumeration<String> getAttributeNames() { return Collections.enumeration(attributes.keySet()); }
    @Override public String getCharacterEncoding() { return "UTF-8"; }
    @Override public void setCharacterEncoding(String env) {}
    @Override public int getContentLength() { return -1; }
    @Override public long getContentLengthLong() { return -1; }
    @Override public String getContentType() { return getHeader("Content-Type"); }
    @Override public ServletInputStream getInputStream() { return null; }
    @Override public Map<String, String[]> getParameterMap() { return Collections.emptyMap(); }
    @Override public Enumeration<String> getParameterNames() { return Collections.emptyEnumeration(); }
    @Override public String[] getParameterValues(String name) { return null; }
    @Override public String getProtocol() { return "HTTP/1.1"; }
    @Override public String getScheme() { return "http"; }
    @Override public String getServerName() { return "localhost"; }
    @Override public int getServerPort() { return 9191; }
    @Override public String getRemoteAddr() { return exchange.getRemoteAddress().getAddress().getHostAddress(); }
    @Override public String getRemoteHost() { return exchange.getRemoteAddress().getHostName(); }
    @Override public void removeAttribute(String name) { attributes.remove(name); }
    @Override public Locale getLocale() { return Locale.getDefault(); }
    @Override public Enumeration<Locale> getLocales() { return Collections.enumeration(Arrays.asList(Locale.getDefault())); }
    @Override public boolean isSecure() { return false; }
    @Override public RequestDispatcher getRequestDispatcher(String path) { return null; }
    @Override public int getRemotePort() { return exchange.getRemoteAddress().getPort(); }
    @Override public String getLocalName() { return "localhost"; }
    @Override public String getLocalAddr() { return "127.0.0.1"; }
    @Override public int getLocalPort() { return 9191; }
    @Override public ServletContext getServletContext() { return null; }
    @Override public AsyncContext startAsync() { return null; }
    @Override public AsyncContext startAsync(ServletRequest servletRequest, ServletResponse servletResponse) { return null; }
    @Override public boolean isAsyncStarted() { return false; }
    @Override public boolean isAsyncSupported() { return false; }
    @Override public AsyncContext getAsyncContext() { return null; }
    @Override public DispatcherType getDispatcherType() { return DispatcherType.REQUEST; }
    @Override public String getRequestId() { return null; }
    @Override public String getProtocolRequestId() { return null; }
    @Override public ServletConnection getServletConnection() { return null; }
    @Override public String changeSessionId() { return null; }
}
