package com.medicore.service;

import com.medicore.dto.request.AppointmentRequest;
import com.medicore.dto.response.AppointmentResponse;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentService {
    List<AppointmentResponse> getAllAppointments();
    List<AppointmentResponse> getCurrentPatientAppointments(String email);
    List<AppointmentResponse> getAppointmentsByPatient(String patientIdOrCode);
    List<AppointmentResponse> getAppointmentsByDoctor(Integer doctorId);
    List<AppointmentResponse> getWaitingAppointmentsByDoctor(Integer doctorId, LocalDate appointmentDate);
    AppointmentResponse getAppointmentById(Integer id);
    AppointmentResponse createCurrentPatientAppointment(AppointmentRequest request, String email);
    AppointmentResponse createAppointment(AppointmentRequest request);
    AppointmentResponse updateAppointment(Integer id, AppointmentRequest request);
    AppointmentResponse cancelCurrentPatientAppointment(Integer id, String email);
    void deleteAppointment(Integer id);
}
