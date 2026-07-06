package com.medicore.controller;

import com.medicore.common.base.ApiResponse;
import com.medicore.common.constants.ErrorCodes;
import com.medicore.common.exception.CustomBusinessException;
import com.medicore.dto.request.MedicalRecordRequest;
import com.medicore.dto.response.MedicalRecordResponse;
import com.medicore.service.MedicalRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/clinical/medical-records")
@RequiredArgsConstructor
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    // 1. Tạo hồ sơ bệnh án (Dùng cho Bác sĩ)
    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<MedicalRecordResponse>> createRecord(@RequestBody MedicalRecordRequest request) {
        MedicalRecordResponse response = medicalRecordService.createMedicalRecord(request);
        return ResponseEntity.ok(ApiResponse.success("Lưu hồ sơ bệnh án thành công", response));
    }

    // 2. Lấy hồ sơ theo ID cụ thể (Từ nhánh HEAD)
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PATIENT')")
    public ResponseEntity<ApiResponse<MedicalRecordResponse>> getRecordById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(medicalRecordService.getById(id)));
    }

    // 3. Lấy hồ sơ theo ID cuộc hẹn (Từ nhánh MC-09-v1)
    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT')")
    public ResponseEntity<ApiResponse<MedicalRecordResponse>> getRecordByAppointment(@PathVariable Integer appointmentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        MedicalRecordResponse response = medicalRecordService.getRecordByAppointment(appointmentId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // 4. Lấy lịch sử bệnh án của tôi (Bệnh nhân tự xem - Hợp nhất từ /me và /my-history)
    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<List<MedicalRecordResponse>>> getCurrentPatientRecords() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(ApiResponse.success(medicalRecordService.getCurrentPatientRecords(authentication.getName())));
    }

    // 6. Lấy toàn bộ hồ sơ bệnh án do bác sĩ hiện tại lập (Dùng cho Bác sĩ)
    @GetMapping("/doctor-records")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<List<MedicalRecordResponse>>> getDoctorRecords() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        List<MedicalRecordResponse> response = medicalRecordService.getDoctorMedicalRecords(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // 5. Tải file PDF bệnh án lên (Từ nhánh MC-09-v1)
    @PostMapping("/appointment/{appointmentId}/upload-pdf")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<Void>> uploadPdf(
            @PathVariable Integer appointmentId,
            @RequestParam("file") MultipartFile file) {
        try {
            medicalRecordService.uploadPdf(appointmentId, file.getBytes());
            return ResponseEntity.ok(ApiResponse.success("Tải hồ sơ PDF lên thành công", null));
        } catch (IOException e) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Không thể đọc dữ liệu file PDF");
        }
    }
}