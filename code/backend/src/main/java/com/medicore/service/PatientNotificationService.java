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
    private static final String APPOINTMENT_CANCELLED = "APPOINTMENT_CANCELLED";
    private static final String APPOINTMENT_COMPLETED = "APPOINTMENT_COMPLETED";

    private final NotificationRepository notificationRepository;
    private final AuthCredentialsRepository authCredentialsRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

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

        sendExamStartedEmail(appointment, credentials.getEmail());
    }

    @Transactional
    public void notifyAppointmentStatusChanged(Appointment appointment, AppointmentStatus oldStatus, AppointmentStatus newStatus, String cancellationReason) {
        if (newStatus == null || oldStatus == newStatus) {
            return;
        }
        if (newStatus != AppointmentStatus.CANCELLED && newStatus != AppointmentStatus.DONE) {
            return;
        }
        if (appointment.getPatient() == null) {
            log.warn("Skip appointment status notification: appointment {} has no patient", appointment.getId());
            return;
        }

        AuthCredentials credentials = authCredentialsRepository.findByPatientId(appointment.getPatient().getId())
                .orElse(null);
        if (credentials == null) {
            log.warn("Skip appointment status notification: patient {} has no auth credentials", appointment.getPatient().getId());
            return;
        }

        String type = newStatus == AppointmentStatus.CANCELLED ? APPOINTMENT_CANCELLED : APPOINTMENT_COMPLETED;
        if (notificationRepository.existsByRecipientEmailAndAppointmentIdAndType(credentials.getEmail(), appointment.getId(), type)) {
            log.info("Skip appointment status notification: already exists for appointment {} and patient {}", appointment.getId(), credentials.getEmail());
            return;
        }

        String title = newStatus == AppointmentStatus.CANCELLED ? "Lịch khám đã bị hủy" : "Khám bệnh đã hoàn tất";
        String message = newStatus == AppointmentStatus.CANCELLED
                ? buildCancellationMessage(cancellationReason)
                : "Buổi khám của bạn đã được ghi nhận hoàn tất. Hồ sơ bệnh án và đơn thuốc đã được lưu trong hệ thống.";

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("appointmentId", appointment.getId());
        data.put("doctorId", appointment.getDoctor() != null ? appointment.getDoctor().getId() : null);
        data.put("doctorName", appointment.getDoctor() != null ? appointment.getDoctor().getDoctorName() : null);
        data.put("patientId", appointment.getPatient().getId());
        data.put("oldStatus", oldStatus != null ? oldStatus.name() : null);
        data.put("newStatus", newStatus.name());
        data.put("reason", cancellationReason);

        Notification notification = Notification.builder()
                .recipientEmail(credentials.getEmail())
                .patient(appointment.getPatient())
                .appointment(appointment)
                .type(type)
                .title(title)
                .message(message)
                .data(data)
                .build();

        notification = notificationRepository.save(notification);
        log.info("Created {} notification {} for appointment {} and patient {}", type, notification.getId(), appointment.getId(), credentials.getEmail());
        NotificationResponse response = mapToResponse(notification);
        response.setUnreadCount(notificationRepository.countByRecipientEmailAndReadAtIsNull(credentials.getEmail()));
        notificationService.notifyPatient(credentials.getEmail(), type, response.getMessage(), response);
        sendAppointmentStatusEmail(appointment, credentials.getEmail(), newStatus, cancellationReason);
    }

    private void sendExamStartedEmail(Appointment appointment, String recipientEmail) {
        try {
            String patientName = appointment.getPatient() != null ? appointment.getPatient().getFullName() : "N/A";
            String patientCode = appointment.getPatient() != null ? appointment.getPatient().getPatientCode() : "N/A";
            String doctorName = appointment.getDoctor() != null ? appointment.getDoctor().getDoctorName() : "N/A";
            String specialtyName = (appointment.getDoctor() != null && appointment.getDoctor().getSpecialty() != null)
                    ? appointment.getDoctor().getSpecialty().getSpecialtyName()
                    : "N/A";
            String appointmentDate = appointment.getAppointmentDate() != null ? appointment.getAppointmentDate().toString() : "N/A";
            String timeSlot = appointment.getTimeSlot() != null ? appointment.getTimeSlot() : "N/A";

            String subject = "[MediCore] Mời vào phòng khám - Bệnh nhân " + patientName;
            String htmlContent = buildExamStartedEmailTemplate(patientName, patientCode, doctorName, specialtyName, appointmentDate, timeSlot);

            emailService.sendHtmlEmail(recipientEmail, subject, htmlContent);
        } catch (Exception e) {
            log.error("Lỗi khi gửi email thông báo bắt đầu khám cho lịch hẹn {}", appointment.getId(), e);
        }
    }

    private void sendAppointmentStatusEmail(Appointment appointment, String recipientEmail, AppointmentStatus newStatus, String cancellationReason) {
        try {
            String patientName = appointment.getPatient() != null ? appointment.getPatient().getFullName() : "N/A";
            String patientCode = appointment.getPatient() != null ? appointment.getPatient().getPatientCode() : "N/A";
            String doctorName = appointment.getDoctor() != null ? appointment.getDoctor().getDoctorName() : "N/A";
            String specialtyName = (appointment.getDoctor() != null && appointment.getDoctor().getSpecialty() != null)
                    ? appointment.getDoctor().getSpecialty().getSpecialtyName()
                    : "N/A";
            String appointmentDate = appointment.getAppointmentDate() != null ? appointment.getAppointmentDate().toString() : "N/A";
            String timeSlot = appointment.getTimeSlot() != null ? appointment.getTimeSlot() : "N/A";

            String subject = newStatus == AppointmentStatus.CANCELLED
                    ? "[MediCore] Lịch khám đã bị hủy - Bệnh nhân " + patientName
                    : "[MediCore] Hoàn tất khám bệnh - Bệnh nhân " + patientName;
            String htmlContent = newStatus == AppointmentStatus.CANCELLED
                    ? buildCancellationEmailTemplate(patientName, patientCode, doctorName, specialtyName, appointmentDate, timeSlot, cancellationReason)
                    : buildCompletionEmailTemplate(patientName, patientCode, doctorName, specialtyName, appointmentDate, timeSlot);

            emailService.sendHtmlEmail(recipientEmail, subject, htmlContent);
        } catch (Exception e) {
            log.error("Lỗi khi gửi email thông báo trạng thái lịch hẹn {} cho lịch hẹn {}", newStatus, appointment.getId(), e);
        }
    }

    private String buildCancellationMessage(String cancellationReason) {
        String baseReason = (cancellationReason != null && !cancellationReason.isBlank())
                ? "Lý do: " + cancellationReason + "."
                : "Lý do: bác sĩ cần điều chỉnh lịch làm việc.";
        return "Lịch khám của bạn đã bị hủy. " + baseReason + " Chúng tôi xin lỗi vì sự bất tiện này. Vui lòng đặt lại lịch khám khác nếu cần.";
    }

    private String buildCancellationEmailTemplate(String patientName, String patientCode, String doctorName, String specialtyName, String appointmentDate, String timeSlot, String cancellationReason) {
        String reasonText = (cancellationReason != null && !cancellationReason.isBlank())
                ? cancellationReason
                : "Bác sĩ cần điều chỉnh lịch làm việc.";
        return "<!DOCTYPE html>" +
                "<html><head><meta charset=\"utf-8\"><title>Hủy lịch hẹn - MediCore</title></head><body style=\"font-family:Arial,sans-serif;background:#f4f6f8;padding:24px;\">" +
                "<div style=\"max-width:620px;margin:auto;background:#fff;border-radius:12px;padding:24px;box-shadow:0 4px 12px rgba(0,0,0,0.06);\">" +
                "<h2 style=\"color:#0f172a;margin-top:0;\">Lịch khám đã bị hủy</h2>" +
                "<p>Kính chào Ông/Bà " + patientName + ",</p>" +
                "<p>Lịch khám của bạn đã bị hủy bởi bác sĩ phụ trách.</p>" +
                "<p><strong>Lý do:</strong> " + reasonText + "</p>" +
                "<p>Chúng tôi xin lỗi vì sự bất tiện này. Nếu cần, quý khách có thể đặt lại lịch khám khác tại hệ thống MediCore.</p>" +
                "<p><strong>Bác sĩ:</strong> " + doctorName + "<br/><strong>Chuyên khoa:</strong> " + specialtyName + "<br/><strong>Ngày:</strong> " + appointmentDate + "<br/><strong>Khung giờ:</strong> " + timeSlot + "</p>" +
                "<p>Trân trọng,<br/>MediCore</p>" +
                "</div></body></html>";
    }

    private String buildCompletionEmailTemplate(String patientName, String patientCode, String doctorName, String specialtyName, String appointmentDate, String timeSlot) {
        return "<!DOCTYPE html>" +
                "<html><head><meta charset=\"utf-8\"><title>Hoàn tất khám bệnh - MediCore</title></head><body style=\"font-family:Arial,sans-serif;background:#f4f6f8;padding:24px;\">" +
                "<div style=\"max-width:620px;margin:auto;background:#fff;border-radius:12px;padding:24px;box-shadow:0 4px 12px rgba(0,0,0,0.06);\">" +
                "<h2 style=\"color:#0f172a;margin-top:0;\">Khám bệnh đã hoàn tất</h2>" +
                "<p>Kính chào Ông/Bà " + patientName + ",</p>" +
                "<p>Buổi khám của bạn đã được ghi nhận hoàn tất. Hồ sơ bệnh án và đơn thuốc đã được lưu trong hệ thống.</p>" +
                "<p><strong>Bác sĩ:</strong> " + doctorName + "<br/><strong>Chuyên khoa:</strong> " + specialtyName + "<br/><strong>Ngày:</strong> " + appointmentDate + "<br/><strong>Khung giờ:</strong> " + timeSlot + "</p>" +
                "<p>Trân trọng,<br/>MediCore</p>" +
                "</div></body></html>";
    }

    private String buildExamStartedEmailTemplate(String patientName, String patientCode, String doctorName, String specialtyName, String appointmentDate, String timeSlot) {
        return "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "    <meta charset=\"utf-8\">\n" +
                "    <title>Mời Vào Phòng Khám - MediCore</title>\n" +
                "    <style>\n" +
                "        body {\n" +
                "            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;\n" +
                "            background-color: #f4f6f8;\n" +
                "            margin: 0;\n" +
                "            padding: 0;\n" +
                "            color: #333333;\n" +
                "        }\n" +
                "        .container {\n" +
                "            max-width: 600px;\n" +
                "            margin: 30px auto;\n" +
                "            background: #ffffff;\n" +
                "            border-radius: 12px;\n" +
                "            overflow: hidden;\n" +
                "            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);\n" +
                "            border: 1px solid #eef2f5;\n" +
                "        }\n" +
                "        .header {\n" +
                "            background: linear-gradient(135deg, #0f172a, #1e293b);\n" +
                "            color: #ffffff;\n" +
                "            padding: 30px 20px;\n" +
                "            text-align: center;\n" +
                "        }\n" +
                "        .header h1 {\n" +
                "            margin: 0;\n" +
                "            font-size: 24px;\n" +
                "            font-weight: 600;\n" +
                "            letter-spacing: 0.5px;\n" +
                "        }\n" +
                "        .header p {\n" +
                "            margin: 5px 0 0 0;\n" +
                "            font-size: 14px;\n" +
                "            color: #94a3b8;\n" +
                "        }\n" +
                "        .content {\n" +
                "            padding: 30px 40px;\n" +
                "        }\n" +
                "        .greeting {\n" +
                "            font-size: 18px;\n" +
                "            font-weight: 600;\n" +
                "            margin-bottom: 20px;\n" +
                "            color: #0f172a;\n" +
                "        }\n" +
                "        .invitation-box {\n" +
                "            background-color: #f0fdf4;\n" +
                "            border-left: 4px solid #22c55e;\n" +
                "            padding: 15px 20px;\n" +
                "            border-radius: 4px;\n" +
                "            margin-bottom: 25px;\n" +
                "            font-size: 15px;\n" +
                "            line-height: 1.6;\n" +
                "            color: #166534;\n" +
                "        }\n" +
                "        .section-title {\n" +
                "            font-size: 14px;\n" +
                "            text-transform: uppercase;\n" +
                "            letter-spacing: 1px;\n" +
                "            color: #64748b;\n" +
                "            margin-bottom: 12px;\n" +
                "            font-weight: bold;\n" +
                "            border-bottom: 1px solid #f1f5f9;\n" +
                "            padding-bottom: 6px;\n" +
                "        }\n" +
                "        .info-grid {\n" +
                "            width: 100%;\n" +
                "            border-collapse: collapse;\n" +
                "            margin-bottom: 25px;\n" +
                "        }\n" +
                "        .info-grid td {\n" +
                "            padding: 10px 0;\n" +
                "            vertical-align: top;\n" +
                "            font-size: 15px;\n" +
                "        }\n" +
                "        .info-label {\n" +
                "            color: #64748b;\n" +
                "            width: 35%;\n" +
                "            font-weight: 500;\n" +
                "        }\n" +
                "        .info-value {\n" +
                "            color: #0f172a;\n" +
                "            font-weight: 600;\n" +
                "        }\n" +
                "        .footer {\n" +
                "            background-color: #f8fafc;\n" +
                "            padding: 20px;\n" +
                "            text-align: center;\n" +
                "            font-size: 13px;\n" +
                "            color: #64748b;\n" +
                "            border-top: 1px solid #f1f5f9;\n" +
                "        }\n" +
                "        .footer p {\n" +
                "            margin: 5px 0;\n" +
                "        }\n" +
                "        .btn {\n" +
                "            display: inline-block;\n" +
                "            background: #2563eb;\n" +
                "            color: #ffffff !important;\n" +
                "            padding: 12px 25px;\n" +
                "            border-radius: 6px;\n" +
                "            text-decoration: none;\n" +
                "            font-weight: 600;\n" +
                "            margin-top: 10px;\n" +
                "            font-size: 15px;\n" +
                "            box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);\n" +
                "        }\n" +
                "    </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "    <div class=\"container\">\n" +
                "        <div class=\"header\">\n" +
                "            <h1>MediCore EMR</h1>\n" +
                "            <p>Hệ Thống Quản Lý Hồ Sơ Bệnh Án Điện Tử</p>\n" +
                "        </div>\n" +
                "        <div class=\"content\">\n" +
                "            <div class=\"greeting\">Kính chào Ông/Bà " + patientName + ",</div>\n" +
                "            <div class=\"invitation-box\">\n" +
                "                Bác sĩ phụ trách đã bắt đầu phiên khám cho lịch hẹn của Ông/Bà. Kính mời Ông/Bà di chuyển vào phòng khám để được bác sĩ trực tiếp thăm khám.\n" +
                "            </div>\n" +
                "            \n" +
                "            <div class=\"section-title\">Thông tin bệnh nhân</div>\n" +
                "            <table class=\"info-grid\">\n" +
                "                <tr>\n" +
                "                    <td class=\"info-label\">Mã bệnh nhân:</td>\n" +
                "                    <td class=\"info-value\">" + patientCode + "</td>\n" +
                "                </tr>\n" +
                "                <tr>\n" +
                "                    <td class=\"info-label\">Họ và tên:</td>\n" +
                "                    <td class=\"info-value\">" + patientName + "</td>\n" +
                "                </tr>\n" +
                "            </table>\n" +
                "\n" +
                "            <div class=\"section-title\">Thông tin lịch hẹn</div>\n" +
                "            <table class=\"info-grid\">\n" +
                "                <tr>\n" +
                "                    <td class=\"info-label\">Bác sĩ khám:</td>\n" +
                "                    <td class=\"info-value\">" + doctorName + "</td>\n" +
                "                </tr>\n" +
                "                <tr>\n" +
                "                    <td class=\"info-label\">Chuyên khoa:</td>\n" +
                "                    <td class=\"info-value\">" + specialtyName + "</td>\n" +
                "                </tr>\n" +
                "                <tr>\n" +
                "                    <td class=\"info-label\">Ngày khám:</td>\n" +
                "                    <td class=\"info-value\">" + appointmentDate + "</td>\n" +
                "                </tr>\n" +
                "                <tr>\n" +
                "                    <td class=\"info-label\">Khung giờ:</td>\n" +
                "                    <td class=\"info-value\">" + timeSlot + "</td>\n" +
                "                </tr>\n" +
                "            </table>\n" +
                "            \n" +
                "            <div style=\"text-align: center; margin-top: 10px;\">\n" +
                "                <a href=\"http://localhost:3000/dashboard/appointments\" class=\"btn\">Xem chi tiết lịch hẹn</a>\n" +
                "            </div>\n" +
                "        </div>\n" +
                "        <div class=\"footer\">\n" +
                "            <p>Email này được gửi tự động từ hệ thống quản lý phòng khám MediCore.</p>\n" +
                "            <p>Vui lòng không trả lời trực tiếp email này.</p>\n" +
                "            <p>&copy; 2026 MediCore. All rights reserved.</p>\n" +
                "        </div>\n" +
                "    </div>\n" +
                "</body>\n" +
                "</html>";
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
