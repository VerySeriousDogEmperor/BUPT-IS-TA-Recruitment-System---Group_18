package com.bupt.ta.shared.interfaces;

import com.bupt.ta.shared.infrastructure.AnnouncementRepository;
import com.bupt.ta.shared.util.ResponseUtil;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/api/announcements")
public class AnnouncementServlet extends BaseServlet {
    private final AnnouncementRepository announcementRepo = new AnnouncementRepository();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            ResponseUtil.sendSuccess(response, announcementRepo.findAll());
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtil.sendError(response, 500, "Server error: " + e.getMessage());
        }
    }
}
