package com.bupt.ta.admin.interfaces;

import com.bupt.ta.shared.domain.Announcement;
import com.bupt.ta.shared.domain.Application;
import com.bupt.ta.shared.domain.ArchiveRecord;
import com.bupt.ta.shared.domain.AuditLog;
import com.bupt.ta.shared.domain.Job;
import com.bupt.ta.shared.domain.KnowledgeDocument;
import com.bupt.ta.shared.domain.SystemSettings;
import com.bupt.ta.shared.domain.Timesheet;
import com.bupt.ta.shared.domain.User;
import com.bupt.ta.shared.infrastructure.AnnouncementRepository;
import com.bupt.ta.shared.infrastructure.ApplicationRepository;
import com.bupt.ta.shared.infrastructure.AuditLogRepository;
import com.bupt.ta.shared.infrastructure.DataStore;
import com.bupt.ta.shared.infrastructure.JobRepository;
import com.bupt.ta.shared.infrastructure.StudentRepository;
import com.bupt.ta.shared.infrastructure.SettingsRepository;
import com.bupt.ta.shared.infrastructure.TimesheetRepository;
import com.bupt.ta.shared.infrastructure.UserRepository;
import com.bupt.ta.shared.interfaces.BaseServlet;
import com.bupt.ta.shared.util.ResponseUtil;
import com.bupt.ta.shared.util.SessionUtil;
import com.bupt.ta.shared.util.PasswordUtil;
import com.bupt.ta.student.domain.Student;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@WebServlet("/api/admin/*")
public class AdminServlet extends BaseServlet {
    private final JobRepository jobRepo = new JobRepository();
    private final ApplicationRepository applicationRepo = new ApplicationRepository();
    private final UserRepository userRepo = new UserRepository();
    private final StudentRepository studentRepo = new StudentRepository();
    private final TimesheetRepository timesheetRepo = new TimesheetRepository();
    private final SettingsRepository settingsRepo = new SettingsRepository();
    private final AnnouncementRepository announcementRepo = new AnnouncementRepository();
    private final AuditLogRepository auditLogRepo = new AuditLogRepository();
    private static final String ARCHIVE_CONFIRMATION = "ARCHIVE";

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!isAdmin(request, response)) return;

        String route = getRoute(request);
        try {
            switch (route) {
                case "dashboard":
                    ResponseUtil.sendSuccess(response, dashboard());
                    break;
                case "report":
                    ResponseUtil.sendSuccess(response, report(request));
                    break;
                case "jobs":
                case "recruitment":
                    ResponseUtil.sendSuccess(response, recruitment(request.getParameter("status")));
                    break;
                case "applications":
                    ResponseUtil.sendSuccess(response, applications(request));
                    break;
                case "users":
                    ResponseUtil.sendSuccess(response, users());
                    break;
                case "workload":
                    ResponseUtil.sendSuccess(response, workload());
                    break;
                case "settings":
                    ResponseUtil.sendSuccess(response, settings());
                    break;
                case "announcements":
                    ResponseUtil.sendSuccess(response, announcementRepo.findAll());
                    break;
                case "audit-logs":
                    ResponseUtil.sendSuccess(response, auditLogs(request));
                    break;
                default:
                    ResponseUtil.sendError(response, 404, "Admin endpoint not found");
            }
        } catch (AdminRequestException e) {
            ResponseUtil.sendError(response, e.statusCode, e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "Server error: " + e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!isAdmin(request, response)) return;
        if (!requireCsrf(request, response)) return;

        String path = request.getPathInfo();
        try {
            if (path != null && path.matches("/jobs/[^/]+/review")) {
                String jobId = path.split("/")[2];
                ReviewRequest body = readRequestBody(request, ReviewRequest.class);
                ResponseUtil.sendSuccess(response, reviewJob(request, jobId, body));
                return;
            }
            if (path != null && path.matches("/users/[^/]+/status")) {
                String userId = path.split("/")[2];
                StatusRequest body = readRequestBody(request, StatusRequest.class);
                ResponseUtil.sendSuccess(response, updateUserStatus(request, userId, body == null ? null : body.status));
                return;
            }
            if (path != null && path.equals("/settings")) {
                SettingsRequest body = readRequestBody(request, SettingsRequest.class);
                ResponseUtil.sendSuccess(response, updateSettings(request, body));
                return;
            }
            if (path != null && path.matches("/announcements/[^/]+")) {
                String id = path.split("/")[2];
                Announcement body = readRequestBody(request, Announcement.class);
                ResponseUtil.sendSuccess(response, saveAnnouncement(request, id, body));
                return;
            }
            if (path != null && path.matches("/workload/exceptions/[^/]+")) {
                String timesheetId = path.split("/")[3];
                WorkloadReviewRequest body = readRequestBody(request, WorkloadReviewRequest.class);
                ResponseUtil.sendSuccess(response, reviewWorkloadException(request, timesheetId, body));
                return;
            }
            ResponseUtil.sendError(response, 404, "Admin endpoint not found");
        } catch (AdminRequestException e) {
            ResponseUtil.sendError(response, e.statusCode, e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "Server error: " + e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!isAdmin(request, response)) return;
        if (!requireCsrf(request, response)) return;

        String path = request.getPathInfo();
        try {
            if (path != null && path.equals("/settings/archive")) {
                ArchiveRequest body = readRequestBody(request, ArchiveRequest.class);
                requireArchiveConfirmation(body);
                SystemSettings settings = settingsRepo.get();
                User actor = SessionUtil.getCurrentMOUser(request);
                String semester = first(settings.getCurrentSemester(), "Current Semester");
                Map<String, Object> archived = DataStore.archiveCurrentData(semester, actor == null ? "admin" : actor.getName());
                ArchiveRecord record = new ArchiveRecord();
                record.setId(String.valueOf(archived.get("id")));
                record.setSemester(semester);
                record.setPath(String.valueOf(archived.get("path")));
                record.setArchivedAt((LocalDateTime) archived.get("archivedAt"));
                record.setArchivedBy(String.valueOf(archived.get("archivedBy")));
                if (settings.getArchiveHistory() == null) {
                    settings.setArchiveHistory(new ArrayList<>());
                }
                settings.getArchiveHistory().add(0, record);
                settings.setArchived(true);
                settings.setArchivedAt(LocalDateTime.now());
                settings.setRecruitmentOpen(false);
                settingsRepo.save(settings);
                audit(request, "ARCHIVE_SEMESTER", "settings", "current", "Archived " + semester + " to " + record.getPath());
                Map<String, Object> result = new HashMap<>();
                result.put("settings", settings);
                result.put("archive", archived);
                ResponseUtil.sendSuccess(response, result);
                return;
            }
            if (path != null && (path.matches("/jobs/[^/]+/close") || path.matches("/jobs/[^/]+/unpublish"))) {
                String jobId = path.split("/")[2];
                ResponseUtil.sendSuccess(response, closeJob(request, jobId));
                return;
            }
            if (path != null && path.equals("/users")) {
                CreateUserRequest body = readRequestBody(request, CreateUserRequest.class);
                ResponseUtil.sendSuccess(response, createUser(request, body));
                return;
            }
            if (path != null && path.equals("/knowledge")) {
                KnowledgeDocument document = readRequestBody(request, KnowledgeDocument.class);
                KnowledgeDocument created = createKnowledgeDocument(request, document);
                ResponseUtil.sendSuccess(response, created);
                return;
            }
            if (path != null && path.equals("/announcements")) {
                Announcement body = readRequestBody(request, Announcement.class);
                ResponseUtil.sendSuccess(response, saveAnnouncement(request, null, body));
                return;
            }
            ResponseUtil.sendError(response, 404, "Admin endpoint not found");
        } catch (AdminRequestException e) {
            ResponseUtil.sendError(response, e.statusCode, e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "Server error: " + e.getMessage());
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!isAdmin(request, response)) return;
        if (!requireCsrf(request, response)) return;

        String path = request.getPathInfo();
        try {
            if (path != null && path.matches("/knowledge/[^/]+")) {
                String id = path.split("/")[2];
                if (!settingsRepo.deleteKnowledgeDocument(id)) {
                    ResponseUtil.sendError(response, 404, "Document not found");
                    return;
                }
                audit(request, "DELETE_KNOWLEDGE_DOCUMENT", "knowledge", id, "Deleted knowledge document");
                ResponseUtil.sendSuccess(response, Map.of("deleted", true));
                return;
            }
            if (path != null && path.matches("/announcements/[^/]+")) {
                String id = path.split("/")[2];
                List<Announcement> announcements = announcementRepo.findAll();
                boolean removed = announcements.removeIf(item -> id.equals(item.getId()));
                if (!removed) {
                    ResponseUtil.sendError(response, 404, "Announcement not found");
                    return;
                }
                announcementRepo.saveAll(announcements);
                audit(request, "DELETE_ANNOUNCEMENT", "announcement", id, "Deleted announcement");
                ResponseUtil.sendSuccess(response, Map.of("deleted", true));
                return;
            }
            ResponseUtil.sendError(response, 404, "Admin endpoint not found");
        } catch (AdminRequestException e) {
            ResponseUtil.sendError(response, e.statusCode, e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "Server error: " + e.getMessage());
        }
    }

    private boolean isAdmin(HttpServletRequest request, HttpServletResponse response) throws IOException {
        User user = SessionUtil.getCurrentMOUser(request);
        if (user == null || !"admin".equals(user.getRole())) {
            ResponseUtil.sendError(response, 401, "Admin login required");
            return false;
        }
        return true;
    }

    private String getRoute(HttpServletRequest request) {
        String path = request.getPathInfo();
        if (path == null || "/".equals(path)) return "";
        String[] parts = path.substring(1).split("/");
        return parts.length == 0 ? "" : parts[0];
    }

    private Map<String, Object> dashboard() throws IOException {
        List<Job> jobs = jobRepo.findAll();
        List<Application> applications = applicationRepo.findAll();
        List<Timesheet> timesheets = timesheetRepo.findAll();

        int activeJobs = (int) jobs.stream().filter(j -> "published".equals(j.getStatus())).count();
        int pendingJobs = (int) jobs.stream().filter(j -> "pending".equals(j.getStatus())).count();
        int hired = (int) applications.stream().filter(a -> "approved".equals(a.getStatus())).count();
        double workloadHours = sumHours(timesheets);
        int requestedSlots = jobs.stream().mapToInt(this::slots).sum();
        double budgetHours = Math.max(1, jobs.stream().mapToDouble(j -> slots(j) * value(j.getHoursPerWeek()) * 16).sum());

        Map<String, Double> departmentHours = new HashMap<>();
        for (Timesheet timesheet : timesheets) {
            Optional<Job> job = jobRepo.findById(timesheet.getJobId());
            String department = job.map(Job::getDepartment).orElse("Unknown");
            departmentHours.put(department, departmentHours.getOrDefault(department, 0.0) + hours(timesheet));
        }

        Map<String, Object> data = new HashMap<>();
        data.put("activeJobs", activeJobs);
        data.put("totalJobs", jobs.size());
        data.put("pendingJobs", pendingJobs);
        data.put("requestedSlots", requestedSlots);
        data.put("hired", hired);
        data.put("totalApplications", applications.size());
        data.put("workloadHours", workloadHours);
        data.put("budgetHours", budgetHours);
        data.put("budgetUsage", percent(workloadHours, budgetHours));
        data.put("fillRate", percent(hired, Math.max(1, requestedSlots)));
        data.put("departmentHours", departmentHours);
        data.put("recruitmentOpen", settingsRepo.get().getRecruitmentOpen());
        return data;
    }

    private Map<String, Object> report(HttpServletRequest request) throws IOException {
        String department = normalize(request.getParameter("department"));
        String status = normalize(request.getParameter("status"));
        String from = request.getParameter("from");
        String to = request.getParameter("to");

        List<Job> jobs = jobRepo.findAll().stream()
                .filter(job -> department == null || contains(job.getDepartment(), department))
                .filter(job -> status == null || contains(job.getStatus(), status))
                .collect(Collectors.toList());
        Map<String, Job> jobById = jobs.stream().collect(Collectors.toMap(Job::getId, job -> job, (a, b) -> a));
        List<Application> applications = applicationRepo.findAll().stream()
                .filter(application -> jobById.containsKey(application.getJobId()))
                .collect(Collectors.toList());
        List<Timesheet> timesheets = timesheetRepo.findAll().stream()
                .filter(timesheet -> jobById.containsKey(timesheet.getJobId()))
                .filter(timesheet -> inDateRange(timesheet.getDate(), from, to))
                .collect(Collectors.toList());

        List<Map<String, Object>> rows = new ArrayList<>();
        for (Job job : jobs) {
            long applicantCount = applications.stream().filter(app -> job.getId().equals(app.getJobId())).count();
            long approvedCount = applications.stream().filter(app -> job.getId().equals(app.getJobId()) && "approved".equals(app.getStatus())).count();
            double jobHours = timesheets.stream().filter(t -> job.getId().equals(t.getJobId())).mapToDouble(this::hours).sum();
            Map<String, Object> row = new HashMap<>();
            row.put("jobId", job.getId());
            row.put("title", job.getTitle());
            row.put("department", first(job.getDepartment(), "Unknown"));
            row.put("status", job.getStatus());
            row.put("slots", slots(job));
            row.put("applicants", applicantCount);
            row.put("approved", approvedCount);
            row.put("hours", jobHours);
            row.put("budget", slots(job) * value(job.getHoursPerWeek()) * 16);
            rows.add(row);
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("jobs", jobs.size());
        summary.put("applications", applications.size());
        summary.put("approved", applications.stream().filter(app -> "approved".equals(app.getStatus())).count());
        summary.put("hours", sumHours(timesheets));
        summary.put("exceptions", timesheets.stream().filter(t -> Boolean.TRUE.equals(t.getHasAnomaly()) || hours(t) > 8).count());

        Map<String, Object> data = new HashMap<>();
        data.put("summary", summary);
        data.put("rows", rows);
        data.put("filters", Map.of(
                "department", department == null ? "" : department,
                "status", status == null ? "" : status,
                "from", from == null ? "" : from,
                "to", to == null ? "" : to));
        return data;
    }

    private Map<String, Object> recruitment(String status) throws IOException {
        List<Job> jobs = jobRepo.findAll();
        if (status != null && !status.isBlank()) {
            jobs = jobs.stream().filter(j -> status.equals(j.getStatus())).collect(Collectors.toList());
        }
        jobs.sort(Comparator.comparing(Job::getUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder())));

        List<Map<String, Object>> rows = new ArrayList<>();
        for (Job job : jobs) {
            Map<String, Object> row = new HashMap<>();
            row.put("id", job.getId());
            row.put("moduleName", first(job.getModuleName(), job.getTitle()));
            row.put("moduleCode", first(job.getModuleCode(), job.getModuleId()));
            row.put("requestingMO", first(job.getMoName(), job.getCreatedBy()));
            row.put("department", first(job.getDepartment(), "Unknown"));
            row.put("taSlots", slots(job));
            row.put("proposedWorkload", value(job.getHoursPerWeek()) + "h/week");
            row.put("budgetStatus", budgetStatus(job));
            row.put("submittedAt", time(job.getUpdatedAt()));
            row.put("status", job.getStatus());
            rows.add(row);
        }

        Map<String, Object> data = new HashMap<>();
        data.put("jobs", rows);
        data.put("pendingCount", rows.stream().filter(r -> "pending".equals(r.get("status"))).count());
        data.put("totalSlots", rows.stream().mapToInt(r -> (Integer) r.get("taSlots")).sum());
        data.put("warningCount", rows.stream().filter(r -> !"within".equals(r.get("budgetStatus"))).count());
        return data;
    }

    private Map<String, Object> applications(HttpServletRequest request) throws IOException {
        String status = normalize(request.getParameter("status"));
        String jobFilter = normalize(firstNonBlank(request.getParameter("jobId"), request.getParameter("job")));
        String studentFilter = normalize(firstNonBlank(request.getParameter("studentId"), request.getParameter("student")));
        int page = parsePositiveInt(request.getParameter("page"), 1, "page");
        int size = parsePositiveInt(request.getParameter("size"), 50, "size");
        size = Math.min(size, 100);

        List<Job> jobs = jobRepo.findAll();
        List<Student> students = studentRepo.findAll();
        Map<String, Job> jobById = jobs.stream().collect(Collectors.toMap(Job::getId, job -> job, (a, b) -> a));
        Map<String, Student> studentById = students.stream().collect(Collectors.toMap(Student::getId, student -> student, (a, b) -> a));

        List<Map<String, Object>> rows = applicationRepo.findAll().stream()
                .filter(application -> status == null || status.equalsIgnoreCase(application.getStatus()))
                .map(application -> applicationRow(application, jobById.get(application.getJobId()), studentById.get(application.getStudentId())))
                .filter(row -> jobFilter == null
                        || contains((String) row.get("jobId"), jobFilter)
                        || contains((String) row.get("jobTitle"), jobFilter)
                        || contains((String) row.get("moduleCode"), jobFilter)
                        || contains((String) row.get("moduleName"), jobFilter))
                .filter(row -> studentFilter == null
                        || contains((String) row.get("studentId"), studentFilter)
                        || contains((String) row.get("studentNumber"), studentFilter)
                        || contains((String) row.get("studentName"), studentFilter)
                        || contains((String) row.get("studentEmail"), studentFilter))
                .sorted((a, b) -> String.valueOf(b.get("appliedAt")).compareTo(String.valueOf(a.get("appliedAt"))))
                .collect(Collectors.toList());

        int total = rows.size();
        int start = Math.min((page - 1) * size, total);
        int end = Math.min(start + size, total);
        Map<String, Object> data = new HashMap<>();
        data.put("items", rows.subList(start, end));
        data.put("total", total);
        data.put("page", page);
        data.put("size", size);
        data.put("filters", Map.of(
                "status", status == null ? "" : status,
                "job", jobFilter == null ? "" : jobFilter,
                "student", studentFilter == null ? "" : studentFilter));
        return data;
    }

    private Job reviewJob(HttpServletRequest request, String jobId, ReviewRequest body) throws IOException {
        Optional<Job> jobOpt = jobRepo.findById(jobId);
        if (!jobOpt.isPresent()) {
            throw new AdminRequestException(404, "Job not found");
        }
        Job job = jobOpt.get();
        String action = body == null ? "" : body.action;
        if (!"approve".equals(action) && !"reject".equals(action)) {
            throw new AdminRequestException(400, "Invalid review action");
        }
        if (!"pending".equals(job.getStatus())) {
            throw new AdminRequestException(409, "Only pending jobs can be reviewed");
        }
        if ("approve".equals(action)) {
            job.setStatus("published");
            job.setPublishedAt(LocalDateTime.now());
        } else {
            job.setStatus("rejected");
        }
        job.setUpdatedAt(LocalDateTime.now());
        jobRepo.save(job);
        String comment = body == null ? "" : limitText(body.comment, 1000);
        audit(request, "REVIEW_JOB", "job", jobId, action + (isBlank(comment) ? "" : ": " + comment));
        return job;
    }

    private Job closeJob(HttpServletRequest request, String jobId) throws IOException {
        Optional<Job> jobOpt = jobRepo.findById(jobId);
        if (!jobOpt.isPresent()) {
            throw new AdminRequestException(404, "Job not found");
        }
        Job job = jobOpt.get();
        if ("closed".equals(job.getStatus())) {
            return job;
        }
        if (!"published".equals(job.getStatus())) {
            throw new AdminRequestException(400, "Only published jobs can be closed");
        }
        job.setStatus("closed");
        job.setUpdatedAt(LocalDateTime.now());
        jobRepo.save(job);
        audit(request, "CLOSE_JOB", "job", jobId, "Closed published job");
        return job;
    }

    private Map<String, Object> users() throws IOException {
        List<User> users = userRepo.findAll();
        List<Student> students = studentRepo.findAll();
        List<Job> jobs = jobRepo.findAll();
        List<Application> applications = applicationRepo.findAll();

        Map<String, List<String>> studentModules = new HashMap<>();
        for (Application application : applications) {
            if (!"approved".equals(application.getStatus())) continue;
            Optional<Job> job = jobs.stream().filter(j -> j.getId().equals(application.getJobId())).findFirst();
            studentModules.computeIfAbsent(application.getStudentId(), k -> new ArrayList<>())
                    .add(job.map(j -> first(j.getModuleName(), j.getTitle())).orElse(application.getJobId()));
        }

        Map<String, Object> data = new HashMap<>();
        data.put("mos", users.stream().filter(u -> "mo".equals(u.getRole())).map(this::userRow).collect(Collectors.toList()));
        data.put("tas", students.stream().map(s -> studentRow(s, studentModules.getOrDefault(s.getId(), new ArrayList<>()))).collect(Collectors.toList()));
        data.put("lastScan", LocalDateTime.now());
        data.put("scanStatus", "Healthy");
        return data;
    }

    private List<AuditLog> auditLogs(HttpServletRequest request) throws IOException {
        String action = normalize(request.getParameter("action"));
        String actor = normalize(request.getParameter("actor"));
        String targetType = normalize(request.getParameter("targetType"));
        String search = normalize(request.getParameter("search"));

        return auditLogRepo.findAll().stream()
                .filter(log -> action == null || contains(log.getAction(), action))
                .filter(log -> actor == null || contains(log.getActorName(), actor) || contains(log.getActorId(), actor))
                .filter(log -> targetType == null || contains(log.getTargetType(), targetType))
                .filter(log -> search == null
                        || contains(log.getAction(), search)
                        || contains(log.getTargetType(), search)
                        || contains(log.getTargetId(), search)
                        || contains(log.getDetail(), search)
                        || contains(log.getActorName(), search))
                .collect(Collectors.toList());
    }

    private Object updateUserStatus(HttpServletRequest request, String userId, String status) throws IOException {
        if (isBlank(status)) {
            throw new AdminRequestException(400, "Status is required");
        }
        String normalized = "disabled".equalsIgnoreCase(status) || "inactive".equalsIgnoreCase(status) ? "inactive" : "active";
        if ("inactive".equals(normalized) && userId.equals(SessionUtil.getCurrentUserId(request))) {
            throw new AdminRequestException(400, "You cannot disable your own admin account");
        }
        Optional<User> user = userRepo.findById(userId);
        if (user.isPresent()) {
            user.get().setStatus(normalized);
            userRepo.save(user.get());
            audit(request, "UPDATE_USER_STATUS", "user", userId, normalized);
            return user.get();
        }
        Optional<Student> student = studentRepo.findById(userId);
        if (student.isPresent()) {
            student.get().setStatus(normalized);
            studentRepo.save(student.get());
            audit(request, "UPDATE_USER_STATUS", "student", userId, normalized);
            return student.get();
        }
        throw new AdminRequestException(404, "User not found");
    }

    private User createUser(HttpServletRequest request, CreateUserRequest body) throws IOException {
        if (body == null || isBlank(body.name) || isBlank(body.email) || isBlank(body.password) || isBlank(body.role)) {
            throw new AdminRequestException(400, "Name, email, password and role are required");
        }
        String role = body.role.trim().toLowerCase();
        String email = body.email.trim().toLowerCase();
        if (!"mo".equals(role) && !"admin".equals(role)) {
            throw new AdminRequestException(400, "Only MO/Admin users can be created here");
        }
        if (userRepo.findByEmail(email).isPresent() || studentRepo.findByEmail(email).isPresent()) {
            throw new AdminRequestException(409, "Email already exists");
        }
        User user = new User();
        user.setId(userRepo.generateId(role));
        user.setName(body.name.trim());
        user.setEmail(email);
        user.setPassword(PasswordUtil.hash(body.password));
        user.setRole(role);
        user.setStatus("active");
        user.setCreatedAt(LocalDateTime.now());
        userRepo.save(user);
        audit(request, "CREATE_USER", "user", user.getId(), user.getEmail());
        user.setPassword(null);
        return user;
    }

    private Map<String, Object> workload() throws IOException {
        List<Timesheet> timesheets = timesheetRepo.findAll();
        List<Application> applications = applicationRepo.findAll();
        List<Job> jobs = jobRepo.findAll();
        List<Student> students = studentRepo.findAll();

        List<Map<String, Object>> rows = new ArrayList<>();
        Map<String, Integer> studentMaxHours = new HashMap<>();
        Map<String, Double> studentUsedHours = new HashMap<>();
        for (Application application : applications) {
            if (!"approved".equals(application.getStatus())) continue;
            Optional<Student> student = students.stream().filter(s -> s.getId().equals(application.getStudentId())).findFirst();
            Optional<Job> job = jobs.stream().filter(j -> j.getId().equals(application.getJobId())).findFirst();
            double used = timesheets.stream()
                    .filter(t -> application.getStudentId().equals(t.getStudentId()))
                    .filter(t -> "approved".equals(t.getStatus()) || "pending".equals(t.getStatus()))
                    .mapToDouble(this::hours)
                    .sum();
            int max = Math.max(20, job.map(j -> value(j.getHoursPerWeek()) * 3).orElse(30));
            studentMaxHours.merge(application.getStudentId(), max, Math::max);
            studentUsedHours.put(application.getStudentId(), used);
            Map<String, Object> row = new HashMap<>();
            row.put("id", application.getId());
            row.put("name", student.map(Student::getName).orElse(application.getStudentId()));
            row.put("role", "TA");
            row.put("courses", List.of(job.map(j -> first(j.getModuleName(), j.getTitle())).orElse(application.getJobId())));
            row.put("weeklyHours", used);
            row.put("maxHours", max);
            String status = used > max ? "Blocked" : used > max * 0.8 ? "Overload Risk" : "Normal";
            row.put("status", status);
            row.put("violationSource", violationSource(status, used, max));
            rows.add(row);
        }

        List<Map<String, Object>> exceptions = timesheets.stream()
                .filter(t -> Boolean.TRUE.equals(t.getHasAnomaly())
                        || hours(t) > 8
                        || studentUsedHours.getOrDefault(t.getStudentId(), 0.0) > studentMaxHours.getOrDefault(t.getStudentId(), 30))
                .map(t -> exceptionRow(t, students, jobs, studentUsedHours.getOrDefault(t.getStudentId(), hours(t)),
                        studentMaxHours.getOrDefault(t.getStudentId(), 8)))
                .collect(Collectors.toList());

        Map<String, Object> data = new HashMap<>();
        data.put("rows", rows);
        data.put("exceptions", exceptions);
        data.put("blockedCount", rows.stream().filter(r -> "Blocked".equals(r.get("status"))).count());
        return data;
    }

    private Map<String, Object> settings() {
        try {
            SystemSettings settings = settingsRepo.get();
            Map<String, Object> data = new HashMap<>();
            data.put("recruitmentOpen", settings.getRecruitmentOpen());
            data.put("archived", settings.getArchived());
            data.put("archivedAt", settings.getArchivedAt());
            data.put("currentSemester", settings.getCurrentSemester());
            data.put("archiveHistory", settings.getArchiveHistory());
            data.put("publicFiles", settings.getPublicFiles());
            data.put("internalFiles", settings.getInternalFiles());
            data.put("rates", settings.getRates());
            return data;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private Map<String, Object> updateSettings(HttpServletRequest request, SettingsRequest body) throws IOException {
        SystemSettings settings = settingsRepo.get();
        if (body != null) {
            if (body.recruitmentOpen != null) {
                settings.setRecruitmentOpen(body.recruitmentOpen);
            }
            if (body.rates != null) {
                settings.setRates(validateRates(body.rates));
            }
            if (body.currentSemester != null && !body.currentSemester.isBlank()) {
                settings.setCurrentSemester(limitText(body.currentSemester, 80));
            }
        }
        settingsRepo.save(settings);
        audit(request, "UPDATE_SETTINGS", "settings", "current", "Updated recruitment window or hourly rates");
        return settings();
    }

    private void requireArchiveConfirmation(ArchiveRequest body) throws IOException {
        String submitted = body == null ? null : firstNonBlank(body.confirmation, body.confirmCode, body.confirmText);
        if (!ARCHIVE_CONFIRMATION.equals(submitted)) {
            throw new AdminRequestException(400, "Archive confirmation is required. Type ARCHIVE to confirm.");
        }
    }

    private Timesheet reviewWorkloadException(HttpServletRequest request, String timesheetId, WorkloadReviewRequest body) throws IOException {
        Optional<Timesheet> timesheetOpt = timesheetRepo.findById(timesheetId);
        if (!timesheetOpt.isPresent()) {
            throw new AdminRequestException(404, "Timesheet not found");
        }
        Timesheet timesheet = timesheetOpt.get();
        String action = body == null ? "" : body.action;
        if ("approve".equals(action)) {
            timesheet.setStatus("approved");
            timesheet.setApprovedHours(hours(timesheet));
        } else if ("reject".equals(action)) {
            timesheet.setStatus("rejected");
        } else {
            throw new AdminRequestException(400, "Invalid workload review action");
        }
        timesheet.setHasAnomaly(false);
        String comment = body == null ? null : limitText(body.comment, 1000);
        timesheet.setReviewComment(comment);
        timesheet.setReviewNote(comment);
        timesheet.setReviewedBy(SessionUtil.getCurrentUserId(request));
        timesheet.setReviewedAt(LocalDateTime.now());
        timesheet.setUpdatedAt(LocalDateTime.now());
        timesheetRepo.save(timesheet);
        audit(request, "REVIEW_WORKLOAD_EXCEPTION", "timesheet", timesheetId, action);
        return timesheet;
    }

    private Announcement saveAnnouncement(HttpServletRequest request, String id, Announcement body) throws IOException {
        if (body == null || isBlank(body.getTitle()) || isBlank(body.getContent())) {
            throw new AdminRequestException(400, "Announcement title and content are required");
        }
        List<Announcement> announcements = announcementRepo.findAll();
        Announcement target = null;
        if (id != null) {
            for (Announcement item : announcements) {
                if (id.equals(item.getId())) {
                    target = item;
                    break;
                }
            }
            if (target == null) throw new AdminRequestException(404, "Announcement not found");
        } else {
            target = new Announcement();
            target.setId("ANN" + System.currentTimeMillis());
            announcements.add(target);
        }
        target.setTitle(limitText(body.getTitle(), 160));
        target.setContent(limitText(body.getContent(), 4000));
        target.setCategory(limitText(first(body.getCategory(), "Notice"), 80));
        target.setDate(first(body.getDate(), java.time.LocalDate.now().toString()));
        target.setPinned(Boolean.TRUE.equals(body.getPinned()));
        announcementRepo.saveAll(announcements);
        audit(request, id == null ? "CREATE_ANNOUNCEMENT" : "UPDATE_ANNOUNCEMENT", "announcement", target.getId(), target.getTitle());
        return target;
    }

    private KnowledgeDocument createKnowledgeDocument(HttpServletRequest request, KnowledgeDocument document) throws IOException {
        if (document == null || isBlank(document.getName())) {
            throw new AdminRequestException(400, "Document name is required");
        }
        document.setName(limitText(document.getName(), 180));
        document.setDb("internal".equals(document.getDb()) ? "internal" : "public");
        document.setSize(limitText(first(document.getSize(), "0 KB"), 40));
        document.setStatus(limitText(first(document.getStatus(), "vectorized"), 40));
        document.setPreview(limitText(first(document.getPreview(), "Uploaded through Admin settings."), 500));
        KnowledgeDocument created = settingsRepo.addKnowledgeDocument(document);
        audit(request, "CREATE_KNOWLEDGE_DOCUMENT", "knowledge", created.getId(), created.getName());
        return created;
    }

    private Map<String, Integer> validateRates(Map<String, Integer> rates) throws IOException {
        if (rates.isEmpty()) {
            throw new AdminRequestException(400, "At least one hourly rate is required");
        }
        Map<String, Integer> sanitized = new HashMap<>();
        for (Map.Entry<String, Integer> entry : rates.entrySet()) {
            String key = entry.getKey() == null ? "" : entry.getKey().trim();
            Integer value = entry.getValue();
            if (key.isEmpty() || value == null || value < 0 || value > 10000) {
                throw new AdminRequestException(400, "Hourly rates must be named values between 0 and 10000");
            }
            sanitized.put(limitText(key, 40), value);
        }
        return sanitized;
    }

    private void audit(HttpServletRequest request, String action, String targetType, String targetId, String detail) throws IOException {
        User actor = request == null ? null : SessionUtil.getCurrentMOUser(request);
        auditLogRepo.record(actor, action, targetType, targetId, detail);
    }

    private Map<String, Object> legacySettings() {
        Map<String, Object> data = new HashMap<>();
        data.put("recruitmentOpen", true);
        data.put("publicFiles", List.of(file("pub-1", "TA_Handbook_2026.pdf", "Vectorized")));
        data.put("internalFiles", List.of(file("int-1", "Admin_Approval_SOP.pdf", "Vectorized")));
        data.put("rates", Map.of("general", 40, "senior", 65, "lab", 55));
        return data;
    }

    private Map<String, Object> userRow(User user) {
        Map<String, Object> row = new HashMap<>();
        row.put("id", user.getId());
        row.put("name", user.getName());
        row.put("email", user.getEmail());
        row.put("department", "Teaching");
        row.put("staffId", user.getId());
        row.put("phone", "");
        row.put("modules", new ArrayList<>());
        row.put("lastLogin", time(user.getLastLoginAt()));
        row.put("status", "active".equals(user.getStatus()) ? "Active" : "Disabled");
        return row;
    }

    private Map<String, Object> applicationRow(Application application, Job job, Student student) {
        Map<String, Object> row = new HashMap<>();
        row.put("id", application.getId());
        row.put("applicationId", application.getId());
        row.put("status", application.getStatus());
        row.put("jobId", application.getJobId());
        row.put("studentId", application.getStudentId());
        row.put("studentNumber", student == null ? "" : student.getStudentId());
        row.put("studentName", student == null ? application.getStudentId() : student.getName());
        row.put("studentEmail", student == null ? "" : student.getEmail());
        row.put("jobTitle", job == null ? application.getJobId() : first(job.getTitle(), job.getModuleName()));
        row.put("moduleCode", job == null ? "" : first(job.getModuleCode(), job.getModuleId()));
        row.put("moduleName", job == null ? "" : first(job.getModuleName(), job.getTitle()));
        row.put("jobStatus", job == null ? "missing" : job.getStatus());
        row.put("moName", job == null ? "" : first(job.getMoName(), job.getCreatedBy()));
        row.put("department", job == null ? "" : first(job.getDepartment(), "Unknown"));
        row.put("appliedAt", time(application.getAppliedAt()));
        row.put("updatedAt", time(application.getUpdatedAt()));
        row.put("reviewNote", firstNonBlank(application.getReviewNote(), application.getReviewComment()));
        return row;
    }

    private Map<String, Object> studentRow(Student student, List<String> modules) {
        Map<String, Object> row = new HashMap<>();
        row.put("id", student.getId());
        row.put("name", student.getName());
        row.put("email", student.getEmail());
        row.put("type", "Graduate".equals(student.getGrade()) ? "Graduate" : "Undergraduate");
        row.put("studentId", student.getStudentId());
        row.put("phone", student.getPhone());
        row.put("major", student.getMajor());
        row.put("department", student.getMajor());
        row.put("assignedModules", modules);
        row.put("lastLogin", time(student.getLastLoginAt()));
        row.put("status", "active".equals(student.getStatus()) ? "Active" : "Disabled");
        return row;
    }

    private Map<String, Object> exceptionRow(Timesheet timesheet, List<Student> students, List<Job> jobs, double currentHours, double maxHours) {
        Optional<Student> student = students.stream().filter(s -> s.getId().equals(timesheet.getStudentId())).findFirst();
        Optional<Job> job = jobs.stream().filter(j -> j.getId().equals(timesheet.getJobId())).findFirst();
        Map<String, Object> row = new HashMap<>();
        row.put("id", timesheet.getId());
        row.put("studentName", student.map(Student::getName).orElse(timesheet.getStudentId()));
        row.put("requestingMO", job.map(Job::getMoName).orElse("MO"));
        row.put("reason", first(timesheet.getAnomalyReason(), anomalyReason(timesheet, currentHours, maxHours)));
        row.put("currentHours", currentHours);
        row.put("maxHours", maxHours);
        row.put("overBy", Math.max(0, currentHours - maxHours));
        row.put("aiRecommendation", currentHours > maxHours
                ? "Workload exceeds the configured limit. Approve only with a documented temporary exception."
                : "Single timesheet is unusually high. Verify the work evidence before approving.");
        row.put("aiVerdict", currentHours > maxHours * 1.15 ? "deny" : "caution");
        row.put("aiConfidence", 82);
        return row;
    }

    private String violationSource(String status, double used, int max) {
        if ("Blocked".equals(status)) return "Weekly workload limit exceeded by " + Math.round(used - max) + "h";
        if ("Overload Risk".equals(status)) return "Usage above 80% of configured workload limit";
        return null;
    }

    private String anomalyReason(Timesheet timesheet, double currentHours, double maxHours) {
        if (hours(timesheet) > 8) return "Single timesheet exceeds 8 hours";
        if (currentHours > maxHours) return "Aggregate workload exceeds configured limit";
        return timesheet.getDescription();
    }

    private Map<String, Object> file(String id, String name, String status) {
        Map<String, Object> file = new HashMap<>();
        file.put("id", id);
        file.put("name", name);
        file.put("syncedAt", "just now");
        file.put("status", status);
        return file;
    }

    private String budgetStatus(Job job) {
        int hours = value(job.getHoursPerWeek());
        int slots = slots(job);
        if (hours * slots > 60) return "exceeded";
        if (hours * slots > 30) return "warning";
        return "within";
    }

    private double sumHours(List<Timesheet> timesheets) {
        return timesheets.stream().mapToDouble(this::hours).sum();
    }

    private double hours(Timesheet timesheet) {
        if (timesheet.getApprovedHours() != null) return timesheet.getApprovedHours();
        if (timesheet.getHoursWorked() != null) return timesheet.getHoursWorked();
        if (timesheet.getHours() != null) return timesheet.getHours();
        return 0.0;
    }

    private int slots(Job job) {
        if (job.getSlots() != null) return job.getSlots();
        if (job.getPositions() != null) return job.getPositions();
        return 0;
    }

    private int value(Integer value) {
        return value == null ? 0 : value;
    }

    private double percent(double value, double total) {
        return Math.round((value / total) * 1000.0) / 10.0;
    }

    private String first(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private String firstNonBlank(String... values) {
        if (values == null) {
            return null;
        }
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return null;
    }

    private int parsePositiveInt(String value, int fallback, String fieldName) throws IOException {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        try {
            int parsed = Integer.parseInt(value.trim());
            if (parsed < 1) {
                throw new NumberFormatException("negative or zero");
            }
            return parsed;
        } catch (NumberFormatException e) {
            throw new AdminRequestException(400, fieldName + " must be a positive number");
        }
    }

    private String time(LocalDateTime value) {
        return value == null ? "-" : value.toString();
    }

    private String normalize(String value) {
        return value == null || value.trim().isEmpty() ? null : value.trim().toLowerCase();
    }

    private boolean contains(String value, String needle) {
        return value != null && needle != null && value.toLowerCase().contains(needle);
    }

    private boolean inDateRange(String date, String from, String to) {
        if (date == null || date.isBlank()) {
            return true;
        }
        if (from != null && !from.isBlank() && date.compareTo(from) < 0) {
            return false;
        }
        return to == null || to.isBlank() || date.compareTo(to) <= 0;
    }

    private static class ReviewRequest {
        String action;
        String comment;
    }

    private static class StatusRequest {
        String status;
    }

    private static class SettingsRequest {
        Boolean recruitmentOpen;
        String currentSemester;
        Map<String, Integer> rates;
    }

    private static class ArchiveRequest {
        String confirmation;
        String confirmCode;
        String confirmText;
    }

    private static class CreateUserRequest {
        String name;
        String email;
        String password;
        String role;
    }

    private static class WorkloadReviewRequest {
        String action;
        String comment;
    }

    private static class AdminRequestException extends IOException {
        private final int statusCode;

        AdminRequestException(int statusCode, String message) {
            super(message);
            this.statusCode = statusCode;
        }
    }

    private String limitText(String value, int maxLength) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.length() <= maxLength ? trimmed : trimmed.substring(0, maxLength);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
