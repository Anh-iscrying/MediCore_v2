package com.medicore.repository;

import com.medicore.common.constants.EmailOtpPurpose;
import com.medicore.entity.user.EmailOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmailOtpRepository extends JpaRepository<EmailOtp, Integer> {
    Optional<EmailOtp> findFirstByEmailAndPurposeAndUsedAtIsNullOrderByCreatedAtDesc(String email, EmailOtpPurpose purpose);

    Optional<EmailOtp> findFirstByEmailAndPurposeAndVerificationTokenHashAndUsedAtIsNullOrderByCreatedAtDesc(
            String email,
            EmailOtpPurpose purpose,
            String verificationTokenHash
    );

    List<EmailOtp> findByEmailAndPurposeAndUsedAtIsNull(String email, EmailOtpPurpose purpose);
}
