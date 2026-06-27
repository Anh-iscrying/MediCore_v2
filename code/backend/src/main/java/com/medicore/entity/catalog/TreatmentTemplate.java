package com.medicore.entity.catalog;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "treatment_templates")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class TreatmentTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "icd10_code", nullable = false)
    private Disease disease;

    @Column(name = "template_name", nullable = false)
    private String templateName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}