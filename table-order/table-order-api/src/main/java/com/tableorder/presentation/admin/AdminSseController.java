package com.tableorder.presentation.admin;

import com.tableorder.common.security.AdminAuthentication;
import com.tableorder.infrastructure.sse.SseEmitterManager;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Tag(name = "Admin - SSE", description = "관리자 실시간 알림 API")
@RestController
@RequestMapping("/api/admin/sse")
@RequiredArgsConstructor
@SecurityRequirement(name = "adminToken")
public class AdminSseController {
    
    private final SseEmitterManager sseEmitterManager;
    
    @Operation(summary = "주문 알림 구독", description = "실시간 주문 알림을 SSE로 구독합니다")
    @GetMapping(value = "/orders", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribeOrders(
        @AuthenticationPrincipal AdminAuthentication auth
    ) {
        return sseEmitterManager.createEmitter(auth.getStoreId());
    }
}
