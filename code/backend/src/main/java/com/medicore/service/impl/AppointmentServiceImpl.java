package com.medicore.service.impl;

import com.medicore.common.constants.AppointmentStatus;
import com.medicore.common.constants.ErrorCodes;
import com.medicore.common.exception.CustomBusinessException;
import com.medicore.dto.request.AppointmentRequest;
import com.medicore.dto.response.AppointmentResponse;
import com.medicore.entity.clinical.Appointment;
import com.medicore.entity.user.Doctor;
import com.medicore.entity.user.Patient;
import com.medicore.repository.AppointmentRepository;
import com.medicore.repository.DoctorRepository;
import com.medicore.repository.PatientRepository;
import com.medicore.service.AppointmentService;
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
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointmentsByPatient(String patientIdOrCode) {
        Patient patient = findPatientByIdOrCode(patientIdOrCode);
        return appointmentRepository.findByPatientPatientCode(patient.getPatientCode()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointmentsByDoctor(Integer doctorId) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new CustomBusinessException(ErrorCodes.NOT_FOUND);
        }
        return appointmentRepository.findByDoctorId(doctorId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponse getAppointmentById(Integer id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));
        return mapToResponse(appointment);
    }

    @Override
    @Transactional
    public AppointmentResponse createAppointment(AppointmentRequest request) {
        Patient patient = findPatientByIdOrCode(request.getPatientId());
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));

        LocalDate appDate = LocalDate.parse(request.getAppointmentDate(), DATE_FORMATTER);
        AppointmentStatus status = mapToStatusEntity(request.getStatus());

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(appDate)
                .timeSlot(request.getTimeSlot())
                .symptomsInitial(request.getSymptomsInitial())
                .status(status)
                .build();

        appointment.setCreatedAt(LocalDateTime.now());
        appointment.setUpdatedAt(LocalDateTime.now());

        appointment = appointmentRepository.save(appointment);
        return mapToResponse(appointment);
    }

    @Override
    @Transactional
    public AppointmentResponse updateAppointment(Integer id, AppointmentRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));

        Patient patient = findPatientByIdOrCode(request.getPatientId());
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));

        LocalDate appDate = LocalDate.parse(request.getAppointmentDate(), DATE_FORMATTER);
        AppointmentStatus status = mapToStatusEntity(request.getStatus());

        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(appDate);
        appointment.setTimeSlot(request.getTimeSlot());
        appointment.setSymptomsInitial(request.getSymptomsInitial());
        appointment.setStatus(status);
        appointment.setUpdatedAt(LocalDateTime.now());

        appointment = appointmentRepository.save(appointment);
        return mapToResponse(appointment);
    }

    @Override
    @Transactional
    public void deleteAppointment(Integer id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));
        appointmentRepository.delete(appointment);
    }

    private Patient findPatientByIdOrCode(String patientIdOrCode) {
        try {
            Integer id = Integer.parseInt(patientIdOrCode);
            return patientRepository.findById(id)
                    .orElseGet(() -> patientRepository.findByPatientCode(patientIdOrCode)
                            .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND)));
        } catch (NumberFormatException e) {
            return patientRepository.findByPatientCode(patientIdOrCode)
                    .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND));
        }
    }

    private AppointmentStatus mapToStatusEntity(String statusDto) {
        if (statusDto == null || statusDto.isBlank()) {
            return AppointmentStatus.WAITING;
        }
        switch (statusDto.toUpperCase()) {
            case "PENDING":
                return AppointmentStatus.WAITING;
            case "CONFIRMED":
                return AppointmentStatus.IN_PROGRESS;
            case "COMPLETED":
                return AppointmentStatus.DONE;
            case "CANCELLED":
                return AppointmentStatus.CANCELLED;
            default:
                return AppointmentStatus.WAITING;
        }
    }

    private String mapToStatusDto(AppointmentStatus status) {
        if (status == null) {
            return "PENDING";
        }
        switch (status) {
            case WAITING:
                return "PENDING";
            case IN_PROGRESS:
                return "CONFIRMED";
            case DONE:
                return "COMPLETED";
            case CANCELLED:
                return "CANCELLED";
            default:
                return "PENDING";
        }
    }

    private AppointmentResponse mapToResponse(Appointment appointment) {
        return AppointmentResponse.builder()
                .id(appointment.getId())
                .patientName(appointment.getPatient() != null ? appointment.getPatient().getFullName() : null)
                .patientId(appointment.getPatient() != null ? appointment.getPatient().getPatientCode() : null)
                .doctorId(appointment.getDoctor() != null ? appointment.getDoctor().getId() : null)
                .doctorName(appointment.getDoctor() != null ? appointment.getDoctor().getDoctorName() : null)
                .specialtyId(appointment.getDoctor() != null && appointment.getDoctor().getSpecialty() != null 
                        ? appointment.getDoctor().getSpecialty().getId() : null)
                .appointmentDate(appointment.getAppointmentDate() != null 
                        ? appointment.getAppointmentDate().format(DATE_FORMATTER) : null)
                .timeSlot(appointment.getTimeSlot())
                .symptomsInitial(appointment.getSymptomsInitial())
                .status(mapToStatusDto(appointment.getStatus()))
                .icdCode(null) // Lấy từ EMR ở phase sau
                .mainDiagnosis(null) // Lấy từ EMR ở phase sau
                .build();
    }
}
