package com.medicore.service.impl;

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
import java.util.List;
import java.util.stream.Collectors;

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
        Disease disease = diseaseRepository.findById(request.getIcd10Code())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã bệnh: " + request.getIcd10Code()));

        TreatmentTemplate template = TreatmentTemplate.builder()
                .disease(disease)
                .templateName(request.getTemplateName())
                .description(request.getDescription())
                .createdAt(LocalDateTime.now())
                .build();
        
        TreatmentTemplate savedTemplate = templateRepository.save(template);

        if (request.getMedicines() != null) {
            for (TreatmentTemplateRequest.MedicineItemRequest item : request.getMedicines()) {
                Medicine medicine = medicineRepository.findById(item.getMedicineId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy thuốc ID: " + item.getMedicineId()));
                
                TemplateDetail detail = TemplateDetail.builder()
                        .template(savedTemplate)
                        .medicine(medicine)
                        .defaultQuantity(item.getQuantity())
                        .defaultDosage(item.getDosage())
                        .build();
                
                detailRepository.save(detail);
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<TreatmentTemplateResponse> getTemplatesByDisease(String icd10Code) {
        // 1. Tìm tất cả các gói thuốc mẫu theo mã bệnh
        List<TreatmentTemplate> templates = templateRepository.findByDiseaseIcd10Code(icd10Code);

        // 2. Chuyển đổi từ Entity sang DTO để trả về cho Controller
        return templates.stream().map(template -> {
            // Lấy danh sách thuốc chi tiết của từng gói (Nếu Entity chưa cấu hình @OneToMany)
            // Ở đây mình dùng detailRepository để truy vấn cho chắc chắn
            List<TemplateDetail> details = detailRepository.findAll().stream()
                    .filter(d -> d.getTemplate().getId().equals(template.getId()))
                    .collect(Collectors.toList());

            return TreatmentTemplateResponse.builder()
                    .id(template.getId())
                    .templateName(template.getTemplateName())
                    .description(template.getDescription())
                    .icd10Code(template.getDisease().getIcd10Code())
                    .details(details.stream().map(d -> 
                        TreatmentTemplateResponse.TemplateDetailResponse.builder()
                            .medicineName(d.getMedicine().getMedicineName())
                            .quantity(d.getDefaultQuantity())
                            .dosage(d.getDefaultDosage())
                            .build()
                    ).collect(Collectors.toList()))
                    .build();
        }).collect(Collectors.toList());
    }
}