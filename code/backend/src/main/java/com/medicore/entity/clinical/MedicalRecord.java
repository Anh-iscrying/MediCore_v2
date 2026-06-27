package com.medicore.entity.clinical;

import com.medicore.entity.catalog.Disease;
import com.medicore.entity.user.Doctor;
import com.medicore.entity.user.Patient;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "medical_records")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class MedicalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "emr_code", unique = true, nullable = false, length = 30)
    private String emrCode;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", referencedColumnName = "patient_code")
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diagnosis_icd10", referencedColumnName = "icd10_code")
    private Disease diagnosisIcd10;

    @Column(name = "clinical_note", columnDefinition = "TEXT")
    private String clinicalNote;

    @Column(name = "history_summary", columnDefinition = "TEXT")
    private String historySummary;

    @Column(name = "care_advice", columnDefinition = "TEXT")
    private String careAdvice;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}