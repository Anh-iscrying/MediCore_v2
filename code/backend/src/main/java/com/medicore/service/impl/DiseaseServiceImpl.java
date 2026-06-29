package com.medicore.service.impl;

import com.medicore.common.constants.ErrorCodes;
import com.medicore.common.exception.CustomBusinessException;
import com.medicore.dto.request.DiseaseRequest;
import com.medicore.dto.response.DiseaseResponse;
import com.medicore.entity.catalog.Disease;
import com.medicore.repository.DiseaseRepository;
import com.medicore.service.DiseaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiseaseServiceImpl implements DiseaseService {

    private final DiseaseRepository diseaseRepository;

    @Override
    @Transactional(readOnly = true)
    public List<DiseaseResponse> getAllDiseases() {
        return diseaseRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DiseaseResponse getDiseaseByCode(String code) {
        Disease disease = diseaseRepository.findById(code)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));
        return mapToResponse(disease);
    }

    @Override
    @Transactional
    public DiseaseResponse createDisease(DiseaseRequest request) {
        if (diseaseRepository.existsById(request.getCode())) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST);
        }

        Disease disease = Disease.builder()
                .icd10Code(request.getCode())
                .diseaseName(request.getName())
                .createdAt(OffsetDateTime.now())
                .build();

        disease = diseaseRepository.save(disease);
        return mapToResponse(disease);
    }

    @Override
    @Transactional
    public DiseaseResponse updateDisease(String code, DiseaseRequest request) {
        Disease disease = diseaseRepository.findById(code)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));

        disease.setDiseaseName(request.getName());
        disease = diseaseRepository.save(disease);
        return mapToResponse(disease);
    }

    @Override
    @Transactional
    public void deleteDisease(String code) {
        Disease disease = diseaseRepository.findById(code)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));
        diseaseRepository.delete(disease);
    }

    private DiseaseResponse mapToResponse(Disease disease) {
        return DiseaseResponse.builder()
                .id(disease.getIcd10Code())
                .code(disease.getIcd10Code())
                .name(disease.getDiseaseName())
                // Lấy từ DB, nếu null thì hiện "Chưa phân loại"
                .category(disease.getCategory() != null ? disease.getCategory() : "Chưa phân loại")
                .description(disease.getDescription() != null ? disease.getDescription() : "N/A")
                .build();
    }
}
