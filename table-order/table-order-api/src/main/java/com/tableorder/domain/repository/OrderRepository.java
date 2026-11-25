package com.tableorder.domain.repository;

import com.tableorder.domain.model.Order;
import com.tableorder.domain.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    
    @Query("SELECT o FROM Order o JOIN FETCH o.items WHERE o.session.id = :sessionId ORDER BY o.createdAt DESC")
    List<Order> findBySessionIdWithItems(@Param("sessionId") Long sessionId);
    
    @Query("SELECT o FROM Order o JOIN FETCH o.session s JOIN FETCH s.table t WHERE t.store.id = :storeId ORDER BY o.createdAt DESC")
    List<Order> findByStoreIdWithSessionAndTable(@Param("storeId") Long storeId);
    
    @Query("SELECT o FROM Order o JOIN FETCH o.session s JOIN FETCH s.table t WHERE t.store.id = :storeId AND o.status IN :statuses ORDER BY o.createdAt DESC")
    List<Order> findByStoreIdAndStatusIn(
        @Param("storeId") Long storeId,
        @Param("statuses") List<OrderStatus> statuses
    );
    
    @Query("SELECT o FROM Order o JOIN FETCH o.items JOIN FETCH o.session s JOIN FETCH s.table WHERE o.id = :id")
    Optional<Order> findByIdWithItemsAndSession(@Param("id") Long id);
    
    @Query("SELECT o FROM Order o JOIN FETCH o.session s JOIN FETCH s.table t WHERE o.id = :id AND t.store.id = :storeId")
    Optional<Order> findByIdAndStoreId(@Param("id") Long id, @Param("storeId") Long storeId);
    
    @Query("SELECT o FROM Order o JOIN o.session s JOIN s.table t WHERE t.store.id = :storeId AND o.createdAt BETWEEN :start AND :end")
    List<Order> findByStoreIdAndCreatedAtBetween(
        @Param("storeId") Long storeId,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );
}
