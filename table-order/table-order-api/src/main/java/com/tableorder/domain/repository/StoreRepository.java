package com.tableorder.domain.repository;

import com.tableorder.domain.model.Store;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StoreRepository extends JpaRepository<Store, Long> {
    
    Optional<Store> findByIdentifier(String identifier);
    
    boolean existsByIdentifier(String identifier);
}
