package com.medicore.service.clinical;

import com.medicore.dto.request.TreatmentTemplateRequest;
import com.medicore.dto.response.TreatmentTemplateResponse;

import java.util.List;

public interface TreatmentTemplateService {
    List<TreatmentTemplateResponse> getTemplates(String icd10Code);
    TreatmentTemplateResponse getTemplateById(Integer id);
    TreatmentTemplateResponse createTemplate(TreatmentTemplateRequest request);
    TreatmentTemplateResponse updateTemplate(Integer id, TreatmentTemplateRequest request);
    void deleteTemplate(Integer id);
    List<TreatmentTemplateResponse> getTemplatesByDisease(String icd10Code);
}
