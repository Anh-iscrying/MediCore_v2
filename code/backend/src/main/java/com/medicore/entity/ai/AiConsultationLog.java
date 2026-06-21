package com.medicore.entity.ai;

import com.medicore.common.base.BaseEntity;
import com.medicore.entity.user.Patient;
import com.medicore.entity.catalog.Specialty;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ai_consultation_logs")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class AiConsultationLog extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String symptomInput;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "suggested_specialty_id")
    private Specialty suggestedSpecialty;

    @Column(columnDefinition = "TEXT")
    private String aiReasoning;
}