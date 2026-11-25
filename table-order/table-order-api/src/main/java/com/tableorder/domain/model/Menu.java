package com.tableorder.domain.model;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "menus", indexes = {
    @Index(name = "idx_menus_category_display_order", columnList = "category_id, display_order"),
    @Index(name = "idx_menus_category_deleted_available", columnList = "category_id, is_deleted, is_available")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Menu extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(length = 500)
    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "is_available", nullable = false)
    private boolean isAvailable = true;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    @Builder
    public Menu(Category category, String name, BigDecimal price, String description,
                String imageUrl, Integer displayOrder) {
        this.category = category;
        this.name = name;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this.displayOrder = displayOrder != null ? displayOrder : 0;
        this.isAvailable = true;
        this.isDeleted = false;
    }

    public void update(String name, BigDecimal price, String description,
                       String imageUrl, Integer displayOrder, Boolean isAvailable) {
        if (name != null) {
            this.name = name;
        }
        if (price != null) {
            this.price = price;
        }
        if (description != null) {
            this.description = description;
        }
        if (imageUrl != null) {
            this.imageUrl = imageUrl;
        }
        if (displayOrder != null) {
            this.displayOrder = displayOrder;
        }
        if (isAvailable != null) {
            this.isAvailable = isAvailable;
        }
    }

    public void updateDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public void delete() {
        this.isDeleted = true;
    }

    public boolean canBeOrdered() {
        return !this.isDeleted && this.isAvailable;
    }
}
