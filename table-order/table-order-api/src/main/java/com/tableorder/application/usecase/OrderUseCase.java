package com.tableorder.application.usecase;

import com.tableorder.application.dto.order.*;
import com.tableorder.common.exception.BusinessException;
import com.tableorder.common.exception.ErrorCode;
import com.tableorder.domain.model.*;
import com.tableorder.domain.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderUseCase {
    
    private final OrderRepository orderRepository;
    private final MenuRepository menuRepository;
    private final TableSessionRepository sessionRepository;
    private final DailyOrderSequenceRepository sequenceRepository;
    private final OrderNotificationUseCase notificationUseCase;
    
    @Transactional
    public CreateOrderResponse createOrder(Long sessionId, CreateOrderRequest request) {
        // 세션 조회 및 검증
        TableSession session = sessionRepository.findByIdWithTable(sessionId)
            .orElseThrow(() -> new BusinessException(ErrorCode.SESSION_NOT_FOUND));
        
        if (!session.isActive()) {
            throw new BusinessException(ErrorCode.SESSION_NOT_ACTIVE);
        }
        
        Long storeId = session.getTable().getStore().getId();
        
        // 주문 번호 생성
        String orderNumber = generateOrderNumber(storeId);
        
        // 주문 생성
        Order order = Order.builder()
            .session(session)
            .orderNumber(orderNumber)
            .build();
        
        // 주문 항목 생성
        for (OrderItemRequest itemRequest : request.items()) {
            Menu menu = menuRepository.findById(itemRequest.menuId())
                .orElseThrow(() -> new BusinessException(ErrorCode.MENU_NOT_FOUND));
            
            if (!menu.canBeOrdered()) {
                throw new BusinessException(ErrorCode.MENU_NOT_AVAILABLE, 
                    "주문할 수 없는 메뉴입니다: " + menu.getName());
            }
            
            OrderItem item = OrderItem.createFromMenu(menu, itemRequest.quantity());
            order.addItem(item);
        }
        
        // 총액 계산
        order.calculateTotalAmount();
        
        // 주문 저장
        order = orderRepository.save(order);
        
        // 세션 총액 갱신
        session.addToTotalAmount(order.getTotalAmount());
        
        log.info("Order created: orderId={}, orderNumber={}, sessionId={}, totalAmount={}", 
            order.getId(), orderNumber, sessionId, order.getTotalAmount());
        
        // SSE 알림
        notificationUseCase.notifyNewOrder(order, storeId);
        
        return CreateOrderResponse.from(order);
    }
    
    public List<OrderResponse> getOrdersBySession(Long sessionId) {
        List<Order> orders = orderRepository.findBySessionIdWithItems(sessionId);
        return OrderResponse.fromList(orders);
    }
    
    public List<OrderDetailResponse> getOrdersByStore(Long storeId) {
        List<Order> orders = orderRepository.findByStoreIdWithSessionAndTable(storeId);
        return orders.stream()
            .map(OrderDetailResponse::from)
            .toList();
    }
    
    public List<OrderDetailResponse> getActiveOrdersByStore(Long storeId) {
        List<Order> orders = orderRepository.findByStoreIdAndStatusIn(
            storeId, List.of(OrderStatus.PENDING, OrderStatus.PREPARING));
        return orders.stream()
            .map(OrderDetailResponse::from)
            .toList();
    }
    
    public OrderDetailResponse getOrderDetail(Long orderId, Long storeId) {
        Order order = orderRepository.findByIdWithItemsAndSession(orderId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));
        
        validateStoreAccess(order.getSession().getTable().getStore().getId(), storeId);
        
        return OrderDetailResponse.from(order);
    }
    
    @Transactional
    public OrderDetailResponse updateOrderStatus(Long orderId, OrderStatus newStatus, Long storeId) {
        Order order = orderRepository.findByIdWithItemsAndSession(orderId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));
        
        Long orderStoreId = order.getSession().getTable().getStore().getId();
        validateStoreAccess(orderStoreId, storeId);
        
        try {
            order.updateStatus(newStatus);
        } catch (IllegalStateException e) {
            throw new BusinessException(ErrorCode.INVALID_ORDER_STATUS_TRANSITION, e.getMessage());
        }
        
        log.info("Order status updated: orderId={}, newStatus={}", orderId, newStatus);
        
        // SSE 알림
        notificationUseCase.notifyOrderStatusChanged(order, orderStoreId);
        
        return OrderDetailResponse.from(order);
    }
    
    @Transactional
    public void deleteOrder(Long orderId, Long storeId) {
        Order order = orderRepository.findByIdWithItemsAndSession(orderId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));
        
        Long orderStoreId = order.getSession().getTable().getStore().getId();
        validateStoreAccess(orderStoreId, storeId);
        
        // 세션 총액에서 차감
        TableSession session = order.getSession();
        session.subtractFromTotalAmount(order.getTotalAmount());
        
        orderRepository.delete(order);
        
        log.info("Order deleted: orderId={}", orderId);
        
        // SSE 알림
        notificationUseCase.notifyOrderDeleted(orderId, orderStoreId);
    }
    
    public TodayOrderStats getTodayOrderStats(Long storeId, LocalDateTime start, LocalDateTime end) {
        List<Order> todayOrders = orderRepository.findByStoreIdAndCreatedAtBetween(storeId, start, end);
        
        long pendingCount = todayOrders.stream()
            .filter(o -> o.getStatus() == OrderStatus.PENDING)
            .count();
        
        long preparingCount = todayOrders.stream()
            .filter(o -> o.getStatus() == OrderStatus.PREPARING)
            .count();
        
        BigDecimal totalRevenue = todayOrders.stream()
            .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
            .map(Order::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return new TodayOrderStats(pendingCount, preparingCount, todayOrders.size(), totalRevenue);
    }
    
    public record TodayOrderStats(long pendingCount, long preparingCount, long totalCount, BigDecimal totalRevenue) {}
    
    private String generateOrderNumber(Long storeId) {
        LocalDate today = LocalDate.now();
        
        DailyOrderSequence sequence = sequenceRepository
            .findByStoreIdAndDateWithLock(storeId, today)
            .orElseGet(() -> sequenceRepository.save(new DailyOrderSequence(storeId, today)));
        
        int nextSequence = sequence.getNextSequence();
        
        return String.format("%s-%03d", 
            today.format(DateTimeFormatter.BASIC_ISO_DATE), 
            nextSequence);
    }
    
    private void validateStoreAccess(Long resourceStoreId, Long requestStoreId) {
        if (!resourceStoreId.equals(requestStoreId)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
    }
}
