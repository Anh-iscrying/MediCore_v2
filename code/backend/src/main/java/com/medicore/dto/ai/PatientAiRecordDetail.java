package com.medicore.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientAiRecordDetail {
    private String emrCode;
    private OffsetDateTime createdAt;
    private String doctorName;
    private String specialtyName;
    private String diagnosisIcd10;
    private String diagnosisName;
    private String mainDiagnosis;
    private String symptoms;
    private String physicalExamination;
    private String testResults;
    private String clinicalNote;
    private String historySummary;
    private String careAdvice;
    private LocalDate followUpDate;
}
