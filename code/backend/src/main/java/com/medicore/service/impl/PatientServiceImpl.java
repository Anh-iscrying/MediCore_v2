package com.medicore.service.impl;

import com.medicore.common.constants.ErrorCodes;
import com.medicore.common.constants.GenderType;
import com.medicore.common.exception.CustomBusinessException;
import com.medicore.dto.request.PatientRequest;
import com.medicore.dto.request.PatientUpdateRequest;
import com.medicore.dto.response.PatientResponse;
import com.medicore.entity.user.AuthCredentials;
import com.medicore.entity.user.Patient;
import com.medicore.repository.AuthCredentialsRepository;
import com.medicore.repository.PatientRepository;
import com.medicore.service.IdGeneratorService;
import com.medicore.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final AuthCredentialsRepository authCredentialsRepository;
    private final IdGeneratorService idGeneratorService;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Override
    @Transactional(readOnly = true)
    public List<PatientResponse> getAllPatients() {
        return patientRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PatientResponse getCurrentPatient(String email) {
        AuthCredentials credentials = authCredentialsRepository.findByEmail(email)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.UNAUTHORIZED));
        if (credentials.getPatient() == null) {
            throw new CustomBusinessException(ErrorCodes.NOT_FOUND);
        }
        return mapToResponse(credentials.getPatient(), credentials.getEmail());
    }

    @Override
    @Transactional(readOnly = true)
    public PatientResponse getPatientById(Integer id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));
        return mapToResponse(patient);
    }

    @Override
    @Transactional(readOnly = true)
    public PatientResponse getPatientByCode(String code) {
        Patient patient = patientRepository.findByPatientCode(code)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));
        return mapToResponse(patient);
    }

    @Override
    @Transactional
    public PatientResponse createPatient(PatientRequest request) {
        String patientCode = idGeneratorService.generatePatientCode();
        
        LocalDate dob = null;
        if (request.getDateOfBirth() != null && !request.getDateOfBirth().isBlank()) {
            dob = LocalDate.parse(request.getDateOfBirth(), DATE_FORMATTER);
        }

        GenderType gender = null;
        if ("M".equalsIgnoreCase(request.getGender())) {
            gender = GenderType.MALE;
        } else if ("F".equalsIgnoreCase(request.getGender())) {
            gender = GenderType.FEMALE;
        } else if ("O".equalsIgnoreCase(request.getGender())) {
            gender = GenderType.OTHER;
        }

        Patient patient = Patient.builder()
                .patientCode(patientCode)
                .fullName(request.getName())
                .dob(dob)
                .gender(gender)
                .phone(request.getPhone())
                .address(request.getAddress())
                .build();

        patient.setCreatedAt(LocalDateTime.now());
        patient.setUpdatedAt(LocalDateTime.now());

        patient = patientRepository.save(patient);
        return mapToResponse(patient);
    }

    @Override
    @Transactional
    public PatientResponse updatePatient(Integer id, PatientRequest request) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));

        LocalDate dob = null;
        if (request.getDateOfBirth() != null && !request.getDateOfBirth().isBlank()) {
            dob = LocalDate.parse(request.getDateOfBirth(), DATE_FORMATTER);
        }

        GenderType gender = null;
        if ("M".equalsIgnoreCase(request.getGender())) {
            gender = GenderType.MALE;
        } else if ("F".equalsIgnoreCase(request.getGender())) {
            gender = GenderType.FEMALE;
        } else if ("O".equalsIgnoreCase(request.getGender())) {
            gender = GenderType.OTHER;
        }

        patient.setFullName(request.getName());
        patient.setDob(dob);
        patient.setGender(gender);
        patient.setPhone(request.getPhone());
        patient.setAddress(request.getAddress());
        patient.setUpdatedAt(LocalDateTime.now());

        patient = patientRepository.save(patient);
        return mapToResponse(patient);
    }

    @Override
    @Transactional
    public PatientResponse updateCurrentPatient(String email, PatientUpdateRequest request) {
        AuthCredentials credentials = authCredentialsRepository.findByEmail(email)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.UNAUTHORIZED));
        Patient patient = credentials.getPatient();
        if (patient == null) {
            throw new CustomBusinessException(ErrorCodes.NOT_FOUND);
        }

        LocalDate dob = null;
        if (request.getDateOfBirth() != null && !request.getDateOfBirth().isBlank()) {
            dob = LocalDate.parse(request.getDateOfBirth(), DATE_FORMATTER);
        }

        GenderType gender = null;
        if ("M".equalsIgnoreCase(request.getGender())) {
            gender = GenderType.MALE;
        } else if ("F".equalsIgnoreCase(request.getGender())) {
            gender = GenderType.FEMALE;
        } else if ("O".equalsIgnoreCase(request.getGender())) {
            gender = GenderType.OTHER;
        }

        patient.setFullName(request.getName());
        patient.setDob(dob);
        patient.setGender(gender);
        patient.setPhone(request.getPhone());
        patient.setAddress(request.getAddress());
        patient.setUpdatedAt(LocalDateTime.now());

        patient = patientRepository.save(patient);
        return mapToResponse(patient, credentials.getEmail());
    }

    @Override
    @Transactional
    public void deletePatient(Integer id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));
        patientRepository.delete(patient);
    }

    private PatientResponse mapToResponse(Patient patient) {
        return mapToResponse(patient, null);
    }

    private PatientResponse mapToResponse(Patient patient, String emailOverride) {
        String genderStr = null;
        if (patient.getGender() != null) {
            if (patient.getGender() == GenderType.FEMALE) {
                genderStr = "F";
            } else if (patient.getGender() == GenderType.MALE) {
                genderStr = "M";
            } else if (patient.getGender() == GenderType.OTHER) {
                genderStr = "O";
            }
        }

        String dobStr = null;
        if (patient.getDob() != null) {
            dobStr = patient.getDob().format(DATE_FORMATTER);
        }

        String email = emailOverride != null
                ? emailOverride
                : patient.getPatientCode() != null
                ? patient.getPatientCode().toLowerCase() + "@medicore.com"
                : "patient." + patient.getId() + "@medicore.com";

        String insNum = "GD" + String.format("%08d", patient.getId());

        return PatientResponse.builder()
                .id(patient.getId())
                .name(patient.getFullName())
                .dateOfBirth(dobStr)
                .gender(genderStr)
                .phone(patient.getPhone())
                .email(email)
                .address(patient.getAddress())
                .insuranceNumber(insNum)
                .status("waiting") // Sinh mặc định trạng thái
                .patientCode(patient.getPatientCode())
                .createdAt(patient.getCreatedAt())
                .build();
    }
}
