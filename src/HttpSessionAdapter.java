import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class HttpSessionAdapter implements HttpSession {
    private static final Map<String, HttpSessionAdapter> SESSIONS = new ConcurrentHashMap<>();

    private String id = UUID.randomUUID().toString();
    private Map<String, Object> attributes = new HashMap<>();
    private long creationTime = System.currentTimeMillis();
    private long lastAccessedTime = creationTime;
    private int maxInactiveInterval = 1800; // 30 minutes
    private boolean isNew = true;
    private boolean invalidated = false;

    public static HttpSessionAdapter create() {
        HttpSessionAdapter session = new HttpSessionAdapter();
        SESSIONS.put(session.getId(), session);
        return session;
    }

    public static HttpSessionAdapter find(String sessionId) {
        if (sessionId == null || sessionId.isEmpty()) {
            return null;
        }
        HttpSessionAdapter session = SESSIONS.get(sessionId);
        if (session == null) {
            return null;
        }
        if (session.isExpired()) {
            session.invalidate();
            return null;
        }
        session.touch();
        session.markAccessed();
        return session;
    }

    private boolean isExpired() {
        if (invalidated) {
            return true;
        }
        if (maxInactiveInterval < 0) {
            return false;
        }
        long idleMillis = System.currentTimeMillis() - lastAccessedTime;
        return idleMillis > (long) maxInactiveInterval * 1000L;
    }

    public void touch() {
        this.lastAccessedTime = System.currentTimeMillis();
    }

    public void markAccessed() {
        this.isNew = false;
    }
    
    @Override
    public String getId() {
        return id;
    }
    
    @Override
    public long getCreationTime() {
        return creationTime;
    }
    
    @Override
    public long getLastAccessedTime() {
        return lastAccessedTime;
    }
    
    @Override
    public void setMaxInactiveInterval(int interval) {
        this.maxInactiveInterval = interval;
    }
    
    @Override
    public int getMaxInactiveInterval() {
        return maxInactiveInterval;
    }
    
    @Override
    public Object getAttribute(String name) {
        touch();
        return attributes.get(name);
    }
    
    @Override
    public Enumeration<String> getAttributeNames() {
        touch();
        return Collections.enumeration(attributes.keySet());
    }
    
    @Override
    public void setAttribute(String name, Object value) {
        touch();
        attributes.put(name, value);
    }
    
    @Override
    public void removeAttribute(String name) {
        touch();
        attributes.remove(name);
    }
    
    @Override
    public void invalidate() {
        invalidated = true;
        attributes.clear();
        SESSIONS.remove(id);
    }
    
    @Override
    public boolean isNew() {
        return isNew;
    }
    
    @Override
    public ServletContext getServletContext() {
        return null;
    }
}
