package com.medicore.controller;

import com.medicore.common.base.ApiResponse;
import com.medicore.common.constants.ErrorCodes;
import com.medicore.common.constants.UserRole;
import com.medicore.common.exception.CustomBusinessException;
import com.medicore.config.JwtTokenProvider;
import com.medicore.dto.request.LoginRequest;
import com.medicore.dto.request.RegisterRequest;
import com.medicore.dto.response.LoginResponse;
import com.medicore.entity.catalog.Specialty;
import com.medicore.entity.user.AuthCredentials;
import com.medicore.entity.user.Doctor;
import com.medicore.repository.AuthCredentialsRepository;
import com.medicore.repository.DoctorRepository;
import com.medicore.repository.SpecialtyRepository;
import com.medicore.service.IdGeneratorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthCredentialsRepository authCredentialsRepository;
    private final DoctorRepository doctorRepository;
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

        String name = "Admin";
        Integer doctorId = null;
        String doctorCode = null;

        if (credentials.getRole() == UserRole.DOCTOR && credentials.getDoctor() != null) {
            Doctor doctor = credentials.getDoctor();
            name = doctor.getDoctorName();
            doctorId = doctor.getId();
            doctorCode = doctor.getDoctorCode();
        }

        String token = jwtTokenProvider.generateToken(
                credentials.getEmail(),
                credentials.getRole().name(),
                doctorId,
                doctorCode
        );

        LoginResponse response = LoginResponse.builder()
                .token(token)
                .role(credentials.getRole().name())
                .email(credentials.getEmail())
                .name(name)
                .doctorId(doctorId)
                .doctorCode(doctorCode)
                .build();

        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<LoginResponse>> register(@Valid @RequestBody RegisterRequest request) {
        if (authCredentialsRepository.existsByEmail(request.getEmail())) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST);
        }

        Specialty specialty = specialtyRepository.findById(request.getSpecialtyId())
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));

        // 1. Tạo và lưu thực thể Doctor
        String doctorCode = idGeneratorService.generateDoctorCode();
        Doctor doctor = Doctor.builder()
                .specialty(specialty)
                .doctorCode(doctorCode)
                .doctorName(request.getName())
                .phone(request.getPhone())
                .degree(request.getTitle())
                .experienceYears(request.getExperience())
                .build();
        doctor.setCreatedAt(LocalDateTime.now());
        doctor.setUpdatedAt(LocalDateTime.now());
        doctor = doctorRepository.save(doctor);

        // 2. Tạo và lưu thông tin tài khoản đăng nhập
        AuthCredentials credentials = AuthCredentials.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.DOCTOR)
                .doctor(doctor)
                .build();
        authCredentialsRepository.save(credentials);

        // 3. Tự động sinh JWT token để đăng nhập luôn
        String token = jwtTokenProvider.generateToken(
                credentials.getEmail(),
                UserRole.DOCTOR.name(),
                doctor.getId(),
                doctorCode
        );

        LoginResponse response = LoginResponse.builder()
                .token(token)
                .role(UserRole.DOCTOR.name())
                .email(credentials.getEmail())
                .name(doctor.getDoctorName())
                .doctorId(doctor.getId())
                .doctorCode(doctorCode)
                .build();

        return ResponseEntity.ok(ApiResponse.success("Đăng ký tài khoản bác sĩ thành công", response));
    }
}