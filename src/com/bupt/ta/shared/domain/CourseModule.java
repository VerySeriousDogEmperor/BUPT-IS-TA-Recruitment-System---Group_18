package com.bupt.ta.shared.domain;

import java.time.LocalDateTime;

/**
 * 模块/课程
 */
public class CourseModule {
    private String id;
    private String name;
    private String code;
    private String department;
    private String semester;
    private String moId;
    private String coordinatorId; // 课程负责人 ID（同 moId）
    private String description;
    private LocalDateTime createdAt;

    public CourseModule() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    
    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }
    
    public String getMoId() { return moId; }
    public void setMoId(String moId) { this.moId = moId; }
    
    public String getCoordinatorId() { return coordinatorId; }
    public void setCoordinatorId(String coordinatorId) { this.coordinatorId = coordinatorId; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
