package com.tableorder.domain.repository;

import com.tableorder.domain.model.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Long> {
    
    @Query("SELECT a FROM Admin a JOIN FETCH a.store WHERE a.store.id = :storeId AND a.username = :username")
    Optional<Admin> findByStoreIdAndUsername(@Param("storeId") Long storeId, @Param("username") String username);
    
    boolean existsByStoreIdAndUsername(Long storeId, String username);
}
