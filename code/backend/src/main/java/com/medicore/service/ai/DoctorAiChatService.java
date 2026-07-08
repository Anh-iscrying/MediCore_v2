package com.medicore.service.ai;

import com.medicore.dto.request.DoctorAiChatRequest;
import com.medicore.dto.response.AiChatResponse;

public interface DoctorAiChatService {
    AiChatResponse chat(String email, DoctorAiChatRequest request);
}
