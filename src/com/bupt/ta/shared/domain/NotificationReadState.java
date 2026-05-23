package com.bupt.ta.shared.domain;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class NotificationReadState {
    private String userId;
    private List<String> readIds;
    private LocalDateTime updatedAt;

    public NotificationReadState() {
        this.readIds = new ArrayList<>();
        this.updatedAt = LocalDateTime.now();
    }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public List<String> getReadIds() { return readIds; }
    public void setReadIds(List<String> readIds) { this.readIds = readIds; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
