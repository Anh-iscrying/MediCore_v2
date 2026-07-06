package com.medicore.service.impl;

import com.medicore.dto.ai.PatientAiContext;
import com.medicore.dto.ai.PatientAiContextAction;
import com.medicore.dto.ai.PatientAiContextActionType;
import com.medicore.dto.ai.PatientAiRoutePlan;
import com.medicore.dto.ai.PatientAiMedicineInfo;
import com.medicore.dto.ai.PatientAiPrescriptionItem;
import com.medicore.dto.ai.PatientAiRecordSummary;
import com.medicore.service.PatientAiContextService;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PatientAiContextExecutorImplTest {

    private final PatientAiContextService patientAiContextService = mock(PatientAiContextService.class);
    private final PatientAiContextExecutorImpl executor = new PatientAiContextExecutorImpl(patientAiContextService);

    @Test
    void executeUsesAuthenticatedPatientCodeAndClampsLimits() {
        String patientCode = "PAT-AUTH";
        PatientAiRecordSummary record = PatientAiRecordSummary.builder().emrCode("EMR001").build();
        PatientAiPrescriptionItem prescription = PatientAiPrescriptionItem.builder().emrCode("EMR001").build();
        PatientAiMedicineInfo medicine = PatientAiMedicineInfo.builder().medicineName("Paracetamol").build();
        when(patientAiContextService.getRecentRecords(patientCode, 5)).thenReturn(List.of(record));
        when(patientAiContextService.getPrescriptions(patientCode, "EMR001", 20)).thenReturn(List.of(prescription));
        when(patientAiContextService.searchMedicines("paracetamol", 5)).thenReturn(List.of(medicine));

        PatientAiRoutePlan plan = PatientAiRoutePlan.builder()
                .actions(List.of(
                        PatientAiContextAction.builder().type(PatientAiContextActionType.RECENT_RECORDS).limit(99).build(),
                        PatientAiContextAction.builder().type(PatientAiContextActionType.PRESCRIPTIONS).emrCode("EMR001").limit(200).build(),
                        PatientAiContextAction.builder().type(PatientAiContextActionType.MEDICINE_SEARCH).keyword("paracetamol").limit(100).build()
                ))
                .build();

        PatientAiContext context = executor.execute(patientCode, plan);

        assertThat(context.getRecentRecords()).containsExactly(record);
        assertThat(context.getPrescriptions()).containsExactly(prescription);
        assertThat(context.getMedicines()).containsExactly(medicine);
        verify(patientAiContextService).getRecentRecords(patientCode, 5);
        verify(patientAiContextService).getPrescriptions(patientCode, "EMR001", 20);
        verify(patientAiContextService).searchMedicines("paracetamol", 5);
    }

    @Test
    void executeSkipsActionsMissingRequiredInput() {
        PatientAiRoutePlan plan = PatientAiRoutePlan.builder()
                .actions(List.of(
                        PatientAiContextAction.builder().type(PatientAiContextActionType.MEDICINE_SEARCH).keyword("a").build()
                ))
                .build();

        PatientAiContext context = executor.execute("PAT-AUTH", plan);

        assertThat(context.getMedicines()).isEmpty();
        verify(patientAiContextService, never()).searchMedicines(org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.anyInt());
    }

    @Test
    void executeHandlesPrescriptionsAndRecordDetailWithoutEmrCode() {
        String patientCode = "PAT-AUTH";
        PatientAiRecordSummary record = PatientAiRecordSummary.builder().emrCode("EMR-LATEST").build();
        when(patientAiContextService.getRecentRecords(patientCode, 1)).thenReturn(List.of(record));

        PatientAiRoutePlan plan = PatientAiRoutePlan.builder()
                .actions(List.of(
                        PatientAiContextAction.builder().type(PatientAiContextActionType.RECORD_DETAIL).build(),
                        PatientAiContextAction.builder().type(PatientAiContextActionType.PRESCRIPTIONS).build()
                ))
                .build();

        executor.execute(patientCode, plan);

        verify(patientAiContextService).getRecentRecords(patientCode, 1);
        verify(patientAiContextService).getRecordDetail(patientCode, "EMR-LATEST");
        verify(patientAiContextService).getPrescriptions(patientCode, null, 20);
    }
}
