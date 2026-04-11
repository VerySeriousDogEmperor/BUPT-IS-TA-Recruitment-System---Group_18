import com.sun.net.httpserver.HttpExchange;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.*;
import java.util.*;

public class HttpServletResponseAdapter implements HttpServletResponse {
    private HttpExchange exchange;
    private ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
    private PrintWriter writer;
    private int status = 200;
    private String contentType = "text/html";

    public HttpServletResponseAdapter(HttpExchange exchange) {
        this.exchange = exchange;
        this.writer = new PrintWriter(new OutputStreamWriter(outputStream, java.nio.charset.StandardCharsets.UTF_8), true);
    }

    @Override
    public void setContentType(String type) {
        this.contentType = type;
    }

    @Override
    public void setStatus(int sc) {
        this.status = sc;
    }

    @Override
    public void setHeader(String name, String value) {
        exchange.getResponseHeaders().set(name, value);
    }

    @Override
    public void addHeader(String name, String value) {
        exchange.getResponseHeaders().add(name, value);
    }

    @Override
    public PrintWriter getWriter() {
        return writer;
    }

    @Override
    public ServletOutputStream getOutputStream() {
        return new ServletOutputStream() {
            @Override
            public void write(int b) {
                outputStream.write(b);
            }

            @Override
            public boolean isReady() {
                return true;
            }

            @Override
            public void setWriteListener(WriteListener writeListener) {}
        };
    }

    public void finish() throws IOException {
        writer.flush();
        byte[] bytes = outputStream.toByteArray();

        exchange.getResponseHeaders().set("Content-Type", contentType);
        exchange.sendResponseHeaders(status, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }

    @Override
    public void addCookie(Cookie cookie) {
        if (cookie == null) {
            return;
        }
        StringBuilder headerValue = new StringBuilder();
        headerValue.append(cookie.getName()).append("=").append(cookie.getValue());
        if (cookie.getPath() != null && !cookie.getPath().isEmpty()) {
            headerValue.append("; Path=").append(cookie.getPath());
        }
        if (cookie.getMaxAge() >= 0) {
            headerValue.append("; Max-Age=").append(cookie.getMaxAge());
        }
        if (cookie.getSecure()) {
            headerValue.append("; Secure");
        }
        if (cookie.isHttpOnly()) {
            headerValue.append("; HttpOnly");
        }
        exchange.getResponseHeaders().add("Set-Cookie", headerValue.toString());
    }

    @Override public boolean containsHeader(String name) { return false; }
    @Override public String encodeURL(String url) { return url; }
    @Override public String encodeRedirectURL(String url) { return url; }
    @Override public void sendError(int sc, String msg) { status = sc; }
    @Override public void sendError(int sc) { status = sc; }
    @Override public void sendRedirect(String location) {}
    @Override public void setDateHeader(String name, long date) {}
    @Override public void addDateHeader(String name, long date) {}
    @Override public void setIntHeader(String name, int value) {}
    @Override public void addIntHeader(String name, int value) {}
    @Override public int getStatus() { return status; }
    @Override public String getHeader(String name) { return exchange.getResponseHeaders().getFirst(name); }
    @Override public Collection<String> getHeaders(String name) { return exchange.getResponseHeaders().getOrDefault(name, Collections.emptyList()); }
    @Override public Collection<String> getHeaderNames() { return exchange.getResponseHeaders().keySet(); }
    @Override public String getCharacterEncoding() { return "UTF-8"; }
    @Override public String getContentType() { return contentType; }
    @Override public void setCharacterEncoding(String charset) {}
    @Override public void setContentLength(int len) {}
    @Override public void setContentLengthLong(long len) {}
    @Override public void setBufferSize(int size) {}
    @Override public int getBufferSize() { return 8192; }
    @Override public void flushBuffer() {}
    @Override public void resetBuffer() {}
    @Override public boolean isCommitted() { return false; }
    @Override public void reset() {}
    @Override public void setLocale(Locale loc) {}
    @Override public Locale getLocale() { return Locale.getDefault(); }
}
