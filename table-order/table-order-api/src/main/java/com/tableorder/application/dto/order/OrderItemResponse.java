package com.tableorder.application.dto.order;

import com.tableorder.domain.model.OrderItem;

import java.math.BigDecimal;
import java.util.List;

public record OrderItemResponse(
    Long id,
    Long menuId,
    String menuName,
    BigDecimal unitPrice,
    Integer quantity,
    BigDecimal subtotal
) {
    public static OrderItemResponse from(OrderItem item) {
        return new OrderItemResponse(
            item.getId(),
            item.getMenuId(),
            item.getMenuName(),
            item.getUnitPrice(),
            item.getQuantity(),
            item.getSubtotal()
        );
    }
    
    public static List<OrderItemResponse> fromList(List<OrderItem> items) {
        return items.stream()
            .map(OrderItemResponse::from)
            .toList();
    }
}
