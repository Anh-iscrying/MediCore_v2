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
