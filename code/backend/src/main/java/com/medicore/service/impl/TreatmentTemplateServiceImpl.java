package com.medicore.service.impl;

import com.medicore.dto.request.TreatmentTemplateRequest;
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

@Service
@RequiredArgsConstructor
public class TreatmentTemplateServiceImpl implements TreatmentTemplateService {

    private final TreatmentTemplateRepository templateRepository;
    private final TemplateDetailRepository detailRepository;
    private final DiseaseRepository diseaseRepository;
    private final MedicineRepository medicineRepository;

    @Override
    @Transactional
    public void createTemplate(TreatmentTemplateRequest request) {
        // 1. Tìm mã bệnh ICD-10
        Disease disease = diseaseRepository.findById(request.getIcd10Code())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã bệnh: " + request.getIcd10Code()));

        // 2. Lưu thông tin chung của Gói thuốc mẫu
        TreatmentTemplate template = TreatmentTemplate.builder()
                .disease(disease)
                .templateName(request.getTemplateName())
                .description(request.getDescription())
                .createdAt(LocalDateTime.now())
                .build();
        
        template = templateRepository.save(template);

        // 3. Lưu chi tiết từng loại thuốc nằm trong gói
        if (request.getMedicines() != null) {
            for (TreatmentTemplateRequest.MedicineItemRequest item : request.getMedicines()) {
                Medicine medicine = medicineRepository.findById(item.getMedicineId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy thuốc ID: " + item.getMedicineId()));
                
                TemplateDetail detail = TemplateDetail.builder()
                        .template(template)
                        .medicine(medicine)
                        .defaultQuantity(item.getQuantity())
                        .defaultDosage(item.getDosage())
                        .build();
                
                detailRepository.save(detail);
            }
        }
    }
}