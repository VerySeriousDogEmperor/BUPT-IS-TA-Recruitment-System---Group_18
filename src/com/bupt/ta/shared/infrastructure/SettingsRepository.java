package com.bupt.ta.shared.infrastructure;

import com.bupt.ta.shared.domain.KnowledgeDocument;
import com.bupt.ta.shared.domain.SystemSettings;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class SettingsRepository {
    public SystemSettings get() throws IOException {
        SystemSettings settings = DataStore.loadSettings();
        if (settings.getRates() == null) settings.setRates(new java.util.HashMap<>());
        if (settings.getPublicFiles() == null) settings.setPublicFiles(new ArrayList<>());
        if (settings.getInternalFiles() == null) settings.setInternalFiles(new ArrayList<>());
        if (settings.getArchiveHistory() == null) settings.setArchiveHistory(new ArrayList<>());
        if (settings.getCurrentSemester() == null || settings.getCurrentSemester().isBlank()) {
            settings.setCurrentSemester("2026 Spring");
        }
        return settings;
    }

    public void save(SystemSettings settings) throws IOException {
        DataStore.saveSettings(settings);
    }

    public List<KnowledgeDocument> findKnowledgeDocuments(String db) throws IOException {
        SystemSettings settings = get();
        List<KnowledgeDocument> docs = new ArrayList<>();
        if (!"internal".equals(db)) {
            docs.addAll(settings.getPublicFiles());
        }
        if (!"public".equals(db)) {
            docs.addAll(settings.getInternalFiles());
        }
        return docs;
    }

    public KnowledgeDocument addKnowledgeDocument(KnowledgeDocument document) throws IOException {
        SystemSettings settings = get();
        if (document.getId() == null || document.getId().isBlank()) {
            document.setId("DOC" + System.currentTimeMillis());
        }
        if (document.getStatus() == null || document.getStatus().isBlank()) {
            document.setStatus("vectorized");
        }
        if (document.getSyncedAt() == null) {
            document.setSyncedAt(LocalDateTime.now());
        }
        if ("internal".equals(document.getDb())) {
            settings.getInternalFiles().add(0, document);
        } else {
            document.setDb("public");
            settings.getPublicFiles().add(0, document);
        }
        save(settings);
        return document;
    }

    public boolean deleteKnowledgeDocument(String id) throws IOException {
        SystemSettings settings = get();
        boolean removed = settings.getPublicFiles().removeIf(doc -> id.equals(doc.getId()));
        removed = settings.getInternalFiles().removeIf(doc -> id.equals(doc.getId())) || removed;
        if (removed) {
            save(settings);
        }
        return removed;
    }
}
