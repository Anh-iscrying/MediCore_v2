package com.medicore.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medicore.config.AiProperties;
import com.medicore.dto.ai.PatientAiContextActionType;
import com.medicore.dto.ai.PatientAiRoutePlan;
import com.medicore.service.AiGatewayClient;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PatientAiRoutePlannerImplTest {

    private final TestAiGatewayClient aiGatewayClient = new TestAiGatewayClient();
    private final PatientAiRoutePlannerImpl planner = new PatientAiRoutePlannerImpl(aiGatewayClient, new ObjectMapper());

    @Test
    void planParsesValidActionsAndIgnoresUnknownFields() {
        aiGatewayClient.response = """
                ```json
                {
                  "actions": [
                    {"type":"RECENT_RECORDS","limit":99,"patientCode":"PAT-OTHER"},
                    {"type":"UNKNOWN","limit":5},
                    {"type":"MEDICINE_SEARCH","keyword":"paracetamol","limit":5}
                  ],
                  "clarificationQuestion": null
                }
                ```
                """;

        PatientAiRoutePlan plan = planner.plan("Cho tôi xem hồ sơ và thuốc paracetamol", List.of());

        assertThat(plan.getActions()).hasSize(2);
        assertThat(plan.getActions().get(0).getType()).isEqualTo(PatientAiContextActionType.RECENT_RECORDS);
        assertThat(plan.getActions().get(0).getLimit()).isEqualTo(99);
        assertThat(plan.getActions().get(1).getType()).isEqualTo(PatientAiContextActionType.MEDICINE_SEARCH);
        assertThat(plan.getActions().get(1).getKeyword()).isEqualTo("paracetamol");
        assertThat(plan.getClarificationQuestion()).isNull();
    }

    @Test
    void planThrowsWhenGatewayReturnsInvalidJson() {
        aiGatewayClient.response = "not-json";

        assertThatThrownBy(() -> planner.plan("hồ sơ của tôi", List.of()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("AI route planner failed");
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
