package com.bupt.ta.shared.domain;

import java.util.ArrayList;
import java.util.List;

/**
 * 简历
 */
public class Resume {
    private List<Education> education;
    private List<Experience> experience;
    private List<Award> awards;

    public Resume() {
        this.education = new ArrayList<>();
        this.experience = new ArrayList<>();
        this.awards = new ArrayList<>();
    }

    // 教育经历
    public static class Education {
        private String school;
        private String degree;
        private String major;
        private String startDate;
        private String endDate;
        private Double gpa;

        // Getters and Setters
        public String getSchool() { return school; }
        public void setSchool(String school) { this.school = school; }
        public String getDegree() { return degree; }
        public void setDegree(String degree) { this.degree = degree; }
        public String getMajor() { return major; }
        public void setMajor(String major) { this.major = major; }
        public String getStartDate() { return startDate; }
        public void setStartDate(String startDate) { this.startDate = startDate; }
        public String getEndDate() { return endDate; }
        public void setEndDate(String endDate) { this.endDate = endDate; }
        public Double getGpa() { return gpa; }
        public void setGpa(Double gpa) { this.gpa = gpa; }
    }

    // 工作经历
    public static class Experience {
        private String company;
        private String position;
        private String startDate;
        private String endDate;
        private String description;

        // Getters and Setters
        public String getCompany() { return company; }
        public void setCompany(String company) { this.company = company; }
        public String getPosition() { return position; }
        public void setPosition(String position) { this.position = position; }

        public String getStartDate() { return startDate; }
        public void setStartDate(String startDate) { this.startDate = startDate; }
        public String getEndDate() { return endDate; }
        public void setEndDate(String endDate) { this.endDate = endDate; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    // 获奖经历
    public static class Award {
        private String name;
        private String date;
        private String description;

        // Getters and Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    // Getters and Setters
    public List<Education> getEducation() {
        return education;
    }

    public void setEducation(List<Education> education) {
        this.education = education;
    }

    public List<Experience> getExperience() {
        return experience;
    }

    public void setExperience(List<Experience> experience) {
        this.experience = experience;
    }

    public List<Award> getAwards() {
        return awards;
    }

    public void setAwards(List<Award> awards) {
        this.awards = awards;
    }
}
