package com.medicore.service;

import com.medicore.dto.request.AiChatMessageRequest;
import com.medicore.dto.request.AiChatRequest;
import com.medicore.dto.response.AiChatResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.function.Consumer;

public interface AiChatService {
    AiChatResponse chat(String email, AiChatRequest request);

    AiChatResponse chatWithImages(String email, String message, List<AiChatMessageRequest> history, List<MultipartFile> images);

    AiChatResponse streamChat(String email, AiChatRequest request, Consumer<String> onChunk);
}
