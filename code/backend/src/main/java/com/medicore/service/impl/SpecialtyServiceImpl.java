package com.medicore.service.impl;

import com.medicore.common.constants.ErrorCodes;
import com.medicore.common.exception.CustomBusinessException;
import com.medicore.dto.request.SpecialtyRequest;
import com.medicore.dto.response.SpecialtyResponse;
import com.medicore.entity.catalog.Specialty;
import com.medicore.repository.DoctorRepository;
import com.medicore.repository.SpecialtyRepository;
import com.medicore.service.SpecialtyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SpecialtyServiceImpl implements SpecialtyService {

    private static final Set<String> ALLOWED_FIELD_TYPES = Set.of("text", "textarea", "number", "select", "checkbox");

    private final SpecialtyRepository specialtyRepository;
    private final DoctorRepository doctorRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SpecialtyResponse> getAllSpecialties() {
        // Batch count: 1 query thay vì N+1
        Map<Integer, Long> countMap = new java.util.HashMap<>();
        doctorRepository.countGroupBySpecialtyId().forEach(row ->
            countMap.put(((Number) row[0]).intValue(), ((Number) row[1]).longValue())
        );

        return specialtyRepository.findAll().stream()
                .map(s -> SpecialtyResponse.builder()
                        .id(s.getId())
                        .name(s.getSpecialtyName())
                        .doctorCount(countMap.getOrDefault(s.getId(), 0L))
                        .examTemplate(normalizeExamTemplate(s.getExamTemplate()))
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SpecialtyResponse getSpecialtyById(Integer id) {
        Specialty specialty = specialtyRepository.findById(id)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));
        return mapToResponse(specialty);
    }

    @Override
    @Transactional
    public SpecialtyResponse createSpecialty(SpecialtyRequest request) {
        if (specialtyRepository.existsBySpecialtyName(request.getName())) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST);
        }
        Specialty specialty = Specialty.builder()
                .specialtyName(request.getName())
                .examTemplate(normalizeExamTemplate(request.getExamTemplate()))
                .createdAt(OffsetDateTime.now())
                .build();
        specialty = specialtyRepository.save(specialty);
        return mapToResponse(specialty);
    }

    @Override
    @Transactional
    public SpecialtyResponse updateSpecialty(Integer id, SpecialtyRequest request) {
        Specialty specialty = specialtyRepository.findById(id)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));

        if (specialtyRepository.existsBySpecialtyNameAndIdNot(request.getName(), id)) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST);
        }

        specialty.setSpecialtyName(request.getName());
        if (request.getExamTemplate() != null) {
            specialty.setExamTemplate(normalizeExamTemplate(request.getExamTemplate()));
        }
        specialty = specialtyRepository.save(specialty);
        return mapToResponse(specialty);
    }

    @Override
    @Transactional
    public void deleteSpecialty(Integer id) {
        Specialty specialty = specialtyRepository.findById(id)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));
        
        // Vì đây là hard delete, nhưng chúng ta cần cẩn thận nếu có bác sĩ thuộc chuyên khoa này.
        // Tuy nhiên, theo yêu cầu "hard delete" đơn giản, nếu có liên kết DB sẽ báo lỗi khóa ngoại.
        // Ta cứ delete thẳng, Spring Data/PostgreSQL sẽ throw exception nếu có ràng buộc FK, GlobalExceptionHandler sẽ bắt và báo lỗi.
        specialtyRepository.delete(specialty);
    }

    private SpecialtyResponse mapToResponse(Specialty specialty) {
        long doctorCount = doctorRepository.countBySpecialtyId(specialty.getId());
        return SpecialtyResponse.builder()
                .id(specialty.getId())
                .name(specialty.getSpecialtyName())
                .doctorCount(doctorCount)
                .examTemplate(normalizeExamTemplate(specialty.getExamTemplate()))
                .build();
    }

    private Map<String, Object> normalizeExamTemplate(Map<String, Object> template) {
        Map<String, Object> normalized = new LinkedHashMap<>();
        if (template == null || template.isEmpty()) {
            normalized.put("fields", List.of());
            return normalized;
        }

        Object fieldsValue = template.get("fields");
        if (fieldsValue == null) {
            normalized.put("fields", List.of());
            return normalized;
        }
        if (!(fieldsValue instanceof List<?> fields)) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST);
        }

        List<Map<String, Object>> normalizedFields = new ArrayList<>();
        for (Object fieldValue : fields) {
            if (!(fieldValue instanceof Map<?, ?> field)) {
                throw new CustomBusinessException(ErrorCodes.BAD_REQUEST);
            }

            Object idValue = field.get("id");
            Object labelValue = field.get("label");
            Object typeValue = field.get("type");
            String id = idValue instanceof String ? ((String) idValue).trim() : "";
            String label = labelValue instanceof String ? ((String) labelValue).trim() : "";
            String type = typeValue instanceof String ? ((String) typeValue).trim() : "";
            if (id.isBlank() || label.isBlank() || !ALLOWED_FIELD_TYPES.contains(type)) {
                throw new CustomBusinessException(ErrorCodes.BAD_REQUEST);
            }

            Map<String, Object> normalizedField = new LinkedHashMap<>();
            normalizedField.put("id", id);
            normalizedField.put("label", label);
            normalizedField.put("type", type);
            normalizedField.put("required", Boolean.TRUE.equals(field.get("required")));

            Object optionsValue = field.get("options");
            if ("select".equals(type)) {
                if (!(optionsValue instanceof List<?> options)) {
                    throw new CustomBusinessException(ErrorCodes.BAD_REQUEST);
                }
                List<String> normalizedOptions = options.stream()
                        .filter(String.class::isInstance)
                        .map(String.class::cast)
                        .map(String::trim)
                        .filter(option -> !option.isBlank())
                        .distinct()
                        .toList();
                if (normalizedOptions.isEmpty()) {
                    throw new CustomBusinessException(ErrorCodes.BAD_REQUEST);
                }
                normalizedField.put("options", normalizedOptions);
            } else {
                normalizedField.put("options", List.of());
            }

            normalizedFields.add(normalizedField);
        }

        normalized.put("fields", normalizedFields);
        return normalized;
    }
}
