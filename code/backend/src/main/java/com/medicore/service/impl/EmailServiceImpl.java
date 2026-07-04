package com.medicore.service.impl;

import com.medicore.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:${spring.mail.username:}}")
    private String mailFrom;

    @Override
    @Async
    public void sendOtpEmail(String to, String subject, String code, int expiryMinutes) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if (mailFrom != null && !mailFrom.isBlank()) {
                message.setFrom(mailFrom);
            }
            message.setTo(to);
            message.setSubject(subject);
            message.setText("Mã OTP MediCore của bạn là: " + code + "\n\nMã này có hiệu lực trong " + expiryMinutes + " phút. Không chia sẻ mã này cho bất kỳ ai.");
            mailSender.send(message);
            log.info("Sent OTP email to {}", to);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}", to, e);
        }
    }

    @Override
    @Async
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            if (mailFrom != null && !mailFrom.isBlank()) {
                helper.setFrom(mailFrom);
            }
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Sent HTML email to {} with subject: {}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send HTML email to {} with subject: {}", to, subject, e);
        }
    }
}
