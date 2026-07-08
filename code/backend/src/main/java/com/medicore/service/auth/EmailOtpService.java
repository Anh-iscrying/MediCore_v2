package com.medicore.service.auth;

import com.medicore.dto.response.OtpVerifyResponse;

public interface EmailOtpService {
    void requestSignupOtp(String email);

    OtpVerifyResponse verifySignupOtp(String email, String otp);

    void consumeSignupVerification(String email, String verificationToken);

    void requestPasswordResetOtp(String email);

    OtpVerifyResponse verifyPasswordResetOtp(String email, String otp);

    void resetPatientPassword(String email, String resetToken, String newPassword);
}
