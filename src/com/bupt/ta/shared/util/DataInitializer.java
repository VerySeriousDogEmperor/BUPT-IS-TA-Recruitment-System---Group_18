package com.bupt.ta.shared.util;

import com.bupt.ta.shared.domain.*;
import com.bupt.ta.shared.infrastructure.*;
import com.bupt.ta.student.domain.Student;

import java.time.LocalDateTime;
import java.util.Arrays;

/**
 * 数据初始化工具
 * 用于生成测试数据
 */
public class DataInitializer {
    
    public static void main(String[] args) {
        try {
            System.out.println("开始初始化测试数据...");
            
            initStudents();
            initUsers();
            initModules();
            initJobs();
            initApplications();
            initTimesheets();
            
            System.out.println("测试数据初始化完成！");
        } catch (Exception e) {
            System.err.println("初始化失败: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * 初始化学生数据
     */
    private static void initStudents() throws Exception {
        StudentRepository repo = new StudentRepository();
        
        // 学生1: 张三
        Student s1 = new Student();
        s1.setId("S001");
        s1.setName("张三");
        s1.setEmail("zhangsan@bupt.edu.cn");
        s1.setPassword("123456");
        s1.setStudentId("2021211001");
        s1.setPhone("13800138001");
        s1.setMajor("计算机科学与技术");
        s1.setGrade("大三");
        s1.setGpa(3.8);
        s1.setSkills(Arrays.asList("Java", "Python", "C++", "算法"));
        
        // 简历
        Resume.Education edu1 = new Resume.Education();
        edu1.setSchool("北京邮电大学");
        edu1.setDegree("本科");
        edu1.setMajor("计算机科学与技术");
        edu1.setStartDate("2021-09");
        edu1.setEndDate("2025-06");
        edu1.setGpa(3.8);
        s1.getResume().getEducation().add(edu1);
        
        Resume.Award award1 = new Resume.Award();
        award1.setName("国家奖学金");
        award1.setDate("2023-12");
        award1.setDescription("学习成绩优异");
        s1.getResume().getAwards().add(award1);
        
        // 排课时间
        s1.getSchedule().setMonday(Arrays.asList("08:00-10:00", "14:00-16:00"));
        s1.getSchedule().setWednesday(Arrays.asList("10:00-12:00"));
        s1.getSchedule().setFriday(Arrays.asList("14:00-16:00"));
        
        repo.save(s1);
        
        // 学生2: 李四
        Student s2 = new Student();
        s2.setId("S002");
        s2.setName("李四");
        s2.setEmail("lisi@bupt.edu.cn");
        s2.setPassword("123456");
        s2.setStudentId("2021211002");
        s2.setPhone("13800138002");
        s2.setMajor("软件工程");
        s2.setGrade("大三");
        s2.setGpa(3.6);
        s2.setSkills(Arrays.asList("Java", "Spring", "MySQL", "前端"));

        
        Resume.Education edu2 = new Resume.Education();
        edu2.setSchool("北京邮电大学");
        edu2.setDegree("本科");
        edu2.setMajor("软件工程");
        edu2.setStartDate("2021-09");
        edu2.setEndDate("2025-06");
        edu2.setGpa(3.6);
        s2.getResume().getEducation().add(edu2);
        
        Resume.Experience exp2 = new Resume.Experience();
        exp2.setCompany("字节跳动");
        exp2.setPosition("前端实习生");
        exp2.setStartDate("2024-06");
        exp2.setEndDate("2024-09");
        exp2.setDescription("负责Web应用开发");
        s2.getResume().getExperience().add(exp2);
        
        s2.getSchedule().setTuesday(Arrays.asList("10:00-12:00", "14:00-16:00"));
        s2.getSchedule().setThursday(Arrays.asList("08:00-10:00"));
        
        repo.save(s2);
        
        // 学生3: 王五
        Student s3 = new Student();
        s3.setId("S003");
        s3.setName("王五");
        s3.setEmail("wangwu@bupt.edu.cn");
        s3.setPassword("123456");
        s3.setStudentId("2021211003");
        s3.setPhone("13800138003");
        s3.setMajor("数据科学与大数据技术");
        s3.setGrade("大二");
        s3.setGpa(3.9);
        s3.setSkills(Arrays.asList("Python", "机器学习", "数据分析", "统计学"));
        
        Resume.Education edu3 = new Resume.Education();
        edu3.setSchool("北京邮电大学");
        edu3.setDegree("本科");
        edu3.setMajor("数据科学与大数据技术");
        edu3.setStartDate("2022-09");
        edu3.setEndDate("2026-06");
        edu3.setGpa(3.9);
        s3.getResume().getEducation().add(edu3);
        
        s3.getSchedule().setMonday(Arrays.asList("10:00-12:00"));
        s3.getSchedule().setWednesday(Arrays.asList("14:00-16:00"));
        s3.getSchedule().setFriday(Arrays.asList("10:00-12:00"));
        
        repo.save(s3);
        
        System.out.println("✓ 学生数据初始化完成 (3个学生)");
    }
    
    /**
     * 初始化用户数据（MO、Admin）
     */
    private static void initUsers() throws Exception {
        UserRepository repo = new UserRepository();
        
        // MO1: 李老师
        User mo1 = new User();
        mo1.setId("MO001");
        mo1.setName("李老师");
        mo1.setEmail("mo1@bupt.edu.cn");
        mo1.setPassword("123456");
        mo1.setRole("mo");
        repo.save(mo1);
        
        // MO2: 王老师
        User mo2 = new User();
        mo2.setId("MO002");
        mo2.setName("王老师");
        mo2.setEmail("mo2@bupt.edu.cn");
        mo2.setPassword("123456");
        mo2.setRole("mo");
        repo.save(mo2);
        
        // Admin
        User admin = new User();
        admin.setId("ADMIN001");
        admin.setName("管理员");
        admin.setEmail("admin@bupt.edu.cn");
        admin.setPassword("123456");
        admin.setRole("admin");
        repo.save(admin);
        
        System.out.println("✓ 用户数据初始化完成 (2个MO, 1个Admin)");
    }
    
    /**
     * 初始化模块数据
     */
    private static void initModules() throws Exception {
        ModuleRepository repo = new ModuleRepository();
        
        CourseModule m1 = new CourseModule();
        m1.setId("MOD001");
        m1.setName("数据结构");
        m1.setCode("CS201");
        m1.setDepartment("计算机学院");
        m1.setSemester("2026春季");
        m1.setMoId("MO001");
        m1.setDescription("数据结构基础课程");
        repo.save(m1);
        
        CourseModule m2 = new CourseModule();
        m2.setId("MOD002");
        m2.setName("操作系统");
        m2.setCode("CS301");
        m2.setDepartment("计算机学院");
        m2.setSemester("2026春季");
        m2.setMoId("MO001");
        m2.setDescription("操作系统原理");
        repo.save(m2);
        
        CourseModule m3 = new CourseModule();
        m3.setId("MOD003");
        m3.setName("计算机网络");
        m3.setCode("CS302");
        m3.setDepartment("计算机学院");
        m3.setSemester("2026春季");
        m3.setMoId("MO002");
        m3.setDescription("计算机网络基础");
        repo.save(m3);
        
        System.out.println("✓ 模块数据初始化完成 (3个模块)");
    }

    
    /**
     * 初始化职位数据
     */
    private static void initJobs() throws Exception {
        JobRepository repo = new JobRepository();
        
        // 职位1: 数据结构课程助教 (已发布)
        Job j1 = new Job();
        j1.setId("JOB001");
        j1.setModuleId("MOD001");
        j1.setMoId("MO001");
        j1.setMoName("李老师");
        j1.setTitle("数据结构课程助教");
        j1.setDepartment("计算机学院");
        j1.setType("TA");
        j1.setDescription("协助教师完成数据结构课程的教学工作");
        j1.setResponsibilities(Arrays.asList("批改作业", "答疑辅导", "监考"));
        j1.setRequirements(Arrays.asList("熟悉数据结构", "有耐心", "责任心强"));
        j1.setRequiredSkills(Arrays.asList("C++", "算法", "数据结构"));
        j1.setHoursPerWeek(10);
        j1.setHourlyRate(50.0);
        j1.getSchedule().setMonday(Arrays.asList("14:00-16:00"));
        j1.getSchedule().setWednesday(Arrays.asList("14:00-16:00"));
        j1.setStartDate("2026-09-01");
        j1.setEndDate("2027-01-15");
        j1.setSlots(2);
        j1.setStatus("published");
        j1.setPublishedAt(LocalDateTime.now().minusDays(5));
        repo.save(j1);
        
        // 职位2: 操作系统课程助教 (已发布)
        Job j2 = new Job();
        j2.setId("JOB002");
        j2.setModuleId("MOD002");
        j2.setMoId("MO001");
        j2.setMoName("李老师");
        j2.setTitle("操作系统课程助教");
        j2.setDepartment("计算机学院");
        j2.setType("TA");
        j2.setDescription("协助教师完成操作系统课程的教学工作");
        j2.setResponsibilities(Arrays.asList("批改作业", "实验指导", "答疑"));
        j2.setRequirements(Arrays.asList("熟悉Linux", "了解操作系统原理"));
        j2.setRequiredSkills(Arrays.asList("C", "Linux", "操作系统"));
        j2.setHoursPerWeek(12);
        j2.setHourlyRate(55.0);
        j2.getSchedule().setTuesday(Arrays.asList("10:00-12:00"));
        j2.getSchedule().setThursday(Arrays.asList("10:00-12:00"));
        j2.setStartDate("2026-09-01");
        j2.setEndDate("2027-01-15");
        j2.setSlots(2);
        j2.setStatus("published");
        j2.setPublishedAt(LocalDateTime.now().minusDays(3));
        repo.save(j2);
        
        // 职位3: 计算机网络助教 (已发布)
        Job j3 = new Job();
        j3.setId("JOB003");
        j3.setModuleId("MOD003");
        j3.setMoId("MO002");
        j3.setMoName("王老师");
        j3.setTitle("计算机网络课程助教");
        j3.setDepartment("计算机学院");
        j3.setType("TA");
        j3.setDescription("协助教师完成计算机网络课程的教学工作");
        j3.setResponsibilities(Arrays.asList("批改作业", "实验指导"));
        j3.setRequirements(Arrays.asList("熟悉网络协议", "有实验经验"));
        j3.setRequiredSkills(Arrays.asList("网络协议", "Wireshark", "Socket编程"));
        j3.setHoursPerWeek(8);
        j3.setHourlyRate(50.0);
        j3.getSchedule().setWednesday(Arrays.asList("16:00-18:00"));
        j3.getSchedule().setFriday(Arrays.asList("16:00-18:00"));
        j3.setStartDate("2026-09-01");
        j3.setEndDate("2027-01-15");
        j3.setSlots(1);
        j3.setStatus("published");
        j3.setPublishedAt(LocalDateTime.now().minusDays(2));
        repo.save(j3);
        
        // 职位4: 数据库助教 (草稿)
        Job j4 = new Job();
        j4.setId("JOB004");
        j4.setModuleId("MOD001");
        j4.setMoId("MO001");
        j4.setMoName("李老师");
        j4.setTitle("数据库系统课程助教");
        j4.setDepartment("计算机学院");
        j4.setType("TA");
        j4.setDescription("协助教师完成数据库系统课程的教学工作");
        j4.setResponsibilities(Arrays.asList("批改作业", "实验指导"));
        j4.setRequirements(Arrays.asList("熟悉SQL", "了解数据库原理"));
        j4.setRequiredSkills(Arrays.asList("SQL", "MySQL", "数据库设计"));
        j4.setHoursPerWeek(10);
        j4.setHourlyRate(50.0);
        j4.getSchedule().setMonday(Arrays.asList("10:00-12:00"));
        j4.getSchedule().setThursday(Arrays.asList("14:00-16:00"));
        j4.setStartDate("2026-09-01");
        j4.setEndDate("2027-01-15");
        j4.setSlots(2);
        j4.setStatus("draft");
        repo.save(j4);
        
        // 职位5: 算法分析助教 (已发布)
        Job j5 = new Job();
        j5.setId("JOB005");
        j5.setModuleId("MOD002");
        j5.setMoId("MO002");
        j5.setMoName("王老师");
        j5.setTitle("算法分析与设计助教");
        j5.setDepartment("计算机学院");
        j5.setType("TA");
        j5.setDescription("协助教师完成算法分析课程的教学工作");
        j5.setResponsibilities(Arrays.asList("批改作业", "答疑辅导", "习题讲解"));
        j5.setRequirements(Arrays.asList("算法基础扎实", "ACM经验优先"));
        j5.setRequiredSkills(Arrays.asList("算法", "C++", "数据结构"));
        j5.setHoursPerWeek(10);
        j5.setHourlyRate(60.0);
        j5.getSchedule().setTuesday(Arrays.asList("14:00-16:00"));
        j5.getSchedule().setFriday(Arrays.asList("10:00-12:00"));
        j5.setStartDate("2026-09-01");
        j5.setEndDate("2027-01-15");
        j5.setSlots(1);
        j5.setStatus("published");
        j5.setPublishedAt(LocalDateTime.now().minusDays(1));
        repo.save(j5);
        
        System.out.println("✓ 职位数据初始化完成 (5个职位: 4个已发布, 1个草稿)");
    }

    
    /**
     * 初始化申请数据
     */
    private static void initApplications() throws Exception {
        ApplicationRepository repo = new ApplicationRepository();
        
        // 张三申请数据结构助教 (待审核)
        Application a1 = new Application();
        a1.setId("APP001");
        a1.setStudentId("S001");
        a1.setJobId("JOB001");
        a1.setStatus("pending");
        a1.setCoverLetter("我对数据结构课程非常感兴趣，曾获得ACM竞赛奖项，希望能够担任助教。");
        a1.setAppliedAt(LocalDateTime.now().minusDays(2));
        a1.setUpdatedAt(LocalDateTime.now().minusDays(2));
        repo.save(a1);
        
        // 张三申请算法分析助教 (已通过)
        Application a2 = new Application();
        a2.setId("APP002");
        a2.setStudentId("S001");
        a2.setJobId("JOB005");
        a2.setStatus("approved");
        a2.setCoverLetter("我有扎实的算法基础，希望能够帮助同学们学习算法。");
        a2.setAppliedAt(LocalDateTime.now().minusDays(3));
        a2.setUpdatedAt(LocalDateTime.now().minusDays(1));
        a2.setReviewNote("算法基础扎实，录用");
        Application.TimelineItem item2 = new Application.TimelineItem();
        item2.setStatus("approved");
        item2.setTime(LocalDateTime.now().minusDays(1));
        item2.setNote("申请已通过");
        a2.getTimeline().add(item2);
        repo.save(a2);
        
        // 李四申请操作系统助教 (待审核)
        Application a3 = new Application();
        a3.setId("APP003");
        a3.setStudentId("S002");
        a3.setJobId("JOB002");
        a3.setStatus("pending");
        a3.setCoverLetter("我熟悉Linux系统，有实验经验，希望能够担任助教。");
        a3.setAppliedAt(LocalDateTime.now().minusDays(1));
        a3.setUpdatedAt(LocalDateTime.now().minusDays(1));
        repo.save(a3);
        
        // 李四申请计算机网络助教 (已拒绝)
        Application a4 = new Application();
        a4.setId("APP004");
        a4.setStudentId("S002");
        a4.setJobId("JOB003");
        a4.setStatus("rejected");
        a4.setCoverLetter("我对网络协议有一定了解。");
        a4.setAppliedAt(LocalDateTime.now().minusDays(4));
        a4.setUpdatedAt(LocalDateTime.now().minusDays(2));
        a4.setReviewNote("网络基础不够扎实");
        Application.TimelineItem item4 = new Application.TimelineItem();
        item4.setStatus("rejected");
        item4.setTime(LocalDateTime.now().minusDays(2));
        item4.setNote("申请未通过");
        a4.getTimeline().add(item4);
        repo.save(a4);
        
        // 王五申请数据结构助教 (待审核)
        Application a5 = new Application();
        a5.setId("APP005");
        a5.setStudentId("S003");
        a5.setJobId("JOB001");
        a5.setStatus("pending");
        a5.setCoverLetter("我是数据科学专业学生，数据结构成绩优秀，希望能够担任助教。");
        a5.setAppliedAt(LocalDateTime.now().minusHours(12));
        a5.setUpdatedAt(LocalDateTime.now().minusHours(12));
        repo.save(a5);
        
        System.out.println("✓ 申请数据初始化完成 (5个申请: 3个待审核, 1个已通过, 1个已拒绝)");
    }
    
    /**
     * 初始化工时数据
     */
    private static void initTimesheets() throws Exception {
        TimesheetRepository repo = new TimesheetRepository();
        
        // 张三的工时记录 (算法分析助教)
        Timesheet t1 = new Timesheet();
        t1.setId("TS001");
        t1.setStudentId("S001");
        t1.setJobId("JOB005");
        t1.setDate("2026-04-01");
        t1.setHours(4.0);
        t1.setDescription("批改第一次作业");
        t1.setStatus("approved");
        t1.setSubmittedAt(LocalDateTime.now().minusDays(3));
        t1.setReviewedAt(LocalDateTime.now().minusDays(2));
        t1.setReviewNote("工时合理");
        repo.save(t1);
        
        Timesheet t2 = new Timesheet();
        t2.setId("TS002");
        t2.setStudentId("S001");
        t2.setJobId("JOB005");
        t2.setDate("2026-04-03");
        t2.setHours(3.0);
        t2.setDescription("答疑辅导");
        t2.setStatus("pending");
        t2.setSubmittedAt(LocalDateTime.now().minusDays(1));
        repo.save(t2);
        
        Timesheet t3 = new Timesheet();
        t3.setId("TS003");
        t3.setStudentId("S001");
        t3.setJobId("JOB005");
        t3.setDate("2026-04-05");
        t3.setHours(5.0);
        t3.setDescription("习题讲解");
        t3.setStatus("pending");
        t3.setSubmittedAt(LocalDateTime.now().minusHours(6));
        repo.save(t3);
        
        System.out.println("✓ 工时数据初始化完成 (3条工时记录: 1条已批准, 2条待审核)");
    }
}
