package com.medicore.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medicore.dto.ai.DoctorAiContextAction;
import com.medicore.dto.ai.DoctorAiContextActionType;
import com.medicore.dto.ai.DoctorAiRoutePlan;
import com.medicore.dto.request.AiChatMessageRequest;
import com.medicore.service.AiGatewayClient;
import com.medicore.service.DoctorAiRoutePlanner;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class DoctorAiRoutePlannerImpl implements DoctorAiRoutePlanner {

    private static final int MAX_ACTIONS = 4;
    private static final int MAX_HISTORY_MESSAGES = 4;
    private static final int MAX_TEXT_LENGTH = 600;

    private static final String PLANNER_PROMPT = """
            Bạn là bộ định tuyến context cho trợ lý bác sĩ MediCore. Nhiệm vụ duy nhất: chọn dữ liệu hệ thống cần lấy trước khi AI trả lời.
            Không trả lời tư vấn y tế. Chỉ trả JSON hợp lệ, không markdown, không giải thích.

            Action được phép:
            - PATIENT_PROFILE: Thông tin cá nhân của bệnh nhân (tên, tuổi, giới tính).
            - CURRENT_APPOINTMENT: Thông tin về lịch hẹn hiện tại mà bác sĩ đang khám (triệu chứng ban đầu, thời gian).
            - RECENT_VISITS: Danh sách tóm tắt các lần khám gần đây của bệnh nhân.
            - VISIT_DETAIL: Chi tiết của một lần khám cụ thể (yêu cầu đi kèm emrCode hoặc vị trí cụ thể).
            - PRESCRIPTIONS: Đơn thuốc đã kê gần đây hoặc của lần khám cụ thể.
            - APPOINTMENT_HISTORY: Lịch sử đặt lịch khám của bệnh nhân (tất cả các trạng thái).

            Quy tắc bảo mật & lập kế hoạch:
            - Không dùng, không trả patientCode, appointmentId, doctorId hoặc email bệnh nhân/bác sĩ.
            - Nếu bác sĩ hỏi "bệnh nhân này", "tóm tắt trước khi khám", "thông tin quan trọng" hoặc cần xem tổng quan để chuẩn bị khám, hãy chọn: PATIENT_PROFILE, CURRENT_APPOINTMENT, RECENT_VISITS, PRESCRIPTIONS.
            - Nếu câu hỏi chung không cần dữ liệu cụ thể của bệnh nhân (ví dụ: tư vấn lý thuyết bệnh học), trả actions rỗng.
            - Nếu cần xem chi tiết lần khám cụ thể nhưng thiếu mã EMR hoặc ngữ cảnh chưa rõ, đặt clarificationQuestion bằng câu hỏi tiếng Việt ngắn gọn.
            - Dùng `sortAsc`: true để sắp xếp từ cũ nhất trước, false hoặc null để sắp xếp từ mới nhất (mặc định).
            - Dùng `offset`: số nguyên 0-indexed để bỏ qua N bản ghi.
            
            JSON schema mong muốn:
            {"actions":[{"type":"PATIENT_PROFILE|CURRENT_APPOINTMENT|RECENT_VISITS|VISIT_DETAIL|PRESCRIPTIONS|APPOINTMENT_HISTORY","emrCode":"EMR... hoặc null","keyword":"từ khóa hoặc null","limit":số hoặc null,"sortAsc":boolean hoặc null,"offset":số hoặc null}],"clarificationQuestion":null hoặc "..."}
            """;

    private final AiGatewayClient aiGatewayClient;
    private final ObjectMapper objectMapper;

    @Override
    public DoctorAiRoutePlan plan(String message, List<AiChatMessageRequest> history) {
        try {
            String response = aiGatewayClient.completePlannerChat(buildPlannerMessages(message, history));
            return parsePlan(response);
        } catch (Exception ex) {
            log.warn("Doctor AI route planner failed: {}", ex.getMessage());
            throw new IllegalStateException("Doctor AI route planner failed", ex);
        }
    }

    private List<Map<String, Object>> buildPlannerMessages(String message, List<AiChatMessageRequest> history) {
        StringBuilder userContent = new StringBuilder();
        List<AiChatMessageRequest> safeHistory = history == null ? List.of() : history;
        int start = Math.max(0, safeHistory.size() - MAX_HISTORY_MESSAGES);
        if (start < safeHistory.size()) {
            userContent.append("Lịch sử gần đây:\n");
            for (AiChatMessageRequest item : safeHistory.subList(start, safeHistory.size())) {
                String role = normalizeRole(item.getRole());
                String content = truncate(item.getContent());
                if (role != null && StringUtils.hasText(content)) {
                    userContent.append(role).append(": ").append(content).append('\n');
                }
            }
        }
        userContent.append("Tin nhắn hiện tại:\n").append(truncate(message));

        return List.of(
                Map.of("role", "system", "content", PLANNER_PROMPT),
                Map.of("role", "user", "content", userContent.toString())
        );
    }

    private DoctorAiRoutePlan parsePlan(String rawResponse) throws Exception {
        if (!StringUtils.hasText(rawResponse)) {
            return DoctorAiRoutePlan.empty();
        }

        JsonNode root = objectMapper.readTree(extractJson(rawResponse));
        List<DoctorAiContextAction> actions = new ArrayList<>();
        Set<String> seen = new LinkedHashSet<>();
        JsonNode actionNodes = root.path("actions");
        if (actionNodes.isArray()) {
            for (JsonNode node : actionNodes) {
                if (actions.size() >= MAX_ACTIONS) {
                    break;
                }
                DoctorAiContextAction action = parseAction(node);
                if (action == null || action.getType() == null) {
                    continue;
                }
                String key = action.getType() + ":" + safe(action.getEmrCode()) + ":" + safe(action.getKeyword());
                if (seen.add(key)) {
                    actions.add(action);
                }
            }
        }

        String clarificationQuestion = textOrNull(root.path("clarificationQuestion"));
        return DoctorAiRoutePlan.builder()
                .actions(actions)
                .clarificationQuestion(clarificationQuestion)
                .build();
    }

    private DoctorAiContextAction parseAction(JsonNode node) {
        DoctorAiContextActionType type = parseType(textOrNull(node.path("type")));
        if (type == null) {
            return null;
        }
        return DoctorAiContextAction.builder()
                .type(type)
                .emrCode(textOrNull(node.path("emrCode")))
                .keyword(textOrNull(node.path("keyword")))
                .limit(node.path("limit").isInt() ? node.path("limit").asInt() : null)
                .sortAsc(node.has("sortAsc") && node.path("sortAsc").isBoolean() ? node.path("sortAsc").asBoolean() : null)
                .offset(node.has("offset") && node.path("offset").isInt() ? node.path("offset").asInt() : null)
                .build();
    }

    private DoctorAiContextActionType parseType(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return DoctorAiContextActionType.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private String extractJson(String value) {
        String trimmed = value.trim();
        int start = trimmed.indexOf('{');
        int end = trimmed.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return trimmed.substring(start, end + 1);
        }
        return trimmed;
    }

    private String textOrNull(JsonNode node) {
        if (node == null || node.isMissingNode() || node.isNull() || !node.isTextual()) {
            return null;
        }
        String text = node.asText().trim();
        return StringUtils.hasText(text) ? text : null;
    }

    private String normalizeRole(String role) {
        if (!StringUtils.hasText(role)) {
            return null;
        }
        String normalized = role.trim().toLowerCase(Locale.ROOT);
        return "user".equals(normalized) || "assistant".equals(normalized) ? normalized : null;
    }

    private String truncate(String value) {
        if (!StringUtils.hasText(value)) {
            return "";
        }
        String trimmed = value.trim();
        return trimmed.length() <= MAX_TEXT_LENGTH ? trimmed : trimmed.substring(0, MAX_TEXT_LENGTH) + "...";
    }

    private String safe(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }
}
