package com.medicore.service;

import com.medicore.dto.ai.DoctorAiRoutePlan;
import com.medicore.dto.request.AiChatMessageRequest;

import java.util.List;

public interface DoctorAiRoutePlanner {
    DoctorAiRoutePlan plan(String message, List<AiChatMessageRequest> history);
}
