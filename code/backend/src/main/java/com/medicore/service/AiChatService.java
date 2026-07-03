package com.medicore.service;

import com.medicore.dto.request.AiChatMessageRequest;
import com.medicore.dto.request.AiChatRequest;
import com.medicore.dto.response.AiChatResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AiChatService {
    AiChatResponse chat(String email, AiChatRequest request);

    AiChatResponse chatWithImages(String email, String message, List<AiChatMessageRequest> history, List<MultipartFile> images);
}
