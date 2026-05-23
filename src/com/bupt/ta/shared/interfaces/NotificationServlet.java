package com.bupt.ta.shared.interfaces;

import com.bupt.ta.shared.domain.*;
import com.bupt.ta.shared.infrastructure.*;
import com.bupt.ta.shared.util.ResponseUtil;
import com.bupt.ta.shared.util.SessionUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

public class NotificationServlet extends BaseServlet {
    private final AnnouncementRepository announcementRepo = new AnnouncementRepository();
    private final ApplicationRepository applicationRepo = new ApplicationRepository();
    private final JobRepository jobRepo = new JobRepository();
    private final TimesheetRepository timesheetRepo = new TimesheetRepository();
    private final UserRepository userRepo = new UserRepository();
    private final AuditLogRepository auditLogRepo = new AuditLogRepository();
    private final NotificationReadRepository readRepo = new NotificationReadRepository();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!requireLogin(request, response)) return;

        String role = SessionUtil.getCurrentUserRole(request);
        String userId = getCurrentUserId(request);
        List<Map<String, Object>> items = new ArrayList<>();

        addAnnouncementItems(items);
        if ("student".equals(role)) {
            addStudentItems(items, userId);
        } else if ("mo".equals(role)) {
            addMoItems(items, userId);
        } else if ("admin".equals(role)) {
            addAdminItems(items);
        }

        items.sort(Comparator.comparing(item -> String.valueOf(item.get("time")), Comparator.reverseOrder()));
        Set<String> readIds = readRepo.findReadIds(userId);
        items.forEach(item -> item.put("read", readIds.contains(String.valueOf(item.get("id")))));
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("unreadCount", items.stream().filter(item -> !Boolean.TRUE.equals(item.get("read"))).count());
        payload.put("items", items.stream().limit(8).collect(Collectors.toList()));
        ResponseUtil.sendSuccess(response, payload);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!requireLogin(request, response)) return;
        if (!requireCsrf(request, response)) return;

        String path = request.getPathInfo();
        if (path == null || !path.equals("/read")) {
            ResponseUtil.sendError(response, 404, "Notification endpoint not found");
            return;
        }

        ReadRequest body = readRequestBody(request, ReadRequest.class);
        Set<String> readIds = readRepo.markRead(getCurrentUserId(request), body == null ? List.of() : body.ids);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("readIds", readIds);
        result.put("count", readIds.size());
        ResponseUtil.sendSuccess(response, result);
    }

    private void addAnnouncementItems(List<Map<String, Object>> items) throws IOException {
        announcementRepo.findAll().stream()
                .filter(item -> Boolean.TRUE.equals(item.getPinned()))
                .limit(2)
                .forEach(item -> items.add(notification(
                        "announcement-" + item.getId(),
                        "Announcement",
                        item.getTitle(),
                        item.getContent(),
                        "/announcements.html",
                        item.getDate(),
                        "info")));
    }

    private void addStudentItems(List<Map<String, Object>> items, String studentId) throws IOException {
        Map<String, Job> jobs = jobRepo.findAll().stream()
                .collect(Collectors.toMap(Job::getId, Function.identity(), (a, b) -> a));

        for (Application application : applicationRepo.findByStudentId(studentId)) {
            Job job = jobs.get(application.getJobId());
            String title = job == null ? "Application update" : job.getTitle();
            String status = readableStatus(application.getStatus());
            items.add(notification(
                    "application-" + application.getId(),
                    "Application",
                    title + " - " + status,
                    application.getReviewComment() == null ? "Your application status has been updated." : application.getReviewComment(),
                    "/student/dashboard.html",
                    time(application.getUpdatedAt(), application.getAppliedAt()),
                    severityForStatus(application.getStatus())));
        }

        for (Timesheet timesheet : timesheetRepo.findByStudentId(studentId)) {
            if (!"pending".equals(timesheet.getStatus())) {
                items.add(notification(
                        "timesheet-" + timesheet.getId(),
                        "Timesheet",
                        "Timesheet " + readableStatus(timesheet.getStatus()),
                        timesheet.getReviewComment() == null ? "Your submitted hours were reviewed." : timesheet.getReviewComment(),
                        "/student/dashboard.html",
                        time(timesheet.getReviewedAt(), timesheet.getSubmittedAt()),
                        severityForStatus(timesheet.getStatus())));
            }
        }
    }

    private void addMoItems(List<Map<String, Object>> items, String moId) throws IOException {
        List<Job> myJobs = jobRepo.findAll().stream()
                .filter(job -> moId.equals(job.getMoId()) || moId.equals(job.getCreatedBy()))
                .collect(Collectors.toList());
        Set<String> myJobIds = myJobs.stream().map(Job::getId).collect(Collectors.toSet());
        Map<String, Job> jobs = myJobs.stream().collect(Collectors.toMap(Job::getId, Function.identity(), (a, b) -> a));

        for (Job job : myJobs) {
            if ("pending".equals(job.getStatus())) {
                items.add(notification(
                        "job-review-" + job.getId(),
                        "Job Review",
                        job.getTitle() + " awaits Admin review",
                        "Submitted jobs stay hidden from students until Admin approval.",
                        "/mo/jobs.html",
                        time(job.getUpdatedAt(), job.getCreatedAt()),
                        "warning"));
            }
        }

        for (Application application : applicationRepo.findAll()) {
            if (myJobIds.contains(application.getJobId()) && "pending".equals(application.getStatus())) {
                Job job = jobs.get(application.getJobId());
                items.add(notification(
                        "mo-application-" + application.getId(),
                        "Applicant",
                        "New applicant for " + (job == null ? application.getJobId() : job.getTitle()),
                        "Review the candidate profile and record a decision.",
                        "/mo/applicants.html",
                        time(application.getAppliedAt(), application.getUpdatedAt()),
                        "info"));
            }
        }

        for (Timesheet timesheet : timesheetRepo.findAll()) {
            if (myJobIds.contains(timesheet.getJobId()) && ("pending".equals(timesheet.getStatus()) || Boolean.TRUE.equals(timesheet.getHasAnomaly()))) {
                items.add(notification(
                        "mo-timesheet-" + timesheet.getId(),
                        "Timesheet",
                        Boolean.TRUE.equals(timesheet.getHasAnomaly()) ? "Timesheet anomaly detected" : "Timesheet awaiting review",
                        timesheet.getAnomalyReason() == null ? "Review submitted work hours." : timesheet.getAnomalyReason(),
                        "/mo/timesheets.html",
                        time(timesheet.getUpdatedAt(), timesheet.getSubmittedAt()),
                        Boolean.TRUE.equals(timesheet.getHasAnomaly()) ? "danger" : "warning"));
            }
        }
    }

    private void addAdminItems(List<Map<String, Object>> items) throws IOException {
        for (Job job : jobRepo.findAll()) {
            if ("pending".equals(job.getStatus())) {
                items.add(notification(
                        "admin-job-" + job.getId(),
                        "Admin Review",
                        job.getTitle() + " needs approval",
                        "Approve or reject the submitted recruitment post.",
                        "/admin/recruitment.html",
                        time(job.getUpdatedAt(), job.getCreatedAt()),
                        "warning"));
            }
        }

        for (Timesheet timesheet : timesheetRepo.findAll()) {
            if (Boolean.TRUE.equals(timesheet.getHasAnomaly()) || hours(timesheet) > 8) {
                items.add(notification(
                        "admin-workload-" + timesheet.getId(),
                        "Workload",
                        "Workload exception detected",
                        timesheet.getAnomalyReason() == null ? "A timesheet exceeded configured workload guidance." : timesheet.getAnomalyReason(),
                        "/admin/workload.html",
                        time(timesheet.getUpdatedAt(), timesheet.getSubmittedAt()),
                        "danger"));
            }
        }

        long inactiveUsers = userRepo.findAll().stream().filter(user -> "inactive".equals(user.getStatus())).count();
        if (inactiveUsers > 0) {
            items.add(notification(
                    "admin-inactive-users",
                    "Users",
                    inactiveUsers + " inactive account(s)",
                    "Review user access before the next recruitment cycle.",
                    "/admin/users.html",
                    LocalDateTime.now().toString(),
                    "info"));
        }

        auditLogRepo.findAll().stream().limit(2).forEach(log -> items.add(notification(
                "audit-" + log.getId(),
                "Audit",
                log.getAction(),
                log.getDetail(),
                "/admin/settings.html",
                time(log.getCreatedAt(), null),
                "info")));
    }

    private Map<String, Object> notification(String id, String type, String title, String message, String href, String time, String severity) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", id);
        item.put("type", type);
        item.put("title", title == null ? "Notification" : title);
        item.put("message", message == null ? "" : message);
        item.put("href", href);
        item.put("time", time == null ? LocalDateTime.now().toString() : time);
        item.put("severity", severity);
        return item;
    }

    private String readableStatus(String status) {
        if (status == null) return "Updated";
        return status.substring(0, 1).toUpperCase() + status.substring(1);
    }

    private String severityForStatus(String status) {
        if ("rejected".equals(status)) return "danger";
        if ("approved".equals(status)) return "success";
        return "info";
    }

    private String time(LocalDateTime primary, LocalDateTime fallback) {
        if (primary != null) return primary.toString();
        return fallback == null ? LocalDateTime.now().toString() : fallback.toString();
    }

    private double hours(Timesheet timesheet) {
        if (timesheet.getApprovedHours() != null) return timesheet.getApprovedHours();
        if (timesheet.getHoursWorked() != null) return timesheet.getHoursWorked();
        return timesheet.getHours() == null ? 0 : timesheet.getHours();
    }

    private static class ReadRequest {
        List<String> ids;
    }
}
