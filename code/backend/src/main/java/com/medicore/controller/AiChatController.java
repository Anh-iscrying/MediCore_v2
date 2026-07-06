package com.medicore.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medicore.common.base.ApiResponse;
import com.medicore.common.constants.ErrorCodes;
import com.medicore.common.exception.CustomBusinessException;
import com.medicore.dto.request.AiChatMessageRequest;
import com.medicore.dto.request.AiChatRequest;
import com.medicore.dto.response.AiChatResponse;
import com.medicore.service.AiChatService;
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

import java.util.List;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiChatController {

    private final AiChatService aiChatService;
    private final com.medicore.service.DoctorAiChatService doctorAiChatService;
    private final ObjectMapper objectMapper;

    @PostMapping(value = "/chat", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<AiChatResponse>> chat(@Valid @RequestBody AiChatRequest request) {
        AiChatResponse response = aiChatService.chat(getAuthenticatedEmail(), request);
        return ResponseEntity.ok(ApiResponse.success("Tư vấn AI thành công", response));
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
