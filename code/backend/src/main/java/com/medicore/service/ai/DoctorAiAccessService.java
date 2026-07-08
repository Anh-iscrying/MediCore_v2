package com.medicore.service.ai;

import com.medicore.dto.ai.DoctorAiAuthorizedTarget;
import com.medicore.dto.request.DoctorAiChatRequest;

public interface DoctorAiAccessService {
    DoctorAiAuthorizedTarget resolveTarget(String email, DoctorAiChatRequest request);
}
