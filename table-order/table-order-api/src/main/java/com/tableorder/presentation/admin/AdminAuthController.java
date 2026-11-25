package com.tableorder.presentation.admin;

import com.tableorder.application.dto.admin.AdminLoginRequest;
import com.tableorder.application.dto.admin.AdminLoginResponse;
import com.tableorder.application.usecase.AdminAuthUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Admin - Auth", description = "관리자 인증 API")
@RestController
@RequestMapping("/api/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {
    
    private final AdminAuthUseCase adminAuthUseCase;
    
    @Operation(summary = "관리자 로그인", description = "매장 식별자, 사용자명, 비밀번호로 로그인합니다")
    @PostMapping("/login")
    public ResponseEntity<AdminLoginResponse> login(
        @Valid @RequestBody AdminLoginRequest request
    ) {
        AdminLoginResponse response = adminAuthUseCase.login(request);
        return ResponseEntity.ok(response);
    }
}
