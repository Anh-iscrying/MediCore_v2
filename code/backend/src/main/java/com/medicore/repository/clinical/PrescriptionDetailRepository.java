package com.medicore.repository.clinical;

import com.medicore.entity.clinical.PrescriptionDetail;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PrescriptionDetailRepository extends JpaRepository<PrescriptionDetail, Integer> {
    void deleteByPrescriptionId(Integer prescriptionId);

    List<PrescriptionDetail> findByPrescriptionId(Integer prescriptionId);

    @Query("SELECT d FROM PrescriptionDetail d LEFT JOIN FETCH d.prescription p LEFT JOIN FETCH p.medicalRecord mr LEFT JOIN FETCH d.medicine WHERE mr.patient.patientCode = :patientCode ORDER BY p.createdAt DESC, d.id ASC")
    List<PrescriptionDetail> findAiByPatientCode(@Param("patientCode") String patientCode, Pageable pageable);

    @Query("SELECT d FROM PrescriptionDetail d LEFT JOIN FETCH d.prescription p LEFT JOIN FETCH p.medicalRecord mr LEFT JOIN FETCH d.medicine WHERE mr.patient.patientCode = :patientCode AND mr.emrCode = :emrCode ORDER BY p.createdAt DESC, d.id ASC")
    List<PrescriptionDetail> findAiByPatientCodeAndEmrCode(@Param("patientCode") String patientCode, @Param("emrCode") String emrCode, Pageable pageable);
}
