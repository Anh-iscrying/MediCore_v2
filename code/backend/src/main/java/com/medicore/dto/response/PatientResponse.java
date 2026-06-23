package com.medicore.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientResponse {
    private Integer id;
    private String name;
    private String dateOfBirth; // yyyy-MM-dd
    private String gender; // "M" hoặc "F"
    private String phone;
    private String email;
    private String address;
    private String insuranceNumber;
    private String status; // waiting, in-examination, completed, no-show
    private String patientCode;
    private LocalDateTime createdAt;
}
