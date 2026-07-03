package com.medicore.service.impl;

import com.medicore.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:${spring.mail.username:}}")
    private String mailFrom;

    @Override
    public void sendOtpEmail(String to, String subject, String code, int expiryMinutes) {
        SimpleMailMessage message = new SimpleMailMessage();
        if (mailFrom != null && !mailFrom.isBlank()) {
            message.setFrom(mailFrom);
        }
        message.setTo(to);
        message.setSubject(subject);
        message.setText("Mã OTP MediCore của bạn là: " + code + "\n\nMã này có hiệu lực trong " + expiryMinutes + " phút. Không chia sẻ mã này cho bất kỳ ai.");
        mailSender.send(message);
    }
}
