package com.tableorder.presentation.customer;

import com.tableorder.application.dto.session.StartSessionRequest;
import com.tableorder.application.dto.session.StartSessionResponse;
import com.tableorder.application.usecase.SessionUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Customer - Session", description = "고객 세션 API")
@RestController
@RequestMapping("/api/customer/sessions")
@RequiredArgsConstructor
public class CustomerSessionController {
    
    private final SessionUseCase sessionUseCase;
    
    @Operation(summary = "세션 시작", description = "테이블 비밀번호를 입력하여 주문 세션을 시작합니다")
    @PostMapping
    public ResponseEntity<StartSessionResponse> startSession(
        @Valid @RequestBody StartSessionRequest request
    ) {
        StartSessionResponse response = sessionUseCase.startSession(request);
        return ResponseEntity.ok(response);
    }
}
