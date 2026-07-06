package com.medicore.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medicore.common.constants.ErrorCodes;
import com.medicore.common.exception.CustomBusinessException;
import com.medicore.config.AiProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiGatewayClient {

    private final AiProperties aiProperties;
    private final ObjectMapper objectMapper;

    public String completeChat(List<Map<String, Object>> messages) {
        return completeChat(messages, aiProperties.getTemperature(), null, false);
    }

    public String completePlannerChat(List<Map<String, Object>> messages) {
        return completeChat(
                messages,
                aiProperties.getPlannerTemperature(),
                aiProperties.getPlannerMaxTokens(),
                aiProperties.isJsonResponseFormatEnabled()
        );
    }

    private String completeChat(List<Map<String, Object>> messages, double temperature, Integer maxTokens, boolean jsonResponseFormat) {
        if (!StringUtils.hasText(aiProperties.getBaseUrl()) || !StringUtils.hasText(aiProperties.getApiKey())) {
            throw new CustomBusinessException(ErrorCodes.INTERNAL_SERVER_ERROR, "Cấu hình AI chưa sẵn sàng");
        }

        try {
            String baseUrl = aiProperties.getBaseUrl().replaceAll("/+$", "");
            Map<String, Object> body = new java.util.LinkedHashMap<>();
            body.put("model", aiProperties.getModel());
            body.put("messages", messages);
            body.put("temperature", temperature);
            if (maxTokens != null && maxTokens > 0) {
                body.put("max_tokens", maxTokens);
            }
            if (jsonResponseFormat) {
                body.put("response_format", Map.of("type", "json_object"));
            }
            String requestBody = objectMapper.writeValueAsString(body);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + "/chat/completions"))
                    .timeout(Duration.ofMillis(aiProperties.getTimeoutMs()))
                    .header("Authorization", "Bearer " + aiProperties.getApiKey())
                    .header("Content-Type", "application/json")
                    .header("User-Agent", "MediCore-Backend/1.0")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofMillis(aiProperties.getTimeoutMs()))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                log.warn("AI gateway returned status {}", response.statusCode());
                if (response.statusCode() == 429) {
                    throw new CustomBusinessException(ErrorCodes.INTERNAL_SERVER_ERROR, "AI đang bận. Vui lòng thử lại sau.");
                }
                if (response.statusCode() == 400) {
                    throw new CustomBusinessException(ErrorCodes.INTERNAL_SERVER_ERROR, "AI chưa hỗ trợ nội dung vừa gửi. Vui lòng thử ảnh khác hoặc gửi câu hỏi dạng chữ.");
                }
                throw new CustomBusinessException(ErrorCodes.INTERNAL_SERVER_ERROR, "Không thể kết nối dịch vụ AI");
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode content = root.path("choices").path(0).path("message").path("content");
            if (!content.isTextual() || !StringUtils.hasText(content.asText())) {
                throw new CustomBusinessException(ErrorCodes.INTERNAL_SERVER_ERROR, "AI chưa trả về nội dung hợp lệ");
            }

            return content.asText().trim();
        } catch (CustomBusinessException ex) {
            throw ex;
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new CustomBusinessException(ErrorCodes.INTERNAL_SERVER_ERROR, "Yêu cầu AI bị gián đoạn");
        } catch (Exception ex) {
            log.error("AI gateway request failed: {}", ex.getMessage(), ex);
            throw new CustomBusinessException(ErrorCodes.INTERNAL_SERVER_ERROR, "Không thể kết nối dịch vụ AI");
        }
    }
}
