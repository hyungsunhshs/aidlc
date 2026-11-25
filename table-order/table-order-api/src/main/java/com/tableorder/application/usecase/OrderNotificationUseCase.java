package com.tableorder.application.usecase;

import com.tableorder.application.dto.sse.OrderDeletedEvent;
import com.tableorder.application.dto.sse.OrderEvent;
import com.tableorder.domain.model.Order;
import com.tableorder.infrastructure.sse.SseEmitterManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderNotificationUseCase {
    
    private final SseEmitterManager sseEmitterManager;
    
    public void notifyNewOrder(Order order, Long storeId) {
        OrderEvent event = OrderEvent.from(order);
        sseEmitterManager.broadcast(storeId, "NEW_ORDER", event);
        log.debug("SSE event sent: NEW_ORDER, storeId={}, orderId={}", storeId, order.getId());
    }
    
    public void notifyOrderStatusChanged(Order order, Long storeId) {
        OrderEvent event = OrderEvent.from(order);
        sseEmitterManager.broadcast(storeId, "ORDER_STATUS_CHANGED", event);
        log.debug("SSE event sent: ORDER_STATUS_CHANGED, storeId={}, orderId={}, status={}", 
            storeId, order.getId(), order.getStatus());
    }
    
    public void notifyOrderDeleted(Long orderId, Long storeId) {
        OrderDeletedEvent event = new OrderDeletedEvent(orderId);
        sseEmitterManager.broadcast(storeId, "ORDER_DELETED", event);
        log.debug("SSE event sent: ORDER_DELETED, storeId={}, orderId={}", storeId, orderId);
    }
}
