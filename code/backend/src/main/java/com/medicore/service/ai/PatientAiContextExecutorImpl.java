package com.medicore.service.ai;

import com.medicore.dto.ai.AiContextRetrievalAttempt;
import com.medicore.dto.ai.PatientAiContext;
import com.medicore.dto.ai.PatientAiContextAction;
import com.medicore.dto.ai.PatientAiContextActionType;
import com.medicore.dto.ai.PatientAiRoutePlan;
import com.medicore.dto.ai.PatientAiDoctorInfo;
import com.medicore.dto.ai.PatientAiMedicineInfo;
import com.medicore.dto.ai.PatientAiPrescriptionItem;
import com.medicore.dto.ai.PatientAiRecordDetail;
import com.medicore.dto.ai.PatientAiRecordSummary;
import com.medicore.dto.ai.RetrievalStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

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
        List<String> clinicSpecialties = new ArrayList<>();
        List<AiContextRetrievalAttempt> retrievalAttempts = new ArrayList<>();

        for (PatientAiContextAction action : plan.getActions()) {
            if (action == null || action.getType() == null) {
                continue;
            }
            boolean isStrict = Boolean.TRUE.equals(action.getStrict());
            boolean hasSelector = action.getEmrCode() != null || action.getOffset() != null
                    || action.getSortAsc() != null || action.getDateFrom() != null || action.getDateTo() != null;

            switch (action.getType()) {
                case RECENT_RECORDS -> {
                    if (action.getOffset() != null || action.getSortAsc() != null) {
                        List<PatientAiRecordSummary> targetRecords = patientAiContextService.getRecordsByPosition(
                                patientCode,
                                limit(action.getLimit(), DEFAULT_RECENT_RECORDS, MAX_RECENT_RECORDS),
                                action.getOffset() != null ? action.getOffset() : 0,
                                action.getSortAsc() != null ? action.getSortAsc() : false
                        );

                        if (isStrict || hasSelector) {
                            // Strict mode: chỉ trả target, KHÔNG merge fallback
                            recentRecords = targetRecords;
                            retrievalAttempts.add(buildAttempt(action, targetRecords.size()));
                        } else {
                            // Broad mode: merge target + fallback (hành vi cũ)
                            List<PatientAiRecordSummary> fallbackRecords = patientAiContextService.getRecentRecords(
                                    patientCode,
                                    DEFAULT_RECENT_RECORDS
                            );
                            List<PatientAiRecordSummary> merged = new ArrayList<>(targetRecords);
                            Set<String> seenEmrs = new HashSet<>();
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
                            retrievalAttempts.add(buildAttempt(action, targetRecords.size(),
                                    targetRecords.isEmpty() ? RetrievalStatus.FALLBACK_USED : RetrievalStatus.FOUND,
                                    targetRecords.isEmpty() ? "Target rỗng, đã thêm recent records làm nền" : null));
                        }
                    } else {
                        recentRecords = patientAiContextService.getRecentRecords(
                                patientCode,
                                limit(action.getLimit(), DEFAULT_RECENT_RECORDS, MAX_RECENT_RECORDS)
                        );
                        retrievalAttempts.add(buildAttempt(action, recentRecords.size()));
                    }
                }
                case RECORD_DETAIL -> {
                    String emrCode = clean(action.getEmrCode(), 64);
                    if (StringUtils.hasText(emrCode)) {
                        var detail = patientAiContextService.getRecordDetail(patientCode, emrCode);
                        detail.ifPresent(recordDetails::add);
                        retrievalAttempts.add(buildAttempt(action, detail.isPresent() ? 1 : 0));
                    } else {
                        // Planner chỉ định vị trí cụ thể (offset, sortAsc)
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
                        int detailCount = 0;
                        for (PatientAiRecordSummary summary : targets) {
                            if (StringUtils.hasText(summary.getEmrCode())) {
                                var detail = patientAiContextService.getRecordDetail(patientCode, summary.getEmrCode());
                                detail.ifPresent(d -> {
                                    recordDetails.add(d);
                                });
                                if (detail.isPresent()) {
                                    detailCount++;
                                }
                            }
                        }
                        retrievalAttempts.add(buildAttempt(action, detailCount));
                    }
                }
                case PRESCRIPTIONS -> {
                    String emrCode = clean(action.getEmrCode(), 64);

                    // Nếu prescription liên kết lần khám cụ thể (qua offset) nhưng không có emrCode,
                    // resolve emrCode từ position trước
                    if (!StringUtils.hasText(emrCode) && (action.getOffset() != null || action.getSortAsc() != null)) {
                        List<PatientAiRecordSummary> targets = patientAiContextService.getRecordsByPosition(
                                patientCode,
                                1,
                                action.getOffset() != null ? action.getOffset() : 0,
                                action.getSortAsc() != null ? action.getSortAsc() : false
                        );
                        if (!targets.isEmpty() && StringUtils.hasText(targets.get(0).getEmrCode())) {
                            emrCode = targets.get(0).getEmrCode();
                        }
                    }

                    prescriptions = patientAiContextService.getPrescriptions(
                            patientCode,
                            emrCode,
                            limit(action.getLimit(), DEFAULT_PRESCRIPTIONS, MAX_PRESCRIPTIONS)
                    );
                    retrievalAttempts.add(buildAttempt(action, prescriptions.size()));
                }
                case MEDICINE_SEARCH -> {
                    String keyword = clean(action.getKeyword(), 80);
                    if (StringUtils.hasText(keyword) && keyword.length() >= 2) {
                        medicines = patientAiContextService.searchMedicines(
                                keyword,
                                limit(action.getLimit(), DEFAULT_MEDICINES, MAX_MEDICINES)
                        );
                        retrievalAttempts.add(buildAttempt(action, medicines.size()));
                    } else {
                        retrievalAttempts.add(AiContextRetrievalAttempt.builder()
                                .actionType(action.getType().name())
                                .targetText(action.getTargetText())
                                .keyword(action.getKeyword())
                                .status(RetrievalStatus.SKIPPED_MISSING_INPUT)
                                .resultCount(0)
                                .note("Keyword quá ngắn hoặc rỗng")
                                .build());
                    }
                }
                case DOCTORS_SEEN -> {
                    doctorsSeen = patientAiContextService.getDoctorsSeen(
                            patientCode,
                            limit(action.getLimit(), DEFAULT_DOCTORS, MAX_DOCTORS)
                    );
                    clinicSpecialties = patientAiContextService.getClinicSpecialties();
                    retrievalAttempts.add(buildAttempt(action, doctorsSeen.size()));
                }
                case DOCTORS_SEARCH -> {
                    String keyword = clean(action.getKeyword(), 80);
                    List<PatientAiDoctorInfo> searched = patientAiContextService.searchDoctors(
                            keyword,
                            limit(action.getLimit(), DEFAULT_DOCTORS, MAX_DOCTORS)
                    );
                    List<PatientAiDoctorInfo> merged = new ArrayList<>(doctorsSeen);
                    Set<String> seenCodes = new HashSet<>();
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
                    clinicSpecialties = patientAiContextService.getClinicSpecialties();
                    retrievalAttempts.add(buildAttempt(action, searched.size()));
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
                .clinicSpecialties(clinicSpecialties)
                .retrievalAttempts(retrievalAttempts)
                .build();
    }

    private AiContextRetrievalAttempt buildAttempt(PatientAiContextAction action, int resultCount) {
        RetrievalStatus status = resultCount > 0 ? RetrievalStatus.FOUND : RetrievalStatus.NOT_FOUND;
        return buildAttempt(action, resultCount, status, null);
    }

    private AiContextRetrievalAttempt buildAttempt(PatientAiContextAction action, int resultCount,
            RetrievalStatus status, String note) {
        return AiContextRetrievalAttempt.builder()
                .actionType(action.getType().name())
                .targetText(action.getTargetText())
                .emrCode(action.getEmrCode())
                .keyword(action.getKeyword())
                .limit(action.getLimit())
                .offset(action.getOffset())
                .sortAsc(action.getSortAsc())
                .dateFrom(action.getDateFrom())
                .dateTo(action.getDateTo())
                .status(status)
                .resultCount(resultCount)
                .note(note)
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
