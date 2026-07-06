package com.medicore.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorAiRoutePlan {
    @Builder.Default
    private List<DoctorAiContextAction> actions = List.of();

    private String clarificationQuestion;

    public static DoctorAiRoutePlan empty() {
        return DoctorAiRoutePlan.builder().build();
    }
}
