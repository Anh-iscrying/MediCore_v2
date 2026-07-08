package com.medicore.service.ai;

import com.medicore.common.constants.AppointmentStatus;
import com.medicore.common.constants.UserRole;
import com.medicore.common.exception.CustomBusinessException;
import com.medicore.dto.ai.DoctorAiAuthorizedTarget;
import com.medicore.dto.request.DoctorAiChatRequest;
import com.medicore.entity.clinical.Appointment;
import com.medicore.entity.user.AuthCredentials;
import com.medicore.entity.user.Doctor;
import com.medicore.entity.user.Patient;
import com.medicore.repository.clinical.AppointmentRepository;
import com.medicore.repository.auth.AuthCredentialsRepository;
import com.medicore.repository.clinical.MedicalRecordRepository;
import com.medicore.repository.user.PatientRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class DoctorAiAccessServiceImplTest {

    private final AuthCredentialsRepository authCredentialsRepository = mock(AuthCredentialsRepository.class);
    private final AppointmentRepository appointmentRepository = mock(AppointmentRepository.class);
    private final MedicalRecordRepository medicalRecordRepository = mock(MedicalRecordRepository.class);
    private final PatientRepository patientRepository = mock(PatientRepository.class);

    private final DoctorAiAccessServiceImpl accessService = new DoctorAiAccessServiceImpl(
            authCredentialsRepository, appointmentRepository, medicalRecordRepository, patientRepository
    );

    @Test
    void resolveTargetAllowedWhenDoctorAccessesOwnAppointment() {
        String email = "doctor@medicore.com";
        Doctor doctor = new Doctor();
        doctor.setId(10);
        AuthCredentials credentials = AuthCredentials.builder()
                .role(UserRole.DOCTOR)
                .doctor(doctor)
                .build();

        Patient patient = new Patient();
        patient.setPatientCode("PAT001");

        Appointment appointment = new Appointment();
        appointment.setId(100);
        appointment.setDoctor(doctor);
        appointment.setPatient(patient);

        DoctorAiChatRequest request = new DoctorAiChatRequest();
        request.setAppointmentId(100);

        when(authCredentialsRepository.findByEmail(email)).thenReturn(Optional.of(credentials));
        when(appointmentRepository.findDoctorAiTargetById(100)).thenReturn(Optional.of(appointment));

        DoctorAiAuthorizedTarget target = accessService.resolveTarget(email, request);

        assertThat(target.getDoctor()).isEqualTo(doctor);
        assertThat(target.getPatient()).isEqualTo(patient);
        assertThat(target.getAppointment()).isEqualTo(appointment);
    }

    @Test
    void resolveTargetDeniedWhenDoctorAccessesOtherDoctorAppointment() {
        String email = "doctor@medicore.com";
        Doctor doctor = new Doctor();
        doctor.setId(10);
        AuthCredentials credentials = AuthCredentials.builder()
                .role(UserRole.DOCTOR)
                .doctor(doctor)
                .build();

        Doctor otherDoctor = new Doctor();
        otherDoctor.setId(20);

        Appointment appointment = new Appointment();
        appointment.setId(100);
        appointment.setDoctor(otherDoctor);

        DoctorAiChatRequest request = new DoctorAiChatRequest();
        request.setAppointmentId(100);

        when(authCredentialsRepository.findByEmail(email)).thenReturn(Optional.of(credentials));
        when(appointmentRepository.findDoctorAiTargetById(100)).thenReturn(Optional.of(appointment));

        assertThatThrownBy(() -> accessService.resolveTarget(email, request))
                .isInstanceOf(CustomBusinessException.class)
                .hasMessageContaining("Bạn không có quyền truy cập lịch hẹn này");
    }

    @Test
    void resolveTargetAllowedWhenRelationshipExistsByPatientCode() {
        String email = "doctor@medicore.com";
        Doctor doctor = new Doctor();
        doctor.setId(10);
        AuthCredentials credentials = AuthCredentials.builder()
                .role(UserRole.DOCTOR)
                .doctor(doctor)
                .build();

        Patient patient = new Patient();
        patient.setPatientCode("PAT001");

        DoctorAiChatRequest request = new DoctorAiChatRequest();
        request.setPatientCode("PAT001");

        when(authCredentialsRepository.findByEmail(email)).thenReturn(Optional.of(credentials));
        when(patientRepository.findByPatientCode("PAT001")).thenReturn(Optional.of(patient));
        when(appointmentRepository.existsByDoctorIdAndPatientPatientCodeAndStatusNot(
                10, "PAT001", AppointmentStatus.CANCELLED)).thenReturn(true);

        DoctorAiAuthorizedTarget target = accessService.resolveTarget(email, request);

        assertThat(target.getPatient()).isEqualTo(patient);
        assertThat(target.getDoctor()).isEqualTo(doctor);
    }

    @Test
    void resolveTargetDeniedWhenNoRelationshipExists() {
        String email = "doctor@medicore.com";
        Doctor doctor = new Doctor();
        doctor.setId(10);
        AuthCredentials credentials = AuthCredentials.builder()
                .role(UserRole.DOCTOR)
                .doctor(doctor)
                .build();

        Patient patient = new Patient();
        patient.setPatientCode("PAT001");

        DoctorAiChatRequest request = new DoctorAiChatRequest();
        request.setPatientCode("PAT001");

        when(authCredentialsRepository.findByEmail(email)).thenReturn(Optional.of(credentials));
        when(patientRepository.findByPatientCode("PAT001")).thenReturn(Optional.of(patient));
        when(appointmentRepository.existsByDoctorIdAndPatientPatientCodeAndStatusNot(
                10, "PAT001", AppointmentStatus.CANCELLED)).thenReturn(false);
        when(medicalRecordRepository.existsByDoctorIdAndPatientPatientCode(
                10, "PAT001")).thenReturn(false);

        assertThatThrownBy(() -> accessService.resolveTarget(email, request))
                .isInstanceOf(CustomBusinessException.class)
                .hasMessageContaining("Bạn chưa từng khám cho bệnh nhân này");
    }

    @Test
    void resolveTargetDeniedForPatientRole() {
        String email = "patient@medicore.com";
        AuthCredentials credentials = AuthCredentials.builder()
                .role(UserRole.PATIENT)
                .build();

        DoctorAiChatRequest request = new DoctorAiChatRequest();
        request.setPatientCode("PAT001");

        when(authCredentialsRepository.findByEmail(email)).thenReturn(Optional.of(credentials));

        assertThatThrownBy(() -> accessService.resolveTarget(email, request))
                .isInstanceOf(CustomBusinessException.class);
    }
}
