package com.tableorder.domain.model;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "categories", indexes = {
    @Index(name = "idx_categories_store_display_order", columnList = "store_id, display_order")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Category extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Menu> menus = new ArrayList<>();

    @Builder
    public Category(Store store, String name, Integer displayOrder) {
        this.store = store;
        this.name = name;
        this.displayOrder = displayOrder != null ? displayOrder : 0;
    }

    public void update(String name, Integer displayOrder) {
        if (name != null) {
            this.name = name;
        }
        if (displayOrder != null) {
            this.displayOrder = displayOrder;
        }
    }
}
