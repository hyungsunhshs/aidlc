package com.tableorder.domain.repository;

import com.tableorder.domain.model.OrderHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderHistoryRepository extends JpaRepository<OrderHistory, Long> {
    
    List<OrderHistory> findByTableIdOrderByCompletedAtDesc(Long tableId);
}
