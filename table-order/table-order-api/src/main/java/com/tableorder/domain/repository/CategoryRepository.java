package com.tableorder.domain.repository;

import com.tableorder.domain.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    List<Category> findByStoreIdOrderByDisplayOrderAsc(Long storeId);
    
    @Query("SELECT c FROM Category c JOIN FETCH c.store WHERE c.id = :id")
    Optional<Category> findByIdWithStore(@Param("id") Long id);
    
    @Query("SELECT MAX(c.displayOrder) FROM Category c WHERE c.store.id = :storeId")
    Optional<Integer> findMaxDisplayOrderByStoreId(@Param("storeId") Long storeId);
}
