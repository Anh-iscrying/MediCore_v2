package com.medicore.controller;

import com.medicore.common.base.ApiResponse;
import com.medicore.dto.request.DoctorRequest;
import com.medicore.dto.response.DoctorResponse;
import com.medicore.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping
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
    public ResponseEntity<ApiResponse<DoctorResponse>> createDoctor(@Valid @RequestBody DoctorRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Thêm bác sĩ thành công", doctorService.createDoctor(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorResponse>> updateDoctor(
            @PathVariable Integer id,
            @Valid @RequestBody DoctorRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật bác sĩ thành công", doctorService.updateDoctor(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDoctor(@PathVariable Integer id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa bác sĩ thành công", null));
    }
}
