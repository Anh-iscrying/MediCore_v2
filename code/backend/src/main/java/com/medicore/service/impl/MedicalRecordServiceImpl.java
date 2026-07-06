package com.medicore.service.impl;

import com.medicore.common.constants.AppointmentStatus;
import com.medicore.common.constants.ErrorCodes;
import com.medicore.common.constants.UserRole;
import com.medicore.common.exception.CustomBusinessException;
import com.medicore.dto.request.MedicalRecordRequest;
import com.medicore.dto.response.MedicalRecordResponse;
import com.medicore.entity.catalog.Disease;
import com.medicore.entity.clinical.Appointment;
import com.medicore.entity.clinical.MedicalRecord;
import com.medicore.entity.clinical.Prescription;
import com.medicore.entity.clinical.PrescriptionDetail;
import com.medicore.entity.user.AuthCredentials;
import com.medicore.entity.user.Patient;
import com.medicore.repository.AppointmentRepository;
import com.medicore.repository.AuthCredentialsRepository;
import com.medicore.repository.DiseaseRepository;
import com.medicore.repository.MedicalRecordRepository;
import com.medicore.repository.MedicineRepository;
import com.medicore.repository.PrescriptionDetailRepository;
import com.medicore.repository.PrescriptionRepository;
import com.medicore.service.IdGeneratorService;
import com.medicore.service.MedicalRecordPdfService;
import com.medicore.service.MedicalRecordService;
import com.medicore.service.PatientNotificationService;
import com.medicore.service.SupabaseStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MedicalRecordServiceImpl implements MedicalRecordService {

    private final MedicalRecordRepository recordRepository;
    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionDetailRepository prescriptionDetailRepository;
    private final MedicineRepository medicineRepository;
    private final DiseaseRepository diseaseRepository;
    private final AuthCredentialsRepository authCredentialsRepository;
    private final IdGeneratorService idGeneratorService;
    private final MedicalRecordPdfService pdfService;
    private final SupabaseStorageService storageService;
    private final PatientNotificationService patientNotificationService;

    @Override
    @Transactional
    public MedicalRecordResponse createMedicalRecord(MedicalRecordRequest request) {
        if (request.getAppointmentId() == null) {
            throw new CustomBusinessException(ErrorCodes.BAD_REQUEST, "Thiếu mã lịch hẹn");
        }

        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND, "Không tìm thấy lịch hẹn"));

        MedicalRecord record = recordRepository.findByAppointmentId(appointment.getId())
                .orElseGet(() -> MedicalRecord.builder()
                        .emrCode(idGeneratorService.generateEmrCode())
                        .appointment(appointment)
                        .patient(appointment.getPatient())
                        .doctor(appointment.getDoctor())
                        .createdAt(OffsetDateTime.now())
                        .build());

        applyRequest(record, request);
        record = recordRepository.save(record);

        Prescription prescription = prescriptionRepository.findByMedicalRecordId(record.getId()).orElse(null);
        if (prescription == null) {
            prescription = Prescription.builder()
                    .medicalRecord(record)
                    .createdAt(OffsetDateTime.now())
                    .build();
        }
        prescription = prescriptionRepository.save(prescription);

        prescriptionDetailRepository.deleteByPrescriptionId(prescription.getId());
        List<PrescriptionDetail> details = savePrescriptionDetails(prescription, request.getMedicines());

        appointment.setStatus(AppointmentStatus.DONE);
        appointmentRepository.save(appointment);

        return toResponse(record, details);
    }

    @Override
    @Transactional(readOnly = true)
    public MedicalRecordResponse getRecordByAppointment(Integer appointmentId, String email) {
        AuthCredentials credentials = findCredentials(email);
        MedicalRecord record = recordRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND, "Không tìm thấy hồ sơ khám"));
        ensureCanRead(record, credentials);
        return toResponse(record, loadDetails(record));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicalRecordResponse> getCurrentPatientRecords(String email) {
        AuthCredentials credentials = findCredentials(email);
        if (credentials.getRole() != UserRole.PATIENT || credentials.getPatient() == null) {
            throw new CustomBusinessException(ErrorCodes.FORBIDDEN);
        }
        Patient patient = credentials.getPatient();
        return recordRepository.findByPatientPatientCodeOrderByCreatedAtDesc(patient.getPatientCode()).stream()
                .map(record -> toResponse(record, loadDetails(record)))
                .toList();
    }

    private void applyRequest(MedicalRecord record, MedicalRecordRequest request) {
        record.setSymptoms(request.getSymptoms());
        record.setPhysicalExamination(request.getPhysicalExamination());
        record.setTestResults(request.getTestResults());
        record.setMainDiagnosis(request.getMainDiagnosis());
        record.setClinicalNote(request.getClinicalNote());
        record.setHistorySummary(request.getHistorySummary());
        record.setCareAdvice(request.getCareAdvice());
        record.setFollowUpDate(request.getFollowUpDate());
        record.setAdditionalData(request.getAdditionalData() == null ? Collections.emptyMap() : request.getAdditionalData());

        String primaryIcd10 = request.getDiagnoses() == null ? null : request.getDiagnoses().stream()
                .filter(item -> item.getIcd10Code() != null && Boolean.TRUE.equals(item.getIsPrimary()))
                .map(MedicalRecordRequest.DiagnosisItem::getIcd10Code)
                .findFirst()
                .orElseGet(() -> request.getDiagnoses().stream()
                        .filter(item -> StringUtils.hasText(item.getIcd10Code()))
                        .map(MedicalRecordRequest.DiagnosisItem::getIcd10Code)
                        .findFirst()
                        .orElse(null));
        if (StringUtils.hasText(primaryIcd10)) {
            Disease disease = diseaseRepository.findById(primaryIcd10.trim())
                    .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND, "Không tìm thấy mã ICD-10: " + primaryIcd10));
            record.setDiagnosisIcd10(disease);
        } else {
            record.setDiagnosisIcd10(null);
        }
    }

    private List<PrescriptionDetail> savePrescriptionDetails(Prescription prescription, List<MedicalRecordRequest.MedicineItem> medicines) {
        List<PrescriptionDetail> details = new ArrayList<>();
        if (medicines == null) {
            return details;
        }

        for (MedicalRecordRequest.MedicineItem item : medicines) {
            if (item.getMedicineId() == null) {
                continue;
            }
            var medicine = medicineRepository.findById(item.getMedicineId())
                    .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND, "Không thấy thuốc ID: " + item.getMedicineId()));
            PrescriptionDetail detail = PrescriptionDetail.builder()
                    .prescription(prescription)
                    .medicine(medicine)
                    .quantity(item.getQuantity() == null ? 1 : item.getQuantity())
                    .dosageInstruction(item.getDosageInstruction())
                    .createdAt(OffsetDateTime.now())
                    .build();
            details.add(prescriptionDetailRepository.save(detail));
        }
        return details;
    }

    private List<PrescriptionDetail> loadDetails(MedicalRecord record) {
        return prescriptionRepository.findByMedicalRecordIdWithDetails(record.getId())
                .map(Prescription::getDetails)
                .orElseGet(Collections::emptyList);
    }

    private String buildStoragePath(MedicalRecord record) {
        String patientCode = record.getPatient() == null ? "unknown" : record.getPatient().getPatientCode();
        Integer appointmentId = record.getAppointment() == null ? 0 : record.getAppointment().getId();
        return "patients/" + safePath(patientCode) + "/appointments/" + appointmentId + "/record-" + safePath(record.getEmrCode()) + ".pdf";
    }

    private String safePath(String value) {
        return value == null ? "unknown" : value.replaceAll("[^a-zA-Z0-9._-]", "-");
    }

    private MedicalRecordResponse toResponse(MedicalRecord record, List<PrescriptionDetail> details) {
        String signedUrl = storageService.createSignedUrl(record.getPdfStoragePath());
        return MedicalRecordResponse.builder()
                .id(record.getId())
                .emrCode(record.getEmrCode())
                .appointmentId(record.getAppointment() == null ? null : record.getAppointment().getId())
                .patientId(record.getPatient() == null ? null : record.getPatient().getPatientCode())
                .patientName(record.getPatient() == null ? null : record.getPatient().getFullName())
                .doctorId(record.getDoctor() == null ? null : record.getDoctor().getId())
                .doctorName(record.getDoctor() == null ? null : record.getDoctor().getDoctorName())
                .appointmentDate(record.getAppointment() == null || record.getAppointment().getAppointmentDate() == null ? null : record.getAppointment().getAppointmentDate().toString())
                .timeSlot(record.getAppointment() == null ? null : record.getAppointment().getTimeSlot())
                .diagnosisIcd10(record.getDiagnosisIcd10() == null ? null : record.getDiagnosisIcd10().getIcd10Code())
                .diagnosisName(record.getDiagnosisIcd10() == null ? null : record.getDiagnosisIcd10().getDiseaseName())
                .mainDiagnosis(record.getMainDiagnosis())
                .symptoms(record.getSymptoms())
                .physicalExamination(record.getPhysicalExamination())
                .testResults(record.getTestResults())
                .clinicalNote(record.getClinicalNote())
                .historySummary(record.getHistorySummary())
                .careAdvice(record.getCareAdvice())
                .followUpDate(record.getFollowUpDate())
                .additionalData(record.getAdditionalData())
                .pdfUrl(StringUtils.hasText(signedUrl) ? signedUrl : record.getPdfUrl())
                .pdfStoragePath(record.getPdfStoragePath())
                .pdfGeneratedAt(record.getPdfGeneratedAt())
                .createdAt(record.getCreatedAt())
                .medicines(details == null ? List.of() : details.stream().map(this::toMedicineResponse).toList())
                .build();
    }

    private MedicalRecordResponse.MedicineResponse toMedicineResponse(PrescriptionDetail detail) {
        return MedicalRecordResponse.MedicineResponse.builder()
                .medicineId(detail.getMedicine() == null ? null : detail.getMedicine().getId())
                .medicineName(detail.getMedicine() == null ? null : detail.getMedicine().getMedicineName())
                .unit(detail.getMedicine() == null ? null : detail.getMedicine().getUnit())
                .quantity(detail.getQuantity())
                .dosageInstruction(detail.getDosageInstruction())
                .build();
    }

    private AuthCredentials findCredentials(String email) {
        return authCredentialsRepository.findByEmail(email)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.UNAUTHORIZED));
    }

    private void ensureCanRead(MedicalRecord record, AuthCredentials credentials) {
        if (credentials.getRole() == UserRole.ADMIN) {
            return;
        }
        if (credentials.getRole() == UserRole.DOCTOR
                && credentials.getDoctor() != null
                && record.getDoctor() != null
                && credentials.getDoctor().getId().equals(record.getDoctor().getId())) {
            return;
        }
        if (credentials.getRole() == UserRole.PATIENT
                && credentials.getPatient() != null
                && record.getPatient() != null
                && credentials.getPatient().getPatientCode().equals(record.getPatient().getPatientCode())) {
            return;
        }
        throw new CustomBusinessException(ErrorCodes.FORBIDDEN);
    }

    @Override
    @Transactional
    public void uploadPdf(Integer appointmentId, byte[] pdfBytes) {
        MedicalRecord record = recordRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND, "Không tìm thấy hồ sơ khám cho lịch hẹn này"));

        String storagePath = buildStoragePath(record);
        storageService.uploadPdf(storagePath, pdfBytes);

        record.setPdfStoragePath(storagePath);
        record.setPdfGeneratedAt(OffsetDateTime.now());
        record.setPdfUrl(null);
        record = recordRepository.save(record);
        patientNotificationService.notifyMedicalRecordReady(record);
    }
}
