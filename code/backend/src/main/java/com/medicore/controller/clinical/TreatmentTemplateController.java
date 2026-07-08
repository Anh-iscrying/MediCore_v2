package com.medicore.controller.clinical;

import com.medicore.common.base.ApiResponse;
import com.medicore.dto.request.TreatmentTemplateRequest;
import com.medicore.dto.response.TreatmentTemplateResponse;
import com.medicore.service.clinical.TreatmentTemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/treatment-templates")
@RequiredArgsConstructor
public class TreatmentTemplateController {

    private final TreatmentTemplateService templateService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<List<TreatmentTemplateResponse>>> getTemplates(
            @RequestParam(required = false) String icd10Code) {
        return ResponseEntity.ok(ApiResponse.success(templateService.getTemplates(icd10Code)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<TreatmentTemplateResponse>> getTemplateById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(templateService.getTemplateById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TreatmentTemplateResponse>> createTemplate(
            @Valid @RequestBody TreatmentTemplateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tạo gói thuốc mẫu thành công", templateService.createTemplate(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TreatmentTemplateResponse>> updateTemplate(
            @PathVariable Integer id,
            @Valid @RequestBody TreatmentTemplateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật gói thuốc mẫu thành công", templateService.updateTemplate(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTemplate(@PathVariable Integer id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa gói thuốc mẫu thành công", null));
    }

    @GetMapping("/by-disease/{icd10Code}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<List<TreatmentTemplateResponse>>> getTemplatesByDisease(@PathVariable String icd10Code) {
        return ResponseEntity.ok(ApiResponse.success(templateService.getTemplatesByDisease(icd10Code)));
    }
}
