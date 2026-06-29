package com.medicore.repository;

import com.medicore.entity.catalog.TemplateDetail;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TemplateDetailRepository extends JpaRepository<TemplateDetail, Integer> {
    void deleteByTemplateId(Integer templateId);
}