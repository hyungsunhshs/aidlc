package com.tableorder.presentation.customer;

import com.tableorder.application.dto.order.CreateOrderRequest;
import com.tableorder.application.dto.order.CreateOrderResponse;
import com.tableorder.application.dto.order.OrderResponse;
import com.tableorder.application.usecase.OrderUseCase;
import com.tableorder.common.security.SessionAuthentication;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Customer - Order", description = "고객 주문 API")
@RestController
@RequestMapping("/api/customer/orders")
@RequiredArgsConstructor
@SecurityRequirement(name = "sessionToken")
public class CustomerOrderController {
    
    private final OrderUseCase orderUseCase;
    
    @Operation(summary = "주문 생성", description = "장바구니 메뉴를 주문합니다")
    @PostMapping
    public ResponseEntity<CreateOrderResponse> createOrder(
        @AuthenticationPrincipal SessionAuthentication auth,
        @Valid @RequestBody CreateOrderRequest request
    ) {
        CreateOrderResponse response = orderUseCase.createOrder(auth.getSessionId(), request);
        return ResponseEntity.ok(response);
    }
    
    @Operation(summary = "내 주문 목록 조회", description = "현재 세션의 주문 내역을 조회합니다")
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getMyOrders(
        @AuthenticationPrincipal SessionAuthentication auth
    ) {
        List<OrderResponse> orders = orderUseCase.getOrdersBySession(auth.getSessionId());
        return ResponseEntity.ok(orders);
    }
}
