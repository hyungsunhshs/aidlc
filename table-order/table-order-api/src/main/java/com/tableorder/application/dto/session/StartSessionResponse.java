package com.tableorder.application.dto.session;

import com.tableorder.domain.model.TableSession;

import java.time.LocalDateTime;

public record StartSessionResponse(
    Long sessionId,
    String tableNumber,
    String sessionToken,
    LocalDateTime expiresAt
) {
    public static StartSessionResponse of(TableSession session, String sessionToken) {
        return new StartSessionResponse(
            session.getId(),
            session.getTable().getTableNumber(),
            sessionToken,
            LocalDateTime.now().plusHours(16)
        );
    }
}
