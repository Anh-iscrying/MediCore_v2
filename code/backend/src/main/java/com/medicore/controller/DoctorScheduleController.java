package com.medicore.controller;

import com.medicore.common.base.ApiResponse;
import com.medicore.dto.request.CycleScheduleRequest;
import com.medicore.dto.request.ScheduleRequest;
import com.medicore.entity.clinical.DoctorSchedule;
import com.medicore.entity.user.Doctor;
import com.medicore.repository.DoctorRepository;
import com.medicore.repository.DoctorScheduleRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/schedules")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class DoctorScheduleController {

    private final DoctorScheduleRepository scheduleRepository;
    private final DoctorRepository doctorRepository;

    @PostMapping("/bulk")
    public ResponseEntity<ApiResponse<Void>> createBulkSchedules(@RequestBody List<ScheduleRequest> requests) {
        List<DoctorSchedule> schedules = requests.stream().map(req -> {
            Doctor doctor = doctorRepository.findById(req.getDoctorId()).orElseThrow();
            return DoctorSchedule.builder()
                    .doctor(doctor)
                    .workDate(req.getWorkDate())
                    .timeSlot(req.getTimeSlot())
                    .isBooked(false)
                    .build();
        }).collect(Collectors.toList());

        scheduleRepository.saveAll(schedules);
        return ResponseEntity.ok(ApiResponse.success("Đã thiết lập lịch trực thành công", null));
    }

    @PostMapping("/copy")
    public ResponseEntity<ApiResponse<Void>> copySchedules(
            @RequestParam Integer doctorId,
            @RequestParam String fromDate,
            @RequestParam String toDate) {
        
        LocalDate sourceDate = LocalDate.parse(fromDate);
        LocalDate targetDate = LocalDate.parse(toDate);
        
        List<DoctorSchedule> sourceSchedules = scheduleRepository.findByDoctorIdAndWorkDate(doctorId, sourceDate);
        
        List<DoctorSchedule> newSchedules = sourceSchedules.stream().map(s -> 
            DoctorSchedule.builder()
                .doctor(s.getDoctor())
                .workDate(targetDate)
                .timeSlot(s.getTimeSlot())
                .isBooked(false)
                .build()
        ).collect(Collectors.toList());

        scheduleRepository.saveAll(newSchedules);
        return ResponseEntity.ok(ApiResponse.success("Đã sao chép lịch trực sang ngày " + toDate, null));
    }

    @PostMapping("/cycle")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> assignCycleSchedule(@RequestBody CycleScheduleRequest request) {
        List<DoctorSchedule> newSchedules = new ArrayList<>();
        Doctor doctor = doctorRepository.findById(request.getDoctorId()).orElseThrow();
        
        // Quy đổi Ca trực sang khung giờ
        String timeSlot = request.getShiftType().equals("Ca sáng") ? "08:00 - 12:00" : "13:30 - 17:30";

        // Logic tính toán ngày
        for (Integer week : request.getWeeks()) {
            for (Integer day : request.getDaysOfWeek()) {
                // Hàm tự chế để tìm ngày cụ thể từ Tuần, Thứ, Tháng, Năm
                LocalDate targetDate = calculateDate(request.getYear(), request.getMonth(), week, day);
                
                if (targetDate != null) {
                    newSchedules.add(DoctorSchedule.builder()
                            .doctor(doctor)
                            .workDate(targetDate)
                            .timeSlot(timeSlot)
                            .isBooked(false)
                            .build());
                }
            }
        }
        scheduleRepository.saveAll(newSchedules);
        return ResponseEntity.ok(ApiResponse.success("Gán lịch chu kỳ thành công", null));
    }

    // Hàm bổ trợ tính ngày (logic đơn giản)
    private LocalDate calculateDate(int year, int month, int week, int dayOfWeek) {
        try {
            LocalDate firstDayOfMonth = LocalDate.of(year, month, 1);
            // Tìm ngày đầu tiên của tháng là thứ mấy
            int firstDayDayOfWeek = firstDayOfMonth.getDayOfWeek().getValue() + 1; // 2=T2...
            
            // Tính toán ngày dựa trên tuần và thứ
            int offset = (dayOfWeek - firstDayDayOfWeek) + (week - 1) * 7;
            LocalDate targetDate = firstDayOfMonth.plusDays(offset);
            
            // Chỉ lấy ngày trong tháng đó
            if (targetDate.getMonthValue() == month) return targetDate;
        } catch (Exception e) {}
        return null;
    }
}