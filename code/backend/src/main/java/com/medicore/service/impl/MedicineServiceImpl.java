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

    @Override
    @Transactional(readOnly = true)
    public List<MedicineResponse> searchMedicines(String keyword) {
        return medicineRepository.findAll((root, query, cb) -> {
            if (keyword == null || keyword.isEmpty()) return cb.conjunction();
            
            String pattern = "%" + keyword.toLowerCase() + "%";
            return cb.or(
                cb.like(cb.lower(root.get("medicineName")), pattern),
                cb.like(cb.lower(root.get("manufacturer")), pattern),
                cb.like(cb.lower(root.get("category")), pattern)
            );
        }).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private MedicineResponse mapToResponse(Medicine medicine) {
        return MedicineResponse.builder()
                .id(medicine.getId())
                .name(medicine.getMedicineName())
                .unit(medicine.getUnit())
                .category(medicine.getCategory()) // Lấy từ DB
                .price(medicine.getPrice())       // Lấy từ DB
                .stock(medicine.getStock())       // Lấy từ DB
                .manufacturer(medicine.getManufacturer()) // Lấy từ DB
                .status(medicine.getStock() > 0 ? "available" : "out_of_stock")
                .build();
    }
}
