package com.bupt.ta.shared.infrastructure;

import com.bupt.ta.shared.domain.Application;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 申请数据仓储
 */
public class ApplicationRepository {
    
    public List<Application> findAll() throws IOException {
        return DataStore.loadApplications().stream()
                .map(this::normalize)
                .collect(Collectors.toList());
    }
    
    public Optional<Application> findById(String id) throws IOException {
        List<Application> applications = findAll();
        return applications.stream()
                .filter(a -> a.getId().equals(id))
                .findFirst();
    }
    
    public List<Application> findByStudentId(String studentId) throws IOException {
        List<Application> applications = findAll();
        return applications.stream()
                .filter(a -> a.getStudentId().equals(studentId))
                .collect(Collectors.toList());
    }
    
    public List<Application> findByJobId(String jobId) throws IOException {
        List<Application> applications = findAll();
        return applications.stream()
                .filter(a -> a.getJobId().equals(jobId))
                .collect(Collectors.toList());
    }
    
    public Optional<Application> findByStudentAndJob(String studentId, String jobId) throws IOException {
        List<Application> applications = findAll();
        return applications.stream()
                .filter(a -> a.getStudentId().equals(studentId) && a.getJobId().equals(jobId))
                .findFirst();
    }
    
    public List<Application> findByStatus(String status) throws IOException {
        List<Application> applications = findAll();
        return applications.stream()
                .filter(a -> a.getStatus().equals(status))
                .collect(Collectors.toList());
    }
    
    public void save(Application application) throws IOException {
        normalize(application);
        List<Application> applications = DataStore.loadApplications();
        
        boolean exists = false;
        for (int i = 0; i < applications.size(); i++) {
            if (applications.get(i).getId().equals(application.getId())) {
                applications.set(i, application);
                exists = true;
                break;
            }
        }
        
        if (!exists) {
            applications.add(application);
        }
        
        DataStore.saveApplications(applications);
    }
    
    public void delete(String id) throws IOException {
        List<Application> applications = DataStore.loadApplications();
        applications = applications.stream()
                .filter(a -> !a.getId().equals(id))
                .collect(Collectors.toList());
        DataStore.saveApplications(applications);
    }
    
    public String generateId() throws IOException {
        List<Application> applications = DataStore.loadApplications();
        int maxId = 0;
        for (Application a : applications) {
            if (a.getId().startsWith("APP")) {
                try {
                    int id = Integer.parseInt(a.getId().substring(3));
                    if (id > maxId) {
                        maxId = id;
                    }
                } catch (NumberFormatException e) {
                    // 忽略
                }
            }
        }
        return String.format("APP%03d", maxId + 1);
    }

    private Application normalize(Application application) {
        if (application == null) {
            return null;
        }
        application.normalizeReviewFields();
        return application;
    }
}
