package com.medicore.service.impl;

import com.medicore.common.constants.AppointmentStatus;
import com.medicore.common.constants.ErrorCodes;
import com.medicore.common.exception.CustomBusinessException;
import com.medicore.dto.request.AppointmentRequest;
import com.medicore.dto.response.AppointmentResponse;
import com.medicore.config.AppointmentRulesProperties;
import com.medicore.entity.clinical.Appointment;
import com.medicore.entity.clinical.DoctorSchedule;
import com.medicore.entity.user.AuthCredentials;
import com.medicore.entity.user.Doctor;
import com.medicore.entity.user.Patient;
import com.medicore.repository.AppointmentRepository;
import com.medicore.repository.AuthCredentialsRepository;
import com.medicore.repository.DoctorRepository;
import com.medicore.repository.DoctorScheduleRepository;
import com.medicore.repository.PatientRepository;
import com.medicore.service.AppointmentService;
import com.medicore.service.PatientNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorScheduleRepository doctorScheduleRepository;
    private final AuthCredentialsRepository authCredentialsRepository;
    private final PatientNotificationService patientNotificationService;
    private final AppointmentRulesProperties appointmentRulesProperties;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final List<AppointmentStatus> ACTIVE_STATUSES = List.of(
            AppointmentStatus.WAITING,
            AppointmentStatus.CONFIRMED,
            AppointmentStatus.IN_PROGRESS);
    private static final LocalTime MORNING_START = LocalTime.of(8, 0);
    private static final LocalTime MORNING_END = LocalTime.of(12, 0);
    private static final LocalTime AFTERNOON_START = LocalTime.of(13, 30);
    private static final LocalTime AFTERNOON_END = LocalTime.of(17, 30);

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAllAppointments() {
        return appointmentRepository.findAllWithRelations().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getCurrentPatientAppointments(String email) {
        Patient patient = findCurrentPatient(email);
        return appointmentRepository.findByPatientPatientCodeWithRelations(patient.getPatientCode()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointmentsByPatient(String patientIdOrCode) {
        Patient patient = findPatientByIdOrCode(patientIdOrCode);
        return appointmentRepository.findByPatientPatientCodeWithRelations(patient.getPatientCode()).stream()
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
    public List<AppointmentResponse> getWaitingAppointmentsByDoctor(Integer doctorId, LocalDate appointmentDate) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new CustomBusinessException(ErrorCodes.NOT_FOUND);
        }
        return appointmentRepository
                .findByDoctorIdAndAppointmentDateAndStatusIn(doctorId, appointmentDate, ACTIVE_STATUSES).stream()
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
    public AppointmentResponse createCurrentPatientAppointment(AppointmentRequest request, String email) {
        Patient patient = findCurrentPatient(email);
        request.setPatientId(patient.getPatientCode());
        return createAppointment(request);
    }

    @Override
    @Transactional
    public AppointmentResponse createAppointment(AppointmentRequest request) {
        Patient patient = findPatientByIdOrCode(request.getPatientId());
        validatePatientActiveAppointmentLimit(patient.getPatientCode(), null);
        validateRequiredSymptoms(request.getSymptomsInitial());

        LocalDate appDate = LocalDate.parse(request.getAppointmentDate(), DATE_FORMATTER);

        // Daily Limit Check
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime startOfTomorrow = startOfToday.plusDays(1);
        long dailyCount = appointmentRepository.countAppointmentsCreatedToday(
                patient.getPatientCode(), startOfToday, startOfTomorrow);
        int maxCreatedDaily = appointmentRulesProperties.getMaxCreatedPerPatientPerDay();
        if (dailyCount >= maxCreatedDaily) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST,
                    "Bạn đã đặt lịch vượt quá số lần quy định trong một ngày. Vui lòng thử lại vào ngày mai");
        }

        // Booking Advance Check
        validateBookingCutoff(appDate, request.getTimeSlot());

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));

        AppointmentStatus status = mapToStatusEntity(request.getStatus());
        validateAppointmentAvailability(doctor.getId(), appDate, request.getTimeSlot(), null);

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(appDate)
                .timeSlot(request.getTimeSlot())
                .symptomsInitial(request.getSymptomsInitial().trim())
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
        AppointmentStatus oldStatus = appointment.getStatus();
        AppointmentStatus status = mapToStatusEntity(request.getStatus());
        boolean cancelling = status == AppointmentStatus.CANCELLED;

        if (cancelling) {
            validateCancellationCutoff(appointment.getAppointmentDate(), appointment.getTimeSlot());
        }

        boolean statusOnlyUpdate = Objects.equals(appointment.getPatient().getPatientCode(), patient.getPatientCode())
                && Objects.equals(appointment.getDoctor().getId(), doctor.getId())
                && Objects.equals(appointment.getAppointmentDate(), appDate)
                && Objects.equals(appointment.getTimeSlot(), request.getTimeSlot())
                && Objects.equals(appointment.getSymptomsInitial(), request.getSymptomsInitial());

        if (!cancelling && !statusOnlyUpdate) {
            boolean dateOrTimeSlotChanged = !Objects.equals(appointment.getAppointmentDate(), appDate)
                    || !Objects.equals(appointment.getTimeSlot(), request.getTimeSlot());

            if (dateOrTimeSlotChanged) {
                // Check daily limit: đếm số lần tạo lịch trong ngày hôm nay
                LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
                LocalDateTime startOfTomorrow = startOfToday.plusDays(1);
                long dailyCount = appointmentRepository.countAppointmentsCreatedToday(
                        patient.getPatientCode(), startOfToday, startOfTomorrow);
                // Nếu lịch đang sửa cũng được tạo hôm nay → trừ 1 để không đếm kép chính nó
                boolean selfCreatedToday = appointment.getCreatedAt() != null
                        && !appointment.getCreatedAt().isBefore(startOfToday)
                        && appointment.getCreatedAt().isBefore(startOfTomorrow);
                if (selfCreatedToday) {
                    dailyCount--;
                }
                int maxCreatedDaily = appointmentRulesProperties.getMaxCreatedPerPatientPerDay();
                if (dailyCount >= maxCreatedDaily) {
                    throw new CustomBusinessException(ErrorCodes.BAD_REQUEST,
                            "Bạn đã đặt lịch vượt quá số lần quy định trong một ngày. Vui lòng thử lại vào ngày mai");
                }

                // Check advance booking limit
                validateBookingCutoff(appDate, request.getTimeSlot());
            }

            if (ACTIVE_STATUSES.contains(status)) {
                validatePatientActiveAppointmentLimit(patient.getPatientCode(), appointment.getId());
            }
            validateRequiredSymptoms(request.getSymptomsInitial());
            validateAppointmentAvailability(doctor.getId(), appDate, request.getTimeSlot(), appointment.getId());
        }

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
        patientNotificationService.notifyExamStarted(appointment, oldStatus, status);
        patientNotificationService.notifyAppointmentStatusChanged(appointment, oldStatus, status, request.getCancellationReason());
        return mapToResponse(appointment);
    }

    @Override
    @Transactional
    public AppointmentResponse startExam(Integer id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));
        AppointmentStatus oldStatus = appointment.getStatus();
        appointment.setStatus(AppointmentStatus.IN_PROGRESS);
        appointment.setUpdatedAt(LocalDateTime.now());
        appointment = appointmentRepository.save(appointment);
        patientNotificationService.notifyAppointmentStatusChanged(appointment, oldStatus, AppointmentStatus.IN_PROGRESS);
        return mapToResponse(appointment);
    }

    @Override
    @Transactional
    public AppointmentResponse cancelCurrentPatientAppointment(Integer id, String email) {
        Patient patient = findCurrentPatient(email);
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));

        if (appointment.getPatient() == null
                || !patient.getPatientCode().equals(appointment.getPatient().getPatientCode())) {
            throw new CustomBusinessException(ErrorCodes.FORBIDDEN);
        }

        if (appointment.getStatus() != AppointmentStatus.WAITING) {
            throw new CustomBusinessException(
                    ErrorCodes.BAD_REQUEST,
                    "Chỉ được phép hủy lịch hẹn đang chờ xác nhận");
        }

        validateCancellationCutoff(appointment.getAppointmentDate(), appointment.getTimeSlot());

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setUpdatedAt(LocalDateTime.now());
        return mapToResponse(appointmentRepository.save(appointment));
    }

    @Override
    @Transactional
    public void deleteAppointment(Integer id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));
        appointmentRepository.delete(appointment);
    }

    private void validatePatientActiveAppointmentLimit(String patientCode, Integer currentAppointmentId) {
        long activeCount = currentAppointmentId == null
                ? appointmentRepository.countByPatientPatientCodeAndStatusIn(patientCode, ACTIVE_STATUSES)
                : appointmentRepository.countByPatientPatientCodeAndStatusInAndIdNot(patientCode, ACTIVE_STATUSES,
                        currentAppointmentId);
        int maxActive = appointmentRulesProperties.getMaxActivePerPatient();
        if (activeCount >= maxActive) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST,
                    String.format(
                            "Bạn đã có %d lịch khám đang hoạt động. Vui lòng hoàn thành hoặc hủy lịch hiện tại trước khi đặt lịch mới",
                            maxActive));
        }
    }

    private void validateBookingCutoff(LocalDate appDate, String timeSlot) {
        LocalTime[] appointmentRange = parseTimeRange(timeSlot);
        LocalDateTime appointmentDateTime = LocalDateTime.of(appDate, appointmentRange[0]);
        int minHours = appointmentRulesProperties.getMinHoursBeforeBooking();
        if (appointmentDateTime.isBefore(LocalDateTime.now().plusHours(minHours))) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST,
                    String.format("Chỉ được phép đặt lịch khám trước giờ hẹn tối thiểu %d giờ", minHours));
        }
    }

    private void validateCancellationCutoff(LocalDate appDate, String timeSlot) {
        LocalTime[] appointmentRange = parseTimeRange(timeSlot);
        LocalDateTime appointmentDateTime = LocalDateTime.of(appDate, appointmentRange[0]);
        int minHours = appointmentRulesProperties.getMinHoursBeforeCancellation();
        if (appointmentDateTime.isBefore(LocalDateTime.now().plusHours(minHours))) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST,
                    String.format("Chỉ được phép hủy lịch khám trước giờ hẹn tối thiểu %d giờ", minHours));
        }
    }

    private void validateRequiredSymptoms(String symptomsInitial) {
        if (symptomsInitial == null || symptomsInitial.trim().isEmpty()) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Vui lòng nhập triệu chứng ban đầu");
        }
    }

    private void validateAppointmentAvailability(Integer doctorId, LocalDate appDate, String appointmentTimeSlot,
            Integer currentAppointmentId) {
        LocalTime[] appointmentRange = parseTimeRange(appointmentTimeSlot);
        validateBookableAppointmentSlot(appointmentRange);

        List<DoctorSchedule> schedules = doctorScheduleRepository.findByDoctorIdAndWorkDate(doctorId, appDate).stream()
                .filter(this::isWorkingSchedule)
                .collect(Collectors.toList());

        if (schedules.isEmpty()) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Bác sĩ không có lịch trực vào ngày đã chọn");
        }

        boolean timeSlotInSchedule = schedules.stream()
                .anyMatch(schedule -> isAppointmentSlotInsideSchedule(appointmentRange, schedule.getTimeSlot()));

        if (!timeSlotInSchedule) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST,
                    "Khung giờ hẹn không nằm trong ca trực của bác sĩ");
        }

        boolean isBooked = appointmentRepository
                .findByDoctorIdAndAppointmentDateAndStatusIn(doctorId, appDate, ACTIVE_STATUSES).stream()
                .filter(appointment -> currentAppointmentId == null
                        || !appointment.getId().equals(currentAppointmentId))
                .anyMatch(appointment -> overlaps(appointmentRange, appointment.getTimeSlot()));

        if (isBooked) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Khung giờ này đã có bệnh nhân đặt lịch");
        }
    }

    private void validateBookableAppointmentSlot(LocalTime[] appointmentRange) {
        long minutes = Duration.between(appointmentRange[0], appointmentRange[1]).toMinutes();
        if (minutes != 30) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Mỗi ca khám phải kéo dài 30 phút");
        }
        if (!isAlignedToHalfHour(appointmentRange[0]) || !isAlignedToHalfHour(appointmentRange[1])) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST,
                    "Ca khám phải bắt đầu/kết thúc theo mốc 00 hoặc 30 phút");
        }
        if (!isInsideWorkingWindow(appointmentRange, MORNING_START, MORNING_END)
                && !isInsideWorkingWindow(appointmentRange, AFTERNOON_START, AFTERNOON_END)) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST,
                    "Ca khám chỉ được nằm trong 08:00-12:00 hoặc 13:30-17:30");
        }
    }

    private boolean isAlignedToHalfHour(LocalTime time) {
        return time.getMinute() == 0 || time.getMinute() == 30;
    }

    private boolean isInsideWorkingWindow(LocalTime[] range, LocalTime start, LocalTime end) {
        return !range[0].isBefore(start) && !range[1].isAfter(end);
    }

    private boolean isWorkingSchedule(DoctorSchedule schedule) {
        return schedule.getTimeSlot() != null && !schedule.getTimeSlot().isBlank()
                && isWorkingSchedule(schedule.getTimeSlot());
    }

    private boolean isWorkingSchedule(String scheduleTimeSlot) {
        if (scheduleTimeSlot == null || scheduleTimeSlot.isBlank()) {
            return false;
        }
        String normalized = scheduleTimeSlot.trim().toLowerCase();
        return !normalized.equals("off") && !normalized.equals("nghỉ") && !normalized.equals("night")
                && !normalized.equals("ca tối");
    }

    private boolean isAppointmentSlotInsideSchedule(LocalTime[] appointmentRange, String scheduleTimeSlot) {
        for (LocalTime[] scheduleRange : normalizeScheduleTimeSlots(scheduleTimeSlot)) {
            if (!appointmentRange[0].isBefore(scheduleRange[0]) && !appointmentRange[1].isAfter(scheduleRange[1])) {
                return true;
            }
        }
        return false;
    }

    private List<LocalTime[]> normalizeScheduleTimeSlots(String scheduleTimeSlot) {
        if (scheduleTimeSlot == null) {
            return List.of();
        }
        String normalized = scheduleTimeSlot.trim().toLowerCase();
        if (normalized.equals("morning") || normalized.equals("ca sáng")) {
            return java.util.Collections.singletonList(new LocalTime[] { MORNING_START, MORNING_END });
        }
        if (normalized.equals("afternoon") || normalized.equals("ca chiều")) {
            return java.util.Collections.singletonList(new LocalTime[] { AFTERNOON_START, AFTERNOON_END });
        }
        if (normalized.equals("full_day") || normalized.equals("cả ngày") || normalized.equals("ca cả ngày")) {
            return java.util.Arrays.asList(
                    new LocalTime[] { MORNING_START, MORNING_END },
                    new LocalTime[] { AFTERNOON_START, AFTERNOON_END });
        }
        if (normalized.equals("night") || normalized.equals("ca tối")) {
            return List.of();
        }
        if (!scheduleTimeSlot.contains("-")) {
            LocalTime start = LocalTime.parse(normalizeTime(scheduleTimeSlot), TIME_FORMATTER);
            return java.util.Collections.singletonList(new LocalTime[] { start, start.plusMinutes(30) });
        }
        return java.util.Collections.singletonList(parseTimeRange(scheduleTimeSlot));
    }

    private boolean overlaps(LocalTime[] candidateRange, String bookedSlot) {
        try {
            LocalTime[] bookedRange = parseTimeRange(bookedSlot);
            return candidateRange[0].isBefore(bookedRange[1]) && bookedRange[0].isBefore(candidateRange[1]);
        } catch (RuntimeException e) {
            return false;
        }
    }

    private LocalTime[] parseTimeRange(String timeRange) {
        try {
            String[] parts = timeRange.split("\\s*-\\s*");
            if (parts.length != 2) {
                throw new IllegalArgumentException("Invalid time range: " + timeRange);
            }
            return new LocalTime[] {
                    LocalTime.parse(normalizeTime(parts[0]), TIME_FORMATTER),
                    LocalTime.parse(normalizeTime(parts[1]), TIME_FORMATTER)
            };
        } catch (RuntimeException e) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Khung giờ khám không hợp lệ");
        }
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

    private Patient findCurrentPatient(String email) {
        AuthCredentials credentials = authCredentialsRepository.findByEmail(email)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.UNAUTHORIZED));
        if (credentials.getPatient() == null) {
            throw new CustomBusinessException(ErrorCodes.NOT_FOUND);
        }
        return credentials.getPatient();
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
            case "WAITING":
                return AppointmentStatus.WAITING;
            case "CONFIRMED":
                return AppointmentStatus.CONFIRMED;
            case "IN_PROGRESS":
                return AppointmentStatus.IN_PROGRESS;
            case "COMPLETED":
            case "DONE":
                return AppointmentStatus.DONE;
            case "CANCELLED":
                return AppointmentStatus.CANCELLED;
            default:
                throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Trạng thái lịch hẹn không hợp lệ");
        }
    }

    private String mapToStatusDto(AppointmentStatus status) {
        return status == null ? AppointmentStatus.WAITING.name() : status.name();
    }

    private AppointmentResponse mapToResponse(Appointment appointment) {
        String fullDoctorName = null;
        if (appointment.getDoctor() != null) {
            String degree = appointment.getDoctor().getDegree();
            String name = appointment.getDoctor().getDoctorName();
            if (degree != null && !degree.isBlank()) {
                fullDoctorName = degree + " " + name;
            } else {
                fullDoctorName = name;
            }
        }

        return AppointmentResponse.builder()
                .id(appointment.getId())
                .patientName(appointment.getPatient() != null ? appointment.getPatient().getFullName() : null)
                .patientId(appointment.getPatient() != null ? appointment.getPatient().getPatientCode() : null)
                .patientDbId(appointment.getPatient() != null ? appointment.getPatient().getId() : null)
                .patientDateOfBirth(appointment.getPatient() != null && appointment.getPatient().getDob() != null
                        ? appointment.getPatient().getDob().format(DATE_FORMATTER)
                        : null)
                .patientGender(appointment.getPatient() != null && appointment.getPatient().getGender() != null
                        ? (appointment.getPatient().getGender().name().equals("FEMALE") ? "F" : "M")
                        : null)
                .patientPhone(appointment.getPatient() != null ? appointment.getPatient().getPhone() : null)
                .patientAddress(appointment.getPatient() != null ? appointment.getPatient().getAddress() : null)
                .doctorId(appointment.getDoctor() != null ? appointment.getDoctor().getId() : null)
                .doctorName(fullDoctorName)
                .specialtyId(appointment.getDoctor() != null && appointment.getDoctor().getSpecialty() != null
                        ? appointment.getDoctor().getSpecialty().getId()
                        : null)
                .appointmentDate(appointment.getAppointmentDate() != null
                        ? appointment.getAppointmentDate().format(DATE_FORMATTER)
                        : null)
                .timeSlot(appointment.getTimeSlot())
                .symptomsInitial(appointment.getSymptomsInitial())
                .status(mapToStatusDto(appointment.getStatus()))
                .icdCode(null)
                .mainDiagnosis(null)
                .build();
    }
}
