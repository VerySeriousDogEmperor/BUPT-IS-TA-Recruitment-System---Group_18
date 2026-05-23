package com.bupt.ta.shared.domain;

import java.time.LocalDateTime;

public class ArchiveRecord {
    private String id;
    private String semester;
    private String path;
    private LocalDateTime archivedAt;
    private String archivedBy;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }
    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }
    public LocalDateTime getArchivedAt() { return archivedAt; }
    public void setArchivedAt(LocalDateTime archivedAt) { this.archivedAt = archivedAt; }
    public String getArchivedBy() { return archivedBy; }
    public void setArchivedBy(String archivedBy) { this.archivedBy = archivedBy; }
}
