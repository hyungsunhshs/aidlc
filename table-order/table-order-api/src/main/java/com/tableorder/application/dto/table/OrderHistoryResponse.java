package com.tableorder.application.dto.table;

import com.tableorder.domain.model.OrderHistory;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderHistoryResponse(
    Long id,
    Long sessionId,
    String orderData,
    BigDecimal totalAmount,
    LocalDateTime startedAt,
    LocalDateTime completedAt
) {
    public static OrderHistoryResponse from(OrderHistory history) {
        return new OrderHistoryResponse(
            history.getId(),
            history.getSessionId(),
            history.getOrderData(),
            history.getTotalAmount(),
            history.getStartedAt(),
            history.getCompletedAt()
        );
    }
    
    public static List<OrderHistoryResponse> fromList(List<OrderHistory> histories) {
        return histories.stream()
            .map(OrderHistoryResponse::from)
            .toList();
    }
}
