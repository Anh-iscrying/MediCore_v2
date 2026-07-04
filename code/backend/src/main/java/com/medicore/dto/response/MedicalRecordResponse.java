package com.medicore.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecordResponse {
    private Integer id;
    private String emrCode;
    private Integer appointmentId;
    private String patientId;
    private String patientCode; // <--- Giữ lại dòng này từ nhánh HEAD của bạn
    private String patientName;
    private Integer doctorId;
    private String doctorName;
    private String appointmentDate;
    private String timeSlot;
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
    private Map<String, Object> additionalData;
    private String pdfUrl;
    private String pdfStoragePath;
    private OffsetDateTime pdfGeneratedAt;
    private OffsetDateTime createdAt;
    private List<MedicineResponse> medicines;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MedicineResponse {
        private Integer medicineId;
        private String medicineName;
        private String unit;
        private Integer quantity;
        private String dosageInstruction;
    }
}