package com.medicore.service.ai;

import com.medicore.dto.ai.PatientAiRoutePlan;
import com.medicore.dto.request.AiChatMessageRequest;

import java.util.List;

public interface PatientAiRoutePlanner {
    PatientAiRoutePlan plan(String message, List<AiChatMessageRequest> history);
}
