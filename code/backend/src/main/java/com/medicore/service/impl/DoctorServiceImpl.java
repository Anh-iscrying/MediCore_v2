package com.medicore.service.impl;

import com.medicore.common.constants.ErrorCodes;
import com.medicore.common.constants.UserRole;
import com.medicore.common.exception.CustomBusinessException;
import com.medicore.dto.request.DoctorProfileRequest;
import com.medicore.dto.request.DoctorRequest;
import com.medicore.dto.response.DoctorResponse;
import com.medicore.entity.catalog.Specialty;
import com.medicore.entity.user.AuthCredentials;
import com.medicore.entity.user.Doctor;
import com.medicore.repository.AuthCredentialsRepository;
import com.medicore.repository.DoctorRepository;
import com.medicore.repository.SpecialtyRepository;
import com.medicore.service.DoctorService;
import com.medicore.service.IdGeneratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final SpecialtyRepository specialtyRepository;
    private final IdGeneratorService idGeneratorService;
    private final AuthCredentialsRepository authCredentialsRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public List<DoctorResponse> getAllDoctors() {
        return doctorRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorResponse> getDoctorsBySpecialty(Integer specialtyId) {
        if (!specialtyRepository.existsById(specialtyId)) {
            throw new CustomBusinessException(ErrorCodes.NOT_FOUND);
        }
        return doctorRepository.findBySpecialtyId(specialtyId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorResponse getDoctorById(Integer id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));
        return mapToResponse(doctor);
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorResponse getDoctorByEmail(String email) {
        AuthCredentials credentials = authCredentialsRepository.findByEmail(email)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));

        Doctor doctor = credentials.getDoctor();
        if (doctor == null) {
            throw new CustomBusinessException(ErrorCodes.NOT_FOUND);
        }

        return mapToResponse(doctor);
    }

    @Override
    @Transactional
    public DoctorResponse createDoctor(DoctorRequest request) {
        Specialty specialty = specialtyRepository.findById(request.getSpecialtyId())
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));

        String email = request.getEmail();
        if (email == null || email.trim().isEmpty()) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST);
        }

        if (authCredentialsRepository.existsByEmail(email)) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST);
        }

        String doctorCode = idGeneratorService.generateDoctorCode();

        Doctor doctor = Doctor.builder()
                .specialty(specialty)
                .doctorCode(doctorCode)
                .doctorName(request.getName())
                .phone(request.getPhone())
                .degree(request.getTitle())
                .bio(request.getBio())
                .experienceYears(request.getExperience())
                .avatarUrl(request.getAvatarUrl())
                .build();
        
        doctor.setCreatedAt(LocalDateTime.now());
        doctor.setUpdatedAt(LocalDateTime.now());
        doctor = doctorRepository.save(doctor);

        String rawPassword = request.getPassword();
        if (rawPassword == null || rawPassword.trim().isEmpty()) {
            rawPassword = "doctor123"; // default password if not provided
        }

        AuthCredentials credentials = AuthCredentials.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .role(UserRole.DOCTOR)
                .doctor(doctor)
                .build();
        authCredentialsRepository.save(credentials);

        return mapToResponse(doctor);
    }

    @Override
    @Transactional
    public DoctorResponse updateDoctor(Integer id, DoctorRequest request) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));

        Specialty specialty = specialtyRepository.findById(request.getSpecialtyId())
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));

        doctor.setDoctorName(request.getName());
        doctor.setSpecialty(specialty);
        doctor.setPhone(request.getPhone());
        doctor.setDegree(request.getTitle());
        doctor.setBio(request.getBio());
        doctor.setExperienceYears(request.getExperience());
        doctor.setAvatarUrl(request.getAvatarUrl());
        doctor.setUpdatedAt(LocalDateTime.now());
        doctor = doctorRepository.save(doctor);

        // Update Auth Credentials
        Optional<AuthCredentials> credentialsOpt = authCredentialsRepository.findByDoctorId(doctor.getId());
        String newEmail = request.getEmail();
        String newPassword = request.getPassword();

        if (newEmail != null && !newEmail.trim().isEmpty()) {
            if (credentialsOpt.isPresent()) {
                AuthCredentials oldCreds = credentialsOpt.get();
                if (!oldCreds.getEmail().equals(newEmail)) {
                    if (authCredentialsRepository.existsByEmail(newEmail)) {
                        throw new CustomBusinessException(ErrorCodes.BAD_REQUEST);
                    }
                    authCredentialsRepository.delete(oldCreds);
                    authCredentialsRepository.flush();

                    String pwdHash = (newPassword != null && !newPassword.trim().isEmpty())
                            ? passwordEncoder.encode(newPassword)
                            : oldCreds.getPasswordHash();

                    AuthCredentials newCreds = AuthCredentials.builder()
                            .email(newEmail)
                            .passwordHash(pwdHash)
                            .role(UserRole.DOCTOR)
                            .doctor(doctor)
                            .build();
                    authCredentialsRepository.save(newCreds);
                } else if (newPassword != null && !newPassword.trim().isEmpty()) {
                    oldCreds.setPasswordHash(passwordEncoder.encode(newPassword));
                    authCredentialsRepository.save(oldCreds);
                }
            } else {
                String pwd = (newPassword != null && !newPassword.trim().isEmpty()) ? newPassword : "doctor123";
                AuthCredentials newCreds = AuthCredentials.builder()
                        .email(newEmail)
                        .passwordHash(passwordEncoder.encode(pwd))
                        .role(UserRole.DOCTOR)
                        .doctor(doctor)
                        .build();
                authCredentialsRepository.save(newCreds);
            }
        }

        return mapToResponse(doctor);
    }

    @Override
    @Transactional
    public void deleteDoctor(Integer id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));
        
        authCredentialsRepository.findByDoctorId(doctor.getId())
                .ifPresent(authCredentialsRepository::delete);
                
        doctorRepository.delete(doctor);
    }

    @Override
    @Transactional
    public DoctorResponse updateDoctorByEmail(String email, DoctorProfileRequest request) {
        AuthCredentials credentials = authCredentialsRepository.findByEmail(email)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));

        Doctor doctor = credentials.getDoctor();
        if (doctor == null) {
            throw new CustomBusinessException(ErrorCodes.NOT_FOUND);
        }

        Specialty specialty = specialtyRepository.findById(request.getSpecialtyId())
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));

        doctor.setDoctorName(request.getName());
        doctor.setPhone(request.getPhone());
        doctor.setDegree(request.getTitle());
        doctor.setBio(request.getBio());
        doctor.setExperienceYears(request.getExperience());
        doctor.setSpecialty(specialty);
        doctor.setAvatarUrl(request.getAvatarUrl());
        doctor.setUpdatedAt(LocalDateTime.now());

        doctor = doctorRepository.save(doctor);
        return mapToResponse(doctor);
    }

    private DoctorResponse mapToResponse(Doctor doctor) {
        String email = authCredentialsRepository.findByDoctorId(doctor.getId())
                .map(AuthCredentials::getEmail)
                .orElseGet(() -> doctor.getDoctorCode() != null 
                        ? doctor.getDoctorCode().toLowerCase() + "@medicore.com" 
                        : "doctor." + doctor.getId() + "@medicore.com");
                
        return DoctorResponse.builder()
                .id(doctor.getId())
                .name(doctor.getDoctorName())
                .specialtyId(doctor.getSpecialty() != null ? doctor.getSpecialty().getId() : null)
                .specialtyName(doctor.getSpecialty() != null ? doctor.getSpecialty().getSpecialtyName() : null)
                .title(doctor.getDegree())
                .bio(doctor.getBio())
                .email(email)
                .phone(doctor.getPhone())
                .experience(doctor.getExperienceYears())
                .status("active")
                .avatar(doctor.getAvatarUrl())
                .doctorCode(doctor.getDoctorCode())
                .build();
    }
}
