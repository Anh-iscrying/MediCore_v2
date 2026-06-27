package com.medicore.service;

import com.medicore.dto.request.SpecialtyRequest;
import com.medicore.dto.response.SpecialtyResponse;

import java.util.List;

public interface SpecialtyService {
    List<SpecialtyResponse> getAllSpecialties();
    SpecialtyResponse getSpecialtyById(Integer id);
    SpecialtyResponse createSpecialty(SpecialtyRequest request);
    SpecialtyResponse updateSpecialty(Integer id, SpecialtyRequest request);
    void deleteSpecialty(Integer id);
}
