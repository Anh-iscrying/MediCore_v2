package com.medicore.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientAiMedicineInfo {
    private String medicineName;
    private String unit;
    private String category;
    private String manufacturer;
}
