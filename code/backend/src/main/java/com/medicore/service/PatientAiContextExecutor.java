package com.medicore.service;

import com.medicore.dto.ai.PatientAiContext;
import com.medicore.dto.ai.PatientAiRoutePlan;

public interface PatientAiContextExecutor {
    PatientAiContext execute(String patientCode, PatientAiRoutePlan plan);
}
