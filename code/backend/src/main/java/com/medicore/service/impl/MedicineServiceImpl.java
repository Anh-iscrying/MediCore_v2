package com.medicore.service.impl;

import com.medicore.common.constants.ErrorCodes;
import com.medicore.common.exception.CustomBusinessException;
import com.medicore.dto.request.MedicineRequest;
import com.medicore.dto.response.MedicineResponse;
import com.medicore.entity.catalog.Medicine;
import com.medicore.repository.MedicineRepository;
import com.medicore.service.MedicineService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicineServiceImpl implements MedicineService {

    private final MedicineRepository medicineRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MedicineResponse> getAllMedicines() {
        return medicineRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MedicineResponse getMedicineById(Integer id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));
        return mapToResponse(medicine);
    }

    @Override
    @Transactional
    public MedicineResponse createMedicine(MedicineRequest request) {
        if (medicineRepository.existsByMedicineName(request.getName())) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST);
        }

        Medicine medicine = Medicine.builder()
                .medicineName(request.getName())
                .unit(request.getUnit())
                .createdAt(OffsetDateTime.now())
                .build();

        medicine = medicineRepository.save(medicine);
        return mapToResponse(medicine);
    }

    @Override
    @Transactional
    public MedicineResponse updateMedicine(Integer id, MedicineRequest request) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));

        if (medicineRepository.existsByMedicineNameAndIdNot(request.getName(), id)) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST);
        }

        medicine.setMedicineName(request.getName());
        medicine.setUnit(request.getUnit());

        medicine = medicineRepository.save(medicine);
        return mapToResponse(medicine);
    }

    @Override
    @Transactional
    public void deleteMedicine(Integer id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));
        medicineRepository.delete(medicine);
    }

    private MedicineResponse mapToResponse(Medicine medicine) {
        return MedicineResponse.builder()
                .id(medicine.getId())
                .name(medicine.getMedicineName())
                .code(String.format("MED-%04d", medicine.getId()))
                .category("Thuốc điều trị")
                .unit(medicine.getUnit())
                .price(15000.0)
                .stock(100)
                .manufacturer("Việt Nam")
                .status("available")
                .build();
    }
}
