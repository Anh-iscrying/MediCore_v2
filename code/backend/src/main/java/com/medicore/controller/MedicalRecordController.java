package com.medicore.controller;

import com.medicore.common.base.ApiResponse;
import com.medicore.dto.request.MedicalRecordRequest;
import com.medicore.dto.response.MedicalRecordResponse;
import com.medicore.service.MedicalRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.medicore.common.exception.CustomBusinessException;
import com.medicore.common.constants.ErrorCodes;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/clinical/medical-records")
@RequiredArgsConstructor
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    @PostMapping
    public ResponseEntity<ApiResponse<MedicalRecordResponse>> createRecord(@RequestBody MedicalRecordRequest request) {
        MedicalRecordResponse response = medicalRecordService.createMedicalRecord(request);
        return ResponseEntity.ok(ApiResponse.success("Lưu hồ sơ bệnh án và PDF thành công", response));
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<ApiResponse<MedicalRecordResponse>> getRecordByAppointment(@PathVariable Integer appointmentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        MedicalRecordResponse response = medicalRecordService.getRecordByAppointment(appointmentId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<MedicalRecordResponse>>> getCurrentPatientRecords() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(ApiResponse.success(medicalRecordService.getCurrentPatientRecords(authentication.getName())));
    }

    @PostMapping("/appointment/{appointmentId}/upload-pdf")
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
