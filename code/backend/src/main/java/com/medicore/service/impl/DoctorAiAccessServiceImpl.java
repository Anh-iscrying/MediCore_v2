package com.medicore.service.impl;

import com.medicore.common.constants.AppointmentStatus;
import com.medicore.common.constants.ErrorCodes;
import com.medicore.common.constants.UserRole;
import com.medicore.common.exception.CustomBusinessException;
import com.medicore.dto.ai.DoctorAiAuthorizedTarget;
import com.medicore.dto.request.DoctorAiChatRequest;
import com.medicore.entity.clinical.Appointment;
import com.medicore.entity.user.AuthCredentials;
import com.medicore.entity.user.Doctor;
import com.medicore.entity.user.Patient;
import com.medicore.repository.AppointmentRepository;
import com.medicore.repository.AuthCredentialsRepository;
import com.medicore.repository.MedicalRecordRepository;
import com.medicore.repository.PatientRepository;
import com.medicore.service.DoctorAiAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class DoctorAiAccessServiceImpl implements DoctorAiAccessService {

    private final AuthCredentialsRepository authCredentialsRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final PatientRepository patientRepository;

    @Override
    @Transactional(readOnly = true)
    public DoctorAiAuthorizedTarget resolveTarget(String email, DoctorAiChatRequest request) {
        AuthCredentials credentials = authCredentialsRepository.findByEmail(email)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.UNAUTHORIZED));

        if (credentials.getRole() != UserRole.DOCTOR || credentials.getDoctor() == null) {
            throw new CustomBusinessException(ErrorCodes.FORBIDDEN);
        }

        Doctor doctor = credentials.getDoctor();
        Patient patient = null;
        Appointment appointment = null;

        if (request.getAppointmentId() != null) {
            appointment = appointmentRepository.findDoctorAiTargetById(request.getAppointmentId())
                    .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND, "Không tìm thấy lịch hẹn."));

            if (appointment.getDoctor() == null || !doctor.getId().equals(appointment.getDoctor().getId())) {
                throw new CustomBusinessException(ErrorCodes.FORBIDDEN, "Bạn không có quyền truy cập lịch hẹn này.");
            }

            patient = appointment.getPatient();
            if (patient == null) {
                throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Lịch hẹn không có thông tin bệnh nhân.");
            }

            if (StringUtils.hasText(request.getPatientCode()) 
                    && !patient.getPatientCode().equalsIgnoreCase(request.getPatientCode().trim())) {
                throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Mã bệnh nhân không khớp với lịch hẹn.");
            }
        } else if (StringUtils.hasText(request.getPatientCode())) {
            String pCode = request.getPatientCode().trim();
            patient = patientRepository.findByPatientCode(pCode)
                    .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND, "Không tìm thấy bệnh nhân."));

            boolean hasAppointment = appointmentRepository.existsByDoctorIdAndPatientPatientCodeAndStatusNot(
                    doctor.getId(), pCode, AppointmentStatus.CANCELLED);
            boolean hasMedicalRecord = medicalRecordRepository.existsByDoctorIdAndPatientPatientCode(
                    doctor.getId(), pCode);

            if (!hasAppointment && !hasMedicalRecord) {
                throw new CustomBusinessException(ErrorCodes.FORBIDDEN, "Bạn chưa từng khám cho bệnh nhân này.");
            }
        } else {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Yêu cầu phải cung cấp appointmentId hoặc patientCode.");
        }

        return DoctorAiAuthorizedTarget.builder()
                .doctor(doctor)
                .patient(patient)
                .appointment(appointment)
                .build();
    }
}
