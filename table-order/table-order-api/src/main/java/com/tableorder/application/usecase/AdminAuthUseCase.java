package com.tableorder.application.usecase;

import com.tableorder.application.dto.admin.AdminLoginRequest;
import com.tableorder.application.dto.admin.AdminLoginResponse;
import com.tableorder.application.dto.admin.CreateAdminRequest;
import com.tableorder.common.exception.BusinessException;
import com.tableorder.common.exception.ErrorCode;
import com.tableorder.common.security.JwtTokenProvider;
import com.tableorder.domain.model.Admin;
import com.tableorder.domain.model.Store;
import com.tableorder.domain.repository.AdminRepository;
import com.tableorder.domain.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminAuthUseCase {
    
    private final AdminRepository adminRepository;
    private final StoreRepository storeRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    
    @Transactional
    public AdminLoginResponse login(AdminLoginRequest request) {
        // 매장 조회
        Store store = storeRepository.findByIdentifier(request.storeIdentifier())
            .orElseThrow(() -> {
                log.warn("Login failed - store not found: storeIdentifier={}", request.storeIdentifier());
                return new BusinessException(ErrorCode.ADMIN_NOT_FOUND);
            });
        
        // 관리자 조회
        Admin admin = adminRepository.findByStoreIdAndUsername(store.getId(), request.username())
            .orElseThrow(() -> {
                log.warn("Login failed - admin not found: storeId={}, username={}", 
                    store.getId(), request.username());
                return new BusinessException(ErrorCode.ADMIN_NOT_FOUND);
            });
        
        // 계정 잠금 확인
        if (admin.isLocked()) {
            log.warn("Login failed - account locked: adminId={}", admin.getId());
            throw new BusinessException(ErrorCode.ACCOUNT_LOCKED);
        }
        
        // 비밀번호 검증
        if (!passwordEncoder.matches(request.password(), admin.getPasswordHash())) {
            admin.recordLoginFailure();
            log.warn("Login failed - invalid password: adminId={}, failedAttempts={}", 
                admin.getId(), admin.getFailedLoginAttempts());
            throw new BusinessException(ErrorCode.INVALID_PASSWORD);
        }
        
        // 로그인 성공 처리
        admin.recordLoginSuccess();
        
        // JWT 토큰 생성
        String token = jwtTokenProvider.createAdminToken(admin);
        
        log.info("Admin login success: adminId={}, storeId={}", admin.getId(), store.getId());
        
        return AdminLoginResponse.of(token, admin, store);
    }
    
    @Transactional
    public void createAdmin(Long storeId, CreateAdminRequest request) {
        Store store = storeRepository.findById(storeId)
            .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND));
        
        // 사용자명 중복 체크
        if (adminRepository.existsByStoreIdAndUsername(storeId, request.username())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "이미 존재하는 사용자명입니다");
        }
        
        Admin admin = Admin.builder()
            .store(store)
            .username(request.username())
            .passwordHash(passwordEncoder.encode(request.password()))
            .build();
        
        adminRepository.save(admin);
        log.info("Admin created: storeId={}, username={}", storeId, request.username());
    }
}
