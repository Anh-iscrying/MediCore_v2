package com.medicore.service;

import com.medicore.dto.request.DoctorProfileRequest;
import com.medicore.dto.request.DoctorRequest;
import com.medicore.dto.response.DoctorResponse;

import java.util.List;

public interface DoctorService {
    List<DoctorResponse> getAllDoctors();
    List<DoctorResponse> getDoctorsBySpecialty(Integer specialtyId);
    DoctorResponse getDoctorById(Integer id);
    DoctorResponse getDoctorByEmail(String email);
    DoctorResponse createDoctor(DoctorRequest request);
    DoctorResponse updateDoctor(Integer id, DoctorRequest request);
    DoctorResponse updateDoctorByEmail(String email, DoctorProfileRequest request);
    void deleteDoctor(Integer id);
}
