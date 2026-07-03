package com.medicore.repository;
import com.medicore.entity.clinical.Appointment;
import com.medicore.entity.clinical.MedicalRecord;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Integer> {

    List<MedicalRecord> findByPatientPatientCode(String patientCode);
    
}