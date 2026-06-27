package com.medicore.repository;

import com.medicore.entity.catalog.TreatmentTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.List;

public interface TreatmentTemplateRepository extends JpaRepository<TreatmentTemplate, Integer>, JpaSpecificationExecutor<TreatmentTemplate> {
    List<TreatmentTemplate> findByDiseaseIcd10Code(String icd10Code);
}