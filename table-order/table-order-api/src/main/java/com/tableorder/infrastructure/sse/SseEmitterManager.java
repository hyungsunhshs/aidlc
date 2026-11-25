package com.tableorder.infrastructure.sse;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@Component
public class SseEmitterManager {
    
    private static final Long SSE_TIMEOUT = 30 * 60 * 1000L; // 30분
    
    // storeId -> List<SseEmitter>
    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();
    
    public SseEmitter createEmitter(Long storeId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);
        
        emitters.computeIfAbsent(storeId, k -> new CopyOnWriteArrayList<>())
            .add(emitter);
        
        emitter.onCompletion(() -> removeEmitter(storeId, emitter));
        emitter.onTimeout(() -> {
            log.debug("SSE timeout: storeId={}", storeId);
            removeEmitter(storeId, emitter);
        });
        emitter.onError(e -> {
            log.debug("SSE error: storeId={}, error={}", storeId, e.getMessage());
            removeEmitter(storeId, emitter);
        });
        
        // 초기 연결 확인 이벤트
        sendEvent(emitter, "connect", Map.of("message", "connected"));
        
        log.info("SSE emitter created: storeId={}, totalEmitters={}", 
            storeId, emitters.getOrDefault(storeId, List.of()).size());
        
        return emitter;
    }
    
    public void broadcast(Long storeId, String eventName, Object data) {
        List<SseEmitter> storeEmitters = emitters.get(storeId);
        if (storeEmitters == null || storeEmitters.isEmpty()) {
            log.debug("No SSE emitters for store: storeId={}", storeId);
            return;
        }
        
        List<SseEmitter> deadEmitters = new ArrayList<>();
        
        for (SseEmitter emitter : storeEmitters) {
            try {
                sendEvent(emitter, eventName, data);
            } catch (Exception e) {
                deadEmitters.add(emitter);
                log.debug("Failed to send SSE event: storeId={}, event={}", storeId, eventName);
            }
        }
        
        storeEmitters.removeAll(deadEmitters);
        
        log.debug("SSE broadcast: storeId={}, event={}, recipients={}, failed={}", 
            storeId, eventName, storeEmitters.size(), deadEmitters.size());
    }
    
    public void broadcastToAll(String eventName, Object data) {
        for (Map.Entry<Long, List<SseEmitter>> entry : emitters.entrySet()) {
            List<SseEmitter> storeEmitters = entry.getValue();
            List<SseEmitter> deadEmitters = new ArrayList<>();
            
            for (SseEmitter emitter : storeEmitters) {
                try {
                    sendEvent(emitter, eventName, data);
                } catch (Exception e) {
                    deadEmitters.add(emitter);
                }
            }
            
            storeEmitters.removeAll(deadEmitters);
        }
    }
    
    private void sendEvent(SseEmitter emitter, String eventName, Object data) {
        try {
            emitter.send(SseEmitter.event()
                .name(eventName)
                .data(data));
        } catch (IOException e) {
            throw new RuntimeException("SSE send failed", e);
        }
    }
    
    private void removeEmitter(Long storeId, SseEmitter emitter) {
        List<SseEmitter> storeEmitters = emitters.get(storeId);
        if (storeEmitters != null) {
            storeEmitters.remove(emitter);
            log.debug("SSE emitter removed: storeId={}, remaining={}", storeId, storeEmitters.size());
        }
    }
}
