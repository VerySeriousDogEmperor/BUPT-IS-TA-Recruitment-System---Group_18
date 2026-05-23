package com.bupt.ta.shared.interfaces;

import com.bupt.ta.shared.domain.KnowledgeDocument;
import com.bupt.ta.shared.infrastructure.SettingsRepository;
import com.bupt.ta.shared.util.ResponseUtil;
import com.bupt.ta.shared.util.SessionUtil;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;

@WebServlet("/api/knowledge/*")
public class KnowledgeServlet extends BaseServlet {
    private final SettingsRepository settingsRepo = new SettingsRepository();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!requireLogin(request, response)) return;
        try {
            ResponseUtil.sendSuccess(response, settingsRepo.findKnowledgeDocuments(request.getParameter("db")));
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "Server error: " + e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!requireStaff(request, response)) return;
        if (!requireCsrf(request, response)) return;
        try {
            KnowledgeDocument document = readRequestBody(request, KnowledgeDocument.class);
            if (document == null || document.getName() == null || document.getName().trim().isEmpty()) {
                ResponseUtil.sendError(response, 400, "Document name is required");
                return;
            }
            ResponseUtil.sendSuccess(response, settingsRepo.addKnowledgeDocument(document));
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "Server error: " + e.getMessage());
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!requireStaff(request, response)) return;
        if (!requireCsrf(request, response)) return;
        String path = request.getPathInfo();
        if (path == null || path.length() <= 1) {
            ResponseUtil.sendError(response, 400, "Document id is required");
            return;
        }
        try {
            if (!settingsRepo.deleteKnowledgeDocument(path.substring(1))) {
                ResponseUtil.sendError(response, 404, "Document not found");
                return;
            }
            ResponseUtil.sendSuccess(response, Map.of("deleted", true));
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "Server error: " + e.getMessage());
        }
    }

    private boolean requireStaff(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!requireLogin(request, response)) return false;
        String role = SessionUtil.getCurrentUserRole(request);
        if (!"mo".equals(role) && !"admin".equals(role)) {
            ResponseUtil.sendError(response, 403, "Staff access required");
            return false;
        }
        return true;
    }
}
