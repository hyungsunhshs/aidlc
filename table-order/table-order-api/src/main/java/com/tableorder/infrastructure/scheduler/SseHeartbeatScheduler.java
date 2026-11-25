package com.tableorder.infrastructure.scheduler;

import com.tableorder.infrastructure.sse.SseEmitterManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class SseHeartbeatScheduler {
    
    private final SseEmitterManager sseEmitterManager;
    
    @Scheduled(fixedRate = 30000) // 30초마다
    public void sendHeartbeat() {
        sseEmitterManager.broadcastToAll("heartbeat", 
            Map.of("timestamp", Instant.now().toString()));
    }
}
