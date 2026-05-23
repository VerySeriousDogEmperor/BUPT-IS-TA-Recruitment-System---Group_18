package com.bupt.ta.shared.infrastructure;

import com.bupt.ta.shared.domain.*;
import com.bupt.ta.shared.util.JsonFileUtil;
import com.bupt.ta.student.domain.Student;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.lang.reflect.Type;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * 统一数据存储管理器
 * 使用 JSON 文件存储所有数据
 */
public class DataStore {
    private static final String DATA_DIR = "resources/data/";
    
    // 文件路径
    private static final String STUDENTS_FILE = DATA_DIR + "students.json";
    private static final String USERS_FILE = DATA_DIR + "users.json";
    private static final String JOBS_FILE = DATA_DIR + "jobs.json";
    private static final String APPLICATIONS_FILE = DATA_DIR + "applications.json";
    private static final String TIMESHEETS_FILE = DATA_DIR + "timesheets.json";
    private static final String MODULES_FILE = DATA_DIR + "modules.json";
    private static final String SETTINGS_FILE = DATA_DIR + "settings.json";
    private static final String ANNOUNCEMENTS_FILE = DATA_DIR + "announcements.json";
    private static final String AUDIT_LOGS_FILE = DATA_DIR + "audit_logs.json";
    private static final String NOTIFICATION_READS_FILE = DATA_DIR + "notification_reads.json";
    
    // 读写锁，保证线程安全
    private static final ReadWriteLock studentsLock = new ReentrantReadWriteLock();
    private static final ReadWriteLock usersLock = new ReentrantReadWriteLock();
    private static final ReadWriteLock jobsLock = new ReentrantReadWriteLock();
    private static final ReadWriteLock applicationsLock = new ReentrantReadWriteLock();
    private static final ReadWriteLock timesheetsLock = new ReentrantReadWriteLock();
    private static final ReadWriteLock modulesLock = new ReentrantReadWriteLock();
    private static final ReadWriteLock settingsLock = new ReentrantReadWriteLock();
    private static final ReadWriteLock announcementsLock = new ReentrantReadWriteLock();
    private static final ReadWriteLock auditLogsLock = new ReentrantReadWriteLock();
    private static final ReadWriteLock notificationReadsLock = new ReentrantReadWriteLock();
    
    // 学生数据操作
    public static List<Student> loadStudents() throws IOException {
        studentsLock.readLock().lock();
        try {
            Type type = new TypeToken<List<Student>>(){}.getType();
            List<Student> students = JsonFileUtil.readJson(STUDENTS_FILE, type);
            return students != null ? students : new ArrayList<>();
        } finally {
            studentsLock.readLock().unlock();
        }
    }
    
    public static void saveStudents(List<Student> students) throws IOException {
        studentsLock.writeLock().lock();
        try {
            JsonFileUtil.writeJson(STUDENTS_FILE, students);
        } finally {
            studentsLock.writeLock().unlock();
        }
    }
    
    // 用户数据操作（MO、Admin）
    public static List<User> loadUsers() throws IOException {
        usersLock.readLock().lock();
        try {
            Type type = new TypeToken<List<User>>(){}.getType();
            List<User> users = JsonFileUtil.readJson(USERS_FILE, type);
            return users != null ? users : new ArrayList<>();
        } finally {
            usersLock.readLock().unlock();
        }
    }

    
    public static void saveUsers(List<User> users) throws IOException {
        usersLock.writeLock().lock();
        try {
            JsonFileUtil.writeJson(USERS_FILE, users);
        } finally {
            usersLock.writeLock().unlock();
        }
    }
    
    // 职位数据操作
    public static List<Job> loadJobs() throws IOException {
        jobsLock.readLock().lock();
        try {
            Type type = new TypeToken<List<Job>>(){}.getType();
            List<Job> jobs = JsonFileUtil.readJson(JOBS_FILE, type);
            return jobs != null ? jobs : new ArrayList<>();
        } finally {
            jobsLock.readLock().unlock();
        }
    }
    
    public static void saveJobs(List<Job> jobs) throws IOException {
        jobsLock.writeLock().lock();
        try {
            JsonFileUtil.writeJson(JOBS_FILE, jobs);
        } finally {
            jobsLock.writeLock().unlock();
        }
    }
    
    // 申请数据操作
    public static List<Application> loadApplications() throws IOException {
        applicationsLock.readLock().lock();
        try {
            Type type = new TypeToken<List<Application>>(){}.getType();
            List<Application> applications = JsonFileUtil.readJson(APPLICATIONS_FILE, type);
            return applications != null ? applications : new ArrayList<>();
        } finally {
            applicationsLock.readLock().unlock();
        }
    }
    
    public static void saveApplications(List<Application> applications) throws IOException {
        applicationsLock.writeLock().lock();
        try {
            JsonFileUtil.writeJson(APPLICATIONS_FILE, applications);
        } finally {
            applicationsLock.writeLock().unlock();
        }
    }
    
    // 工时数据操作
    public static List<Timesheet> loadTimesheets() throws IOException {
        timesheetsLock.readLock().lock();
        try {
            Type type = new TypeToken<List<Timesheet>>(){}.getType();
            List<Timesheet> timesheets = JsonFileUtil.readJson(TIMESHEETS_FILE, type);
            return timesheets != null ? timesheets : new ArrayList<>();
        } finally {
            timesheetsLock.readLock().unlock();
        }
    }
    
    public static void saveTimesheets(List<Timesheet> timesheets) throws IOException {
        timesheetsLock.writeLock().lock();
        try {
            JsonFileUtil.writeJson(TIMESHEETS_FILE, timesheets);
        } finally {
            timesheetsLock.writeLock().unlock();
        }
    }
    
    // 模块数据操作
    public static List<CourseModule> loadModules() throws IOException {
        modulesLock.readLock().lock();
        try {
            Type type = new TypeToken<List<CourseModule>>(){}.getType();
            List<CourseModule> modules = JsonFileUtil.readJson(MODULES_FILE, type);
            return modules != null ? modules : new ArrayList<>();
        } finally {
            modulesLock.readLock().unlock();
        }
    }
    
    public static void saveModules(List<CourseModule> modules) throws IOException {
        modulesLock.writeLock().lock();
        try {
            JsonFileUtil.writeJson(MODULES_FILE, modules);
        } finally {
            modulesLock.writeLock().unlock();
        }
    }

    public static SystemSettings loadSettings() throws IOException {
        settingsLock.readLock().lock();
        try {
            SystemSettings settings = JsonFileUtil.readJson(SETTINGS_FILE, SystemSettings.class);
            return settings != null ? settings : defaultSettings();
        } finally {
            settingsLock.readLock().unlock();
        }
    }

    public static void saveSettings(SystemSettings settings) throws IOException {
        settingsLock.writeLock().lock();
        try {
            JsonFileUtil.writeJson(SETTINGS_FILE, settings);
        } finally {
            settingsLock.writeLock().unlock();
        }
    }

    public static List<Announcement> loadAnnouncements() throws IOException {
        announcementsLock.readLock().lock();
        try {
            Type type = new TypeToken<List<Announcement>>(){}.getType();
            List<Announcement> announcements = JsonFileUtil.readJson(ANNOUNCEMENTS_FILE, type);
            return announcements != null ? announcements : defaultAnnouncements();
        } finally {
            announcementsLock.readLock().unlock();
        }
    }

    public static void saveAnnouncements(List<Announcement> announcements) throws IOException {
        announcementsLock.writeLock().lock();
        try {
            JsonFileUtil.writeJson(ANNOUNCEMENTS_FILE, announcements);
        } finally {
            announcementsLock.writeLock().unlock();
        }
    }

    public static List<AuditLog> loadAuditLogs() throws IOException {
        auditLogsLock.readLock().lock();
        try {
            Type type = new TypeToken<List<AuditLog>>(){}.getType();
            List<AuditLog> logs = JsonFileUtil.readJson(AUDIT_LOGS_FILE, type);
            return logs != null ? logs : new ArrayList<>();
        } finally {
            auditLogsLock.readLock().unlock();
        }
    }

    public static void saveAuditLogs(List<AuditLog> logs) throws IOException {
        auditLogsLock.writeLock().lock();
        try {
            JsonFileUtil.writeJson(AUDIT_LOGS_FILE, logs);
        } finally {
            auditLogsLock.writeLock().unlock();
        }
    }

    public static List<NotificationReadState> loadNotificationReadStates() throws IOException {
        notificationReadsLock.readLock().lock();
        try {
            Type type = new TypeToken<List<NotificationReadState>>(){}.getType();
            List<NotificationReadState> states = JsonFileUtil.readJson(NOTIFICATION_READS_FILE, type);
            return states != null ? states : new ArrayList<>();
        } finally {
            notificationReadsLock.readLock().unlock();
        }
    }

    public static void saveNotificationReadStates(List<NotificationReadState> states) throws IOException {
        notificationReadsLock.writeLock().lock();
        try {
            JsonFileUtil.writeJson(NOTIFICATION_READS_FILE, states);
        } finally {
            notificationReadsLock.writeLock().unlock();
        }
    }

    public static Map<String, Object> archiveCurrentData(String semester, String archivedBy) throws IOException {
        String safeSemester = (semester == null || semester.isBlank() ? "semester" : semester)
                .replaceAll("[^A-Za-z0-9._-]+", "-")
                .replaceAll("^-|-$", "");
        String stamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
        Path archiveDir = Path.of(DATA_DIR, "archives", safeSemester + "-" + stamp);
        Files.createDirectories(archiveDir);

        List<String> copied = new ArrayList<>();
        for (String file : List.of(
                STUDENTS_FILE,
                USERS_FILE,
                JOBS_FILE,
                APPLICATIONS_FILE,
                TIMESHEETS_FILE,
                MODULES_FILE,
                SETTINGS_FILE,
                ANNOUNCEMENTS_FILE,
                AUDIT_LOGS_FILE,
                NOTIFICATION_READS_FILE)) {
            Path source = Path.of(file);
            if (Files.exists(source)) {
                Files.copy(source, archiveDir.resolve(source.getFileName()), StandardCopyOption.REPLACE_EXISTING);
                copied.add(source.getFileName().toString());
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", safeSemester + "-" + stamp);
        result.put("semester", semester);
        result.put("path", archiveDir.toString());
        result.put("archivedAt", LocalDateTime.now());
        result.put("archivedBy", archivedBy);
        result.put("files", copied);
        return result;
    }

    private static SystemSettings defaultSettings() {
        SystemSettings settings = new SystemSettings();
        settings.getRates().put("general", 40);
        settings.getRates().put("senior", 65);
        settings.getRates().put("lab", 55);
        settings.getPublicFiles().add(document("pub-1", "TA_Handbook_2026.pdf", "2.4 MB", "public",
                "This handbook outlines the responsibilities, expectations, and guidelines for Teaching Assistants."));
        settings.getPublicFiles().add(document("pub-2", "Grading_Policy_v3.pdf", "1.1 MB", "public",
                "Grading rubrics, feedback expectations, and appeal timelines for coursework support."));
        settings.getInternalFiles().add(document("int-1", "Admin_Approval_SOP.pdf", "1.7 MB", "internal",
                "Standard operating procedure for Admin approval of module and recruitment changes."));
        settings.getInternalFiles().add(document("int-2", "Budget_Allocation_Rules.pdf", "0.9 MB", "internal",
                "Rules for TA budget allocation, additional hour requests, and budget overrun reporting."));
        return settings;
    }

    private static KnowledgeDocument document(String id, String name, String size, String db, String preview) {
        KnowledgeDocument doc = new KnowledgeDocument();
        doc.setId(id);
        doc.setName(name);
        doc.setSize(size);
        doc.setDb(db);
        doc.setPreview(preview);
        doc.setStatus("vectorized");
        doc.setSyncedAt(java.time.LocalDateTime.now());
        return doc;
    }

    private static List<Announcement> defaultAnnouncements() {
        List<Announcement> announcements = new ArrayList<>();
        announcements.add(announcement("ANN001", "Spring 2026 TA Recruitment Now Open", "2026-03-18", "Important", true,
                "Applications for Spring 2026 Teaching Assistant positions are now open across the International School."));
        announcements.add(announcement("ANN002", "Interview Schedule Published", "2026-03-15", "Interview", true,
                "Selected candidates will receive interview invitations and time slots via the portal and email."));
        announcements.add(announcement("ANN003", "TA Training Workshop", "2026-04-05", "Training", false,
                "Newly selected TAs must attend the training workshop covering grading, communication, and workload policy."));
        return announcements;
    }

    private static Announcement announcement(String id, String title, String date, String category, boolean pinned, String content) {
        Announcement announcement = new Announcement();
        announcement.setId(id);
        announcement.setTitle(title);
        announcement.setDate(date);
        announcement.setCategory(category);
        announcement.setPinned(pinned);
        announcement.setContent(content);
        return announcement;
    }
}
