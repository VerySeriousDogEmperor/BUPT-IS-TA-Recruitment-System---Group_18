package com.bupt.ta.shared.domain;

import java.time.LocalDateTime;

/**
 * 工时记录
 */
public class Timesheet {
    private String id;
    private String studentId;
    private String jobId;
    private String applicationId; // 关联的申请 ID
    private String date; // YYYY-MM-DD
    private Double hours;
    private Double hoursWorked; // 实际工作时长
    private Double approvedHours; // 批准的工时
    private String description;
    private String status; // pending | approved | rejected
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
    private String reviewedBy; // MO ID who reviewed
    private String reviewNote;
    private String reviewComment;
    private LocalDateTime updatedAt;
    private Boolean hasAnomaly;
    private String anomalyReason;

    public Timesheet() {
        this.submittedAt = LocalDateTime.now();
        this.status = "pending";
        this.hasAnomaly = false;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    
    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }
    
    public String getApplicationId() { return applicationId; }
    public void setApplicationId(String applicationId) { this.applicationId = applicationId; }
    
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    
    public Double getHours() { return hours != null ? hours : hoursWorked; }
    public void setHours(Double hours) { this.hours = hours; }
    
    public Double getHoursWorked() { return hoursWorked != null ? hoursWorked : hours; }
    public void setHoursWorked(Double hoursWorked) { this.hoursWorked = hoursWorked; }
    
    public Double getApprovedHours() { return approvedHours; }
    public void setApprovedHours(Double approvedHours) { this.approvedHours = approvedHours; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
    
    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }
    
    public String getReviewNote() { return reviewNote != null ? reviewNote : reviewComment; }
    public void setReviewNote(String reviewNote) { this.reviewNote = reviewNote; }
    
    public String getReviewComment() { return reviewComment != null ? reviewComment : reviewNote; }
    public void setReviewComment(String reviewComment) { this.reviewComment = reviewComment; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public Boolean getHasAnomaly() { return hasAnomaly; }
    public void setHasAnomaly(Boolean hasAnomaly) { this.hasAnomaly = hasAnomaly; }
    
    public String getAnomalyReason() { return anomalyReason; }
    public void setAnomalyReason(String anomalyReason) { this.anomalyReason = anomalyReason; }

    public void normalizeCompatibleFields() {
        if (hours == null && hoursWorked != null) {
            hours = hoursWorked;
        }
        if (hoursWorked == null && hours != null) {
            hoursWorked = hours;
        }
        if ((reviewNote == null || reviewNote.isBlank()) && reviewComment != null && !reviewComment.isBlank()) {
            reviewNote = reviewComment;
        }
        if ((reviewComment == null || reviewComment.isBlank()) && reviewNote != null && !reviewNote.isBlank()) {
            reviewComment = reviewNote;
        }
    }
}
