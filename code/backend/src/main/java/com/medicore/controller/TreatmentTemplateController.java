package com.medicore.controller;

import com.medicore.common.base.ApiResponse;
import com.medicore.dto.request.TreatmentTemplateRequest;
import com.medicore.dto.response.TreatmentTemplateResponse;
import com.medicore.service.TreatmentTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/treatment-templates")
@RequiredArgsConstructor
public class TreatmentTemplateController {

    private final TreatmentTemplateService templateService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> createTemplate(@RequestBody TreatmentTemplateRequest request) {
        templateService.createTemplate(request);
        return ResponseEntity.ok(ApiResponse.success("Tạo gói thuốc mẫu thành công", null));
    }

    @GetMapping("/by-disease/{icd10Code}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    // Đổi TreatmentTemplate thành TreatmentTemplateResponse ở dòng dưới
    public ResponseEntity<ApiResponse<List<TreatmentTemplateResponse>>> getTemplatesByDisease(@PathVariable String icd10Code) {
        return ResponseEntity.ok(ApiResponse.success(templateService.getTemplatesByDisease(icd10Code)));
    }
}