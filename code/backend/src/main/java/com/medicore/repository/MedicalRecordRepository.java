package com.medicore.repository;

import com.medicore.entity.clinical.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Integer> {

    @Query("SELECT r FROM MedicalRecord r LEFT JOIN FETCH r.appointment a LEFT JOIN FETCH r.patient LEFT JOIN FETCH r.doctor d LEFT JOIN FETCH d.specialty LEFT JOIN FETCH r.diagnosisIcd10 WHERE a.id = :appointmentId")
    Optional<MedicalRecord> findByAppointmentId(@Param("appointmentId") Integer appointmentId);

    @Query("SELECT r FROM MedicalRecord r LEFT JOIN FETCH r.appointment a LEFT JOIN FETCH r.patient p LEFT JOIN FETCH r.doctor d LEFT JOIN FETCH d.specialty LEFT JOIN FETCH r.diagnosisIcd10 WHERE a.id = :appointmentId AND p.patientCode = :patientCode")
    Optional<MedicalRecord> findByAppointmentIdAndPatientPatientCode(@Param("appointmentId") Integer appointmentId, @Param("patientCode") String patientCode);

    @Query("SELECT r FROM MedicalRecord r LEFT JOIN FETCH r.appointment a LEFT JOIN FETCH r.patient p LEFT JOIN FETCH r.doctor d LEFT JOIN FETCH d.specialty LEFT JOIN FETCH r.diagnosisIcd10 WHERE p.patientCode = :patientCode ORDER BY r.createdAt DESC")
    List<MedicalRecord> findByPatientPatientCodeOrderByCreatedAtDesc(@Param("patientCode") String patientCode);
}