package com.tableorder.application.dto.order;

import com.tableorder.domain.model.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(
    @NotNull(message = "상태값은 필수입니다")
    OrderStatus status
) {}
