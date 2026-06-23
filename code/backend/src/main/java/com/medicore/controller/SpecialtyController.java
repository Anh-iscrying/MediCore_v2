package com.medicore.controller;

import com.medicore.common.base.ApiResponse;
import com.medicore.dto.request.SpecialtyRequest;
import com.medicore.dto.response.SpecialtyResponse;
import com.medicore.service.SpecialtyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/specialties")
@RequiredArgsConstructor
public class SpecialtyController {

    private final SpecialtyService specialtyService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SpecialtyResponse>>> getAllSpecialties() {
        return ResponseEntity.ok(ApiResponse.success(specialtyService.getAllSpecialties()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SpecialtyResponse>> getSpecialtyById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(specialtyService.getSpecialtyById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SpecialtyResponse>> createSpecialty(@Valid @RequestBody SpecialtyRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Thêm chuyên khoa thành công", specialtyService.createSpecialty(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SpecialtyResponse>> updateSpecialty(
            @PathVariable Integer id,
            @Valid @RequestBody SpecialtyRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật chuyên khoa thành công", specialtyService.updateSpecialty(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSpecialty(@PathVariable Integer id) {
        specialtyService.deleteSpecialty(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa chuyên khoa thành công", null));
    }
}
