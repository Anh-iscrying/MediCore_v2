package com.medicore.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponse {
    private Integer id;
    private String patientName;
    private String patientId;
    private Integer patientDbId;
    private String patientDateOfBirth;
    private String patientGender;
    private String patientPhone;
    private String patientAddress;
    private Integer doctorId;
    private String doctorName;
    private Integer specialtyId;
    private String appointmentDate;
    private String timeSlot;
    private String symptomsInitial;
    private String status;
    private String icdCode;
    private String mainDiagnosis;
}
