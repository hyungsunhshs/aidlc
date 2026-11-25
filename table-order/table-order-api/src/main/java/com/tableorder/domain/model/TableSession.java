package com.tableorder.domain.model;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "table_sessions", indexes = {
    @Index(name = "idx_table_sessions_table_status", columnList = "table_id, status"),
    @Index(name = "idx_table_sessions_started_at", columnList = "started_at")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TableSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "table_id", nullable = false)
    private StoreTable table;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SessionStatus status;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Order> orders = new ArrayList<>();

    @Builder
    public TableSession(StoreTable table) {
        this.table = table;
        this.status = SessionStatus.ACTIVE;
        this.startedAt = LocalDateTime.now();
        this.totalAmount = BigDecimal.ZERO;
    }

    public void complete() {
        this.status = SessionStatus.COMPLETED;
        this.endedAt = LocalDateTime.now();
    }

    public void expire() {
        this.status = SessionStatus.EXPIRED;
        this.endedAt = LocalDateTime.now();
    }

    public void addToTotalAmount(BigDecimal amount) {
        this.totalAmount = this.totalAmount.add(amount);
    }

    public void subtractFromTotalAmount(BigDecimal amount) {
        this.totalAmount = this.totalAmount.subtract(amount);
    }

    public boolean isActive() {
        return this.status == SessionStatus.ACTIVE;
    }
}
