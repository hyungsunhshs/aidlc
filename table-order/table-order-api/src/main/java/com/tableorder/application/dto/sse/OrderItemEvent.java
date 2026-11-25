package com.tableorder.application.dto.sse;

import java.math.BigDecimal;

public record OrderItemEvent(
    String menuName,
    Integer quantity,
    BigDecimal unitPrice
) {}
