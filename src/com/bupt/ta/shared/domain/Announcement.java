package com.bupt.ta.shared.domain;

public class Announcement {
    private String id;
    private String title;
    private String date;
    private String category;
    private Boolean pinned;
    private String content;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Boolean getPinned() { return pinned; }
    public void setPinned(Boolean pinned) { this.pinned = pinned; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
