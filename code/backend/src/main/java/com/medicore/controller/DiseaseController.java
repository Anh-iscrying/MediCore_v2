package com.medicore.controller;

import com.medicore.common.base.ApiResponse;
import com.medicore.dto.request.DiseaseRequest;
import com.medicore.dto.response.DiseaseResponse;
import com.medicore.service.DiseaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/diseases")
@RequiredArgsConstructor
public class DiseaseController { // Khoan, đây là copy paste nhầm tên class, phải đổi thành DiseaseController

    private final DiseaseService diseaseService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DiseaseResponse>>> getAllDiseases() {
        List<DiseaseResponse> diseases = diseaseService.getAllDiseases();
        return ResponseEntity.ok(ApiResponse.success(diseases));
    }

    @GetMapping("/{code}")
    public ResponseEntity<ApiResponse<DiseaseResponse>> getDiseaseByCode(@PathVariable String code) {
        DiseaseResponse disease = diseaseService.getDiseaseByCode(code);
        return ResponseEntity.ok(ApiResponse.success(disease));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DiseaseResponse>> createDisease(@Valid @RequestBody DiseaseRequest request) {
        DiseaseResponse disease = diseaseService.createDisease(request);
        return ResponseEntity.ok(ApiResponse.success("Thêm bệnh ICD-10 thành công", disease));
    }

    @PutMapping("/{code}")
    public ResponseEntity<ApiResponse<DiseaseResponse>> updateDisease(
            @PathVariable String code,
            @Valid @RequestBody DiseaseRequest request) {
        DiseaseResponse disease = diseaseService.updateDisease(code, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin bệnh thành công", disease));
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<ApiResponse<Void>> deleteDisease(@PathVariable String code) {
        diseaseService.deleteDisease(code);
        return ResponseEntity.ok(ApiResponse.success("Xóa bệnh thành công", null));
    }
}
