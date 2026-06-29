package com.medicore.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class TreatmentTemplateRequest {
    @NotBlank
    @Size(max = 10)
    private String icd10Code;

    @NotBlank
    private String templateName;

    private String description;

    @Valid
    @NotEmpty
    private List<MedicineItemRequest> medicines;

    @Data
    public static class MedicineItemRequest {
        @NotNull
        private Integer medicineId;

        @NotNull
        @Min(1)
        private Integer quantity;

        @NotBlank
        private String dosage;
    }
}
