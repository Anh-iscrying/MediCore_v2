package com.medicore.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OtpVerifyResponse {
    private String verificationToken;
    private String resetToken;
    private LocalDateTime expiresAt;
}
