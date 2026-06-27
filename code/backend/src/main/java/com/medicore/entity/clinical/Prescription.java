package com.medicore.entity.clinical;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(name = "prescriptions")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_record_id")
    private MedicalRecord medicalRecord;

    @Column(name = "pdf_url", columnDefinition = "TEXT")
    private String pdfUrl;

    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL)
    private List<PrescriptionDetail> details;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}