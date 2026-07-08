package com.medicore.controller.user;

import com.medicore.common.base.ApiResponse;
import com.medicore.common.constants.ErrorCodes;
import com.medicore.common.exception.CustomBusinessException;
import com.medicore.dto.request.CycleScheduleRequest;
import com.medicore.dto.request.ScheduleRequest;
import com.medicore.dto.response.DoctorScheduleResponse;
import com.medicore.entity.clinical.Appointment;
import com.medicore.entity.clinical.DoctorSchedule;
import com.medicore.entity.user.Doctor;
import com.medicore.repository.clinical.AppointmentRepository;
import com.medicore.repository.user.DoctorRepository;
import com.medicore.repository.user.DoctorScheduleRepository;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/schedules")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
public class DoctorScheduleController {

    private final DoctorScheduleRepository scheduleRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @GetMapping
    public ResponseEntity<ApiResponse<List<DoctorScheduleResponse>>> getSchedules(
            @RequestParam(required = false) Integer doctorId,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {

        List<DoctorSchedule> schedules;
        if (doctorId != null && date != null) {
            schedules = scheduleRepository.findByDoctorIdAndWorkDate(doctorId, LocalDate.parse(date));
        } else if (doctorId != null) {
            schedules = scheduleRepository.findByDoctorId(doctorId);
        } else if (date != null) {
            schedules = scheduleRepository.findByWorkDate(LocalDate.parse(date));
        } else if (fromDate != null && toDate != null) {
            schedules = scheduleRepository.findByWorkDateBetween(LocalDate.parse(fromDate), LocalDate.parse(toDate));
        } else {
            schedules = scheduleRepository.findAll();
        }

        List<DoctorScheduleResponse> responses = schedules.stream()
                .sorted(Comparator.comparing(DoctorSchedule::getWorkDate).thenComparing(DoctorSchedule::getId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorScheduleResponse>> getScheduleById(@PathVariable Integer id) {
        DoctorSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));
        return ResponseEntity.ok(ApiResponse.success(mapToResponse(schedule)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<ApiResponse<DoctorScheduleResponse>> createSchedule(@Valid @RequestBody ScheduleRequest request) {
        DoctorSchedule schedule = buildSchedule(request);
        schedule = scheduleRepository.save(schedule);
        return ResponseEntity.ok(ApiResponse.success("Đã tạo lịch trực thành công", mapToResponse(schedule)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<ApiResponse<DoctorScheduleResponse>> updateSchedule(
            @PathVariable Integer id,
            @Valid @RequestBody ScheduleRequest request) {

        DoctorSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));

        Integer oldDoctorId = schedule.getDoctor() != null ? schedule.getDoctor().getId() : null;
        LocalDate oldWorkDate = schedule.getWorkDate();
        Doctor doctor = findActiveDoctor(request.getDoctorId());

        validateAppointmentsRemainCoveredAfterUpdate(schedule, oldDoctorId, oldWorkDate, request);
        validateDuplicateSchedule(request.getDoctorId(), request.getWorkDate(), request.getTimeSlot(), id);

        schedule.setDoctor(doctor);
        schedule.setWorkDate(request.getWorkDate());
        schedule.setTimeSlot(request.getTimeSlot());
        schedule.setIsBooked(false);
        schedule = scheduleRepository.save(schedule);

        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật lịch trực thành công", mapToResponse(schedule)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(@PathVariable Integer id) {
        DoctorSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));

        validateAppointmentsRemainCoveredAfterDelete(schedule);

        scheduleRepository.delete(schedule);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa lịch trực thành công", null));
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<ApiResponse<List<DoctorScheduleResponse>>> createBulkSchedules(@Valid @RequestBody List<ScheduleRequest> requests) {
        List<DoctorSchedule> schedules = requests.stream()
                .map(this::buildSchedule)
                .collect(Collectors.toList());

        List<DoctorSchedule> savedSchedules = scheduleRepository.saveAll(schedules);
        List<DoctorScheduleResponse> responses = savedSchedules.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Đã thiết lập lịch trực thành công", responses));
    }

    @PostMapping("/copy")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<ApiResponse<List<DoctorScheduleResponse>>> copySchedules(
            @RequestParam Integer doctorId,
            @RequestParam String fromDate,
            @RequestParam String toDate) {

        Doctor doctor = findActiveDoctor(doctorId);
        LocalDate sourceDate = LocalDate.parse(fromDate);
        LocalDate targetDate = LocalDate.parse(toDate);

        List<DoctorSchedule> sourceSchedules = scheduleRepository.findByDoctorIdAndWorkDate(doctorId, sourceDate);
        if (sourceSchedules.isEmpty()) {
            throw new CustomBusinessException(ErrorCodes.NOT_FOUND, "Không tìm thấy lịch trực nguồn");
        }

        List<DoctorSchedule> newSchedules = sourceSchedules.stream()
                .filter(schedule -> !scheduleRepository.existsByDoctorIdAndWorkDateAndTimeSlot(doctorId, targetDate, schedule.getTimeSlot()))
                .map(schedule -> DoctorSchedule.builder()
                        .doctor(doctor)
                        .workDate(targetDate)
                        .timeSlot(schedule.getTimeSlot())
                        .isBooked(false)
                        .build())
                .collect(Collectors.toList());

        List<DoctorSchedule> savedSchedules = scheduleRepository.saveAll(newSchedules);
        List<DoctorScheduleResponse> responses = savedSchedules.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Đã sao chép lịch trực sang ngày " + toDate, responses));
    }

    @PostMapping("/cycle")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<ApiResponse<List<DoctorScheduleResponse>>> assignCycleSchedule(@RequestBody CycleScheduleRequest request) {
        List<DoctorSchedule> newSchedules = new ArrayList<>();
        Doctor doctor = findActiveDoctor(request.getDoctorId());

        String timeSlot = mapShiftTypeToTimeSlot(request.getShiftType());

        for (Integer week : request.getWeeks()) {
            for (Integer day : request.getDaysOfWeek()) {
                LocalDate targetDate = calculateDate(request.getYear(), request.getMonth(), week, day);

                if (targetDate != null
                        && !scheduleRepository.existsByDoctorIdAndWorkDateAndTimeSlot(doctor.getId(), targetDate, timeSlot)) {
                    newSchedules.add(DoctorSchedule.builder()
                            .doctor(doctor)
                            .workDate(targetDate)
                            .timeSlot(timeSlot)
                            .isBooked(false)
                            .build());
                }
            }
        }

        List<DoctorSchedule> savedSchedules = scheduleRepository.saveAll(newSchedules);
        List<DoctorScheduleResponse> responses = savedSchedules.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Gán lịch chu kỳ thành công", responses));
    }

    private DoctorSchedule buildSchedule(ScheduleRequest request) {
        Doctor doctor = findActiveDoctor(request.getDoctorId());
        validateDuplicateSchedule(request.getDoctorId(), request.getWorkDate(), request.getTimeSlot(), null);

        return DoctorSchedule.builder()
                .doctor(doctor)
                .workDate(request.getWorkDate())
                .timeSlot(request.getTimeSlot())
                .isBooked(false)
                .build();
    }

    private Doctor findActiveDoctor(Integer doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND, "Không tìm thấy bác sĩ"));
        if (Boolean.FALSE.equals(doctor.getIsActive())) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Bác sĩ đã ngừng hoạt động");
        }
        return doctor;
    }

    private void validateDuplicateSchedule(Integer doctorId, LocalDate workDate, String timeSlot, Integer currentScheduleId) {
        boolean exists = currentScheduleId == null
                ? scheduleRepository.existsByDoctorIdAndWorkDateAndTimeSlot(doctorId, workDate, timeSlot)
                : scheduleRepository.existsByDoctorIdAndWorkDateAndTimeSlotAndIdNot(doctorId, workDate, timeSlot, currentScheduleId);

        if (exists) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Bác sĩ đã có lịch trực trong ca này");
        }
    }

    private void validateAppointmentsRemainCoveredAfterUpdate(
            DoctorSchedule schedule,
            Integer oldDoctorId,
            LocalDate oldWorkDate,
            ScheduleRequest request) {

        if (oldDoctorId == null || oldWorkDate == null) {
            return;
        }

        List<Appointment> appointments = appointmentRepository.findByDoctorIdAndAppointmentDate(oldDoctorId, oldWorkDate);
        if (appointments.isEmpty()) {
            return;
        }

        boolean doctorOrDateChanged = !Objects.equals(oldDoctorId, request.getDoctorId())
                || !Objects.equals(oldWorkDate, request.getWorkDate());
        if (doctorOrDateChanged) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Không thể đổi bác sĩ/ngày trực đã có lịch hẹn");
        }

        List<String> resultingSlots = scheduleRepository.findByDoctorIdAndWorkDate(oldDoctorId, oldWorkDate).stream()
                .filter(existingSchedule -> !Objects.equals(existingSchedule.getId(), schedule.getId()))
                .map(DoctorSchedule::getTimeSlot)
                .collect(Collectors.toCollection(ArrayList::new));
        resultingSlots.add(request.getTimeSlot());

        validateAppointmentsCovered(appointments, resultingSlots);
    }

    private void validateAppointmentsRemainCoveredAfterDelete(DoctorSchedule schedule) {
        Integer doctorId = schedule.getDoctor() != null ? schedule.getDoctor().getId() : null;
        LocalDate workDate = schedule.getWorkDate();
        if (doctorId == null || workDate == null) {
            return;
        }

        List<Appointment> appointments = appointmentRepository.findByDoctorIdAndAppointmentDate(doctorId, workDate);
        if (appointments.isEmpty()) {
            return;
        }

        List<String> resultingSlots = scheduleRepository.findByDoctorIdAndWorkDate(doctorId, workDate).stream()
                .filter(existingSchedule -> !Objects.equals(existingSchedule.getId(), schedule.getId()))
                .map(DoctorSchedule::getTimeSlot)
                .collect(Collectors.toList());

        validateAppointmentsCovered(appointments, resultingSlots);
    }

    private void validateAppointmentsCovered(List<Appointment> appointments, List<String> scheduleTimeSlots) {
        for (Appointment appointment : appointments) {
            boolean covered = scheduleTimeSlots.stream()
                    .filter(this::isWorkingSchedule)
                    .anyMatch(scheduleTimeSlot -> isAppointmentSlotInsideSchedule(appointment.getTimeSlot(), scheduleTimeSlot));

            if (!covered) {
                throw new CustomBusinessException(
                        ErrorCodes.BAD_REQUEST,
                        "Không thể thay đổi lịch trực vì có lịch hẹn ngoài khung giờ mới");
            }
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
            String normalizedSchedule = normalizeScheduleTimeSlot(scheduleTimeSlot);
            LocalTime[] appointmentRange = parseTimeRange(appointmentTimeSlot);
            LocalTime[] scheduleRange = parseTimeRange(normalizedSchedule);

            return !appointmentRange[0].isBefore(scheduleRange[0]) && !appointmentRange[1].isAfter(scheduleRange[1]);
        } catch (RuntimeException e) {
            return appointmentTimeSlot.trim().equalsIgnoreCase(scheduleTimeSlot.trim());
        }
    }

    private String normalizeScheduleTimeSlot(String scheduleTimeSlot) {
        String normalized = scheduleTimeSlot.trim().toLowerCase();
        if (normalized.equals("morning") || normalized.equals("ca sáng")) return "08:00 - 12:00";
        if (normalized.equals("afternoon") || normalized.equals("ca chiều")) return "13:30 - 17:30";
        if (normalized.equals("full_day") || normalized.equals("cả ngày") || normalized.equals("ca cả ngày")) return "08:00 - 17:30";
        if (normalized.equals("night") || normalized.equals("ca tối")) return "17:30 - 21:30";
        return scheduleTimeSlot;
    }

    private LocalTime[] parseTimeRange(String timeRange) {
        String[] parts = timeRange.split("\\s*-\\s*");
        if (parts.length != 2) {
            throw new IllegalArgumentException("Invalid time range: " + timeRange);
        }
        return new LocalTime[] {
                LocalTime.parse(normalizeTime(parts[0])),
                LocalTime.parse(normalizeTime(parts[1]))
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

    private DoctorScheduleResponse mapToResponse(DoctorSchedule schedule) {
        Doctor doctor = schedule.getDoctor();
        return DoctorScheduleResponse.builder()
                .id(schedule.getId())
                .doctorId(doctor != null ? doctor.getId() : null)
                .doctorName(doctor != null ? doctor.getDoctorName() : null)
                .doctorCode(doctor != null ? doctor.getDoctorCode() : null)
                .workDate(schedule.getWorkDate() != null ? schedule.getWorkDate().format(DATE_FORMATTER) : null)
                .timeSlot(schedule.getTimeSlot())
                .isBooked(schedule.getIsBooked())
                .build();
    }

    private String mapShiftTypeToTimeSlot(String shiftType) {
        if (shiftType == null) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Ca trực không hợp lệ");
        }

        String normalized = shiftType.trim().toLowerCase();
        if (normalized.equals("ca sáng") || normalized.equals("morning")) return "08:00 - 12:00";
        if (normalized.equals("ca chiều") || normalized.equals("afternoon")) return "13:30 - 17:30";
        if (normalized.equals("cả ngày") || normalized.equals("ca cả ngày") || normalized.equals("full_day")) return "08:00 - 17:30";
        if (normalized.equals("ca tối") || normalized.equals("night")) return "17:30 - 21:30";

        throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Ca trực không hợp lệ");
    }

    private LocalDate calculateDate(int year, int month, int week, int dayOfWeek) {
        try {
            LocalDate firstDayOfMonth = LocalDate.of(year, month, 1);
            int firstDayDayOfWeek = firstDayOfMonth.getDayOfWeek().getValue() + 1;
            int offset = (dayOfWeek - firstDayDayOfWeek) + (week - 1) * 7;
            LocalDate targetDate = firstDayOfMonth.plusDays(offset);
            if (targetDate.getMonthValue() == month) return targetDate;
        } catch (Exception e) {}
        return null;
    }
}
