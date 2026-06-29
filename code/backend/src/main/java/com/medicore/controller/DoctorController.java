package com.medicore.controller;

import com.medicore.common.base.ApiResponse;
import com.medicore.dto.request.DoctorProfileRequest;
import com.medicore.dto.request.DoctorRequest;
import com.medicore.dto.response.DoctorResponse;
import com.medicore.entity.user.Doctor;
import com.medicore.repository.DoctorRepository;
import com.medicore.repository.DoctorScheduleRepository;
import com.medicore.service.DoctorService;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;
    private final DoctorRepository doctorRepository; // KHAI BÁO THÊM DÒNG NÀY
    private final DoctorScheduleRepository scheduleRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> getAllDoctors() {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getAllDoctors()));
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
}
