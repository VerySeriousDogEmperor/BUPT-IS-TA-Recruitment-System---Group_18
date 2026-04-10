package com.bupt.ta.shared.domain;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 申请记录
 */
public class Application {
    private String id;
    private String studentId;
    private String jobId;
    private String status; // pending | approved | rejected | withdrawn
    private String coverLetter;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
    private String reviewNote;
    private String reviewedBy; // MO ID who reviewed
    private LocalDateTime reviewedAt;
    private String reviewComment;
    private Integer aiScore;
    private Integer aiRank;
    private List<TimelineItem> timeline;

    public Application() {
        this.appliedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = "pending";
        this.timeline = new ArrayList<>();
        
        // 添加初始时间线
        TimelineItem item = new TimelineItem();
        item.setStatus("submitted");
        item.setTime(this.appliedAt);
        item.setNote("申请已提交");
        this.timeline.add(item);
    }

    // 时间线项
    public static class TimelineItem {
        private String status;
        private LocalDateTime time;
        private String note;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public LocalDateTime getTime() { return time; }
        public void setTime(LocalDateTime time) { this.time = time; }
        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    
    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }
    
    public LocalDateTime getAppliedAt() { return appliedAt; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public String getReviewNote() { return reviewNote; }
    public void setReviewNote(String reviewNote) { this.reviewNote = reviewNote; }
    
    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }
    
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
    
    public String getReviewComment() { return reviewComment; }
    public void setReviewComment(String reviewComment) { this.reviewComment = reviewComment; }
    
    public Integer getAiScore() { return aiScore; }
    public void setAiScore(Integer aiScore) { this.aiScore = aiScore; }
    
    public Integer getAiRank() { return aiRank; }
    public void setAiRank(Integer aiRank) { this.aiRank = aiRank; }
    
    public List<TimelineItem> getTimeline() { return timeline; }
    public void setTimeline(List<TimelineItem> timeline) { this.timeline = timeline; }
}
