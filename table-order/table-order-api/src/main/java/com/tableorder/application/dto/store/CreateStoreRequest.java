package com.tableorder.application.dto.store;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateStoreRequest(
    @NotBlank(message = "매장명은 필수입니다")
    @Size(max = 100, message = "매장명은 100자 이하여야 합니다")
    String name,
    
    @NotBlank(message = "매장 식별자는 필수입니다")
    @Size(max = 50, message = "매장 식별자는 50자 이하여야 합니다")
    @Pattern(regexp = "^[a-z0-9-]+$", message = "매장 식별자는 소문자, 숫자, 하이픈만 사용할 수 있습니다")
    String identifier,
    
    @NotBlank(message = "관리자 사용자명은 필수입니다")
    @Size(max = 50, message = "관리자 사용자명은 50자 이하여야 합니다")
    String adminUsername,
    
    @NotBlank(message = "관리자 비밀번호는 필수입니다")
    @Size(min = 8, message = "관리자 비밀번호는 8자 이상이어야 합니다")
    String adminPassword
) {}
