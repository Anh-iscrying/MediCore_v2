package com.medicore.controller.ai;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medicore.common.base.ApiResponse;
import com.medicore.common.constants.ErrorCodes;
import com.medicore.common.exception.CustomBusinessException;
import com.medicore.dto.request.AiChatMessageRequest;
import com.medicore.dto.request.AiChatRequest;
import com.medicore.dto.response.AiChatResponse;
import com.medicore.service.ai.AiChatService;
import com.medicore.service.ai.DoctorAiChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiChatController {

    private final AiChatService aiChatService;
    private final DoctorAiChatService doctorAiChatService;
    private final ObjectMapper objectMapper;

    @PostMapping(value = "/chat", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<AiChatResponse>> chat(@Valid @RequestBody AiChatRequest request) {
        AiChatResponse response = aiChatService.chat(getAuthenticatedEmail(), request);
        return ResponseEntity.ok(ApiResponse.success("Tư vấn AI thành công", response));
    }

    @PostMapping(value = "/chat/stream", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<StreamingResponseBody> streamChat(@Valid @RequestBody AiChatRequest request) {
        String email = getAuthenticatedEmail();
        StreamingResponseBody body = outputStream -> {
            try {
                AiChatResponse response = aiChatService.streamChat(email, request, chunk -> {
                    if (chunk != null) {
                        Map<String, Object> chunkMap = new java.util.HashMap<>();
                        chunkMap.put("content", chunk);
                        writeSse(outputStream, "chunk", chunkMap);
                    }
                });
                Map<String, Object> doneMap = new java.util.HashMap<>();
                doneMap.put("consultationLogId", response.getConsultationLogId());
                doneMap.put("createdAt", response.getCreatedAt() != null ? response.getCreatedAt().toString() : null);
                writeSse(outputStream, "done", doneMap);
            } catch (Exception ex) {
                Map<String, Object> errorMap = new java.util.HashMap<>();
                errorMap.put("message", ex.getMessage() == null ? "AI đang bận. Vui lòng thử lại sau." : ex.getMessage());
                writeSse(outputStream, "error", errorMap);
            }
        };
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_EVENT_STREAM)
                .body(body);
    }

    @PostMapping(value = "/doctor/chat", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<AiChatResponse>> doctorChat(@Valid @RequestBody com.medicore.dto.request.DoctorAiChatRequest request) {
        AiChatResponse response = doctorAiChatService.chat(getAuthenticatedEmail(), request);
        return ResponseEntity.ok(ApiResponse.success("Bác sĩ tư vấn AI thành công", response));
    }

    @PostMapping(value = "/chat", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<AiChatResponse>> chatWithImages(
            @RequestParam(value = "message", required = false) String message,
            @RequestParam(value = "history", required = false) String history,
            @RequestParam(value = "images", required = false) List<MultipartFile> images
    ) {
        AiChatResponse response = aiChatService.chatWithImages(
                getAuthenticatedEmail(),
                message,
                parseHistory(history),
                images
        );
        return ResponseEntity.ok(ApiResponse.success("Tư vấn AI thành công", response));
    }

    private void writeSse(OutputStream outputStream, String event, Object data) {
        try {
            String payload = "event: " + event + "\n" + "data: " + objectMapper.writeValueAsString(data) + "\n\n";
            outputStream.write(payload.getBytes(StandardCharsets.UTF_8));
            outputStream.flush();
        } catch (IOException ex) {
            throw new CustomBusinessException(ErrorCodes.INTERNAL_SERVER_ERROR, "Kết nối AI stream bị gián đoạn");
        }
    }

    private String getAuthenticatedEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new CustomBusinessException(ErrorCodes.UNAUTHORIZED);
        }
        return authentication.getName();
    }

    private List<AiChatMessageRequest> parseHistory(String history) {
        if (history == null || history.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(history, new TypeReference<>() {
            });
        } catch (Exception ex) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Lịch sử hội thoại không hợp lệ");
        }
    }
}
