package com.bupt.ta.shared.domain;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 职位实体
 */
public class Job {
    private String id;
    private String moduleId;
    private String moId;
    private String moName;
    private String title;
    private String department;
    private String type; // TA | RA | Grader
    private String description;
    private List<String> responsibilities;
    private List<String> requirements;
    private List<String> requiredSkills;
    private Integer hoursPerWeek;
    private Double hourlyRate;
    private Schedule schedule;
    private String startDate;
    private String endDate;
    private Integer slots;
    private String status; // draft | pending | published | completed
    private String createdBy; // MO ID who created this job
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime publishedAt;
    private String moduleCode; // 课程代码
    private String moduleName; // 课程名称
    private Integer positions; // 招聘人数（同 slots）
    private String duration; // 持续时间

    public Job() {
        this.responsibilities = new ArrayList<>();
        this.requirements = new ArrayList<>();
        this.requiredSkills = new ArrayList<>();
        this.schedule = new Schedule();
        this.createdAt = LocalDateTime.now();
        this.status = "draft";
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getModuleId() { return moduleId; }
    public void setModuleId(String moduleId) { this.moduleId = moduleId; }
    
    public String getMoId() { return moId; }
    public void setMoId(String moId) { this.moId = moId; }
    
    public String getMoName() { return moName; }
    public void setMoName(String moName) { this.moName = moName; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public List<String> getResponsibilities() { return responsibilities; }
    public void setResponsibilities(List<String> responsibilities) { this.responsibilities = responsibilities; }
    
    public List<String> getRequirements() { return requirements; }
    public void setRequirements(List<String> requirements) { this.requirements = requirements; }
    
    public List<String> getRequiredSkills() { return requiredSkills; }
    public void setRequiredSkills(List<String> requiredSkills) { this.requiredSkills = requiredSkills; }
    
    public Integer getHoursPerWeek() { return hoursPerWeek; }
    public void setHoursPerWeek(Integer hoursPerWeek) { this.hoursPerWeek = hoursPerWeek; }
    
    public Double getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(Double hourlyRate) { this.hourlyRate = hourlyRate; }
    
    public Schedule getSchedule() { return schedule; }
    public void setSchedule(Schedule schedule) { this.schedule = schedule; }
    
    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }
    
    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }
    
    public Integer getSlots() { return slots; }
    public void setSlots(Integer slots) { this.slots = slots; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; }
    
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public String getModuleCode() { return moduleCode; }
    public void setModuleCode(String moduleCode) { this.moduleCode = moduleCode; }
    
    public String getModuleName() { return moduleName; }
    public void setModuleName(String moduleName) { this.moduleName = moduleName; }
    
    public Integer getPositions() { return positions; }
    public void setPositions(Integer positions) { this.positions = positions; }
    
    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }
}
