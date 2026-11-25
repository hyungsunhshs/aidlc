package com.tableorder.application.dto.menu;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record UpdateMenuDisplayOrderRequest(
    @NotEmpty(message = "메뉴 순서 목록은 필수입니다")
    List<MenuDisplayOrder> menus
) {
    public record MenuDisplayOrder(
        Long menuId,
        Integer displayOrder
    ) {}
}
