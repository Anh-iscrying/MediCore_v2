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
public class PatientAiRoutePlan {
    @Builder.Default
    private List<PatientAiContextAction> actions = List.of();

    private String clarificationQuestion;

    /** Trọng tâm trả lời, VD: "đơn thuốc của lần khám này" */
    private String answerFocus;

    public static PatientAiRoutePlan empty() {
        return PatientAiRoutePlan.builder().build();
    }
}
