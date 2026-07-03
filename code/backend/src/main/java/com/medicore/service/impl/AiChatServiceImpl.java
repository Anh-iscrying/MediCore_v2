package com.medicore.service.impl;

import com.medicore.common.constants.ErrorCodes;
import com.medicore.common.exception.CustomBusinessException;
import com.medicore.config.AiProperties;
import com.medicore.dto.request.AiChatMessageRequest;
import com.medicore.dto.request.AiChatRequest;
import com.medicore.dto.response.AiChatResponse;
import com.medicore.entity.ai.AiConsultationLog;
import com.medicore.entity.user.AuthCredentials;
import com.medicore.entity.user.Patient;
import com.medicore.repository.AiConsultationLogRepository;
import com.medicore.repository.AuthCredentialsRepository;
import com.medicore.service.AiChatService;
import com.medicore.service.AiGatewayClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiChatServiceImpl implements AiChatService {

    private static final String IMAGE_ONLY_FALLBACK_MESSAGE = "Hãy mô tả ảnh này và tư vấn ở mức tham khảo y tế an toàn.";

    private static final String SYSTEM_PROMPT = """
            Bạn là trợ lý sức khỏe AI của MediCore, trả lời bằng tiếng Việt, ngắn gọn và dễ hiểu.
            Vai trò của bạn là hỗ trợ tham khảo thông tin sức khỏe, chuẩn bị trước buổi khám và hướng dẫn khi nào nên đi khám.
            Không thay thế bác sĩ, không chẩn đoán chắc chắn, không kê đơn thuốc, không thay đổi liều thuốc.
            Không được bịa dữ liệu cá nhân như đơn thuốc, lịch hẹn, huyết áp, nhịp tim, kết quả xét nghiệm nếu hệ thống chưa cung cấp.
            Khi người dùng gửi ảnh, hãy mô tả những gì có thể quan sát được và giải thích ở mức tham khảo. Không kết luận chẩn đoán chỉ dựa trên ảnh.
            Nếu ảnh không đủ rõ hoặc thiếu ngữ cảnh, hãy hỏi thêm triệu chứng, thời gian xuất hiện, mức độ đau/ngứa/sốt, bệnh nền, thuốc đang dùng và diễn tiến.
            Nếu người dùng có triệu chứng nguy hiểm như đau ngực, khó thở, yếu liệt, ngất, co giật, chảy máu nhiều, sốt cao kéo dài, đau đầu dữ dội đột ngột hoặc dấu hiệu cấp cứu, hãy khuyên họ gọi cấp cứu hoặc đến cơ sở y tế ngay.
            Khi thiếu thông tin, hãy hỏi thêm triệu chứng, thời gian xuất hiện, mức độ, tuổi, bệnh nền, thuốc đang dùng và dấu hiệu cảnh báo.
            """;

    private final AuthCredentialsRepository authCredentialsRepository;
    private final AiConsultationLogRepository aiConsultationLogRepository;
    private final AiGatewayClient aiGatewayClient;
    private final AiProperties aiProperties;

    @Override
    @Transactional
    public AiChatResponse chat(String email, AiChatRequest request) {
        String message = cleanContent(request.getMessage());
        List<AiChatMessageRequest> history = request.getHistory() == null ? List.of() : request.getHistory();
        return processChat(email, message, history, List.of());
    }

    @Override
    @Transactional
    public AiChatResponse chatWithImages(String email, String message, List<AiChatMessageRequest> history, List<MultipartFile> images) {
        return processChat(email, cleanContent(message), history == null ? List.of() : history, images == null ? List.of() : images);
    }

    private AiChatResponse processChat(String email, String message, List<AiChatMessageRequest> history, List<MultipartFile> images) {
        AuthCredentials credentials = authCredentialsRepository.findByEmail(email)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.UNAUTHORIZED));
        Patient patient = credentials.getPatient();
        if (patient == null) {
            throw new CustomBusinessException(ErrorCodes.FORBIDDEN, "Tài khoản này không phải bệnh nhân");
        }

        List<ImagePayload> imagePayloads = validateAndEncodeImages(images);
        if (!StringUtils.hasText(message) && imagePayloads.isEmpty()) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Nội dung cần tư vấn hoặc ảnh không được để trống");
        }
        if (message.length() > aiProperties.getMaxInputChars()) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Nội dung cần tư vấn quá dài");
        }

        String effectiveMessage = StringUtils.hasText(message) ? message : IMAGE_ONLY_FALLBACK_MESSAGE;
        List<Map<String, Object>> gatewayMessages = buildMessages(history, effectiveMessage, imagePayloads);
        String reply = aiGatewayClient.completeChat(gatewayMessages);

        OffsetDateTime now = OffsetDateTime.now();
        AiConsultationLog log = AiConsultationLog.builder()
                .patient(patient)
                .symptomInput(buildLogInput(message, imagePayloads.size()))
                .aiReasoning(reply)
                .createdAt(now)
                .build();
        log = aiConsultationLogRepository.save(log);

        return AiChatResponse.builder()
                .reply(reply)
                .consultationLogId(log.getId())
                .createdAt(log.getCreatedAt())
                .build();
    }

    private List<ImagePayload> validateAndEncodeImages(List<MultipartFile> images) {
        if (images == null || images.isEmpty()) {
            return List.of();
        }
        if (images.size() > aiProperties.getMaxImagesPerMessage()) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Mỗi tin nhắn chỉ được đính kèm tối đa " + aiProperties.getMaxImagesPerMessage() + " ảnh");
        }

        List<String> allowedTypes = aiProperties.getAllowedImageMimeTypes() == null
                ? List.of()
                : aiProperties.getAllowedImageMimeTypes().stream()
                .filter(StringUtils::hasText)
                .map(value -> value.trim().toLowerCase(Locale.ROOT))
                .toList();

        List<ImagePayload> payloads = new ArrayList<>();
        for (MultipartFile image : images) {
            if (image == null || image.isEmpty()) {
                throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Ảnh đính kèm không được để trống");
            }
            if (image.getSize() > aiProperties.getMaxImageBytes()) {
                throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Ảnh đính kèm không được vượt quá 5MB");
            }

            String contentType = image.getContentType();
            String normalizedType = contentType == null ? "" : contentType.trim().toLowerCase(Locale.ROOT);
            if (!allowedTypes.contains(normalizedType)) {
                throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Chỉ hỗ trợ ảnh PNG, JPEG hoặc WebP");
            }

            try {
                String base64 = Base64.getEncoder().encodeToString(image.getBytes());
                payloads.add(new ImagePayload("data:" + normalizedType + ";base64," + base64));
            } catch (Exception ex) {
                throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Không thể đọc ảnh đính kèm");
            }
        }
        return payloads;
    }

    private List<Map<String, Object>> buildMessages(List<AiChatMessageRequest> history, String currentMessage, List<ImagePayload> images) {
        List<Map<String, Object>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", SYSTEM_PROMPT));

        List<AiChatMessageRequest> safeHistory = history == null ? List.of() : history;
        int start = Math.max(0, safeHistory.size() - aiProperties.getMaxHistoryMessages());
        for (AiChatMessageRequest item : safeHistory.subList(start, safeHistory.size())) {
            String role = normalizeRole(item.getRole());
            String content = cleanContent(item.getContent());
            if (role == null || !StringUtils.hasText(content)) {
                continue;
            }
            messages.add(Map.of("role", role, "content", content));
        }

        if (images == null || images.isEmpty()) {
            messages.add(Map.of("role", "user", "content", currentMessage));
            return messages;
        }

        List<Map<String, Object>> content = new ArrayList<>();
        content.add(Map.of("type", "text", "text", currentMessage));
        for (ImagePayload image : images) {
            content.add(Map.of(
                    "type", "image_url",
                    "image_url", Map.of("url", image.dataUrl())
            ));
        }
        messages.add(Map.of("role", "user", "content", content));
        return messages;
    }

    private String buildLogInput(String message, int imageCount) {
        String text = StringUtils.hasText(message) ? message : "(Không có nội dung chữ)";
        if (imageCount <= 0) {
            return text;
        }
        return text + "\n[Đính kèm " + imageCount + " ảnh]";
    }

    private String normalizeRole(String role) {
        if (!StringUtils.hasText(role)) {
            return null;
        }
        String normalized = role.trim().toLowerCase(Locale.ROOT);
        if ("user".equals(normalized) || "assistant".equals(normalized)) {
            return normalized;
        }
        return null;
    }

    private String cleanContent(String value) {
        if (value == null) {
            return "";
        }
        String cleaned = value.trim();
        if (cleaned.length() > aiProperties.getMaxInputChars()) {
            return cleaned.substring(0, aiProperties.getMaxInputChars());
        }
        return cleaned;
    }

    private record ImagePayload(String dataUrl) {
    }
}
