package com.tableorder.infrastructure.scheduler;

import com.tableorder.domain.model.SessionStatus;
import com.tableorder.domain.model.TableSession;
import com.tableorder.domain.repository.TableSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class SessionExpiryScheduler {
    
    private final TableSessionRepository sessionRepository;
    
    @Scheduled(fixedRate = 300000) // 5분마다
    @Transactional
    public void expireSessions() {
        LocalDateTime threshold = LocalDateTime.now().minusHours(16);
        
        List<TableSession> expiredSessions = sessionRepository
            .findByStatusAndStartedAtBefore(SessionStatus.ACTIVE, threshold);
        
        for (TableSession session : expiredSessions) {
            session.expire();
            log.info("Session expired: sessionId={}, tableId={}", 
                session.getId(), session.getTable().getId());
        }
        
        if (!expiredSessions.isEmpty()) {
            log.info("Expired {} sessions", expiredSessions.size());
        }
    }
}
