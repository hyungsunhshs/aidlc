package com.tableorder.domain.repository;

import com.tableorder.domain.model.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MenuRepository extends JpaRepository<Menu, Long> {
    
    @Query("SELECT m FROM Menu m WHERE m.category.id = :categoryId AND m.isDeleted = false ORDER BY m.displayOrder ASC")
    List<Menu> findByCategoryIdAndNotDeleted(@Param("categoryId") Long categoryId);
    
    @Query("SELECT m FROM Menu m WHERE m.category.id = :categoryId AND m.isDeleted = false AND m.isAvailable = true ORDER BY m.displayOrder ASC")
    List<Menu> findByCategoryIdAvailable(@Param("categoryId") Long categoryId);
    
    @Query("SELECT m FROM Menu m JOIN FETCH m.category c JOIN FETCH c.store WHERE m.id = :id AND m.isDeleted = false")
    Optional<Menu> findByIdWithCategoryAndStore(@Param("id") Long id);
    
    @Query("SELECT m FROM Menu m WHERE m.category.store.id = :storeId AND m.isDeleted = false ORDER BY m.category.displayOrder ASC, m.displayOrder ASC")
    List<Menu> findByStoreIdNotDeleted(@Param("storeId") Long storeId);
    
    @Query("SELECT MAX(m.displayOrder) FROM Menu m WHERE m.category.id = :categoryId")
    Optional<Integer> findMaxDisplayOrderByCategoryId(@Param("categoryId") Long categoryId);
    
    @Modifying
    @Query("UPDATE Menu m SET m.isDeleted = true WHERE m.category.id = :categoryId")
    void softDeleteByCategoryId(@Param("categoryId") Long categoryId);
}
