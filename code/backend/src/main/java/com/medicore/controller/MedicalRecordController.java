package com.medicore.controller;

import com.medicore.common.base.ApiResponse;
import com.medicore.dto.request.MedicalRecordRequest;
import com.medicore.service.MedicalRecordService; // Bạn sẽ tạo interface này
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
}