package com.medicore.service;

import com.medicore.common.constants.AppointmentStatus;
import com.medicore.common.constants.ErrorCodes;
import com.medicore.common.exception.CustomBusinessException;
import com.medicore.dto.response.NotificationListResponse;
import com.medicore.dto.response.NotificationResponse;
import com.medicore.entity.clinical.Appointment;
import com.medicore.entity.notification.Notification;
import com.medicore.entity.user.AuthCredentials;
import com.medicore.repository.AuthCredentialsRepository;
import com.medicore.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientNotificationService {

    private static final String EXAM_STARTED = "EXAM_STARTED";

    private final NotificationRepository notificationRepository;
    private final AuthCredentialsRepository authCredentialsRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public NotificationListResponse getCurrentPatientNotifications(String email) {
        List<NotificationResponse> notifications = notificationRepository.findTop20ByRecipientEmailOrderByCreatedAtDesc(email).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        long unreadCount = notificationRepository.countByRecipientEmailAndReadAtIsNull(email);
        return NotificationListResponse.builder()
                .notifications(notifications)
                .unreadCount(unreadCount)
                .build();
    }

    @Transactional
    public NotificationResponse markAsRead(Integer id, String email) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));
        ensureOwner(notification, email);
        if (notification.getReadAt() == null) {
            notification.setReadAt(LocalDateTime.now());
            notification = notificationRepository.save(notification);
        }
        NotificationResponse response = mapToResponse(notification);
        response.setUnreadCount(notificationRepository.countByRecipientEmailAndReadAtIsNull(email));
        return response;
    }

    @Transactional
    public NotificationListResponse markAllAsRead(String email) {
        List<Notification> unreadNotifications = notificationRepository.findByRecipientEmailAndReadAtIsNull(email);
        LocalDateTime now = LocalDateTime.now();
        unreadNotifications.forEach(notification -> notification.setReadAt(now));
        notificationRepository.saveAll(unreadNotifications);
        return getCurrentPatientNotifications(email);
    }

    @Transactional
    public void notifyExamStarted(Appointment appointment, AppointmentStatus oldStatus, AppointmentStatus newStatus) {
        if (newStatus != AppointmentStatus.IN_PROGRESS) {
            return;
        }
        if (appointment.getPatient() == null) {
            log.warn("Skip exam notification: appointment {} has no patient", appointment.getId());
            return;
        }

        AuthCredentials credentials = authCredentialsRepository.findByPatientId(appointment.getPatient().getId())
                .orElse(null);
        if (credentials == null) {
            log.warn("Skip exam notification: patient {} has no auth credentials", appointment.getPatient().getId());
            return;
        }
        if (notificationRepository.existsByRecipientEmailAndAppointmentIdAndType(credentials.getEmail(), appointment.getId(), EXAM_STARTED)) {
            log.info("Skip exam notification: already exists for appointment {} and patient {}", appointment.getId(), credentials.getEmail());
            return;
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("appointmentId", appointment.getId());
        data.put("doctorId", appointment.getDoctor() != null ? appointment.getDoctor().getId() : null);
        data.put("doctorName", appointment.getDoctor() != null ? appointment.getDoctor().getDoctorName() : null);
        data.put("patientId", appointment.getPatient().getId());

        Notification notification = Notification.builder()
                .recipientEmail(credentials.getEmail())
                .patient(appointment.getPatient())
                .appointment(appointment)
                .type(EXAM_STARTED)
                .title("Bác sĩ đã bắt đầu khám")
                .message("Bạn vui lòng vào phòng khám.")
                .data(data)
                .build();

        notification = notificationRepository.save(notification);
        log.info("Created exam notification {} for appointment {} and patient {}", notification.getId(), appointment.getId(), credentials.getEmail());
        NotificationResponse response = mapToResponse(notification);
        response.setUnreadCount(notificationRepository.countByRecipientEmailAndReadAtIsNull(credentials.getEmail()));
        notificationService.notifyPatient(credentials.getEmail(), EXAM_STARTED, response.getMessage(), response);
    }

    private void ensureOwner(Notification notification, String email) {
        if (!email.equals(notification.getRecipientEmail())) {
            throw new CustomBusinessException(ErrorCodes.FORBIDDEN);
        }
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .data(notification.getData())
                .readAt(notification.getReadAt())
                .createdAt(notification.getCreatedAt())
                .appointmentId(notification.getAppointment() != null ? notification.getAppointment().getId() : null)
                .build();
    }
}
