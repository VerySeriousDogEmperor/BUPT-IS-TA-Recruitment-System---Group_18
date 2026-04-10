package com.bupt.ta.shared.infrastructure;

import com.bupt.ta.shared.domain.Job;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 职位数据仓储
 */
public class JobRepository {
    
    public List<Job> findAll() throws IOException {
        return DataStore.loadJobs();
    }
    
    public Optional<Job> findById(String id) throws IOException {
        List<Job> jobs = DataStore.loadJobs();
        return jobs.stream()
                .filter(j -> j.getId().equals(id))
                .findFirst();
    }
    
    public List<Job> findByStatus(String status) throws IOException {
        List<Job> jobs = DataStore.loadJobs();
        return jobs.stream()
                .filter(j -> j.getStatus().equals(status))
                .collect(Collectors.toList());
    }
    
    public List<Job> findByMoId(String moId) throws IOException {
        List<Job> jobs = DataStore.loadJobs();
        return jobs.stream()
                .filter(j -> j.getMoId().equals(moId))
                .collect(Collectors.toList());
    }
    
    public List<Job> findPublished() throws IOException {
        return findByStatus("published");
    }
    
    public void save(Job job) throws IOException {
        List<Job> jobs = DataStore.loadJobs();
        
        boolean exists = false;
        for (int i = 0; i < jobs.size(); i++) {
            if (jobs.get(i).getId().equals(job.getId())) {
                jobs.set(i, job);
                exists = true;
                break;
            }
        }
        
        if (!exists) {
            jobs.add(job);
        }
        
        DataStore.saveJobs(jobs);
    }
    
    public void delete(String id) throws IOException {
        List<Job> jobs = DataStore.loadJobs();
        jobs = jobs.stream()
                .filter(j -> !j.getId().equals(id))
                .collect(Collectors.toList());
        DataStore.saveJobs(jobs);
    }
    
    public String generateId() throws IOException {
        List<Job> jobs = DataStore.loadJobs();
        int maxId = 0;
        for (Job j : jobs) {
            if (j.getId().startsWith("JOB")) {
                try {
                    int id = Integer.parseInt(j.getId().substring(3));
                    if (id > maxId) {
                        maxId = id;
                    }
                } catch (NumberFormatException e) {
                    // 忽略
                }
            }
        }
        return String.format("JOB%03d", maxId + 1);
    }
}
