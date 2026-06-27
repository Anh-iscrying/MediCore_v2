package com.medicore.controller;

import com.medicore.common.base.ApiResponse;
import com.medicore.common.constants.ErrorCodes;
import com.medicore.common.exception.CustomBusinessException;
import com.medicore.dto.request.CycleScheduleRequest;
import com.medicore.dto.request.ScheduleRequest;
import com.medicore.dto.response.DoctorScheduleResponse;
import com.medicore.entity.clinical.DoctorSchedule;
import com.medicore.entity.user.Doctor;
import com.medicore.repository.AppointmentRepository;
import com.medicore.repository.DoctorRepository;
import com.medicore.repository.DoctorScheduleRepository;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/schedules")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
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
    @Transactional
    public ResponseEntity<ApiResponse<DoctorScheduleResponse>> createSchedule(@Valid @RequestBody ScheduleRequest request) {
        DoctorSchedule schedule = buildSchedule(request);
        schedule = scheduleRepository.save(schedule);
        return ResponseEntity.ok(ApiResponse.success("Đã tạo lịch trực thành công", mapToResponse(schedule)));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<DoctorScheduleResponse>> updateSchedule(
            @PathVariable Integer id,
            @Valid @RequestBody ScheduleRequest request) {

        DoctorSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));

        Integer oldDoctorId = schedule.getDoctor() != null ? schedule.getDoctor().getId() : null;
        LocalDate oldWorkDate = schedule.getWorkDate();
        if (oldDoctorId != null && oldWorkDate != null
                && appointmentRepository.existsByDoctorIdAndAppointmentDate(oldDoctorId, oldWorkDate)) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Không thể sửa lịch trực đã có lịch hẹn");
        }

        Doctor doctor = findActiveDoctor(request.getDoctorId());
        validateDuplicateSchedule(request.getDoctorId(), request.getWorkDate(), request.getTimeSlot(), id);

        schedule.setDoctor(doctor);
        schedule.setWorkDate(request.getWorkDate());
        schedule.setTimeSlot(request.getTimeSlot());
        schedule.setIsBooked(false);
        schedule = scheduleRepository.save(schedule);

        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật lịch trực thành công", mapToResponse(schedule)));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(@PathVariable Integer id) {
        DoctorSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));

        Integer doctorId = schedule.getDoctor() != null ? schedule.getDoctor().getId() : null;
        if (doctorId != null && appointmentRepository.existsByDoctorIdAndAppointmentDate(doctorId, schedule.getWorkDate())) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Không thể xóa lịch trực đã có lịch hẹn");
        }

        scheduleRepository.delete(schedule);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa lịch trực thành công", null));
    }

    @PostMapping("/bulk")
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
