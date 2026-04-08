package com.bupt.ta.shared.domain;

import java.util.ArrayList;
import java.util.List;

/**
 * 排课时间表
 */
public class Schedule {
    private List<String> monday;
    private List<String> tuesday;
    private List<String> wednesday;
    private List<String> thursday;
    private List<String> friday;
    private List<String> saturday;
    private List<String> sunday;

    public Schedule() {
        this.monday = new ArrayList<>();
        this.tuesday = new ArrayList<>();
        this.wednesday = new ArrayList<>();
        this.thursday = new ArrayList<>();
        this.friday = new ArrayList<>();
        this.saturday = new ArrayList<>();
        this.sunday = new ArrayList<>();
    }

    // Getters and Setters
    public List<String> getMonday() { return monday; }
    public void setMonday(List<String> monday) { this.monday = monday; }
    
    public List<String> getTuesday() { return tuesday; }
    public void setTuesday(List<String> tuesday) { this.tuesday = tuesday; }
    
    public List<String> getWednesday() { return wednesday; }
    public void setWednesday(List<String> wednesday) { this.wednesday = wednesday; }
    
    public List<String> getThursday() { return thursday; }
    public void setThursday(List<String> thursday) { this.thursday = thursday; }
    
    public List<String> getFriday() { return friday; }
    public void setFriday(List<String> friday) { this.friday = friday; }
    
    public List<String> getSaturday() { return saturday; }
    public void setSaturday(List<String> saturday) { this.saturday = saturday; }
    
    public List<String> getSunday() { return sunday; }
    public void setSunday(List<String> sunday) { this.sunday = sunday; }
}
