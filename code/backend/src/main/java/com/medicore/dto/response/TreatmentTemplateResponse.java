package com.medicore.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data @Builder
public class TreatmentTemplateResponse {
    private Integer id;
    private String templateName;
    private String description;
    private String icd10Code;
    private List<TemplateDetailResponse> details;

    @Data @Builder
    public static class TemplateDetailResponse {
        private String medicineName;
        private Integer quantity;
        private String dosage;
    }
}