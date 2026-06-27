package com.medicore.service;

import java.util.List;

import com.medicore.dto.request.TreatmentTemplateRequest;
import com.medicore.dto.response.TreatmentTemplateResponse;

public interface TreatmentTemplateService {
    // Khai báo hàm tạo gói thuốc mẫu cho MC-05
    void createTemplate(TreatmentTemplateRequest request);
    List<TreatmentTemplateResponse> getTemplatesByDisease(String icd10Code);
}