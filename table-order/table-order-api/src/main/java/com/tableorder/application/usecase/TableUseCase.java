package com.tableorder.application.usecase;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tableorder.application.dto.table.*;
import com.tableorder.common.exception.BusinessException;
import com.tableorder.common.exception.ErrorCode;
import com.tableorder.domain.model.*;
import com.tableorder.domain.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TableUseCase {
    
    private final TableRepository tableRepository;
    private final TableSessionRepository sessionRepository;
    private final OrderHistoryRepository orderHistoryRepository;
    private final StoreRepository storeRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;
    
    public List<TableResponse> getTables(Long storeId) {
        List<StoreTable> tables = tableRepository.findByStoreIdOrderByTableNumber(storeId);
        return TableResponse.fromList(tables);
    }
    
    public List<TableDetailResponse> getTablesWithSession(Long storeId) {
        List<StoreTable> tables = tableRepository.findByStoreIdOrderByTableNumber(storeId);
        return tables.stream()
            .map(table -> {
                TableSession activeSession = sessionRepository
                    .findByTableIdAndStatus(table.getId(), SessionStatus.ACTIVE)
                    .orElse(null);
                return TableDetailResponse.from(table, activeSession);
            })
            .toList();
    }
    
    @Transactional
    public TableResponse createTable(Long storeId, CreateTableRequest request) {
        Store store = storeRepository.findById(storeId)
            .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND));
        
        // 테이블 번호 중복 체크
        if (tableRepository.existsByStoreIdAndTableNumber(storeId, request.tableNumber())) {
            throw new BusinessException(ErrorCode.DUPLICATE_TABLE_NUMBER);
        }
        
        StoreTable table = StoreTable.builder()
            .store(store)
            .tableNumber(request.tableNumber())
            .passwordHash(passwordEncoder.encode(request.password()))
            .build();
        
        table = tableRepository.save(table);
        log.info("Table created: tableId={}, storeId={}, tableNumber={}", 
            table.getId(), storeId, request.tableNumber());
        
        return TableResponse.from(table);
    }
    
    @Transactional
    public TableResponse updateTable(Long tableId, UpdateTableRequest request, Long storeId) {
        StoreTable table = tableRepository.findById(tableId)
            .orElseThrow(() -> new BusinessException(ErrorCode.TABLE_NOT_FOUND));
        
        validateStoreAccess(table.getStore().getId(), storeId);
        
        // 테이블 번호 변경 시 중복 체크
        if (request.tableNumber() != null && !request.tableNumber().equals(table.getTableNumber())) {
            if (tableRepository.existsByStoreIdAndTableNumber(storeId, request.tableNumber())) {
                throw new BusinessException(ErrorCode.DUPLICATE_TABLE_NUMBER);
            }
        }
        
        String passwordHash = request.password() != null ? 
            passwordEncoder.encode(request.password()) : null;
        
        table.update(request.tableNumber(), passwordHash);
        
        if (request.isActive() != null) {
            table.setActive(request.isActive());
        }
        
        log.info("Table updated: tableId={}", tableId);
        return TableResponse.from(table);
    }
    
    @Transactional
    public void deleteTable(Long tableId, Long storeId) {
        StoreTable table = tableRepository.findById(tableId)
            .orElseThrow(() -> new BusinessException(ErrorCode.TABLE_NOT_FOUND));
        
        validateStoreAccess(table.getStore().getId(), storeId);
        
        tableRepository.delete(table);
        log.info("Table deleted: tableId={}", tableId);
    }
    
    @Transactional
    public void completeSession(Long tableId, Long storeId) {
        StoreTable table = tableRepository.findById(tableId)
            .orElseThrow(() -> new BusinessException(ErrorCode.TABLE_NOT_FOUND));
        
        validateStoreAccess(table.getStore().getId(), storeId);
        
        TableSession session = sessionRepository.findByTableIdAndStatus(tableId, SessionStatus.ACTIVE)
            .orElseThrow(() -> new BusinessException(ErrorCode.NO_ACTIVE_SESSION));
        
        // 주문 이력 아카이빙
        archiveSession(table, session);
        
        // 세션 완료 처리
        session.complete();
        
        log.info("Session completed: sessionId={}, tableId={}", session.getId(), tableId);
    }
    
    private void archiveSession(StoreTable table, TableSession session) {
        try {
            // 세션의 주문 데이터를 JSON으로 직렬화
            TableSession sessionWithOrders = sessionRepository.findByIdWithOrdersAndItems(session.getId())
                .orElse(session);
            
            List<Map<String, Object>> ordersData = sessionWithOrders.getOrders().stream()
                .map(order -> Map.<String, Object>of(
                    "orderId", order.getId(),
                    "orderNumber", order.getOrderNumber(),
                    "status", order.getStatus().name(),
                    "totalAmount", order.getTotalAmount(),
                    "createdAt", order.getCreatedAt().toString(),
                    "items", order.getItems().stream()
                        .map(item -> Map.of(
                            "menuName", item.getMenuName(),
                            "unitPrice", item.getUnitPrice(),
                            "quantity", item.getQuantity()
                        ))
                        .toList()
                ))
                .toList();
            
            Map<String, Object> archiveData = Map.of(
                "sessionId", session.getId(),
                "tableNumber", table.getTableNumber(),
                "orders", ordersData,
                "totalAmount", session.getTotalAmount()
            );
            
            String orderDataJson = objectMapper.writeValueAsString(archiveData);
            
            OrderHistory history = OrderHistory.builder()
                .table(table)
                .sessionId(session.getId())
                .orderData(orderDataJson)
                .totalAmount(session.getTotalAmount())
                .startedAt(session.getStartedAt())
                .build();
            
            orderHistoryRepository.save(history);
            log.info("Session archived: sessionId={}", session.getId());
            
        } catch (Exception e) {
            log.error("Failed to archive session: sessionId={}", session.getId(), e);
            // 아카이빙 실패해도 세션 완료는 진행
        }
    }
    
    public List<OrderHistoryResponse> getOrderHistory(Long tableId, Long storeId) {
        StoreTable table = tableRepository.findById(tableId)
            .orElseThrow(() -> new BusinessException(ErrorCode.TABLE_NOT_FOUND));
        
        validateStoreAccess(table.getStore().getId(), storeId);
        
        List<OrderHistory> histories = orderHistoryRepository.findByTableIdOrderByCompletedAtDesc(tableId);
        return OrderHistoryResponse.fromList(histories);
    }
    
    private void validateStoreAccess(Long resourceStoreId, Long requestStoreId) {
        if (!resourceStoreId.equals(requestStoreId)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
    }
}
