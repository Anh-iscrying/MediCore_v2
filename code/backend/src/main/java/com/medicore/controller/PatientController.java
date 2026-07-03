package com.medicore.controller;

import com.medicore.common.base.ApiResponse;
import com.medicore.common.constants.ErrorCodes;
import com.medicore.common.exception.CustomBusinessException;
import com.medicore.dto.request.PatientRequest;
import com.medicore.dto.request.PatientUpdateRequest;
import com.medicore.dto.response.PatientResponse;
import com.medicore.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<List<PatientResponse>>> getAllPatients() {
        List<PatientResponse> patients = patientService.getAllPatients();
        return ResponseEntity.ok(ApiResponse.success(patients));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<PatientResponse>> getCurrentPatient() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new CustomBusinessException(ErrorCodes.UNAUTHORIZED);
        }

        PatientResponse patient = patientService.getCurrentPatient(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(patient));
    }

    @PatchMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<PatientResponse>> updateCurrentPatient(@Valid @RequestBody PatientUpdateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new CustomBusinessException(ErrorCodes.UNAUTHORIZED);
        }

        PatientResponse patient = patientService.updateCurrentPatient(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin thành công", patient));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<PatientResponse>> getPatientById(@PathVariable Integer id) {
        PatientResponse patient = patientService.getPatientById(id);
        return ResponseEntity.ok(ApiResponse.success(patient));
    }

    @GetMapping("/code/{code}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<PatientResponse>> getPatientByCode(@PathVariable String code) {
        PatientResponse patient = patientService.getPatientByCode(code);
        return ResponseEntity.ok(ApiResponse.success(patient));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<PatientResponse>> createPatient(@Valid @RequestBody PatientRequest request) {
        PatientResponse patient = patientService.createPatient(request);
        return ResponseEntity.ok(ApiResponse.success("Thêm bệnh nhân thành công", patient));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<PatientResponse>> updatePatient(
            @PathVariable Integer id,
            @Valid @RequestBody PatientRequest request) {
        PatientResponse patient = patientService.updatePatient(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin bệnh nhân thành công", patient));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePatient(@PathVariable Integer id) {
        patientService.deletePatient(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa bệnh nhân thành công", null));
    }

    @PostMapping("/family")
    @PreAuthorize("hasRole('PATIENT')") // Chỉ bệnh nhân mới được thêm người thân cho mình
    public ResponseEntity<ApiResponse<PatientResponse>> addFamilyMember(@Valid @RequestBody PatientRequest request) {
        
        // 1. Lấy email của người đang đăng nhập (chủ tài khoản - Chị Bầu)
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // 2. Gọi service để tạo hồ sơ người thân và gắn managedBy = email này
        PatientResponse response = patientService.addFamilyMember(request, currentUserEmail);
        
        return ResponseEntity.ok(ApiResponse.success("Thêm người thân thành công", response));
    }
}
