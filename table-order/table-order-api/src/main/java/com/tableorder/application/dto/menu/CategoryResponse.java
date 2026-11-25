package com.tableorder.application.dto.menu;

import com.tableorder.domain.model.Category;

import java.util.List;

public record CategoryResponse(
    Long id,
    String name,
    Integer displayOrder
) {
    public static CategoryResponse from(Category category) {
        return new CategoryResponse(
            category.getId(),
            category.getName(),
            category.getDisplayOrder()
        );
    }
    
    public static List<CategoryResponse> fromList(List<Category> categories) {
        return categories.stream()
            .map(CategoryResponse::from)
            .toList();
    }
}
