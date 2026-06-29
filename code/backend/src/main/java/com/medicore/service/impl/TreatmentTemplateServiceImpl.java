package com.medicore.service.impl;

import com.medicore.common.constants.ErrorCodes;
import com.medicore.common.exception.CustomBusinessException;
import com.medicore.dto.request.TreatmentTemplateRequest;
import com.medicore.dto.response.TreatmentTemplateResponse;
import com.medicore.entity.catalog.Disease;
import com.medicore.entity.catalog.Medicine;
import com.medicore.entity.catalog.TemplateDetail;
import com.medicore.entity.catalog.TreatmentTemplate;
import com.medicore.repository.DiseaseRepository;
import com.medicore.repository.MedicineRepository;
import com.medicore.repository.TemplateDetailRepository;
import com.medicore.repository.TreatmentTemplateRepository;
import com.medicore.service.TreatmentTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TreatmentTemplateServiceImpl implements TreatmentTemplateService {

    private final TreatmentTemplateRepository templateRepository;
    private final TemplateDetailRepository detailRepository;
    private final DiseaseRepository diseaseRepository;
    private final MedicineRepository medicineRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TreatmentTemplateResponse> getTemplates(String icd10Code) {
        List<TreatmentTemplate> templates = (icd10Code == null || icd10Code.isBlank())
                ? templateRepository.findAllByOrderByCreatedAtDesc()
                : templateRepository.findByDiseaseIcd10CodeOrderByCreatedAtDesc(icd10Code);

        if (templates.isEmpty()) {
            return List.of();
        }

        List<Integer> templateIds = templates.stream()
                .map(TreatmentTemplate::getId)
                .collect(Collectors.toList());
        Map<Integer, List<TemplateDetail>> detailsByTemplate = detailRepository.findByTemplateIdIn(templateIds).stream()
                .collect(Collectors.groupingBy(detail -> detail.getTemplate().getId()));

        return templates.stream()
                .map(template -> mapToResponse(template, detailsByTemplate.getOrDefault(template.getId(), List.of())))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TreatmentTemplateResponse getTemplateById(Integer id) {
        TreatmentTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));
        return mapToResponse(template, detailRepository.findByTemplateId(id));
    }

    @Override
    @Transactional
    public TreatmentTemplateResponse createTemplate(TreatmentTemplateRequest request) {
        validateMedicineItems(request.getMedicines());

        String icd10Code = request.getIcd10Code().trim();
        String templateName = request.getTemplateName().trim();

        Disease disease = diseaseRepository.findById(icd10Code)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));

        if (templateRepository.existsByDiseaseIcd10CodeAndTemplateNameIgnoreCase(icd10Code, templateName)) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST);
        }

        TreatmentTemplate template = TreatmentTemplate.builder()
                .disease(disease)
                .templateName(templateName)
                .description(normalizeDescription(request.getDescription()))
                .createdAt(LocalDateTime.now())
                .build();

        TreatmentTemplate savedTemplate = templateRepository.save(template);
        List<TemplateDetail> details = saveTemplateDetails(savedTemplate, request.getMedicines());

        return mapToResponse(savedTemplate, details);
    }

    @Override
    @Transactional
    public TreatmentTemplateResponse updateTemplate(Integer id, TreatmentTemplateRequest request) {
        validateMedicineItems(request.getMedicines());

        TreatmentTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));

        String icd10Code = request.getIcd10Code().trim();
        String templateName = request.getTemplateName().trim();

        Disease disease = diseaseRepository.findById(icd10Code)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));

        if (templateRepository.existsByDiseaseIcd10CodeAndTemplateNameIgnoreCaseAndIdNot(icd10Code, templateName, id)) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST);
        }

        template.setDisease(disease);
        template.setTemplateName(templateName);
        template.setDescription(normalizeDescription(request.getDescription()));
        TreatmentTemplate savedTemplate = templateRepository.save(template);

        detailRepository.deleteByTemplateId(id);
        List<TemplateDetail> details = saveTemplateDetails(savedTemplate, request.getMedicines());

        return mapToResponse(savedTemplate, details);
    }

    @Override
    @Transactional
    public void deleteTemplate(Integer id) {
        TreatmentTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));
        detailRepository.deleteByTemplateId(id);
        templateRepository.delete(template);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TreatmentTemplateResponse> getTemplatesByDisease(String icd10Code) {
        return getTemplates(icd10Code);
    }

    private void validateMedicineItems(List<TreatmentTemplateRequest.MedicineItemRequest> items) {
        if (items == null || items.isEmpty()) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST);
        }

        Set<Integer> medicineIds = new HashSet<>();
        for (TreatmentTemplateRequest.MedicineItemRequest item : items) {
            if (item.getMedicineId() == null || item.getQuantity() == null || item.getQuantity() < 1
                    || item.getDosage() == null || item.getDosage().isBlank()) {
                throw new CustomBusinessException(ErrorCodes.BAD_REQUEST);
            }
            if (!medicineIds.add(item.getMedicineId())) {
                throw new CustomBusinessException(ErrorCodes.BAD_REQUEST);
            }
        }
    }

    private List<TemplateDetail> saveTemplateDetails(TreatmentTemplate template, List<TreatmentTemplateRequest.MedicineItemRequest> items) {
        return items.stream().map(item -> {
            Medicine medicine = medicineRepository.findById(item.getMedicineId())
                    .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));

            TemplateDetail detail = TemplateDetail.builder()
                    .template(template)
                    .medicine(medicine)
                    .defaultQuantity(item.getQuantity())
                    .defaultDosage(item.getDosage().trim())
                    .build();

            return detailRepository.save(detail);
        }).collect(Collectors.toList());
    }

    private TreatmentTemplateResponse mapToResponse(TreatmentTemplate template, List<TemplateDetail> details) {
        Disease disease = template.getDisease();

        return TreatmentTemplateResponse.builder()
                .id(template.getId())
                .templateName(template.getTemplateName())
                .description(template.getDescription())
                .icd10Code(disease.getIcd10Code())
                .icd10Name(disease.getDiseaseName())
                .details(details.stream().map(detail -> {
                    Medicine medicine = detail.getMedicine();
                    return TreatmentTemplateResponse.TemplateDetailResponse.builder()
                            .id(detail.getId())
                            .medicineId(medicine.getId())
                            .medicineName(medicine.getMedicineName())
                            .unit(medicine.getUnit())
                            .quantity(detail.getDefaultQuantity())
                            .dosage(detail.getDefaultDosage())
                            .build();
                }).collect(Collectors.toList()))
                .build();
    }

    private String normalizeDescription(String description) {
        if (description == null || description.isBlank()) {
            return null;
        }
        return description.trim();
    }
}
