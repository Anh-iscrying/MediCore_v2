package com.medicore.service.ai;

import com.medicore.config.properties.AiProperties;
import com.medicore.dto.ai.*;
import com.medicore.dto.request.AiChatMessageRequest;
import com.medicore.dto.request.DoctorAiChatRequest;
import com.medicore.dto.response.AiChatResponse;
import com.medicore.entity.ai.DoctorAiConsultationLog;
import com.medicore.entity.clinical.Appointment;
import com.medicore.entity.user.Doctor;
import com.medicore.entity.user.Patient;
import com.medicore.repository.ai.DoctorAiConsultationLogRepository;
import com.medicore.service.ai.AiGatewayClient;
import com.medicore.service.ai.DoctorAiAccessService;
import com.medicore.service.ai.DoctorAiContextExecutor;
import com.medicore.service.ai.DoctorAiRoutePlanner;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class DoctorAiChatServiceImplTest {

    private final DoctorAiAccessService doctorAiAccessService = mock(DoctorAiAccessService.class);
    private final DoctorAiRoutePlanner doctorAiRoutePlanner = mock(DoctorAiRoutePlanner.class);
    private final DoctorAiContextExecutor doctorAiContextExecutor = mock(DoctorAiContextExecutor.class);
    private final AiGatewayClient aiGatewayClient = mock(AiGatewayClient.class);
    private final DoctorAiConsultationLogRepository logRepository = mock(DoctorAiConsultationLogRepository.class);

    private final AiProperties aiProperties = createProperties();
    private final DoctorAiChatServiceImpl chatService = new DoctorAiChatServiceImpl(
            doctorAiAccessService, doctorAiRoutePlanner, doctorAiContextExecutor,
            aiGatewayClient, logRepository, aiProperties
    );

    private static AiProperties createProperties() {
        AiProperties properties = new AiProperties();
        properties.setMaxInputChars(2000);
        properties.setMaxHistoryMessages(5);
        properties.setRoutePlannerEnabled(true);
        properties.setContextRetryEnabled(true);
        properties.setContextRetryMaxAttempts(1);
        return properties;
    }

    @Test
    void chatExecutesCorrectFlowAndSavesLogs() {
        String email = "doctor@medicore.com";
        DoctorAiChatRequest request = new DoctorAiChatRequest();
        request.setMessage("Tóm tắt tình hình");

        Patient patient = new Patient();
        patient.setPatientCode("PAT001");
        Doctor doctor = new Doctor();
        doctor.setId(1);
        Appointment appointment = new Appointment();
        appointment.setDoctor(doctor);
        appointment.setPatient(patient);

        DoctorAiAuthorizedTarget target = DoctorAiAuthorizedTarget.builder()
                .doctor(doctor)
                .patient(patient)
                .appointment(appointment)
                .build();

        DoctorAiRoutePlan plan = DoctorAiRoutePlan.builder()
                .actions(List.of(
                        DoctorAiContextAction.builder().type(DoctorAiContextActionType.RECENT_VISITS).limit(3).build()
                ))
                .build();

        DoctorAiContext context = DoctorAiContext.builder()
                .recentVisits(List.of(DoctorAiVisitSummary.builder().emrCode("EMR001").build()))
                .build();

        when(doctorAiAccessService.resolveTarget(email, request)).thenReturn(target);
        when(doctorAiRoutePlanner.plan(eq("Tóm tắt tình hình"), anyList())).thenReturn(plan);
        when(doctorAiContextExecutor.execute(target, plan)).thenReturn(context);
        when(aiGatewayClient.completeChat(anyList())).thenReturn("AI reply message");
        when(logRepository.save(any(DoctorAiConsultationLog.class))).thenAnswer(inv -> {
            DoctorAiConsultationLog log = inv.getArgument(0);
            log.setId(123);
            return log;
        });

        AiChatResponse response = chatService.chat(email, request);

        assertThat(response.getReply()).isEqualTo("AI reply message");
        assertThat(response.getConsultationLogId()).isEqualTo(123);

        verify(doctorAiAccessService).resolveTarget(email, request);
        verify(doctorAiRoutePlanner).plan(eq("Tóm tắt tình hình"), anyList());
        verify(doctorAiContextExecutor).execute(target, plan);

        ArgumentCaptor<List<Map<String, Object>>> captor = ArgumentCaptor.forClass(List.class);
        verify(aiGatewayClient).completeChat(captor.capture());
        List<Map<String, Object>> messages = captor.getValue();
        assertThat(messages).hasSize(2); // 1 system prompt kết hợp + 1 user message
        assertThat(messages.get(0).get("role")).isEqualTo("system");
        assertThat(messages.get(1).get("role")).isEqualTo("user");

        verify(logRepository).save(any(DoctorAiConsultationLog.class));
    }

    @Test
    void plannerRetryTriggersWhenBroadContextIsEmpty() {
        String email = "doctor@medicore.com";
        DoctorAiChatRequest request = new DoctorAiChatRequest();
        request.setMessage("Tóm tắt tình hình");

        Patient patient = new Patient();
        patient.setPatientCode("PAT001");
        Doctor doctor = new Doctor();
        doctor.setId(1);

        DoctorAiAuthorizedTarget target = DoctorAiAuthorizedTarget.builder()
                .doctor(doctor)
                .patient(patient)
                .build();

        DoctorAiRoutePlan initialPlan = DoctorAiRoutePlan.builder()
                .actions(List.of(
                        DoctorAiContextAction.builder()
                                .type(DoctorAiContextActionType.RECENT_VISITS)
                                .limit(3)
                                .build()
                ))
                .build();

        // Trả về context rỗng với attempt audit
        DoctorAiContext emptyContext = DoctorAiContext.builder()
                .retrievalAttempts(List.of(
                        AiContextRetrievalAttempt.builder()
                                .actionType("RECENT_VISITS")
                                .status(RetrievalStatus.NOT_FOUND)
                                .resultCount(0)
                                .build()
                ))
                .build();

        DoctorAiRoutePlan retryPlan = DoctorAiRoutePlan.builder()
                .actions(List.of(
                        DoctorAiContextAction.builder()
                                .type(DoctorAiContextActionType.APPOINTMENT_HISTORY)
                                .limit(5)
                                .build()
                ))
                .build();

        DoctorAiContext retryContext = DoctorAiContext.builder()
                .appointmentHistory(List.of(DoctorAiAppointmentSummary.builder().doctorName("Bác sĩ A").build()))
                .retrievalAttempts(List.of(
                        AiContextRetrievalAttempt.builder()
                                .actionType("APPOINTMENT_HISTORY")
                                .status(RetrievalStatus.FOUND)
                                .resultCount(1)
                                .build()
                ))
                .build();

        when(doctorAiAccessService.resolveTarget(email, request)).thenReturn(target);
        when(doctorAiRoutePlanner.plan(eq("Tóm tắt tình hình"), anyList())).thenReturn(initialPlan);
        when(doctorAiContextExecutor.execute(target, initialPlan)).thenReturn(emptyContext);

        // Kì vọng planner được gọi lại với tin nhắn có đính kèm lỗi hệ thống
        String expectedRetryPrompt = "Tóm tắt tình hình\n\n[HỆ THỐNG] Kết quả truy vấn lần 1: RECENT_VISITS=NOT_FOUND(0 rows). Hãy đưa alternative action hoặc clarificationQuestion.";
        when(doctorAiRoutePlanner.plan(eq(expectedRetryPrompt), anyList())).thenReturn(retryPlan);
        when(doctorAiContextExecutor.execute(target, retryPlan)).thenReturn(retryContext);

        when(aiGatewayClient.completeChat(anyList())).thenReturn("AI reply message after retry");
        when(logRepository.save(any(DoctorAiConsultationLog.class))).thenAnswer(inv -> {
            DoctorAiConsultationLog log = inv.getArgument(0);
            log.setId(123);
            return log;
        });

        AiChatResponse response = chatService.chat(email, request);

        assertThat(response.getReply()).isEqualTo("AI reply message after retry");
        // Verify planner đã gọi lần 2
        verify(doctorAiRoutePlanner).plan(eq(expectedRetryPrompt), anyList());
        // Verify executor đã thực thi retryPlan
        verify(doctorAiContextExecutor).execute(target, retryPlan);
    }
}
