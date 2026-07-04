package com.medicore.service;

public interface EmailService {
    void sendOtpEmail(String to, String subject, String code, int expiryMinutes);
    void sendHtmlEmail(String to, String subject, String htmlContent);
}
