package com.tableorder.application.dto.store;

import com.tableorder.domain.model.Store;

import java.time.LocalDateTime;

public record StoreResponse(
    Long id,
    String name,
    String identifier,
    LocalDateTime createdAt
) {
    public static StoreResponse from(Store store) {
        return new StoreResponse(
            store.getId(),
            store.getName(),
            store.getIdentifier(),
            store.getCreatedAt()
        );
    }
}
