package com.medicore.service.impl;

import com.medicore.dto.ai.AiContextRetrievalAttempt;
import com.medicore.dto.ai.DoctorAiAuthorizedTarget;
import com.medicore.dto.ai.DoctorAiAppointmentSummary;
import com.medicore.dto.ai.DoctorAiContext;
import com.medicore.dto.ai.DoctorAiContextAction;
import com.medicore.dto.ai.DoctorAiRoutePlan;
import com.medicore.dto.ai.DoctorAiPrescriptionItem;
import com.medicore.dto.ai.DoctorAiVisitDetail;
import com.medicore.dto.ai.DoctorAiVisitSummary;
import com.medicore.dto.ai.RetrievalStatus;
import com.medicore.service.DoctorAiContextExecutor;
import com.medicore.service.DoctorAiContextService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class DoctorAiContextExecutorImpl implements DoctorAiContextExecutor {

    private static final int DEFAULT_VISITS = 3;
    private static final int MAX_VISITS = 8;
    private static final int DEFAULT_PRESCRIPTIONS = 20;
    private static final int MAX_PRESCRIPTIONS = 30;
    private static final int DEFAULT_APPOINTMENTS = 5;
    private static final int MAX_APPOINTMENTS = 20;

    private final DoctorAiContextService doctorAiContextService;

    @Override
    @Transactional(readOnly = true)
    public DoctorAiContext execute(DoctorAiAuthorizedTarget target, DoctorAiRoutePlan plan) {
        if (target == null || target.getPatient() == null) {
            return DoctorAiContext.builder().build();
        }

        String patientCode = target.getPatient().getPatientCode();
        Integer doctorId = target.getDoctor() != null ? target.getDoctor().getId() : null;

        // Auto-include profile and current appointment (if context contains appointment)
        var profile = doctorAiContextService.getPatientProfile(target.getPatient());
        var currentApp = target.getAppointment() != null 
                ? doctorAiContextService.getAppointmentSummary(target.getAppointment()) 
                : null;

        List<DoctorAiAppointmentSummary> appHistory = new ArrayList<>();
        List<DoctorAiVisitSummary> recentVisits = new ArrayList<>();
        List<DoctorAiVisitDetail> visitDetails = new ArrayList<>();
        List<DoctorAiPrescriptionItem> prescriptions = new ArrayList<>();
        List<AiContextRetrievalAttempt> retrievalAttempts = new ArrayList<>();

        if (plan != null && plan.getActions() != null) {
            for (DoctorAiContextAction action : plan.getActions()) {
                if (action == null || action.getType() == null) {
                    continue;
                }
                boolean isStrict = Boolean.TRUE.equals(action.getStrict());
                boolean hasSelector = action.getEmrCode() != null || action.getOffset() != null
                        || action.getSortAsc() != null || action.getDateFrom() != null || action.getDateTo() != null;

                switch (action.getType()) {
                    case RECENT_VISITS -> {
                        if (action.getOffset() != null || action.getSortAsc() != null) {
                            List<DoctorAiVisitSummary> targetVisits = doctorAiContextService.getVisitsByPosition(
                                    patientCode,
                                    limit(action.getLimit(), DEFAULT_VISITS, MAX_VISITS),
                                    action.getOffset() != null ? action.getOffset() : 0,
                                    action.getSortAsc() != null ? action.getSortAsc() : false
                            );

                            if (isStrict || hasSelector) {
                                // Strict mode: chỉ trả target, KHÔNG merge fallback
                                recentVisits = targetVisits;
                                retrievalAttempts.add(buildAttempt(action, targetVisits.size()));
                            } else {
                                // Broad mode: merge target + fallback
                                List<DoctorAiVisitSummary> fallbackVisits = doctorAiContextService.getRecentVisits(
                                        patientCode,
                                        DEFAULT_VISITS
                                );
                                List<DoctorAiVisitSummary> merged = new ArrayList<>(targetVisits);
                                Set<String> seenEmrs = new HashSet<>();
                                for (DoctorAiVisitSummary v : targetVisits) {
                                    if (v.getEmrCode() != null) {
                                        seenEmrs.add(v.getEmrCode().toLowerCase(Locale.ROOT));
                                    }
                                }
                                for (DoctorAiVisitSummary v : fallbackVisits) {
                                    if (v.getEmrCode() != null && seenEmrs.add(v.getEmrCode().toLowerCase(Locale.ROOT))) {
                                        merged.add(v);
                                    }
                                }
                                recentVisits = merged;
                                retrievalAttempts.add(buildAttempt(action, targetVisits.size(),
                                        targetVisits.isEmpty() ? RetrievalStatus.FALLBACK_USED : RetrievalStatus.FOUND,
                                        targetVisits.isEmpty() ? "Target rỗng, đã thêm recent visits làm nền" : null));
                            }
                        } else {
                            recentVisits = doctorAiContextService.getRecentVisits(
                                    patientCode,
                                    limit(action.getLimit(), DEFAULT_VISITS, MAX_VISITS)
                            );
                            retrievalAttempts.add(buildAttempt(action, recentVisits.size()));
                        }
                    }
                    case VISIT_DETAIL -> {
                        String emrCode = clean(action.getEmrCode(), 64);
                        if (StringUtils.hasText(emrCode)) {
                            var detail = doctorAiContextService.getVisitDetail(patientCode, emrCode);
                            detail.ifPresent(visitDetails::add);
                            retrievalAttempts.add(buildAttempt(action, detail.isPresent() ? 1 : 0));
                        } else {
                            List<DoctorAiVisitSummary> targets;
                            if (action.getOffset() != null || action.getSortAsc() != null) {
                                targets = doctorAiContextService.getVisitsByPosition(
                                        patientCode,
                                        1,
                                        action.getOffset() != null ? action.getOffset() : 0,
                                        action.getSortAsc() != null ? action.getSortAsc() : false
                                );
                            } else {
                                targets = doctorAiContextService.getRecentVisits(patientCode, 1);
                            }
                            int detailCount = 0;
                            for (DoctorAiVisitSummary summary : targets) {
                                if (StringUtils.hasText(summary.getEmrCode())) {
                                    var detail = doctorAiContextService.getVisitDetail(patientCode, summary.getEmrCode());
                                    detail.ifPresent(visitDetails::add);
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

                        // Resolve emrCode từ position nếu cần
                        if (!StringUtils.hasText(emrCode) && (action.getOffset() != null || action.getSortAsc() != null)) {
                            List<DoctorAiVisitSummary> targets = doctorAiContextService.getVisitsByPosition(
                                    patientCode,
                                    1,
                                    action.getOffset() != null ? action.getOffset() : 0,
                                    action.getSortAsc() != null ? action.getSortAsc() : false
                            );
                            if (!targets.isEmpty() && StringUtils.hasText(targets.get(0).getEmrCode())) {
                                emrCode = targets.get(0).getEmrCode();
                            }
                        }

                        prescriptions = doctorAiContextService.getPrescriptions(
                                patientCode,
                                emrCode,
                                limit(action.getLimit(), DEFAULT_PRESCRIPTIONS, MAX_PRESCRIPTIONS)
                        );
                        retrievalAttempts.add(buildAttempt(action, prescriptions.size()));
                    }
                    case APPOINTMENT_HISTORY -> {
                        if (doctorId != null) {
                            appHistory = doctorAiContextService.getAppointmentHistory(
                                    doctorId,
                                    patientCode,
                                    limit(action.getLimit(), DEFAULT_APPOINTMENTS, MAX_APPOINTMENTS)
                            );
                            retrievalAttempts.add(buildAttempt(action, appHistory.size()));
                        } else {
                            retrievalAttempts.add(AiContextRetrievalAttempt.builder()
                                    .actionType(action.getType().name())
                                    .targetText(action.getTargetText())
                                    .status(RetrievalStatus.SKIPPED_MISSING_INPUT)
                                    .resultCount(0)
                                    .note("Không có doctorId")
                                    .build());
                        }
                    }
                    default -> {
                    }
                }
            }
        }

        return DoctorAiContext.builder()
                .patientProfile(profile)
                .currentAppointment(currentApp)
                .appointmentHistory(appHistory)
                .recentVisits(recentVisits)
                .visitDetails(visitDetails)
                .prescriptions(prescriptions)
                .retrievalAttempts(retrievalAttempts)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorAiContext buildDefaultContext(DoctorAiAuthorizedTarget target) {
        if (target == null || target.getPatient() == null) {
            return DoctorAiContext.builder().build();
        }
        String patientCode = target.getPatient().getPatientCode();
        Integer doctorId = target.getDoctor() != null ? target.getDoctor().getId() : null;

        var profile = doctorAiContextService.getPatientProfile(target.getPatient());
        var currentApp = target.getAppointment() != null 
                ? doctorAiContextService.getAppointmentSummary(target.getAppointment()) 
                : null;

        List<DoctorAiVisitSummary> recentVisits = doctorAiContextService.getRecentVisits(patientCode, DEFAULT_VISITS);
        List<DoctorAiPrescriptionItem> prescriptions = doctorAiContextService.getPrescriptions(patientCode, null, DEFAULT_PRESCRIPTIONS);
        
        List<DoctorAiAppointmentSummary> appHistory = List.of();
        if (doctorId != null) {
            appHistory = doctorAiContextService.getAppointmentHistory(doctorId, patientCode, DEFAULT_APPOINTMENTS);
        }

        return DoctorAiContext.builder()
                .patientProfile(profile)
                .currentAppointment(currentApp)
                .appointmentHistory(appHistory)
                .recentVisits(recentVisits)
                .prescriptions(prescriptions)
                .build();
    }

    private AiContextRetrievalAttempt buildAttempt(DoctorAiContextAction action, int resultCount) {
        RetrievalStatus status = resultCount > 0 ? RetrievalStatus.FOUND : RetrievalStatus.NOT_FOUND;
        return buildAttempt(action, resultCount, status, null);
    }

    private AiContextRetrievalAttempt buildAttempt(DoctorAiContextAction action, int resultCount,
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

    private int limit(Integer val, int defVal, int maxVal) {
        if (val == null || val <= 0) {
            return defVal;
        }
        return Math.min(val, maxVal);
    }

    private String clean(String text, int limit) {
        if (!StringUtils.hasText(text)) {
            return null;
        }
        String trimmed = text.trim();
        return trimmed.length() <= limit ? trimmed : trimmed.substring(0, limit);
    }
}
