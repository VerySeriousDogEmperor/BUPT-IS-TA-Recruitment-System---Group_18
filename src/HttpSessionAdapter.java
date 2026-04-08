import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.util.*;

public class HttpSessionAdapter implements HttpSession {
    private String id = UUID.randomUUID().toString();
    private Map<String, Object> attributes = new HashMap<>();
    private long creationTime = System.currentTimeMillis();
    private long lastAccessedTime = creationTime;
    private int maxInactiveInterval = 1800; // 30 minutes
    
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
        return attributes.get(name);
    }
    
    @Override
    public Enumeration<String> getAttributeNames() {
        return Collections.enumeration(attributes.keySet());
    }
    
    @Override
    public void setAttribute(String name, Object value) {
        attributes.put(name, value);
    }
    
    @Override
    public void removeAttribute(String name) {
        attributes.remove(name);
    }
    
    @Override
    public void invalidate() {
        attributes.clear();
    }
    
    @Override
    public boolean isNew() {
        return false;
    }
    
    @Override
    public ServletContext getServletContext() {
        return null;
    }
}
