package com.medicore.repository;

import com.medicore.entity.clinical.PrescriptionDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrescriptionDetailRepository extends JpaRepository<PrescriptionDetail, Integer> {
    void deleteByPrescriptionId(Integer prescriptionId);

    List<PrescriptionDetail> findByPrescriptionId(Integer prescriptionId);
}
