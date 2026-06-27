package com.medicore.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class TreatmentTemplateRequest {
    private String icd10Code;      // Mã bệnh (Vd: J02)
    private String templateName;    // Tên gói (Vd: Combo viêm họng)
    private String description;
    private List<MedicineItemRequest> medicines; // Danh sách thuốc trong gói

    @Data
    public static class MedicineItemRequest {
        private Integer medicineId;
        private Integer quantity;
        private String dosage;
    }
}