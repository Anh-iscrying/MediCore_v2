package com.medicore.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medicore.config.AiProperties;
import com.medicore.dto.ai.DoctorAiContextActionType;
import com.medicore.dto.ai.DoctorAiRoutePlan;
import com.medicore.service.AiGatewayClient;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DoctorAiRoutePlannerImplTest {

    private final TestAiGatewayClient aiGatewayClient = new TestAiGatewayClient();
    private final DoctorAiRoutePlannerImpl planner = new DoctorAiRoutePlannerImpl(aiGatewayClient, new ObjectMapper());

    @Test
    void planParsesValidActionsAndIgnoresUnknownFields() {
        aiGatewayClient.response = """
                ```json
                {
                  "actions": [
                    {"type":"RECENT_VISITS","limit":8,"emrCode":null},
                    {"type":"UNKNOWN_ACTION","limit":5},
                    {"type":"PRESCRIPTIONS","emrCode":"EMR002"}
                  ],
                  "clarificationQuestion": null
                }
                ```
                """;

        DoctorAiRoutePlan plan = planner.plan("Xem các lần khám gần đây và đơn thuốc", List.of());

        assertThat(plan.getActions()).hasSize(2);
        assertThat(plan.getActions().get(0).getType()).isEqualTo(DoctorAiContextActionType.RECENT_VISITS);
        assertThat(plan.getActions().get(0).getLimit()).isEqualTo(8);
        assertThat(plan.getActions().get(1).getType()).isEqualTo(DoctorAiContextActionType.PRESCRIPTIONS);
        assertThat(plan.getActions().get(1).getEmrCode()).isEqualTo("EMR002");
        assertThat(plan.getClarificationQuestion()).isNull();
    }

    @Test
    void planThrowsWhenGatewayReturnsInvalidJson() {
        aiGatewayClient.response = "invalid-json-string";

        assertThatThrownBy(() -> planner.plan("hồ sơ", List.of()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Doctor AI route planner failed");
    }

    @Test
    void planParsesNewFieldsTargetTextStrictAnswerFocus() {
        aiGatewayClient.response = """
                {
                  "actions": [
                    {"type":"VISIT_DETAIL","emrCode":"EMR001","strict":true,"targetText":"chi tiết EMR001","reason":"bác sĩ hỏi chi tiết EMR cụ thể"}
                  ],
                  "answerFocus": "xét nghiệm của lần khám EMR001"
                }
                """;

        DoctorAiRoutePlan plan = planner.plan("Chi tiết EMR001, tập trung xét nghiệm", List.of());

        assertThat(plan.getActions()).hasSize(1);
        var action = plan.getActions().get(0);
        assertThat(action.getType()).isEqualTo(DoctorAiContextActionType.VISIT_DETAIL);
        assertThat(action.getEmrCode()).isEqualTo("EMR001");
        assertThat(action.getStrict()).isTrue();
        assertThat(action.getTargetText()).isEqualTo("chi tiết EMR001");
        assertThat(action.getReason()).isEqualTo("bác sĩ hỏi chi tiết EMR cụ thể");
        assertThat(plan.getAnswerFocus()).isEqualTo("xét nghiệm của lần khám EMR001");
    }

    @Test
    void dedupeKeepsSameTypeWithDifferentOffset() {
        aiGatewayClient.response = """
                {
                  "actions": [
                    {"type":"RECENT_VISITS","offset":0,"sortAsc":true,"limit":1},
                    {"type":"RECENT_VISITS","offset":2,"sortAsc":true,"limit":1}
                  ]
                }
                """;

        DoctorAiRoutePlan plan = planner.plan("lần khám 1 và 3", List.of());

        assertThat(plan.getActions()).hasSize(2);
        assertThat(plan.getActions().get(0).getOffset()).isEqualTo(0);
        assertThat(plan.getActions().get(1).getOffset()).isEqualTo(2);
    }

    private static class TestAiGatewayClient extends AiGatewayClient {
        private String response;

        private TestAiGatewayClient() {
            super(aiProperties(), new ObjectMapper());
        }

        private static AiProperties aiProperties() {
            AiProperties properties = new AiProperties();
            properties.setModel("test-model");
            properties.setTemperature(0.0);
            return properties;
        }

        @Override
        public String completePlannerChat(List<Map<String, Object>> messages) {
            return response;
        }
    }
}
