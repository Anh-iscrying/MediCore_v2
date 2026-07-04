package com.medicore.service;

import com.medicore.dto.request.MedicalRecordRequest;
import com.medicore.dto.response.MedicalRecordResponse;

import java.util.List;

public interface MedicalRecordService {
    MedicalRecordResponse createMedicalRecord(MedicalRecordRequest request);

    MedicalRecordResponse getRecordByAppointment(Integer appointmentId, String email);

    List<MedicalRecordResponse> getCurrentPatientRecords(String email);

    void uploadPdf(Integer appointmentId, byte[] pdfBytes);
}
