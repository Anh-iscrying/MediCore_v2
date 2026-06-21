package com.medicore.entity.catalog;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "diseases")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Disease {
    @Id
    @Column(name = "icd10_code", length = 10)
    private String icd10Code; // Ví dụ: K29, E11

    @Column(name = "disease_name", nullable = false)
    private String diseaseName;

    @CreatedDate
    private LocalDateTime createdAt;
}