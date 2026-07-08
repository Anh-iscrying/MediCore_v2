package com.medicore.repository.clinical;

import com.medicore.entity.catalog.TreatmentTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface TreatmentTemplateRepository extends JpaRepository<TreatmentTemplate, Integer>, JpaSpecificationExecutor<TreatmentTemplate> {
    List<TreatmentTemplate> findByDiseaseIcd10Code(String icd10Code);
    List<TreatmentTemplate> findByDiseaseIcd10CodeOrderByCreatedAtDesc(String icd10Code);
    List<TreatmentTemplate> findAllByOrderByCreatedAtDesc();
    boolean existsByDiseaseIcd10CodeAndTemplateNameIgnoreCase(String icd10Code, String templateName);
    boolean existsByDiseaseIcd10CodeAndTemplateNameIgnoreCaseAndIdNot(String icd10Code, String templateName, Integer id);
}
