package com.medicore.service;

import com.medicore.dto.request.PatientRequest;
import com.medicore.dto.response.PatientResponse;

import java.util.List;

public interface PatientService {
    List<PatientResponse> getAllPatients();
    PatientResponse getCurrentPatient(String email);
    PatientResponse getPatientById(Integer id);
    PatientResponse getPatientByCode(String code);
    PatientResponse createPatient(PatientRequest request);
    PatientResponse updatePatient(Integer id, PatientRequest request);
    void deletePatient(Integer id);
}
