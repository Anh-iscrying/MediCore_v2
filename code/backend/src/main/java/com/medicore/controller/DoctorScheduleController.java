package com.medicore.controller;

import com.medicore.common.base.ApiResponse;
import com.medicore.dto.request.ScheduleRequest;
import com.medicore.entity.clinical.DoctorSchedule;
import com.medicore.entity.user.Doctor;
import com.medicore.repository.DoctorRepository;
import com.medicore.repository.DoctorScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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
}