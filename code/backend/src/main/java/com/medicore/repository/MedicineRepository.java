package com.medicore.repository;

import com.medicore.entity.catalog.Medicine;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Integer>, JpaSpecificationExecutor<Medicine> {
    boolean existsByMedicineName(String medicineName);
    boolean existsByMedicineNameAndIdNot(String medicineName, Integer id);

    @Query("SELECT m FROM Medicine m WHERE LOWER(m.medicineName) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY m.medicineName ASC")
    List<Medicine> searchAiMedicines(@Param("keyword") String keyword, Pageable pageable);
}
