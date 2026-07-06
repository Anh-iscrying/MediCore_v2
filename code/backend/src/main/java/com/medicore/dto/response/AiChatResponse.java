package com.medicore.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiChatResponse {
    private String reply;
    private Integer consultationLogId;
    private OffsetDateTime createdAt;

    /** Thông tin debug hỗ trợ F12 check Action của Planner */
    private Object debugRoutePlan;
    /** Thông tin debug hỗ trợ F12 check Context của Executor */
    private Object debugContext;
}
