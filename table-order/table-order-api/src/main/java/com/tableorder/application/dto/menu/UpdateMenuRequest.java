package com.tableorder.application.dto.menu;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record UpdateMenuRequest(
    @Size(max = 100, message = "메뉴명은 100자 이하여야 합니다")
    String name,
    
    @DecimalMin(value = "0", message = "가격은 0 이상이어야 합니다")
    BigDecimal price,
    
    @Size(max = 500, message = "설명은 500자 이하여야 합니다")
    String description,
    
    @Size(max = 500, message = "이미지 URL은 500자 이하여야 합니다")
    String imageUrl,
    
    Integer displayOrder,
    
    Boolean isAvailable
) {}
