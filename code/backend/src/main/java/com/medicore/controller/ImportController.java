package com.medicore.controller; // PHẢI CÓ DÒNG NÀY ĐẦU TIÊN

import com.medicore.common.base.ApiResponse;
import com.medicore.service.impl.ExcelImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/admin/import")
@RequiredArgsConstructor
public class ImportController {

    private final ExcelImportService excelImportService;

    @PostMapping("/diseases")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> importDiseases(@RequestParam("file") MultipartFile file) {
        excelImportService.importDiseases(file);
        return ResponseEntity.ok(ApiResponse.success("Import danh sách bệnh thành công", null));
    }

    @PostMapping("/medicines")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> importMedicines(@RequestParam("file") MultipartFile file) {
        excelImportService.importMedicines(file);
        return ResponseEntity.ok(ApiResponse.success("Import thuốc thành công", null));
    }
}