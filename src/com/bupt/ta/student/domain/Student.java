package com.bupt.ta.student.domain;

import com.bupt.ta.shared.domain.Resume;
import com.bupt.ta.shared.domain.Schedule;
import com.bupt.ta.shared.domain.User;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 学生实体
 */
public class Student extends User {
    private String studentId;
    private String phone;
    private String major;
    private String grade;
    private String bio;
    private Double gpa;
    private String avatar;
    private List<String> skills;
    private Resume resume;
    private String resumePdfName;
    private String resumePdfData;
    private LocalDateTime resumePdfUploadedAt;
    private Schedule schedule;

    public Student() {
        super();
        this.setRole("student");
        this.skills = new ArrayList<>();
        this.resume = new Resume();
        this.schedule = new Schedule();
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getMajor() {
        return major;
    }

    public void setMajor(String major) {
        this.major = major;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public Double getGpa() {
        return gpa;
    }

    public void setGpa(Double gpa) {
        this.gpa = gpa;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public Resume getResume() {
        return resume;
    }

    public void setResume(Resume resume) {
        this.resume = resume;
    }

    public String getResumePdfName() {
        return resumePdfName;
    }

    public void setResumePdfName(String resumePdfName) {
        this.resumePdfName = resumePdfName;
    }

    public String getResumePdfData() {
        return resumePdfData;
    }

    public void setResumePdfData(String resumePdfData) {
        this.resumePdfData = resumePdfData;
    }

    public LocalDateTime getResumePdfUploadedAt() {
        return resumePdfUploadedAt;
    }

    public void setResumePdfUploadedAt(LocalDateTime resumePdfUploadedAt) {
        this.resumePdfUploadedAt = resumePdfUploadedAt;
    }

    public Schedule getSchedule() {
        return schedule;
    }

    public void setSchedule(Schedule schedule) {
        this.schedule = schedule;
    }
}
