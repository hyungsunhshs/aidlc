package com.tableorder.application.dto.table;

import com.tableorder.common.validation.ValidTablePassword;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateTableRequest(
    @NotBlank(message = "테이블 번호는 필수입니다")
    @Size(max = 20, message = "테이블 번호는 20자 이하여야 합니다")
    String tableNumber,
    
    @ValidTablePassword
    String password
) {}
