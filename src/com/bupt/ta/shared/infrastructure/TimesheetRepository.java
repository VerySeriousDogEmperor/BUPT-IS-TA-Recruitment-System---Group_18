package com.bupt.ta.shared.infrastructure;

import com.bupt.ta.shared.domain.Timesheet;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 工时数据仓储
 */
public class TimesheetRepository {
    
    public List<Timesheet> findAll() throws IOException {
        return DataStore.loadTimesheets().stream()
                .map(this::normalize)
                .collect(Collectors.toList());
    }
    
    public Optional<Timesheet> findById(String id) throws IOException {
        List<Timesheet> timesheets = findAll();
        return timesheets.stream()
                .filter(t -> t.getId().equals(id))
                .findFirst();
    }
    
    public List<Timesheet> findByStudentId(String studentId) throws IOException {
        List<Timesheet> timesheets = findAll();
        return timesheets.stream()
                .filter(t -> t.getStudentId().equals(studentId))
                .collect(Collectors.toList());
    }
    
    public List<Timesheet> findByJobId(String jobId) throws IOException {
        List<Timesheet> timesheets = findAll();
        return timesheets.stream()
                .filter(t -> t.getJobId().equals(jobId))
                .collect(Collectors.toList());
    }
    
    public List<Timesheet> findByStatus(String status) throws IOException {
        List<Timesheet> timesheets = findAll();
        return timesheets.stream()
                .filter(t -> t.getStatus().equals(status))
                .collect(Collectors.toList());
    }
    
    public void save(Timesheet timesheet) throws IOException {
        normalize(timesheet);
        List<Timesheet> timesheets = DataStore.loadTimesheets();
        
        boolean exists = false;
        for (int i = 0; i < timesheets.size(); i++) {
            if (timesheets.get(i).getId().equals(timesheet.getId())) {
                timesheets.set(i, timesheet);
                exists = true;
                break;
            }
        }
        
        if (!exists) {
            timesheets.add(timesheet);
        }
        
        DataStore.saveTimesheets(timesheets);
    }
    
    public void delete(String id) throws IOException {
        List<Timesheet> timesheets = DataStore.loadTimesheets();
        timesheets = timesheets.stream()
                .filter(t -> !t.getId().equals(id))
                .collect(Collectors.toList());
        DataStore.saveTimesheets(timesheets);
    }
    
    public String generateId() throws IOException {
        List<Timesheet> timesheets = DataStore.loadTimesheets();
        int maxId = 0;
        for (Timesheet t : timesheets) {
            if (t.getId().startsWith("TS")) {
                try {
                    int id = Integer.parseInt(t.getId().substring(2));
                    if (id > maxId) {
                        maxId = id;
                    }
                } catch (NumberFormatException e) {
                    // 忽略
                }
            }
        }
        return String.format("TS%03d", maxId + 1);
    }

    private Timesheet normalize(Timesheet timesheet) {
        if (timesheet == null) {
            return null;
        }
        timesheet.normalizeCompatibleFields();
        return timesheet;
    }
}
