package com.medicore.service.ai;

import com.medicore.common.constants.AppointmentStatus;
import com.medicore.dto.ai.DoctorAiAppointmentSummary;
import com.medicore.dto.ai.DoctorAiPatientProfile;
import com.medicore.dto.ai.DoctorAiPrescriptionItem;
import com.medicore.dto.ai.DoctorAiVisitDetail;
import com.medicore.dto.ai.DoctorAiVisitSummary;
import com.medicore.entity.catalog.Disease;
import com.medicore.entity.catalog.Medicine;
import com.medicore.entity.clinical.Appointment;
import com.medicore.entity.clinical.MedicalRecord;
import com.medicore.entity.clinical.PrescriptionDetail;
import com.medicore.entity.user.Doctor;
import com.medicore.entity.user.Patient;
import com.medicore.repository.clinical.AppointmentRepository;
import com.medicore.repository.clinical.MedicalRecordRepository;
import com.medicore.repository.clinical.PrescriptionDetailRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DoctorAiContextServiceImpl implements DoctorAiContextService {

    private static final int MAX_RECORDS = 8;
    private static final int MAX_PRESCRIPTION_ROWS = 30;
    private static final int MAX_APPOINTMENTS = 20;
    private static final int SYMPTOMS_TEXT_LIMIT = 500;
    private static final int LONG_TEXT_LIMIT = 1000;

    private final MedicalRecordRepository medicalRecordRepository;
    private final PrescriptionDetailRepository prescriptionDetailRepository;
    private final AppointmentRepository appointmentRepository;

    @Override
    public DoctorAiPatientProfile getPatientProfile(Patient patient) {
        if (patient == null) {
            return null;
        }
        Integer age = null;
        if (patient.getDob() != null) {
            age = java.time.Period.between(patient.getDob(), java.time.LocalDate.now()).getYears();
        }
        return DoctorAiPatientProfile.builder()
                .fullName(patient.getFullName())
                .dob(patient.getDob())
                .age(age)
                .gender(patient.getGender())
                .build();
    }

    @Override
    public DoctorAiAppointmentSummary getAppointmentSummary(Appointment appointment) {
        if (appointment == null) {
            return null;
        }
        Doctor doc = appointment.getDoctor();
        return DoctorAiAppointmentSummary.builder()
                .appointmentDate(appointment.getAppointmentDate())
                .timeSlot(appointment.getTimeSlot())
                .status(appointment.getStatus())
                .symptomsInitial(truncate(appointment.getSymptomsInitial(), SYMPTOMS_TEXT_LIMIT))
                .doctorName(doc != null ? doc.getDoctorName() : null)
                .specialtyName(doc != null && doc.getSpecialty() != null ? doc.getSpecialty().getSpecialtyName() : null)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorAiAppointmentSummary> getAppointmentHistory(Integer doctorId, String patientCode, int limit) {
        int pageSize = clamp(limit, 1, MAX_APPOINTMENTS);
        return appointmentRepository.findAllRecentDoctorPatientAppointments(doctorId, patientCode, PageRequest.of(0, pageSize)).stream()
                .map(this::getAppointmentSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorAiVisitSummary> getRecentVisits(String patientCode, int limit) {
        int pageSize = clamp(limit, 1, MAX_RECORDS);
        return medicalRecordRepository.findRecentByPatientCode(patientCode, PageRequest.of(0, pageSize)).stream()
                .map(this::toVisitSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorAiVisitSummary> getVisitsByPosition(String patientCode, int limit, int offset, boolean ascending) {
        Sort sort = ascending 
                ? Sort.by(Sort.Direction.ASC, "createdAt")
                : Sort.by(Sort.Direction.DESC, "createdAt");
        int pageSize = clamp(limit, 1, MAX_RECORDS);
        int pageOffset = Math.max(0, offset);
        // Query page 0 với size = offset + limit, rồi Java stream skip/limit
        int fetchSize = Math.min(pageOffset + pageSize, MAX_RECORDS + pageOffset);
        return medicalRecordRepository.findPagedByPatientCode(patientCode, PageRequest.of(0, fetchSize, sort)).stream()
                .skip(pageOffset)
                .limit(pageSize)
                .map(this::toVisitSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<DoctorAiVisitDetail> getVisitDetail(String patientCode, String emrCode) {
        if (!StringUtils.hasText(emrCode)) {
            return Optional.empty();
        }
        return medicalRecordRepository.findByPatientCodeAndEmrCode(patientCode, emrCode.trim())
                .map(this::toVisitDetail);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorAiPrescriptionItem> getPrescriptions(String patientCode, String emrCode, int limit) {
        int pageSize = clamp(limit, 1, MAX_PRESCRIPTION_ROWS);
        List<PrescriptionDetail> details = StringUtils.hasText(emrCode)
                ? prescriptionDetailRepository.findAiByPatientCodeAndEmrCode(patientCode, emrCode.trim(), PageRequest.of(0, pageSize))
                : prescriptionDetailRepository.findAiByPatientCode(patientCode, PageRequest.of(0, pageSize));

        return details.stream()
                .map(this::toPrescriptionItem)
                .toList();
    }

    private DoctorAiVisitSummary toVisitSummary(MedicalRecord record) {
        Doctor doc = record.getDoctor();
        Disease diagnosis = record.getDiagnosisIcd10();
        return DoctorAiVisitSummary.builder()
                .emrCode(record.getEmrCode())
                .createdAt(record.getCreatedAt())
                .doctorName(doc != null ? doc.getDoctorName() : null)
                .specialtyName(doc != null && doc.getSpecialty() != null ? doc.getSpecialty().getSpecialtyName() : null)
                .diagnosisIcd10(diagnosis != null ? diagnosis.getIcd10Code() : null)
                .diagnosisName(diagnosis != null ? diagnosis.getDiseaseName() : null)
                .mainDiagnosis(truncate(record.getMainDiagnosis(), LONG_TEXT_LIMIT))
                .symptoms(truncate(record.getSymptoms(), SYMPTOMS_TEXT_LIMIT))
                .historySummary(truncate(record.getHistorySummary(), LONG_TEXT_LIMIT))
                .careAdvice(truncate(record.getCareAdvice(), LONG_TEXT_LIMIT))
                .followUpDate(record.getFollowUpDate())
                .build();
    }

    private DoctorAiVisitDetail toVisitDetail(MedicalRecord record) {
        Doctor doc = record.getDoctor();
        Disease diagnosis = record.getDiagnosisIcd10();
        return DoctorAiVisitDetail.builder()
                .emrCode(record.getEmrCode())
                .createdAt(record.getCreatedAt())
                .doctorName(doc != null ? doc.getDoctorName() : null)
                .specialtyName(doc != null && doc.getSpecialty() != null ? doc.getSpecialty().getSpecialtyName() : null)
                .diagnosisIcd10(diagnosis != null ? diagnosis.getIcd10Code() : null)
                .diagnosisName(diagnosis != null ? diagnosis.getDiseaseName() : null)
                .mainDiagnosis(truncate(record.getMainDiagnosis(), LONG_TEXT_LIMIT))
                .symptoms(truncate(record.getSymptoms(), SYMPTOMS_TEXT_LIMIT))
                .historySummary(truncate(record.getHistorySummary(), LONG_TEXT_LIMIT))
                .careAdvice(truncate(record.getCareAdvice(), LONG_TEXT_LIMIT))
                .followUpDate(record.getFollowUpDate())
                .physicalExamination(truncate(record.getPhysicalExamination(), LONG_TEXT_LIMIT))
                .testResults(truncate(record.getTestResults(), LONG_TEXT_LIMIT))
                .clinicalNote(truncate(record.getClinicalNote(), LONG_TEXT_LIMIT))
                .build();
    }

    private DoctorAiPrescriptionItem toPrescriptionItem(PrescriptionDetail detail) {
        Medicine med = detail.getMedicine();
        MedicalRecord record = detail.getPrescription() != null ? detail.getPrescription().getMedicalRecord() : null;
        return DoctorAiPrescriptionItem.builder()
                .emrCode(record != null ? record.getEmrCode() : null)
                .visitCreatedAt(record != null ? record.getCreatedAt() : null)
                .prescribedAt(detail.getPrescription() != null ? detail.getPrescription().getCreatedAt() : null)
                .medicineName(med != null ? med.getMedicineName() : null)
                .unit(med != null ? med.getUnit() : null)
                .quantity(detail.getQuantity())
                .dosageInstruction(truncate(detail.getDosageInstruction(), LONG_TEXT_LIMIT))
                .build();
    }

    private int clamp(int val, int min, int max) {
        return Math.max(min, Math.min(max, val <= 0 ? max : val));
    }

    private String truncate(String text, int limit) {
        if (!StringUtils.hasText(text)) {
            return "";
        }
        String trimmed = text.trim();
        return trimmed.length() <= limit ? trimmed : trimmed.substring(0, limit) + "...";
    }
}
