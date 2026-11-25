package com.tableorder.application.usecase;

import com.tableorder.application.dto.session.StartSessionRequest;
import com.tableorder.application.dto.session.StartSessionResponse;
import com.tableorder.common.exception.BusinessException;
import com.tableorder.common.exception.ErrorCode;
import com.tableorder.common.security.JwtTokenProvider;
import com.tableorder.domain.model.SessionStatus;
import com.tableorder.domain.model.StoreTable;
import com.tableorder.domain.model.TableSession;
import com.tableorder.domain.repository.TableRepository;
import com.tableorder.domain.repository.TableSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SessionUseCase {
    
    private final TableRepository tableRepository;
    private final TableSessionRepository sessionRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    
    @Transactional
    public StartSessionResponse startSession(StartSessionRequest request) {
        // 테이블 조회
        StoreTable table = tableRepository.findByStoreIdentifierAndTableNumber(
                request.storeIdentifier(), request.tableNumber())
            .orElseThrow(() -> new BusinessException(ErrorCode.TABLE_NOT_FOUND));
        
        // 테이블 활성 상태 확인
        if (!table.isActive()) {
            throw new BusinessException(ErrorCode.TABLE_NOT_ACTIVE);
        }
        
        // 비밀번호 검증
        if (!passwordEncoder.matches(request.password(), table.getPasswordHash())) {
            throw new BusinessException(ErrorCode.INVALID_PASSWORD);
        }
        
        // 기존 활성 세션 조회
        TableSession session = sessionRepository.findByTableIdAndStatus(table.getId(), SessionStatus.ACTIVE)
            .orElseGet(() -> {
                // 새 세션 생성
                TableSession newSession = TableSession.builder()
                    .table(table)
                    .build();
                return sessionRepository.save(newSession);
            });
        
        // 세션 토큰 생성
        String sessionToken = jwtTokenProvider.createSessionToken(session);
        
        log.info("Session started: sessionId={}, tableId={}, storeId={}", 
            session.getId(), table.getId(), table.getStore().getId());
        
        return StartSessionResponse.of(session, sessionToken);
    }
    
    public TableSession getActiveSession(Long sessionId) {
        TableSession session = sessionRepository.findByIdWithTable(sessionId)
            .orElseThrow(() -> new BusinessException(ErrorCode.SESSION_NOT_FOUND));
        
        if (!session.isActive()) {
            throw new BusinessException(ErrorCode.SESSION_NOT_ACTIVE);
        }
        
        return session;
    }
}
