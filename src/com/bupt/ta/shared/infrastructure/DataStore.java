package com.bupt.ta.shared.infrastructure;

import com.bupt.ta.shared.domain.*;
import com.bupt.ta.shared.util.JsonFileUtil;
import com.bupt.ta.student.domain.Student;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;
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
    
    // 读写锁，保证线程安全
    private static final ReadWriteLock studentsLock = new ReentrantReadWriteLock();
    private static final ReadWriteLock usersLock = new ReentrantReadWriteLock();
    private static final ReadWriteLock jobsLock = new ReentrantReadWriteLock();
    private static final ReadWriteLock applicationsLock = new ReentrantReadWriteLock();
    private static final ReadWriteLock timesheetsLock = new ReentrantReadWriteLock();
    private static final ReadWriteLock modulesLock = new ReentrantReadWriteLock();
    
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
}
