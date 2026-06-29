package com.medicore.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebSocketMessage {
    private String eventType;      // QUEUE_UPDATED, PATIENT_CALLED
    private Object data;           // Dữ liệu linh hoạt (ID, status...)
    private String message;        // Nội dung hiển thị: "Mời bệnh nhân..."
    private Long timestamp;        // Unix timestamp
}