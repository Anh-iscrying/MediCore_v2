package com.medicore.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorAiChatRequest {
    @Size(max = 4000, message = "Nội dung cần hỏi AI không được vượt quá 4000 ký tự")
    private String message;

    @Valid
    @Size(max = 10, message = "Lịch sử hội thoại không được vượt quá 10 tin nhắn")
    private List<AiChatMessageRequest> history = new ArrayList<>();

    private Integer appointmentId;

    @Size(max = 20, message = "Mã bệnh nhân không hợp lệ")
    private String patientCode;
}
