package com.bupt.ta.shared.infrastructure;

import com.bupt.ta.shared.domain.Announcement;

import java.io.IOException;
import java.util.Comparator;
import java.util.List;

public class AnnouncementRepository {
    public List<Announcement> findAll() throws IOException {
        List<Announcement> announcements = DataStore.loadAnnouncements();
        announcements.sort(Comparator
                .comparing((Announcement a) -> Boolean.TRUE.equals(a.getPinned())).reversed()
                .thenComparing(Announcement::getDate, Comparator.nullsLast(Comparator.reverseOrder())));
        return announcements;
    }

    public void saveAll(List<Announcement> announcements) throws IOException {
        DataStore.saveAnnouncements(announcements);
    }
}
