package com.medicore.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientAiPrescriptionItem {
    private String emrCode;
    private OffsetDateTime prescribedAt;
    private String medicineName;
    private String unit;
    private String category;
    private String manufacturer;
    private Integer quantity;
    private String dosageInstruction;
}
