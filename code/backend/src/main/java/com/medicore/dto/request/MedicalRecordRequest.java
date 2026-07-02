package com.medicore.dto.request;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class MedicalRecordRequest {
    private Integer appointmentId;
    private String clinicalNote;
    private String historySummary;
    private String careAdvice;
    private List<DiagnosisItem> diagnoses;
    private List<MedicineItem> medicines;
    private Map<String, Object> specialtyData; 

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
        private Boolean isFromTemplate;
    }
}