package com.tableorder.application.dto.menu;

import jakarta.validation.constraints.Size;

public record UpdateCategoryRequest(
    @Size(max = 50, message = "카테고리명은 50자 이하여야 합니다")
    String name,
    
    Integer displayOrder
) {}
