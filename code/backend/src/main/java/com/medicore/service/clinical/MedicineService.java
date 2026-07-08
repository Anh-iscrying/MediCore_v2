package com.medicore.service.clinical;

import com.medicore.dto.request.MedicineRequest;
import com.medicore.dto.response.MedicineResponse;

import java.util.List;

public interface MedicineService {
    List<MedicineResponse> getAllMedicines();
    MedicineResponse getMedicineById(Integer id);
    MedicineResponse createMedicine(MedicineRequest request);
    MedicineResponse updateMedicine(Integer id, MedicineRequest request);
    void deleteMedicine(Integer id);
    List<MedicineResponse> searchMedicines(String keyword);
}
