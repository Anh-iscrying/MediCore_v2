package com.medicore.entity.catalog;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "template_details")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class TemplateDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private TreatmentTemplate template;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @Column(name = "default_quantity")
    private Integer defaultQuantity;

    @Column(name = "default_dosage")
    private String defaultDosage;
}