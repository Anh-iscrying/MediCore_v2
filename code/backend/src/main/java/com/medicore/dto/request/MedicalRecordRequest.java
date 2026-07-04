package com.medicore.dto.request;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
public class MedicalRecordRequest {
    private Integer appointmentId;
    private String symptoms;
    private String physicalExamination;
    private String testResults;
    private String mainDiagnosis;
    private String clinicalNote;
    private String historySummary;
    private String careAdvice;
    private LocalDate followUpDate;
    private Map<String, Object> additionalData;
    private List<DiagnosisItem> diagnoses;
    private List<MedicineItem> medicines;

    @Data
    public static class DiagnosisItem {
        private String icd10Code;
        private Boolean isPrimary;
    }

    @Data
    public static class MedicineItem {
        private Integer medicineId;
        private Integer quantity;
        private String dosageInstruction;
    }
}