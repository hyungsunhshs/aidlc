package com.tableorder.domain.model;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "daily_order_sequences", indexes = {
    @Index(name = "idx_daily_order_sequences_store_date", columnList = "store_id, order_date", unique = true)
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DailyOrderSequence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "store_id", nullable = false)
    private Long storeId;

    @Column(name = "order_date", nullable = false)
    private LocalDate orderDate;

    @Column(name = "last_sequence", nullable = false)
    private Integer lastSequence = 0;

    public DailyOrderSequence(Long storeId, LocalDate orderDate) {
        this.storeId = storeId;
        this.orderDate = orderDate;
        this.lastSequence = 0;
    }

    public int getNextSequence() {
        this.lastSequence++;
        return this.lastSequence;
    }
}
