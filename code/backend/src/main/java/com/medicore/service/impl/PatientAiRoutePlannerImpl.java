package com.medicore.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medicore.dto.ai.PatientAiContextAction;
import com.medicore.dto.ai.PatientAiContextActionType;
import com.medicore.dto.ai.PatientAiRoutePlan;
import com.medicore.dto.request.AiChatMessageRequest;
import com.medicore.service.AiGatewayClient;
import com.medicore.service.PatientAiRoutePlanner;
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
public class PatientAiRoutePlannerImpl implements PatientAiRoutePlanner {

    private static final int MAX_ACTIONS = 3;
    private static final int MAX_HISTORY_MESSAGES = 4;
    private static final int MAX_TEXT_LENGTH = 600;

    private static final String PLANNER_PROMPT = """
            Bạn là bộ định tuyến context cho trợ lý sức khỏe MediCore. Nhiệm vụ duy nhất: chọn dữ liệu hệ thống cần lấy trước khi AI trả lời.
            Không trả lời tư vấn y tế. Chỉ trả JSON hợp lệ, không markdown, không giải thích.

            Action được phép:
            - RECENT_RECORDS: khi người dùng hỏi hồ sơ/lần khám/chẩn đoán/xét nghiệm/lời dặn/tái khám gần đây hoặc theo thứ tự vị trí.
            - RECORD_DETAIL: khi người dùng hỏi chi tiết một hồ sơ cụ thể, có mã EMR, hoặc vị trí lần khám cụ thể.
            - PRESCRIPTIONS: khi người dùng hỏi đơn thuốc/thuốc đã kê/liều dùng trong hồ sơ hoặc gần đây.
            - MEDICINE_SEARCH: khi người dùng hỏi thông tin thuốc nói chung, tác dụng, nhóm thuốc, hoặc tên thuốc.
            - DOCTORS_SEEN: khi người dùng hỏi bác sĩ/chuyên khoa đã từng khám trực tiếp trước đó.
            - DOCTORS_SEARCH: khi người dùng muốn tìm bác sĩ mới, gợi ý bác sĩ khám bệnh, tìm chuyên khoa thích hợp, hoặc hỏi nên đặt lịch với bác sĩ nào cho triệu chứng/bệnh cụ thể (ví dụ: hen suyễn, tim mạch, đau đầu). Đặt `keyword` là tên chuyên khoa, tên bệnh hoặc triệu chứng có liên quan (ví dụ: "hen", "tim mạch", "gout").

            Quy tắc bảo mật:
            - Không dùng, không trả patientCode, patientId, email hoặc định danh bệnh nhân.
            - Chỉ chọn loại dữ liệu; backend tự xác thực bệnh nhân đang đăng nhập.
            - Nếu câu hỏi y khoa chung không cần dữ liệu cá nhân, trả actions rỗng.
            - Nếu cần hồ sơ cụ thể nhưng không có mã EMR hoặc ngữ cảnh đủ rõ, đặt clarificationQuestion bằng câu hỏi tiếng Việt ngắn gọn.
            - actions tối đa 3 phần tử.

            Xử lý câu hỏi kiểu thứ tự/vị trí (RECENT_RECORDS hoặc RECORD_DETAIL):
            - Dùng `sortAsc`: true để sắp xếp từ cũ nhất trước (ví dụ: "lần khám đầu tiên/thứ 1/buổi khám 1"), false hoặc null để sắp xếp từ mới nhất (mặc định).
            - Dùng `offset`: số nguyên 0-indexed để bỏ qua N hồ sơ. 
              Ví dụ: 
              * "lần khám thứ 1" hoặc "lần khám đầu tiên": sortAsc=true, offset=0, limit=1
              * "lần khám thứ 3" hoặc "buổi khám 3": sortAsc=true, offset=2, limit=1
              * "lần khám kế trước lần gần nhất" hoặc "lần khám thứ 2 tính từ gần nhất": sortAsc=false, offset=1, limit=1
            
            JSON schema mong muốn:
            {"actions":[{"type":"RECENT_RECORDS|RECORD_DETAIL|PRESCRIPTIONS|MEDICINE_SEARCH|DOCTORS_SEEN|DOCTORS_SEARCH","emrCode":"EMR... hoặc null","keyword":"từ khóa thuốc/bệnh/chuyên khoa hoặc null","limit":số hoặc null,"sortAsc":boolean hoặc null,"offset":số hoặc null}],"clarificationQuestion":null hoặc "..."}
            """;

    private final AiGatewayClient aiGatewayClient;
    private final ObjectMapper objectMapper;

    @Override
    public PatientAiRoutePlan plan(String message, List<AiChatMessageRequest> history) {
        try {
            String response = aiGatewayClient.completePlannerChat(buildPlannerMessages(message, history));
            return parsePlan(response);
        } catch (Exception ex) {
            log.warn("AI route planner failed: {}", ex.getMessage());
            throw new IllegalStateException("AI route planner failed", ex);
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

    private PatientAiRoutePlan parsePlan(String rawResponse) throws Exception {
        if (!StringUtils.hasText(rawResponse)) {
            return PatientAiRoutePlan.empty();
        }

        JsonNode root = objectMapper.readTree(extractJson(rawResponse));
        List<PatientAiContextAction> actions = new ArrayList<>();
        Set<String> seen = new LinkedHashSet<>();
        JsonNode actionNodes = root.path("actions");
        if (actionNodes.isArray()) {
            for (JsonNode node : actionNodes) {
                if (actions.size() >= MAX_ACTIONS) {
                    break;
                }
                PatientAiContextAction action = parseAction(node);
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
        return PatientAiRoutePlan.builder()
                .actions(actions)
                .clarificationQuestion(clarificationQuestion)
                .build();
    }

    private PatientAiContextAction parseAction(JsonNode node) {
        PatientAiContextActionType type = parseType(textOrNull(node.path("type")));
        if (type == null) {
            return null;
        }
        return PatientAiContextAction.builder()
                .type(type)
                .emrCode(textOrNull(node.path("emrCode")))
                .keyword(textOrNull(node.path("keyword")))
                .limit(node.path("limit").isInt() ? node.path("limit").asInt() : null)
                .sortAsc(node.has("sortAsc") && node.path("sortAsc").isBoolean() ? node.path("sortAsc").asBoolean() : null)
                .offset(node.has("offset") && node.path("offset").isInt() ? node.path("offset").asInt() : null)
                .build();
    }

    private PatientAiContextActionType parseType(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return PatientAiContextActionType.valueOf(value.trim().toUpperCase(Locale.ROOT));
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
