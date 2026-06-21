package com.medicore.service.impl;

import com.medicore.common.constants.UserRole;
import com.medicore.common.exception.CustomBusinessException;
import com.medicore.common.constants.ErrorCodes;
import com.medicore.dto.request.UserRegisterRequest;
import com.medicore.entity.user.User;
import com.medicore.entity.user.Patient;
import com.medicore.entity.user.Doctor;
import com.medicore.entity.catalog.Specialty;
import com.medicore.repository.UserRepository;
import com.medicore.repository.PatientRepository;
import com.medicore.repository.DoctorRepository;
import com.medicore.repository.SpecialtyRepository;
import com.medicore.service.UserService;
import com.medicore.service.IdGeneratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final SpecialtyRepository specialtyRepository;
    private final IdGeneratorService idGeneratorService;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional // Rất quan trọng: Lỗi ở bất kỳ bảng nào là hủy toàn bộ (MC-15 Requirement)
    public User register(UserRegisterRequest request) {
        // 1. Kiểm tra Email và SĐT đã tồn tại chưa (MC-03 AC-AUTH-01)
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST); // Email đã tồn tại
        }
        // (Bạn có thể thêm check phoneNumber tại PatientRepository nếu cần)

        // 2. Mã hóa mật khẩu bằng BCrypt trước khi lưu (MC-03 Requirement)
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .isActive(true)
                .build();
        User savedUser = userRepository.save(user);

        // 3. Phân luồng tạo hồ sơ định danh chuẩn (MC-15)
        if (request.getRole() == UserRole.PATIENT) {
            createPatientProfile(savedUser, request);
        } else if (request.getRole() == UserRole.DOCTOR) {
            createDoctorProfile(savedUser, request);
        }

        return savedUser;
    }

    private void createPatientProfile(User user, UserRegisterRequest request) {
        Patient patient = Patient.builder()
                .user(user)
                .patientCode(idGeneratorService.generatePatientCode()) // PAT-YYYY-XXXX
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .dob(request.getDob())
                .gender(request.getGender())
                .build();
        patientRepository.save(patient);
    }

    private void createDoctorProfile(User user, UserRegisterRequest request) {
        // Mặc định lấy chuyên khoa đầu tiên nếu chưa chọn (Có thể nâng cấp chọn qua ID)
        Specialty specialty = specialtyRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Chưa có danh mục chuyên khoa!"));

        Doctor doctor = Doctor.builder()
                .user(user)
                .specialty(specialty)
                .doctorCode(idGeneratorService.generateDoctorCode()) // DOC-XXXX
                .doctorName(request.getFullName())
                .build();
        doctorRepository.save(doctor);
    }
}