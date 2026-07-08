package com.medicore.controller.auth;

import com.medicore.common.base.ApiResponse;
import com.medicore.common.constants.ErrorCodes;
import com.medicore.common.constants.GenderType;
import com.medicore.common.constants.UserRole;
import com.medicore.common.exception.CustomBusinessException;
import com.medicore.config.security.JwtTokenProvider;
import com.medicore.dto.request.ChangePasswordRequest;
import com.medicore.dto.request.LoginRequest;
import com.medicore.dto.request.RegisterRequest;
import com.medicore.dto.request.RequestOtpRequest;
import com.medicore.dto.request.ResetPasswordRequest;
import com.medicore.dto.request.VerifyOtpRequest;
import com.medicore.dto.response.LoginResponse;
import com.medicore.dto.response.OtpVerifyResponse;
import com.medicore.entity.user.AuthCredentials;
import com.medicore.entity.user.Patient;
import com.medicore.repository.auth.AuthCredentialsRepository;
import com.medicore.repository.user.PatientRepository;
import com.medicore.service.auth.EmailOtpService;
import com.medicore.service.system.IdGeneratorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthCredentialsRepository authCredentialsRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final IdGeneratorService idGeneratorService;
    private final EmailOtpService emailOtpService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        String email = normalizeEmail(request.getEmail());
        AuthCredentials credentials = authCredentialsRepository.findByEmail(email)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));

        if (!passwordEncoder.matches(request.getPassword(), credentials.getPasswordHash())) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST);
        }

        LoginResponse response = buildLoginResponse(credentials, createToken(credentials));

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, createAccessTokenCookie(response.getToken(), 24 * 60 * 60).toString())
                .body(ApiResponse.success("Đăng nhập thành công", response));
    }

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<ApiResponse<LoginResponse>> register(@Valid @RequestBody RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());

        // 1. Kiểm tra email tồn tại
        if (authCredentialsRepository.existsByEmail(email)) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Email này đã được sử dụng");
        }

        // 2. Xác thực OTP (Logic từ MC-09-v1)
        emailOtpService.consumeSignupVerification(email, request.getSignupVerificationToken());

        // 3. Tạo hồ sơ bệnh nhân mới
        String businessCode = idGeneratorService.generatePatientCode();

        LocalDate dob = null;
        if (request.getDob() != null) {
            dob = LocalDate.parse(request.getDob(), DateTimeFormatter.ISO_DATE);
        }

        GenderType targetGender = null;
        if (request.getGender() != null && !request.getGender().isBlank()) {
            try {
                targetGender = GenderType.valueOf(request.getGender().toUpperCase());
            } catch (IllegalArgumentException e) {
                targetGender = null;
            }
        }

        Patient patient = Patient.builder()
                .patientCode(businessCode)
                .fullName(request.getName())
                .dob(dob)
                .gender(targetGender)
                .phone(normalizePhone(request.getPhone()))
                .address(request.getAddress())
                .build();

        patient.setCreatedAt(LocalDateTime.now());
        patient.setUpdatedAt(LocalDateTime.now());

        // Lưu thông tin bệnh nhân
        patient = patientRepository.save(patient);

        // 4. Tạo tài khoản đăng nhập
        AuthCredentials credentials = AuthCredentials.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.PATIENT)
                .patient(patient)
                .build();

        authCredentialsRepository.save(credentials);

        // 5. Sinh JWT và Cookie
        String token = jwtTokenProvider.generateToken(
                credentials.getEmail(),
                UserRole.PATIENT.name(),
                patient.getId(),
                businessCode);

        LoginResponse response = LoginResponse.builder()
                .token(token)
                .role(UserRole.PATIENT.name())
                .email(credentials.getEmail())
                .name(request.getName())
                .patientId(patient.getId())
                .patientCode(businessCode)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, createAccessTokenCookie(token, 24 * 60 * 60).toString())
                .body(ApiResponse.success("Đăng ký tài khoản thành công", response));
    }

    @PostMapping("/patient/signup/request-otp")
    public ResponseEntity<ApiResponse<Void>> requestSignupOtp(@Valid @RequestBody RequestOtpRequest request) {
        emailOtpService.requestSignupOtp(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Mã OTP đã được gửi đến email của bạn", null));
    }

    @PostMapping("/patient/signup/verify-otp")
    public ResponseEntity<ApiResponse<OtpVerifyResponse>> verifySignupOtp(
            @Valid @RequestBody VerifyOtpRequest request) {
        OtpVerifyResponse response = emailOtpService.verifySignupOtp(request.getEmail(), request.getOtp());
        return ResponseEntity.ok(ApiResponse.success("Xác thực OTP thành công", response));
    }

    @PostMapping("/patient/password-reset/request-otp")
    public ResponseEntity<ApiResponse<Void>> requestPasswordResetOtp(@Valid @RequestBody RequestOtpRequest request) {
        emailOtpService.requestPasswordResetOtp(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Nếu email tồn tại, mã OTP đã được gửi", null));
    }

    @PostMapping("/patient/password-reset/verify-otp")
    public ResponseEntity<ApiResponse<OtpVerifyResponse>> verifyPasswordResetOtp(
            @Valid @RequestBody VerifyOtpRequest request) {
        OtpVerifyResponse response = emailOtpService.verifyPasswordResetOtp(request.getEmail(), request.getOtp());
        return ResponseEntity.ok(ApiResponse.success("Xác thực OTP thành công", response));
    }

    @PostMapping("/patient/password-reset/reset")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        emailOtpService.resetPatientPassword(request.getEmail(), request.getResetToken(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công", null));
    }

    @PostMapping("/change-password")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new CustomBusinessException(ErrorCodes.UNAUTHORIZED);
        }

        AuthCredentials credentials = authCredentialsRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.getCurrentPassword(), credentials.getPasswordHash())) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Mật khẩu hiện tại không đúng");
        }
        if (passwordEncoder.matches(request.getNewPassword(), credentials.getPasswordHash())) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST,
                    "Mật khẩu mới không được trùng mật khẩu hiện tại");
        }

        credentials.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        authCredentialsRepository.save(credentials);
        return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công", null));
    }

    @GetMapping("/me")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<LoginResponse>> me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new CustomBusinessException(ErrorCodes.UNAUTHORIZED);
        }

        AuthCredentials credentials = authCredentialsRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.UNAUTHORIZED));

        return ResponseEntity.ok(ApiResponse.success(buildLoginResponse(credentials, null)));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, createAccessTokenCookie("", 0).toString())
                .body(ApiResponse.success("Đăng xuất thành công", null));
    }

    private LoginResponse buildLoginResponse(AuthCredentials credentials, String token) {
        String name = "User";
        Integer doctorId = null;
        String doctorCode = null;
        Integer patientId = null;
        String patientCode = null;

        if (credentials.getRole() == UserRole.DOCTOR && credentials.getDoctor() != null) {
            name = credentials.getDoctor().getDoctorName();
            doctorId = credentials.getDoctor().getId();
            doctorCode = credentials.getDoctor().getDoctorCode();
        } else if (credentials.getRole() == UserRole.PATIENT && credentials.getPatient() != null) {
            name = credentials.getPatient().getFullName();
            patientId = credentials.getPatient().getId();
            patientCode = credentials.getPatient().getPatientCode();
        }

        return LoginResponse.builder()
                .token(token)
                .role(credentials.getRole().name())
                .email(credentials.getEmail())
                .name(name)
                .doctorId(doctorId)
                .doctorCode(doctorCode)
                .patientId(patientId)
                .patientCode(patientCode)
                .build();
    }

    private String createToken(AuthCredentials credentials) {
        Integer businessId = null;
        String businessCode = null;

        if (credentials.getRole() == UserRole.DOCTOR && credentials.getDoctor() != null) {
            businessId = credentials.getDoctor().getId();
            businessCode = credentials.getDoctor().getDoctorCode();
        } else if (credentials.getRole() == UserRole.PATIENT && credentials.getPatient() != null) {
            businessId = credentials.getPatient().getId();
            businessCode = credentials.getPatient().getPatientCode();
        }

        return jwtTokenProvider.generateToken(
                credentials.getEmail(),
                credentials.getRole().name(),
                businessId,
                businessCode);
    }

    private ResponseCookie createAccessTokenCookie(String token, long maxAge) {
        return ResponseCookie.from("accessToken", token)
                .httpOnly(true)
                .secure(false) // Đặt true nếu dùng HTTPS
                .path("/")
                .maxAge(maxAge)
                .sameSite("Lax")
                .build();
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizePhone(String phone) {
        return phone == null || phone.isBlank() ? null : phone.trim();
    }
}