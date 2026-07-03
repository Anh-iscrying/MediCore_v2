package com.medicore.controller;

import com.medicore.common.base.ApiResponse;
import com.medicore.dto.request.MedicalRecordRequest;
import com.medicore.dto.response.MedicalRecordResponse;
import com.medicore.service.MedicalRecordService; // Bạn sẽ tạo interface này
import com.medicore.dto.response.MedicalRecordResponse;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/clinical/medical-records") // Dùng gạch nối "-" thay vì "_" cho chuẩn REST
@RequiredArgsConstructor
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createRecord(@RequestBody MedicalRecordRequest request) {
        medicalRecordService.createMedicalRecord(request);
        return ResponseEntity.ok(ApiResponse.success("Lưu hồ sơ bệnh án thành công", null));
    }

    @GetMapping("/my-history")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<List<MedicalRecordResponse>>> getMyHistory() {
        // Lấy email từ token của người đang đăng nhập (người em)
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(ApiResponse.success(medicalRecordService.getHistoryByEmail(email)));
    }
}