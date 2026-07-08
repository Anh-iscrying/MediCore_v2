package com.medicore.service.ai;

import com.medicore.config.properties.AiProperties;
import com.medicore.dto.ai.*;
import com.medicore.dto.request.AiChatMessageRequest;
import com.medicore.dto.request.AiChatRequest;
import com.medicore.dto.response.AiChatResponse;
import com.medicore.entity.ai.AiConsultationLog;
import com.medicore.entity.user.AuthCredentials;
import com.medicore.entity.user.Patient;
import com.medicore.repository.ai.AiConsultationLogRepository;
import com.medicore.repository.auth.AuthCredentialsRepository;
import com.medicore.service.ai.AiGatewayClient;
import com.medicore.service.ai.PatientAiContextExecutor;
import com.medicore.service.ai.PatientAiContextService;
import com.medicore.service.ai.PatientAiRoutePlanner;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class AiChatServiceImplTest {

    private final AuthCredentialsRepository authCredentialsRepository = mock(AuthCredentialsRepository.class);
    private final AiConsultationLogRepository aiConsultationLogRepository = mock(AiConsultationLogRepository.class);
    private final AiGatewayClient aiGatewayClient = mock(AiGatewayClient.class);
    private final PatientAiContextService patientAiContextService = mock(PatientAiContextService.class);
    private final PatientAiRoutePlanner patientAiRoutePlanner = mock(PatientAiRoutePlanner.class);
    private final PatientAiContextExecutor patientAiContextExecutor = mock(PatientAiContextExecutor.class);

    private final AiProperties aiProperties = createProperties();
    private final AiChatServiceImpl chatService = new AiChatServiceImpl(
            authCredentialsRepository,
            aiConsultationLogRepository,
            aiGatewayClient,
            aiProperties,
            patientAiContextService,
            patientAiRoutePlanner,
            patientAiContextExecutor
    );

    private static AiProperties createProperties() {
        AiProperties properties = new AiProperties();
        properties.setMaxInputChars(2000);
        properties.setMaxHistoryMessages(5);
        properties.setRoutePlannerEnabled(true);
        properties.setContextRetryEnabled(true);
        properties.setContextRetryMaxAttempts(1);
        properties.setKeywordFallbackEnabled(false);
        return properties;
    }

    @Test
    void chatExecutesCorrectFlowAndSavesLogsForPatient() {
        String email = "patient@medicore.com";
        AiChatRequest request = new AiChatRequest();
        request.setMessage("Xem hồ sơ");

        Patient patient = new Patient();
        patient.setPatientCode("PAT001");
        AuthCredentials credentials = new AuthCredentials();
        credentials.setPatient(patient);

        PatientAiRoutePlan plan = PatientAiRoutePlan.builder()
                .actions(List.of(
                        PatientAiContextAction.builder().type(PatientAiContextActionType.RECENT_RECORDS).limit(3).build()
                ))
                .build();

        PatientAiContext context = PatientAiContext.builder()
                .recentRecords(List.of(PatientAiRecordSummary.builder().emrCode("EMR001").build()))
                .build();

        when(authCredentialsRepository.findByEmail(email)).thenReturn(Optional.of(credentials));
        when(patientAiRoutePlanner.plan(eq("Xem hồ sơ"), anyList())).thenReturn(plan);
        when(patientAiContextExecutor.execute(patient.getPatientCode(), plan)).thenReturn(context);
        when(aiGatewayClient.completeChat(anyList())).thenReturn("AI patient reply");
        when(aiConsultationLogRepository.save(any(AiConsultationLog.class))).thenAnswer(inv -> {
            AiConsultationLog log = inv.getArgument(0);
            log.setId(123);
            return log;
        });

        AiChatResponse response = chatService.chat(email, request);

        assertThat(response.getReply()).isEqualTo("AI patient reply");
        assertThat(response.getConsultationLogId()).isEqualTo(123);

        verify(authCredentialsRepository).findByEmail(email);
        verify(patientAiRoutePlanner).plan(eq("Xem hồ sơ"), anyList());
        verify(patientAiContextExecutor).execute(patient.getPatientCode(), plan);

        ArgumentCaptor<List<Map<String, Object>>> captor = ArgumentCaptor.forClass(List.class);
        verify(aiGatewayClient).completeChat(captor.capture());
        List<Map<String, Object>> messages = captor.getValue();
        assertThat(messages).hasSize(2); // 1 system prompt kết hợp + 1 user message
        assertThat(messages.get(0).get("role")).isEqualTo("system");
        assertThat(messages.get(1).get("role")).isEqualTo("user");

        verify(aiConsultationLogRepository).save(any(AiConsultationLog.class));
    }

    @Test
    void plannerRetryTriggersWhenBroadPatientContextIsEmpty() {
        String email = "patient@medicore.com";
        AiChatRequest request = new AiChatRequest();
        request.setMessage("Xem hồ sơ");

        Patient patient = new Patient();
        patient.setPatientCode("PAT001");
        AuthCredentials credentials = new AuthCredentials();
        credentials.setPatient(patient);

        PatientAiRoutePlan initialPlan = PatientAiRoutePlan.builder()
                .actions(List.of(
                        PatientAiContextAction.builder().type(PatientAiContextActionType.RECENT_RECORDS).limit(3).build()
                ))
                .build();

        PatientAiContext emptyContext = PatientAiContext.builder()
                .retrievalAttempts(List.of(
                        AiContextRetrievalAttempt.builder()
                                .actionType("RECENT_RECORDS")
                                .status(RetrievalStatus.NOT_FOUND)
                                .resultCount(0)
                                .build()
                ))
                .build();

        PatientAiRoutePlan retryPlan = PatientAiRoutePlan.builder()
                .actions(List.of(
                        PatientAiContextAction.builder().type(PatientAiContextActionType.DOCTORS_SEEN).limit(5).build()
                ))
                .build();

        PatientAiContext retryContext = PatientAiContext.builder()
                .doctorsSeen(List.of(PatientAiDoctorInfo.builder().doctorName("Bác sĩ A").build()))
                .retrievalAttempts(List.of(
                        AiContextRetrievalAttempt.builder()
                                .actionType("DOCTORS_SEEN")
                                .status(RetrievalStatus.FOUND)
                                .resultCount(1)
                                .build()
                ))
                .build();

        when(authCredentialsRepository.findByEmail(email)).thenReturn(Optional.of(credentials));
        when(patientAiRoutePlanner.plan(eq("Xem hồ sơ"), anyList())).thenReturn(initialPlan);
        when(patientAiContextExecutor.execute(patient.getPatientCode(), initialPlan)).thenReturn(emptyContext);

        String expectedRetryPrompt = "Xem hồ sơ\n\n[HỆ THỐNG] Kết quả truy vấn lần 1: RECENT_RECORDS=NOT_FOUND(0 rows). Hãy đưa alternative action hoặc clarificationQuestion.";
        when(patientAiRoutePlanner.plan(eq(expectedRetryPrompt), anyList())).thenReturn(retryPlan);
        when(patientAiContextExecutor.execute(patient.getPatientCode(), retryPlan)).thenReturn(retryContext);

        when(aiGatewayClient.completeChat(anyList())).thenReturn("AI reply after retry");
        when(aiConsultationLogRepository.save(any(AiConsultationLog.class))).thenAnswer(inv -> {
            AiConsultationLog log = inv.getArgument(0);
            log.setId(123);
            return log;
        });

        AiChatResponse response = chatService.chat(email, request);

        assertThat(response.getReply()).isEqualTo("AI reply after retry");
        verify(patientAiRoutePlanner).plan(eq(expectedRetryPrompt), anyList());
        verify(patientAiContextExecutor).execute(patient.getPatientCode(), retryPlan);
    }
}
