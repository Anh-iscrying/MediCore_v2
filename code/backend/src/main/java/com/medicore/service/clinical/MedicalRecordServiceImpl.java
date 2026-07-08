package com.medicore.service.clinical;

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
import com.medicore.repository.auth.AuthCredentialsRepository;
import com.medicore.repository.clinical.AppointmentRepository;
import com.medicore.repository.clinical.DiseaseRepository;
import com.medicore.repository.clinical.MedicalRecordRepository;
import com.medicore.repository.clinical.MedicineRepository;
import com.medicore.repository.clinical.PrescriptionDetailRepository;
import com.medicore.repository.clinical.PrescriptionRepository;
import com.medicore.service.system.IdGeneratorService;
import com.medicore.service.system.PatientNotificationService;
import com.medicore.service.system.SupabaseStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Slf4j
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

        MedicalRecord recordToSave = recordRepository.findByAppointmentId(appointment.getId())
                .orElseGet(() -> MedicalRecord.builder()
                        .emrCode(idGeneratorService.generateEmrCode())
                        .appointment(appointment)
                        .patient(appointment.getPatient())
                        .doctor(appointment.getDoctor())
                        .createdAt(OffsetDateTime.now())
                        .build());

        applyRequest(recordToSave, request);
        MedicalRecord savedRecord = recordRepository.save(recordToSave); 

        // XỬ LÝ ĐƠN THUỐC - ĐÃ SỬA BIẾN RECORD THÀNH SAVEDRECORD
        Prescription prescription = prescriptionRepository.findByMedicalRecordId(savedRecord.getId())
                .orElseGet(() -> Prescription.builder()
                        .medicalRecord(savedRecord)
                        .createdAt(OffsetDateTime.now())
                        .build());
        prescription = prescriptionRepository.save(prescription);

        // Hoàn trả số lượng thuốc cũ về kho trước khi xóa chi tiết đơn thuốc cũ
        List<PrescriptionDetail> oldDetails = prescriptionDetailRepository.findByPrescriptionId(prescription.getId());
        if (oldDetails != null) {
            for (PrescriptionDetail oldDetail : oldDetails) {
                if (oldDetail.getMedicine() != null) {
                    var medicine = oldDetail.getMedicine();
                    int qty = oldDetail.getQuantity() == null ? 0 : oldDetail.getQuantity();
                    int currentStock = medicine.getStock() == null ? 0 : medicine.getStock();
                    medicine.setStock(currentStock + qty);
                    medicineRepository.save(medicine);
                }
            }
        }

        prescriptionDetailRepository.deleteByPrescriptionId(prescription.getId());
        List<PrescriptionDetail> details = savePrescriptionDetails(prescription, request.getMedicines());

        AppointmentStatus oldStatus = appointment.getStatus();
        appointment.setStatus(AppointmentStatus.DONE);
        appointmentRepository.save(appointment);
        patientNotificationService.notifyAppointmentStatusChanged(appointment, oldStatus, AppointmentStatus.DONE, null);

        return toResponse(savedRecord, details, true);
    }

    @Override
    @Transactional(readOnly = true)
    public MedicalRecordResponse getById(Integer id) {
        MedicalRecord record = recordRepository.findById(id)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND, "Không tìm thấy hồ sơ bệnh án"));
        return toResponse(record, loadDetails(record), true);
    }

    @Override
    @Transactional(readOnly = true)
    public MedicalRecordResponse getRecordByAppointment(Integer appointmentId, String email) {
        AuthCredentials credentials = findCredentials(email);
        MedicalRecord record = recordRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND, "Không tìm thấy hồ sơ khám"));
        ensureCanRead(record, credentials);
        return toResponse(record, loadDetails(record), true);
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
                .map(record -> toResponse(record, loadDetails(record), false))
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
        record.setAdditionalData(request.getSpecialtyData() == null ? Collections.emptyMap() : request.getSpecialtyData());

        // TÌM MÃ ICD-10 CHÍNH
        String primaryIcd10 = null;
        if (request.getDiagnoses() != null && !request.getDiagnoses().isEmpty()) {
            primaryIcd10 = request.getDiagnoses().stream()
                    .filter(item -> Boolean.TRUE.equals(item.getIsPrimary()))
                    .map(MedicalRecordRequest.DiagnosisItem::getIcd10Code)
                    .findFirst()
                    .orElse(request.getDiagnoses().get(0).getIcd10Code());
        }

        if (StringUtils.hasText(primaryIcd10)) {
            final String finalCode = primaryIcd10.trim(); 
            Disease disease = diseaseRepository.findById(finalCode)
                    .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND, "Mã bệnh không tồn tại: " + finalCode));
            record.setDiagnosisIcd10(disease);
        }
    }

    private List<PrescriptionDetail> savePrescriptionDetails(Prescription prescription, List<MedicalRecordRequest.MedicineItem> medicines) {
        List<PrescriptionDetail> details = new ArrayList<>();
        if (medicines == null) return details;

        for (var item : medicines) {
            if (item.getMedicineId() == null) continue;
            var medicine = medicineRepository.findById(item.getMedicineId())
                    .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND, "Không thấy thuốc ID: " + item.getMedicineId()));
            
            // Trừ số lượng thuốc đã kê khỏi kho
            int quantityToPrescribe = item.getQuantity() == null ? 1 : item.getQuantity();
            int currentStock = medicine.getStock() == null ? 0 : medicine.getStock();
            medicine.setStock(Math.max(0, currentStock - quantityToPrescribe));
            medicineRepository.save(medicine);

            PrescriptionDetail detail = PrescriptionDetail.builder()
                    .prescription(prescription)
                    .medicine(medicine)
                    .quantity(quantityToPrescribe)
                    .dosageInstruction(item.getDosageInstruction())
                    .isFromTemplate(item.getIsFromTemplate())
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

    private MedicalRecordResponse toResponse(MedicalRecord record, List<PrescriptionDetail> details, boolean generateSignedUrl) {
        String signedUrl = generateSignedUrl ? storageService.createSignedUrl(record.getPdfStoragePath()) : null;
        return MedicalRecordResponse.builder()
                .id(record.getId())
                .emrCode(record.getEmrCode())
                .appointmentId(record.getAppointment() != null ? record.getAppointment().getId() : null)
                .patientId(record.getPatient() != null ? String.valueOf(record.getPatient().getId()) : null)
                .patientCode(record.getPatient() != null ? record.getPatient().getPatientCode() : "N/A")
                .patientName(record.getPatient() != null ? record.getPatient().getFullName() : "N/A")
                .doctorId(record.getDoctor() != null ? record.getDoctor().getId() : null)
                .doctorName(record.getDoctor() != null ? record.getDoctor().getDoctorName() : "N/A")
                .appointmentDate(record.getAppointment() != null && record.getAppointment().getAppointmentDate() != null ? record.getAppointment().getAppointmentDate().toString() : null)
                .timeSlot(record.getAppointment() != null ? record.getAppointment().getTimeSlot() : null)
                .diagnosisIcd10(record.getDiagnosisIcd10() != null ? record.getDiagnosisIcd10().getIcd10Code() : null)
                .diagnosisName(record.getDiagnosisIcd10() != null ? record.getDiagnosisIcd10().getDiseaseName() : null)
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
                .medicines(details != null ? details.stream().map(this::toMedicineResponse).toList() : List.of())
                .build();
    }

    private MedicalRecordResponse.MedicineResponse toMedicineResponse(PrescriptionDetail detail) {
        return MedicalRecordResponse.MedicineResponse.builder()
                .medicineId(detail.getMedicine() != null ? detail.getMedicine().getId() : null)
                .medicineName(detail.getMedicine() != null ? detail.getMedicine().getMedicineName() : "N/A")
                .unit(detail.getMedicine() != null ? detail.getMedicine().getUnit() : "N/A")
                .quantity(detail.getQuantity())
                .dosageInstruction(detail.getDosageInstruction())
                .build();
    }

    private AuthCredentials findCredentials(String email) {
        return authCredentialsRepository.findByEmail(email)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.UNAUTHORIZED));
    }

    private void ensureCanRead(MedicalRecord record, AuthCredentials credentials) {
        if (credentials.getRole() == UserRole.ADMIN) return;
        
        if (credentials.getRole() == UserRole.DOCTOR 
            && credentials.getDoctor() != null 
            && record.getDoctor() != null 
            && credentials.getDoctor().getId().equals(record.getDoctor().getId())) return;

        if (credentials.getRole() == UserRole.PATIENT 
            && credentials.getPatient() != null 
            && record.getPatient() != null 
            && credentials.getPatient().getPatientCode().equals(record.getPatient().getPatientCode())) return;

        throw new CustomBusinessException(ErrorCodes.FORBIDDEN);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicalRecordResponse> getDoctorMedicalRecords(String email) {
        AuthCredentials credentials = findCredentials(email);
        if (credentials.getRole() != UserRole.DOCTOR || credentials.getDoctor() == null) {
            throw new CustomBusinessException(ErrorCodes.FORBIDDEN, "Tài khoản không phải là bác sĩ");
        }
        Integer doctorId = credentials.getDoctor().getId();
        List<MedicalRecord> records = recordRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId);
        return records.stream()
                .map(record -> toResponse(record, loadDetails(record), false))
                .toList();
    }

    @Override
    @Transactional
    public void uploadPdf(Integer appointmentId, byte[] pdfBytes) {
        MedicalRecord record = recordRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND, "Không tìm thấy hồ sơ khám"));

        String storagePath = "patients/" + record.getPatient().getPatientCode() + "/appointments/" + appointmentId + "/record.pdf";
        storageService.uploadPdf(storagePath, pdfBytes);

        record.setPdfStoragePath(storagePath);
        record.setPdfGeneratedAt(OffsetDateTime.now());
        record.setPdfUrl(null);
        record = recordRepository.save(record);
        patientNotificationService.notifyMedicalRecordReady(record);
    }
}