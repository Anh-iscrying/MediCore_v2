package com.medicore.service;

import com.medicore.dto.request.TreatmentTemplateRequest;

public interface TreatmentTemplateService {
    // Khai báo hàm tạo gói thuốc mẫu cho MC-05
    void createTemplate(TreatmentTemplateRequest request);
}