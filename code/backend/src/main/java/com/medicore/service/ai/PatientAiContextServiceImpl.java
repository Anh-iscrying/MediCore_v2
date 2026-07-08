package com.medicore.service.ai;

import com.medicore.dto.ai.PatientAiContext;
import com.medicore.dto.ai.PatientAiDoctorInfo;
import com.medicore.dto.ai.PatientAiMedicineInfo;
import com.medicore.dto.ai.PatientAiPrescriptionItem;
import com.medicore.dto.ai.PatientAiRecordDetail;
import com.medicore.dto.ai.PatientAiRecordSummary;
import com.medicore.entity.catalog.Disease;
import com.medicore.entity.catalog.Medicine;
import com.medicore.entity.clinical.Appointment;
import com.medicore.entity.clinical.MedicalRecord;
import com.medicore.entity.clinical.PrescriptionDetail;
import com.medicore.entity.user.Doctor;
import com.medicore.entity.user.Patient;
import com.medicore.repository.clinical.AppointmentRepository;
import com.medicore.repository.clinical.MedicalRecordRepository;
import com.medicore.repository.clinical.MedicineRepository;
import com.medicore.repository.clinical.PrescriptionDetailRepository;
import com.medicore.repository.user.DoctorRepository;
import com.medicore.repository.user.SpecialtyRepository;
import com.medicore.entity.catalog.Specialty;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class PatientAiContextServiceImpl implements PatientAiContextService {

    private static final int MAX_RECORDS = 5;
    private static final int MAX_PRESCRIPTION_ROWS = 20;
    private static final int MAX_MEDICINES = 5;
    private static final int MAX_DOCTORS = 10;
    private static final int SUMMARY_RECORDS = 3;
    private static final int SYMPTOMS_TEXT_LIMIT = 500;
    private static final int LONG_TEXT_LIMIT = 1000;
    private static final Pattern EMR_CODE_PATTERN = Pattern.compile("\\bEMR[-_A-Za-z0-9]*\\b", Pattern.CASE_INSENSITIVE);

    private final MedicalRecordRepository medicalRecordRepository;
    private final PrescriptionDetailRepository prescriptionDetailRepository;
    private final MedicineRepository medicineRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final SpecialtyRepository specialtyRepository;

    @Override
    @Transactional(readOnly = true)
    public PatientAiContext buildContextForMessage(Patient patient, String message) {
        if (patient == null || !StringUtils.hasText(patient.getPatientCode())) {
            return PatientAiContext.builder().build();
        }

        String patientCode = patient.getPatientCode();
        Intent intent = detectIntent(message);
        String emrCode = extractEmrCode(message).orElse(null);
        PatientAiContext.PatientAiContextBuilder builder = PatientAiContext.builder();

        if (intent.needsRecords()) {
            builder.recentRecords(getRecentRecords(patientCode, intent.detail() ? MAX_RECORDS : SUMMARY_RECORDS));
            if (StringUtils.hasText(emrCode)) {
                getRecordDetail(patientCode, emrCode).ifPresent(detail -> builder.recordDetails(List.of(detail)));
            } else if (intent.detail()) {
                List<PatientAiRecordDetail> details = getRecentRecords(patientCode, 1).stream()
                        .map(PatientAiRecordSummary::getEmrCode)
                        .filter(StringUtils::hasText)
                        .map(code -> getRecordDetail(patientCode, code))
                        .flatMap(Optional::stream)
                        .toList();
                builder.recordDetails(details);
            }
        }

        if (intent.needsPrescriptions()) {
            builder.prescriptions(getPrescriptions(patientCode, emrCode, MAX_PRESCRIPTION_ROWS));
        }

        if (intent.needsDoctors()) {
            builder.doctorsSeen(getDoctorsSeen(patientCode, MAX_DOCTORS));
        }

        if (intent.needsMedicineSearch()) {
            extractMedicineKeyword(message).ifPresent(keyword -> builder.medicines(searchMedicines(keyword, MAX_MEDICINES)));
        }

        if (!intent.hasPersonalDataIntent()) {
            builder.recentRecords(getRecentRecords(patientCode, SUMMARY_RECORDS));
        }

        return builder.build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientAiRecordSummary> getRecentRecords(String patientCode, int limit) {
        return medicalRecordRepository.findRecentByPatientCode(patientCode, PageRequest.of(0, clamp(limit, 1, MAX_RECORDS))).stream()
                .map(this::toRecordSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientAiRecordSummary> getRecordsByPosition(String patientCode, int limit, int offset, boolean ascending) {
        org.springframework.data.domain.Sort sort = ascending 
                ? org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.ASC, "createdAt")
                : org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt");
        
        int pageSize = clamp(limit, 1, MAX_RECORDS);
        int pageOffset = Math.max(0, offset);
        
        // Query page 0 với size = offset + limit, rồi Java stream skip/limit
        // để tránh bug: PageRequest.of(offset, size) coi offset là page index khi size > 1
        int fetchSize = Math.min(pageOffset + pageSize, MAX_RECORDS + pageOffset);
        return medicalRecordRepository.findPagedByPatientCode(patientCode, PageRequest.of(0, fetchSize, sort)).stream()
                .skip(pageOffset)
                .limit(pageSize)
                .map(this::toRecordSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PatientAiRecordDetail> getRecordDetail(String patientCode, String emrCode) {
        if (!StringUtils.hasText(emrCode)) {
            return Optional.empty();
        }
        return medicalRecordRepository.findByPatientCodeAndEmrCode(patientCode, emrCode.trim())
                .map(this::toRecordDetail);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientAiPrescriptionItem> getPrescriptions(String patientCode, String emrCode, int limit) {
        int pageSize = clamp(limit, 1, MAX_PRESCRIPTION_ROWS);
        List<PrescriptionDetail> details = StringUtils.hasText(emrCode)
                ? prescriptionDetailRepository.findAiByPatientCodeAndEmrCode(patientCode, emrCode.trim(), PageRequest.of(0, pageSize))
                : prescriptionDetailRepository.findAiByPatientCode(patientCode, PageRequest.of(0, pageSize));

        return details.stream()
                .map(this::toPrescriptionItem)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientAiMedicineInfo> searchMedicines(String keyword, int limit) {
        if (!StringUtils.hasText(keyword)) {
            return List.of();
        }
        return medicineRepository.searchAiMedicines(keyword.trim(), PageRequest.of(0, clamp(limit, 1, MAX_MEDICINES))).stream()
                .map(this::toMedicineInfo)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientAiDoctorInfo> getDoctorsSeen(String patientCode, int limit) {
        List<Appointment> appointments = appointmentRepository.findAiDoctorsSeenByPatientCode(patientCode, PageRequest.of(0, clamp(limit * 3, 1, MAX_DOCTORS * 3)));
        Map<Integer, PatientAiDoctorInfo> doctors = new LinkedHashMap<>();
        for (Appointment appointment : appointments) {
            Doctor doctor = appointment.getDoctor();
            if (doctor == null || doctor.getId() == null || doctors.containsKey(doctor.getId())) {
                continue;
            }
            doctors.put(doctor.getId(), toDoctorInfo(doctor));
            if (doctors.size() >= clamp(limit, 1, MAX_DOCTORS)) {
                break;
            }
        }
        return new ArrayList<>(doctors.values());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientAiDoctorInfo> searchDoctors(String keyword, int limit) {
        int pageSize = clamp(limit, 1, MAX_DOCTORS);
        List<Doctor> list = java.util.Collections.emptyList();
        if (StringUtils.hasText(keyword)) {
            list = doctorRepository.searchActiveDoctors(keyword.trim(), PageRequest.of(0, pageSize));
        }
        
        // Fallback: nếu tìm kiếm theo từ khóa không ra kết quả nào, lấy tất cả bác sĩ hoạt động để LLM tự gợi ý chuyên khoa phù hợp
        if (list.isEmpty()) {
            list = doctorRepository.findAllActiveDoctors(PageRequest.of(0, pageSize));
        }
        
        return list.stream()
                .map(this::toDoctorInfo)
                .toList();
    }

    private PatientAiRecordSummary toRecordSummary(MedicalRecord record) {
        Doctor doctor = record.getDoctor();
        Disease diagnosis = record.getDiagnosisIcd10();
        return PatientAiRecordSummary.builder()
                .emrCode(record.getEmrCode())
                .createdAt(record.getCreatedAt())
                .doctorName(doctor == null ? null : doctor.getDoctorName())
                .specialtyName(doctor == null || doctor.getSpecialty() == null ? null : doctor.getSpecialty().getSpecialtyName())
                .diagnosisIcd10(diagnosis == null ? null : diagnosis.getIcd10Code())
                .diagnosisName(diagnosis == null ? null : diagnosis.getDiseaseName())
                .mainDiagnosis(truncate(record.getMainDiagnosis(), LONG_TEXT_LIMIT))
                .symptoms(truncate(record.getSymptoms(), SYMPTOMS_TEXT_LIMIT))
                .careAdvice(truncate(record.getCareAdvice(), LONG_TEXT_LIMIT))
                .followUpDate(record.getFollowUpDate())
                .build();
    }

    private PatientAiRecordDetail toRecordDetail(MedicalRecord record) {
        Doctor doctor = record.getDoctor();
        Disease diagnosis = record.getDiagnosisIcd10();
        return PatientAiRecordDetail.builder()
                .emrCode(record.getEmrCode())
                .createdAt(record.getCreatedAt())
                .doctorName(doctor == null ? null : doctor.getDoctorName())
                .specialtyName(doctor == null || doctor.getSpecialty() == null ? null : doctor.getSpecialty().getSpecialtyName())
                .diagnosisIcd10(diagnosis == null ? null : diagnosis.getIcd10Code())
                .diagnosisName(diagnosis == null ? null : diagnosis.getDiseaseName())
                .mainDiagnosis(truncate(record.getMainDiagnosis(), LONG_TEXT_LIMIT))
                .symptoms(truncate(record.getSymptoms(), SYMPTOMS_TEXT_LIMIT))
                .physicalExamination(truncate(record.getPhysicalExamination(), LONG_TEXT_LIMIT))
                .testResults(truncate(record.getTestResults(), LONG_TEXT_LIMIT))
                .clinicalNote(truncate(record.getClinicalNote(), LONG_TEXT_LIMIT))
                .historySummary(truncate(record.getHistorySummary(), LONG_TEXT_LIMIT))
                .careAdvice(truncate(record.getCareAdvice(), LONG_TEXT_LIMIT))
                .followUpDate(record.getFollowUpDate())
                .build();
    }

    private PatientAiPrescriptionItem toPrescriptionItem(PrescriptionDetail detail) {
        Medicine medicine = detail.getMedicine();
        MedicalRecord record = detail.getPrescription() == null ? null : detail.getPrescription().getMedicalRecord();
        return PatientAiPrescriptionItem.builder()
                .emrCode(record == null ? null : record.getEmrCode())
                .prescribedAt(detail.getPrescription() == null ? null : detail.getPrescription().getCreatedAt())
                .medicineName(medicine == null ? null : medicine.getMedicineName())
                .unit(medicine == null ? null : medicine.getUnit())
                .category(medicine == null ? null : medicine.getCategory())
                .manufacturer(medicine == null ? null : medicine.getManufacturer())
                .quantity(detail.getQuantity())
                .dosageInstruction(truncate(detail.getDosageInstruction(), LONG_TEXT_LIMIT))
                .build();
    }

    private PatientAiMedicineInfo toMedicineInfo(Medicine medicine) {
        return PatientAiMedicineInfo.builder()
                .medicineName(medicine.getMedicineName())
                .unit(medicine.getUnit())
                .category(medicine.getCategory())
                .manufacturer(medicine.getManufacturer())
                .build();
    }

    private PatientAiDoctorInfo toDoctorInfo(Doctor doctor) {
        return PatientAiDoctorInfo.builder()
                .doctorName(doctor.getDoctorName())
                .doctorCode(doctor.getDoctorCode())
                .specialtyName(doctor.getSpecialty() == null ? null : doctor.getSpecialty().getSpecialtyName())
                .degree(doctor.getDegree())
                .experienceYears(doctor.getExperienceYears())
                .achievements(doctor.getAchievements())
                .build();
    }

    private Intent detectIntent(String message) {
        String text = normalize(message);
        boolean records = containsAny(text, "ho so", "lan kham", "chan doan", "xet nghiem", "loi dan", "tai kham", "trieu chung", "dau", "emr");
        boolean detail = containsAny(text, "chi tiet", "loi dan", "xet nghiem", "chan doan", "tai kham", "emr");
        boolean prescriptions = containsAny(text, "thuoc", "don", "lieu", "uong", "ke don", "toa");
        boolean doctors = containsAny(text, "bac si", "chuyen khoa", "khoa nao", "da kham", "dat lich");
        boolean medicineSearch = containsAny(text, "thuoc");
        return new Intent(records, detail, prescriptions, doctors, medicineSearch);
    }

    private Optional<String> extractEmrCode(String message) {
        if (!StringUtils.hasText(message)) {
            return Optional.empty();
        }
        Matcher matcher = EMR_CODE_PATTERN.matcher(message);
        return matcher.find() ? Optional.of(matcher.group().trim()) : Optional.empty();
    }

    private Optional<String> extractMedicineKeyword(String message) {
        if (!StringUtils.hasText(message)) {
            return Optional.empty();
        }
        String normalized = message.trim();
        int index = normalize(normalized).indexOf("thuoc");
        if (index < 0) {
            return Optional.empty();
        }
        String keyword = normalized.substring(Math.min(normalized.length(), index + "thuoc".length())).replaceAll("[?:,.;]", " ").trim();
        if (!StringUtils.hasText(keyword) || keyword.length() < 2) {
            return Optional.empty();
        }
        return Optional.of(keyword.length() > 60 ? keyword.substring(0, 60) : keyword);
    }

    private boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private String normalize(String value) {
        if (value == null) {
            return "";
        }
        return java.text.Normalizer.normalize(value, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT);
    }

    private int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }

    private String truncate(String value, int maxLength) {
        if (!StringUtils.hasText(value)) {
            return value;
        }
        String trimmed = value.trim();
        if (trimmed.length() <= maxLength) {
            return trimmed;
        }
        return trimmed.substring(0, maxLength) + "...";
    }

    private record Intent(boolean records, boolean detail, boolean prescriptions, boolean doctors, boolean medicineSearch) {
        boolean needsRecords() {
            return records;
        }

        boolean needsPrescriptions() {
            return prescriptions;
        }

        boolean needsDoctors() {
            return doctors;
        }

        boolean needsMedicineSearch() {
            return medicineSearch;
        }

        boolean hasPersonalDataIntent() {
            return records || prescriptions || doctors;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getClinicSpecialties() {
        return specialtyRepository.findAll().stream()
                .map(Specialty::getSpecialtyName)
                .filter(StringUtils::hasText)
                .toList();
    }
}
