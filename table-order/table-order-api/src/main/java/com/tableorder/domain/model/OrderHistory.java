package com.tableorder.domain.model;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_histories", indexes = {
    @Index(name = "idx_order_histories_table_completed", columnList = "table_id, completed_at")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class OrderHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "table_id", nullable = false)
    private StoreTable table;

    @Column(name = "session_id", nullable = false)
    private Long sessionId;

    @Column(name = "order_data", nullable = false, columnDefinition = "TEXT")
    private String orderData;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "completed_at", nullable = false)
    private LocalDateTime completedAt;

    @Builder
    public OrderHistory(StoreTable table, Long sessionId, String orderData,
                        BigDecimal totalAmount, LocalDateTime startedAt) {
        this.table = table;
        this.sessionId = sessionId;
        this.orderData = orderData;
        this.totalAmount = totalAmount;
        this.startedAt = startedAt;
        this.completedAt = LocalDateTime.now();
    }
}
