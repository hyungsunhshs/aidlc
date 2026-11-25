package com.tableorder.application.dto.menu;

import com.tableorder.domain.model.Menu;

import java.math.BigDecimal;
import java.util.List;

public record MenuResponse(
    Long id,
    String name,
    BigDecimal price,
    String description,
    String imageUrl,
    Integer displayOrder,
    boolean isAvailable
) {
    public static MenuResponse from(Menu menu) {
        return new MenuResponse(
            menu.getId(),
            menu.getName(),
            menu.getPrice(),
            menu.getDescription(),
            menu.getImageUrl(),
            menu.getDisplayOrder(),
            menu.isAvailable()
        );
    }
    
    public static List<MenuResponse> fromList(List<Menu> menus) {
        return menus.stream()
            .map(MenuResponse::from)
            .toList();
    }
}
