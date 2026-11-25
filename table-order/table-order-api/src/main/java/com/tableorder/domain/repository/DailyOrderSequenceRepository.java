package com.tableorder.domain.repository;

import com.tableorder.domain.model.DailyOrderSequence;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;

public interface DailyOrderSequenceRepository extends JpaRepository<DailyOrderSequence, Long> {
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM DailyOrderSequence s WHERE s.storeId = :storeId AND s.orderDate = :orderDate")
    Optional<DailyOrderSequence> findByStoreIdAndDateWithLock(
        @Param("storeId") Long storeId,
        @Param("orderDate") LocalDate orderDate
    );
}
