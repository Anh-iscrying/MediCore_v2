package com.medicore.entity.ai;

import com.medicore.entity.user.Patient;
import com.medicore.entity.catalog.Specialty;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "ai_consultation_logs")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class AiConsultationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient; // Reference patients.id (numeric), không phải patient_code

    @Column(name = "symptom_input", columnDefinition = "TEXT", nullable = false)
    private String symptomInput;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "suggested_specialty_id")
    private Specialty suggestedSpecialty;

    @Column(name = "ai_reasoning", columnDefinition = "TEXT")
    private String aiReasoning;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}