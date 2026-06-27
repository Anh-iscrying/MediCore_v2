package com.medicore.service;

import com.medicore.dto.request.DiseaseRequest;
import com.medicore.dto.response.DiseaseResponse;

import java.util.List;

public interface DiseaseService {
    List<DiseaseResponse> getAllDiseases();
    DiseaseResponse getDiseaseByCode(String code);
    DiseaseResponse createDisease(DiseaseRequest request);
    DiseaseResponse updateDisease(String code, DiseaseRequest request);
    void deleteDisease(String code);
}
