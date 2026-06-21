package com.medicore.entity.clinical;

import com.medicore.common.base.BaseEntity;
import com.medicore.entity.catalog.Medicine;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "prescription_details")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class PrescriptionDetail extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id")
    private Prescription prescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id")
    private Medicine medicine;

    private Integer quantity;
    private String dosageInstruction;
}