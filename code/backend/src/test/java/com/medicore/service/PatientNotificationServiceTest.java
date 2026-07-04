package com.medicore.service;

import com.medicore.common.constants.AppointmentStatus;
import com.medicore.entity.clinical.Appointment;
import com.medicore.entity.notification.Notification;
import com.medicore.entity.user.AuthCredentials;
import com.medicore.entity.user.Doctor;
import com.medicore.entity.user.Patient;
import com.medicore.repository.AuthCredentialsRepository;
import com.medicore.repository.NotificationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PatientNotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private AuthCredentialsRepository authCredentialsRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private PatientNotificationService patientNotificationService;

    @Test
    void notifyAppointmentStatusChanged_shouldCreateCancellationNotification() {
        Patient patient = new Patient();
        patient.setId(1);
        patient.setPatientCode("P001");
        patient.setFullName("Nguyễn Văn A");

        Doctor doctor = new Doctor();
        doctor.setId(2);
        doctor.setDoctorName("BS. Minh");

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(LocalDate.now())
                .timeSlot("09:00-09:30")
                .build();
        appointment.setId(10);

        AuthCredentials credentials = new AuthCredentials();
        credentials.setEmail("patient@example.com");
        credentials.setPatient(patient);

        when(authCredentialsRepository.findByPatientId(1)).thenReturn(Optional.of(credentials));
        when(notificationRepository.existsByRecipientEmailAndAppointmentIdAndType("patient@example.com", 10, "APPOINTMENT_CANCELLED"))
                .thenReturn(false);
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(notificationRepository.countByRecipientEmailAndReadAtIsNull("patient@example.com")).thenReturn(1L);

        patientNotificationService.notifyAppointmentStatusChanged(appointment, AppointmentStatus.WAITING, AppointmentStatus.CANCELLED, "Bác sĩ bận việc");

        verify(notificationRepository).save(any(Notification.class));
        verify(notificationService).notifyPatient(eq("patient@example.com"), eq("APPOINTMENT_CANCELLED"), anyString(), any());
        verify(emailService).sendHtmlEmail(eq("patient@example.com"), contains("hủy"), anyString());
    }
}
