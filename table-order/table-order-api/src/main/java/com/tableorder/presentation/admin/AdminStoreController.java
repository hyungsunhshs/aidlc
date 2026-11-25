package com.tableorder.presentation.admin;

import com.tableorder.application.dto.store.CreateStoreRequest;
import com.tableorder.application.dto.store.StoreResponse;
import com.tableorder.application.dto.store.UpdateStoreRequest;
import com.tableorder.application.usecase.StoreUseCase;
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

@Tag(name = "Admin - Store", description = "관리자 매장 관리 API")
@RestController
@RequestMapping("/api/admin/stores")
@RequiredArgsConstructor
public class AdminStoreController {
    
    private final StoreUseCase storeUseCase;
    
    @Operation(summary = "매장 등록", description = "새 매장을 등록합니다 (초기 관리자 계정 포함)")
    @PostMapping
    public ResponseEntity<StoreResponse> createStore(
        @Valid @RequestBody CreateStoreRequest request
    ) {
        StoreResponse store = storeUseCase.createStore(request);
        return ResponseEntity.created(URI.create("/api/admin/stores/" + store.id())).body(store);
    }
    
    @Operation(summary = "매장 정보 조회", description = "매장 정보를 조회합니다")
    @GetMapping("/{storeId}")
    @SecurityRequirement(name = "adminToken")
    public ResponseEntity<StoreResponse> getStore(
        @AuthenticationPrincipal AdminAuthentication auth,
        @PathVariable Long storeId
    ) {
        // 본인 매장만 조회 가능
        if (!auth.getStoreId().equals(storeId)) {
            return ResponseEntity.status(403).build();
        }
        
        StoreResponse store = storeUseCase.getStore(storeId);
        return ResponseEntity.ok(store);
    }
    
    @Operation(summary = "매장 정보 수정", description = "매장 정보를 수정합니다")
    @PutMapping("/{storeId}")
    @SecurityRequirement(name = "adminToken")
    public ResponseEntity<StoreResponse> updateStore(
        @AuthenticationPrincipal AdminAuthentication auth,
        @PathVariable Long storeId,
        @Valid @RequestBody UpdateStoreRequest request
    ) {
        // 본인 매장만 수정 가능
        if (!auth.getStoreId().equals(storeId)) {
            return ResponseEntity.status(403).build();
        }
        
        StoreResponse store = storeUseCase.updateStore(storeId, request);
        return ResponseEntity.ok(store);
    }
}
