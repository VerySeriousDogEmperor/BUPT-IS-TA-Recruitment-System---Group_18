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
        return DataStore.loadJobs().stream()
                .map(this::normalize)
                .collect(Collectors.toList());
    }
    
    public Optional<Job> findById(String id) throws IOException {
        List<Job> jobs = findAll();
        return jobs.stream()
                .filter(j -> j.getId().equals(id))
                .findFirst();
    }
    
    public List<Job> findByStatus(String status) throws IOException {
        List<Job> jobs = findAll();
        return jobs.stream()
                .filter(j -> j.getStatus().equals(status))
                .collect(Collectors.toList());
    }
    
    public List<Job> findByMoId(String moId) throws IOException {
        List<Job> jobs = findAll();
        return jobs.stream()
                .filter(j -> moId != null && (moId.equals(j.getMoId()) || moId.equals(j.getCreatedBy())))
                .collect(Collectors.toList());
    }
    
    public List<Job> findPublished() throws IOException {
        return findByStatus("published");
    }
    
    public void save(Job job) throws IOException {
        normalize(job);
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

    private Job normalize(Job job) {
        if (job == null) {
            return null;
        }
        if (job.getSlots() == null && job.getPositions() != null) {
            job.setSlots(job.getPositions());
        }
        if (job.getPositions() == null && job.getSlots() != null) {
            job.setPositions(job.getSlots());
        }
        if ((job.getMoId() == null || job.getMoId().isBlank()) && job.getCreatedBy() != null) {
            job.setMoId(job.getCreatedBy());
        }
        if ((job.getCreatedBy() == null || job.getCreatedBy().isBlank()) && job.getMoId() != null) {
            job.setCreatedBy(job.getMoId());
        }
        return job;
    }
}
