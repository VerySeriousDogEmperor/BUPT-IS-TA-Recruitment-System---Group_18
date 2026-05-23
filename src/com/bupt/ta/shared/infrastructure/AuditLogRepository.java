package com.bupt.ta.shared.infrastructure;

import com.bupt.ta.shared.domain.AuditLog;
import com.bupt.ta.shared.domain.User;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

public class AuditLogRepository {
    public List<AuditLog> findAll() throws IOException {
        List<AuditLog> logs = DataStore.loadAuditLogs();
        logs.sort(Comparator.comparing(AuditLog::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())));
        return logs;
    }

    public AuditLog record(User actor, String action, String targetType, String targetId, String detail) throws IOException {
        AuditLog log = new AuditLog();
        log.setId("AUD" + System.currentTimeMillis());
        log.setActorId(actor == null ? "system" : actor.getId());
        log.setActorName(actor == null ? "System" : actor.getName());
        log.setAction(action);
        log.setTargetType(targetType);
        log.setTargetId(targetId);
        log.setDetail(detail);
        log.setCreatedAt(LocalDateTime.now());
        List<AuditLog> logs = DataStore.loadAuditLogs();
        logs.add(log);
        DataStore.saveAuditLogs(logs);
        return log;
    }
}
