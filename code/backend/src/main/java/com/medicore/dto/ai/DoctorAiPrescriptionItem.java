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
public class DoctorAiPrescriptionItem {
    private String emrCode;
    private OffsetDateTime visitCreatedAt;
    private OffsetDateTime prescribedAt;
    private String medicineName;
    private String unit;
    private Integer quantity;
    private String dosageInstruction;
}
