package com.tableorder.application.usecase;

import com.tableorder.application.dto.admin.CreateAdminRequest;
import com.tableorder.application.dto.store.CreateStoreRequest;
import com.tableorder.application.dto.store.StoreResponse;
import com.tableorder.application.dto.store.UpdateStoreRequest;
import com.tableorder.common.exception.BusinessException;
import com.tableorder.common.exception.ErrorCode;
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
public class StoreUseCase {
    
    private final StoreRepository storeRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Transactional
    public StoreResponse createStore(CreateStoreRequest request) {
        // 식별자 중복 체크
        if (storeRepository.existsByIdentifier(request.identifier())) {
            throw new BusinessException(ErrorCode.DUPLICATE_STORE_IDENTIFIER);
        }
        
        // 매장 생성
        Store store = Store.builder()
            .name(request.name())
            .identifier(request.identifier())
            .build();
        
        store = storeRepository.save(store);
        
        // 초기 관리자 계정 생성
        Admin admin = Admin.builder()
            .store(store)
            .username(request.adminUsername())
            .passwordHash(passwordEncoder.encode(request.adminPassword()))
            .build();
        
        adminRepository.save(admin);
        
        log.info("Store created: storeId={}, identifier={}, adminUsername={}", 
            store.getId(), request.identifier(), request.adminUsername());
        
        return StoreResponse.from(store);
    }
    
    @Transactional
    public StoreResponse updateStore(Long storeId, UpdateStoreRequest request) {
        Store store = storeRepository.findById(storeId)
            .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND));
        
        store.update(request.name());
        log.info("Store updated: storeId={}", storeId);
        
        return StoreResponse.from(store);
    }
    
    public StoreResponse getStore(Long storeId) {
        Store store = storeRepository.findById(storeId)
            .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND));
        
        return StoreResponse.from(store);
    }
    
    public Store findByIdentifier(String identifier) {
        return storeRepository.findByIdentifier(identifier)
            .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND));
    }
}
