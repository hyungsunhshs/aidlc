package com.tableorder.application.dto.order;

import com.tableorder.domain.model.Order;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CreateOrderResponse(
    Long orderId,
    String orderNumber,
    BigDecimal totalAmount,
    LocalDateTime createdAt
) {
    public static CreateOrderResponse from(Order order) {
        return new CreateOrderResponse(
            order.getId(),
            order.getOrderNumber(),
            order.getTotalAmount(),
            order.getCreatedAt()
        );
    }
}
