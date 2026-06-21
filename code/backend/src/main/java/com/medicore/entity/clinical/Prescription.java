package com.medicore.entity.clinical;

import com.medicore.common.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "prescriptions")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class Prescription extends BaseEntity {
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_record_id")
    private MedicalRecord medicalRecord;

    private String pdfUrl;

    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL)
    private List<PrescriptionDetail> details;
}