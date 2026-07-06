package com.medicore.service.impl;

import com.medicore.dto.ai.AiContextRetrievalAttempt;
import com.medicore.dto.ai.DoctorAiAuthorizedTarget;
import com.medicore.dto.ai.DoctorAiContext;
import com.medicore.dto.ai.DoctorAiContextAction;
import com.medicore.dto.ai.DoctorAiContextActionType;
import com.medicore.dto.ai.DoctorAiRoutePlan;
import com.medicore.dto.ai.DoctorAiPatientProfile;
import com.medicore.dto.ai.DoctorAiAppointmentSummary;
import com.medicore.dto.ai.DoctorAiVisitSummary;
import com.medicore.dto.ai.DoctorAiVisitDetail;
import com.medicore.dto.ai.DoctorAiPrescriptionItem;
import com.medicore.dto.ai.RetrievalStatus;
import com.medicore.entity.clinical.Appointment;
import com.medicore.entity.user.Doctor;
import com.medicore.entity.user.Patient;
import com.medicore.service.DoctorAiContextService;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class DoctorAiContextExecutorImplTest {

    private final DoctorAiContextService doctorAiContextService = mock(DoctorAiContextService.class);
    private final DoctorAiContextExecutorImpl executor = new DoctorAiContextExecutorImpl(doctorAiContextService);

    @Test
    void executeAutoIncludesProfileAndCurrentAppointmentAndClampsLimits() {
        Patient patient = new Patient();
        patient.setPatientCode("PAT001");
        Doctor doctor = new Doctor();
        doctor.setId(10);
        Appointment appointment = new Appointment();
        appointment.setDoctor(doctor);
        appointment.setPatient(patient);

        DoctorAiAuthorizedTarget target = DoctorAiAuthorizedTarget.builder()
                .doctor(doctor)
                .patient(patient)
                .appointment(appointment)
                .build();

        DoctorAiPatientProfile profile = DoctorAiPatientProfile.builder().fullName("Bệnh nhân A").build();
        DoctorAiAppointmentSummary appSummary = DoctorAiAppointmentSummary.builder().specialtyName("Tim mạch").build();
        DoctorAiVisitSummary visit = DoctorAiVisitSummary.builder().emrCode("EMR001").build();
        DoctorAiPrescriptionItem prescription = DoctorAiPrescriptionItem.builder().medicineName("Duphalac").build();

        when(doctorAiContextService.getPatientProfile(patient)).thenReturn(profile);
        when(doctorAiContextService.getAppointmentSummary(appointment)).thenReturn(appSummary);
        when(doctorAiContextService.getRecentVisits("PAT001", 8)).thenReturn(List.of(visit));
        when(doctorAiContextService.getPrescriptions("PAT001", "EMR001", 30)).thenReturn(List.of(prescription));

        DoctorAiRoutePlan plan = DoctorAiRoutePlan.builder()
                .actions(List.of(
                        DoctorAiContextAction.builder().type(DoctorAiContextActionType.RECENT_VISITS).limit(99).build(),
                        DoctorAiContextAction.builder().type(DoctorAiContextActionType.PRESCRIPTIONS).emrCode("EMR001").limit(200).build()
                ))
                .build();

        DoctorAiContext context = executor.execute(target, plan);

        assertThat(context.getPatientProfile()).isEqualTo(profile);
        assertThat(context.getCurrentAppointment()).isEqualTo(appSummary);
        assertThat(context.getRecentVisits()).containsExactly(visit);
        assertThat(context.getPrescriptions()).containsExactly(prescription);

        verify(doctorAiContextService).getRecentVisits("PAT001", 8);
        verify(doctorAiContextService).getPrescriptions("PAT001", "EMR001", 30);
    }

    @Test
    void strictVisitDoesNotCallFallbackRecentVisits() {
        Patient patient = new Patient();
        patient.setPatientCode("PAT001");
        Doctor doctor = new Doctor();
        doctor.setId(10);

        DoctorAiAuthorizedTarget target = DoctorAiAuthorizedTarget.builder()
                .doctor(doctor).patient(patient).build();

        DoctorAiPatientProfile profile = DoctorAiPatientProfile.builder().fullName("Bệnh nhân B").build();
        DoctorAiVisitSummary targetVisit = DoctorAiVisitSummary.builder().emrCode("EMR003").build();
        when(doctorAiContextService.getPatientProfile(patient)).thenReturn(profile);
        when(doctorAiContextService.getVisitsByPosition("PAT001", 1, 2, true)).thenReturn(List.of(targetVisit));

        DoctorAiRoutePlan plan = DoctorAiRoutePlan.builder()
                .actions(List.of(
                        DoctorAiContextAction.builder()
                                .type(DoctorAiContextActionType.RECENT_VISITS)
                                .offset(2).sortAsc(true).limit(1).strict(true)
                                .targetText("lần khám thứ 3 tính từ cũ nhất")
                                .build()
                ))
                .build();

        DoctorAiContext context = executor.execute(target, plan);

        assertThat(context.getRecentVisits()).containsExactly(targetVisit);
        // KHÔNG gọi getRecentVisits fallback
        verify(doctorAiContextService, never()).getRecentVisits(anyString(), anyInt());
        verify(doctorAiContextService).getVisitsByPosition("PAT001", 1, 2, true);

        assertThat(context.getRetrievalAttempts()).hasSize(1);
        AiContextRetrievalAttempt attempt = context.getRetrievalAttempts().get(0);
        assertThat(attempt.getStatus()).isEqualTo(RetrievalStatus.FOUND);
        assertThat(attempt.getTargetText()).isEqualTo("lần khám thứ 3 tính từ cũ nhất");
    }

    @Test
    void visitDetailNotFoundCreatesAudit() {
        Patient patient = new Patient();
        patient.setPatientCode("PAT001");
        Doctor doctor = new Doctor();
        doctor.setId(10);

        DoctorAiAuthorizedTarget target = DoctorAiAuthorizedTarget.builder()
                .doctor(doctor).patient(patient).build();

        when(doctorAiContextService.getPatientProfile(patient)).thenReturn(null);
        when(doctorAiContextService.getVisitDetail("PAT001", "EMR-NONEXIST")).thenReturn(Optional.empty());

        DoctorAiRoutePlan plan = DoctorAiRoutePlan.builder()
                .actions(List.of(
                        DoctorAiContextAction.builder()
                                .type(DoctorAiContextActionType.VISIT_DETAIL)
                                .emrCode("EMR-NONEXIST")
                                .strict(true)
                                .build()
                ))
                .build();

        DoctorAiContext context = executor.execute(target, plan);

        assertThat(context.getVisitDetails()).isEmpty();
        assertThat(context.getRetrievalAttempts()).hasSize(1);
        assertThat(context.getRetrievalAttempts().get(0).getStatus()).isEqualTo(RetrievalStatus.NOT_FOUND);
    }

    @Test
    void plannerFailureStillUsesDefaultContext() {
        Patient patient = new Patient();
        patient.setPatientCode("PAT001");
        Doctor doctor = new Doctor();
        doctor.setId(10);
        Appointment appointment = new Appointment();
        appointment.setDoctor(doctor);
        appointment.setPatient(patient);

        DoctorAiAuthorizedTarget target = DoctorAiAuthorizedTarget.builder()
                .doctor(doctor).patient(patient).appointment(appointment).build();

        DoctorAiPatientProfile profile = DoctorAiPatientProfile.builder().fullName("Bệnh nhân C").build();
        DoctorAiAppointmentSummary appSummary = DoctorAiAppointmentSummary.builder().build();
        DoctorAiVisitSummary visit = DoctorAiVisitSummary.builder().emrCode("EMR001").build();
        DoctorAiPrescriptionItem prescription = DoctorAiPrescriptionItem.builder().medicineName("Aspirin").build();

        when(doctorAiContextService.getPatientProfile(patient)).thenReturn(profile);
        when(doctorAiContextService.getAppointmentSummary(appointment)).thenReturn(appSummary);
        when(doctorAiContextService.getRecentVisits("PAT001", 3)).thenReturn(List.of(visit));
        when(doctorAiContextService.getPrescriptions("PAT001", null, 20)).thenReturn(List.of(prescription));
        when(doctorAiContextService.getAppointmentHistory(10, "PAT001", 5)).thenReturn(List.of());

        DoctorAiContext context = executor.buildDefaultContext(target);

        assertThat(context.getPatientProfile()).isEqualTo(profile);
        assertThat(context.getCurrentAppointment()).isEqualTo(appSummary);
        assertThat(context.getRecentVisits()).containsExactly(visit);
        assertThat(context.getPrescriptions()).containsExactly(prescription);
    }
}
