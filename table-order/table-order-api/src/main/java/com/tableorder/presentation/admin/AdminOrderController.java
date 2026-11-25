package com.tableorder.presentation.admin;

import com.tableorder.application.dto.order.OrderDetailResponse;
import com.tableorder.application.dto.order.UpdateOrderStatusRequest;
import com.tableorder.application.usecase.OrderUseCase;
import com.tableorder.common.security.AdminAuthentication;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Admin - Order", description = "관리자 주문 관리 API")
@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@SecurityRequirement(name = "adminToken")
public class AdminOrderController {
    
    private final OrderUseCase orderUseCase;
    
    @Operation(summary = "전체 주문 조회", description = "매장의 모든 주문을 조회합니다")
    @GetMapping
    public ResponseEntity<List<OrderDetailResponse>> getAllOrders(
        @AuthenticationPrincipal AdminAuthentication auth
    ) {
        List<OrderDetailResponse> orders = orderUseCase.getOrdersByStore(auth.getStoreId());
        return ResponseEntity.ok(orders);
    }
    
    @Operation(summary = "활성 주문 조회", description = "대기/준비중 상태의 주문만 조회합니다")
    @GetMapping("/active")
    public ResponseEntity<List<OrderDetailResponse>> getActiveOrders(
        @AuthenticationPrincipal AdminAuthentication auth
    ) {
        List<OrderDetailResponse> orders = orderUseCase.getActiveOrdersByStore(auth.getStoreId());
        return ResponseEntity.ok(orders);
    }
    
    @Operation(summary = "주문 상세 조회", description = "주문의 상세 정보를 조회합니다")
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDetailResponse> getOrderDetail(
        @AuthenticationPrincipal AdminAuthentication auth,
        @PathVariable Long orderId
    ) {
        OrderDetailResponse order = orderUseCase.getOrderDetail(orderId, auth.getStoreId());
        return ResponseEntity.ok(order);
    }
    
    @Operation(summary = "주문 상태 변경", description = "주문 상태를 변경합니다 (PENDING → PREPARING → COMPLETED)")
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderDetailResponse> updateOrderStatus(
        @AuthenticationPrincipal AdminAuthentication auth,
        @PathVariable Long orderId,
        @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        OrderDetailResponse order = orderUseCase.updateOrderStatus(
            orderId, request.status(), auth.getStoreId());
        return ResponseEntity.ok(order);
    }
    
    @Operation(summary = "주문 삭제", description = "주문을 삭제합니다 (관리자 직권)")
    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> deleteOrder(
        @AuthenticationPrincipal AdminAuthentication auth,
        @PathVariable Long orderId
    ) {
        orderUseCase.deleteOrder(orderId, auth.getStoreId());
        return ResponseEntity.noContent().build();
    }
}
