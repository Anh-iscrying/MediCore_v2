package com.medicore.service.impl;

import com.medicore.dto.ai.PatientAiContext;
import com.medicore.dto.ai.PatientAiContextAction;
import com.medicore.dto.ai.PatientAiContextActionType;
import com.medicore.dto.ai.PatientAiRoutePlan;
import com.medicore.dto.ai.PatientAiDoctorInfo;
import com.medicore.dto.ai.PatientAiMedicineInfo;
import com.medicore.dto.ai.PatientAiPrescriptionItem;
import com.medicore.dto.ai.PatientAiRecordDetail;
import com.medicore.dto.ai.PatientAiRecordSummary;
import com.medicore.service.PatientAiContextExecutor;
import com.medicore.service.PatientAiContextService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class PatientAiContextExecutorImpl implements PatientAiContextExecutor {

    private static final int DEFAULT_RECENT_RECORDS = 3;
    private static final int MAX_RECENT_RECORDS = 5;
    private static final int DEFAULT_PRESCRIPTIONS = 20;
    private static final int MAX_PRESCRIPTIONS = 20;
    private static final int DEFAULT_MEDICINES = 5;
    private static final int MAX_MEDICINES = 5;
    private static final int DEFAULT_DOCTORS = 10;
    private static final int MAX_DOCTORS = 10;

    private final PatientAiContextService patientAiContextService;

    @Override
    @Transactional(readOnly = true)
    public PatientAiContext execute(String patientCode, PatientAiRoutePlan plan) {
        if (!StringUtils.hasText(patientCode) || plan == null || plan.getActions() == null || plan.getActions().isEmpty()) {
            return PatientAiContext.builder().build();
        }

        List<PatientAiRecordSummary> recentRecords = new ArrayList<>();
        List<PatientAiRecordDetail> recordDetails = new ArrayList<>();
        List<PatientAiPrescriptionItem> prescriptions = new ArrayList<>();
        List<PatientAiMedicineInfo> medicines = new ArrayList<>();
        List<PatientAiDoctorInfo> doctorsSeen = new ArrayList<>();

        for (PatientAiContextAction action : plan.getActions()) {
            if (action == null || action.getType() == null) {
                continue;
            }
            switch (action.getType()) {
                case RECENT_RECORDS -> {
                    if (action.getOffset() != null || action.getSortAsc() != null) {
                        List<PatientAiRecordSummary> targetRecords = patientAiContextService.getRecordsByPosition(
                                patientCode,
                                limit(action.getLimit(), DEFAULT_RECENT_RECORDS, MAX_RECENT_RECORDS),
                                action.getOffset() != null ? action.getOffset() : 0,
                                action.getSortAsc() != null ? action.getSortAsc() : false
                        );
                        // Lấy thêm danh sách hồ sơ gần đây để làm ngữ cảnh nền
                        List<PatientAiRecordSummary> fallbackRecords = patientAiContextService.getRecentRecords(
                                patientCode,
                                DEFAULT_RECENT_RECORDS
                        );
                        // Trộn 2 danh sách và loại bỏ trùng lặp theo EMR code
                        List<PatientAiRecordSummary> merged = new ArrayList<>(targetRecords);
                        java.util.Set<String> seenEmrs = new java.util.HashSet<>();
                        for (PatientAiRecordSummary r : targetRecords) {
                            if (r.getEmrCode() != null) {
                                seenEmrs.add(r.getEmrCode().toLowerCase(Locale.ROOT));
                            }
                        }
                        for (PatientAiRecordSummary r : fallbackRecords) {
                            if (r.getEmrCode() != null && seenEmrs.add(r.getEmrCode().toLowerCase(Locale.ROOT))) {
                                merged.add(r);
                            }
                        }
                        recentRecords = merged;
                    } else {
                        recentRecords = patientAiContextService.getRecentRecords(
                                patientCode,
                                limit(action.getLimit(), DEFAULT_RECENT_RECORDS, MAX_RECENT_RECORDS)
                        );
                    }
                }
                case RECORD_DETAIL -> {
                    String emrCode = clean(action.getEmrCode(), 64);
                    if (StringUtils.hasText(emrCode)) {
                        patientAiContextService.getRecordDetail(patientCode, emrCode).ifPresent(recordDetails::add);
                    } else {
                        // Nếu planner chỉ định vị trí cụ thể (ví dụ offset, sortAsc)
                        List<PatientAiRecordSummary> targets;
                        if (action.getOffset() != null || action.getSortAsc() != null) {
                            targets = patientAiContextService.getRecordsByPosition(
                                    patientCode,
                                    1,
                                    action.getOffset() != null ? action.getOffset() : 0,
                                    action.getSortAsc() != null ? action.getSortAsc() : false
                            );
                        } else {
                            targets = patientAiContextService.getRecentRecords(patientCode, 1);
                        }
                        for (PatientAiRecordSummary summary : targets) {
                            if (StringUtils.hasText(summary.getEmrCode())) {
                                patientAiContextService.getRecordDetail(patientCode, summary.getEmrCode())
                                        .ifPresent(recordDetails::add);
                            }
                        }
                    }
                }
                case PRESCRIPTIONS -> {
                    String emrCode = clean(action.getEmrCode(), 64);
                    // Truyền emrCode (có thể null) — getPrescriptions đã hỗ trợ cả 2 trường hợp
                    prescriptions = patientAiContextService.getPrescriptions(
                            patientCode,
                            emrCode,
                            limit(action.getLimit(), DEFAULT_PRESCRIPTIONS, MAX_PRESCRIPTIONS)
                    );
                }
                case MEDICINE_SEARCH -> {
                    String keyword = clean(action.getKeyword(), 80);
                    if (StringUtils.hasText(keyword) && keyword.length() >= 2) {
                        medicines = patientAiContextService.searchMedicines(
                                keyword,
                                limit(action.getLimit(), DEFAULT_MEDICINES, MAX_MEDICINES)
                        );
                    }
                }
                case DOCTORS_SEEN -> doctorsSeen = patientAiContextService.getDoctorsSeen(
                        patientCode,
                        limit(action.getLimit(), DEFAULT_DOCTORS, MAX_DOCTORS)
                );
                case DOCTORS_SEARCH -> {
                    String keyword = clean(action.getKeyword(), 80);
                    List<PatientAiDoctorInfo> searched = patientAiContextService.searchDoctors(
                            keyword,
                            limit(action.getLimit(), DEFAULT_DOCTORS, MAX_DOCTORS)
                    );
                    List<PatientAiDoctorInfo> merged = new ArrayList<>(doctorsSeen);
                    java.util.Set<String> seenCodes = new java.util.HashSet<>();
                    for (PatientAiDoctorInfo d : doctorsSeen) {
                        if (d.getDoctorCode() != null) {
                            seenCodes.add(d.getDoctorCode().toLowerCase(Locale.ROOT));
                        }
                    }
                    for (PatientAiDoctorInfo d : searched) {
                        if (d.getDoctorCode() != null && seenCodes.add(d.getDoctorCode().toLowerCase(Locale.ROOT))) {
                            merged.add(d);
                        }
                    }
                    doctorsSeen = merged;
                }
                default -> {
                }
            }
        }

        return PatientAiContext.builder()
                .recentRecords(recentRecords)
                .recordDetails(recordDetails)
                .prescriptions(prescriptions)
                .medicines(medicines)
                .doctorsSeen(doctorsSeen)
                .build();
    }

    private int limit(Integer value, int fallback, int max) {
        int effective = value == null ? fallback : value;
        return Math.max(1, Math.min(max, effective));
    }

    private String clean(String value, int maxLength) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.length() <= maxLength ? trimmed : trimmed.substring(0, maxLength);
    }
}
