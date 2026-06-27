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
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SpecialtyServiceImpl implements SpecialtyService {

    private final SpecialtyRepository specialtyRepository;
    private final DoctorRepository doctorRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SpecialtyResponse> getAllSpecialties() {
        return specialtyRepository.findAll().stream()
                .map(this::mapToResponse)
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
                .build();
    }
}
