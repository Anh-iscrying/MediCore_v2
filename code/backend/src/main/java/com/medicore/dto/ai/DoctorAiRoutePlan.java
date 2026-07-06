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

    /** Trọng tâm trả lời, VD: "xét nghiệm của lần khám EMR001" */
    private String answerFocus;

    public static DoctorAiRoutePlan empty() {
        return DoctorAiRoutePlan.builder().build();
    }
}
