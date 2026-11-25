package com.tableorder.application.dto.order;

import com.tableorder.domain.model.Order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderDetailResponse(
    Long orderId,
    String orderNumber,
    String status,
    BigDecimal totalAmount,
    LocalDateTime createdAt,
    List<OrderItemResponse> items,
    TableInfo table
) {
    public static OrderDetailResponse from(Order order) {
        return new OrderDetailResponse(
            order.getId(),
            order.getOrderNumber(),
            order.getStatus().name(),
            order.getTotalAmount(),
            order.getCreatedAt(),
            OrderItemResponse.fromList(order.getItems()),
            new TableInfo(
                order.getSession().getTable().getId(),
                order.getSession().getTable().getTableNumber()
            )
        );
    }
    
    public record TableInfo(Long id, String tableNumber) {}
}
