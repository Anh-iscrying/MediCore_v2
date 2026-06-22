package com.medicore.service;

import com.medicore.dto.request.AppointmentRequest;
import com.medicore.dto.response.AppointmentResponse;

import java.util.List;

public interface AppointmentService {
    List<AppointmentResponse> getAllAppointments();
    List<AppointmentResponse> getAppointmentsByPatient(String patientIdOrCode);
    List<AppointmentResponse> getAppointmentsByDoctor(Integer doctorId);
    AppointmentResponse getAppointmentById(Integer id);
    AppointmentResponse createAppointment(AppointmentRequest request);
    AppointmentResponse updateAppointment(Integer id, AppointmentRequest request);
    void deleteAppointment(Integer id);
}
