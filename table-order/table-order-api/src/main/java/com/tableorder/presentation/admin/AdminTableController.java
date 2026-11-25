package com.tableorder.presentation.admin;

import com.tableorder.application.dto.table.*;
import com.tableorder.application.usecase.TableUseCase;
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

@Tag(name = "Admin - Table", description = "관리자 테이블 관리 API")
@RestController
@RequestMapping("/api/admin/tables")
@RequiredArgsConstructor
@SecurityRequirement(name = "adminToken")
public class AdminTableController {
    
    private final TableUseCase tableUseCase;
    
    @Operation(summary = "테이블 목록 조회", description = "매장의 테이블 목록을 조회합니다")
    @GetMapping
    public ResponseEntity<List<TableResponse>> getTables(
        @AuthenticationPrincipal AdminAuthentication auth
    ) {
        List<TableResponse> tables = tableUseCase.getTables(auth.getStoreId());
        return ResponseEntity.ok(tables);
    }
    
    @Operation(summary = "테이블 목록 조회 (세션 포함)", description = "매장의 테이블 목록을 활성 세션 정보와 함께 조회합니다")
    @GetMapping("/with-sessions")
    public ResponseEntity<List<TableDetailResponse>> getTablesWithSessions(
        @AuthenticationPrincipal AdminAuthentication auth
    ) {
        List<TableDetailResponse> tables = tableUseCase.getTablesWithSession(auth.getStoreId());
        return ResponseEntity.ok(tables);
    }
    
    @Operation(summary = "테이블 등록", description = "새 테이블을 등록합니다")
    @PostMapping
    public ResponseEntity<TableResponse> createTable(
        @AuthenticationPrincipal AdminAuthentication auth,
        @Valid @RequestBody CreateTableRequest request
    ) {
        TableResponse table = tableUseCase.createTable(auth.getStoreId(), request);
        return ResponseEntity.created(URI.create("/api/admin/tables/" + table.id())).body(table);
    }
    
    @Operation(summary = "테이블 수정", description = "테이블 정보를 수정합니다")
    @PutMapping("/{tableId}")
    public ResponseEntity<TableResponse> updateTable(
        @AuthenticationPrincipal AdminAuthentication auth,
        @PathVariable Long tableId,
        @Valid @RequestBody UpdateTableRequest request
    ) {
        TableResponse table = tableUseCase.updateTable(tableId, request, auth.getStoreId());
        return ResponseEntity.ok(table);
    }
    
    @Operation(summary = "테이블 삭제", description = "테이블을 삭제합니다")
    @DeleteMapping("/{tableId}")
    public ResponseEntity<Void> deleteTable(
        @AuthenticationPrincipal AdminAuthentication auth,
        @PathVariable Long tableId
    ) {
        tableUseCase.deleteTable(tableId, auth.getStoreId());
        return ResponseEntity.noContent().build();
    }
    
    @Operation(summary = "이용 완료 처리", description = "테이블의 활성 세션을 완료 처리합니다")
    @PostMapping("/{tableId}/complete")
    public ResponseEntity<Void> completeSession(
        @AuthenticationPrincipal AdminAuthentication auth,
        @PathVariable Long tableId
    ) {
        tableUseCase.completeSession(tableId, auth.getStoreId());
        return ResponseEntity.ok().build();
    }
    
    @Operation(summary = "주문 이력 조회", description = "테이블의 과거 주문 이력을 조회합니다")
    @GetMapping("/{tableId}/history")
    public ResponseEntity<List<OrderHistoryResponse>> getOrderHistory(
        @AuthenticationPrincipal AdminAuthentication auth,
        @PathVariable Long tableId
    ) {
        List<OrderHistoryResponse> histories = tableUseCase.getOrderHistory(tableId, auth.getStoreId());
        return ResponseEntity.ok(histories);
    }
}
