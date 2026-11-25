package com.tableorder.presentation.admin;

import com.tableorder.application.dto.table.TableDetailResponse;
import com.tableorder.application.usecase.OrderUseCase;
import com.tableorder.application.usecase.TableUseCase;
import com.tableorder.common.security.AdminAuthentication;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Tag(name = "Admin - Dashboard", description = "관리자 대시보드 API")
@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@SecurityRequirement(name = "adminToken")
public class AdminDashboardController {
    
    private final TableUseCase tableUseCase;
    private final OrderUseCase orderUseCase;
    
    @Operation(summary = "대시보드 요약", description = "대시보드 요약 정보를 조회합니다")
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary(
        @AuthenticationPrincipal AdminAuthentication auth
    ) {
        List<TableDetailResponse> tables = tableUseCase.getTablesWithSession(auth.getStoreId());
        
        long activeTables = tables.stream().filter(t -> t.activeSession() != null).count();
        long totalTables = tables.size();
        
        // 오늘 주문 통계 계산
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd = LocalDate.now().atTime(LocalTime.MAX);
        
        var todayStats = orderUseCase.getTodayOrderStats(auth.getStoreId(), todayStart, todayEnd);
        
        Map<String, Object> summary = Map.of(
            "totalTables", totalTables,
            "activeTables", activeTables,
            "availableTables", totalTables - activeTables,
            "pendingOrders", todayStats.pendingCount(),
            "preparingOrders", todayStats.preparingCount(),
            "todayOrderCount", todayStats.totalCount(),
            "todayRevenue", todayStats.totalRevenue()
        );
        
        return ResponseEntity.ok(summary);
    }
    
    @Operation(summary = "대시보드 테이블 조회", description = "테이블별 세션 정보가 포함된 대시보드 데이터를 조회합니다")
    @GetMapping("/tables")
    public ResponseEntity<List<TableWithOrdersResponse>> getTablesWithOrders(
        @AuthenticationPrincipal AdminAuthentication auth
    ) {
        List<TableDetailResponse> tables = tableUseCase.getTablesWithSession(auth.getStoreId());
        
        List<TableWithOrdersResponse> result = tables.stream()
            .map(table -> {
                var activeSession = table.activeSession();
                return new TableWithOrdersResponse(
                    table.id(),
                    table.tableNumber(),
                    activeSession != null ? activeSession.sessionId() : null,
                    table.isActive() ? java.time.LocalDateTime.now().toString() : null,
                    activeSession != null ? activeSession.totalAmount() : BigDecimal.ZERO,
                    activeSession != null ? 1 : 0, // orderCount approximation
                    activeSession != null ? activeSession.startedAt().toString() : null,
                    false
                );
            })
            .toList();
        
        return ResponseEntity.ok(result);
    }
    
    public record TableWithOrdersResponse(
        Long id,
        String tableNumber,
        Long currentSessionId,
        String createdAt,
        BigDecimal totalOrderAmount,
        int orderCount,
        String latestOrderTime,
        boolean hasNewOrder
    ) {}
}
