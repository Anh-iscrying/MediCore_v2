package com.medicore.controller;

import com.medicore.common.base.ApiResponse;
import com.medicore.common.constants.ErrorCodes;
import com.medicore.common.constants.GenderType;
import com.medicore.common.constants.UserRole;
import com.medicore.common.exception.CustomBusinessException;
import com.medicore.config.JwtTokenProvider;
import com.medicore.dto.request.LoginRequest;
import com.medicore.dto.request.RegisterRequest;
import com.medicore.dto.response.LoginResponse;
import com.medicore.entity.catalog.Specialty;
import com.medicore.entity.user.AuthCredentials;
import com.medicore.entity.user.Doctor;
import com.medicore.entity.user.Patient; // Đảm bảo đã có Entity này
import com.medicore.repository.AuthCredentialsRepository;
import com.medicore.repository.DoctorRepository;
import com.medicore.repository.PatientRepository; // Bạn cần tạo file này
import com.medicore.repository.SpecialtyRepository;
import com.medicore.service.IdGeneratorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthCredentialsRepository authCredentialsRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository; // Thêm Repository này
    private final SpecialtyRepository specialtyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final IdGeneratorService idGeneratorService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthCredentials credentials = authCredentialsRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));

        if (!passwordEncoder.matches(request.getPassword(), credentials.getPasswordHash())) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST);
        }

        String name = "User";
        Integer businessId = null;
        String businessCode = null;

        // Kiểm tra role để lấy thông tin định danh tương ứng
        if (credentials.getRole() == UserRole.DOCTOR && credentials.getDoctor() != null) {
            name = credentials.getDoctor().getDoctorName();
            businessId = credentials.getDoctor().getId();
            businessCode = credentials.getDoctor().getDoctorCode();
        } else if (credentials.getRole() == UserRole.PATIENT && credentials.getPatient() != null) {
            name = credentials.getPatient().getFullName();
            businessId = credentials.getPatient().getId();
            businessCode = credentials.getPatient().getPatientCode();
        }

        String token = jwtTokenProvider.generateToken(
                credentials.getEmail(),
                credentials.getRole().name(),
                businessId,
                businessCode
        );

        // 2. TẠO COOKIE
        ResponseCookie cookie = ResponseCookie.from("accessToken", token)
            .httpOnly(true)                // Bảo mật: JS không đọc được, chống XSS
            .secure(false)                 // Để false khi chạy localhost (http)
            .path("/")                     // Cookie có hiệu lực toàn bộ website
            .maxAge(24 * 60 * 60)          // Hết hạn sau 24 giờ (đúng AC-AUTH-04)
            .sameSite("Lax")               // Hỗ trợ gửi cookie khi chuyển trang
            .build();

        LoginResponse response = LoginResponse.builder()
                .token(token)
                .role(credentials.getRole().name())
                .email(credentials.getEmail())
                .name(name)
                .doctorId(credentials.getRole() == UserRole.DOCTOR ? businessId : null)
                .doctorCode(credentials.getRole() == UserRole.DOCTOR ? businessCode : null)
                .build();

        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, cookie.toString()) // Gửi "tem" về trình duyệt
            .body(ApiResponse.success("Đăng nhập thành công", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<LoginResponse>> getCurrentUser() {
        // 1. Lấy Email từ SecurityContext (do Filter đã giải mã từ Cookie/Token)
        String email = org.springframework.security.core.context.SecurityContextHolder
                        .getContext().getAuthentication().getName();

        // 2. Tìm thông tin User từ Database
        AuthCredentials credentials = authCredentialsRepository.findByEmail(email)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));

        // 3. Đóng gói thông tin trả về (giống hệt lúc Login)
        String name = "User";
        Integer busId = null;
        String busCode = null;

        if (credentials.getRole() == UserRole.DOCTOR && credentials.getDoctor() != null) {
            name = credentials.getDoctor().getDoctorName();
            busId = credentials.getDoctor().getId();
            busCode = credentials.getDoctor().getDoctorCode();
        } else if (credentials.getRole() == UserRole.PATIENT && credentials.getPatient() != null) {
            name = credentials.getPatient().getFullName();
            busId = credentials.getPatient().getId();
            busCode = credentials.getPatient().getPatientCode();
        }

        LoginResponse response = LoginResponse.builder()
                .role(credentials.getRole().name())
                .email(credentials.getEmail())
                .name(name)
                .doctorId(credentials.getRole() == UserRole.DOCTOR ? busId : null)
                .doctorCode(credentials.getRole() == UserRole.DOCTOR ? busCode : null)
                .build();

        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin thành công", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<LoginResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        // 1. Kiểm tra email tồn tại
        if (authCredentialsRepository.existsByEmail(request.getEmail())) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST);
        }

        // 2. Xác định role
        UserRole targetRole = UserRole.PATIENT;

        try {
            if (request.getRole() != null) {
                targetRole = UserRole.valueOf(request.getRole().toUpperCase());
            }
        } catch (IllegalArgumentException e) {
            targetRole = UserRole.PATIENT;
        }

        AuthCredentials credentials;
        Integer businessId;
        String businessCode;
        String displayName = request.getName();

        if (targetRole == UserRole.DOCTOR) {

            // ===== ĐĂNG KÝ BÁC SĨ =====

            Specialty specialty = specialtyRepository.findById(request.getSpecialtyId())
                    .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));

            businessCode = idGeneratorService.generateDoctorCode();

            Doctor doctor = Doctor.builder()
                    .specialty(specialty)
                    .doctorCode(businessCode)
                    .doctorName(request.getName())
                    .phone(request.getPhone())
                    .degree(request.getTitle())
                    .experienceYears(request.getExperience())
                    .isActive(true)
                    .build();

            doctor.setCreatedAt(LocalDateTime.now());
            doctor.setUpdatedAt(LocalDateTime.now());

            doctor = doctorRepository.save(doctor);
            businessId = doctor.getId();

            credentials = AuthCredentials.builder()
                    .email(request.getEmail())
                    .passwordHash(passwordEncoder.encode(request.getPassword()))
                    .role(UserRole.DOCTOR)
                    .doctor(doctor)
                    .build();

        } else {

            // ===== ĐĂNG KÝ BỆNH NHÂN =====

            businessCode = idGeneratorService.generatePatientCode();

            LocalDate dob = null;
            if (request.getDob() != null) {
                dob = LocalDate.parse(
                        request.getDob(),
                        DateTimeFormatter.ISO_DATE
                );
            }

            GenderType targetGender = GenderType.MALE;

            if (request.getGender() != null) {
                try {
                    targetGender = GenderType.valueOf(
                            request.getGender().toUpperCase()
                    );
                } catch (IllegalArgumentException e) {
                    targetGender = GenderType.MALE;
                }
            }

            Patient patient = Patient.builder()
                    .patientCode(businessCode)
                    .fullName(request.getName())
                    .dob(dob)
                    .gender(targetGender)
                    .phone(request.getPhone())
                    .address(request.getAddress())
                    .build();

            patient.setCreatedAt(LocalDateTime.now());
            patient.setUpdatedAt(LocalDateTime.now());

            patient = patientRepository.save(patient);
            businessId = patient.getId();

            credentials = AuthCredentials.builder()
                    .email(request.getEmail())
                    .passwordHash(passwordEncoder.encode(request.getPassword()))
                    .role(UserRole.PATIENT)
                    .patient(patient)
                    .build();
        }

        // 3. Lưu thông tin đăng nhập
        authCredentialsRepository.save(credentials);

        // 4. Sinh JWT
        String token = jwtTokenProvider.generateToken(
                credentials.getEmail(),
                targetRole.name(),
                businessId,
                businessCode
        );

        LoginResponse response = LoginResponse.builder()
                .token(token)
                .role(targetRole.name())
                .email(credentials.getEmail())
                .name(displayName)
                .doctorId(targetRole == UserRole.DOCTOR ? businessId : null)
                .doctorCode(targetRole == UserRole.DOCTOR ? businessCode : null)
                .build();

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Đăng ký tài khoản thành công",
                        response
                )
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        // Tạo một Cookie trống, có thời hạn bằng 0 để ghi đè lên Cookie cũ
        ResponseCookie cookie = ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0) // Hết hạn ngay lập tức
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.success("Đăng xuất thành công", null));
    }
}