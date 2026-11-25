package com.tableorder.application.dto.menu;

import com.tableorder.domain.model.Menu;

import java.math.BigDecimal;

public record MenuDetailResponse(
    Long id,
    Long categoryId,
    String categoryName,
    String name,
    BigDecimal price,
    String description,
    String imageUrl,
    Integer displayOrder,
    boolean isAvailable
) {
    public static MenuDetailResponse from(Menu menu) {
        return new MenuDetailResponse(
            menu.getId(),
            menu.getCategory().getId(),
            menu.getCategory().getName(),
            menu.getName(),
            menu.getPrice(),
            menu.getDescription(),
            menu.getImageUrl(),
            menu.getDisplayOrder(),
            menu.isAvailable()
        );
    }
}
