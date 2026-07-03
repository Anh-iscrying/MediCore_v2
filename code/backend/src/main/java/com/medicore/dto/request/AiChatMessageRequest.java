package com.medicore.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiChatMessageRequest {
    @NotBlank(message = "Vai trò tin nhắn không được để trống")
    @Pattern(regexp = "^(user|assistant)$", message = "Vai trò tin nhắn chỉ được là user hoặc assistant")
    private String role;

    @NotBlank(message = "Nội dung tin nhắn không được để trống")
    @Size(max = 4000, message = "Nội dung tin nhắn không được vượt quá 4000 ký tự")
    private String content;
}
