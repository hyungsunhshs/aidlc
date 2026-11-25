package com.tableorder.application.dto.table;

import com.tableorder.common.validation.ValidTablePassword;
import jakarta.validation.constraints.Size;

public record UpdateTableRequest(
    @Size(max = 20, message = "테이블 번호는 20자 이하여야 합니다")
    String tableNumber,
    
    @ValidTablePassword
    String password,
    
    Boolean isActive
) {}
