package com.bupt.ta.shared.domain;

import java.time.LocalDateTime;

public class KnowledgeDocument {
    private String id;
    private String name;
    private String size;
    private String status;
    private String db;
    private String preview;
    private LocalDateTime syncedAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDb() { return db; }
    public void setDb(String db) { this.db = db; }

    public String getPreview() { return preview; }
    public void setPreview(String preview) { this.preview = preview; }

    public LocalDateTime getSyncedAt() { return syncedAt; }
    public void setSyncedAt(LocalDateTime syncedAt) { this.syncedAt = syncedAt; }
}
