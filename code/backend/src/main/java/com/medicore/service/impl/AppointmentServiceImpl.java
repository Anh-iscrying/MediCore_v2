package com.medicore.service.impl;

import com.medicore.common.constants.AppointmentStatus;
import com.medicore.common.constants.ErrorCodes;
import com.medicore.common.exception.CustomBusinessException;
import com.medicore.dto.request.AppointmentRequest;
import com.medicore.dto.response.AppointmentResponse;
import com.medicore.entity.clinical.Appointment;
import com.medicore.entity.clinical.DoctorSchedule;
import com.medicore.entity.user.Doctor;
import com.medicore.entity.user.Patient;
import com.medicore.repository.AppointmentRepository;
import com.medicore.repository.DoctorRepository;
import com.medicore.repository.DoctorScheduleRepository;
import com.medicore.repository.PatientRepository;
import com.medicore.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorScheduleRepository doctorScheduleRepository;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAllAppointments() {
        // JOIN FETCH: 1 query thay vì N+1 lazy loading
        return appointmentRepository.findAllWithRelations().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointmentsByPatient(String patientIdOrCode) {
        Patient patient = findPatientByIdOrCode(patientIdOrCode);
        return appointmentRepository.findByPatientPatientCode(patient.getPatientCode()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointmentsByDoctor(Integer doctorId) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new CustomBusinessException(ErrorCodes.NOT_FOUND);
        }
        return appointmentRepository.findByDoctorId(doctorId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponse getAppointmentById(Integer id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));
        return mapToResponse(appointment);
    }

    @Override
    @Transactional
    public AppointmentResponse createAppointment(AppointmentRequest request) {
        Patient patient = findPatientByIdOrCode(request.getPatientId());
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));

        LocalDate appDate = LocalDate.parse(request.getAppointmentDate(), DATE_FORMATTER);
        AppointmentStatus status = mapToStatusEntity(request.getStatus());
        validateAppointmentAvailability(doctor.getId(), appDate, request.getTimeSlot(), null);

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(appDate)
                .timeSlot(request.getTimeSlot())
                .symptomsInitial(request.getSymptomsInitial())
                .status(status)
                .build();

        appointment.setCreatedAt(LocalDateTime.now());
        appointment.setUpdatedAt(LocalDateTime.now());

        try {
            appointment = appointmentRepository.save(appointment);
        } catch (DataIntegrityViolationException e) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Khung giờ này đã có bệnh nhân đặt lịch");
        }
        return mapToResponse(appointment);
    }

    @Override
    @Transactional
    public AppointmentResponse updateAppointment(Integer id, AppointmentRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));

        Patient patient = findPatientByIdOrCode(request.getPatientId());
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));

        LocalDate appDate = LocalDate.parse(request.getAppointmentDate(), DATE_FORMATTER);
        AppointmentStatus status = mapToStatusEntity(request.getStatus());
        validateAppointmentAvailability(doctor.getId(), appDate, request.getTimeSlot(), appointment.getId());

        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(appDate);
        appointment.setTimeSlot(request.getTimeSlot());
        appointment.setSymptomsInitial(request.getSymptomsInitial());
        appointment.setStatus(status);
        appointment.setUpdatedAt(LocalDateTime.now());

        try {
            appointment = appointmentRepository.save(appointment);
        } catch (DataIntegrityViolationException e) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Khung giờ này đã có bệnh nhân đặt lịch");
        }
        return mapToResponse(appointment);
    }

    @Override
    @Transactional
    public void deleteAppointment(Integer id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));
        appointmentRepository.delete(appointment);
    }

    private void validateAppointmentAvailability(Integer doctorId, LocalDate appDate, String appointmentTimeSlot, Integer currentAppointmentId) {
        List<DoctorSchedule> schedules = doctorScheduleRepository.findByDoctorIdAndWorkDate(doctorId, appDate).stream()
                .filter(schedule -> schedule.getIsBooked() == null || !schedule.getIsBooked())
                .filter(schedule -> isWorkingSchedule(schedule.getTimeSlot()))
                .collect(Collectors.toList());

        if (schedules.isEmpty()) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Bác sĩ không có lịch trực vào ngày đã chọn");
        }

        boolean timeSlotInSchedule = schedules.stream()
                .anyMatch(schedule -> isAppointmentSlotInsideSchedule(appointmentTimeSlot, schedule.getTimeSlot()));

        if (!timeSlotInSchedule) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Khung giờ hẹn không nằm trong ca trực của bác sĩ");
        }

        boolean isBooked = currentAppointmentId == null
                ? appointmentRepository.existsByDoctorIdAndAppointmentDateAndTimeSlot(doctorId, appDate, appointmentTimeSlot)
                : appointmentRepository.existsByDoctorIdAndAppointmentDateAndTimeSlotAndIdNot(doctorId, appDate, appointmentTimeSlot, currentAppointmentId);

        if (isBooked) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Khung giờ này đã có bệnh nhân đặt lịch");
        }
    }

    private boolean isWorkingSchedule(String scheduleTimeSlot) {
        if (scheduleTimeSlot == null || scheduleTimeSlot.isBlank()) {
            return false;
        }
        String normalized = scheduleTimeSlot.trim().toLowerCase();
        return !normalized.equals("off") && !normalized.equals("nghỉ");
    }

    private boolean isAppointmentSlotInsideSchedule(String appointmentTimeSlot, String scheduleTimeSlot) {
        if (appointmentTimeSlot == null || scheduleTimeSlot == null) {
            return false;
        }

        try {
            String normalizedSchedule = scheduleTimeSlot.trim().toLowerCase();
            if (normalizedSchedule.equals("morning") || normalizedSchedule.equals("ca sáng")) {
                normalizedSchedule = "08:00 - 12:00";
            } else if (normalizedSchedule.equals("afternoon") || normalizedSchedule.equals("ca chiều")) {
                normalizedSchedule = "13:30 - 17:30";
            } else if (normalizedSchedule.equals("full_day") || normalizedSchedule.equals("cả ngày") || normalizedSchedule.equals("ca cả ngày")) {
                normalizedSchedule = "08:00 - 17:30";
            } else if (normalizedSchedule.equals("night") || normalizedSchedule.equals("ca tối")) {
                normalizedSchedule = "17:30 - 21:30";
            }

            LocalTime[] appointmentRange = parseTimeRange(appointmentTimeSlot);
            LocalTime[] scheduleRange = parseTimeRange(normalizedSchedule);

            return !appointmentRange[0].isBefore(scheduleRange[0]) && !appointmentRange[1].isAfter(scheduleRange[1]);
        } catch (RuntimeException e) {
            return appointmentTimeSlot.trim().equalsIgnoreCase(scheduleTimeSlot.trim());
        }
    }

    private LocalTime[] parseTimeRange(String timeRange) {
        String[] parts = timeRange.split("\\s*-\\s*");
        if (parts.length != 2) {
            throw new IllegalArgumentException("Invalid time range: " + timeRange);
        }
        return new LocalTime[] {
                LocalTime.parse(normalizeTime(parts[0]), TIME_FORMATTER),
                LocalTime.parse(normalizeTime(parts[1]), TIME_FORMATTER)
        };
    }

    private String normalizeTime(String value) {
        String normalized = value.trim();
        if (normalized.matches("^\\d{1,2}h$")) {
            normalized = normalized.replace("h", ":00");
        } else if (normalized.matches("^\\d{1,2}h\\d{1,2}$")) {
            normalized = normalized.replace("h", ":");
        }

        String[] parts = normalized.split(":");
        if (parts.length != 2) {
            throw new IllegalArgumentException("Invalid time: " + value);
        }
        return String.format("%02d:%02d", Integer.parseInt(parts[0]), Integer.parseInt(parts[1]));
    }

    private Patient findPatientByIdOrCode(String patientIdOrCode) {
        try {
            Integer id = Integer.parseInt(patientIdOrCode);
            return patientRepository.findById(id)
                    .orElseGet(() -> patientRepository.findByPatientCode(patientIdOrCode)
                            .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND)));
        } catch (NumberFormatException e) {
            return patientRepository.findByPatientCode(patientIdOrCode)
                    .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));
        }
    }

    private AppointmentStatus mapToStatusEntity(String statusDto) {
        if (statusDto == null || statusDto.isBlank()) {
            return AppointmentStatus.WAITING;
        }
        switch (statusDto.toUpperCase()) {
            case "PENDING":
                return AppointmentStatus.WAITING;
            case "CONFIRMED":
                return AppointmentStatus.IN_PROGRESS;
            case "COMPLETED":
                return AppointmentStatus.DONE;
            case "CANCELLED":
                return AppointmentStatus.CANCELLED;
            default:
                return AppointmentStatus.WAITING;
        }
    }

    private String mapToStatusDto(AppointmentStatus status) {
        if (status == null) {
            return "PENDING";
        }
        switch (status) {
            case WAITING:
                return "PENDING";
            case IN_PROGRESS:
                return "CONFIRMED";
            case DONE:
                return "COMPLETED";
            case CANCELLED:
                return "CANCELLED";
            default:
                return "PENDING";
        }
    }

    private AppointmentResponse mapToResponse(Appointment appointment) {
        return AppointmentResponse.builder()
                .id(appointment.getId())
                .patientName(appointment.getPatient() != null ? appointment.getPatient().getFullName() : null)
                .patientId(appointment.getPatient() != null ? appointment.getPatient().getPatientCode() : null)
                .doctorId(appointment.getDoctor() != null ? appointment.getDoctor().getId() : null)
                .doctorName(appointment.getDoctor() != null ? appointment.getDoctor().getDoctorName() : null)
                .specialtyId(appointment.getDoctor() != null && appointment.getDoctor().getSpecialty() != null 
                        ? appointment.getDoctor().getSpecialty().getId() : null)
                .appointmentDate(appointment.getAppointmentDate() != null 
                        ? appointment.getAppointmentDate().format(DATE_FORMATTER) : null)
                .timeSlot(appointment.getTimeSlot())
                .symptomsInitial(appointment.getSymptomsInitial())
                .status(mapToStatusDto(appointment.getStatus()))
                .icdCode(null) // Lấy từ EMR ở phase sau
                .mainDiagnosis(null) // Lấy từ EMR ở phase sau
                .build();
    }
}
