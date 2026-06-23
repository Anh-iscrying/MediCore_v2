package com.medicore.repository;

import com.medicore.entity.catalog.Disease;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiseaseRepository extends JpaRepository<Disease, String> {
    boolean existsByIcd10Code(String icd10Code);
}
