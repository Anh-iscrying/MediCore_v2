package com.medicore.controller.user;

import com.medicore.common.base.ApiResponse;
import com.medicore.common.constants.AppointmentStatus;
import com.medicore.dto.request.DoctorProfileRequest;
import com.medicore.dto.request.DoctorRequest;
import com.medicore.dto.response.DoctorResponse;
import com.medicore.entity.clinical.Appointment;
import com.medicore.entity.clinical.DoctorSchedule;
import com.medicore.entity.user.Doctor;
import com.medicore.repository.clinical.AppointmentRepository;
import com.medicore.repository.user.DoctorRepository;
import com.medicore.repository.user.DoctorScheduleRepository;
import com.medicore.service.user.DoctorService;

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
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;
    private final DoctorRepository doctorRepository;
    private final DoctorScheduleRepository scheduleRepository;
    private final AppointmentRepository appointmentRepository;
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final LocalTime MORNING_START = LocalTime.of(8, 0);
    private static final LocalTime MORNING_END = LocalTime.of(12, 0);
    private static final LocalTime AFTERNOON_START = LocalTime.of(13, 30);
    private static final LocalTime AFTERNOON_END = LocalTime.of(17, 30);

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> getAllDoctors() {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getAllDoctors()));
    }

    @GetMapping("/specialty/{specialtyId}/available")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAvailableDoctors(
            @PathVariable Integer specialtyId,
            @RequestParam String date) {

        LocalDate workDate = LocalDate.parse(date);
        List<Doctor> doctors = doctorRepository.findActiveBySpecialtyIdWithSpecialty(specialtyId);
        List<Integer> doctorIds = doctors.stream()
                .map(Doctor::getId)
                .collect(Collectors.toList());

        if (doctorIds.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success(List.of()));
        }

        Map<Integer, List<Appointment>> appointmentsByDoctorId = appointmentRepository
                .findByDoctorIdsAndAppointmentDateAndStatusNot(doctorIds, workDate, AppointmentStatus.CANCELLED)
                .stream()
                .collect(Collectors.groupingBy(appointment -> appointment.getDoctor().getId()));

        Map<Integer, List<DoctorSchedule>> schedulesByDoctorId = scheduleRepository
                .findByDoctorIdsAndWorkDate(doctorIds, workDate)
                .stream()
                .collect(Collectors.groupingBy(schedule -> schedule.getDoctor().getId()));

        List<Map<String, Object>> responses = doctors.stream()
                .map(doctor -> mapDoctorWithAvailableSchedules(
                        doctor,
                        schedulesByDoctorId.getOrDefault(doctor.getId(), List.of()),
                        appointmentsByDoctorId.getOrDefault(doctor.getId(), List.of())))
                .filter(response -> !((List<?>) response.get("doctor_schedules")).isEmpty())
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/specialty/{specialtyId}")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> getDoctorsBySpecialty(@PathVariable Integer specialtyId) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorsBySpecialty(specialtyId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorResponse>> getDoctorById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DoctorResponse>> createDoctor(@Valid @RequestBody DoctorRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Thêm bác sĩ thành công", doctorService.createDoctor(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DoctorResponse>> updateDoctor(
            @PathVariable Integer id,
            @Valid @RequestBody DoctorRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật bác sĩ thành công", doctorService.updateDoctor(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDoctor(@PathVariable Integer id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa bác sĩ thành công", null));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> toggleDoctorStatus(
            @PathVariable Integer id,
            @RequestParam Boolean active) {

        Doctor doctor = doctorRepository.findById(id).orElseThrow();
        doctor.setIsActive(active);
        doctorRepository.save(doctor);

        // AC-04: Nếu bác sĩ ngừng hoạt động, xóa lịch trực tương lai chưa bị đặt
        if (!active) {
            scheduleRepository.deleteByDoctorAndWorkDateAfterAndIsBookedFalse(doctor, LocalDate.now());
        }

        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật trạng thái hoạt động", null));
    }

    // API dành riêng cho Bác sĩ tự xem hồ sơ (Self-Profile)
    @GetMapping("/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<DoctorResponse>> getSelf() {
        String currentEmail = org.springframework.security.core.context.SecurityContextHolder
                                .getContext().getAuthentication().getName();

        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorByEmail(currentEmail)));
    }

    // API dành riêng cho Bác sĩ tự cập nhật hồ sơ (Self-Update)
    @PutMapping("/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<DoctorResponse>> updateSelf(
            @Valid @RequestBody DoctorProfileRequest request) {
        String currentEmail = org.springframework.security.core.context.SecurityContextHolder
                                .getContext().getAuthentication().getName();

        DoctorResponse updatedDoctor = doctorService.updateDoctorByEmail(currentEmail, request);

        return ResponseEntity.ok(ApiResponse.success("Cập nhật hồ sơ cá nhân thành công", updatedDoctor));
    }

    private Map<String, Object> mapDoctorWithAvailableSchedules(
            Doctor doctor,
            List<DoctorSchedule> doctorSchedules,
            List<Appointment> bookedAppointments) {

        List<Map<String, Object>> schedules = doctorSchedules.stream()
                .filter(schedule -> isWorkingSchedule(schedule.getTimeSlot()))
                .flatMap(schedule -> expandAvailableSlots(schedule, bookedAppointments).stream())
                .collect(Collectors.toList());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", doctor.getId());
        response.put("specialty_id", doctor.getSpecialty() != null ? doctor.getSpecialty().getId() : null);
        response.put("doctor_code", doctor.getDoctorCode());
        response.put("doctor_name", doctor.getDoctorName());
        response.put("specialty", doctor.getSpecialty() != null ? doctor.getSpecialty().getSpecialtyName() : "");
        response.put("degree", doctor.getDegree());
        response.put("experience_years", doctor.getExperienceYears());
        response.put("bio", doctor.getBio());
        response.put("avatar_url", doctor.getAvatarUrl());
        response.put("avatar", doctor.getAvatarUrl());
        response.put("avatarColor", "bg-[#111111] border border-[#1f1f1f] text-white");
        response.put("achievements", doctor.getAchievements());
        response.put("doctor_schedules", schedules);
        response.put("availableSlots", schedules.stream().map(schedule -> schedule.get("time_slot")).distinct().collect(Collectors.toList()));
        return response;
    }

    private List<Map<String, Object>> expandAvailableSlots(DoctorSchedule schedule, List<Appointment> bookedAppointments) {
        List<Map<String, Object>> slots = new ArrayList<>();

        for (LocalTime[] range : normalizeScheduleTimeSlots(schedule.getTimeSlot())) {
            LocalTime start = range[0];
            while (start.plusMinutes(30).compareTo(range[1]) <= 0) {
                LocalTime end = start.plusMinutes(30);
                String appointmentSlot = start.format(TIME_FORMATTER) + " - " + end.format(TIME_FORMATTER);
                slots.add(mapScheduleSlot(schedule, appointmentSlot, !isAppointmentSlotAvailable(appointmentSlot, bookedAppointments)));
                start = end;
            }
        }

        return slots;
    }

    private Map<String, Object> mapScheduleSlot(DoctorSchedule schedule, String appointmentSlot, boolean isBooked) {
        Map<String, Object> slot = new LinkedHashMap<>();
        slot.put("id", schedule.getId());
        slot.put("doctor_id", schedule.getDoctor() != null ? schedule.getDoctor().getId() : null);
        slot.put("work_date", schedule.getWorkDate() != null ? schedule.getWorkDate().toString() : null);
        slot.put("time_slot", appointmentSlot);
        slot.put("is_booked", isBooked);
        return slot;
    }

    private boolean isAppointmentSlotAvailable(String appointmentSlot, List<Appointment> bookedAppointments) {
        try {
            LocalTime[] candidateRange = parseTimeRange(appointmentSlot);
            return bookedAppointments.stream()
                    .map(Appointment::getTimeSlot)
                    .noneMatch(bookedSlot -> overlaps(candidateRange, bookedSlot));
        } catch (RuntimeException e) {
            return bookedAppointments.stream()
                    .map(Appointment::getTimeSlot)
                    .noneMatch(appointmentSlot::equalsIgnoreCase);
        }
    }

    private boolean overlaps(LocalTime[] candidateRange, String bookedSlot) {
        try {
            LocalTime[] bookedRange = parseTimeRange(bookedSlot);
            return candidateRange[0].isBefore(bookedRange[1]) && bookedRange[0].isBefore(candidateRange[1]);
        } catch (RuntimeException e) {
            return false;
        }
    }

    private boolean isWorkingSchedule(String scheduleTimeSlot) {
        if (scheduleTimeSlot == null || scheduleTimeSlot.isBlank()) {
            return false;
        }
        String normalized = scheduleTimeSlot.trim().toLowerCase();
        return !normalized.equals("off") && !normalized.equals("nghỉ");
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
                    new LocalTime[] { AFTERNOON_START, AFTERNOON_END }
            );
        }
        if (normalized.equals("night") || normalized.equals("ca tối")) {
            return List.of();
        }
        if (!scheduleTimeSlot.contains("-")) {
            LocalTime start = normalizeTime(scheduleTimeSlot);
            return clipToWorkingWindows(new LocalTime[] { start, start.plusMinutes(30) });
        }
        return clipToWorkingWindows(parseTimeRange(scheduleTimeSlot));
    }

    private List<LocalTime[]> clipToWorkingWindows(LocalTime[] range) {
        List<LocalTime[]> ranges = new ArrayList<>();
        addOverlap(ranges, range, MORNING_START, MORNING_END);
        addOverlap(ranges, range, AFTERNOON_START, AFTERNOON_END);
        return ranges;
    }

    private void addOverlap(List<LocalTime[]> ranges, LocalTime[] source, LocalTime windowStart, LocalTime windowEnd) {
        LocalTime start = source[0].isAfter(windowStart) ? source[0] : windowStart;
        LocalTime end = source[1].isBefore(windowEnd) ? source[1] : windowEnd;
        if (start.isBefore(end)) {
            ranges.add(new LocalTime[] { start, end });
        }
    }

    private LocalTime[] parseTimeRange(String timeRange) {
        String[] parts = timeRange.split("\\s*-\\s*");
        if (parts.length != 2) {
            throw new IllegalArgumentException("Invalid time range: " + timeRange);
        }
        return new LocalTime[] { normalizeTime(parts[0]), normalizeTime(parts[1]) };
    }

    private LocalTime normalizeTime(String value) {
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
        return LocalTime.of(Integer.parseInt(parts[0]), Integer.parseInt(parts[1]));
    }
}
