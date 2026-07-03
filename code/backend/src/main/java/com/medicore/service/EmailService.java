package com.medicore.service;

public interface EmailService {
    void sendOtpEmail(String to, String subject, String code, int expiryMinutes);
}
