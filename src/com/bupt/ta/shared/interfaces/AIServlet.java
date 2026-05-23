package com.bupt.ta.shared.interfaces;

import com.bupt.ta.shared.domain.Application;
import com.bupt.ta.shared.domain.Job;
import com.bupt.ta.shared.domain.KnowledgeDocument;
import com.bupt.ta.shared.infrastructure.ApplicationRepository;
import com.bupt.ta.shared.infrastructure.JobRepository;
import com.bupt.ta.shared.infrastructure.SettingsRepository;
import com.bupt.ta.shared.infrastructure.StudentRepository;
import com.bupt.ta.shared.util.ResponseUtil;
import com.bupt.ta.student.domain.Student;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.stream.Collectors;

@WebServlet("/api/ai/*")
public class AIServlet extends BaseServlet {
    private final SettingsRepository settingsRepo = new SettingsRepository();
    private final JobRepository jobRepo = new JobRepository();
    private final ApplicationRepository applicationRepo = new ApplicationRepository();
    private final StudentRepository studentRepo = new StudentRepository();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String path = request.getPathInfo();
        try {
            if (path != null && path.startsWith("/rank/")) {
                String jobId = path.substring("/rank/".length());
                ResponseUtil.sendSuccess(response, rank(jobId));
                return;
            }
            if ("/anomaly".equals(path)) {
                ResponseUtil.sendSuccess(response, Map.of("items", List.of(), "summary", "No active anomaly signals."));
                return;
            }
            ResponseUtil.sendError(response, 404, "AI endpoint not found");
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "Server error: " + e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String path = request.getPathInfo();
        try {
            if ("/chat".equals(path)) {
                ChatRequest body = readRequestBody(request, ChatRequest.class);
                ResponseUtil.sendSuccess(response, chat(body == null ? "" : body.message));
                return;
            }
            if ("/match".equals(path)) {
                MatchRequest body = readRequestBody(request, MatchRequest.class);
                ResponseUtil.sendSuccess(response, match(body));
                return;
            }
            ResponseUtil.sendError(response, 404, "AI endpoint not found");
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "Server error: " + e.getMessage());
        }
    }

    private Map<String, Object> chat(String message) throws IOException {
        String query = message == null ? "" : message.toLowerCase();
        List<KnowledgeDocument> documents = settingsRepo.findKnowledgeDocuments(null);
        List<KnowledgeDocument> matches = documents.stream()
                .filter(doc -> contains(doc.getName(), query) || contains(doc.getPreview(), query))
                .collect(Collectors.toList());
        if (matches.isEmpty()) {
            matches = documents.stream().limit(3).collect(Collectors.toList());
        }

        String answer = matches.isEmpty()
                ? "I could not find indexed policy documents yet. Please upload documents in the knowledge base."
                : "I found relevant policy material in " + matches.stream().map(KnowledgeDocument::getName).collect(Collectors.joining(", "))
                + ". Please review the cited documents and follow the current TA recruitment workflow.";

        Map<String, Object> data = new HashMap<>();
        data.put("answer", answer);
        data.put("sources", matches.stream().map(KnowledgeDocument::getName).collect(Collectors.toList()));
        return data;
    }

    private Map<String, Object> match(MatchRequest body) throws IOException {
        Map<String, Object> data = new HashMap<>();
        if (body == null || body.jobId == null) {
            data.put("score", 0);
            data.put("reason", "Missing job id.");
            return data;
        }
        Optional<Job> job = jobRepo.findById(body.jobId);
        Optional<Student> student = body.studentId == null ? Optional.empty() : studentRepo.findById(body.studentId);
        if (!job.isPresent()) {
            data.put("score", 0);
            data.put("reason", "Job not found.");
            return data;
        }
        if (!student.isPresent()) {
            data.put("score", 50);
            data.put("reason", "Job found, but no student profile was available for personalized matching.");
            return data;
        }
        MatchResult result = score(student.get(), job.get());
        data.put("score", result.score);
        data.put("reason", result.reason);
        data.put("matchedSkills", result.matchedSkills);
        return data;
    }

    private Map<String, Object> rank(String jobId) throws IOException {
        List<Application> applications = applicationRepo.findByJobId(jobId);
        Optional<Job> job = jobRepo.findById(jobId);
        List<Map<String, Object>> candidates = new ArrayList<>();
        for (Application app : applications) {
            Optional<Student> student = studentRepo.findById(app.getStudentId());
            MatchResult result = job.isPresent() && student.isPresent()
                    ? score(student.get(), job.get())
                    : new MatchResult(app.getAiScore() == null ? 50 : app.getAiScore(), "Missing student or job profile.", List.of());
            Map<String, Object> row = new HashMap<>();
            row.put("applicationId", app.getId());
            row.put("studentId", app.getStudentId());
            row.put("studentName", student.map(Student::getName).orElse(app.getStudentId()));
            row.put("score", result.score);
            row.put("reason", result.reason);
            row.put("matchedSkills", result.matchedSkills);
            candidates.add(row);
        }
        candidates.sort(Comparator.comparing(row -> -((Integer) row.get("score"))));
        Map<String, Object> data = new HashMap<>();
        data.put("jobId", jobId);
        data.put("candidates", candidates);
        return data;
    }

    private MatchResult score(Student student, Job job) {
        int score = 45;
        List<String> matched = new ArrayList<>();
        List<String> studentSkills = student.getSkills() == null ? List.of() : student.getSkills();
        List<String> requiredSkills = job.getRequiredSkills() == null ? List.of() : job.getRequiredSkills();
        for (String required : requiredSkills) {
            for (String skill : studentSkills) {
                if (skill != null && required != null && skill.toLowerCase().contains(required.toLowerCase())) {
                    score += 12;
                    matched.add(required);
                    break;
                }
            }
        }
        if (student.getGpa() != null) {
            score += Math.min(20, (int) Math.round(Math.max(0, student.getGpa() - 2.5) * 12));
        }
        if (student.getMajor() != null && job.getDepartment() != null
                && job.getDepartment().toLowerCase().contains(student.getMajor().toLowerCase().split(" ")[0])) {
            score += 10;
        }
        score = Math.max(0, Math.min(100, score));
        String reason = "Matched " + matched.size() + " required skill(s)"
                + (student.getGpa() == null ? "" : ", GPA contribution included")
                + " for " + job.getTitle() + ".";
        return new MatchResult(score, reason, matched);
    }

    private boolean contains(String value, String query) {
        return value != null && query != null && !query.isBlank() && value.toLowerCase().contains(query);
    }

    private static class ChatRequest {
        String message;
        String sessionId;
    }

    private static class MatchRequest {
        String studentId;
        String jobId;
    }

    private static class MatchResult {
        int score;
        String reason;
        List<String> matchedSkills;

        MatchResult(int score, String reason, List<String> matchedSkills) {
            this.score = score;
            this.reason = reason;
            this.matchedSkills = matchedSkills;
        }
    }
}
