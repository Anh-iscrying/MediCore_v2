package com.medicore.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientAiContext {
    @Builder.Default
    private List<PatientAiRecordSummary> recentRecords = List.of();

    @Builder.Default
    private List<PatientAiRecordDetail> recordDetails = List.of();

    @Builder.Default
    private List<PatientAiPrescriptionItem> prescriptions = List.of();

    @Builder.Default
    private List<PatientAiMedicineInfo> medicines = List.of();

    @Builder.Default
    private List<PatientAiDoctorInfo> doctorsSeen = List.of();
}
