package com.medicore.entity.clinical;

import com.medicore.entity.catalog.Disease;
import com.medicore.entity.user.Doctor;
import com.medicore.entity.user.Patient;
import jakarta.persistence.*;
import lombok.*;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Map;

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

    @Column(name = "symptoms", columnDefinition = "TEXT")
    private String symptoms;

    @Column(name = "physical_examination", columnDefinition = "TEXT")
    private String physicalExamination;

    @Column(name = "test_results", columnDefinition = "TEXT")
    private String testResults;

    @Column(name = "main_diagnosis", columnDefinition = "TEXT")
    private String mainDiagnosis;

    @Column(name = "clinical_note", columnDefinition = "TEXT")
    private String clinicalNote;

    @Column(name = "history_summary", columnDefinition = "TEXT")
    private String historySummary;

    @Column(name = "care_advice", columnDefinition = "TEXT")
    private String careAdvice;

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "additional_data", columnDefinition = "jsonb")
    private Map<String, Object> additionalData;

    @Column(name = "pdf_url", columnDefinition = "TEXT")
    private String pdfUrl;

    @Column(name = "pdf_storage_path", columnDefinition = "TEXT")
    private String pdfStoragePath;

    @Column(name = "pdf_generated_at")
    private OffsetDateTime pdfGeneratedAt;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}