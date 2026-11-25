package com.tableorder.application.dto.order;

import com.tableorder.domain.model.Order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
    Long orderId,
    String orderNumber,
    String status,
    BigDecimal totalAmount,
    LocalDateTime createdAt,
    List<OrderItemResponse> items
) {
    public static OrderResponse from(Order order) {
        return new OrderResponse(
            order.getId(),
            order.getOrderNumber(),
            order.getStatus().name(),
            order.getTotalAmount(),
            order.getCreatedAt(),
            OrderItemResponse.fromList(order.getItems())
        );
    }
    
    public static List<OrderResponse> fromList(List<Order> orders) {
        return orders.stream()
            .map(OrderResponse::from)
            .toList();
    }
}
