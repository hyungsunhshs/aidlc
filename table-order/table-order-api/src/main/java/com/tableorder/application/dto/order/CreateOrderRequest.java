package com.tableorder.application.dto.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record CreateOrderRequest(
    @NotEmpty(message = "주문 항목은 필수입니다")
    List<@Valid OrderItemRequest> items
) {}
