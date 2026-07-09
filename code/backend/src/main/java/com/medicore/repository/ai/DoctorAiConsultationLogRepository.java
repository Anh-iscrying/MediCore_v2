package com.medicore.repository.ai;

import com.medicore.entity.ai.DoctorAiConsultationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorAiConsultationLogRepository extends JpaRepository<DoctorAiConsultationLog, Integer> {
    boolean existsByDoctorId(Integer doctorId);
}
