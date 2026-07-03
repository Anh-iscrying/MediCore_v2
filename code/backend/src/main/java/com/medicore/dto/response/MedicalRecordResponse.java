package com.medicore.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;

@Data @Builder
public class MedicalRecordResponse {
    private String emrCode;
    private String doctorName;
    private String diagnosisIcd10;
    private String clinicalNote;
    private String careAdvice;
    private OffsetDateTime createdAt;
}