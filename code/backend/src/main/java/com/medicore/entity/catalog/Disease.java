package com.medicore.entity.catalog;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "diseases")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class Disease {

    @Id
    @Column(name = "icd10_code", length = 10)
    private String icd10Code; // Ví dụ: K29, E11

    @Column(name = "disease_name", nullable = false)
    private String diseaseName;

    @Column(name = "category")
    private String category; // Chương bệnh (Vd: Bệnh hệ hô hấp)

    @Column(name = "description", columnDefinition = "TEXT")
    private String description; 

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}