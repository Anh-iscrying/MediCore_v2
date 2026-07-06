package com.medicore.service;

import com.medicore.dto.ai.PatientAiContext;
import com.medicore.dto.ai.PatientAiDoctorInfo;
import com.medicore.dto.ai.PatientAiMedicineInfo;
import com.medicore.dto.ai.PatientAiPrescriptionItem;
import com.medicore.dto.ai.PatientAiRecordDetail;
import com.medicore.dto.ai.PatientAiRecordSummary;
import com.medicore.entity.user.Patient;

import java.util.List;
import java.util.Optional;

public interface PatientAiContextService {
    PatientAiContext buildContextForMessage(Patient patient, String message);

    List<PatientAiRecordSummary> getRecentRecords(String patientCode, int limit);

    /** Lấy hồ sơ khám với hỗ trợ sắp xếp (ASC/DESC) và offset cho câu hỏi kiểu thứ tự */
    List<PatientAiRecordSummary> getRecordsByPosition(String patientCode, int limit, int offset, boolean ascending);

    Optional<PatientAiRecordDetail> getRecordDetail(String patientCode, String emrCode);

    List<PatientAiPrescriptionItem> getPrescriptions(String patientCode, String emrCode, int limit);

    List<PatientAiMedicineInfo> searchMedicines(String keyword, int limit);

    List<PatientAiDoctorInfo> getDoctorsSeen(String patientCode, int limit);

    List<PatientAiDoctorInfo> searchDoctors(String keyword, int limit);
}
