package com.medicore.service.impl;

import com.medicore.config.AiProperties;
import com.medicore.dto.ai.DoctorAiAuthorizedTarget;
import com.medicore.dto.ai.DoctorAiContext;
import com.medicore.dto.ai.DoctorAiRoutePlan;
import com.medicore.dto.request.AiChatMessageRequest;
import com.medicore.dto.request.DoctorAiChatRequest;
import com.medicore.dto.response.AiChatResponse;
import com.medicore.entity.ai.DoctorAiConsultationLog;
import com.medicore.entity.clinical.Appointment;
import com.medicore.entity.user.Doctor;
import com.medicore.entity.user.Patient;
import com.medicore.repository.DoctorAiConsultationLogRepository;
import com.medicore.service.AiGatewayClient;
import com.medicore.service.DoctorAiAccessService;
import com.medicore.service.DoctorAiContextExecutor;
import com.medicore.service.DoctorAiRoutePlanner;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

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
                .actions(List.of())
                .build();

        DoctorAiContext context = DoctorAiContext.builder().build();

        when(doctorAiAccessService.resolveTarget(email, request)).thenReturn(target);
        when(doctorAiRoutePlanner.plan(anyString(), anyList())).thenReturn(plan);
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
        verify(doctorAiRoutePlanner).plan("Tóm tắt tình hình", List.of());
        verify(doctorAiContextExecutor).execute(target, plan);

        ArgumentCaptor<List<Map<String, Object>>> captor = ArgumentCaptor.forClass(List.class);
        verify(aiGatewayClient).completeChat(captor.capture());
        List<Map<String, Object>> messages = captor.getValue();
        assertThat(messages).hasSize(2); // system prompt + user message
        assertThat(messages.get(0).get("role")).isEqualTo("system");
        assertThat(messages.get(1).get("role")).isEqualTo("user");

        verify(logRepository).save(any(DoctorAiConsultationLog.class));
    }
}
