package com.medicore.repository;

import com.medicore.entity.catalog.TemplateDetail;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TemplateDetailRepository extends JpaRepository<TemplateDetail, Integer> {
    void deleteByTemplateId(Integer templateId);
    List<TemplateDetail> findByTemplateId(Integer templateId); 
}