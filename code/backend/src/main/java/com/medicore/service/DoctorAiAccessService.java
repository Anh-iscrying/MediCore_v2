package com.medicore.service;

import com.medicore.dto.ai.DoctorAiAuthorizedTarget;
import com.medicore.dto.request.DoctorAiChatRequest;

public interface DoctorAiAccessService {
    DoctorAiAuthorizedTarget resolveTarget(String email, DoctorAiChatRequest request);
}
