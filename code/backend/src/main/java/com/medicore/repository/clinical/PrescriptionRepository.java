package com.medicore.repository.clinical;

import com.medicore.entity.clinical.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PrescriptionRepository extends JpaRepository<Prescription, Integer> {
    @Query("SELECT p FROM Prescription p LEFT JOIN FETCH p.details d LEFT JOIN FETCH d.medicine WHERE p.medicalRecord.id = :medicalRecordId")
    Optional<Prescription> findByMedicalRecordIdWithDetails(@Param("medicalRecordId") Integer medicalRecordId);

    Optional<Prescription> findByMedicalRecordId(Integer medicalRecordId);
}
