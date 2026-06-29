package com.medicore.repository;

import com.medicore.entity.catalog.TemplateDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TemplateDetailRepository extends JpaRepository<TemplateDetail, Integer> {
    void deleteByTemplateId(Integer templateId);
    List<TemplateDetail> findByTemplateId(Integer templateId);
    List<TemplateDetail> findByTemplateIdIn(List<Integer> templateIds);
}
