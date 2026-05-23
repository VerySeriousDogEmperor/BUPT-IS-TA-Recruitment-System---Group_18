package com.bupt.ta.shared.domain;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SystemSettings {
    private Boolean recruitmentOpen;
    private Boolean archived;
    private LocalDateTime archivedAt;
    private String currentSemester;
    private List<ArchiveRecord> archiveHistory;
    private Map<String, Integer> rates;
    private List<KnowledgeDocument> publicFiles;
    private List<KnowledgeDocument> internalFiles;

    public SystemSettings() {
        this.recruitmentOpen = true;
        this.archived = false;
        this.currentSemester = "2026 Spring";
        this.archiveHistory = new ArrayList<>();
        this.rates = new HashMap<>();
        this.publicFiles = new ArrayList<>();
        this.internalFiles = new ArrayList<>();
    }

    public Boolean getRecruitmentOpen() { return recruitmentOpen; }
    public void setRecruitmentOpen(Boolean recruitmentOpen) { this.recruitmentOpen = recruitmentOpen; }

    public Boolean getArchived() { return archived; }
    public void setArchived(Boolean archived) { this.archived = archived; }

    public LocalDateTime getArchivedAt() { return archivedAt; }
    public void setArchivedAt(LocalDateTime archivedAt) { this.archivedAt = archivedAt; }

    public String getCurrentSemester() { return currentSemester; }
    public void setCurrentSemester(String currentSemester) { this.currentSemester = currentSemester; }

    public List<ArchiveRecord> getArchiveHistory() { return archiveHistory; }
    public void setArchiveHistory(List<ArchiveRecord> archiveHistory) { this.archiveHistory = archiveHistory; }

    public Map<String, Integer> getRates() { return rates; }
    public void setRates(Map<String, Integer> rates) { this.rates = rates; }

    public List<KnowledgeDocument> getPublicFiles() { return publicFiles; }
    public void setPublicFiles(List<KnowledgeDocument> publicFiles) { this.publicFiles = publicFiles; }

    public List<KnowledgeDocument> getInternalFiles() { return internalFiles; }
    public void setInternalFiles(List<KnowledgeDocument> internalFiles) { this.internalFiles = internalFiles; }
}
