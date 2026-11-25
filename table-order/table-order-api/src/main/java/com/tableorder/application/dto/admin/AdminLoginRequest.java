package com.tableorder.application.dto.admin;

import jakarta.validation.constraints.NotBlank;

public record AdminLoginRequest(
    @NotBlank(message = "매장 식별자는 필수입니다")
    String storeIdentifier,
    
    @NotBlank(message = "사용자명은 필수입니다")
    String username,
    
    @NotBlank(message = "비밀번호는 필수입니다")
    String password
) {}
