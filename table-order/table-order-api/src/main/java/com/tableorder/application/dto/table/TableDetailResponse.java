package com.tableorder.application.dto.table;

import com.tableorder.domain.model.SessionStatus;
import com.tableorder.domain.model.StoreTable;
import com.tableorder.domain.model.TableSession;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TableDetailResponse(
    Long id,
    String tableNumber,
    boolean isActive,
    ActiveSessionInfo activeSession
) {
    public static TableDetailResponse from(StoreTable table, TableSession activeSession) {
        return new TableDetailResponse(
            table.getId(),
            table.getTableNumber(),
            table.isActive(),
            activeSession != null ? new ActiveSessionInfo(
                activeSession.getId(),
                activeSession.getStartedAt(),
                activeSession.getTotalAmount()
            ) : null
        );
    }
    
    public record ActiveSessionInfo(
        Long sessionId,
        LocalDateTime startedAt,
        BigDecimal totalAmount
    ) {}
}
