package com.tableorder.domain.model;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tables", indexes = {
    @Index(name = "idx_tables_store_table_number", columnList = "store_id, table_number", unique = true)
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StoreTable extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(name = "table_number", nullable = false, length = 20)
    private String tableNumber;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @OneToMany(mappedBy = "table", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TableSession> sessions = new ArrayList<>();

    @OneToMany(mappedBy = "table", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderHistory> orderHistories = new ArrayList<>();

    @Builder
    public StoreTable(Store store, String tableNumber, String passwordHash) {
        this.store = store;
        this.tableNumber = tableNumber;
        this.passwordHash = passwordHash;
        this.isActive = true;
    }

    public void update(String tableNumber, String passwordHash) {
        if (tableNumber != null) {
            this.tableNumber = tableNumber;
        }
        if (passwordHash != null) {
            this.passwordHash = passwordHash;
        }
    }

    public void setActive(boolean active) {
        this.isActive = active;
    }
}
