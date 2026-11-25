package com.tableorder.presentation.customer;

import com.tableorder.application.dto.menu.CategoryResponse;
import com.tableorder.application.dto.menu.MenuDetailResponse;
import com.tableorder.application.dto.menu.MenuResponse;
import com.tableorder.application.usecase.MenuUseCase;
import com.tableorder.common.security.SessionAuthentication;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Customer - Menu", description = "고객 메뉴 조회 API")
@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
@SecurityRequirement(name = "sessionToken")
public class CustomerMenuController {
    
    private final MenuUseCase menuUseCase;
    
    @Operation(summary = "카테고리 목록 조회", description = "매장의 카테고리 목록을 조회합니다")
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> getCategories(
        @AuthenticationPrincipal SessionAuthentication auth
    ) {
        List<CategoryResponse> categories = menuUseCase.getCategories(auth.getStoreId());
        return ResponseEntity.ok(categories);
    }
    
    @Operation(summary = "카테고리별 메뉴 조회", description = "카테고리의 주문 가능한 메뉴 목록을 조회합니다")
    @GetMapping("/categories/{categoryId}/menus")
    public ResponseEntity<List<MenuResponse>> getMenusByCategory(
        @PathVariable Long categoryId
    ) {
        List<MenuResponse> menus = menuUseCase.getAvailableMenusByCategory(categoryId);
        return ResponseEntity.ok(menus);
    }
    
    @Operation(summary = "메뉴 상세 조회", description = "메뉴의 상세 정보를 조회합니다")
    @GetMapping("/menus/{menuId}")
    public ResponseEntity<MenuDetailResponse> getMenuDetail(
        @PathVariable Long menuId
    ) {
        MenuDetailResponse menu = menuUseCase.getMenuDetail(menuId);
        return ResponseEntity.ok(menu);
    }
}
