package com.medicore.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorAiVisitSummary {
    private String emrCode;
    private OffsetDateTime createdAt;
    private String doctorName;
    private String specialtyName;
    private String diagnosisIcd10;
    private String diagnosisName;
    private String mainDiagnosis;
    private String symptoms;
    private String historySummary;
    private String careAdvice;
    private LocalDate followUpDate;
}
