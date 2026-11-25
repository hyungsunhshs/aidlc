package com.tableorder.presentation.admin;

import com.tableorder.application.dto.menu.*;
import com.tableorder.application.usecase.MenuUseCase;
import com.tableorder.common.security.AdminAuthentication;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@Tag(name = "Admin - Menu", description = "관리자 메뉴 관리 API")
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@SecurityRequirement(name = "adminToken")
public class AdminMenuController {
    
    private final MenuUseCase menuUseCase;
    
    // === Category ===
    
    @Operation(summary = "카테고리 목록 조회", description = "매장의 카테고리 목록을 조회합니다")
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> getCategories(
        @AuthenticationPrincipal AdminAuthentication auth
    ) {
        List<CategoryResponse> categories = menuUseCase.getCategories(auth.getStoreId());
        return ResponseEntity.ok(categories);
    }
    
    @Operation(summary = "카테고리 등록", description = "새 카테고리를 등록합니다")
    @PostMapping("/categories")
    public ResponseEntity<CategoryResponse> createCategory(
        @AuthenticationPrincipal AdminAuthentication auth,
        @Valid @RequestBody CreateCategoryRequest request
    ) {
        CategoryResponse category = menuUseCase.createCategory(auth.getStoreId(), request);
        return ResponseEntity.created(URI.create("/api/admin/categories/" + category.id())).body(category);
    }
    
    @Operation(summary = "카테고리 수정", description = "카테고리 정보를 수정합니다")
    @PutMapping("/categories/{categoryId}")
    public ResponseEntity<CategoryResponse> updateCategory(
        @AuthenticationPrincipal AdminAuthentication auth,
        @PathVariable Long categoryId,
        @Valid @RequestBody UpdateCategoryRequest request
    ) {
        CategoryResponse category = menuUseCase.updateCategory(categoryId, request, auth.getStoreId());
        return ResponseEntity.ok(category);
    }
    
    @Operation(summary = "카테고리 삭제", description = "카테고리와 하위 메뉴를 삭제합니다 (Cascade)")
    @DeleteMapping("/categories/{categoryId}")
    public ResponseEntity<Void> deleteCategory(
        @AuthenticationPrincipal AdminAuthentication auth,
        @PathVariable Long categoryId
    ) {
        menuUseCase.deleteCategory(categoryId, auth.getStoreId());
        return ResponseEntity.noContent().build();
    }
    
    // === Menu ===
    
    @Operation(summary = "전체 메뉴 조회", description = "매장의 전체 메뉴를 조회합니다")
    @GetMapping("/menus")
    public ResponseEntity<List<MenuResponse>> getMenus(
        @AuthenticationPrincipal AdminAuthentication auth
    ) {
        List<MenuResponse> menus = menuUseCase.getMenusByStore(auth.getStoreId());
        return ResponseEntity.ok(menus);
    }
    
    @Operation(summary = "카테고리별 메뉴 조회", description = "카테고리의 메뉴 목록을 조회합니다 (삭제된 메뉴 제외)")
    @GetMapping("/categories/{categoryId}/menus")
    public ResponseEntity<List<MenuResponse>> getMenusByCategory(
        @PathVariable Long categoryId
    ) {
        List<MenuResponse> menus = menuUseCase.getMenusByCategory(categoryId);
        return ResponseEntity.ok(menus);
    }
    
    @Operation(summary = "메뉴 등록", description = "새 메뉴를 등록합니다")
    @PostMapping("/menus")
    public ResponseEntity<MenuResponse> createMenu(
        @AuthenticationPrincipal AdminAuthentication auth,
        @Valid @RequestBody CreateMenuRequest request
    ) {
        MenuResponse menu = menuUseCase.createMenu(auth.getStoreId(), request);
        return ResponseEntity.created(URI.create("/api/admin/menus/" + menu.id())).body(menu);
    }
    
    @Operation(summary = "메뉴 수정", description = "메뉴 정보를 수정합니다")
    @PutMapping("/menus/{menuId}")
    public ResponseEntity<MenuResponse> updateMenu(
        @AuthenticationPrincipal AdminAuthentication auth,
        @PathVariable Long menuId,
        @Valid @RequestBody UpdateMenuRequest request
    ) {
        MenuResponse menu = menuUseCase.updateMenu(menuId, request, auth.getStoreId());
        return ResponseEntity.ok(menu);
    }
    
    @Operation(summary = "메뉴 삭제", description = "메뉴를 삭제합니다 (Soft delete)")
    @DeleteMapping("/menus/{menuId}")
    public ResponseEntity<Void> deleteMenu(
        @AuthenticationPrincipal AdminAuthentication auth,
        @PathVariable Long menuId
    ) {
        menuUseCase.deleteMenu(menuId, auth.getStoreId());
        return ResponseEntity.noContent().build();
    }
    
    @Operation(summary = "메뉴 순서 변경", description = "메뉴의 표시 순서를 변경합니다")
    @PatchMapping("/menus/display-order")
    public ResponseEntity<Void> updateMenuDisplayOrder(
        @AuthenticationPrincipal AdminAuthentication auth,
        @Valid @RequestBody UpdateMenuDisplayOrderRequest request
    ) {
        menuUseCase.updateMenuDisplayOrder(request, auth.getStoreId());
        return ResponseEntity.ok().build();
    }
}
