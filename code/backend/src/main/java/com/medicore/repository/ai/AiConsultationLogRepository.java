package com.medicore.repository.ai;

import com.medicore.entity.ai.AiConsultationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AiConsultationLogRepository extends JpaRepository<AiConsultationLog, Integer> {
}
