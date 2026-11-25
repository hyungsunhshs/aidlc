package com.tableorder.application.dto.admin;

import com.tableorder.domain.model.Admin;
import com.tableorder.domain.model.Store;

import java.time.LocalDateTime;

public record AdminLoginResponse(
    String accessToken,
    LocalDateTime expiresAt,
    AdminInfo admin
) {
    public static AdminLoginResponse of(String accessToken, Admin admin, Store store) {
        return new AdminLoginResponse(
            accessToken,
            LocalDateTime.now().plusHours(16),
            new AdminInfo(admin.getId(), admin.getUsername(), store.getId(), store.getName())
        );
    }
    
    public record AdminInfo(Long id, String username, Long storeId, String storeName) {}
}
