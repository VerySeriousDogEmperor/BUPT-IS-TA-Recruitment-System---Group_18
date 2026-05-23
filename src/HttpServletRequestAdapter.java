import com.sun.net.httpserver.HttpExchange;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.*;
import java.security.Principal;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class HttpServletRequestAdapter implements HttpServletRequest {
    private static final String SESSION_COOKIE_NAME = "JSESSIONID";

    private HttpExchange exchange;
    private Map<String, Object> attributes = new HashMap<>();
    private HttpSessionAdapter session;
    private String contextPath = "";
    private Cookie[] cookies;
    private String requestedSessionId;

    public HttpServletRequestAdapter(HttpExchange exchange) {
        this(exchange, "");
    }

    public HttpServletRequestAdapter(HttpExchange exchange, String contextPath) {
        this.exchange = exchange;
        this.contextPath = contextPath;
        this.cookies = parseCookies();
        this.requestedSessionId = extractSessionId(cookies);
        this.session = HttpSessionAdapter.find(requestedSessionId);
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
        String[] values = getParameterMap().get(name);
        return values == null || values.length == 0 ? null : values[0];
    }

    @Override
    public HttpSession getSession(boolean create) {
        if (session == null && create) {
            session = HttpSessionAdapter.create();
            requestedSessionId = session.getId();
            exchange.getResponseHeaders().add("Set-Cookie", buildSessionCookie(requestedSessionId));
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

    private Cookie[] parseCookies() {
        String cookieHeader = getHeader("Cookie");
        if (cookieHeader == null || cookieHeader.isBlank()) {
            return new Cookie[0];
        }

        List<Cookie> parsedCookies = new ArrayList<>();
        for (String cookiePart : cookieHeader.split(";")) {
            String[] pair = cookiePart.trim().split("=", 2);
            if (pair.length == 2) {
                parsedCookies.add(new Cookie(pair[0].trim(), pair[1].trim()));
            }
        }
        return parsedCookies.toArray(new Cookie[0]);
    }

    private String extractSessionId(Cookie[] parsedCookies) {
        for (Cookie cookie : parsedCookies) {
            if (SESSION_COOKIE_NAME.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private String buildSessionCookie(String sessionId) {
        return SESSION_COOKIE_NAME + "=" + sessionId + "; Path=/; HttpOnly; SameSite=Lax";
    }

    @Override public String getAuthType() { return null; }
    @Override public Cookie[] getCookies() { return cookies.length == 0 ? null : cookies.clone(); }
    @Override public long getDateHeader(String name) { return -1; }
    @Override public Enumeration<String> getHeaders(String name) { return Collections.emptyEnumeration(); }
    @Override public Enumeration<String> getHeaderNames() { return Collections.enumeration(exchange.getRequestHeaders().keySet()); }
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
    @Override public String getRequestedSessionId() { return requestedSessionId; }
    @Override public String getServletPath() { return contextPath; }
    @Override public boolean isRequestedSessionIdValid() { return requestedSessionId != null && session != null; }
    @Override public boolean isRequestedSessionIdFromCookie() { return requestedSessionId != null; }
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
    @Override public Map<String, String[]> getParameterMap() {
        Map<String, List<String>> values = new LinkedHashMap<>();
        String query = getQueryString();
        if (query != null && !query.isBlank()) {
            for (String param : query.split("&")) {
                if (param.isEmpty()) continue;
                String[] pair = param.split("=", 2);
                String key = decode(pair[0]);
                String value = pair.length > 1 ? decode(pair[1]) : "";
                values.computeIfAbsent(key, k -> new ArrayList<>()).add(value);
            }
        }
        Map<String, String[]> result = new LinkedHashMap<>();
        for (Map.Entry<String, List<String>> entry : values.entrySet()) {
            result.put(entry.getKey(), entry.getValue().toArray(new String[0]));
        }
        return result;
    }
    @Override public Enumeration<String> getParameterNames() { return Collections.enumeration(getParameterMap().keySet()); }
    @Override public String[] getParameterValues(String name) { return getParameterMap().get(name); }
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
    @Override public String changeSessionId() {
        if (session == null) {
            session = HttpSessionAdapter.create();
        }
        requestedSessionId = session.getId();
        exchange.getResponseHeaders().set("Set-Cookie", buildSessionCookie(requestedSessionId));
        return requestedSessionId;
    }

    private String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }
}
