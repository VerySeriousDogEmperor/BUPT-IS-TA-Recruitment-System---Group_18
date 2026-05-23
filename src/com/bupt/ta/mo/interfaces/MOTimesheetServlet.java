package com.bupt.ta.mo.interfaces;

import com.bupt.ta.shared.domain.Application;
import com.bupt.ta.shared.domain.Job;
import com.bupt.ta.shared.domain.Timesheet;
import com.bupt.ta.shared.domain.User;
import com.bupt.ta.shared.infrastructure.ApplicationRepository;
import com.bupt.ta.shared.infrastructure.JobRepository;
import com.bupt.ta.shared.infrastructure.StudentRepository;
import com.bupt.ta.shared.infrastructure.TimesheetRepository;
import com.bupt.ta.shared.interfaces.BaseServlet;
import com.bupt.ta.shared.util.ResponseUtil;
import com.bupt.ta.shared.util.SessionUtil;
import com.bupt.ta.student.domain.Student;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * MO timesheet review endpoints.
 * GET /api/mo/timesheets - list timesheets under current MO jobs
 * GET /api/mo/timesheets/{id} - get timesheet detail
 * PUT /api/mo/timesheets/{id}/review - approve or reject a timesheet
 */
@WebServlet("/api/mo/timesheets/*")
public class MOTimesheetServlet extends BaseServlet {
    private final TimesheetRepository timesheetRepo = new TimesheetRepository();
    private final ApplicationRepository applicationRepo = new ApplicationRepository();
    private final JobRepository jobRepo = new JobRepository();
    private final StudentRepository studentRepo = new StudentRepository();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        User currentUser = SessionUtil.getCurrentMOUser(request);
        if (currentUser == null || !"mo".equals(currentUser.getRole())) {
            ResponseUtil.sendError(response, 401, "Unauthorized");
            return;
        }

        String pathInfo = request.getPathInfo();
        if (pathInfo == null || "/".equals(pathInfo)) {
            handleGetTimesheets(request, response, currentUser);
            return;
        }

        String timesheetId = pathInfo.substring(1);
        handleGetTimesheetDetail(response, timesheetId, currentUser);
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws IOException {
        User currentUser = SessionUtil.getCurrentMOUser(request);
        if (currentUser == null || !"mo".equals(currentUser.getRole())) {
            ResponseUtil.sendError(response, 401, "Unauthorized");
            return;
        }

        String pathInfo = request.getPathInfo();
        if (pathInfo == null || !pathInfo.contains("/review")) {
            ResponseUtil.sendError(response, 400, "Invalid request path");
            return;
        }

        String timesheetId = pathInfo.substring(1, pathInfo.indexOf("/review"));
        handleReviewTimesheet(request, response, timesheetId, currentUser);
    }

    private void handleGetTimesheets(HttpServletRequest request, HttpServletResponse response, User currentUser)
            throws IOException {
        try {
            String status = request.getParameter("status");
            String jobId = request.getParameter("jobId");

            List<Timesheet> timesheets = timesheetRepo.findAll();

            List<Job> myJobs = jobRepo.findAll().stream()
                    .filter(job -> currentUser.getId().equals(job.getCreatedBy()))
                    .collect(Collectors.toList());

            Set<String> myJobIds = myJobs.stream()
                    .map(Job::getId)
                    .collect(Collectors.toSet());

            List<Application> applications = applicationRepo.findAll().stream()
                    .filter(app -> myJobIds.contains(app.getJobId()))
                    .collect(Collectors.toList());

            Set<String> applicationIds = applications.stream()
                    .map(Application::getId)
                    .collect(Collectors.toSet());

            timesheets = timesheets.stream()
                    .filter(ts -> applicationIds.contains(ts.getApplicationId()))
                    .collect(Collectors.toList());

            if (status != null && !status.isEmpty()) {
                timesheets = timesheets.stream()
                        .filter(ts -> status.equals(ts.getStatus()))
                        .collect(Collectors.toList());
            }

            if (jobId != null && !jobId.isEmpty()) {
                Set<String> jobApplicationIds = applications.stream()
                        .filter(app -> jobId.equals(app.getJobId()))
                        .map(Application::getId)
                        .collect(Collectors.toSet());

                timesheets = timesheets.stream()
                        .filter(ts -> jobApplicationIds.contains(ts.getApplicationId()))
                        .collect(Collectors.toList());
            }

            List<Map<String, Object>> result = new ArrayList<>();
            for (Timesheet ts : timesheets) {
                Map<String, Object> item = new HashMap<>();
                item.put("timesheet", ts);

                try {
                    Optional<Application> appOpt = applicationRepo.findById(ts.getApplicationId());
                    if (appOpt.isPresent()) {
                        Application app = appOpt.get();

                        Optional<Student> studentOpt = studentRepo.findById(app.getStudentId());
                        if (studentOpt.isPresent()) {
                            Student student = studentOpt.get();
                            Map<String, Object> studentInfo = new HashMap<>();
                            studentInfo.put("id", student.getId());
                            studentInfo.put("name", student.getName());
                            studentInfo.put("studentId", student.getStudentId());
                            item.put("student", studentInfo);
                        }

                        Optional<Job> jobOpt = jobRepo.findById(app.getJobId());
                        if (jobOpt.isPresent()) {
                            Job job = jobOpt.get();
                            Map<String, Object> jobInfo = new HashMap<>();
                            jobInfo.put("id", job.getId());
                            jobInfo.put("title", job.getTitle());
                            jobInfo.put("moduleCode", job.getModuleCode());
                            item.put("job", jobInfo);
                        }
                    }
                } catch (Exception ignored) {
                    // Skip enrichment failures and keep the base timesheet record.
                }

                result.add(item);
            }

            ResponseUtil.sendSuccess(response, "Success", result);
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "Server error: " + e.getMessage());
        }
    }

    private void handleGetTimesheetDetail(HttpServletResponse response, String timesheetId, User currentUser)
            throws IOException {
        try {
            Optional<Timesheet> tsOpt = timesheetRepo.findById(timesheetId);
            if (!tsOpt.isPresent()) {
                ResponseUtil.sendError(response, 404, "Timesheet not found");
                return;
            }

            Timesheet ts = tsOpt.get();
            Optional<Application> appOpt = applicationRepo.findById(ts.getApplicationId());
            if (!appOpt.isPresent()) {
                ResponseUtil.sendError(response, 404, "Application not found");
                return;
            }

            Application app = appOpt.get();
            Optional<Job> jobOpt = jobRepo.findById(app.getJobId());
            if (!jobOpt.isPresent() || !currentUser.getId().equals(jobOpt.get().getCreatedBy())) {
                ResponseUtil.sendError(response, 403, "Forbidden");
                return;
            }

            Map<String, Object> result = new HashMap<>();
            result.put("timesheet", ts);
            result.put("application", app);
            result.put("job", jobOpt.get());

            Optional<Student> studentOpt = studentRepo.findById(app.getStudentId());
            studentOpt.ifPresent(student -> result.put("student", student));

            ResponseUtil.sendSuccess(response, "Success", result);
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "Server error: " + e.getMessage());
        }
    }

    private void handleReviewTimesheet(HttpServletRequest request, HttpServletResponse response, String timesheetId,
            User currentUser) throws IOException {
        try {
            Optional<Timesheet> tsOpt = timesheetRepo.findById(timesheetId);
            if (!tsOpt.isPresent()) {
                ResponseUtil.sendError(response, 404, "Timesheet not found");
                return;
            }

            Timesheet ts = tsOpt.get();

            Optional<Application> appOpt = applicationRepo.findById(ts.getApplicationId());
            if (!appOpt.isPresent()) {
                ResponseUtil.sendError(response, 404, "Application not found");
                return;
            }

            Application app = appOpt.get();
            Optional<Job> jobOpt = jobRepo.findById(app.getJobId());
            if (!jobOpt.isPresent() || !currentUser.getId().equals(jobOpt.get().getCreatedBy())) {
                ResponseUtil.sendError(response, 403, "Forbidden");
                return;
            }

            Map<String, Object> requestData = readRequestBody(request, Map.class);
            String action = (String) requestData.get("action");
            String comment = (String) requestData.get("comment");
            Double approvedHours = requestData.get("approvedHours") != null
                    ? ((Number) requestData.get("approvedHours")).doubleValue()
                    : null;

            if (action == null || (!"approve".equals(action) && !"reject".equals(action))) {
                ResponseUtil.sendError(response, 400, "Invalid action");
                return;
            }

            if (!"pending".equals(ts.getStatus())) {
                ResponseUtil.sendError(response, 400, "Only pending timesheets can be reviewed");
                return;
            }

            double loggedHours = ts.getHoursWorked() != null
                    ? ts.getHoursWorked()
                    : (ts.getHours() != null ? ts.getHours() : 0.0);

            if ("approve".equals(action) && approvedHours != null) {
                if (approvedHours < 0) {
                    ResponseUtil.sendError(response, 400, "Approved hours cannot be negative");
                    return;
                }
                if (approvedHours > loggedHours) {
                    ResponseUtil.sendError(response, 400, "Approved hours cannot exceed logged hours");
                    return;
                }
            }

            if ("approve".equals(action)) {
                ts.setStatus("approved");
                ts.setApprovedHours(approvedHours != null ? approvedHours : loggedHours);
            } else {
                ts.setStatus("rejected");
                ts.setApprovedHours(0.0);
            }

            ts.setReviewedBy(currentUser.getId());
            ts.setReviewedAt(LocalDateTime.now());
            ts.setReviewComment(comment);
            ts.setUpdatedAt(LocalDateTime.now());

            timesheetRepo.save(ts);
            ResponseUtil.sendSuccess(response, "Review completed", ts);
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "Server error: " + e.getMessage());
        }
    }
}
