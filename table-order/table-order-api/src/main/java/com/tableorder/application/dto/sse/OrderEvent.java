package com.tableorder.application.dto.sse;

import com.tableorder.domain.model.Order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderEvent(
    Long orderId,
    String orderNumber,
    Long tableId,
    String tableNumber,
    String status,
    BigDecimal totalAmount,
    LocalDateTime createdAt,
    List<OrderItemEvent> items
) {
    public static OrderEvent from(Order order) {
        return new OrderEvent(
            order.getId(),
            order.getOrderNumber(),
            order.getSession().getTable().getId(),
            order.getSession().getTable().getTableNumber(),
            order.getStatus().name(),
            order.getTotalAmount(),
            order.getCreatedAt(),
            order.getItems().stream()
                .map(item -> new OrderItemEvent(
                    item.getMenuName(),
                    item.getQuantity(),
                    item.getUnitPrice()
                ))
                .toList()
        );
    }
}
