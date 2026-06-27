package com.medicore.repository;

import com.medicore.entity.catalog.Disease;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor; // Thêm dòng này
import org.springframework.stereotype.Repository;

@Repository
public interface DiseaseRepository extends JpaRepository<Disease, String>, JpaSpecificationExecutor<Disease> {
    boolean existsByIcd10Code(String icd10Code);
}