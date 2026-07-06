package com.medicore.service;

import com.medicore.dto.ai.DoctorAiAppointmentSummary;
import com.medicore.dto.ai.DoctorAiPatientProfile;
import com.medicore.dto.ai.DoctorAiPrescriptionItem;
import com.medicore.dto.ai.DoctorAiVisitDetail;
import com.medicore.dto.ai.DoctorAiVisitSummary;
import com.medicore.entity.clinical.Appointment;
import com.medicore.entity.user.Patient;

import java.util.List;
import java.util.Optional;

public interface DoctorAiContextService {
    DoctorAiPatientProfile getPatientProfile(Patient patient);

    DoctorAiAppointmentSummary getAppointmentSummary(Appointment appointment);

    List<DoctorAiAppointmentSummary> getAppointmentHistory(Integer doctorId, String patientCode, int limit);

    List<DoctorAiVisitSummary> getRecentVisits(String patientCode, int limit);

    List<DoctorAiVisitSummary> getVisitsByPosition(String patientCode, int limit, int offset, boolean ascending);

    Optional<DoctorAiVisitDetail> getVisitDetail(String patientCode, String emrCode);

    List<DoctorAiPrescriptionItem> getPrescriptions(String patientCode, String emrCode, int limit);
}
