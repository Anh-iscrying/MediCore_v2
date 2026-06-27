package com.medicore.entity.catalog;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "medicines")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "medicine_name", nullable = false, length = 100)
    private String medicineName;

    @Column(name = "unit", nullable = false, length = 20)
    private String unit; // Viên, Gói, Lọ

    @Column(name = "category")
    private String category; // Nhóm thuốc (Vd: Kháng sinh)

    @Column(name = "price")
    private Double price;

    @Column(name = "stock")
    private Integer stock;

    @Column(name = "manufacturer")
    private String manufacturer;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}