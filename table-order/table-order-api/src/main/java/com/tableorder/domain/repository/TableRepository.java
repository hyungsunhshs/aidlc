package com.tableorder.domain.repository;

import com.tableorder.domain.model.StoreTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TableRepository extends JpaRepository<StoreTable, Long> {
    
    List<StoreTable> findByStoreIdOrderByTableNumber(Long storeId);
    
    Optional<StoreTable> findByStoreIdAndTableNumber(Long storeId, String tableNumber);
    
    @Query("SELECT t FROM StoreTable t JOIN FETCH t.store WHERE t.store.identifier = :storeIdentifier AND t.tableNumber = :tableNumber")
    Optional<StoreTable> findByStoreIdentifierAndTableNumber(
        @Param("storeIdentifier") String storeIdentifier,
        @Param("tableNumber") String tableNumber
    );
    
    boolean existsByStoreIdAndTableNumber(Long storeId, String tableNumber);
}
