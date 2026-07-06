package com.medicore.service;

import com.medicore.common.constants.AppointmentStatus;
import com.medicore.common.constants.ErrorCodes;
import com.medicore.common.exception.CustomBusinessException;
import com.medicore.dto.response.NotificationListResponse;
import com.medicore.dto.response.NotificationResponse;
import com.medicore.entity.clinical.Appointment;
import com.medicore.entity.clinical.MedicalRecord;
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

    private static final String APPOINTMENT_CONFIRMED = "APPOINTMENT_CONFIRMED";
    private static final String EXAM_STARTED = "EXAM_STARTED";
    private static final String MEDICAL_RECORD_READY = "MEDICAL_RECORD_READY";

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
    public void notifyAppointmentStatusChanged(Appointment appointment, AppointmentStatus oldStatus, AppointmentStatus newStatus) {
        if (oldStatus == newStatus) {
            return;
        }
        if (newStatus == AppointmentStatus.CONFIRMED) {
            createPatientAppointmentNotification(
                    appointment,
                    APPOINTMENT_CONFIRMED,
                    "Bác sĩ đã xác nhận lịch khám",
                    "Lịch khám của bạn đã được bác sĩ xác nhận. Vui lòng đến đúng ca khám đã đặt.",
                    "/dashboard/appointments?tab=appointments");
            notifyDoctorAppointmentConfirmed(appointment);
            return;
        }
        if (newStatus == AppointmentStatus.IN_PROGRESS) {
            NotificationResponse response = createPatientAppointmentNotification(
                    appointment,
                    EXAM_STARTED,
                    "Bác sĩ đã bắt đầu khám",
                    "Bạn vui lòng vào phòng khám.",
                    "/dashboard/appointments?tab=appointments");
            if (response != null) {
                sendExamStartedEmail(appointment, response.getRecipientEmail());
            }
        }
    }

    @Transactional
    public void notifyExamStarted(Appointment appointment, AppointmentStatus oldStatus, AppointmentStatus newStatus) {
        notifyAppointmentStatusChanged(appointment, oldStatus, newStatus);
    }

    @Transactional
    public void notifyMedicalRecordReady(MedicalRecord record) {
        if (record == null || record.getAppointment() == null) {
            return;
        }
        Appointment appointment = record.getAppointment();
        NotificationResponse response = createPatientAppointmentNotification(
                appointment,
                MEDICAL_RECORD_READY,
                "Hồ sơ khám đã sẵn sàng",
                "Phiếu khám và đơn thuốc PDF đã được gửi qua email. Bạn cũng có thể xem trong Hồ sơ sức khỏe.",
                "/dashboard/history",
                record.getId(),
                record.getPdfUrl());
        if (response != null) {
            sendMedicalRecordReadyEmail(record, response.getRecipientEmail());
        }
    }

    private NotificationResponse createPatientAppointmentNotification(
            Appointment appointment,
            String type,
            String title,
            String message,
            String redirectUrl) {
        return createPatientAppointmentNotification(appointment, type, title, message, redirectUrl, null, null);
    }

    private NotificationResponse createPatientAppointmentNotification(
            Appointment appointment,
            String type,
            String title,
            String message,
            String redirectUrl,
            Integer medicalRecordId,
            String pdfUrl) {
        if (appointment.getPatient() == null) {
            log.warn("Skip patient notification: appointment {} has no patient", appointment.getId());
            return null;
        }

        AuthCredentials credentials = authCredentialsRepository.findByPatientId(appointment.getPatient().getId())
                .orElse(null);
        if (credentials == null) {
            log.warn("Skip patient notification: patient {} has no auth credentials", appointment.getPatient().getId());
            return null;
        }
        if (notificationRepository.existsByRecipientEmailAndAppointmentIdAndType(credentials.getEmail(), appointment.getId(), type)) {
            log.info("Skip patient notification: type {} already exists for appointment {} and patient {}", type, appointment.getId(), credentials.getEmail());
            return null;
        }

        Map<String, Object> data = buildAppointmentNotificationData(appointment, redirectUrl);
        if (medicalRecordId != null) {
            data.put("medicalRecordId", medicalRecordId);
        }
        if (pdfUrl != null && !pdfUrl.isBlank()) {
            data.put("pdfUrl", pdfUrl);
        }

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
        log.info("Created patient notification {} type {} for appointment {} and patient {}", notification.getId(), type, appointment.getId(), credentials.getEmail());
        NotificationResponse response = mapToResponse(notification);
        response.setUnreadCount(notificationRepository.countByRecipientEmailAndReadAtIsNull(credentials.getEmail()));
        notificationService.notifyPatient(credentials.getEmail(), type, response.getMessage(), response);
        return response;
    }

    private void notifyDoctorAppointmentConfirmed(Appointment appointment) {
        if (appointment.getDoctor() == null) {
            return;
        }
        AuthCredentials doctorCredentials = authCredentialsRepository.findByDoctorId(appointment.getDoctor().getId()).orElse(null);
        if (doctorCredentials == null) {
            log.warn("Skip doctor confirmation notification: doctor {} has no auth credentials", appointment.getDoctor().getId());
            return;
        }
        Map<String, Object> data = buildAppointmentNotificationData(appointment, "/doctor/appointments");
        notificationService.notifyPatient(
                doctorCredentials.getEmail(),
                APPOINTMENT_CONFIRMED,
                "Bạn đã xác nhận lịch khám. Thông báo đã được gửi cho bệnh nhân.",
                data);
    }

    private Map<String, Object> buildAppointmentNotificationData(Appointment appointment, String redirectUrl) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("appointmentId", appointment.getId());
        data.put("status", appointment.getStatus() != null ? appointment.getStatus().name() : null);
        data.put("doctorId", appointment.getDoctor() != null ? appointment.getDoctor().getId() : null);
        data.put("doctorName", appointment.getDoctor() != null ? appointment.getDoctor().getDoctorName() : null);
        data.put("patientId", appointment.getPatient() != null ? appointment.getPatient().getId() : null);
        data.put("appointmentDate", appointment.getAppointmentDate() != null ? appointment.getAppointmentDate().toString() : null);
        data.put("timeSlot", appointment.getTimeSlot());
        data.put("redirectUrl", redirectUrl);
        return data;
    }

    private void sendMedicalRecordReadyEmail(MedicalRecord record, String recipientEmail) {
        try {
            Appointment appointment = record.getAppointment();
            String patientName = appointment.getPatient() != null ? appointment.getPatient().getFullName() : "N/A";
            String patientCode = appointment.getPatient() != null ? appointment.getPatient().getPatientCode() : "N/A";
            String doctorName = appointment.getDoctor() != null ? appointment.getDoctor().getDoctorName() : "N/A";
            String appointmentDate = appointment.getAppointmentDate() != null ? appointment.getAppointmentDate().toString() : "N/A";
            String timeSlot = appointment.getTimeSlot() != null ? appointment.getTimeSlot() : "N/A";
            String diagnosis = record.getMainDiagnosis() != null && !record.getMainDiagnosis().isBlank()
                    ? record.getMainDiagnosis()
                    : "Xem chi tiết trong hồ sơ sức khỏe";

            String subject = "[MediCore] Hồ sơ khám và đơn thuốc PDF đã sẵn sàng";
            String htmlContent = buildMedicalRecordReadyEmailTemplate(patientName, patientCode, doctorName, appointmentDate, timeSlot, diagnosis);
            emailService.sendHtmlEmail(recipientEmail, subject, htmlContent);
        } catch (Exception e) {
            Integer appointmentId = record != null && record.getAppointment() != null ? record.getAppointment().getId() : null;
            log.error("Lỗi khi gửi email thông báo hồ sơ khám cho lịch hẹn {}", appointmentId, e);
        }
    }

    private String buildMedicalRecordReadyEmailTemplate(String patientName, String patientCode, String doctorName, String appointmentDate, String timeSlot, String diagnosis) {
        return "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "    <meta charset=\"utf-8\">\n" +
                "    <title>Hồ sơ khám đã sẵn sàng - MediCore</title>\n" +
                "</head>\n" +
                "<body style=\"font-family: Arial, sans-serif; background:#f4f6f8; margin:0; padding:24px; color:#0f172a;\">\n" +
                "  <div style=\"max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e5e7eb;\">\n" +
                "    <div style=\"background:#0f172a; color:#ffffff; padding:24px; text-align:center;\">\n" +
                "      <h1 style=\"margin:0; font-size:22px;\">MediCore EMR</h1>\n" +
                "      <p style=\"margin:6px 0 0; color:#cbd5e1;\">Hồ sơ khám và đơn thuốc PDF đã sẵn sàng</p>\n" +
                "    </div>\n" +
                "    <div style=\"padding:28px;\">\n" +
                "      <p style=\"font-size:17px; font-weight:700;\">Kính chào Ông/Bà " + patientName + ",</p>\n" +
                "      <p style=\"line-height:1.6;\">Phiếu khám và đơn thuốc PDF của Ông/Bà đã được cập nhật trong Hồ sơ sức khỏe. Vui lòng đăng nhập MediCore để xem hoặc tải file khi cần.</p>\n" +
                "      <div style=\"background:#f0fdf4; border-left:4px solid #22c55e; padding:14px 16px; margin:20px 0; border-radius:6px;\">\n" +
                "        <strong>Chẩn đoán chính:</strong> " + diagnosis + "\n" +
                "      </div>\n" +
                "      <table style=\"width:100%; border-collapse:collapse; font-size:14px;\">\n" +
                "        <tr><td style=\"padding:8px 0; color:#64748b;\">Mã bệnh nhân</td><td style=\"padding:8px 0; font-weight:700;\">" + patientCode + "</td></tr>\n" +
                "        <tr><td style=\"padding:8px 0; color:#64748b;\">Bác sĩ khám</td><td style=\"padding:8px 0; font-weight:700;\">" + doctorName + "</td></tr>\n" +
                "        <tr><td style=\"padding:8px 0; color:#64748b;\">Ngày khám</td><td style=\"padding:8px 0; font-weight:700;\">" + appointmentDate + "</td></tr>\n" +
                "        <tr><td style=\"padding:8px 0; color:#64748b;\">Khung giờ</td><td style=\"padding:8px 0; font-weight:700;\">" + timeSlot + "</td></tr>\n" +
                "      </table>\n" +
                "      <div style=\"text-align:center; margin-top:24px;\">\n" +
                "        <a href=\"http://localhost:3000/dashboard/history\" style=\"display:inline-block; background:#2563eb; color:#ffffff; padding:12px 22px; border-radius:8px; text-decoration:none; font-weight:700;\">Xem Hồ sơ sức khỏe</a>\n" +
                "      </div>\n" +
                "    </div>\n" +
                "    <div style=\"background:#f8fafc; color:#64748b; text-align:center; padding:16px; font-size:12px;\">Email này được gửi tự động từ MediCore.</div>\n" +
                "  </div>\n" +
                "</body>\n" +
                "</html>";
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
                .recipientEmail(notification.getRecipientEmail())
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
