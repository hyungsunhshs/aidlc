package com.tableorder.application.dto.session;

import com.tableorder.common.validation.ValidTablePassword;
import jakarta.validation.constraints.NotBlank;

public record StartSessionRequest(
    @NotBlank(message = "매장 식별자는 필수입니다")
    String storeIdentifier,
    
    @NotBlank(message = "테이블 번호는 필수입니다")
    String tableNumber,
    
    @ValidTablePassword
    String password
) {}
