package com.bupt.ta.shared.infrastructure;

import com.bupt.ta.shared.domain.NotificationReadState;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

public class NotificationReadRepository {
    public Set<String> findReadIds(String userId) throws IOException {
        return DataStore.loadNotificationReadStates().stream()
                .filter(state -> userId.equals(state.getUserId()))
                .findFirst()
                .map(state -> new LinkedHashSet<>(state.getReadIds() == null ? List.of() : state.getReadIds()))
                .orElseGet(LinkedHashSet::new);
    }

    public Set<String> markRead(String userId, List<String> ids) throws IOException {
        List<NotificationReadState> states = DataStore.loadNotificationReadStates();
        NotificationReadState target = states.stream()
                .filter(state -> userId.equals(state.getUserId()))
                .findFirst()
                .orElse(null);
        if (target == null) {
            target = new NotificationReadState();
            target.setUserId(userId);
            states.add(target);
        }

        LinkedHashSet<String> readIds = new LinkedHashSet<>(target.getReadIds() == null ? new ArrayList<>() : target.getReadIds());
        if (ids != null) {
            ids.stream().filter(id -> id != null && !id.isBlank()).forEach(readIds::add);
        }
        List<String> compact = new ArrayList<>(readIds);
        int from = Math.max(0, compact.size() - 300);
        target.setReadIds(new ArrayList<>(compact.subList(from, compact.size())));
        target.setUpdatedAt(LocalDateTime.now());
        DataStore.saveNotificationReadStates(states);
        return new LinkedHashSet<>(target.getReadIds());
    }
}
