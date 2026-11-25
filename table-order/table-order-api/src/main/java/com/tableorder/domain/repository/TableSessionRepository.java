package com.tableorder.domain.repository;

import com.tableorder.domain.model.SessionStatus;
import com.tableorder.domain.model.TableSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TableSessionRepository extends JpaRepository<TableSession, Long> {
    
    Optional<TableSession> findByTableIdAndStatus(Long tableId, SessionStatus status);
    
    @Query("SELECT s FROM TableSession s JOIN FETCH s.table WHERE s.id = :id")
    Optional<TableSession> findByIdWithTable(@Param("id") Long id);
    
    @Query("SELECT s FROM TableSession s WHERE s.status = :status AND s.startedAt < :threshold")
    List<TableSession> findByStatusAndStartedAtBefore(
        @Param("status") SessionStatus status,
        @Param("threshold") LocalDateTime threshold
    );
    
    @Query("SELECT s FROM TableSession s JOIN FETCH s.orders o JOIN FETCH o.items WHERE s.id = :id")
    Optional<TableSession> findByIdWithOrdersAndItems(@Param("id") Long id);
}
