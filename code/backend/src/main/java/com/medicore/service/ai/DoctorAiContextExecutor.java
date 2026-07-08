package com.medicore.service.ai;

import com.medicore.dto.ai.DoctorAiAuthorizedTarget;
import com.medicore.dto.ai.DoctorAiContext;
import com.medicore.dto.ai.DoctorAiRoutePlan;

public interface DoctorAiContextExecutor {
    DoctorAiContext execute(DoctorAiAuthorizedTarget target, DoctorAiRoutePlan plan);

    DoctorAiContext buildDefaultContext(DoctorAiAuthorizedTarget target);
}
