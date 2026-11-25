package com.tableorder.application.dto.store;

import jakarta.validation.constraints.Size;

public record UpdateStoreRequest(
    @Size(max = 100, message = "매장명은 100자 이하여야 합니다")
    String name
) {}
