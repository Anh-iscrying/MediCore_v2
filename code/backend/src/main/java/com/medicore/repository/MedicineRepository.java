package com.medicore.repository;

import com.medicore.entity.catalog.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor; // Thêm dòng này
import org.springframework.stereotype.Repository;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Integer>, JpaSpecificationExecutor<Medicine> {
    boolean existsByMedicineName(String medicineName);
    boolean existsByMedicineNameAndIdNot(String medicineName, Integer id);
}