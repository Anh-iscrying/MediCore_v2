package com.medicore.service;

import com.medicore.dto.response.WebSocketMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    // Gửi cho toàn bộ phòng khám (Hàng chờ chung)
    public void notifyQueueUpdate(Object data) {
        WebSocketMessage message = WebSocketMessage.builder()
                .eventType("QUEUE_UPDATED")
                .data(data)
                .timestamp(new Date().getTime())
                .build();
        messagingTemplate.convertAndSend("/topic/queue", message);
    }

    // Gửi đích danh cho 1 bệnh nhân (PATIENT_CALLED)
    public void notifyPatient(String patientEmail, String content) {
        notifyPatient(patientEmail, "PATIENT_CALLED", content, null);
    }

    public void notifyPatient(String patientEmail, String eventType, String content, Object data) {
        WebSocketMessage message = WebSocketMessage.builder()
                .eventType(eventType)
                .message(content)
                .data(data)
                .timestamp(new Date().getTime())
                .build();
        // Spring sẽ tự tìm kết nối của User có Email tương ứng để gửi vào /user/queue/notifications
        messagingTemplate.convertAndSendToUser(patientEmail, "/queue/notifications", message);
    }
}