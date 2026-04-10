package com.bupt.ta.student.domain;

import com.bupt.ta.shared.domain.Resume;
import com.bupt.ta.shared.domain.Schedule;
import com.bupt.ta.shared.domain.User;

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
    private Double gpa;
    private String avatar; // 头像 URL 或 Base64
    private List<String> skills;
    private Resume resume;
    private Schedule schedule;

    public Student() {
        super();
        this.setRole("student");
        this.skills = new ArrayList<>();
        this.resume = new Resume();
        this.schedule = new Schedule();
    }

    // Getters and Setters
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

    public Schedule getSchedule() {
        return schedule;
    }

    public void setSchedule(Schedule schedule) {
        this.schedule = schedule;
    }
}
