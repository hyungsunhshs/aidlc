package com.tableorder.application.dto.sse;

public record OrderDeletedEvent(
    Long orderId
) {}
