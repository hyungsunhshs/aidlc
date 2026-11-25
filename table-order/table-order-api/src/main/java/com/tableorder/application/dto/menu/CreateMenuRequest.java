package com.tableorder.application.dto.menu;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record CreateMenuRequest(
    @NotNull(message = "카테고리 ID는 필수입니다")
    Long categoryId,
    
    @NotBlank(message = "메뉴명은 필수입니다")
    @Size(max = 100, message = "메뉴명은 100자 이하여야 합니다")
    String name,
    
    @NotNull(message = "가격은 필수입니다")
    @DecimalMin(value = "0", message = "가격은 0 이상이어야 합니다")
    BigDecimal price,
    
    @Size(max = 500, message = "설명은 500자 이하여야 합니다")
    String description,
    
    @Size(max = 500, message = "이미지 URL은 500자 이하여야 합니다")
    String imageUrl,
    
    Integer displayOrder
) {}
