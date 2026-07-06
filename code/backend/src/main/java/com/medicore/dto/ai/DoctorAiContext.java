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
public class DoctorAiContext {
    private DoctorAiPatientProfile patientProfile;
    private DoctorAiAppointmentSummary currentAppointment;

    @Builder.Default
    private List<DoctorAiAppointmentSummary> appointmentHistory = List.of();

    @Builder.Default
    private List<DoctorAiVisitSummary> recentVisits = List.of();

    @Builder.Default
    private List<DoctorAiVisitDetail> visitDetails = List.of();

    @Builder.Default
    private List<DoctorAiPrescriptionItem> prescriptions = List.of();
}
