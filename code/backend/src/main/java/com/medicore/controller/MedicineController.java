package com.medicore.controller;

import com.medicore.common.base.ApiResponse;
import com.medicore.dto.request.MedicineRequest;
import com.medicore.dto.response.MedicineResponse;
import com.medicore.service.MedicineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/medicines")
@RequiredArgsConstructor
public class MedicineController {

    private final MedicineService medicineService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MedicineResponse>>> getAllMedicines() {
        List<MedicineResponse> medicines = medicineService.getAllMedicines();
        return ResponseEntity.ok(ApiResponse.success(medicines));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicineResponse>> getMedicineById(@PathVariable Integer id) {
        MedicineResponse medicine = medicineService.getMedicineById(id);
        return ResponseEntity.ok(ApiResponse.success(medicine));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MedicineResponse>> createMedicine(@Valid @RequestBody MedicineRequest request) {
        MedicineResponse medicine = medicineService.createMedicine(request);
        return ResponseEntity.ok(ApiResponse.success("Thêm thuốc thành công", medicine));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicineResponse>> updateMedicine(
            @PathVariable Integer id,
            @Valid @RequestBody MedicineRequest request) {
        MedicineResponse medicine = medicineService.updateMedicine(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin thuốc thành công", medicine));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMedicine(@PathVariable Integer id) {
        medicineService.deleteMedicine(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa thuốc thành công", null));
    }
}
