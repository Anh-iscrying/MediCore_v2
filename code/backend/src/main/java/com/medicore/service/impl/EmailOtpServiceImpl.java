package com.medicore.service.impl;

import com.medicore.common.constants.EmailOtpPurpose;
import com.medicore.common.constants.ErrorCodes;
import com.medicore.common.constants.UserRole;
import com.medicore.common.exception.CustomBusinessException;
import com.medicore.dto.response.OtpVerifyResponse;
import com.medicore.entity.user.AuthCredentials;
import com.medicore.entity.user.EmailOtp;
import com.medicore.repository.AuthCredentialsRepository;
import com.medicore.repository.EmailOtpRepository;
import com.medicore.service.EmailOtpService;
import com.medicore.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmailOtpServiceImpl implements EmailOtpService {

    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int RESEND_COOLDOWN_SECONDS = 60;
    private static final int MAX_ATTEMPTS = 5;

    private final EmailOtpRepository emailOtpRepository;
    private final AuthCredentialsRepository authCredentialsRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.otp.secret:${jwt.secret}}")
    private String otpSecret;

    @Override
    @Transactional
    public void requestSignupOtp(String email) {
        String normalizedEmail = normalizeEmail(email);
        if (authCredentialsRepository.existsByEmail(normalizedEmail)) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Email đã được sử dụng");
        }

        issueOtp(normalizedEmail, EmailOtpPurpose.SIGNUP_VERIFY, "Mã OTP đăng ký MediCore");
    }

    @Override
    @Transactional
    public OtpVerifyResponse verifySignupOtp(String email, String otp) {
        EmailOtp emailOtp = verifyOtp(normalizeEmail(email), otp, EmailOtpPurpose.SIGNUP_VERIFY);
        String verificationToken = generateVerificationToken();
        emailOtp.setVerificationTokenHash(hashValue(verificationToken));
        emailOtp.setVerifiedAt(LocalDateTime.now());
        emailOtpRepository.save(emailOtp);

        return OtpVerifyResponse.builder()
                .verificationToken(verificationToken)
                .expiresAt(emailOtp.getExpiresAt())
                .build();
    }

    @Override
    @Transactional
    public void consumeSignupVerification(String email, String verificationToken) {
        EmailOtp emailOtp = findUsableVerifiedOtp(normalizeEmail(email), EmailOtpPurpose.SIGNUP_VERIFY, verificationToken);
        emailOtp.setUsedAt(LocalDateTime.now());
        emailOtpRepository.save(emailOtp);
    }

    @Override
    @Transactional
    public void requestPasswordResetOtp(String email) {
        String normalizedEmail = normalizeEmail(email);
        authCredentialsRepository.findByEmail(normalizedEmail)
                .filter(credentials -> credentials.getRole() == UserRole.PATIENT)
                .ifPresent(credentials -> issueOtp(normalizedEmail, EmailOtpPurpose.PASSWORD_RESET, "Mã OTP đặt lại mật khẩu MediCore"));
    }

    @Override
    @Transactional
    public OtpVerifyResponse verifyPasswordResetOtp(String email, String otp) {
        EmailOtp emailOtp = verifyOtp(normalizeEmail(email), otp, EmailOtpPurpose.PASSWORD_RESET);
        String resetToken = generateVerificationToken();
        emailOtp.setVerificationTokenHash(hashValue(resetToken));
        emailOtp.setVerifiedAt(LocalDateTime.now());
        emailOtpRepository.save(emailOtp);

        return OtpVerifyResponse.builder()
                .resetToken(resetToken)
                .expiresAt(emailOtp.getExpiresAt())
                .build();
    }

    @Override
    @Transactional
    public void resetPatientPassword(String email, String resetToken, String newPassword) {
        String normalizedEmail = normalizeEmail(email);
        EmailOtp emailOtp = findUsableVerifiedOtp(normalizedEmail, EmailOtpPurpose.PASSWORD_RESET, resetToken);
        AuthCredentials credentials = authCredentialsRepository.findByEmail(normalizedEmail)
                .filter(authCredentials -> authCredentials.getRole() == UserRole.PATIENT)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Mã xác thực không hợp lệ hoặc đã hết hạn"));

        credentials.setPasswordHash(passwordEncoder.encode(newPassword));
        authCredentialsRepository.save(credentials);

        emailOtp.setUsedAt(LocalDateTime.now());
        emailOtpRepository.save(emailOtp);
    }

    private void issueOtp(String email, EmailOtpPurpose purpose, String subject) {
        LocalDateTime now = LocalDateTime.now();
        List<EmailOtp> activeOtps = emailOtpRepository.findByEmailAndPurposeAndUsedAtIsNull(email, purpose);
        activeOtps.stream()
                .filter(activeOtp -> activeOtp.getLastSentAt().isAfter(now.minusSeconds(RESEND_COOLDOWN_SECONDS)))
                .findFirst()
                .ifPresent(activeOtp -> {
                    throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Vui lòng chờ 60 giây trước khi gửi lại mã OTP");
                });
        activeOtps.forEach(activeOtp -> activeOtp.setUsedAt(now));
        emailOtpRepository.saveAll(activeOtps);

        String otp = String.format("%06d", secureRandom.nextInt(1_000_000));
        EmailOtp emailOtp = EmailOtp.builder()
                .email(email)
                .purpose(purpose)
                .otpHash(passwordEncoder.encode(otp))
                .expiresAt(now.plusMinutes(OTP_EXPIRY_MINUTES))
                .lastSentAt(now)
                .build();
        emailOtpRepository.save(emailOtp);

        emailService.sendOtpEmail(email, subject, otp, OTP_EXPIRY_MINUTES);
    }

    private EmailOtp verifyOtp(String email, String otp, EmailOtpPurpose purpose) {
        EmailOtp emailOtp = emailOtpRepository.findFirstByEmailAndPurposeAndUsedAtIsNullOrderByCreatedAtDesc(email, purpose)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Mã OTP không đúng hoặc đã hết hạn"));

        LocalDateTime now = LocalDateTime.now();
        if (emailOtp.getExpiresAt().isBefore(now) || emailOtp.getAttemptCount() >= MAX_ATTEMPTS) {
            emailOtp.setUsedAt(now);
            emailOtpRepository.save(emailOtp);
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Mã OTP không đúng hoặc đã hết hạn");
        }

        if (!passwordEncoder.matches(otp, emailOtp.getOtpHash())) {
            emailOtp.setAttemptCount(emailOtp.getAttemptCount() + 1);
            emailOtpRepository.save(emailOtp);
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Mã OTP không đúng hoặc đã hết hạn");
        }

        return emailOtp;
    }

    private EmailOtp findUsableVerifiedOtp(String email, EmailOtpPurpose purpose, String token) {
        EmailOtp emailOtp = emailOtpRepository.findFirstByEmailAndPurposeAndUsedAtIsNullOrderByCreatedAtDesc(email, purpose)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Mã xác thực không hợp lệ hoặc đã hết hạn"));

        LocalDateTime now = LocalDateTime.now();
        if (emailOtp.getVerifiedAt() == null || emailOtp.getVerificationTokenHash() == null || emailOtp.getExpiresAt().isBefore(now)) {
            emailOtp.setUsedAt(now);
            emailOtpRepository.save(emailOtp);
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Mã xác thực không hợp lệ hoặc đã hết hạn");
        }

        if (!hashValue(token).equals(emailOtp.getVerificationTokenHash())) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Mã xác thực không hợp lệ hoặc đã hết hạn");
        }

        return emailOtp;
    }

    private String generateVerificationToken() {
        return UUID.randomUUID() + "." + UUID.randomUUID();
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private String hashValue(String value) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA256");
            hmac.init(new SecretKeySpec(otpSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hmac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Không thể mã hóa mã xác thực", e);
        }
    }
}
