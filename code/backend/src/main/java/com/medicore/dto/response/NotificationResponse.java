package com.medicore.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Integer id;
    private String type;
    private String title;
    private String message;
    private Map<String, Object> data;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
    private Integer appointmentId;
    private long unreadCount;
}
