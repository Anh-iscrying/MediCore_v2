package com.medicore.entity.catalog;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

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

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}