package com.bupt.ta.shared.infrastructure;

import com.bupt.ta.student.domain.Student;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 学生数据仓储
 */
public class StudentRepository {
    
    /**
     * 查找所有学生
     */
    public List<Student> findAll() throws IOException {
        return DataStore.loadStudents();
    }
    
    /**
     * 根据ID查找学生
     */
    public Optional<Student> findById(String id) throws IOException {
        List<Student> students = DataStore.loadStudents();
        return students.stream()
                .filter(s -> s.getId().equals(id))
                .findFirst();
    }
    
    /**
     * 根据邮箱查找学生
     */
    public Optional<Student> findByEmail(String email) throws IOException {
        List<Student> students = DataStore.loadStudents();
        return students.stream()
                .filter(s -> s.getEmail().equals(email))
                .findFirst();
    }
    
    /**
     * 根据学号查找学生
     */
    public Optional<Student> findByStudentId(String studentId) throws IOException {
        List<Student> students = DataStore.loadStudents();
        return students.stream()
                .filter(s -> s.getStudentId().equals(studentId))
                .findFirst();
    }
    
    /**
     * 保存学生
     */
    public void save(Student student) throws IOException {
        List<Student> students = DataStore.loadStudents();
        
        // 如果已存在，则更新；否则添加
        boolean exists = false;
        for (int i = 0; i < students.size(); i++) {
            if (students.get(i).getId().equals(student.getId())) {
                students.set(i, student);
                exists = true;
                break;
            }
        }
        
        if (!exists) {
            students.add(student);
        }
        
        DataStore.saveStudents(students);
    }
    
    /**
     * 删除学生
     */
    public void delete(String id) throws IOException {
        List<Student> students = DataStore.loadStudents();
        students = students.stream()
                .filter(s -> !s.getId().equals(id))
                .collect(Collectors.toList());
        DataStore.saveStudents(students);
    }
    
    /**
     * 生成新的学生ID
     */
    public String generateId() throws IOException {
        List<Student> students = DataStore.loadStudents();
        int maxId = 0;
        for (Student s : students) {
            if (s.getId().startsWith("S")) {
                try {
                    int id = Integer.parseInt(s.getId().substring(1));
                    if (id > maxId) {
                        maxId = id;
                    }
                } catch (NumberFormatException e) {
                    // 忽略
                }
            }
        }
        return String.format("S%03d", maxId + 1);
    }
}
